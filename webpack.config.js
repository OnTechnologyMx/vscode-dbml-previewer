const path = require('path');

module.exports = (env, argv) => ({
  entry: './src/webview/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webview.js',
  },
  // Webview CSP forbids 'unsafe-eval', so we must avoid webpack's default
  // eval-based devtools. Production ships no source map; development uses a
  // plain (non-eval) source map that is still debuggable and CSP-safe.
  devtool: argv.mode === 'production' ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false }],
              ['@babel/preset-react', { runtime: 'automatic', development: false }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  target: 'web',
});
