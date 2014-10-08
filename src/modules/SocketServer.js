/*
    Passport Parking Code Test
    Author: David Weber
    October 8, 2014

	These are our basic socket event bindings to process
	events sent from the client whenever a basic Tree
	operation is completed
*/

module.exports = function(io) {
	io.on('connection', function(socket) {
		console.log('Connected');

		socket.on('addRoot', function(data) {
			console.log("Root event received");
			socket.broadcast.emit('addRoot', {root: data});
		});

		socket.on('addFactory', function(data) {
			console.log("Factory event received");
			socket.broadcast.emit('addFactory', {factory: data});
		});

		socket.on('modify', function(data) {
			console.log("Modify event received");
			socket.broadcast.emit('modify', {node: data});
		});

		socket.on('delete', function(data) {
			console.log("Deletion event received");
			socket.broadcast.emit('delete', {node: data});
		});

		socket.on('generate', function(data) {
			console.log("Generation event received");
			socket.broadcast.emit('generate', {data: data});
		});
	});
};