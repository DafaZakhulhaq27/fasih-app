// https://docs.expo.dev/guides/customizing-metro/
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Every zod entry point (`zod`, `zod/mini`, `zod/v4/core`) re-exports all of its ~60 locales as
// `z.locales`, and Metro bundles every module it can reach, so they all shipped (about 290 KB of
// the web bundle). The app uses none of them: zod sets its English messages by importing
// `locales/en.js` directly. So the locale index is swapped for one that exports English only.
const zodLocaleIndex = /[\\/]node_modules[\\/]zod[\\/]v4[\\/](?:core|classic|mini)[\\/][^\\/]+$/;
const englishOnlyLocales = path.join(__dirname, 'src/lib/zod-locales.ts');

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '../locales/index.js' && zodLocaleIndex.test(context.originModulePath)) {
    return { type: 'sourceFile', filePath: englishOnlyLocales };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
