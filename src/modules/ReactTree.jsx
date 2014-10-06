/**
 * @jsx React.DOM
 */

var React = require('react');

// var Child = React.createClass({
// 	render: function() {
// 	    return (
// 	      <div className="commentList">
// 	        {commentNodes}
// 	      </div>
// 	    );
// 	}
// });

var Factory = React.createClass({
	componentDidMount: function() {
		console.log("Factory name", this.props.name)
	},
	componentWillUnmount: function() {
		console.log("Deleted factory", this.props.name);
	},
	render: function() {
	    return (
	    	<div className="factory node">
	    		<div className="factory front" data-id={this.props.id}>
	    			<i className="toggle fa fa-folder-open" />
	    			<span className="factory label input name">{this.props.name}</span>
	    			<div className="factory ctrl">
						<button data-id={this.props.id} className="delete ctrl">
							<i className="ctrl fa fa-trash" />
						</button>
						<button className="edit ctrl">
							<i className="ctrl fa fa-pencil" />
						</button>
						<button className="generate ctrl">
							<i className="ctrl fa fa-play" />
						</button>
						<button className="save modify" style={{"display": "none"}}>
							Save
						</button>
						<button className="cancel modify" style={{"display": "none"}}>
							Cancel
						</button>
					</div>
	    		</div>
	    	</div>
	    );
	}
});


var FactoryList = React.createClass({
	render: function() {
		var factoryNodes = null;
		var counter = 0;
		if (this.props.data) {
			factoryNodes = this.props.data.map(function (factory) {
				counter++;
				return (
					<Factory key={counter} id={factory.id} name={factory.name} children={factory.children} />
				);
    		});
		}
	    return (
			<div className="children factoryList">
				{factoryNodes}
			</div>
	    );
	}
});

var Root = React.createClass({
	render: function() {
	    return (
	    	<div id={this.props.id} className="root node">
				<div className="root front" data-id={this.props.id}>
					<i className="toggle fa fa-folder-open" />
					<span className="root label input name">{this.props.name}</span>
					<div className="root ctrl">
						<button data-id={this.props.id} className="delete ctrl">
							<i className="ctrl fa fa-trash" />
						</button>
						<button className="edit ctrl">
							<i className="ctrl fa fa-pencil" />
						</button>
						<button className="add ctrl">
							<i className="ctrl fa fa-plus" />
						</button>
						<button className="save modify" style={{"display": "none"}}>
							Save
						</button>
						<button className="cancel modify" style={{"display": "none"}}>
							Cancel
						</button>
					</div>
				</div>
				<FactoryList data={this.props.children} />
	      </div>
	    );
	}
});

var RootList = React.createClass({
	componentDidMount: function() {
		this.setState({data: this.props.data});
	},
	getInitialState: function() {
		return {data: []};
	},
	render: function() {
		var rootNodes = null;
		var counter = 0;
		if (this.state.data) {
			rootNodes = this.state.data.map(function (root) {
				counter++;
				return (
					<Root id={root.id} key={counter} name={root.name} children={root.children} />
				);
    		});
		}
	    return (
			<div className="rootList">
				{rootNodes}
			</div>
	    );
	}
});

module.exports = RootList;