// src/app/migration-tool/migration-tool.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

import {
  DbConnectionParams,
  ConnectionStatusResponse,
  Column,
  DisplayTable,
  ColumnMapping,
  MigrationConfigurationState,
  MigrationDataService,
  TableData,
  MigrationInitiationRequest,
  MigrationReport,
  Database,
  Table,
  ColumnMappingDto,
  TableDataResponse,
  ColumnMetadata,
  MlMappingSuggestion,
  DatabaseWithMlSuggestions
} from '../services/migration-data.service';

import { MigrationService } from '../services/migration.service';
import { ProfileService, ConnectionProfile } from '../services/profile.service'; // NEW: Import ProfileService and ConnectionProfile

@Component({
  selector: 'app-migration-tool',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './migration-tool.component.html',
  styleUrls: ['./migration-tool.component.css']
})
export class MigrationToolComponent implements OnInit, OnDestroy {
  // --- Component Properties for UI State and Data ---

  // Source Database Configuration
  sourceDbParams: DbConnectionParams = {
    hostname: 'localhost',
    port: 5432,
    databaseType: 'PostgreSQL',
    databaseName: 'InsuranceDB_PG',
    username: 'postgres',
    password: '' // Always start with empty password
  };
  sourceConnectionStatus: { message: string, success: boolean | null } = { message: '', success: null };
  sourceDbFormErrors: { [key: string]: string } = {};
  isSourceConnected: boolean = false;
  sourceSchema: DisplayTable[] = [];
  selectedSourceTableName: string = '';

  // Destination Database Configuration
  destinationDbParams: DbConnectionParams = {
    hostname: 'localhost',
    port: 5432,
    databaseType: 'PostgreSQL',
    databaseName: 'ReinsuranceDB_PG',
    username: 'postgres',
    password: '' // Always start with empty password
  };
  destinationConnectionStatus: { message: string, success: boolean | null } = { message: '', success: null };
  destinationDbFormErrors: { [key: string]: string } = {};
  isDestinationConnected: boolean = false;
  destinationSchema: DisplayTable[] = [];
  selectedDestinationTableName: string = '';

  // Column Mapping
  private allColumnMappings: Map<string, ColumnMapping[]> = new Map();
  columnMappings: ColumnMapping[] = [];
  showMappingError: boolean = false;

  // Temporary password storage for metadata API calls
  private tempSourcePassword: string = '';
  private tempDestinationPassword: string = '';

  // Main status message for the page
  migrationMessage: string = '';

  // Store all columns available for dropdowns (for current table pair)
  allSourceColumnsForSelectedTable: Column[] = [];
  allDestinationColumnsForSelectedTable: Column[] = [];

  // Data Preview Modal Properties
  showDataPreviewModal: boolean = false;
  previewTableName: string = '';
  previewTableData: TableData = { headers: [], rows: [], totalRows: 0 };

  // ML Suggestions Properties
  mlSuggestions: MlMappingSuggestion[] = [];
  showMlSuggestionsPanel: boolean = false;

  private subscriptions: Subscription = new Subscription();


  constructor(
    private router: Router,
    private migrationService: MigrationService,
    private migrationDataService: MigrationDataService,
    private profileService: ProfileService, // NEW: Inject ProfileService
    private msalService: MsalService // Inject MsalService for authentication
  ) { }

  ngOnInit(): void {
    console.log('MigrationToolComponent: ngOnInit started.');
    
    // Debug authentication state
    const account = this.msalService.instance.getActiveAccount();
    console.log('MigrationToolComponent: Current MSAL account:', account);
    
    if (account) {
      console.log('MigrationToolComponent: User is authenticated as:', account.name || account.username);
      
      // Try to acquire token to test if it works
      const silentRequest = {
        scopes: ['api://be1ee057-734b-47b1-9f5f-f16151b14d9d/access_as_user'],
        account: account
      };
      
      this.msalService.instance.acquireTokenSilent(silentRequest).then((response) => {
        console.log('MigrationToolComponent: Token acquired successfully, expires:', new Date(response.expiresOn?.toString() || ''));
        console.log('MigrationToolComponent: Token (first 20 chars):', response.accessToken.substring(0, 20) + '...');
      }).catch((error) => {
        console.error('MigrationToolComponent: Failed to acquire token:', error);
      });
    } else {
      console.warn('MigrationToolComponent: No active account found - user may not be authenticated');
    }
    
    const savedConfig = this.migrationDataService.getMigrationConfiguration();
    console.log('MigrationToolComponent: Loaded savedConfig from service:', savedConfig);

    // Load connection parameters from saved config, but clear passwords to force manual entry
    if (savedConfig.sourceDbParams) {
      this.sourceDbParams = { ...savedConfig.sourceDbParams, password: '' }; // Clear password
    }
    if (savedConfig.destinationDbParams) {
      this.destinationDbParams = { ...savedConfig.destinationDbParams, password: '' }; // Clear password
    }
    console.log('MigrationToolComponent: sourceDbParams after load (password cleared):', this.sourceDbParams);
    console.log('MigrationToolComponent: destinationDbParams after load (password cleared):', this.destinationDbParams);

    // Load selected table names from saved config
    this.selectedSourceTableName = savedConfig.selectedSourceTableName || '';
    this.selectedDestinationTableName = savedConfig.selectedDestinationTableName || '';
    console.log('MigrationToolComponent: selectedSourceTableName after load:', this.selectedSourceTableName);
    console.log('MigrationToolComponent: selectedDestinationTableName after load:', this.selectedDestinationTableName);

    // Schemas are NOT loaded from savedConfig because they are not persisted.
    // They will be populated by fetchSchemasIfBothConnected after successful connection tests.
    this.sourceSchema = [];
    this.destinationSchema = [];
    console.log('MigrationToolComponent: Schemas initialized to empty arrays.');

    // Initialize connection status to false, will be updated by service subscriptions
    this.isSourceConnected = false;
    this.isDestinationConnected = false;

    // Subscribe to connection status changes from the MigrationService
    // These subscriptions must be active BEFORE testConnection calls in ngOnInit
    this.subscriptions.add(this.migrationService.sourceConnectionStatus$.subscribe(status => {
      console.log('MigrationToolComponent: Source connection status updated:', status);
      this.sourceConnectionStatus = status; // Update local status object
      this.isSourceConnected = status.success === true;
      // Only attempt to fetch schemas if both are connected
      if (this.isSourceConnected && this.isDestinationConnected) {
        this.fetchSchemasIfBothConnected();
      } else {
        // If one connection drops, clear schemas and selected tables
        if (!this.isSourceConnected) { // Only clear source if source is not connected
          this.sourceSchema = [];
          this.selectedSourceTableName = '';
          // No need to clear in service here, as it's done during saveConfig and on page load
        }
        // If either connection is down, mappings should be cleared/hidden
        this.columnMappings = [];
      }
      this.validateAllMappings(); // Re-validate mappings on connection status change
    }));

    this.subscriptions.add(this.migrationService.destinationConnectionStatus$.subscribe(status => {
      console.log('MigrationToolComponent: Destination connection status updated:', status);
      this.destinationConnectionStatus = status; // Update local status object
      this.isDestinationConnected = status.success === true;
      // Only attempt to fetch schemas if both are connected
      if (this.isSourceConnected && this.isDestinationConnected) {
        this.fetchSchemasIfBothConnected();
      } else {
        // If one connection drops, clear schemas and selected tables
        if (!this.isDestinationConnected) { // Only clear destination if destination is not connected
          this.destinationSchema = [];
          this.selectedDestinationTableName = '';
          // No need to clear in service here, as it's done during saveConfig and on page load
        }
        // If either connection is down, mappings should be cleared/hidden
        this.columnMappings = [];
      }
      this.validateAllMappings(); // Re-validate mappings on connection status change
    }));

    // Reconstruct allColumnMappings from saved columnMappings for the current selected tables
    // This is important for persistence across page loads
    if (savedConfig.columnMappings && savedConfig.selectedSourceTableName && savedConfig.selectedDestinationTableName) {
      // The `savedConfig.columnMappings` already contains `suggestedTransformationType` and `customCommand`
      // because MigrationDataService now handles their persistence.
      const tablePairKey = this.generateTablePairKey(savedConfig.selectedSourceTableName, savedConfig.selectedDestinationTableName);
      this.allColumnMappings.set(tablePairKey, savedConfig.columnMappings);
      this.columnMappings = savedConfig.columnMappings; // Set current mappings to loaded ones (will be rehydrated later)
      console.log('MigrationToolComponent: Loaded initial column mappings:', this.columnMappings);
    } else {
      this.columnMappings = [];
      console.log('MigrationToolComponent: No initial column mappings loaded.');
    }

    // Initialize connection status and require manual connection testing
    this.isSourceConnected = false;
    this.isDestinationConnected = false;
    this.sourceConnectionStatus = { message: 'Please enter password and test connection', success: null };
    this.destinationConnectionStatus = { message: 'Please enter password and test connection', success: null };

    // Clear schemas and table selections - require fresh connections
    this.sourceSchema = [];
    this.destinationSchema = [];
    this.selectedSourceTableName = '';
    this.selectedDestinationTableName = '';
    this.columnMappings = [];
    this.allColumnMappings = new Map();
    this.migrationMessage = 'Please enter passwords and test database connections to begin.';
    
    console.log('MigrationToolComponent: Connections require manual testing. Passwords must be entered manually.');
    console.log('MigrationToolComponent: ngOnInit finished.');
  }

