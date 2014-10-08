/*
    Passport Parking Code Test
    Author: David Weber
    October 8, 2014

	Our factory object. Factories descend from the Node object,
	and maintain a lower bound and upper bound for generating
	random numbers, as well as an array of Child nodes that represent
	the generation result
*/

var Node = require('./Node');
var Child = require('./Child');

function Factory(parent, lower, upper, name, id) {
	if(name == null) {
		name = "New factory";
	}
	Node.call(this, "factory", name, id);
	this.parent = parent;
	this.lower = lower; /* Lower bound for random number generation */
	this.upper = upper; /* Upper bound '' '' '' */
	this.children = []; //ObjectIDs of child (factory) nodes
}

/* Set up prototype chain + constructor */
Factory.prototype = new Node();
Factory.prototype.constructor = Factory;

Factory.prototype.generate = function(count, data) {
	/* Clear current set of children */
	this.children = [];

	if(data != null) {
		console.log("Generating", data);
		for(var i = 0; i < data.data.length; i++) {
			console.log("Making new child");
			var c = new Child(this.id, data.data[i].value);
			this.children.push(c);
		}
	} else {
		/* Generate new children and add them to child array */
		for(var i = 0; i < count; i++) {
			/* Get random number between lower and upper bound */
			var random = Math.floor(Math.random() * (this.upper - this.lower + 1)) + parseInt(this.lower);
			var c = new Child(this.id, random);
			this.children.push(c);
		}
	}
}

module.exports = Factory;