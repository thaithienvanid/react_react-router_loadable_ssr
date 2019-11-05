import 'core-js'
import 'regenerator-runtime'

import 'sanitize.css'
import React from 'react'
import ReactDOM from 'react-dom'

import { BrowserRouter } from 'react-router-dom'

import { loadableReady } from '@loadable/component'

import { useSSR } from 'react-i18next'
import '../i18n/client'

import App from './app'

const Main = () => {
  useSSR(window.initialI18nStore, window.initialLanguage)
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

loadableReady(() => {
  ReactDOM.hydrate(<Main />, document.getElementById('main'))
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
    })
  }
})