  ngOnDestroy(): void {
    console.log('MigrationToolComponent: ngOnDestroy - Unsubscribing from all subscriptions.');
    this.subscriptions.unsubscribe(); // Unsubscribe to prevent memory leaks
  }

  private findColumnInSchema(schema: DisplayTable[], columnToFind: Column | null): Column | null {
    if (!columnToFind || !schema || schema.length === 0) {
      return null;
    }
    for (const table of schema) {
      const foundCol = table.columns.find(col => {
        // Prefer ID for comparison if available, fallback to name and parentTableName
        if (col.id && columnToFind.id) {
          return col.id === columnToFind.id;
        }
        return col.name === columnToFind.name && col.parentTableName === columnToFind.parentTableName;
      });
      if (foundCol) {
        return foundCol;
      }
    }
    return null;
  }


  // --- Database Connection Logic ---

  private validateDbParams(params: DbConnectionParams, errors: { [key: string]: string }): boolean {
    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        delete errors[key];
      }
    }
    let isValid = true;

    if (!params.hostname.trim()) {
      errors['hostname'] = 'Hostname/IP cannot be empty.';
      isValid = false;
    } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$|^localhost$/.test(params.hostname.toLowerCase())) {
      errors['hostname'] = 'Please enter a valid hostname or IP address.';
      isValid = false;
    }

    if (!params.port || params.port < 1 || params.port > 65535) {
      errors['port'] = 'Enter a valid port number (1-65535).';
      isValid = false;
    }

    if (!params.databaseType) {
      errors['databaseType'] = 'Please select the database type.';
      isValid = false;
    }

    if (!params.databaseName.trim()) {
      errors['databaseName'] = 'Database name cannot be empty.';
      isValid = false;
    }

    if (!params.username.trim()) {
      errors['username'] = 'Username cannot be empty.';
      isValid = false;
    }

    if (params.password === null || params.password === undefined || params.password === '') {
      errors['password'] = 'Password cannot be empty.';
      isValid = false;
    }

    return isValid;
  }

  // Helper to construct JDBC URL
  private constructJdbcUrl(params: DbConnectionParams): string {
    const dbType = params.databaseType.toLowerCase();
    const hostname = params.hostname;
    const port = params.port;
    const dbName = params.databaseName;

    switch (dbType) {
      case 'postgresql':
        return `jdbc:postgresql://${hostname}:${port}/${dbName}`;
      case 'mysql':
        return `jdbc:mysql://${hostname}:${port}/${dbName}`;
      case 'sqlserver':
        return `jdbc:sqlserver://${hostname}:${port};databaseName=${dbName}`;
      case 'oracle':
        // Oracle JDBC URLs can be complex. This is a common service name format.
        return `jdbc:oracle:thin:@${hostname}:${port}/${dbName}`;
      case 'h2':
        // For H2, assume embedded file or in-memory for simplicity in saving profile
        // If it's a TCP server, the user should provide the full URL in databaseName or a separate field.
        // For now, if "H2", we'll just use the databaseName as the path/name.
        // A more robust solution might distinguish H2 embedded vs. server modes.
        return `jdbc:h2:file:./data/${dbName}`; // Example for file-based H2
      default:
        return ''; // Unknown type
    }
  }

  // Method to save a connection profile to the backend
  private saveProfile(params: DbConnectionParams): void {
    if (!this.validateDbParams(params, params === this.sourceDbParams ? this.sourceDbFormErrors : this.destinationDbFormErrors)) {
      this.migrationMessage = `Cannot save profile: Please correct validation errors for ${params.databaseName}.`;
      this.showMappingError = true;
      return;
    }

    const profile: ConnectionProfile = {
      name: params.databaseName, // Use databaseName as the profile name
      jdbcUrl: this.constructJdbcUrl(params),
      username: params.username,
      password: params.password, // Send password; backend will encrypt
      dbType: params.databaseType.toUpperCase() // Ensure uppercase for backend enum
    };

    this.profileService.saveConnectionProfile(profile).subscribe({
      next: (response) => {
        this.migrationMessage = `Profile '${profile.name}' saved successfully: ${response}`;
        this.showMappingError = false;
        console.log('Profile saved successfully:', response);
      },
      error: (error: HttpErrorResponse) => {
        this.migrationMessage = `Failed to save profile '${profile.name}': ${error.error || error.message}`;
        this.showMappingError = true;
        console.error('Error saving profile:', error);
      }
    });
  }

  saveSourceProfile(): void {
    this.saveProfile(this.sourceDbParams);
  }

  saveDestinationProfile(): void {
    this.saveProfile(this.destinationDbParams);
  }


  // Handle database type change for source
  onSourceDbTypeChange(): void {
    console.log('MigrationToolComponent: Source DB type changed.');
    switch (this.sourceDbParams.databaseType) {
      case 'PostgreSQL':
        this.sourceDbParams.port = 5432;
        this.sourceDbParams.databaseName = 'InsuranceDB_PG';
        break;
      case 'Oracle':
        this.sourceDbParams.port = 1521;
        this.sourceDbParams.databaseName = 'XEPDB1'; // Common default for Oracle XE PDB or service name
        break;
      case 'MySQL':
        this.sourceDbParams.port = 3306;
        this.sourceDbParams.databaseName = 'mysql_db'; // Common default for MySQL
        break;
      case 'SQLServer':
        this.sourceDbParams.port = 1433;
        this.sourceDbParams.databaseName = 'master'; // Common default for SQL Server
        break;
      case 'H2':
        this.sourceDbParams.port = 0; // H2 embedded usually doesn't use a port
        this.sourceDbParams.databaseName = 'h2_db'; // Default for H2
        break;
      default:
        this.sourceDbParams.port = 0; // Clear port for unknown types
        this.sourceDbParams.databaseName = '';
        break;
    }
    // Clear connection status and schema when type changes, forcing re-test
    this.sourceConnectionStatus = { message: '', success: null };
    this.isSourceConnected = false;
    this.sourceSchema = [];
    this.selectedSourceTableName = '';
    this.saveAndClearCurrentMappings(); // Clear mappings for the new table pair
    this.validateAllMappings(); // Re-validate after change
  }

  // Handle database type change for destination
  onDestinationDbTypeChange(): void {
    console.log('MigrationToolComponent: Destination DB type changed.');
    switch (this.destinationDbParams.databaseType) {
      case 'PostgreSQL':
        this.destinationDbParams.port = 5432;
        this.destinationDbParams.databaseName = 'ReinsuranceDB_PG';
        break;
      case 'Oracle':
        this.destinationDbParams.port = 1521;
        this.destinationDbParams.databaseName = 'XEPDB1'; // Common default for Oracle XE PDB or service name
        break;
      case 'MySQL':
        this.destinationDbParams.port = 3306;
        this.destinationDbParams.databaseName = 'mysql_db'; // Common default for MySQL
        break;
      case 'SQLServer':
        this.destinationDbParams.port = 1433;
        this.destinationDbParams.databaseName = 'master'; // Common default for SQL Server
        break;
      case 'H2':
        this.destinationDbParams.port = 0; // H2 embedded usually doesn't use a port
        this.destinationDbParams.databaseName = 'h2_db'; // Default for H2
        break;
      default:
        this.destinationDbParams.port = 0; // Clear port for unknown types
        this.destinationDbParams.databaseName = '';
        break;
    }
    // Clear connection status and schema when type changes, forcing re-test
    this.destinationConnectionStatus = { message: '', success: null };
    this.isDestinationConnected = false;
    this.destinationSchema = [];
    this.selectedDestinationTableName = '';
    this.saveAndClearCurrentMappings(); // Clear mappings for the new table pair
    this.validateAllMappings(); // Re-validate after change
  }


  testSourceConnection(isInitialLoad: boolean = false): void {
    console.log(`MigrationToolComponent: Testing source connection (isInitialLoad: ${isInitialLoad}).`);
    this.sourceConnectionStatus = { message: '', success: null };
    this.isSourceConnected = false;
    this.tempSourcePassword = ''; // Clear stored password on new test
    this.sourceSchema = []; // Clear schema on new test
    this.selectedSourceTableName = '';
    if (!isInitialLoad) { // Only clear mappings if not initial load (i.e., manual test button click)
      this.saveAndClearCurrentMappings();
      this.columnMappings = [];
    }
    this.showMappingError = false;
    this.migrationMessage = '';

    if (!this.validateDbParams(this.sourceDbParams, this.sourceDbFormErrors)) {
      console.log('MigrationToolComponent: Source DB params validation failed.');
      this.sourceConnectionStatus = { message: 'Connection test failed: Please correct validation errors.', success: false };
      this.validateAllMappings(); // Re-validate after validation error
      return;
    }

    this.sourceConnectionStatus = { message: 'Testing connection...', success: null };
    this.migrationService.testDatabaseConnection(this.sourceDbParams)
      .subscribe({
        next: (response) => {
          console.log('MigrationToolComponent: Source test connection response:', response);
          this.sourceConnectionStatus = response;
          this.isSourceConnected = response.success || false;
          
          // Store password temporarily if connection successful
          if (this.isSourceConnected) {
            this.tempSourcePassword = this.sourceDbParams.password || '';
          }
          
          if (this.isSourceConnected && this.isDestinationConnected) { // Check both connections here
            console.log('MigrationToolComponent: Both source and destination connected. Calling fetchSchemasIfBothConnected.');
            this.fetchSchemasIfBothConnected();
          } else if (this.isSourceConnected) { // If only source connected, ensure its schema is cleared
            console.log('MigrationToolComponent: Only source connected. Clearing source schema and selected table.');
            this.sourceSchema = [];
            this.selectedSourceTableName = '';
          }
          this.validateAllMappings(); // Re-validate mappings on connection status change
        },
        error: (error: HttpErrorResponse) => {
          console.error('MigrationToolComponent: Source Connection Error:', error);
          this.sourceConnectionStatus = { message: `Connection test failed: ${error.error?.message || error.message || 'Server error'}. Please ensure your Spring Boot backend is running and CORS is configured.`, success: false };
          this.isSourceConnected = false;
          this.tempSourcePassword = ''; // Clear stored password on connection failure
          this.sourceSchema = [];
          this.selectedSourceTableName = '';
          this.validateAllMappings(); // Re-validate after error
        }
      });
  }

  testDestinationConnection(isInitialLoad: boolean = false): void {
    console.log(`MigrationToolComponent: Testing destination connection (isInitialLoad: ${isInitialLoad}).`);
    this.destinationConnectionStatus = { message: '', success: null };
    this.isDestinationConnected = false;
    this.tempDestinationPassword = ''; // Clear stored password on new test
    this.destinationSchema = []; // Clear schema on new test
    this.selectedDestinationTableName = '';
    if (!isInitialLoad) { // Only clear mappings if not initial load (i.e., manual test button click)
      this.saveAndClearCurrentMappings();
      this.columnMappings = [];
    }
    this.showMappingError = false;
    this.migrationMessage = '';

    if (!this.validateDbParams(this.destinationDbParams, this.destinationDbFormErrors)) {
      console.log('MigrationToolComponent: Destination DB params validation failed.');
      this.destinationConnectionStatus = { message: 'Connection test failed: Please correct validation errors.', success: false };
      this.validateAllMappings(); // Re-validate after validation error
      return;
    }

    this.destinationConnectionStatus = { message: 'Testing connection...', success: null };
    this.migrationService.testDatabaseConnection(this.destinationDbParams)
      .subscribe({
        next: (response) => {
          console.log('MigrationToolComponent: Destination test connection response:', response);
          this.destinationConnectionStatus = response;
          this.isDestinationConnected = response.success || false;
          
          // Store password temporarily if connection successful
          if (this.isDestinationConnected) {
            this.tempDestinationPassword = this.destinationDbParams.password || '';
          }
          
          if (this.isSourceConnected && this.isDestinationConnected) { // Check both connections here
            console.log('MigrationToolComponent: Both source and destination connected. Calling fetchSchemasIfBothConnected.');
            this.fetchSchemasIfBothConnected();
          } else if (this.isDestinationConnected) { // If only destination connected, ensure its schema is cleared
            console.log('MigrationToolComponent: Only destination connected. Clearing destination schema and selected table.');
            this.destinationSchema = [];
            this.selectedDestinationTableName = '';
          }
          this.validateAllMappings(); // Re-validate mappings on connection status change
        },
        error: (error: HttpErrorResponse) => {
          console.error('MigrationToolComponent: Destination Connection Error:', error);
          this.destinationConnectionStatus = { message: `Connection test failed: ${error.error?.message || error.message || 'Server error'}. Please ensure your Spring Boot backend is running and CORS is configured.`, success: false };
          this.isDestinationConnected = false;
          this.tempDestinationPassword = ''; // Clear stored password on connection failure
          this.destinationSchema = [];
          this.selectedDestinationTableName = '';
          this.validateAllMappings(); // Re-validate after error
        }
      });
  }

  // New method to fetch schemas only when both connections are established
  private fetchSchemasIfBothConnected(): void {
    console.log('MigrationToolComponent: fetchSchemasIfBothConnected called.');
    if (this.isSourceConnected && this.isDestinationConnected) {
      console.log('MigrationToolComponent: Both connections are true. Proceeding to fetch schemas.');
      this.migrationMessage = 'Fetching schemas for both databases...';
      
      // Create temporary connection params with stored passwords for metadata call
      const sourceParamsWithPassword = { ...this.sourceDbParams, password: this.tempSourcePassword };
      const destinationParamsWithPassword = { ...this.destinationDbParams, password: this.tempDestinationPassword };
      
      console.log('MigrationToolComponent: Using stored passwords for metadata call');
      
      // Pass DbConnectionParams for both source and destination to the service call
      this.migrationService.getDatabaseMetadata(sourceParamsWithPassword, destinationParamsWithPassword)
        .subscribe({
          next: (allDatabases: DatabaseWithMlSuggestions[]) => {
            console.log('MigrationToolComponent: Raw metadata response from backend:', allDatabases);
            console.log('MigrationToolComponent: Schemas fetched successfully:', allDatabases);
            const sourceDb = allDatabases.find(db => db.type === 'SOURCE');
            const destinationDb = allDatabases.find(db => db.type === 'DESTINATION');

            // Extract ML suggestions from the response with detailed logging
            console.log('MigrationToolComponent: Source database object:', sourceDb);
            console.log('MigrationToolComponent: Source ML suggestions field:', sourceDb?.mlSuggestions);
            
            this.mlSuggestions = sourceDb?.mlSuggestions || [];
            console.log('MigrationToolComponent: ML suggestions extracted and stored:', this.mlSuggestions);
            
            if (this.mlSuggestions.length > 0) {
              this.showMlSuggestionsPanel = true;
              this.migrationMessage = `Schemas fetched successfully! ${this.mlSuggestions.length} ML mapping suggestions available.`;
              console.log('MigrationToolComponent: ML suggestions panel enabled');
            } else {
              console.warn('MigrationToolComponent: No ML suggestions received from backend');
            }

            this.sourceSchema = sourceDb ? sourceDb.tables.map(t => ({
              name: t.name,
              columns: t.columns.map(c => ({ ...c, parentTableName: t.name })) // Columns here are 'Column' type from backend
            })) : [];

            this.destinationSchema = destinationDb ? destinationDb.tables.map(t => ({
              name: t.name,
              columns: t.columns.map(c => ({ ...c, parentTableName: t.name })) // Columns here are 'Column' type from backend
            })) : [];

            console.log('MigrationToolComponent: sourceSchema after fetch:', this.sourceSchema);
            console.log('MigrationToolComponent: destinationSchema after fetch:', this.destinationSchema);

            // Auto-select first table if none selected or if previously selected table is no longer in schema
            if (this.sourceSchema.length > 0) {
              if (!this.selectedSourceTableName || !this.sourceSchema.some(t => t.name === this.selectedSourceTableName)) {
                this.selectedSourceTableName = this.sourceSchema[0].name;
                console.log('MigrationToolComponent: Auto-selected source table:', this.selectedSourceTableName);
              }
            } else {
              this.selectedSourceTableName = ''; // Clear if no tables
              console.log('MigrationToolComponent: No source tables found. Clearing selected source table.');
            }

            if (this.destinationSchema.length > 0) {
              if (!this.selectedDestinationTableName || !this.destinationSchema.some(t => t.name === this.selectedDestinationTableName)) {
                this.selectedDestinationTableName = this.destinationSchema[0].name;
                console.log('MigrationToolComponent: Auto-selected destination table:', this.selectedDestinationTableName);
              }
            } else {
              this.selectedDestinationTableName = ''; // Clear if no tables
              console.log('MigrationToolComponent: No destination tables found. Clearing selected destination table.');
            }

            // After schemas and selected tables are set, update dropdowns and load mappings
            this.updateAvailableColumnsForDropdowns();
            this.loadMappingsForCurrentTables(); // This will re-validate and set transformation modes
            
            if (!this.migrationMessage.includes('ML mapping suggestions')) {
              this.migrationMessage = 'Schemas fetched successfully!';
            }
            this.validateAllMappings(); // Final validation after all data is loaded/rehydrated

            // Save schemas and selected table names to data service for in-memory use by other components
            // Note: Passwords are stripped by the service for localStorage persistence
            const currentConfig: MigrationConfigurationState = {
              sourceDbParams: this.sourceDbParams,
              destinationDbParams: this.destinationDbParams,
              sourceSchema: this.sourceSchema,
              destinationSchema: this.destinationSchema,
              selectedSourceTableName: this.selectedSourceTableName,
              selectedDestinationTableName: this.selectedDestinationTableName,
              columnMappings: this.columnMappings // Pass current mappings for saving
            };
            this.migrationDataService.setMigrationConfiguration(currentConfig);
            console.log('MigrationToolComponent: Schemas and selected tables saved to MigrationDataService.');
          },
          error: (error: HttpErrorResponse) => {
            console.error('MigrationToolComponent: Schema Fetch Error:', error);
            this.migrationMessage = `Failed to fetch schemas: ${error.error?.message || error.message || 'Server error'}.`;
            this.sourceSchema = [];
            this.destinationSchema = [];
            this.selectedSourceTableName = '';
            this.selectedDestinationTableName = '';
            this.validateAllMappings();
            // Clear schemas and selected tables in data service on error
            const currentConfig: MigrationConfigurationState = {
              sourceDbParams: this.sourceDbParams,
              destinationDbParams: this.destinationDbParams,
              sourceSchema: [],
              destinationSchema: [],
              selectedSourceTableName: '',
              selectedDestinationTableName: '',
              columnMappings: [] // Clear mappings on schema fetch error
            };
            this.migrationDataService.setMigrationConfiguration(currentConfig);
          }
        });
    } else {
      console.log('MigrationToolComponent: fetchSchemasIfBothConnected - Not both connections are true.');
      this.migrationMessage = ''; // Clear message if not both connected
      // Also clear schemas and tables if not both connected, to reflect UI state
      this.sourceSchema = [];
      this.destinationSchema = [];
      this.selectedSourceTableName = '';
      this.selectedDestinationTableName = '';
      const currentConfig: MigrationConfigurationState = {
        sourceDbParams: this.sourceDbParams,
        destinationDbParams: this.destinationDbParams,
        sourceSchema: [],
        destinationSchema: [],
        selectedSourceTableName: '',
        selectedDestinationTableName: '',
        columnMappings: []
      };
      this.migrationDataService.setMigrationConfiguration(currentConfig);
    }
  }

  onSourceTableSelected(event: Event): void {
    console.log('MigrationToolComponent: Source table selected:', this.selectedSourceTableName);
    this.saveCurrentMappings();
    const selectElement = event.target as HTMLSelectElement;
    this.selectedSourceTableName = selectElement.value;
    this.updateAvailableColumnsForDropdowns();
    this.loadMappingsForCurrentTables();
    this.showMappingError = false;
    this.migrationMessage = '';
    // Save to service (the whole config, which includes selected table names)
    const currentConfig = this.migrationDataService.getMigrationConfiguration();
    currentConfig.selectedSourceTableName = this.selectedSourceTableName;
    this.migrationDataService.setMigrationConfiguration(currentConfig);
    this.validateAllMappings(); // Re-validate after table selection
  }

  onDestinationTableSelected(event: Event): void {
    console.log('MigrationToolComponent: Destination table selected:', this.selectedDestinationTableName);
    this.saveCurrentMappings();
    const selectElement = event.target as HTMLSelectElement;
    this.selectedDestinationTableName = selectElement.value;
    this.updateAvailableColumnsForDropdowns();
    this.loadMappingsForCurrentTables();
    this.showMappingError = false;
    this.migrationMessage = '';
    // Save to service (the whole config, which includes selected table names)
    const currentConfig = this.migrationDataService.getMigrationConfiguration();
    currentConfig.selectedDestinationTableName = this.selectedDestinationTableName;
    this.migrationDataService.setMigrationConfiguration(currentConfig);
    this.validateAllMappings(); // Re-validate after table selection
  }

  // --- Column Mapping Logic ---

  private generateTablePairKey(sourceTable: string, destTable: string): string {
    return `${sourceTable.toLowerCase()}-${destTable.toLowerCase()}`;
  }

  private saveCurrentMappings(): void {
    if (this.selectedSourceTableName && this.selectedDestinationTableName) {
      const tablePairKey = this.generateTablePairKey(this.selectedSourceTableName, this.selectedDestinationTableName);
      // Create a clean copy of mappings for storage, omitting transient UI state
      const mappingsToStore = this.columnMappings.map((m: ColumnMapping) => ({
        sourceColumn: m.sourceColumn,
        secondarySourceColumn: m.secondarySourceColumn,
        destinationColumn: m.destinationColumn,
        transformationMode: m.transformationMode,
        suggestedTransformationType: m.suggestedTransformationType,
        customCommand: m.customCommand,
      }));
      this.allColumnMappings.set(tablePairKey, mappingsToStore.map(m => ({...m, isValid: false, validationMessage: ''}))); // Store with transient fields removed for map
      // Also save the current set of mappings to the MigrationDataService
      const currentConfig = this.migrationDataService.getMigrationConfiguration();
      currentConfig.columnMappings = this.columnMappings; // Save the full objects including validity
      this.migrationDataService.setMigrationConfiguration(currentConfig);
      console.log(`MigrationToolComponent: Mappings saved for ${tablePairKey} (in-memory & service):`, mappingsToStore);
    }
  }

  private loadMappingsForCurrentTables(): void {
    console.log('MigrationToolComponent: loadMappingsForCurrentTables called.');
    if (this.selectedSourceTableName && this.selectedDestinationTableName) {
      const tablePairKey = this.generateTablePairKey(this.selectedSourceTableName, this.selectedDestinationTableName);
      // Retrieve stored mappings from the in-memory map first
      const storedMappings = this.allColumnMappings.get(tablePairKey) || [];
      console.log(`MigrationToolComponent: Found ${storedMappings.length} stored mappings for ${tablePairKey}.`);

      // Rehydrate column objects by finding them in the current schemas
      this.columnMappings = storedMappings.map((storedMap: ColumnMapping) => {
        const sourceCol = this.findColumnInSchema(this.sourceSchema, storedMap.sourceColumn);
        const secondarySourceCol = this.findColumnInSchema(this.sourceSchema, storedMap.secondarySourceColumn || null);
        const destCol = this.findColumnInSchema(this.destinationSchema, storedMap.destinationColumn);

        // Only return a mapping if both source and destination columns are found in the current schemas
        if (sourceCol && destCol) {
          const newMapping: ColumnMapping = {
            sourceColumn: sourceCol,
            secondarySourceColumn: secondarySourceCol,
            destinationColumn: destCol,
            transformationMode: storedMap.transformationMode,
            suggestedTransformationType: storedMap.suggestedTransformationType,
            customCommand: storedMap.customCommand,
            isValid: false, // Will be validated by validateMapping
            validationMessage: '', // Will be set by validateMapping
          };
          this.validateMapping(newMapping); // Re-validate to apply current logic and update UI status
          return newMapping;
        }
        console.warn(`MigrationToolComponent: Column for mapping ${storedMap.sourceColumn?.name} -> ${storedMap.destinationColumn?.name} not found in current schema. Skipping.`);
        return null;
      }).filter((m: ColumnMapping | null): m is ColumnMapping => m !== null); // Filter out nulls

      // After loading and rehydrating, save the current set of mappings to the data service
      const currentConfig = this.migrationDataService.getMigrationConfiguration();
      currentConfig.columnMappings = this.columnMappings;
      this.migrationDataService.setMigrationConfiguration(currentConfig);
      console.log(`MigrationToolComponent: Mappings loaded for ${tablePairKey} (from in-memory map) and rehydrated:`, this.columnMappings);
      this.validateAllMappings();
    } else {
      console.log('MigrationToolComponent: No source or destination table selected for loading mappings. Clearing current mappings.');
      this.columnMappings = [];
      const currentConfig = this.migrationDataService.getMigrationConfiguration();
      currentConfig.columnMappings = []; // Clear mappings in service if no tables selected
      this.migrationDataService.setMigrationConfiguration(currentConfig);
    }
  }

  private saveAndClearCurrentMappings(): void {
    console.log('MigrationToolComponent: saveAndClearCurrentMappings called.');
    this.saveCurrentMappings(); // Save current state to the in-memory map and service
    this.columnMappings = []; // Clear the currently displayed mappings
    // Do NOT clear allColumnMappings here, as it holds mappings for other table pairs
    this.allSourceColumnsForSelectedTable = [];
    this.allDestinationColumnsForSelectedTable = [];
    // No need to explicitly clear in service here, as saveCurrentMappings already updates it
  }

  getAvailableSourceColumnsForMapping(currentMapping: ColumnMapping): Column[] {
    const selectedPrimaryColumnIds = new Set(this.columnMappings
      .filter(m => m !== currentMapping && m.sourceColumn)
      .map(m => m.sourceColumn!.id));

    const selectedSecondaryColumnId = currentMapping.secondarySourceColumn?.id;

    return this.allSourceColumnsForSelectedTable.filter(col =>
      !selectedPrimaryColumnIds.has(col.id) && col.id !== selectedSecondaryColumnId
    );
  }

  getAvailableSecondarySourceColumnsForMapping(currentMapping: ColumnMapping): Column[] {
    const selectedPrimaryColumnIds = new Set(this.columnMappings
      .filter(m => m.sourceColumn) // Check all primary source columns
      .map(m => m.sourceColumn!.id));

    const selectedSecondaryColumnIds = new Set(this.columnMappings
      .filter(m => m !== currentMapping && m.secondarySourceColumn) // Check other secondary source columns
      .map(m => m.secondarySourceColumn!.id));

    const currentPrimarySourceId = currentMapping.sourceColumn?.id;

    return this.allSourceColumnsForSelectedTable.filter(col =>
      // A column can be a secondary source if it's not already a primary source
      // and not already another secondary source, and not the current primary source.
      !selectedPrimaryColumnIds.has(col.id) &&
      !selectedSecondaryColumnIds.has(col.id) &&
      col.id !== currentPrimarySourceId
    );
  }

  getAvailableDestinationColumnsForMapping(currentMapping: ColumnMapping): Column[] {
    const selectedDestinationColumnIds = new Set(this.columnMappings
      .filter(m => m !== currentMapping && m.destinationColumn)
      .map(m => m.destinationColumn!.id));

    return this.allDestinationColumnsForSelectedTable.filter(col =>
      !selectedDestinationColumnIds.has(col.id)
    );
  }

  private updateAvailableColumnsForDropdowns(): void {
    console.log('MigrationToolComponent: updateAvailableColumnsForDropdowns called.');
    const sourceTable = this.sourceSchema.find(t => t.name === this.selectedSourceTableName);
    this.allSourceColumnsForSelectedTable = sourceTable ? sourceTable.columns : [];
    console.log('MigrationToolComponent: allSourceColumnsForSelectedTable:', this.allSourceColumnsForSelectedTable);

    const destinationTable = this.destinationSchema.find(t => t.name === this.selectedDestinationTableName);
    this.allDestinationColumnsForSelectedTable = destinationTable ? destinationTable.columns : [];
    console.log('MigrationToolComponent: allDestinationColumnsForSelectedTable:', this.allDestinationColumnsForSelectedTable);

    this.columnMappings.forEach(mapping => this.validateMapping(mapping));
  }

  // Determines if the secondary source column dropdown should be shown
  showSecondarySourceColumn(mapping: ColumnMapping): boolean {
    // Only show if the suggested transformation is CONCAT_FIRST_LAST_NAME_AUTO
    return mapping.transformationMode === 'SUGGESTED' && mapping.suggestedTransformationType === 'CONCAT_FIRST_LAST_NAME_AUTO';
  }

  // Helper to get display name for suggested transformations
  getSuggestedTransformationDisplayName(type: 'CONCAT_FIRST_LAST_NAME_AUTO' | 'AGE_TO_DATE_OF_BIRTH' | 'ADD_INDIAN_COUNTRY_CODE' | null | undefined): string {
    switch (type) {
      case 'CONCAT_FIRST_LAST_NAME_AUTO': return 'Concatenate First/Last Name';
      case 'AGE_TO_DATE_OF_BIRTH': return 'Age to Date of Birth';
      case 'ADD_INDIAN_COUNTRY_CODE': return 'Add Indian Country Code (+91)';
      case null: return 'No Suggestion'; // Explicitly handle null
      case undefined: return 'No Suggestion'; // Explicitly handle undefined
      default: return 'Unknown Suggested Transformation';
    }
  }

  addColumnMapping(): void {
    console.log('MigrationToolComponent: addColumnMapping called.');
    this.columnMappings.push({
      sourceColumn: null,
      secondarySourceColumn: null,
      destinationColumn: null,
      isValid: false,
      validationMessage: 'Select both primary source and destination columns.',
      transformationMode: 'NONE', // Default to 'NONE'
      suggestedTransformationType: null, // Initialize
      customCommand: '' // Initialize
    });
    this.showMappingError = false;
    this.migrationMessage = '';
    this.validateAllMappings(); // Re-validate after adding a new row
    this.saveCurrentMappings(); // Save changes after adding a new row
  }

  removeColumnMapping(index: number): void {
    console.log('MigrationToolComponent: removeColumnMapping called for index:', index);
    this.columnMappings.splice(index, 1);
    this.validateAllMappings();
    this.saveCurrentMappings(); // Save changes after removal
  }

  compareColumns(col1: Column | null, col2: Column | null): boolean {
    if (col1 && col2) {
      if (col1.id && col2.id) {
        return col1.id === col2.id;
      }
      return col1.name === col2.name && col1.parentTableName === col2.parentTableName;
    }
    return col1 === col2;
  }

  private isTextType = (type: string) =>
    type.includes('char') || type.includes('text') || type.includes('string') || type.includes('varchar') || type.includes('clob');
  private isNumericType = (type: string) =>
    type.includes('int') || type.includes('numeric') || type.includes('decimal') || type.includes('float') || type.includes('double') || type.includes('number');
  private isDateTimeType = (type: string) =>
    type.includes('date') || type.includes('time') || type.includes('timestamp');
  private isBooleanType = (type: string) =>
    type.includes('bool') || type.includes('tinyint(1)');

  // This method now only determines the *backend keyword* for a potential suggestion
  private determineSuggestedTransformationType(sourceColName: string, destColName: string, sourceType: string, destType: string): 'CONCAT_FIRST_LAST_NAME_AUTO' | 'AGE_TO_DATE_OF_BIRTH' | 'ADD_INDIAN_COUNTRY_CODE' | null {
    sourceColName = sourceColName.toLowerCase();
    destColName = destColName.toLowerCase();
    sourceType = sourceType.toLowerCase();
    destType = destType.toLowerCase();

    const sourceTableIsCustomers = this.selectedSourceTableName?.toLowerCase() === 'customers';
    const destTableIsClients = this.selectedDestinationTableName?.toLowerCase() === 'clients';

    // Auto Concatenation for full_name
    if (sourceTableIsCustomers && destTableIsClients && destColName === 'full_name' &&
        (sourceColName === 'first_name' || sourceColName === 'last_name') &&
        this.isTextType(sourceType) && this.isTextType(destType)) {
      return 'CONCAT_FIRST_LAST_NAME_AUTO';
    }

    // Predefined transformations
    if (sourceColName === 'age' && destColName === 'date_of_birth' && this.isNumericType(sourceType) && this.isDateTimeType(destType)) {
      return 'AGE_TO_DATE_OF_BIRTH';
    }
    if ((sourceColName.includes('contact') || sourceColName.includes('phone')) && (destColName.includes('phone') || destColName.includes('contact')) && this.isTextType(sourceType) && this.isTextType(destType)) {
      return 'ADD_INDIAN_COUNTRY_CODE';
    }

    return null; // No suggested transformation
  }

  // New method to handle transformation mode change
  onTransformationModeChange(mapping: ColumnMapping): void {
    console.log(`Transformation mode changed for mapping: ${mapping.transformationMode}`);
    // Clear custom command if not in CUSTOM_COMMAND mode
    if (mapping.transformationMode !== 'CUSTOM_COMMAND') {
      mapping.customCommand = '';
    }
    // Re-validate the mapping to update its status and message
    this.validateMapping(mapping);
  }

  validateMapping(mapping: ColumnMapping): void {
    mapping.isValid = true;
    mapping.validationMessage = 'Compatible.';
    // Do NOT reset suggestedTransformationType here, as it's determined by determineSuggestedTransformationType
    // and should persist unless the columns change.

    if (!mapping.sourceColumn || !mapping.destinationColumn) {
      mapping.isValid = false;
      mapping.validationMessage = 'Select both primary source and destination columns.';
      // When columns are not selected, force to NONE and clear any suggestions/custom commands
      mapping.transformationMode = 'NONE';
      mapping.suggestedTransformationType = null;
      mapping.customCommand = '';
      mapping.secondarySourceColumn = null;
      this.updateMappingErrorStatus();
      return;
    }

    const sourceType = mapping.sourceColumn.dataType.toLowerCase();
    const destType = mapping.destinationColumn.dataType.toLowerCase();
    const sourceColName = mapping.sourceColumn.name.toLowerCase();
    const destColName = mapping.destinationColumn.name.toLowerCase();

    let warnings: string[] = [];
    let criticalError = false;
    let currentBaseMessage = 'Compatible.';

    const currentMappingSourceKey = mapping.sourceColumn.id;
    const currentMappingSecondarySourceKey = mapping.secondarySourceColumn?.id || null;
    const currentMappingDestinationKey = mapping.destinationColumn.id;

    // --- Duplicate Mapping Checks ---
    const isPrimarySourceDuplicate = this.columnMappings.some(
      (m: ColumnMapping) => m !== mapping && m.sourceColumn?.id === currentMappingSourceKey
    );
    if (isPrimarySourceDuplicate) {
      mapping.isValid = false;
      mapping.validationMessage = `CRITICAL: Primary source column '${mapping.sourceColumn.name}' is already mapped in another row.`;
      mapping.transformationMode = 'NONE'; // Force to NONE on critical error
      mapping.suggestedTransformationType = null;
      mapping.customCommand = '';
      mapping.secondarySourceColumn = null;
      this.updateMappingErrorStatus();
      return;
    }

    if (currentMappingSecondarySourceKey) {
      const isSecondarySourceDuplicate = this.columnMappings.some(
        (m: ColumnMapping) => m !== mapping && m.secondarySourceColumn?.id === currentMappingSecondarySourceKey
      );
      if (isSecondarySourceDuplicate) {
        mapping.isValid = false;
        mapping.validationMessage = `CRITICAL: Secondary source column '${mapping.secondarySourceColumn?.name}' is already mapped as a secondary source in another row.`;
        mapping.transformationMode = 'NONE'; // Force to NONE on critical error
        mapping.suggestedTransformationType = null;
        mapping.customCommand = '';
        this.updateMappingErrorStatus();
        return;
      }
      if (currentMappingSourceKey === currentMappingSecondarySourceKey) {
        mapping.isValid = false;
        mapping.validationMessage = `CRITICAL: Primary and secondary source columns cannot be the same.`;
        mapping.transformationMode = 'NONE'; // Force to NONE on critical error
        mapping.suggestedTransformationType = null;
        mapping.customCommand = '';
        this.updateMappingErrorStatus();
        return;
      }
    }

    const isDestinationDuplicate = this.columnMappings.some(
      (m: ColumnMapping) => m !== mapping && m.destinationColumn?.id === currentMappingDestinationKey
    );
    if (isDestinationDuplicate) {
      mapping.isValid = false;
      mapping.validationMessage = `CRITICAL: Destination column '${mapping.destinationColumn.name}' is already a destination in another row.`;
      mapping.transformationMode = 'NONE'; // Force to NONE on critical error
      mapping.suggestedTransformationType = null;
      mapping.customCommand = '';
      this.updateMappingErrorStatus();
      return;
    }

    // --- Determine Suggested Transformation ---
    const determinedSuggestedType = this.determineSuggestedTransformationType(sourceColName, destColName, sourceType, destType);
    mapping.suggestedTransformationType = determinedSuggestedType; // Always update suggested type

    // If a suggestion applies and the user hasn't explicitly chosen CUSTOM_COMMAND or NONE
    if (determinedSuggestedType && mapping.transformationMode !== 'CUSTOM_COMMAND' && mapping.transformationMode !== 'NONE') {
      mapping.transformationMode = 'SUGGESTED';
      currentBaseMessage = `Suggested: ${this.getSuggestedTransformationDisplayName(determinedSuggestedType)} will be applied.`;
    } else if (!determinedSuggestedType && mapping.transformationMode === 'SUGGESTED') {
      // If no suggestion, and current mode is SUGGESTED, revert to NONE
      mapping.transformationMode = 'NONE';
      currentBaseMessage = 'No specific transformation suggested.';
    }


    // --- Handle Secondary Source Column Visibility based on Suggested Transformation ---
    if (mapping.transformationMode === 'SUGGESTED' && mapping.suggestedTransformationType === 'CONCAT_FIRST_LAST_NAME_AUTO') {
      // For CONCAT_FIRST_LAST_NAME_AUTO, ensure secondary source is selected and is the other name
      const primaryName = mapping.sourceColumn?.name.toLowerCase();
      const secondaryName = mapping.secondarySourceColumn?.name.toLowerCase();
      const hasBothNames = (primaryName === 'first_name' && secondaryName === 'last_name') || (primaryName === 'last_name' && secondaryName === 'first_name');

      if (!mapping.secondarySourceColumn || !hasBothNames) {
        warnings.push('Warning: For "Concatenate First/Last Name", ensure both "first_name" and "last_name" are mapped correctly as primary and secondary sources.');
      }
    } else {
      mapping.secondarySourceColumn = null; // Clear secondary source if not in CONCAT_FULL_NAME mode
    }


    // --- Validate Custom Command Mode ---
    if (mapping.transformationMode === 'CUSTOM_COMMAND') {
      if (!mapping.customCommand?.trim()) {
        mapping.isValid = false;
        mapping.validationMessage = 'Custom command cannot be empty.';
        criticalError = true; // Treat empty custom command as critical error
      } else {
        // Validate custom command for dangerous SQL operations
        const sqlValidation = this.validateSqlCommand(mapping.customCommand);
        if (!sqlValidation.isValid) {
          mapping.isValid = false;
          mapping.validationMessage = sqlValidation.errorMessage || 'Custom command contains restricted operations.';
          criticalError = true; // Treat dangerous SQL as critical error
        } else {
          // Basic validation for custom command syntax (can be expanded)
          if (!/^[a-zA-Z_]+\(.*\)$/.test(mapping.customCommand.trim())) {
              warnings.push('Warning: Custom command syntax might be incorrect. Expected format: functionName(\'arg\', ...).');
          }
          currentBaseMessage = `Custom command '${mapping.customCommand}' will be applied.`;
        }
      }
    }


    // --- Type Compatibility Checks (Only if NONE mode, or if CUSTOM_COMMAND is selected) ---
    // This logic runs if mode is NONE, or if CUSTOM_COMMAND is selected but doesn't explicitly handle type conversion.
    // If a suggested transformation is active, its compatibility is implicitly handled by its definition.
    if (mapping.transformationMode === 'NONE' || mapping.transformationMode === 'CUSTOM_COMMAND') {
      if (this.isTextType(sourceType) && this.isTextType(destType)) {
        if (mapping.transformationMode === 'NONE') currentBaseMessage = 'Compatible (String to String).';
        if (mapping.sourceColumn.dataType !== mapping.destinationColumn.dataType) {
          warnings.push(`Type definition mismatch: '${mapping.sourceColumn.dataType}' to '${mapping.destinationColumn.dataType}'.`);
        }
      } else if (this.isNumericType(sourceType) && this.isNumericType(destType)) {
        if (mapping.transformationMode === 'NONE') currentBaseMessage = 'Compatible (Numeric to Numeric).';
        if (sourceType === 'bigint' && destType === 'int') {
          criticalError = true;
          currentBaseMessage = 'CRITICAL: BIGINT to INT (potential overflow, requires custom transformation).';
        }
      } else if (this.isDateTimeType(sourceType) && this.isDateTimeType(destType)) {
        if (mapping.transformationMode === 'NONE') currentBaseMessage = 'Compatible (Date/Time to Date/Time).';
      } else if (this.isBooleanType(sourceType) && this.isBooleanType(destType)) {
        if (mapping.transformationMode === 'NONE') currentBaseMessage = 'Compatible (Boolean to Boolean).';
      }
      else if (this.isNumericType(sourceType) && this.isTextType(destType)) {
        if (mapping.transformationMode === 'NONE') currentBaseMessage = 'Conversion: Numeric to Text (generally safe).';
      } else if (this.isDateTimeType(sourceType) && this.isTextType(destType)) {
        if (mapping.transformationMode === 'NONE') currentBaseMessage = 'Conversion: Date/Time to Text (generally safe).';
      }
      else if (this.isTextType(sourceType) && this.isNumericType(destType)) {
        criticalError = true;
        currentBaseMessage = 'CRITICAL: Text to Numeric (requires custom transformation).';
      }
      else if (this.isTextType(sourceType) && this.isDateTimeType(destType)) {
        criticalError = true;
        currentBaseMessage = 'CRITICAL: Text to Date/Time (requires custom transformation).';
      }
      else if (mapping.transformationMode === 'NONE') { // Only if no specific transformation is active
        criticalError = true;
        currentBaseMessage = `CRITICAL: Incompatible data types: ${mapping.sourceColumn.dataType} to ${mapping.destinationColumn.dataType}.`;
      }

      // Semantic mismatch warning for NONE mode
      if (!criticalError && mapping.transformationMode === 'NONE') {
        const isSourceIdLike = sourceColName.includes('id') || sourceColName.includes('_no') || sourceColName.includes('num') || sourceColName.includes('code');
        const isDestIdLike = destColName.includes('id') || destColName.includes('_no') || destColName.includes('num') || destColName.includes('code');
        const isSourcePhoneLike = sourceColName.includes('phone') || sourceColName.includes('contact_number') || sourceColName.includes('tel');
        const isDestPhoneLike = destColName.includes('phone') || destColName.includes('contact_number') || destColName.includes('tel');
        const isSourceNameLike = sourceColName.includes('name') || sourceColName.includes('first_name') || sourceColName.includes('last_name') || sourceColName.includes('full_name');
        const isDestNameLike = destColName.includes('name') || destColName.includes('description') || destColName.includes('title');

        if (this.isTextType(sourceType) && this.isTextType(destType)) {
          if (
            (isSourceIdLike && isDestNameLike) ||
            (isSourceNameLike && isDestIdLike) ||
            (isSourcePhoneLike && isDestNameLike) ||
            (isSourceNameLike && isDestPhoneLike) ||
            (isSourceIdLike && isDestPhoneLike) ||
            (isSourcePhoneLike && isDestIdLike)
          ) {
            warnings.push('Semantic mismatch detected. Verify data meaning for direct transfer.');
          }
        }
      }
    }


    mapping.isValid = !criticalError;
    if (warnings.length > 0) {
      mapping.validationMessage = currentBaseMessage.replace('Compatible.', 'Potential Issues:') + ' ' + warnings.join(' ');
      if (criticalError) {
        mapping.validationMessage = (warnings.length > 0 ? warnings.join(' ') + ' ' : '') + currentBaseMessage;
      }
    } else {
      mapping.validationMessage = currentBaseMessage;
    }

    this.updateMappingErrorStatus();
  }

  validateAllMappings(): boolean {
    console.log('MigrationToolComponent: validateAllMappings called.');
    console.log(`  isSourceConnected: ${this.isSourceConnected}`);
    console.log(`  isDestinationConnected: ${this.isDestinationConnected}`);
    console.log(`  selectedSourceTableName: '${this.selectedSourceTableName}'`);
    console.log(`  selectedDestinationTableName: '${this.selectedDestinationTableName}'`);
    console.log(`  sourceSchema.length: ${this.sourceSchema.length}`);
    console.log(`  destinationSchema.length: ${this.destinationSchema.length}`);
    console.log(`  columnMappings.length: ${this.columnMappings.length}`);


    // Only validate if connections are established and tables are selected
    if (!this.isSourceConnected || !this.isDestinationConnected || !this.selectedSourceTableName || !this.selectedDestinationTableName) {
      this.showMappingError = true;
      this.migrationMessage = 'Please establish both database connections and select tables to configure mappings.';
      return false;
    }

    const currentSourceTable = this.sourceSchema.find(t => t.name === this.selectedSourceTableName);
    const currentDestinationTable = this.destinationSchema.find(t => t.name === this.selectedDestinationTableName);

    if (!currentSourceTable || !currentDestinationTable || !currentSourceTable.columns || !currentDestinationTable.columns) {
      this.showMappingError = true;
      this.migrationMessage = 'Source or destination table schema is not available. Please ensure connections and schema fetching completed.';
      return false;
    }

    if (this.columnMappings.length === 0) {
      if (currentSourceTable.columns.length > 0 && currentDestinationTable.columns.length > 0) {
        this.showMappingError = true;
        this.migrationMessage = 'Please add at least one column mapping.';
        return false;
      }
      this.showMappingError = false;
      this.migrationMessage = '';
      return true;
    }

    // Ensure all mappings are valid AND if CUSTOM_COMMAND is selected, the command is not empty
    const allMappingsAreValidAndComplete = this.columnMappings.every(mapping => {
      const baseValid = mapping.sourceColumn && mapping.destinationColumn && mapping.isValid;
      if (mapping.transformationMode === 'CUSTOM_COMMAND') {
        return baseValid && mapping.customCommand && mapping.customCommand.trim().length > 0;
      }
      return baseValid;
    });

    this.showMappingError = !allMappingsAreValidAndComplete;
    if (this.showMappingError) {
      this.migrationMessage = 'Please ensure all column mappings are valid and complete before proceeding.';
    } else {
      this.migrationMessage = '';
    }
    console.log(`  allMappingsAreValidAndComplete: ${allMappingsAreValidAndComplete}`);
    return allMappingsAreValidAndComplete;
  }

  private updateMappingErrorStatus(): void {
    const allValid = this.columnMappings.every(mapping => mapping.isValid);
    if (this.columnMappings.length === 0 && this.selectedSourceTableName && this.selectedDestinationTableName) {
      this.showMappingError = true;
      this.migrationMessage = 'Please add at least one column mapping.';
    } else if (!allValid) {
      this.showMappingError = true;
      this.migrationMessage = 'Please ensure all column mappings are valid and complete before proceeding.';
    } else {
      this.migrationMessage = '';
    }
  }

  allMappingsValid(): boolean {
    // This method is called by the "Proceed" button's disabled state.
    // It should reflect the overall readiness for migration.
    return this.validateAllMappings();
  }

  // Method to view table data in a modal
  viewTableData(databaseName: string, tableName: string, dbType: 'source' | 'destination'): void {
    console.log(`MigrationToolComponent: Fetching data for preview: ${databaseName}.${tableName}`);
    // Pass DbConnectionParams for the selected database to the service call
    let params: DbConnectionParams;
    if (dbType === 'source') {
      params = { ...this.sourceDbParams, password: this.tempSourcePassword };
    } else {
      params = { ...this.destinationDbParams, password: this.tempDestinationPassword };
    }
    console.log(`MigrationToolComponent: Using stored password for ${dbType} table data preview`);
    this.migrationService.getTableData(databaseName, tableName, params) // Pass params
      .subscribe({
        next: (response: TableDataResponse) => {
          console.log(`MigrationToolComponent: Data preview received for ${databaseName}.${tableName}:`, response);
          this.previewTableName = `${databaseName}.${tableName}`;
          this.previewTableData = {
            headers: response.columns.map((col: ColumnMetadata) => col.name), // Corrected to ColumnMetadata
            rows: response.rows,
            totalRows: response.totalRows
          };
          this.showDataPreviewModal = true;
        },
        error: (error: HttpErrorResponse) => {
          console.error(`MigrationToolComponent: Failed to fetch data for ${databaseName}.${tableName}:`, error);
          // Changed alert to console.error as per instructions, and added a message to migrationMessage
          this.migrationMessage = `Failed to load data for ${tableName}: ${error.error?.message || error.message || 'Server error'}`;
          this.showMappingError = true;
        }
      });
  }

  closeDataPreviewModal(): void {
    console.log('MigrationToolComponent: Closing data preview modal.');
    this.showDataPreviewModal = false;
    this.previewTableName = '';
    this.previewTableData = { headers: [], rows: [], totalRows: 0 };
  }


  navigateToMockDashboardAndSaveConfig(): void {
    console.log('MigrationToolComponent: navigateToMockDashboardAndSaveConfig called.');
    if (!this.allMappingsValid()) {
      console.warn('MigrationToolComponent: Cannot navigate: Column mappings are not valid or complete.');
      return;
    }
    // Save the CURRENT in-memory configuration, including schemas, to the service
    // The service will handle stripping passwords for localStorage persistence
    const currentConfig: MigrationConfigurationState = {
      sourceDbParams: this.sourceDbParams,
      destinationDbParams: this.destinationDbParams,
      sourceSchema: this.sourceSchema, // Save current schemas for dashboard display
      destinationSchema: this.destinationSchema, // Save current schemas for dashboard display
      selectedSourceTableName: this.selectedSourceTableName,
      selectedDestinationTableName: this.selectedDestinationTableName,
      columnMappings: this.columnMappings.map((m: ColumnMapping) => ({
        sourceColumn: m.sourceColumn,
        secondarySourceColumn: m.secondarySourceColumn,
        destinationColumn: m.destinationColumn,
        transformationMode: m.transformationMode,
        suggestedTransformationType: m.suggestedTransformationType,
        customCommand: m.customCommand,
        isValid: m.isValid, // Keep isValid for potential debugging on dashboard, though not persisted
        validationMessage: m.validationMessage // Keep validationMessage
      }))
    };
    this.migrationDataService.setMigrationConfiguration(currentConfig);
    console.log('MigrationToolComponent: Migration configuration saved to service.');


    console.log('MigrationToolComponent: Initiating migration with backend...');
    this.migrationService.startMigration(
      this.sourceDbParams.databaseName, // Use databaseName as profile name
      this.selectedSourceTableName,
      this.destinationDbParams.databaseName, // Use databaseName as profile name
      this.selectedDestinationTableName,
      this.columnMappings.map((m: ColumnMapping) => ({
        sourceColumnName: m.sourceColumn?.name ?? null,
        secondaryColumnName: m.secondarySourceColumn?.name ?? null,
        destinationColumnName: m.destinationColumn?.name ?? null,
        transformationType: this.getTransformationTypeForDto(m),
        transformationParameter: m.transformationMode === 'CUSTOM_COMMAND' ? (m.customCommand || null) : null // Pass custom command as parameter, ensure null if empty
      }))
    ).subscribe({
      next: (report) => {
        console.log('MigrationToolComponent: Migration initiated, report received:', report);
        this.migrationDataService.setMigrationReport(report); // Set report in service (in-memory)
        console.log('MigrationToolComponent: Migration data and report saved. Navigating to dashboard.');
        this.router.navigate(['/mock-dashboard']);
      },
      error: (err) => {
        console.error('MigrationToolComponent: Error initiating migration:', err);
        this.migrationMessage = `Error initiating data processing: ${err.error?.message || err.message || 'Server error'}`;
        this.showMappingError = true;
        const errorReport: MigrationReport = {
          status: 'FAILED',
          totalSourceRowsProcessed: 0,
          rowsMigratedInserted: 0,
          rowsMigratedUpdated: 0,
          rowsSkippedDueToPrimaryKeyConflict: 0,
          rowsSkippedDueToNoMapping: 0,
          rowsSkippedDueToIdenticalData: 0,
          messages: [`Error initiating data processing: ${err.error?.message || err.message || 'Server error'}`],
          errors: [err.error?.message || err.message || 'Server error']
        };
        this.migrationDataService.setMigrationReport(errorReport);
        console.log('MigrationToolComponent: Error report saved. Navigating to dashboard to show error.');
        this.router.navigate(['/mock-dashboard']);
      }
    });
  }

  private getTransformationTypeForDto(mapping: ColumnMapping): string | null {
    if (mapping.transformationMode === 'CUSTOM_COMMAND') {
      return 'CUSTOM_COMMAND'; // Backend will recognize this and parse customCommand
    }
    if (mapping.transformationMode === 'SUGGESTED') {
      // Ensure it's not undefined before returning
      return mapping.suggestedTransformationType ?? null; // Send the specific suggested type to backend
    }
    // If NONE, or if suggestedType is null, send null
    return null;
  }

  // --- ML Suggestions Methods ---

  toggleMlSuggestionsPanel(): void {
    this.showMlSuggestionsPanel = !this.showMlSuggestionsPanel;
  }

  applyMlSuggestion(suggestion: MlMappingSuggestion): void {
    console.log('MigrationToolComponent: Applying ML suggestion:', suggestion);
    
    // Find the corresponding columns in the current schemas
    const sourceColumn = this.allSourceColumnsForSelectedTable.find(
      col => col.name.toLowerCase() === suggestion.sourceColumnName.toLowerCase()
    );
    const destinationColumn = this.allDestinationColumnsForSelectedTable.find(
      col => col.name.toLowerCase() === suggestion.destinationColumnName.toLowerCase()
    );

    if (!sourceColumn || !destinationColumn) {
      console.warn('MigrationToolComponent: Could not find columns for ML suggestion:', suggestion);
      return;
    }

    // Check if a mapping already exists for these columns
    const existingMappingIndex = this.columnMappings.findIndex(
      m => m.sourceColumn?.id === sourceColumn.id || m.destinationColumn?.id === destinationColumn.id
    );

    if (existingMappingIndex >= 0) {
      // Update existing mapping
      this.columnMappings[existingMappingIndex].sourceColumn = sourceColumn;
      this.columnMappings[existingMappingIndex].destinationColumn = destinationColumn;
      this.columnMappings[existingMappingIndex].transformationMode = 'NONE'; // Default to NONE, user can change
      this.validateMapping(this.columnMappings[existingMappingIndex]);
    } else {
      // Create new mapping
      const newMapping: ColumnMapping = {
        sourceColumn: sourceColumn,
        secondarySourceColumn: null,
        destinationColumn: destinationColumn,
        transformationMode: 'NONE',
        suggestedTransformationType: null,
        customCommand: '',
        isValid: false,
        validationMessage: ''
      };
      
      this.columnMappings.push(newMapping);
      this.validateMapping(newMapping);
    }

    this.saveCurrentMappings();
    this.validateAllMappings();
    
    // Show success message
    this.migrationMessage = `Applied ML suggestion: ${sourceColumn.name} → ${destinationColumn.name} (${(suggestion.confidence * 100).toFixed(1)}% confidence)`;
  }

  getMlSuggestionsForCurrentTables(): MlMappingSuggestion[] {
    if (!this.selectedSourceTableName || !this.selectedDestinationTableName) {
      return [];
    }
    
    // Filter suggestions based on current table selection and available columns
    return this.mlSuggestions.filter(suggestion => {
      const sourceColumnExists = this.allSourceColumnsForSelectedTable.some(
        col => col.name.toLowerCase() === suggestion.sourceColumnName.toLowerCase()
      );
      const destColumnExists = this.allDestinationColumnsForSelectedTable.some(
        col => col.name.toLowerCase() === suggestion.destinationColumnName.toLowerCase()
      );
      return sourceColumnExists && destColumnExists;
    });
  }

  // --- Helper Methods ---

  /**
   * Validates SQL query/command to prevent dangerous operations like DROP and DELETE
   * @param sqlCommand The SQL command to validate
   * @returns Object containing isValid boolean and errorMessage if invalid
   */
  private validateSqlCommand(sqlCommand: string): { isValid: boolean; errorMessage?: string } {
    const normalizedCommand = sqlCommand.trim().toLowerCase();
    
    // Check for DROP commands
    if (normalizedCommand.includes('drop ')) {
      const dropMatch = normalizedCommand.match(/\bdrop\s+(table|database|schema|index|view|trigger|procedure|function)\b/);
      if (dropMatch) {
        return {
          isValid: false,
          errorMessage: `DROP ${dropMatch[1].toUpperCase()} commands are restricted in custom commands to prevent data loss. Please contact an administrator if this operation is necessary.`
        };
      }
    }
    
    // Check for DELETE commands
    if (normalizedCommand.includes('delete ')) {
      const deleteMatch = normalizedCommand.match(/\bdelete\s+from\b/);
      if (deleteMatch) {
        return {
          isValid: false,
          errorMessage: 'DELETE commands are restricted in custom commands to prevent accidental data loss. Please use data transformation functions or contact an administrator for data modifications.'
        };
      }
    }
    
    return { isValid: true };
  }
}