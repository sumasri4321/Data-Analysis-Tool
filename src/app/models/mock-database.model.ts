// src/app/models/mock-database.model.ts
// This file now directly re-exports types from migration-data.service.ts to ensure consistency.

export type {
  Column as MockColumn,
  MockTable,
  MockDatabase,
  TableDataResponse,
  ColumnMappingDto
} from '../services/migration-data.service';

// If you have any interfaces *only* defined in this file and not in migration-data.service.ts,
// you would define them here. Otherwise, this file can be purely for re-exports.
