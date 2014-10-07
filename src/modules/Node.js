var ShortId = require('shortid');

function Node(type, name, id) {
	/* Create our persistent ID for this node */
	if(id == null){
		console.log("Generating ID");
		this.id = ShortId.generate();
	} else {
		this.id = id;
	}
	this.type = type;
	this.name = name;
}

module.exports = Node;