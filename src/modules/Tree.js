/*****************************************

            PRIVATE MODULE VARIABLES

*****************************************/

var Root = require('./Root');
var Factory = require('./Factory');
var Child = require('./Child');
var React = require('react');
var Tree = require('./ReactTree.jsx');
var data = []; /* Our node data */
var comp = null; /* Main react component */
var io = require('socket.io-client');
var socket = null;

/*****************************************

           UI EVENTS

*****************************************/

function bindEvents() {
    /* Since events are dynamically generated, use delegation */
    $(document).on('click', '.ctrl', function(e) {
        var target = $(e.target);
        if( target.is('button.delete, button.delete > i') )
        {
            //console.log('Delete');
            deleteNode(target.closest('button.delete').attr("data-id"), true);
        }
        else if( target.is('button.edit, button.edit > i')  )
        {
            //console.log('Edit');
            editNode(target.closest('div.front'), false);
        }
        else if( target.is('button.add, button.add > i')  )
        {
            //console.log('Add');
            addFactory(target.closest('div.front'));
        }
        else if( target.is('button.generate, button.generate > i')  )
        {
            //console.log('Generate');
            var id = target.closest('button').attr('data-id');
            var menuWidth = $("#genMenu").css('width');
            var left = e.pageX - parseInt(menuWidth);
            showMenu(e.pageY, left, id);
        }
        else if( target.is('button.save') )
        {
            //console.log('Save data');
            makeEdits(target.closest('div.front'), true);
        }
        else if( target.is('button.cancel') )
        {
            makeEdits(target.closest('div.front'), false);
        }

        return false;
    });

    $(document).on('keydown', 'span[contenteditable="true"], div#genMenu input' ,function(e){

        /* No line breaks */
        if(e.which == 13) {
            //console.log("Key pressed");
            return false;
        }

        /* We only want factory bound numbers to be entered, not characters */
        //if( $(e.target).is('span.input.bound', 'div#genMenu input') ) {
        var unicode= e.keyCode? e.keyCode : e.charCode;
        //console.log(unicode);

        /* Numbers, backspace, and delete are OK */
        if ( (unicode >= 48 && unicode <= 57)
            || unicode == 8
            || unicode == 46
            || unicode == 37
            || unicode ==39) {
            return true;
        } else {
            return false;
        }
        //}
    });

    $(document).on('contextmenu', function(e){
        e.stopPropagation();

        if( $(e.target).is('div.factory.front, div.factory.front *') ) {
            //console.log("Context menu for factory");
            var factory = $(e.target).closest('div.factory.front').attr('data-id');
            /* Trick: position of menu is translated (-5, -5) from cursor so that
               the mouseleave event properly triggers (cursor stars in box) */
            showMenu(e.pageY, e.pageX, factory);
            return false;
        }
    });

    function showMenu(top, left, id) {
        $("#genMenu").attr('data-id', id);
        $('#genMenu').css({
            "top": top - 5,
            "left": left - 5,
        }).slideDown(100);
    }

    $("#genMenu").on("mouseleave", function(e){
        /* Reset factory id */
        $(this).attr('data-id', '');
        /* Hide */
        $(this).hide();
    });

    $("button.genButton.generate").on("click", function(e) {
        /* Validate input */
        var input = $("input.genInput").val();
        if(input >= 1 && input <= 15) {
            /* Hide error if present */
            $('span.genError').hide();

            /* Generate nodes */
            var id = $('#genMenu').attr('data-id');
            generateNodes(id, input);
            ("input.genInput").val('');
            $('#genMenu').hide();

        } else {
            /* Show error */
            $('span.genError').css('display', 'block');
        }
    });

    $("button.genButton.cancel").on("click", function(e) {
        $("input.genInput").val('');
        $('#genMenu').hide();
    });

    /* UI Toggle Effects */
    $(document).on('click', 'div.root.front', function(e) {
        //console.log('Root');
        if( $(this).hasClass('editing') ) return;
        toggleChildren($(this).parent(), 'div.factoryList');
        toggleFolder($(this).children('i'));
    });

    $(document).on('click', 'div.factory.front', function(e) {
        //console.log('Factory');
        if( $(this).hasClass('editing') ) return;
        toggleChildren($(this).parent(), 'div.childList');
        toggleFolder($(this).children('i'));
    });

    $(document).on('click', 'button#addRoot', function(e) {
        addRoot();
    });
}


/*****************************************

           DATA OPERATIONS

*****************************************/


