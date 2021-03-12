const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  assetPrefix: isProd ? '/pixi-run' : '',
  trailingSlash: true
};