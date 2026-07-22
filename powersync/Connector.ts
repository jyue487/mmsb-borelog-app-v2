import { PowerSyncBackendConnector, AbstractPowerSyncDatabase, UpdateType, PowerSyncCredentials } from "@powersync/react-native"

import { supabase } from "@/db/supabase";

export class Connector implements PowerSyncBackendConnector {
  /**
  * Implement fetchCredentials to obtain a JWT from your authentication service.
  * See https://docs.powersync.com/configuration/auth/custom
  */
  async fetchCredentials() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error}`);
    }

    console.debug('session expires at', session.expires_at);

    return {
      // The PowerSync instance URL or self-hosted endpoint
      endpoint: 'https://6a34ef0b35ca576ca0dde705.powersync.journeyapps.com',
      /**
      * To get started quickly, use a development token, see:
      * Authentication Setup https://docs.powersync.com/configuration/auth/development-tokens) to get up and running quickly
      */
      token: session.access_token ?? ''
    } satisfies PowerSyncCredentials;
  }

  /**
  * Implement uploadData to send local changes to your backend service.
  * You can omit this method if you only want to sync data from the database to the client
  * See example implementation here:https://docs.powersync.com/client-sdks/reference/react-native-and-expo#3-integrate-with-your-backend
  */
  async uploadData(database: AbstractPowerSyncDatabase) {

    /**
    * For batched crud transactions, use data.getCrudBatch(n);
    * https://powersync-ja.github.io/powersync-js/react-native-sdk/classes/SqliteBucketStorage#getcrudbatch
    */
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    try {
      for (const op of transaction.crud) {
        // The data that needs to be changed in the remote db
        const table = supabase.from(op.table);
        let result: any = null;
        switch (op.op) {
          case UpdateType.PUT:
            // TODO: Instruct your backend API to CREATE a record
            if (!op.opData) {
              throw new Error(`PATCH missing opData for ${op.table}:${op.id}`);
            }
            const record = { ...op.opData, id: op.id };
            console.log("Uploading record:", record);
            result = await table.upsert(record);
            break;
          case UpdateType.PATCH:
            // TODO: Instruct your backend API to PATCH a record
            if (!op.opData) {
              throw new Error(`PATCH missing opData for ${op.table}:${op.id}`);
            }
            console.log("Updating record:", { ...op.opData, id: op.id });
            result = await table.update(op.opData).eq('id', op.id);
            break;
          case UpdateType.DELETE:
            //TODO: Instruct your backend API to DELETE a record
            console.log("Deleting record:", { ...op.opData, id: op.id });
            result = await table.delete().eq('id', op.id);
            break;
        }

        if (result.error) {
          console.error('Supabase upload error:', {
            table: op.table,
            op: op.op,
            id: op.id,
            error: result.error,
          });
          throw new Error(
            `Could not ${op.op} data to Supabase table "${op.table}" with id "${op.id}": ${result.error.message}`
          );
        }
      }

      // Completes the transaction and moves onto the next one
      await transaction.complete();
    } catch (error) {
      console.error('PowerSync upload failed:', error);
      // alert(`PowerSync upload failed: ${error}`);

      // Important:
      // Do NOT call transaction.complete() if upload failed.
      // Throwing lets PowerSync retry later.
      throw error;
    }
  }
}