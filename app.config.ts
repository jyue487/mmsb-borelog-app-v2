import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT ?? "production";

  const isDevelopment = variant === "development";
  const isPreview = variant === "preview";

  let appName = "mmsb-borelog-app";
  let androidPackage = "com.jyue487.mmsbborelogapp";

  if (isDevelopment) {
    appName = "mmsb-borelog-app-dev";
    androidPackage = "com.jyue487.mmsbborelogapp.dev";
  } else if (isPreview) {
    appName = "mmsb-borelog-app-preview";
    androidPackage = "com.jyue487.mmsbborelogapp.preview";
  }

  return {
    ...config,
    name: appName,
    slug: "mmsb-borelog-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mmsbborelogapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      ...config.ios,
      supportsTablet: true,
      bundleIdentifier:
        isDevelopment
          ? "com.jyue487.mmsbborelogapp.dev"
          : isPreview
          ? "com.jyue487.mmsbborelogapp.preview"
          : "com.jyue487.mmsbborelogapp",
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff",
      },
      allowBackup: false,
      edgeToEdgeEnabled: true,
      package: androidPackage,
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
