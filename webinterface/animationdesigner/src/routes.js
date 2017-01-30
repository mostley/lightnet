import React from 'react'
import { IndexRoute, Route } from 'react-router'
import App from './containers/app'
import HandlerListPage from './containers/handler-list-page';
import AnimationsPage from './containers/animations-page';

export default <Route path="/" component={App}>
  <IndexRoute component={AnimationsPage}/>

  <Route path="/handlers" component={HandlerListPage} />
  <Route path="/animations" component={AnimationsPage} />
</Route>
