import React from 'react'
import { Switch, Route } from 'react-router-dom'

import loadable from '@loadable/component'

const Loading = () => (
  <React.Fragment>
    <h1>...</h1>
  </React.Fragment>
)

const Home = loadable(() => import('./pages/home'), {
  fallback: Loading
})

const Oops = loadable(() => import('./pages/oops'), {
  fallback: Loading
})

const App = () => (
  <Switch>
    <Route path="/" exact={true} component={Home} />
    <Route component={Oops} />
  </Switch>
)

export default App
