import React from 'react'
import { Route } from 'react-router'
import App from './containers/app'
import HandlerListPage from './containers/handler-list-page';
import AnimationsPage from './containers/animations-page';

export default <Route path="/" component={App}>
  <Route path="/handlers" component={HandlerListPage} />
  <Route path="/animations" component={AnimationsPage} />
</Route>
