var Node = require('./Node');

function Root(name) {
	Node.call(this, "root", name);
	this.children = []; //ObjectIDs of child (factory) nodes
}

/* Set up prototype chain + constructor */
Root.prototype = new Node();
Root.prototype.constructor = Root;

Root.prototype.addChild = function(node) {
	this.children.push(node);
}

Root.prototype.addFactory = function() {
	/* Generate new factory and add it to our children array */
}

Root.prototype.delFactory = function(id) {
	/* Delete factory from our children array */
}

module.exports = Root;