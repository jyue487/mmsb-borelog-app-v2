import { AttachmentTable, column, Schema, Table } from '@powersync/react-native';

const projects = new Table(
  {
    // id column (text) is automatically included
    code: column.text,
    title: column.text,
    location: column.text,
    client: column.text,
    consultant: column.text,
    created_at: column.text,
    created_by: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
    deleted_by: column.text
  },
  { indexes: {} }
);

const boreholes = new Table(
  {
    // id column (text) is automatically included
    project_id: column.text,
    name: column.text,
    type_of_boring: column.text,
    type_of_rig: column.text,
    diameter_of_boring: column.text,
    easting_in_metres: column.real,
    northing_in_metres: column.real,
    reduced_level_in_metres: column.real,
    driller_name: column.text,
    verifier_name: column.text,
    verifier_signature_base64: column.text,
    verifier_sign_date: column.text,
    created_at: column.text,
    created_by: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
    deleted_by: column.text
  },
  { indexes: {} }
);

const borehole_to_user = new Table(
  {
    id: column.text,
    borehole_id: column.text,
    user_id: column.text,
    created_at: column.text,
    created_by: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
    deleted_by: column.text
  },
  { indexes: {} }
);

const block_types = new Table(
  {
    // id column (text) is automatically included
    name: column.text,
    created_at: column.text,
    created_by: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
    deleted_by: column.text
  },
  { indexes: {} }
);

const blocks = new Table(
  {
    // id column (text) is automatically included
    borehole_id: column.text,
    block_type_id: column.integer,
    payload: column.text,
    created_at: column.text,
    created_by: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
    deleted_by: column.text
  },
  { indexes: {} }
);

export const AppSchema = new Schema({
  projects,
  boreholes,
  borehole_to_user,
  block_types,
  blocks,
  attachments: new AttachmentTable()
});

export type Database = (typeof AppSchema)['types'];

