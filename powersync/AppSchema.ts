import { Schema } from '@powersync/react-native';

import { projects } from '@/powersync/schemas/projects';
import { boreholes } from '@/powersync/schemas/boreholes';

export const AppSchema = new Schema({
    projects,
    // boreholes,
});

export type Database = (typeof AppSchema)['types'];
export type ProjectRecord = Database['projects'];
// export type BoreholeRecord = Database['boreholes'];
