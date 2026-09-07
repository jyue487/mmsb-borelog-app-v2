import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT ?? "production";

  const isDevelopment = variant === "development";
  const isPreview = variant === "preview";
  const isPublic = variant === "public";

  // The production identity is deliberately NOT the old app's
  // (com.jyue487.mmsbborelogapp). That app is the pre-PowerSync, local-only
  // version, and reusing its id would replace it on every phone and orphan the
  // mmsb.db data behind a login screen. A distinct id installs alongside it so
  // crews migrate at their own checkpoint. See docs/launch-checklist.md 3.1.
  //
  // There are *two* production identities, because a single Play entry cannot
  // serve both audiences: "com.mmsb.borelog" is the managed Google Play private
  // app on company tablets, "com.mmsb.borelog.pub" the public listing for
  // personal phones. A Play package name is globally unique and immutable, so
  // the second audience needs a second id, not a second track.
  //
  // Both ship the same JS. fingerprint.config.js excludes the application id
  // from the fingerprint, so the two builds compile to one runtime version and
  // a single `eas update --branch production` reaches both. That file is
  // load-bearing for this pairing -- read its comment before touching it.
  //
  // The suffix is ".pub" rather than ".public" because expo writes
  // android.package into gradle's `namespace` as well as its `applicationId`,
  // and AGP rejects a namespace whose segment is a Java keyword: "Namespace
  // 'com.mmsb.borelog.public' is not a valid Java package name as 'public'
  // is a Java keyword". That fails at Gradle configure, before Play sees it.
  let appName = "MMSB Borelog";
  let bundleId = "com.mmsb.borelog";

  if (isDevelopment) {
    appName = "MMSB Borelog (Dev)";
    bundleId = "com.mmsb.borelog.dev";
  } else if (isPreview) {
    appName = "MMSB Borelog (Preview)";
    bundleId = "com.mmsb.borelog.preview";
  } else if (isPublic) {
    // appName is deliberately left at the production value. The display name is
    // still part of the fingerprint (fingerprint.config.js does not skip
    // ExpoConfigNames), and matching names are what let these two identities
    // collapse onto one runtime version while development and preview keep
    // their own.
    bundleId = "com.mmsb.borelog.pub";
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
      // Turns off Expo's network inspector, which is otherwise on by default.
      // Its OkHttp network interceptor peeks every response body
      // (ExpoNetworkInspectOkHttpNetworkInterceptor -> peekResponseBody), and
      // that peek blocks the interceptor chain until 1 MB has arrived or the
      // stream ends. PowerSync's /sync/stream never does either, so OkHttp
      // never delivered onResponse, expo/fetch never resolved, and sync sat at
      // connecting: true forever with an empty local database and no error.
      //
      // The guard that is supposed to skip streams, shouldParseBody(), only
      // recognises `Transfer-Encoding: chunked` -- a header HTTP/2 never sends,
      // and every host here is HTTP/2. It also skips only text/event-stream,
      // not PowerSync's application/vnd.powersync.bson-stream.
      //
      // This is why it started with the SDK v2 migration (c6ae1fd): v1 defaulted
      // to WebSocket, v2 defaults to HTTP streaming when expo/fetch is present.
      // Disabling the inspector keeps the preferred HTTP transport and keeps
      // development on the same transport production uses.
      [
        "expo-build-properties",
        {
          android: { networkInspector: false },
          ios: { networkInspector: false },
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