/* Recursively fetch node from our data array using an inner closure */
function getNode(id, theData) {

    var index = null;
    var node = null;
    var context = null;

    (function recurse(id, d) {
        /* Recursively search for node in tree */
        for(var i = 0; i < d.length; i++){
            if(d[i].id == id){
                index = i;
                node = d[i];
                context = d;
                break;
            } else if(d[i].children && d[i].children.length > 0) {
                recurse(id, d[i].children);
            }
        }

        return;
    }(id, theData));

    return [node, index, context];
}

/*Push a new root node onto our top-level data array */
function addRoot(r) {
    if(!r) {
        var root = new Root("New root");
        //console.log("New root", root.id);
         /* Save root to our data + DB */
        saveNode(root);
        data.push(root);
        comp.setState( {data: data} );
    } else {
        /* Construct root from data */
        var tmp = JSON.parse(r["node"]);
        //console.log("Tmp", tmp);
        var root = new Root(tmp.name, tmp.id);
        data.push(root);
        comp.setState( {data:data} );
    }
}

/* Add factory for root node */
function addFactory(root, f) {

    /* Get root node from array */
    var id = null;
    var factory = null;
    var newFactory = null;

    if(root) {
        id = root.attr("data-id");
    } else {
        //console.log("Root was received instead");
        factory = JSON.parse(f["node"]);
        id = factory.parent;
    }

    var result = getNode(id, data);

    //console.log("The root", result);

    if( !f ) {
        /* Make new factory node */
        newFactory = new Factory(result[0].id, 0, 100);
        /* Save factory to DB, and update the parent */
        saveNode(newFactory);
    } else {
        //console.log("The new factory", factory);
        newFactory = new Factory(factory.parent, factory.lower, factory.upper, factory.name, factory.id);
    }

    result[0].addFactory(newFactory);
    //console.log(result[0]);
    comp.setState({data:data});
}

/* Save a new node to the DB */
function saveNode(n) {
    var node = JSON.stringify(n);
    $.ajax({
        type: "PUT",
        url: "tree/",
        data: {
            "node" : node
        },
        success: function(d) {
            /* Emit event */
            if(n.type=="root") {
                socket.emit('addRoot', {node: node});
            }
            else if(n.type=="factory") {
                socket.emit('addFactory', {node: node});
            }
        }
    });
}

/* Initiate 'edit' mode for node */
function editNode(n, isSocketEvent) {
    $(n).find('button.ctrl').toggle();
    $(n).find('button.modify').toggle();
    $(n).addClass('editing');
    $(n).find('span.input').attr('contenteditable', true);
    $(n).children('.ctrl').addClass('editing');
}

/* Handle changes to node */
function makeEdits(n, save, d) {
    var id = $(n).attr('data-id');
    var node = getNode(id, data)[0];
    var nodeElement = $("[data-id=" + id + "]");

    if(d) {
        var tmpNode = d["node"]
        //console.log("tmpNode", tmpNode);
        var node = getNode(tmpNode.id, data)[0];
        //console.log("Da node");
        node.name = tmpNode.name;
        if(node.type == "factory") {
            node.lower = tmpNode.lower;
            node.upper = tmpNode.upper;
        }
    }

    if(save) {
        ////console.log("Da node", nodeElement.html());

        /* Overwrite current name with new one */
        //console.log(nodeElement);
        node.name = nodeElement.find('span.input.name').html();
        //console.log("New name", node.name);

        if(node instanceof Root) {
            //console.log("is root");
            //console.log(node);
            /* Nothing else to do here since we're just changing the name */
        } else if(node instanceof Factory) {
            //console.log("is factory");
            /* Update bounds */
            node.lower = nodeElement.find('span[data-id=' + id + "].lowerBound").html();
            node.upper = nodeElement.find('span[data-id=' + id + "].upperBound").html();
            //console.log("The new bounds:", node.lower, node.upper);
        } else {
            //console.log("Unknown node type");

        }

        /* Save changes to DB */
        saveChanges(node);
    } else {
        /* Revert to original state */
    }

    /* Refresh our view */
    comp.setState({data: data});

    /* Exit 'edit' mode for node */
    $(n).find('button.ctrl').toggle();
    $(n).find('button.modify').toggle();
    $(n).removeClass('editing');
    $(n).find('span.input').attr('contenteditable', false);
    $(n).children('div.ctrl').removeClass('editing');
}

/* Save changes for node */
function saveChanges(n) {
    $.ajax({
        type: "POST",
        url: "tree/" + n.id,
        data: {
            "node" : JSON.stringify(n)
        },
        success: function(d) {
            //console.log(d);
            socket.emit("modify", {node: n});
        }
    });
}

