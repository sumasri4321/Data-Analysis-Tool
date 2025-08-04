// src/app/mock-migration-dashboard/mock-migration-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MigrationDataService, MigrationReport, ColumnMapping, MigrationConfigurationState } from '../services/migration-data.service';
import { MigrationService } from '../services/migration.service';

@Component({
  selector: 'app-mock-migration-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './mock-migration-dashboard.component.html',
  styleUrls: ['./mock-migration-dashboard.component.css']
})
export class MockMigrationDashboardComponent implements OnInit {
  migrationReport: MigrationReport | null = null;
  migrationConfiguration: MigrationConfigurationState | null = null;
  isDownloading = false; // NEW: Track download state

  // These properties are derived from migrationConfiguration for template convenience
  columnMappings: ColumnMapping[] = [];
  sourceTableName: string = '';
  destinationTableName: string = '';

  constructor(
    private migrationDataService: MigrationDataService,
    private migrationService: MigrationService, // NEW: Inject MigrationService
    private router: Router
  ) { }

  ngOnInit(): void {
    this.migrationReport = this.migrationDataService.getMigrationReport();
    this.migrationConfiguration = this.migrationDataService.getMigrationConfiguration();

    if (this.migrationConfiguration) {
      this.columnMappings = this.migrationConfiguration.columnMappings || [];
      this.sourceTableName = this.migrationConfiguration.selectedSourceTableName || '';
      this.destinationTableName = this.migrationConfiguration.selectedDestinationTableName || '';
    }
  }

  /**
   * Helper to determine status class for styling based on migration report status.
   * @param status The status string from the migration report.
   * @returns A CSS class string.
   */
  getStatusClass(status: string | undefined | null): string {
    if (!status) return 'status-unknown';
    switch (status) {
      case 'SUCCESS': return 'status-success';
      case 'PARTIAL_SUCCESS': return 'status-partial-success';
      case 'FAILED': return 'status-failed';
      default: return 'status-unknown';
    }
  }

  /**
   * Helper to get display name for suggested transformations.
   * This is duplicated from migration-tool.component.ts to keep this component standalone.
   * @param type The suggested transformation type string.
   * @returns A user-friendly display name.
   */
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

  /**
   * Generates a comma-separated string of mapped source column names.
   * Handles null/undefined names and provides a fallback.
   * @returns A string of mapped source column names.
   */
  getMappedSourceColumnNames(): string {
    return this.columnMappings
      .map(m => m.sourceColumn?.name)
      .filter((name): name is string => name !== null && name !== undefined)
      .join(', ') || 'None';
  }

  /**
   * Generates a comma-separated string of mapped destination column names.
   * Handles null/undefined names and provides a fallback.
   * @returns A string of mapped destination column names.
   */
  getMappedDestinationColumnNames(): string {
    return this.columnMappings
      .map(m => m.destinationColumn?.name)
      .filter((name): name is string => name !== null && name !== undefined)
      .join(', ') || 'None';
  }

  /**
   * Clears stored migration data and navigates back to the migration tool.
   */
  startNewMigration(): void {
    this.migrationDataService.clearAllData(); // Clear saved data
    this.router.navigate(['/configure']); // Navigate to the configure page
  }

  /**
   * Downloads the executed SQL queries as a .sql file
   */
  downloadSqlQueries(): void {
    if (!this.migrationReport?.executedQueries || !this.migrationConfiguration) {
      console.error('No queries or configuration available for download');
      return;
    }

    this.isDownloading = true;

    const sourceDatabaseName = this.migrationConfiguration.sourceDbParams?.databaseName || 'unknown_source';
    const destinationDatabaseName = this.migrationConfiguration.destinationDbParams?.databaseName || 'unknown_destination';

    this.migrationService.downloadMigrationQueries(
      sourceDatabaseName,
      this.sourceTableName,
      destinationDatabaseName,
      this.destinationTableName,
      this.migrationReport.executedQueries
    ).subscribe({
      next: (blob: Blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.download = `migration_queries_${this.sourceTableName}_to_${this.destinationTableName}_${timestamp}.sql`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
        
        console.log('SQL queries file downloaded successfully');
      },
      error: (error) => {
        console.error('Error downloading SQL queries:', error);
        this.isDownloading = false;
        // You could add a toast notification here
        alert('Failed to download SQL queries. Please try again.');
      }
    });
  }
}
