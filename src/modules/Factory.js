var Node = require('./Node');
var Child = require('./Child');

function Factory(parent, lower, upper) {
	Node.call(this, "factory", "New factory");
	this.parent = parent;
	this.lower = lower; /* Lower bound for random number generation */
	this.upper = upper; /* Upper bound '' '' '' */
	this.children = []; //ObjectIDs of child (factory) nodes
}

/* Set up prototype chain + constructor */
Factory.prototype = new Node();
Factory.prototype.constructor = Factory;

Factory.prototype.generate = function(count) {
	/* Clear current set of children */
	this.children = [];

	/* Generate new children and add them to child array */
	for(var i = 0; i < count; i++) {
		/* Get random number between lower and upper bound */
		var random = Math.floor(Math.random() * (this.upper - this.lower + 1)) + this.lower;
		var c = new Child(this.id, random);
		this.children.push(c);
	}
}

Factory.prototype.delChildren = function() {
	/* Delete factory from our children array when generating new numbers */
	this.children = [];
}

module.exports = Factory;