import { AndroidConfig, ConfigPlugin, withAndroidManifest } from "expo/config-plugins";

const withSleepService: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults as any;

    // Ensure tools namespace for attributes like tools:ignore
    manifest.$ = manifest.$ || {};
    if (!manifest.$["xmlns:tools"]) {
      manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    // Ensure permissions
    const perms = [
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.PACKAGE_USAGE_STATS",
    ];
    manifest.usesPermissions = manifest.usesPermissions || [];
    perms.forEach((p) => {
      const has = manifest.usesPermissions.some((up: any) => up.$?.["android:name"] === p || up.name === p);
      if (!has) {
        const attr: any = { "android:name": p };
        if (p.includes("PACKAGE_USAGE_STATS")) {
          attr["tools:ignore"] = "ProtectedPermissions";
        }
        manifest.usesPermissions.push({ $: attr });
      }
    });

    // Ensure service
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app.service = app.service || [];
    const svcName = ".SleepTrackingService";
    const hasService = app.service.some((s: any) => s.$?.["android:name"] === svcName);
    if (!hasService) {
      app.service.push({
        $: {
          "android:name": svcName,
          "android:exported": "false",
          "android:foregroundServiceType": "dataSync",
        },
      } as any);
    }

    cfg.modResults = manifest;
    return cfg;
  });
};

export default withSleepService;