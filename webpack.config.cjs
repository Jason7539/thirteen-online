const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/public/js/index.js",
  output: {
    path: path.resolve(__dirname, "src", "public", "dist"),
    filename: "main.js",
  },
  plugins: [new BundleAnalyzerPlugin()],
};
