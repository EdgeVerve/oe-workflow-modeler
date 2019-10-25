const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');
const APP_DIR = path.resolve(__dirname, './app');
const MONACO_DIR = path.resolve(__dirname, './node_modules/monaco-editor');
const devData = require('./resources/sample-responses');
const fs = require('fs');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: "./app/index.js",
  output: {
    filename: "index.js"
  },
  module: {
    rules: [{
        test: /\.bpmn$/,
        loader: 'raw-loader',
        options: {}
      },
      // {
      //   loader: `transform-loader?babelify`,
      //   include: APP_DIR,
      // },
      {
        test: /\.css$/,
        include: APP_DIR,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
          options: {
            modules: true,
            namedExport: true,
          },
        }],
      }, {
        test: /\.css$/,
        include: MONACO_DIR,
        use: ['style-loader', 'css-loader'],
      }, {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, /*'style-loader',*/ 'css-loader', 'less-loader'],
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      PathObserver: ['observe-js', 'PathObserver']
    }),
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'json']
    }),
    new CopyPlugin([{
        from: './node_modules/bpmn-js/dist/assets',
        ignore: ['**/*.js'],
        to: 'vendor'
      },
      {
        from: './node_modules/bootstrap/dist/css/bootstrap.min.css',
        to: 'vendor/bootstrap/css'
      },
      {
        from: 'app',
        ignore: ['**/*.js', 'app.css'],
        to: ''
      }
    ]),
    new MiniCssExtractPlugin({
      filename: "css/app.css"
    })
  ],
  devServer: {
    watchOptions: {
      ignored: [
        path.resolve(__dirname, 'dist'),
        path.resolve(__dirname, 'resources'),
        path.resolve(__dirname, 'node_modules')
      ]
    },
    before: function (app, server) {
      app.use(require('body-parser').raw({ inflate: true, limit: '100kb', type: 'text/plain' }));
      app.get(/\/(flows|models|rules|extensions)/, function (req, res) {
        let data = devData[req.url.substr(1)]; /* /flows -> flows */
        if(data){
          res.json(data);
        } else {
          res.send(404);
        }
      });
      app.get('/files/:name', function(req, res){
        let fileName = req.params.name;
        res.contentType('application/text');
        res.sendFile(`${__dirname}/resources/${fileName}`, {headers:{'content-type': 'application/text'}});
      });

      app.post('/files/:name', function(req, res){
        let fileName = req.params.name;
        fs.writeFile(`${__dirname}/resources/${fileName}`, req.body, (err) => {
          if (err) throw err;
          res.contentType('application/json');
          res.json({name: fileName, message: 'File Saved'});
        });
      });
    }
  }
}