var Node = require('../models/Node');

module.exports = {
	deleteNode: function (n) {

		if( this.hasChildren(n) ) {
			n.children.forEach(function(v, i, a) {
				Node.findOne({node_id: v}, function(err, result){
					if(err) throw err;
					console.log("Result", result);
					this.deleteNode(result);
				}.bind(this));
				console.log("Children", n.children);
			}.bind(this));
		}

		/* Delete itself */
		Node.findOne({_id: n._id}).remove(function(err){
			if(err) throw err;
			console.log("Removed node", n);
		});

	},
	hasChildren: function(n) {
		if(n.children != undefined && n.children != null && n.children.length > 0) {
			return true;
		}
		console.log("No children");
		return false;
	}
	getData: function(n) {

	}
}