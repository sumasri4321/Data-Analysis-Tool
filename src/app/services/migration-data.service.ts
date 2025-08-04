// src/app/services/migration-data.service.ts
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js'; // IMPORT CryptoJS

// --- Connection and Status Interfaces ---
export interface ConnectionStatusResponse {
  success: boolean | null;
  message: string;
}

export interface DbConnectionParams {
  hostname: string;
  port: number;
  databaseType: string;
  databaseName: string;
  username: string;
  password?: string; // Optional for persistence, but required for sending to backend
}

// --- Core Database Schema Interfaces (Unified to match Backend) ---
export interface Column {
  id: string;
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isNullable: boolean;
  parentTableName: string;
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Database {
  name: string;
  type: string;
  tables: Table[];
}

export interface DisplayTable {
  name: string;
  columns: Column[];
}

// --- Data Preview Interfaces ---
export interface TableData {
  headers: string[];
  rows: { [key: string]: any }[];
  totalRows: number;
}

export interface ColumnMetadata {
  name: string;
  dataType: string;
}

export interface TableDataResponse {
  columns: ColumnMetadata[];
  rows: { [key: string]: any }[];
  totalRows: number;
}

// --- Migration Mapping and Report Interfaces ---
export interface ColumnMapping {
  sourceColumn: Column | null;
  secondarySourceColumn?: Column | null;
  destinationColumn: Column | null;
  transformationMode: 'NONE' | 'SUGGESTED' | 'CUSTOM_COMMAND';
  suggestedTransformationType?: 'CONCAT_FIRST_LAST_NAME_AUTO' | 'AGE_TO_DATE_OF_BIRTH' | 'ADD_INDIAN_COUNTRY_CODE' | null;
  customCommand?: string;
  isValid: boolean;
  validationMessage?: string;
}

export interface ColumnMappingDto {
  sourceColumnName: string | null;
  secondarySourceColumnName?: string | null;
  destinationColumnName: string | null;
  transformationType?: string | null;
  transformationParameter?: string | null;
}

export interface MigrationInitiationRequest {
  sourceDatabaseName: string;
  sourceTableName: string;
  destinationDatabaseName: string;
  destinationTableName: string;
  columnMappings: ColumnMappingDto[];
}

export interface MigrationReport {
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL_SUCCESS';
  totalSourceRowsProcessed: number;
  rowsMigratedInserted: number;
  rowsMigratedUpdated: number;
  rowsSkippedDueToPrimaryKeyConflict: number;
  rowsSkippedDueToNoMapping: number;
  rowsSkippedDueToIdenticalData: number;
  messages: string[];
  errors: string[];
  executedQueries?: string[]; // NEW: SQL queries executed during migration
}

// --- SQL Executor Interfaces ---
export interface SqlExecutionRequest {
  databaseName: string;
  sqlQuery: string;
}

export interface SqlExecutionResponse {
  success: boolean;
  message: string;
  rowCount?: number;
  queryResult?: TableDataResponse;
}

// --- Persistence and State Management Interfaces ---
export interface PersistedMigrationConfig {
  sourceDbParams: Omit<DbConnectionParams, 'password'> & { password?: string } | null;
  destinationDbParams: Omit<DbConnectionParams, 'password'> & { password?: string } | null;
  selectedSourceTableName: string | null;
  selectedDestinationTableName: string | null;
  columnMappings: (Omit<ColumnMapping, 'isValid' | 'validationMessage'> & { customCommand?: string | null })[];
}

// Full configuration state, including in-memory schemas (not persisted)
export interface MigrationConfigurationState {
  sourceDbParams: DbConnectionParams | null;
  destinationDbParams: DbConnectionParams | null;
  sourceSchema: DisplayTable[] | null;
  destinationSchema: DisplayTable[] | null;
  selectedSourceTableName: string | null;
  selectedDestinationTableName: string | null;
  columnMappings: ColumnMapping[];
}

// --- ML Suggestion Interfaces ---
export interface MlMappingSuggestion {
  sourceColumnName: string;
  destinationColumnName: string;
  confidence: number;
  suggestionType: string;
  reasoning?: string;
}

export interface DatabaseWithMlSuggestions extends Database {
  mlSuggestions?: MlMappingSuggestion[];
}


@Injectable({
  providedIn: 'root'
})
export class MigrationDataService {
  // IMPORTANT: Encryption key for localStorage. Must match backend's CryptoUtil.SECRET_KEY.
  private encryptionKey = 'SixteenByteKey!!';

  private migrationConfiguration: MigrationConfigurationState = {
    sourceDbParams: null,
    destinationDbParams: null,
    sourceSchema: null,
    destinationSchema: null,
    selectedSourceTableName: null,
    selectedDestinationTableName: null, // ADDED: Initialize here
    columnMappings: []
  };

  private migrationReport: MigrationReport | null = null;

  constructor() {
    this.loadStateFromLocalStorage();
  }

  // --- Encryption/Decryption Utility (for localStorage) ---
  private encrypt(text: string): string {
    if (!text) {
      return '';
    }
    // Using default AES.encrypt behavior which uses OpenSSL KDF (generates salt and prepends "Salted__")
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  private decrypt(encryptedText: string): string {
    if (!encryptedText) {
      return '';
    }
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error("Decryption from localStorage failed:", e);
      return '';
    }
  }

