import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadAnimation, loadHandler } from '../actions';
import { Link } from 'react-router';

import LightEditor from '../components/lighteditor';

const loadData = ({ loadAnimation, loadHandler }) => {
  loadAnimation()
    .then(animation => {
      loadHandler(animation.handlerId);
    })
};

class AnimationEditorPage extends Component {
  static propTypes = {
    loadAnimation: PropTypes.func.isRequired,
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
    const { animation, currentHandler, currentFrame } = this.props;

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
  loadAnimation, loadHandler
})(AnimationEditorPage);
