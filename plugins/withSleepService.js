// CommonJS config plugin to avoid TS/ESM runtime issues during prebuild
const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

/** @type {import('expo/config-plugins').ConfigPlugin} */
function withSleepService(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;

    // Ensure tools namespace
    manifest.$ = manifest.$ || {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Ensure permissions
    const perms = [
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.PACKAGE_USAGE_STATS',
    ];
    manifest.usesPermissions = manifest.usesPermissions || [];
    perms.forEach((p) => {
      const has = manifest.usesPermissions.some(
        (up) => (up.$ && up.$['android:name'] === p) || up.name === p
      );
      if (!has) {
        const attr = { 'android:name': p };
        if (p.includes('PACKAGE_USAGE_STATS')) {
          attr['tools:ignore'] = 'ProtectedPermissions';
        }
        manifest.usesPermissions.push({ $: attr });
      }
    });

    // Ensure service
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app.service = app.service || [];
    const svcName = '.SleepTrackingService';
    const hasService = app.service.some((s) => s.$ && s.$['android:name'] === svcName);
    if (!hasService) {
      app.service.push({
        $: {
          'android:name': svcName,
          'android:exported': 'false',
          'android:foregroundServiceType': 'dataSync',
        },
      });
    }

    cfg.modResults = manifest;
    return cfg;
  });
}

module.exports = withSleepService;


