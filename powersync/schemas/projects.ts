import { column, Table } from '@powersync/react-native';

export const projects = new Table({
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
  deleted_by: column.text,
});
