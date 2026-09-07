// Two production apps ship from this project: "com.mmsb.borelog", the managed
// Google Play private app on company tablets, and "com.mmsb.borelog.pub", the
// public listing for personal phones (see app.config.ts). They must run the
// identical JS bundle.
//
// EAS Update matches a binary by runtime version, and under
// `runtimeVersion: { policy: "fingerprint" }` that hash covers the whole
// normalized Expo config -- the application id included. Left alone, the two
// AABs compile to different runtime versions and one `eas update` reaches only
// one of them. The app *version* string has nothing to do with it.
//
// An application id does not change whether a JS bundle can run, so excluding
// it is exactly what these skips are for. Everything the fingerprint exists to
// catch -- a new native dependency, a config plugin, a changed icon -- still
// moves both apps together.
//
// Three things about this file are easy to get wrong:
//
//   1. `sourceSkips` here REPLACES @expo/fingerprint's default rather than
//      adding to it: normalizeOptionsAsync() spreads the loaded config over the
//      defaults. So PackageJsonAndroidAndIosScriptsIfNotContainRun -- the
//      default, and the reason a fingerprint is stable across prebuild -- has
//      to be repeated below or it is silently dropped.
//
//   2. ExpoConfigNames is deliberately NOT skipped. Both production apps share
//      the display name "MMSB Borelog" and collapse anyway, while development
//      ("MMSB Borelog (Dev)") and preview keep runtime versions of their own on
//      the strength of their names alone. Skipping names would merge all four
//      variants for no gain.
//
//   3. Deleting or narrowing this file silently re-splits the two apps, and one
//      of them stops receiving updates with no error anywhere. That is not
//      recoverable over the air: `eas update` has no --runtime-version flag and
//      eas-cli does not honour EXPO_UPDATES_FINGERPRINT_OVERRIDE, so a binary
//      carrying an orphaned hash can only be fixed by a store release.
//
// CommonJS on purpose -- @expo/fingerprint require()s this file, and
// package.json here declares no "type": "module".
module.exports = {
  sourceSkips: [
    "PackageJsonAndroidAndIosScriptsIfNotContainRun",
    "ExpoConfigAndroidPackage",
    "ExpoConfigIosBundleIdentifier",
  ],
};
