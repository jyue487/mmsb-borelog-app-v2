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

// connect() resolves once the sync stream has been *started*, not once it is
// established, so powersync.connected is normally still false on the next line.
// This listener reports the transitions that follow, and surfaces the download
// and upload errors that otherwise fail silently and look like data loss.
powersync.registerListener({
	statusChanged: (status) => {
		console.log('PowerSync status', {
			connected: status.connected,
			connecting: status.connecting,
			hasSynced: status.hasSynced,
			lastSyncedAt: status.lastSyncedAt?.toISOString(),
			downloading: status.downloading,
			uploading: status.uploading,
			downloadError: status.downloadError?.message,
			uploadError: status.uploadError?.message,
		});
	},
});

export const setupPowerSync = async () => {
	await powersync.connect(new Connector());
	console.log(`setupPowerSync: PowerSync connected ${powersync.connected}`);
};
