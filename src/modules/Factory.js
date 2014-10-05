var Node = require('./Node');

function Factory(parent, lower, upper) {
	Node.call(this, "factory", "New factory");
	this.parent = null;
	this.lower = lower; /* Lower bound for random number generation */
	this.upper = upper; /* Upper bound '' '' '' */
	this.children = []; //ObjectIDs of child (factory) nodes
}

/* Set up prototype chain + constructor */
Factory.prototype = new Node();
Factory.prototype.constructor = Factory;

Factory.prototype.generate = function() {
	/* Generate new factory and add it to our children array */
}

Factory.prototype.delChildren = function(id) {
	/* Delete factory from our children array when generating new numbers */
}

module.exports = Factory;