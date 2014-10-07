var Root = require('./Root');
var Factory = require('./Factory');
var Child = require('./Child');
var Socket = require('socket.io-client');
var React = require('react');
var Tree = require('./ReactTree.jsx');
var data = []; /* Our node data */
var comp = null; /* Main react component */

/*****************************************
           EVENTS
*****************************************/

function bindEvents() {
    /* Since events are dynamically generated, use delegation */
    $(document).on('click', '.ctrl', function(e) {
        var target = $(e.target);
        if( target.is('button.delete, button.delete > i') )
        {
            console.log('Delete');
            deleteNode(target.closest('button.delete').attr("data-id"), false);
        }
        else if( target.is('button.edit, button.edit > i')  )
        {
            console.log('Edit');
            editNode(target.closest('div.front'), false);
        }
        else if( target.is('button.add, button.add > i')  )
        {
            console.log('Add');
            addFactory(target.closest('div.front'), false);
        }
        else if( target.is('button.generate, button.generate > i')  )
        {
            console.log('Generate');
            var id = target.closest('button').attr('data-id');
            generateNodes(id);
        }
        else if( target.is('button.save') )
        {
            console.log('Save data');
            finishedEditing(target.closest('div.front'), true);
        }
        else if( target.is('button.cancel') )
        {
            finishedEditing(target.closest('div.front'), false);
        }

        return false;
    });

    $(document).on('keydown', 'span[contenteditable="true"]' ,function(e){

        /* No line breaks */
        if(e.which == 13) {
            console.log("Key pressed");
            return false;
        }

        /* We only want factory bound numbers to be entered, not characters */
        if( $(e.target).is('span.input.bound') ) {
            var unicode= e.keyCode? e.keyCode : e.charCode;
            console.log(unicode);

            /* Numbers, backspace, and delete are OK */
            if ( (unicode >= 48 && unicode <= 57) || unicode == 8 || unicode == 46 ) {
                return true;
            } else {
                return false;
            }
        }
    });

    /* UI Toggle Effects */
    $(document).on('click', 'div.root.front', function(e) {
        console.log('Root');
        if( $(this).hasClass('editing') ) return;
        toggleChildren($(this).parent(), 'div.factoryList');
        toggleFolder($(this).children('i'));
    });

    $(document).on('click', 'div.factory.front', function(e) {
        console.log('Factory');
        if( $(this).hasClass('editing') ) return;
        toggleChildren($(this).parent(), 'div.childList');
        toggleFolder($(this).children('i'));
    });

    $(document).on('click', 'button#addRoot', function(e) {
        addRoot("root");
    });
}


/*****************************************
            DATA MANIPULATION
*****************************************/

/* Recursively fetch node from our data array using a Closure-style IIFE*/
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
function addRoot() {
    var root = new Root("New root");

    data.push(root);

    /* Save root to our data + DB */
    saveNode(root);
}

/* Add factory for root node */
function addFactory(root) {
    /* Get root node from array */
    var id = root.attr("data-id");
    var result = getNode(id, data);
    console.log("The root", result);

    /* Make new factory node */
    var f = new Factory(result[0].id, 0, 100);

    /* Call addChild() */
    result[0].addFactory(f);

    comp.setState({data:data});

    /* Save factory to DB, and update the parent */
    saveNode(f);
}

/* Save a new node to the DB */
function saveNode(n) {
    $.ajax({
        type: "PUT",
        url: "tree/",
        data: {
            "node" : JSON.stringify(n)
        },
        success: function(d) {
            comp.setState({data: data});
        }
    });
}

function editNode(n, isSocketEvent) {
    $(n).find('button.ctrl').toggle();
    $(n).find('button.modify').toggle();
    $(n).addClass('editing');
    $(n).find('span.input').attr('contenteditable', true);
    $(n).children('.ctrl').addClass('editing');
}

/* Handle changes to node */
function finishedEditing(n, save) {
    var id = $(n).attr('data-id');
    var node = getNode(id, data)[0];
    var nodeElement = $("[data-id=" + id + "]");

    if(save) {
        //console.log("Da node", nodeElement.html());

        /* Overwrite current name with new one */
        console.log(nodeElement);
        node.name = nodeElement.find('span.input.name').html();
        console.log("New name", node.name);

        if(node instanceof Root) {
            console.log("is root");
            /* Nothing else to do here since we're just changing the name */
        } else if(node instanceof Factory) {
            console.log("is factory");
            /* Update bounds */
            node.lower = nodeElement.find('span[data-id=' + id + "].lowerBound").html();
            node.upper = nodeElement.find('span[data-id=' + id + "].upperBound").html();
            console.log("The new bounds:", node.lower, node.upper);
        } else {
            console.log("Unknown node type");

        }

        /* Save changes to DB */
        saveChanges(node);

        /* Refresh our view */
        comp.setState({data: data});
    } else {
        /* Revert to original state */
    }

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
            console.log(d);
        }
    });
}

function generateNodes(f) {
    /* Call generate() for factory */
    //console.log("Generating nodes for factory", f);
    var node = getNode(f, data)[0];
    node.generate(5);
    comp.setState({data:data});

    /* Save our changes to the server */
}

function deleteNode(id) {
    if( confirm('Are you sure you want to delete this node?') ) {

        console.log('Deleting node', id);

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

            }
        });
    }
}

/* This function removes the node from the raw data. It's called directly
   when a deletion socket event is received */
function removeNodeFromData(id) {
    var node = getNode(id, data);
    node[2].splice(node[1], 1);
    comp.setState({data: data});
}

/*****************************************
            UI BEHAVIOR
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
           MODULE
*****************************************/

module.exports = function() {
    /* Set up event delegation on tree */
    bindEvents();

    /* Seeds some data for React testing */
    data = [new Root("root 1"), new Root("root 2"), new Root("root 3")];
    console.log(data);

    /* TODO Set up our socket events for out data socket.init(data) */

    /* TODO Fetch our data and feed it to react - we're live! */

    /* Initialize our React-driven tree */
    comp = React.renderComponent(Tree({data: data}), document.getElementById('tree'));
};