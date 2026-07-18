const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const zustandDir = path.join(__dirname, 'node_modules', 'zustand');
// zustand через package-exports резолвится на esm-сборку с import.meta,
// который Hermes не компилирует. Точечно перенаправляем на CJS-сборку (она чиста).
// exports для всех остальных пакетов остаются включёнными.
const zustandCjs = {
  zustand: path.join(zustandDir, 'index.js'),
  'zustand/middleware': path.join(zustandDir, 'middleware.js'),
  'zustand/vanilla': path.join(zustandDir, 'vanilla.js'),
  'zustand/shallow': path.join(zustandDir, 'react', 'shallow.js'),
};

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      const target = zustandCjs[moduleName];
      if (target) {
        return {type: 'sourceFile', filePath: target};
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
