var Node = require('./Node');

function Child(parent, value, id) {
	if(value == undefined) {
		return;
	}
	Node.call(this, "child", value.toString(), id);
	this.parent = parent;
	this.value = parseInt(value);
}

/* Set up prototype chain + constructor */
Child.prototype = new Node();
Child.prototype.constructor = Child;

module.exports = Child;