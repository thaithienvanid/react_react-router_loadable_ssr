import 'core-js'
import 'regenerator-runtime'

import debug from 'debug'
const log = debug('app:server')

import path from 'path'
import fs from 'fs-extra'

import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'

import http2 from 'http2'
import express from 'express'

import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'

import { minify } from 'html-minifier'

const app = express()

app.use(cors())
app.use(
  helmet({
    noSniff: false
  })
)
app.use(compression())

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
      logLevel: 'silent',
      publicPath: '/dist/web',
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

const HTML = ({ lang, title, link, style, main, script }) => {
  return minify(
    `<!DOCTYPE html>
    <html lang=${lang}>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#000000">
        <link rel="icon" href="/images/icons/icon-72x72.png" type="image/png">
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

app.get(
  '/dist/web/*',
  express.static(path.join(__dirname, '..'), {
    maxAge: '7d'
  })
)

app.get(
  '/*',
  express.static(path.join(__dirname, '../dist/web'), {
    maxAge: '7d'
  })
)

app.get('*', async (req, res, next) => {
  try {
    const context = {}

    const nodeExtractor = new ChunkExtractor({
      statsFile: nodeStats
    })

    const { default: App } = nodeExtractor.requireEntrypoint()

    const webExtractor = new ChunkExtractor({
      statsFile: webStats
    })

    const jsx = webExtractor.collectChunks(
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    )

    if (context.url) {
      redirect(301, context.url)
      return
    }

    const main = renderToString(jsx)

    const link = webExtractor.getLinkTags()

    const style = webExtractor.getStyleTags()

    const script = webExtractor.getScriptTags()

    const html = HTML({
      lang: 'en',
      title: 'App',
      link: link,
      style: style,
      main: main,
      script: script
    })

    res.set('content-type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (err) {
    next(err)
  }
})

app.use(async (err, req, res, next) => {
  log(`App:error`, err)
  res.redirect(`/oops`)
})

app.listen(process.env.PORT || 3000, () =>
  log(`App is running on port ${process.env.PORT || 3000}`)
)
