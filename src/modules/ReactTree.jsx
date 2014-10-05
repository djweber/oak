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

// var Factory = React.createClass({
// 	render: function() {
// 	    return (
// 	      <div className="commentList">
// 	        {commentNodes}
// 	      </div>
// 	    );
// 	}
// });
//


// var FactoryList = React.createClass({
// 	render: function() {
// 		return (

// 		);
// 	}
// });

var Root = React.createClass({
	render: function() {
	    return (
	    	<div id={this.props.id} className="root node">
				<div className="root front" data-id={this.props.id}>
					<i className="fa fa-folder-open" />
					<span className="root label input name">{this.props.name}</span>
					<div className="root ctrl">
						<button className="delete ctrl">
							<i className="fa fa-trash" />
						</button>
						<button className="edit ctrl">
							<i className="fa fa-pencil" />
						</button>
						<button className="add ctrl">
							<i className="fa fa-plus" />
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

var RootList = React.createClass({
	componentDidMount: function() {
		this.setState({data: this.props.data});
	},
	getInitialState: function() {
		return {data: []};
	},
	render: function() {
		var rootNodes = null;
		if (this.state.data) {
			rootNodes = this.state.data.map(function (root) {
				return (
					<Root id={root.id} name={root.name} children={root.children} />
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