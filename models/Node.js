/* This is our Node model for Mongoose. It encapsulates all
   possible types of nodes without being split into separate
   models */

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var nodeSchema = new Mongoose.Schema({
	name: 'string',
	type: 'string',
	parent: 'string',
	node_id: 'string',
	children: 'array',
	lower: 'number',
	upper: 'number',
	value: 'number'
});

var Node = Mongoose.model('Node', nodeSchema);

module.exports = Node;