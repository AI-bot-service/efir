const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

// zustand через package-exports резолвится на esm-сборку с import.meta,
// который Hermes не компилирует. Точечно перенаправляем на CJS-сборку.
const zustandDir = path.join(__dirname, 'node_modules', 'zustand');
const zustandCjs = {
  zustand: path.join(zustandDir, 'index.js'),
  'zustand/middleware': path.join(zustandDir, 'middleware.js'),
  'zustand/vanilla': path.join(zustandDir, 'vanilla.js'),
  'zustand/shallow': path.join(zustandDir, 'react', 'shallow.js'),
};

const config = {
  // Иконки Jitsi — .svg, импортируются как React-компоненты. Без трансформера
  // Metro считает их картинками (число) → Icon падает → чёрный экран конференции.
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    resolveRequest: (context, moduleName, platform) => {
      const target = zustandCjs[moduleName];
      if (target) {
        return {type: 'sourceFile', filePath: target};
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
