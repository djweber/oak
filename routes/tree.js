var express = require('express');
var router = express.Router();
var Node = require('../models/Node');
var mongoose = require('mongoose');

/* GET home page. */
router.put('/', function(req, res) {
 	var tree = req.param("node");
 	tree = JSON.parse(tree);

 	/* Save our new node to the DB */
 	var node = new Node({
 		node_id: tree.id,
 		name: tree.name,
 		type: tree.type,
 		children: [],
 		lower: 0,
 		upper: 0,
 		value: 0
 	});

 	node.save(function(err, node) {
 		if(err) {
 			return console.log(err);
 		}
 		console.log("Saved node: ", node);
 		res.send(200, "Node saved");
 	});
});

router.delete('/:id', function(req, res) {
 	/* Find node by ID */

 	/* Recursively delete all of its children from db, if any */

 	/* Finally, remove it */
});

router.post('/:id', function(req, res) {
	/* Get node by the node_id */


	/* Edit node info */
})

module.exports = router;
