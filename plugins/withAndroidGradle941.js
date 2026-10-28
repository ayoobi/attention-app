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
 * AGP 9 rejects getDefaultProguardFile('proguard-android.txt'). Rewrite the
 * default ProGuard file argument (and any `proguardDefaultFile` assignment) to
 * `proguard-android-optimize.txt` in android/app/build.gradle.
 * @param {string} contents
 * @returns {string}
 */
function rewriteProguardDefaultFile(contents) {
  let next = contents.replace(
    /getDefaultProguardFile\(\s*(['"])proguard-android\.txt\1\s*\)/g,
    'getDefaultProguardFile($1proguard-android-optimize.txt$1)'
  );
  // Variable form used by some templates / local edits, e.g.
  // def proguardDefaultFile = "proguard-android.txt"
  next = next.replace(
    /(proguardDefaultFile\s*=\s*)(['"])proguard-android\.txt\2/g,
    '$1$2proguard-android-optimize.txt$2'
  );
  return next;
}

/**
 * Pins Android Gradle Wrapper to 9.4.1 (required by RN 0.88 / AGP), removes
 * unsupported `newArchEnabled=false`, and opts out of AGP 9 built-in Kotlin /
 * new DSL so Expo/RN/Vision Camera can keep applying
 * `org.jetbrains.kotlin.android` without the duplicate `kotlin` extension error.
 *
 * Also disables Jetifier (AndroidX-only; Jetifier is deprecated) and rewrites
 * the AGP 9–unsupported ProGuard default file to `proguard-android-optimize.txt`.
 */
function withAndroidGradle941(config) {
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const wrapperPath = path.join(
        root,
        'gradle',
        'wrapper',
        'gradle-wrapper.properties'
      );
      if (fs.existsSync(wrapperPath)) {
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
      }

      const appGradlePath = path.join(root, 'app', 'build.gradle');
      if (fs.existsSync(appGradlePath)) {
        const original = fs.readFileSync(appGradlePath, 'utf8');
        const next = rewriteProguardDefaultFile(original);
        if (next !== original) {
          fs.writeFileSync(appGradlePath, next);
        }
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
  '1.2.0'
);
