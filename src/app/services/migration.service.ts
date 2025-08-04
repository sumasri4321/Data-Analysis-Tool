// src/app/services/migration.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js'; // IMPORT CryptoJS

// Import ALL unified models from migration-data.service.ts
import {
  DbConnectionParams,
  ConnectionStatusResponse,
  Database,
  Table,
  TableDataResponse,
  MigrationInitiationRequest,
  MigrationReport,
  ColumnMappingDto,
  SqlExecutionRequest,
  SqlExecutionResponse,
  ColumnMetadata,
  MlMappingSuggestion,
  DatabaseWithMlSuggestions
} from './migration-data.service';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private apiUrl = 'http://localhost:8080/api/migration'; // Base URL for your Spring Boot backend

  // IMPORTANT: This key is hardcoded for demonstration purposes ONLY.
  // In a real application, this key should be securely managed and never exposed on the client-side.
  private encryptionKey = 'SixteenByteKey!!'; // MUST match backend key

  private _sourceConnectionStatus = new BehaviorSubject<ConnectionStatusResponse>({ success: null, message: 'Not connected' });
  private _destinationConnectionStatus = new BehaviorSubject<ConnectionStatusResponse>({ success: null, message: 'Not connected' });

  sourceConnectionStatus$ = this._sourceConnectionStatus.asObservable();
  destinationConnectionStatus$ = this._destinationConnectionStatus.asObservable();

  constructor(private http: HttpClient) {
    // No keyWordArray needed here if using default OpenSSL KDF
  }

  /**
   * Encrypts a string using AES with default CryptoJS OpenSSL KDF.
   * This means it will generate a random salt and prepend "Salted__" to the ciphertext.
   * Java backend must handle this format.
   * @param text The string to encrypt.
   * @returns The encrypted string (Base64 encoded).
   */
  private encrypt(text: string): string {
    if (!text) {
      return '';
    }
    // Using default AES.encrypt behavior which uses OpenSSL KDF (generates salt and prepends "Salted__")
    // and CBC mode with PKCS7 padding.
    // The Java backend must match this.
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  /**
   * Tests database connection using provided parameters.
   * The password in params will be encrypted before sending.
   * @param params DbConnectionParams object.
   * @returns Observable of ConnectionStatusResponse.
   */
  testDatabaseConnection(params: DbConnectionParams): Observable<ConnectionStatusResponse> {
    const paramsToSend = { ...params };
    if (paramsToSend.password) {
      paramsToSend.password = this.encrypt(paramsToSend.password); // Encrypt the password
    }
    console.log('Frontend: Sending test connection request to backend (encrypted password):', paramsToSend);
    return this.http.post<ConnectionStatusResponse>(`${this.apiUrl}/test-connection`, paramsToSend)
      .pipe(
        tap(response => {
          if (params.databaseName === 'InsuranceDB_PG') {
            this._sourceConnectionStatus.next(response);
          } else if (params.databaseName === 'ReinsuranceDB_PG') {
            this._destinationConnectionStatus.next(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Retrieves database metadata (tables and columns) for both source and destination.
   * Also includes ML mapping suggestions from the backend.
   * Passwords will be encrypted.
   * @param sourceParams DbConnectionParams for the source database.
   * @param destinationParams DbConnectionParams for the destination database.
   * @returns Observable of List<DatabaseWithMlSuggestions>.
   */
  getDatabaseMetadata(sourceParams: DbConnectionParams, destinationParams: DbConnectionParams): Observable<DatabaseWithMlSuggestions[]> {
    const connectionParamsMap = {
      sourceDbParams: { ...sourceParams },
      destinationDbParams: { ...destinationParams }
    };
    if (connectionParamsMap.sourceDbParams.password) {
      connectionParamsMap.sourceDbParams.password = this.encrypt(connectionParamsMap.sourceDbParams.password);
    }
    if (connectionParamsMap.destinationDbParams.password) {
      connectionParamsMap.destinationDbParams.password = this.encrypt(connectionParamsMap.destinationDbParams.password);
    }

    console.log('Frontend: Sending metadata request to backend (encrypted passwords):', connectionParamsMap);
    return this.http.post<DatabaseWithMlSuggestions[]>(`${this.apiUrl}/metadata`, connectionParamsMap)
      .pipe(
        tap(response => {
          console.log('MigrationService: Raw response from backend:', response);
          // Log ML suggestions if they exist
          const sourceDb = response.find(db => db.type === 'SOURCE');
          const destDb = response.find(db => db.type === 'DESTINATION');
          
          console.log('MigrationService: Source database from response:', sourceDb);
          console.log('MigrationService: Source database mlSuggestions field:', sourceDb?.mlSuggestions);
          
          if (sourceDb?.mlSuggestions && sourceDb.mlSuggestions.length > 0) {
            console.log('MigrationService: ✅ Received ML suggestions from backend:', sourceDb.mlSuggestions);
          } else {
            console.warn('MigrationService: ❌ No ML suggestions found in backend response');
            console.warn('MigrationService: Check if backend is including mlSuggestions field in metadata response');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Fetches table data for preview from the backend.
   * Passwords will be encrypted.
   * @param databaseName The name of the database.
   * @param tableName The name of the table.
   * @param params DbConnectionParams for the database.
   * @returns Observable of TableDataResponse.
   */
  getTableData(databaseName: string, tableName: string, params: DbConnectionParams): Observable<TableDataResponse> {
    const paramsToSend = { ...params };
    if (paramsToSend.password) {
      paramsToSend.password = this.encrypt(paramsToSend.password);
    }

    console.log(`Frontend: Sending data preview request for ${databaseName}.${tableName} to backend (encrypted password).`);
    return this.http.post<TableDataResponse>(`${this.apiUrl}/data-preview/${databaseName}/${tableName}`, paramsToSend)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Initiates the migration process with the backend.
   * Passwords are NOT sent here as backend fetches from H2 (if profile saving is active).
   * @param sourceDatabaseName Name of the source database.
   * @param sourceTableName Name of the source table.
   * @param destinationDatabaseName Name of the destination database.
   * @param destinationTableName Name of the destination table.
   * @param columnMappings Array of column mappings.
   * @returns Observable of MigrationReport.
   */
  startMigration(
    sourceDatabaseName: string,
    sourceTableName: string,
    destinationDatabaseName: string,
    destinationTableName: string,
    columnMappings: ColumnMappingDto[]
  ): Observable<MigrationReport> {
    const request: MigrationInitiationRequest = {
      sourceDatabaseName,
      sourceTableName,
      destinationDatabaseName,
      destinationTableName,
      columnMappings: columnMappings
    };
    console.log('Frontend: Sending migration initiation request to backend:', request);
    return this.http.post<MigrationReport>(`${this.apiUrl}/start-migration`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Executes a generic SQL query via the backend.
   * Passwords are NOT sent here as backend fetches from H2 (if profile saving is active).
   * @param request SqlExecutionRequest containing database name and SQL query.
   * @returns Observable of SqlExecutionResponse.
   */
  executeSql(request: SqlExecutionRequest): Observable<SqlExecutionResponse> {
    console.log('Frontend: Sending SQL execution request to backend:', request);
    return this.http.post<SqlExecutionResponse>(`${this.apiUrl}/execute-sql`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Downloads migration SQL queries as a .sql file
   * @param sourceDatabaseName Source database name
   * @param sourceTableName Source table name
   * @param destinationDatabaseName Destination database name
   * @param destinationTableName Destination table name
   * @param queries Array of SQL queries
   * @returns Observable of Blob for file download
   */
  downloadMigrationQueries(
    sourceDatabaseName: string,
    sourceTableName: string,
    destinationDatabaseName: string,
    destinationTableName: string,
    queries: string[]
  ): Observable<Blob> {
    const request = {
      sourceDatabaseName,
      sourceTableName,
      destinationDatabaseName,
      destinationTableName,
      queries
    };
    
    console.log('Frontend: Sending download migration queries request to backend:', request);
    return this.http.post(`${this.apiUrl}/download-migration-queries`, request, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/sql'
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Cannot connect to the backend. Please ensure your Spring Boot application is running and accessible.';
      } else {
        errorMessage = `Server returned code: ${error.status}, error message: ${error.message}`;
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
      }
    }
    console.error('HTTP Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
