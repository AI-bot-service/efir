module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Jitsi парсит config через worklet (react-native-worklets-core) — без этого
  // плагина worklet-функция не компилируется и config не грузится. Плагин — последним.
  plugins: ['react-native-worklets-core/plugin'],
};
