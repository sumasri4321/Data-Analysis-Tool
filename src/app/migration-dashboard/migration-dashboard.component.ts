// // src/app/migration-dashboard/migration-dashboard.component.ts

// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { ConnectionProfile } from '../models/connection-profile.model';

// @Component({
//   selector: 'app-migration-dashboard',
//   templateUrl: './migration-dashboard.component.html',
//   styleUrls: ['./migration-dashboard.component.css']
// })
// export class MigrationDashboardComponent implements OnInit {

//   backendUrl = 'http://localhost:8080/api/db-profiles';
//   savedProfiles: ConnectionProfile[] = [];

//   constructor(private http: HttpClient) { }

//   ngOnInit(): void {
//     this.getSavedConnectionProfiles();
//   }

//   getSavedConnectionProfiles(): void {
//     this.http.get<ConnectionProfile[]>(`${this.backendUrl}/list`).subscribe({
//       next: (profiles) => {
//         this.savedProfiles = profiles;
//         console.log('Fetched saved profiles:', this.savedProfiles);
//       },
//       error: (error) => {
//         console.error('Error fetching saved profiles:', error);
//       }
//     });
//   }
// }
// src/app/pages/migration-dashboard/migration-dashboard.component.ts

// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common'; // For *ngIf and *ngFor directives
// import { ConnectionProfile } from '../models/connection-profile.model'; // Correct relative path to models folder

// @Component({
//   selector: 'app-migration-dashboard',
//   standalone: true, // Mark as standalone
//   imports: [CommonModule], // Import CommonModule for directives like *ngIf, *ngFor
//   templateUrl: './migration-dashboard.component.html',
//   styleUrls: ['./migration-dashboard.component.css']
// })
// export class MigrationDashboardComponent implements OnInit {

//   backendUrl = 'http://localhost:8080/api/db-profiles';
//   savedProfiles: ConnectionProfile[] = [];

//   constructor(private http: HttpClient) { }

//   ngOnInit(): void {
//     this.getSavedConnectionProfiles();
//   }

//   getSavedConnectionProfiles(): void {
//     this.http.get<ConnectionProfile[]>(`${this.backendUrl}/list`).subscribe({
//       next: (profiles) => {
//         this.savedProfiles = profiles;
//         console.log('Fetched saved profiles:', this.savedProfiles);
//       },
//       error: (error) => {
//         console.error('Error fetching saved profiles:', error);
//         alert('Failed to load connection profiles from backend.');
//       }
//     });
//   }
// }
// src/app/pages/migration-dashboard/migration-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ConnectionProfile } from '../models/connection-profile.model';

@Component({
  selector: 'app-migration-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './migration-dashboard.component.html',
  styleUrls: ['./migration-dashboard.component.css']
})
export class MigrationDashboardComponent implements OnInit {

  backendUrl = 'http://localhost:8080/api/db-profiles';
  savedProfiles: ConnectionProfile[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getSavedConnectionProfiles();
  }

  getSavedConnectionProfiles(): void {
    this.http.get<ConnectionProfile[]>(`${this.backendUrl}/list`).subscribe({
      next: (profiles) => {
        this.savedProfiles = profiles;
        console.log('Fetched saved profiles:', this.savedProfiles);
      },
      error: (error) => {
        console.error('Error fetching saved profiles:', error);
        alert('Failed to load connection profiles from backend.');
      }
    });
  }

  // NEW HELPER METHOD:
  getFileName(filePath: string | null | undefined): string {
    if (!filePath) {
      return ''; // Return empty string if path is null or undefined
    }
    // Use a regex to split by either backslash or forward slash,
    // then get the last part (the file name).
    // Use || '' to handle cases where pop() might return undefined (e.g., if path is just a slash)
    const parts = filePath.split(/[\\/]/);
    return parts.pop() || '';
  }
}