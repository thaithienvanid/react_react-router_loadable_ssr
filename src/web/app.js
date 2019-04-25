import React from 'react'
import { Switch, Route } from 'react-router-dom'

import loadable from '@loadable/component'

const Loading = () => (
  <React.Fragment>
    <h1>...</h1>
    {new Date().toUTCString()}
  </React.Fragment>
)

const Home = loadable(() => import('./pages/home'), {
  fallback: Loading
})
const Blog = loadable(() => import('./pages/blog'), {
  fallback: Loading
})
const Post = loadable(() => import('./pages/post'), {
  fallback: Loading
})
const Oops = loadable(() => import('./pages/oops'), {
  fallback: Loading
})

const App = () => (
  <Switch>
    <Route path="/" exact={true} component={Home} />
    <Route path="/blog" exact={true} component={Blog} />
    <Route path="/post/:slug" exact={true} component={Post} />
    <Route component={Oops} />
  </Switch>
)

export default App
