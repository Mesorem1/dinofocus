module.exports = function (api) {
  const isTest = api.env('test');
  api.cache(!isTest);

  if (isTest) {
    return {
      presets: [['expo/internal/babel-preset', { reanimated: false, unstable_transformImportMeta: false }]],
    };
  }

  return {
    presets: ['expo/internal/babel-preset'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
