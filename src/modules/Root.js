/*
    Passport Parking Code Test
    Author: David Weber
    October 8, 2014

	Our root node object. These are pretty basic, so there
	isn't too much logic for this one
*/

var Node = require('./Node');

function Root(name, id) {
	Node.call(this, "root", name, id);
	this.children = []; //ObjectIDs of child (factory) nodes
}

/* Set up prototype chain + constructor */
Root.prototype = new Node();
Root.prototype.constructor = Root;

Root.prototype.addChild = function(node) {
	this.children.push(node);
}

Root.prototype.addFactory = function(f) {
	/* Add factory to our children array */
	this.children.push(f);
}

module.exports = Root;