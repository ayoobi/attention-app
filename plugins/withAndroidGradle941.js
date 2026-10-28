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
 * Pins Android Gradle Wrapper to 9.4.1 (required by RN 0.88 / AGP) and removes
 * unsupported `newArchEnabled=false` so `expo prebuild` cannot regress the wrapper.
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
    return cfg;
  });

  return config;
}

module.exports = createRunOncePlugin(
  withAndroidGradle941,
  'withAndroidGradle941',
  '1.0.0'
);
