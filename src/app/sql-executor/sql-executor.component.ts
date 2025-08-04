// src/app/sql-executor/sql-executor.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MigrationService } from '../services/migration.service';
import {
  SqlExecutionRequest,
  SqlExecutionResponse,
  TableData,
  DisplayTable,
  DbConnectionParams,
  ConnectionStatusResponse,
  ColumnMetadata // Import ColumnMetadata for TableDataResponse
} from '../services/migration-data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-sql-executor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sql-executor.component.html',
  styleUrls: []
})
export class SqlExecutorComponent implements OnInit, OnDestroy { // Implement OnDestroy
  sqlQuery: string = '';
  selectedDatabase: string = 'InsuranceDB_PG'; // Default to source DB for easier testing
  databaseOptions: string[] = ['InsuranceDB_PG', 'ReinsuranceDB_PG']; // Hardcoded for now

  // Add dbParams to hold connection details for the selected database
  dbParams: DbConnectionParams = {
    hostname: 'localhost',
    port: 5432,
    databaseType: 'PostgreSQL', // Default type
    databaseName: 'InsuranceDB_PG', // Default to source DB name
    username: 'postgres',
    password: ''
  };

  executionResult: SqlExecutionResponse | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // For displaying tabular results
  resultHeaders: string[] = [];
  resultRows: { [key: string]: any }[] = [];
  totalResultRows: number = 0;
  rowCount: number | null = null; // <--- THIS IS THE MISSING LINE THAT NEEDS TO BE HERE!

  // Connection status properties
  sourceConnected: boolean = false;
  destinationConnected: boolean = false;
  currentDbConnected: boolean = false; // Tracks if the currently selected DB is connected
  connectionMessage: string | null = null; // Message for the connection status

  private subscriptions: Subscription = new Subscription(); // To manage subscriptions

  constructor(private migrationService: MigrationService) { }

  ngOnInit(): void {
    // Subscribe to connection status changes from the MigrationService
    this.subscriptions.add(this.migrationService.sourceConnectionStatus$.subscribe(status => {
      this.sourceConnected = status.success === true;
      this.updateConnectionStatus();
    }));

    this.subscriptions.add(this.migrationService.destinationConnectionStatus$.subscribe(status => {
      this.destinationConnected = status.success === true;
      this.updateConnectionStatus();
    }));

    // Initial update based on default selectedDatabase
    this.updateConnectionStatus();
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.unsubscribe();
  }

  /**
   * Updates the connection status for the currently selected database.
   * Called on init and when selectedDatabase or connection status changes.
   */
  updateConnectionStatus(): void {
    // Update dbParams based on selectedDatabase for consistent use
    if (this.selectedDatabase === 'InsuranceDB_PG') {
      this.dbParams.databaseName = 'InsuranceDB_PG';
      this.currentDbConnected = this.sourceConnected;
      this.connectionMessage = this.sourceConnected ? null : 'Source database not connected. Please configure and test connection on the Configure page.';
    } else if (this.selectedDatabase === 'ReinsuranceDB_PG') {
      this.dbParams.databaseName = 'ReinsuranceDB_PG';
      this.currentDbConnected = this.destinationConnected;
      this.connectionMessage = this.destinationConnected ? null : 'Destination database not connected. Please configure and test connection on the Configure page.';
    } else {
      this.currentDbConnected = false;
      this.connectionMessage = 'Unknown database selected.';
    }
    // Clear previous results/errors when connection status changes
    this.errorMessage = null;
    this.successMessage = null;
    this.executionResult = null;
    this.resultHeaders = [];
    this.resultRows = [];
    this.totalResultRows = 0;
    this.rowCount = null; // Also clear this when status changes
  }

  /**
   * Validates SQL query to prevent dangerous operations like DROP and DELETE
   * @param sqlQuery The SQL query to validate
   * @returns Object containing isValid boolean and errorMessage if invalid
   */
  private validateSqlQuery(sqlQuery: string): { isValid: boolean; errorMessage?: string } {
    const normalizedQuery = sqlQuery.trim().toLowerCase();
    
    // Check for DROP commands
    if (normalizedQuery.includes('drop ')) {
      const dropMatch = normalizedQuery.match(/\bdrop\s+(table|database|schema|index|view|trigger|procedure|function)\b/);
      if (dropMatch) {
        return {
          isValid: false,
          errorMessage: `DROP ${dropMatch[1].toUpperCase()} commands are restricted to prevent data loss. Please contact an administrator if this operation is necessary.`
        };
      }
    }
    
    // Check for DELETE commands
    if (normalizedQuery.includes('delete ')) {
      const deleteMatch = normalizedQuery.match(/\bdelete\s+from\b/);
      if (deleteMatch) {
        return {
          isValid: false,
          errorMessage: 'DELETE commands are restricted to prevent accidental data loss. Please use SELECT statements to query data or contact an administrator for data modifications.'
        };
      }
    }
    
    return { isValid: true };
  }

  /**
   * Handles the change event for the database selection dropdown.
   */
  onDatabaseSelectChange(): void {
    this.updateConnectionStatus();
  }

  /**
   * Executes the SQL query via the backend service.
   */
  executeSql(): void {
    // Prevent execution if the selected database is not connected
    if (!this.currentDbConnected) {
      this.errorMessage = this.connectionMessage || 'Cannot execute query: Database not connected.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.executionResult = null;
    this.resultHeaders = [];
    this.resultRows = [];
    this.totalResultRows = 0;
    this.rowCount = null; // Clear this before new execution

    if (!this.sqlQuery.trim()) {
      this.errorMessage = 'SQL query cannot be empty.';
      this.isLoading = false;
      return;
    }

    // Validate SQL query to prevent dangerous operations
    const validation = this.validateSqlQuery(this.sqlQuery);
    if (!validation.isValid) {
      this.errorMessage = validation.errorMessage || 'SQL query validation failed.';
      this.isLoading = false;
      return;
    }

    // Password validation removed - backend fetches password from H2 stored profiles

    const request: SqlExecutionRequest = {
      databaseName: this.selectedDatabase,
      sqlQuery: this.sqlQuery.trim()
    };

    this.migrationService.executeSql(request).subscribe({
      next: (response: SqlExecutionResponse) => {
        this.executionResult = response;
        if (response.success) {
          if (response.rowCount !== undefined && response.rowCount !== null) { // Check for rowCount for DML/DDL
            this.rowCount = response.rowCount; // Assign to component's rowCount
            this.successMessage = `Command executed successfully. Rows affected: ${this.rowCount}`;
          } else if (response.queryResult) { // This is a SELECT query result
            this.resultHeaders = response.queryResult.columns.map(col => col.name);
            this.resultRows = response.queryResult.rows;
            this.totalResultRows = response.queryResult.totalRows;
            this.successMessage = `Query executed successfully. Rows returned: ${this.totalResultRows}`;
          } else { // Generic success message without rows/query results
            this.successMessage = response.message || 'Operation completed successfully.';
          }
        } else {
          this.errorMessage = response.message || 'SQL execution failed.';
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = `Error executing SQL: ${err.error?.message || err.message || 'Server error'}`;
        console.error('SQL Execution Error:', err);
      }
    });
  }
}
