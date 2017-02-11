import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadAnimations, loadHandlers } from '../actions';
import { Link } from 'react-router';

import LightEditor from '../components/lighteditor';

const loadData = ({ loadAnimations, loadHandlers }) => {
  loadAnimations()
    .then(animation => {
      loadHandlers(animation.handlerId);
    })
};

class AnimationEditorPage extends Component {
  static propTypes = {
    loadAnimations: PropTypes.func.isRequired,
    animation: PropTypes.object,
    handler: PropTypes.object,
    currentFrame: PropTypes.number
  };

  static defaultProps = {
    currentFrame: 0
  };

  componentWillMount() {
    loadData(this.props);
  }

  render() {
    const { animation, currentHandler, currentFrame, handler } = this.props;

    return (
      <div>
        <LightEditor lights={handler.lights} frame={animation.frames[currentFrame]}/>
        {/*<TimeLine/>*/}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { animation, currentHandler } = state;
  return { animation, currentHandler };
};

export default connect(mapStateToProps, {
  loadAnimations, loadHandlers
})(AnimationEditorPage);
