// src/app/models/migration-report.ts
// This file now exclusively defines the MigrationReport interface,
// as it's a common outcome DTO shared across the frontend.
// Other DTOs for API requests are moved to migration.service.ts for clarity.

export interface MigrationReport {
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'UNKNOWN' | string; // e.g., "SUCCESS", "PARTIAL_SUCCESS", "FAILED"
  totalSourceRowsProcessed: number;
  rowsMigratedInserted: number;
  rowsMigratedUpdated: number;
  rowsSkippedDueToPrimaryKeyConflict: number;
  rowsSkippedDueToNoMapping: number;
  messages: string[]; // Detailed logs/warnings
  errors?: string[]; // Critical errors
}
