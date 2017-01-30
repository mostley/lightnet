import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import { resetErrorMessage } from '../actions';

class App extends Component {
  static propTypes = {
    // Injected by React Redux
    errorMessage: PropTypes.string,
    resetErrorMessage: PropTypes.func.isRequired,

    // Injected by React Router
    children: PropTypes.node
  };

  handleDismissClick = e => {
    this.props.resetErrorMessage();
    e.preventDefault();
  };

  handleChange = nextValue => {
    browserHistory.push(`/${nextValue}`);
  };

  renderErrorMessage() {
    const { errorMessage } = this.props;
    if (!errorMessage) {
      return null;
    }

    return (
      <p style={{ backgroundColor: '#e99', padding: 10 }}>
        <b>{errorMessage}</b>
        {' '}
        (<a href="#"
            onClick={this.handleDismissClick}>
          Dismiss
        </a>)
      </p>
    );
  }

  render() {
    const { children } = this.props;
    return (
      <div>
        <div className="navigation">
          <Link className="logo" to={`/`}>LightNet</Link>
          <Link to={`/animations`} activeClassName="active">Animations</Link>
          <Link to={`/handlers`} activeClassName="active">Handlers</Link>
        </div>
        {this.renderErrorMessage()}
        {children}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  errorMessage: state.errorMessage
});

export default connect(mapStateToProps, {
  resetErrorMessage
})(App);
