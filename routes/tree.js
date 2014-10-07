var express = require('express');
var router = express.Router();
var Node = require('../models/Node');
var mongoose = require('mongoose');
var TreeController = require('../controllers/TreeController');

/* GET home page. */
router.put('/', function(req, res) {
 	var tmp = req.param("node");
 	tmp = JSON.parse(tmp);
 	console.log(tmp);

 	/* Save our new node to the DB */
 	var node = new Node({
 		node_id: tmp.id,
 		name: tmp.name,
 		type: tmp.type,
 		parent: tmp.parent,
 		children: [],
 		lower: tmp.lower,
 		upper: tmp.upper,
 		value: tmp.value
 	});

 	node.save(function(err, node) {
 		if(err) {
 			return console.log(err);
 		}
 		console.log("Saved node: ", node);
 		res.send(200, "Node saved");
 	});

 	if(tmp.parent != null && tmp.parent != undefined) {
 		/* Add this node to parent's list of children */
 		Node.findOneAndUpdate({node_id: tmp.parent}, { $push: { children: tmp.id }}, function(err) {
 			console.log("Child added");
 			/* TODO Emit socket event to others */
 		});
 	}
});

router.delete('/:id', function(req, res) {
 	/* Find node by ID */
 	var id = req.param('id');

 	/* We'll want to delete any children if present */
 	Node.findOne({node_id: id}, function(err, result){
 		if(result) {
 			/* Recursively delete all of its children from db, if any */
 			TreeController.deleteNode(result);
 			res.send(200, "Deleted node", id);
 			/* TODO Emit socket event to others */
 		}
 	});
 });

router.post('/:id', function(req, res) {
	/* Get node by the node_id */
	var tmpNode = JSON.parse(req.param('node'));
	//console.log(tmpNode);
	console.log(tmpNode.id);
	Node.where('node_id', tmpNode.id).update({
		$set: {
			"name": tmpNode.name,
			"lower": tmpNode.lower,
			"upper": tmpNode.upper
		}
	}, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		};

		res.send(200, "Node updated");

		/* TODO Emit socket event to others */
	});
});

router.put('/generate/:id', function(req, res){
	/* Get the factory node */
	var tmpNode = JSON.parse(req.param('node'));

	/* Delete all of the factory's current children */

	/* Insert new children for factory */

	/* TODO Emit socket event to others */
});

module.exports = router;
