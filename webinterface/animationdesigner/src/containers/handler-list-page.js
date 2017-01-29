import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadHandlers } from '../actions';
import Handler from '../components/handler';
import List from '../components/list';

const loadData = ({ loadHandlers }) => {
  loadHandlers();
};

class HandlerListPage extends Component {
  static propTypes = {
    loadHandlers: PropTypes.func.isRequired
  };

  componentWillMount() {
    loadData(this.props);
  }

  renderHandler(handler) {
    return <Handler handler={handler} key={handler.id} />;
  }

  render() {
    const { handlers } = this.props;

    return (
      <div>
        <List renderItem={this.renderHandler}
              items={handlers}
              onLoadMoreClick={()=>{}}
              loadingLabel={`Loading handlers...`} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { handlers } = state;
  return { handlers };
};

export default connect(mapStateToProps, {
  loadHandlers
})(HandlerListPage);
