module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NOTE: 'react-native-reanimated/plugin' must be the last plugin in this list
    // and is required for Reanimated worklets to run correctly. Keep it here
    // and rebuild the native app after installing react-native-reanimated.
    plugins: [
      ['@babel/plugin-transform-class-properties', { "loose": false }],
      ['@babel/plugin-transform-private-methods', { "loose": false }],
      ['@babel/plugin-transform-private-property-in-object', { "loose": false }],
      'react-native-reanimated/plugin'
    ]
  };
};
