import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadAnimations, loadHandlers } from '../actions';
import { Link } from 'react-router';

const loadData = ({ loadAnimations, loadHandlers }) => {
  loadAnimations();
  loadHandlers();
};

class AnimationsPage extends Component {
  static propTypes = {
    loadAnimations: PropTypes.func.isRequired
  };

  componentWillMount() {
    loadData(this.props);
  }

  renderAnimationLink(animation) {
    return <li>
      <Link key={animation.id} to={`/animations/${animation.id}`}>animation.name</Link>
    </li>;
  }

  sendFrame(handler, color) {
    var data = [];
    for (var i=0;i<handler.numberOfLeds; i++) {
      data[i] = color;
    }

    fetch(`http://localhost:4050/api/handlers/${handler.id}/control`, {
        method: 'PUT',
        headers: new Headers({
      		'Content-Type': 'application/json'
      	}),
        body: JSON.stringify(data)
      })
      .then((err, res) => {
        console.log(err, res);
      }).catch(function(err) {
      	console.error(err);
      });
  }

  renderHandlerGroup(handler) {
    console.log('renderHandlerGroup', handler);

    return <div className="handler-group" key={handler.id}>
      <h1>{handler.id}</h1>

      <button className="button" onClick={() => this.sendFrame(handler, [0,0,0])}>Off</button>
      <button className="button" onClick={() => this.sendFrame(handler, [255,0,0])}>Red</button>
      <button className="button" onClick={() => this.sendFrame(handler, [0,255,0])}>Green</button>
      <button className="button" onClick={() => this.sendFrame(handler, [0,0,255])}>Blue</button>
      <button className="button" onClick={() => this.sendFrame(handler, [255,0,255])}>Purpur</button>
      <button className="button" onClick={() => this.sendFrame(handler, [255,255,255])}>White</button>

      <ul>
        {this.props.animations
          .filter(anim => anim.handlerID === handler.id)
          .map(this.renderAnimationLink.bind(this))}
      </ul>
    </div>;
  }

  render() {
    const { handlers } = this.props;

    return (
      <div className="page">
        {handlers.map(this.renderHandlerGroup.bind(this))}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { animations, handlers } = state;
  return { animations, handlers };
};

export default connect(mapStateToProps, {
  loadAnimations,
  loadHandlers
})(AnimationsPage);
