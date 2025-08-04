// src/app/mock-dtos/backend-dtos.model.ts
// This file contains DTOs that are specifically structured to match
// the Java DTOs for backend API calls (e.g., startMigration request/response).

// Matches com.example.dynamic_migration_engine.mock.model.ColumnMappingDto.java
// export interface ColumnMappingDto {
//   sourceColumnName: string;
//   secondarySourceColumnName?: string | null; // NEW: Field for secondary source column
//   destinationColumnName: string;
//   transformationType?: string | null; // Optional field for the transformation to apply
//   customSqlExpression?: string | null; // Optional field for custom SQL/command
// }

// // Matches com.example.dynamic_migration_engine.mock.model.MigrationInitiationRequest.java
// export interface MigrationInitiationRequest {
//   sourceDatabaseName: string;
//   sourceTableName: string;
//   destinationDatabaseName: string;
//   destinationTableName: string;
//   columnMappings: ColumnMappingDto[];
// }

// // NEW: Matches com.example.dynamic_migration_engine.mock.model.MigrationReport.java
// export interface MigrationReport {
//   status: 'SUCCESS' | 'FAILED' | 'PARTIAL_SUCCESS';
//   totalSourceRowsProcessed: number;
//   rowsMigratedInserted: number;
//   rowsMigratedUpdated: number;
//   rowsSkippedDueToPrimaryKeyConflict: number;
//   rowsSkippedDueToNoMapping: number;
//   rowsSkippedDueToIdenticalData: number;
//   messages: string[];
//   errors: string[];
// }
