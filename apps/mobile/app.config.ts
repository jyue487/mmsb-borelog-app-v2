import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT ?? "production";

  const isDevelopment = variant === "development";
  const isPreview = variant === "preview";

  // The production identity is deliberately NOT the old app's
  // (com.jyue487.mmsbborelogapp). That app is the pre-PowerSync, local-only
  // version, and reusing its id would replace it on every phone and orphan the
  // mmsb.db data behind a login screen. A distinct id installs alongside it so
  // crews migrate at their own checkpoint. See docs/launch-checklist.md 3.1.
  let appName = "MMSB Borelog";
  let bundleId = "com.mmsb.borelog";

  if (isDevelopment) {
    appName = "MMSB Borelog (Dev)";
    bundleId = "com.mmsb.borelog.dev";
  } else if (isPreview) {
    appName = "MMSB Borelog (Preview)";
    bundleId = "com.mmsb.borelog.preview";
  }

  return {
    ...config,
    name: appName,
    slug: "mmsb-borelog-app",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    // Distinct from the old app's "mmsbborelogapp": two installed apps claiming
    // one scheme makes Android show a chooser on every deep link.
    scheme: "mmsbborelog",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    // "fingerprint" hashes the native project, so the runtime version changes
    // automatically whenever a native dependency does. That makes it impossible
    // to push a JS-only update onto a binary that cannot run it — the failure
    // mode "appVersion" allows if you forget to bump the version string.
    runtimeVersion: {
      policy: "fingerprint",
    },
    updates: {
      url: "https://u.expo.dev/869450ab-0034-4d2d-986e-3b9b63260e70",
      // Never block startup on a network check. The app is used underground and
      // on sites with no signal; it must open instantly from the cached bundle
      // and fetch any update in the background, applying it on the next launch.
      fallbackToCacheTimeout: 0,
    },
    ios: {
      ...config.ios,
      supportsTablet: true,
      bundleIdentifier: bundleId,
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff",
      },
      allowBackup: false,
      edgeToEdgeEnabled: true,
      package: bundleId,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-sqlite",
      "expo-font",
      "expo-asset",
      "@react-native-vector-icons/material-icons",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "869450ab-0034-4d2d-986e-3b9b63260e70",
      },
    },
  };
}
