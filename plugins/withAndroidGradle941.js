const {
  createRunOncePlugin,
  withDangerousMod,
  withGradleProperties,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const GRADLE_VERSION = '9.4.1';
const DISTRIBUTION_URL = `https\\://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip`;

/**
 * Upsert a gradle.properties key (property entries only).
 * @param {import('@expo/config-plugins').GradlePropertiesItem[]} items
 * @param {string} key
 * @param {string} value
 */
function upsertGradleProperty(items, key, value) {
  const idx = items.findIndex(
    (item) => item.type === 'property' && item.key === key
  );
  if (idx >= 0) {
    items[idx] = { type: 'property', key, value };
  } else {
    items.push({ type: 'property', key, value });
  }
}

/**
 * Pins Android Gradle Wrapper to 9.4.1 (required by RN 0.88 / AGP), removes
 * unsupported `newArchEnabled=false`, and opts out of AGP 9 built-in Kotlin /
 * new DSL so Expo/RN/Vision Camera can keep applying
 * `org.jetbrains.kotlin.android` without the duplicate `kotlin` extension error.
 *
 * Also disables Jetifier (AndroidX-only; Jetifier is deprecated).
 */
function withAndroidGradle941(config) {
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const wrapperPath = path.join(
        cfg.modRequest.platformProjectRoot,
        'gradle',
        'wrapper',
        'gradle-wrapper.properties'
      );
      if (!fs.existsSync(wrapperPath)) {
        return cfg;
      }
      const original = fs.readFileSync(wrapperPath, 'utf8');
      let next = original;
      if (/^distributionUrl=.+$/m.test(next)) {
        next = next.replace(
          /^distributionUrl=.+$/m,
          `distributionUrl=${DISTRIBUTION_URL}`
        );
      } else {
        next = `${next.trimEnd()}\ndistributionUrl=${DISTRIBUTION_URL}\n`;
      }
      if (next !== original) {
        fs.writeFileSync(wrapperPath, next);
      }
      return cfg;
    },
  ]);

  config = withGradleProperties(config, (cfg) => {
    cfg.modResults = cfg.modResults.filter((item) => {
      if (item.type !== 'property') {
        return true;
      }
      // RN 0.82+ is New Architecture only; `newArchEnabled=false` is ignored/warns.
      if (item.key === 'newArchEnabled' && String(item.value) === 'false') {
        return false;
      }
      return true;
    });

    // AGP 9 registers a built-in `kotlin` extension. Expo app + Vision Camera
    // still `apply plugin: "org.jetbrains.kotlin.android"`, which fails unless
    // we keep the RN/community bridge opt-outs (removed in AGP 10).
    upsertGradleProperty(cfg.modResults, 'android.builtInKotlin', 'false');
    upsertGradleProperty(cfg.modResults, 'android.newDsl', 'false');

    // Optional cleanup: Jetifier is deprecated; this app is AndroidX-only.
    upsertGradleProperty(cfg.modResults, 'android.enableJetifier', 'false');

    return cfg;
  });

  return config;
}

module.exports = createRunOncePlugin(
  withAndroidGradle941,
  'withAndroidGradle941',
  '1.1.0'
);
