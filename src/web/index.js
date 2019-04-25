import 'core-js'
import 'regenerator-runtime'

import 'sanitize.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import { loadableReady } from '@loadable/component'

import App from './app'

loadableReady(() => {
  ReactDOM.hydrate(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById('main')
  )
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
    })
  }
})
