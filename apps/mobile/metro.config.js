// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// pnpm symlinks packages/* into apps/mobile/node_modules, but the real files live under
// the workspace root. Metro must watch the real location or edits to @mmsb/core and
// @mmsb/report are invisible to fast refresh and, worse, to EAS bundling.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, 'node_modules'),
	path.resolve(workspaceRoot, 'node_modules'),
];

// Deliberately NOT setting `resolver.disableHierarchicalLookup = true`. It appears in most
// pnpm + Metro recipes, but with pnpm's isolated linker it can break transitive resolution,
// and this install already works without it. Add it only if a real "module not found" or
// duplicate-React error shows up.

module.exports = config;
