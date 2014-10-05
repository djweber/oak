var ShortId = require('shortid');

function Node(type, name) {
	/* Create our persistent ID for this node */
	this.id = ShortId.generate();
	this.type = type;
	this.name = name;
}

module.exports = Node;