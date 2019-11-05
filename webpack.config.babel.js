import path from 'path'
import webpack from 'webpack'
import nodeExternals from 'webpack-node-externals'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import LoadableWebpackPlugin from '@loadable/webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import WorkboxWebpackPlugin from 'workbox-webpack-plugin'

const DIST_PATH = path.resolve(__dirname, 'dist')
const production = process.env.NODE_ENV === 'production'
const development =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

const getConfig = target => {
  const optimization = production
    ? {
        optimization: {
          minimizer: [
            new TerserJSPlugin({
              cache: true,
              parallel: true,
              sourceMap: true
            }),
            new OptimizeCSSAssetsPlugin({})
          ],
          splitChunks: {
            chunks: 'all'
          },
          moduleIds: 'hashed',
          chunkIds: 'named'
        }
      }
    : {
        optimization: {
          splitChunks: {
            chunks: 'all'
          },
          moduleIds: 'hashed',
          chunkIds: 'named'
        }
      }
  const HotModuleReplacementPlugin = development
    ? [new webpack.HotModuleReplacementPlugin()]
    : []
  return {
    name: target,
    mode: development ? 'development' : 'production',
    target: target,
    devtool: 'source-map',
    entry: target === 'web' ? `./src/web/index.js` : `./src/web/app.js`,
    output: {
      path: path.resolve(DIST_PATH, target),
      filename: production ? '[name].[contenthash:4].js' : '[name].[hash:4].js',
      chunkFilename: production
        ? '[id].[contenthash:4].js'
        : '[id].[hash:4].js',
      publicPath: `/`,
      libraryTarget: target === 'node' ? 'commonjs2' : undefined
    },
    externals:
      target === 'node' ? ['@loadable/component', nodeExternals()] : undefined,
    ...optimization,
    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin([{ from: './public', to: './' }]),
      new LoadableWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: production
          ? '[name].[contenthash:4].css'
          : '[name].[hash:4].css',
        chunkFilename: production
          ? '[id].[contenthash:4].css'
          : '[id].[hash:4].css'
      }),
      new WorkboxWebpackPlugin.GenerateSW({
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: new RegExp(
              '^https://fonts.(?:googleapis|gstatic).com/(.*)'
            ),
            handler: 'CacheFirst'
          },
          {
            urlPattern: /.*/,
            handler: 'NetworkFirst'
          }
        ]
      }),
      ...HotModuleReplacementPlugin
    ],
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              caller: { target }
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: development,
                reloadAll: true
              }
            },
            {
              loader: 'css-loader',
              options: { importLoaders: 1, sourceMap: true }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: loader => [
                  require('postcss-import')({ root: loader.resourcePath }),
                  require('postcss-preset-env')(),
                  require('cssnano')()
                ],
                sourceMap: true
              }
            }
          ]
        }
      ]
    }
  }
}

export default [getConfig('web'), getConfig('node')]
