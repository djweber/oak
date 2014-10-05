var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var nodeSchema = new Mongoose.Schema({
	name: 'string',
	type: 'string',
	node_id: 'string',
	children: 'array',
	lower: 'number',
	upper: 'number',
	value: 'number'
});

var Node = Mongoose.model('Node', nodeSchema);

module.exports = Node;