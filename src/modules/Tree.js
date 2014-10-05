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
    $(document).on('click', '.root.ctrl', function(e) {
        var target = $(e.target);
        if( target.is('button.delete, button.delete > i') )
        {
            console.log('Delete');
            deleteNode(target.parents('div.root.node'), false);
        }
        else if( target.is('button.edit, button.edit > i')  )
        {
            console.log('Edit');
            editNode(target.parents('div.root.front'), false);
        }
        else if( target.is('button.add, button.add > i')  )
        {
            console.log('Add');
            addParent(target.parents('div.root.node'), false);
        }
        else if( target.is('button.save') )
        {
            console.log('Save data');
            finishedEditing(target.parents('div.root.front'), true);
        }
        else if( target.is('button.cancel') )
        {
            finishedEditing(target.parents('div.root.front'), false);
        }
        return false;
    });

    $(document).on('click', 'div.root.front', function(e) {
        console.log('Root');
        if( $(this).hasClass('editing') ) return;
        toggleChildren($(this).parent(), '.node.parent');
        toggleFolder($(this).children('i'));
    });

    $(document).on('click', 'div.parent.front', function(e) {
        console.log('Parent');
        if( $(this).hasClass('editing') ) return;
        toggleChildren($(this).parent(), '.node.child');
        toggleFolder($(this).children('i'));
    });

    $(document).on('click', 'button#addRoot', function(e) {
        addRoot("root");
    });
}


/*****************************************
            DATA MANIPULATION
*****************************************/

function getNode(id) {
    var index;
    var node;
    /* Grep node out of array */
    data.forEach(function(e, i, a){
        if(e.id == id) {
            index = i;
            node = e;
        }
    });

    return [node, index];
}

function addRoot() {
    /* Create new root object and add to data array */
    var root = new Root("New root");

    /* Save root to our data + DB */
    saveNode(root);
}

function addFactory(root) {
    /* Get root node from array */
    var id = $(root).attr("id");
    var result = getNode(root.id);

    /* Make new factory node */
    var f = new Factory(result[0].id, 0, 100);

    /* Call addChild() */
    result.addChild(f);

    /* Save parent to DB */
    saveNode(f);
}

function saveNode(n) {
    $.ajax({
        type: "PUT",
        url: "tree/",
        data: {
            "node" : JSON.stringify(n)
        },
        success: function(d) {
            data.push(n);
            comp.setState({data: data});
        }
    });
}

function saveChanges(n) {
    $.ajax({
        type: "POST",
        url: "tree/",
        data: {
            "node" : JSON.stringify(n)
        },
        success: function(d) {
        }
    });
}

function editNode(n, isSocketEvent) {
    console.log(n);
    $(n).find('button.ctrl').toggle();
    $(n).find('button.modify').toggle();
    $(n).addClass('editing');
    $(n).find('span.input').attr('contenteditable', true);
    $(n).children('.root.ctrl').addClass('editing');
}

function finishedEditing(n, save) {
    var node = getNode($(n).attr('data-id'));

    console.log("Da node", node);

    if(save) {

        if(node[0] instanceof Root) {

            console.log("is root");

        } else if(node[0] instanceof Factory) {

            console.log("is factory");

        } else {
            console.log("???");
        }

        /* Set its properties */


        /* Save changes to DB */
        //saveChanges(node);
    }

    $(n).find('button.ctrl').toggle();
    $(n).find('button.modify').toggle();
    $(n).removeClass('editing');
    $(n).find('span.input').attr('contenteditable', false);
    $(n).children('div.ctrl').removeClass('editing');
}

function generateNodes(f) {
    /* Call generate() for factory, it will take care of the rest */
}

function deleteNode(n) {
    if( confirm('Are you sure you want to delete this node?') ) {
        console.log('Deleting node', n);
        var id = $(n).attr("id");
        console.log("id", id);

        /* Remove node from data */
        var node = getNode(id);
        console.log(node);
        data.splice(node[1], 1);

        /* Update DB -> emit deletion event from server */
        return true;
    }

    return false;
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
    /* TODO */

    /* Set up our socket events for out data socket.init(data) */

    /* Fetch our data and feed it to react - we're live! */

    /* Initialize our React-driven tree */
    comp = React.renderComponent(Tree({data: data}), document.getElementById('tree'));
    console.log(comp);
};