/* Generate nodes for factory */
function generateNodes(f, count, childList) {
    var node = null;

    if(childList != null) {
        /* Data provided (socket event), just generate */
        node = childList.data[0].parent;
        node = getNode(node, data)[0];
        node.generate(childList.length, childList);
        //console.log(node.children);
    } else if(childList == null) {
        node = getNode(f, data)[0];
        /* No data provided (not a socket event), save our
           new data to server */
        node.generate(count, null);
        var children = JSON.stringify(node.children);
        $.ajax({
            type: "PUT",
            url: "/tree/generate/",
            data: {
                id: node.id,
                children: children
            },
            success: function(data) {
                //console.log(data);
                socket.emit("generate", node.children);
            }
        });
    }

    /* Update our React view */
    comp.setState({data:data});
}

function deleteNode(id, local) {

    /* Socket event, just delete and set data */
    if(!local) {
        var nodeId = id;
        //console.log("NodeID", id);
        removeNodeFromData(nodeId);
        return;
    }

    if( confirm('Are you sure you want to delete this node?') ) {
        //console.log('Deleting node', id);

        /* Remove node from data */
        removeNodeFromData(id);

        /* Update DB -> emit deletion event from server */
        $.ajax({
            type: "DELETE",
            url: "tree/" + id,
            data: {
                id: id
            },
            success: function(data) {
                //console.log(data);
                socket.emit("delete", {node: id});
            }
        });
    }
}

function getInitialTreeData() {
    $.ajax({
        type: "GET",
        url: "tree/",
        success: function(data) {
            if(data == null || data == undefined) {
                alert("Error retrieving data");
            } else {
                //console.log("Done");
                //console.log(data);
                generateTreeFromObjects(data);
            }
        }
    });
}

/* This function removes the node from the raw data. It's called directly
   when a deletion socket event is received */
function removeNodeFromData(id) {
    var node = getNode(id, data);
    node[2].splice(node[1], 1);
    comp.setState({data: data});
}

/* Construct our initial view from the currently stored data */
function generateTreeFromObjects(obj) {
    var tmp = [];
    for(var i = 0; i < obj.length; i++) {
        var tmpRoot = obj[i];
        var root = new Root(tmpRoot.name, tmpRoot.node_id);
        tmp.push(root);
        var rootChildren = tmpRoot.children;
        for(var j = 0; j < rootChildren.length; j++) {
            var tmpFactory = rootChildren[j];
            var factory = new Factory(tmpRoot.node_id,
                tmpFactory.lower,
                tmpFactory.upper,
                tmpFactory.name,
                tmpFactory.node_id);

            root.children.push(factory);
            var factoryChildren = tmpFactory.children;
            for(var k = 0; k < factoryChildren.length; k++) {
                var tmpChild = factoryChildren[k];
                var child = new Child(tmpFactory.node_id, parseInt(tmpChild.name), tmpChild.node_id);
                factory.children.push(child);
            }
        }
    }
    //console.log("Done");
    //console.log(tmp);
    data = tmp;
    comp.setState({data: data});
}

/*****************************************

           UI METHODS

*****************************************/


function toggleChildren(elem, selector) {
    $(elem).children(selector).slideToggle(250);
}


function toggleFolder(f) {
    if( $(f).hasClass('fa-folder-open') ) {
        $(f).removeClass('fa-folder-open');
        $(f).addClass('fa-folder');
    } else {
        $(f).removeClass('fa-folder');
        $(f).addClass('fa-folder-open');
    }
}

/*****************************************

           SOCKETS/INITIALIZATION

*****************************************/

function socketSetup() {
    socket = io("http://localhost:3000");

    socket.on("connect", function() {
        //console.log("Socket connection established");

        socket.on("addRoot", function(d) {
            //console.log("Add root", d);
            addRoot(d["root"]);
        });

        socket.on("addFactory", function(d) {
            //console.log("Add factory", d);
            addFactory(null, d["factory"]);
        });

        socket.on("modify", function(d) {
            //console.log("Modify", d);
            makeEdits(null, false, d["node"]);
        });

        socket.on("delete", function(d) {
            //console.log("Delete", d);
            var id = d.node.node;
            deleteNode(id, false);
        });

        socket.on("generate", function(d) {
            //console.log("Generate", d);
            generateNodes(null, null, d);
        });
    });
}


module.exports = function() {
    /* Set up event delegation on tree */
    bindEvents();

    /* TODO Set up our socket events for out data socket.init(data) */
    socketSetup();

    /* Fetch our data and feed it to react - we're live! */
    getInitialTreeData();

    /* Initialize our React-driven tree */
    comp = React.renderComponent(Tree({data: data}), document.getElementById('tree'));
};