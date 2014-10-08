/*
    Passport Parking Code Test
    Author: David Weber
    October 8, 2014

    This is the database configuration. It sets up the connection
    and its associated events.
 */


var dbconf = require('./db');

module.exports = function(mongoose) {
	//mongoose.connect('mongodb://localhost/tree_db', dbconf);

	mongoose.connect('mongodb://localhost/tree_db');

	mongoose.connection.on('connected', function(ref){
	    console.log('Connected to MongoDB server');
	});

	mongoose.connection.on('error', function(err){
	    console.log('Failed to connect to MongoDB server', err);
	});

	mongoose.connection.on('disconnected', function(err){
	    console.log('Disconnected from MongoDB server', err);
	});

	var nodeExit = function() {
	  mongoose.connection.close(function () {
	    console.log('Closing database connection');
	    process.exit(0);
	  });
	}

	process.on('SIGINT', nodeExit).on('SIGTERM', nodeExit);
}