var express = require('express');
var router = express.Router();
var Node = require('../models/Node');
var mongoose = require('mongoose');
var TreeController = require('../controllers/TreeController');

router.put('/', function(req, res) {
	var io = req.app.get('socket');
 	var tmp = req.param("node");
 	tmp = JSON.parse(tmp);
 	//console.log(tmp);
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
 		});
 	}
});

/* Fetch all the tree data */
router.get('/', function(req, res) {

	var data = [];
	var count = 0;
	var total = 0;

	Node.count(function(err, c){

		total = c;
		if(c == 0){
			res.send(200, []);
		}
		console.log(total);

		/* First, get all the roots */
		Node.find( {type: "root"} ).sort({ _id: 'asc' }).exec(function(err, result) {
			if(err) {
				throw err;
				res.send(500, "Error retrieving nodes");
			}

			result.forEach(function(v, i, a) {
				data.push(v);
				recursiveFetch(v);
			});
		});
	});

	function recursiveFetch(src) {
		/* Go through children of source element */
		count++;

		if(src.children == undefined || src.children.length == 0) {
			//console.log("No children");
		} else {
			//console.log("Has children");
		}

		src.children.forEach(function(val, index, array) {
			/* Fetch the actual child from the DB, and replace the key with the object */
			console.log(val);
			Node.findOne({node_id: val}, function(err, result) {
				if(err) {
					throw err;
					res.send(500, "Error");
				}
				//console.log("Adding " + result.type + " to " + src.type);
				array[index] = result;
				recursiveFetch(result);
			});
		});

		if(count == total) {
			//console.log(data);
			res.send(200, data);
			return;
		}
	}
});


router.delete('/:id', function(req, res) {
 	/* Find node by ID */
 	var id = req.param('id');
 	console.log(id);
 	/* We'll want to delete any children if present */
 	Node.findOne({node_id: id}, function(err, result){
 		if(result) {
 			/* Remove its id from any parent nodes */
 			console.log("Teh parent", result.parent);
 			console.log("Teh node_id", result.node_id);
			Node.update(
				{ node_id: result.parent },
				{ $pull: { "children" : result.node_id }}, function(err, result){
					console.log("Edited", result);

				});
 			console.log("Deleting", result);
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
	if (tmpNode.lower == undefined || tmpNode.lower == null) {
		tmpNode.lower = 0;
		tmpNode.upper = 0;
	}
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
	});
});

router.put('/generate', function(req, res){
	/* Get the factory node */
	var factory = req.param('id');
	var children = JSON.parse(req.param('children'));

	/* Get the list of keys */
	var keys = [];
	children.forEach(function(v, i, a){
		// console.log(v);
		keys.push(v["id"]);
	});

	/* Delete all of the factory's current children */
	Node.remove({ parent: factory }, function (err) {
		//console.log("Current factory children removed");
		/* Clear factory's list of children */
		Node.where('node_id', factory).update({
			$set: { "children": keys }}, function(err, result) {

			if(err) {
				//console.log(err);
				res.send(500, err);
			}

			/* Insert new children */
			for(var i = 0; i < children.length; ++i) {
				var node = new Node({
			 		node_id: children[i].id,
			 		name: children[i].name,
			 		type: children[i].type,
			 		parent: children[i].parent
		 		});

			 	node.save(function(err, node) {
			 		if(err) {
			 			return console.log(err);
			 		}
			 		console.log("Saved node: ", node);
			 	});

			 	if(i == children.length - 1 ) {
			 		res.send(200, "Nodes generated");
 					/* TODO Emit socket event to others */

			 	}
			}
		});
	});
});

module.exports = router;