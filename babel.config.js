module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required by Vision Camera frame processors / face detector worklets.
      'react-native-worklets-core/plugin',
    ],
  };
};
