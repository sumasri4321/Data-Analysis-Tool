// // import { Component } from '@angular/core';
// // import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';

// // @Component({
// //   selector: 'app-db-config',
// //   templateUrl: './db-config.component.html',
// //   imports : [CommonModule,FormsModule],
// //   standalone: true
// // })
// // export class DbConfigComponent {
// //   source = {
// //     dbType: '',
// //     username: '',
// //     password: ''
// //   };
// //   destination = {
// //     dbType: '',
// //     username: '',
// //     password: ''
// //   };

// //   sourceFile: File | null = null;
// //   destinationFile: File | null = null;

// //   constructor(private http: HttpClient) {}

// //   // Capture the selected source file
// //   onSourceFileSelected(event: any) {
// //     const fileList: FileList = event.target.files;
// //     if (fileList.length > 0) {
// //       this.sourceFile = fileList[0];
// //       console.log('Source file selected:', this.sourceFile.name);
// //     }
// //   }

// //   // Capture the selected destination file
// //   onDestinationFileSelected(event: any) {
// //     const fileList: FileList = event.target.files;
// //     if (fileList.length > 0) {
// //       this.destinationFile = fileList[0];
// //       console.log('Destination file selected:', this.destinationFile.name);
// //     }
// //   }

// //   submit() {
// //     if (!this.sourceFile || !this.destinationFile) {
// //       alert('Please select both source and destination database files.');
// //       return;
// //     }

// //     // Prepare FormData to send files and other info
// //     const formData = new FormData();

// //     // Append source file and other source DB info
// //     formData.append('sourceFile', this.sourceFile);
// //     formData.append('sourceDbType', this.source.dbType);
// //     formData.append('sourceUsername', this.source.username);
// //     formData.append('sourcePassword', this.source.password);

// //     // Append destination file and other destination DB info
// //     formData.append('destinationFile', this.destinationFile);
// //     formData.append('destinationDbType', this.destination.dbType);
// //     formData.append('destinationUsername', this.destination.username);
// //     formData.append('destinationPassword', this.destination.password);
// //     // formData.append('sourceDatabaseName', this.source.databaseName);
// // // ... same for destination


// //     // Send to backend - example URL, update as needed
// //     this.http.post('http://localhost:8080/api/db-config/upload', formData)
// //       .subscribe({
// //         next: () => alert('Files and DB info uploaded successfully!'),
// //         error: (err: HttpErrorResponse) => alert('Upload failed: ' + err.message)
// //       });
// //   }

// // }

// // import { Component } from '@angular/core';
// // import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';

// // @Component({
// //   selector: 'app-db-config',
// //   templateUrl: './db-config.component.html',
// //   imports : [CommonModule,FormsModule],
// //   standalone: true
// // })
// // export class DbConfigComponent {
// //   source = {
// //     dbType: '',
// //     username: '',
// //     password: ''
// //     // Add jdbcUrl here if you plan to include it in the form
// //     // jdbcUrl: ''
// //   };
// //   destination = {
// //     dbType: '',
// //     username: '',
// //     password: ''
// //     // Add jdbcUrl here if you plan to include it in the form
// //     // jdbcUrl: ''
// //   };

// //   sourceFile: File | null = null;
// //   destinationFile: File | null = null;

// //   constructor(private http: HttpClient) {}

// //   // Capture the selected source file
// //   onSourceFileSelected(event: any) {
// //     const fileList: FileList = event.target.files;
// //     if (fileList.length > 0) {
// //       this.sourceFile = fileList[0];
// //       console.log('Source file selected:', this.sourceFile.name);
// //     }
// //   }

// //   // Capture the selected destination file
// //   onDestinationFileSelected(event: any) {
// //     const fileList: FileList = event.target.files;
// //     if (fileList.length > 0) {
// //       this.destinationFile = fileList[0];
// //       console.log('Destination file selected:', this.destinationFile.name);
// //     }
// //   }

// //   submit() {
// //     if (!this.sourceFile || !this.destinationFile) {
// //       alert('Please select both source and destination database files.');
// //       return;
// //     }

// //     // Prepare FormData to send files and other info
// //     const formData = new FormData();

// //     // Append source file and other source DB info
// //     formData.append('sourceFile', this.sourceFile);
// //     formData.append('sourceDbType', this.source.dbType.toUpperCase()); // <<< FIXED: Convert to uppercase
// //     formData.append('sourceUsername', this.source.username);
// //     formData.append('sourcePassword', this.source.password);
// //     // If you add jdbcUrl input to HTML and model, uncomment this:
// //     // if (this.source.jdbcUrl) {
// //     //   formData.append('sourceJdbcUrl', this.source.jdbcUrl);
// //     // }


// //     // Append destination file and other destination DB info
// //     formData.append('destinationFile', this.destinationFile);
// //     formData.append('destinationDbType', this.destination.dbType.toUpperCase()); // <<< FIXED: Convert to uppercase
// //     formData.append('destinationUsername', this.destination.username);
// //     formData.append('destinationPassword', this.destination.password);
// //     // If you add jdbcUrl input to HTML and model, uncomment this:
// //     // if (this.destination.jdbcUrl) {
// //     //   formData.append('destinationJdbcUrl', this.destination.jdbcUrl);
// //     // }

