import 'core-js'
import 'regenerator-runtime'

import debug from 'debug'
const log = debug('app:server')

import path from 'path'
import fs from 'fs-extra'

const PORT = process.env.PORT || 3000

import React from 'react'
import { I18nextProvider } from 'react-i18next'
import { StaticRouter } from 'react-router-dom'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'

import express from 'express'

import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'

import { minify } from 'html-minifier'

import i18n from './i18n/server'
import { handle } from 'i18next-express-middleware'

const app = express()

app.use(cors())
app.use(
  helmet({
    noSniff: false
  })
)
app.use(compression())

app.use(handle(i18n))

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable global-require, import/no-extraneous-dependencies */
  const { default: webpackConfig } = require('../webpack.config.babel')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const webpack = require('webpack')
  /* eslint-enable global-require, import/no-extraneous-dependencies */

  const compiler = webpack(webpackConfig)

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: '/',
      serverSideRender: true,
      writeToDisk: true
    })
  )

  app.use(
    webpackHotMiddleware(compiler, {
      reload: true
    })
  )
}

const nodeStats = path.resolve(__dirname, '../dist/node/loadable-stats.json')
const webStats = path.resolve(__dirname, '../dist/web/loadable-stats.json')

console.log('nodeStats', nodeStats)
console.log('webStats', webStats)

const HTML = ({
  lang,
  title,
  link,
  style,
  main,
  script,
  initialI18nStore,
  initialLanguage
}) => {
  return minify(
    `<!DOCTYPE html>
    <html lang="${lang}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#000000">
        <link rel="icon" href="/images/icons/icon-72x72.png" type="image/png">
        <link rel="apple-touch-icon" href="/images/icons/icon-192x192.png" type="image/png">
        <link rel="manifest" href="/manifest.json">
        <title>${title}</title>
        <meta name="description" content="${title}">
        ${link}
        ${style}
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="main">${main}</div>
        ${script}
        <script>
          window.initialI18nStore = JSON.parse('${JSON.stringify(
            initialI18nStore
          )}');
          window.initialLanguage = '${initialLanguage}';
        </script>
      </body>
    </html>`,
    {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true
    }
  )
}

app.use(
  express.static(path.join(__dirname, '../dist/web'), {
    maxAge: '7d'
  })
)

app.use(async (err, req, res, next) => {
  log(`application:error`, err)
  res.redirect(`/oops`)
})

app.get('/*', async (req, res, next) => {
  try {
    let context = {}

    const nodeExtractor = new ChunkExtractor({
      statsFile: nodeStats
    })

    const { default: App } = nodeExtractor.requireEntrypoint()

    const webExtractor = new ChunkExtractor({
      statsFile: webStats
    })

    const jsx = webExtractor.collectChunks(
      <I18nextProvider i18n={req.i18n}>
        <StaticRouter location={req.url} context={context}>
          <App />
        </StaticRouter>
      </I18nextProvider>
    )

    if (context.url) {
      redirect(301, context.url)
      return
    }

    const main = renderToString(jsx)

    const link = webExtractor.getLinkTags()

    const style = webExtractor.getStyleTags()

    const script = webExtractor.getScriptTags()

    const initialI18nStore = {}
    req.i18n.languages.forEach(language => {
      initialI18nStore[language] = req.i18n.services.resourceStore.data[language]
    })
    const initialLanguage = req.i18n.language

    const html = HTML({
      lang: initialLanguage,
      title: 'App',
      link: link,
      style: style,
      main: main,
      script: script,
      initialI18nStore,
      initialLanguage
    })

    res.set('cache-control', 'public, max-age=604800')
    res.send(html)
  } catch (err) {
    next(err)
  }
})

app.listen(PORT, () => log(`application is running on port ${PORT}`))
