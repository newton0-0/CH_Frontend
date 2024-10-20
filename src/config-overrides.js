// config-overrides.js
module.exports = function override(config) {
    if (process.env.NODE_ENV === 'development') {
        config.devtool = 'eval'; // Use 'eval' to ignore source maps
    }
    return config;
};