// //     // Send to backend
// //     this.http.post('http://localhost:8080/api/db-config/upload', formData)
// //       .subscribe({
// //         next: (response) => {
// //           console.log('Upload successful:', response);
// //           alert('Files and DB info uploaded successfully!');
// //           // You can now process the response, e.g., display profile IDs
// //         },
// //         error: (err: HttpErrorResponse) => {
// //           console.error('Upload failed:', err);
// //           let errorMessage = 'Upload failed: An unknown error occurred.';
// //           if (err.error && err.error.message) {
// //             errorMessage = 'Upload failed: ' + err.error.message;
// //           } else if (err.message) {
// //             errorMessage = 'Upload failed: ' + err.message;
// //           }
// //           alert(errorMessage);
// //         }
// //       });
// //   }
// // }

// import { Component } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router'; // <<< ADD THIS IMPORT

// @Component({
//   selector: 'app-db-config',
//   templateUrl: './db-config.component.html',
//   imports : [CommonModule,FormsModule],
//   standalone: true
// })
// export class DbConfigComponent {
//   source = {
//     dbType: '',
//     username: '',
//     password: ''
//   };
//   destination = {
//     dbType: '',
//     username: '',
//     password: ''
//   };

//   sourceFile: File | null = null;
//   destinationFile: File | null = null;

//   constructor(private http: HttpClient, private router: Router) {} // <<< INJECT Router

//   // Capture the selected source file
//   onSourceFileSelected(event: any) {
//     const fileList: FileList = event.target.files;
//     if (fileList.length > 0) {
//       this.sourceFile = fileList[0];
//       console.log('Source file selected:', this.sourceFile.name);
//     }
//   }

//   // Capture the selected destination file
//   onDestinationFileSelected(event: any) {
//     const fileList: FileList = event.target.files;
//     if (fileList.length > 0) {
//       this.destinationFile = fileList[0];
//       console.log('Destination file selected:', this.destinationFile.name);
//     }
//   }

//   submit() {
//     if (!this.sourceFile || !this.destinationFile) {
//       alert('Please select both source and destination database files.');
//       return;
//     }

//     const formData = new FormData();

//     formData.append('sourceFile', this.sourceFile);
//     formData.append('sourceDbType', this.source.dbType.toUpperCase());
//     formData.append('sourceUsername', this.source.username);
//     formData.append('sourcePassword', this.source.password);

//     formData.append('destinationFile', this.destinationFile);
//     formData.append('destinationDbType', this.destination.dbType.toUpperCase());
//     formData.append('destinationUsername', this.destination.username);
//     formData.append('destinationPassword', this.destination.password);

//     this.http.post('http://localhost:8080/api/db-config/upload', formData)
//       .subscribe({
//         next: (response) => {
//           console.log('Upload successful:', response);
//           alert('Files and DB info uploaded successfully!');
//           // Redirect to the migration dashboard
//           this.router.navigate(['/migrate-data']); // <<< ADD THIS LINE FOR REDIRECTION
//         },
//         error: (err: HttpErrorResponse) => {
//           console.error('Upload failed:', err);
//           let errorMessage = 'Upload failed: An unknown error occurred.';
//           if (err.error && err.error.message) {
//             errorMessage = 'Upload failed: ' + err.error.message;
//           } else if (err.message) {
//             errorMessage = 'Upload failed: ' + err.message;
//           }
//           alert(errorMessage);
//         }
//       });
//   }
// }
// src/app/pages/db-config/db-config.component.ts

import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router for navigation

@Component({
  selector: 'app-db-config',
  templateUrl: './db-config.component.html',
  imports : [CommonModule,FormsModule],
  standalone: true
})
export class DbConfigComponent {
  source = {
    dbType: '',
    username: '',
    password: '',
    keyVault: ''
  };
  destination = {
    dbType: '',
    username: '',
    password: '',
    keyVault: ''
  };

  sourceFile: File | null = null;
  destinationFile: File | null = null;

  constructor(private http: HttpClient, private router: Router) {} // Inject Router

  // Capture the selected source file
  onSourceFileSelected(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.sourceFile = fileList[0];
      console.log('Source file selected:', this.sourceFile.name);
    }
  }

  // Capture the selected destination file
  onDestinationFileSelected(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.destinationFile = fileList[0];
      console.log('Destination file selected:', this.destinationFile.name);
    }
  }

  submit() {
    if (!this.sourceFile || !this.destinationFile) {
      alert('Please select both source and destination database files.');
      return;
    }

    const formData = new FormData();

    formData.append('sourceFile', this.sourceFile);
    formData.append('sourceDbType', this.source.dbType.toUpperCase());
    formData.append('sourceUsername', this.source.username);
    formData.append('sourcePassword', this.source.password);

    formData.append('destinationFile', this.destinationFile);
    formData.append('destinationDbType', this.destination.dbType.toUpperCase());
    formData.append('destinationUsername', this.destination.username);
    formData.append('destinationPassword', this.destination.password);

    this.http.post('http://localhost:8080/api/db-config/upload', formData)
      .subscribe({
        next: (response) => {
          console.log('Upload successful:', response);
          alert('Files and DB info uploaded successfully!');
          // Redirect to the migration dashboard page
          this.router.navigate(['/migrate-data']); // <--- REDIRECTION HERE
        },
        error: (err: HttpErrorResponse) => {
          console.error('Upload failed:', err);
          let errorMessage = 'Upload failed: An unknown error occurred.';
          if (err.error && err.error.message) {
            errorMessage = 'Upload failed: ' + err.error.message;
          } else if (err.message) {
            errorMessage = 'Upload failed: ' + err.message;
          }
          alert(errorMessage);
        }
      });
  }
}