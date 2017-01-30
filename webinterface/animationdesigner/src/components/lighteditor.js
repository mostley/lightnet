import React, { Component, PropTypes } from 'react';

export default class LightEditor extends Component {
  static propTypes = {
    lights: PropTypes.array.isRequired,
    frame: PropTypes.array.isRequired
  };

  static defaultProps = {
  };

  renderLight(light) {
    const { frame } = this.props;
    const data = frame[light.index];

    return <div className="light">{data}</div>;
  }

  render() {
    const { lights, frame } = this.props;

    const isEmpty = lights.length === 0
    if (isEmpty) {
      return <h2><i>No Lights here</i></h2>;
    }

    return (
      <div>
        {lights.map(this.renderLight.bind(this))}
      </div>
    );
  }
}
