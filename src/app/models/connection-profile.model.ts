// src/app/models/connection-profile.model.ts

export interface ConnectionProfile {
  id?: number;
  name: string;
  dbType: string;
  jdbcUrl: string;
  username: string;
  password?: string;
  schemaFilePath?: string;
  dataFilePath?: string | null;
}