import { column, Table } from '@powersync/react-native';

export const boreholes = new Table(
  {
    project_id: column.text,
    name: column.text,
    type_of_boring: column.text,
    type_of_rig: column.text,
    diameter_of_boring: column.text,
    easting_in_metres: column.real,
    northing_in_metres: column.real,
    reduced_level_in_metres: column.real,
    driller_user_id: column.text,
    driller_name: column.text,
    verifier_name: column.text,
    verifier_signature_base64: column.text,
    verifier_sign_date: column.text,
    created_at: column.text,
    created_by: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
    deleted_by: column.text,
  },
  {
    indexes: {
      project: ['project_id'],
      driller: ['driller_user_id'],
    },
  }
);

