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

  renderHandlerGroup(handler) {
    return <div key={handler.id}>
      <h1>Animations for {handler.id}</h1>
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
      <div>
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
