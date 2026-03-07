module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-class-properties', { "loose": false }],
      ['@babel/plugin-transform-private-methods', { "loose": false }],
      ['@babel/plugin-transform-private-property-in-object', { "loose": false }]
      // Note: 'react-native-reanimated/plugin' removed to avoid web bundling errors in Expo Go.
      // Add it back when using a native build or EAS dev client that provides the native Reanimated module.
    ]
  };
};