  // Load state from localStorage
  private loadStateFromLocalStorage(): void {
    const savedConfig = localStorage.getItem('migrationConfig');
    if (savedConfig) {
      try {
        const parsedConfig: PersistedMigrationConfig = JSON.parse(savedConfig);

        this.migrationConfiguration = {
          sourceDbParams: parsedConfig.sourceDbParams ? {
            ...parsedConfig.sourceDbParams,
            password: '' // Don't load passwords from localStorage - require manual entry
          } : null,
          destinationDbParams: parsedConfig.destinationDbParams ? {
            ...parsedConfig.destinationDbParams,
            password: '' // Don't load passwords from localStorage - require manual entry
          } : null,
          sourceSchema: null, // Schemas are NOT persisted
          destinationSchema: null, // Schemas are NOT persisted
          selectedSourceTableName: parsedConfig.selectedSourceTableName,
          selectedDestinationTableName: parsedConfig.selectedDestinationTableName,
          columnMappings: parsedConfig.columnMappings ? parsedConfig.columnMappings.map(m => ({
            sourceColumn: m.sourceColumn || null,
            secondarySourceColumn: m.secondarySourceColumn || null,
            destinationColumn: m.destinationColumn || null,
            transformationMode: m.transformationMode || 'NONE',
            suggestedTransformationType: m.suggestedTransformationType || null,
            customCommand: m.customCommand || '',
            isValid: false, // Re-validate on load
            validationMessage: '' // Re-validate on load
          })) : []
        };
      } catch (e) {
        console.error("Failed to parse or decrypt migration config from localStorage:", e);
        localStorage.removeItem('migrationConfig'); // Clear corrupted data
      }
    }
  }

  // Save state to localStorage (excluding passwords for security)
  private saveStateToLocalStorage(): void {
    const configToSave: PersistedMigrationConfig = {
      sourceDbParams: this.migrationConfiguration.sourceDbParams ? {
        ...this.migrationConfiguration.sourceDbParams,
        password: '' // Don't persist passwords - require manual entry each time
      } : null,
      destinationDbParams: this.migrationConfiguration.destinationDbParams ? {
        ...this.migrationConfiguration.destinationDbParams,
        password: '' // Don't persist passwords - require manual entry each time
      } : null,
      selectedSourceTableName: this.migrationConfiguration.selectedSourceTableName,
      selectedDestinationTableName: this.migrationConfiguration.selectedDestinationTableName,
      columnMappings: this.migrationConfiguration.columnMappings.map(m => ({
        sourceColumn: m.sourceColumn,
        secondaryColumn: m.secondarySourceColumn,
        destinationColumn: m.destinationColumn,
        transformationMode: m.transformationMode,
        suggestedTransformationType: m.suggestedTransformationType,
        customCommand: m.customCommand
      }))
    };
    localStorage.setItem('migrationConfig', JSON.stringify(configToSave));
  }

  // --- Getters and Setters for MigrationConfigurationState ---

  getMigrationConfiguration(): MigrationConfigurationState {
    return JSON.parse(JSON.stringify(this.migrationConfiguration));
  }

  setMigrationConfiguration(config: MigrationConfigurationState): void {
    this.migrationConfiguration = { ...config };
    this.saveStateToLocalStorage();
  }

  setSourceDbParams(params: DbConnectionParams): void {
    this.migrationConfiguration.sourceDbParams = { ...params };
    this.saveStateToLocalStorage();
  }

  setDestinationDbParams(params: DbConnectionParams): void {
    this.migrationConfiguration.destinationDbParams = { ...params };
    this.saveStateToLocalStorage();
  }

  setSourceSchema(schema: DisplayTable[]): void {
    this.migrationConfiguration.sourceSchema = [...schema];
  }

  setDestinationSchema(schema: DisplayTable[]): void {
    this.migrationConfiguration.destinationSchema = [...schema];
  }

  setSelectedSourceTableName(tableName: string): void {
    this.migrationConfiguration.selectedSourceTableName = tableName;
    this.saveStateToLocalStorage();
  }

  setSelectedDestinationTableName(tableName: string): void {
    this.migrationConfiguration.selectedDestinationTableName = tableName;
    this.saveStateToLocalStorage();
  }

  setColumnMappings(mappings: ColumnMapping[]): void {
    this.migrationConfiguration.columnMappings = mappings.map(m => ({ ...m }));
    this.saveStateToLocalStorage();
  }

  // --- Getters and Setters for MigrationReport ---

  getMigrationReport(): MigrationReport | null {
    return this.migrationReport;
  }

  setMigrationReport(report: MigrationReport): void {
    this.migrationReport = report;
  }

  clearAllData(): void {
    this.migrationConfiguration = {
      sourceDbParams: null,
      destinationDbParams: null,
      sourceSchema: null,
      destinationSchema: null,
      selectedSourceTableName: null,
      selectedDestinationTableName: null, // ADDED: Initialize here
      columnMappings: []
    };
    this.migrationReport = null;
    localStorage.removeItem('migrationConfig');
  }
}
