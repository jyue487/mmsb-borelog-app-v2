import { PowerSyncDatabase, createConsoleLogger } from '@powersync/react-native';
import { AppSchema } from './AppSchema';
import { Connector } from './Connector';

// SDK v2 removed createBaseLogger along with the js-logger dependency.
export const logger = createConsoleLogger();

export const powersync = new PowerSyncDatabase({
	schema: AppSchema,
	// v2 bundles op-sqlite and builds the factory itself, so this takes the
	// options directly where v1 needed an OPSqliteOpenFactory instance.
	database: {
		dbFilename: 'powersync.db',
	},
	logger,
});

export const setupPowerSync = async () => {
	await powersync.connect(new Connector());
	console.log(`setupPowerSync: PowerSync connected ${powersync.connected}`);
};
