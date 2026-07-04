import { PowerSyncDatabase } from '@powersync/react-native';
import { OPSqliteOpenFactory } from '@powersync/op-sqlite'; // Add this import
import { AppSchema } from './AppSchema';
import { Connector } from './Connector';

// Create the factory
const opSqlite = new OPSqliteOpenFactory({
	dbFilename: 'powersync.db'
});

export const powersync = new PowerSyncDatabase({
	// For other options see,
	schema: AppSchema,
	// Override the default database
	database: opSqlite
});

export const setupPowerSync = async () => {
	// Uses the backend connector that will be created in the next section
	await powersync.connect(new Connector());
	console.log(`setupPowerSync: PowerSync connected ${powersync.connected}`);
};