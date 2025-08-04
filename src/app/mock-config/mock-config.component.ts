// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-mock-config',
//   standalone: true,
//   imports: [],
//   templateUrl: './mock-config.component.html',
//   styleUrl: './mock-config.component.css'
// })
// export class MockConfigComponent {

// }
// src/app/mock-config/mock-config.component.ts
// src/app/mock-config/mock-config.component.ts
// import { Component, OnInit } from '@angular/core';
// import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // Import Router and routing directives
// import { CommonModule } from '@angular/common'; // Required for directives like *ngIf, *ngFor etc.
// import { FormsModule } from '@angular/forms'; // Required if you use ngModel in this component

// @Component({
//   selector: 'app-mock-config',
//   standalone: true, // <--- IMPORTANT: Ensure this is true
//   imports: [
//     CommonModule,
//     FormsModule,
//     RouterLink,
//     RouterLinkActive
//   ],
//   templateUrl: './mock-config.component.html',
//   styleUrls: ['./mock-config.component.css']
// })
// export class MockConfigComponent implements OnInit {

//   constructor(private router: Router) { }

//   ngOnInit(): void {
//   }

//   navigateToMockDashboard() {
//     this.router.navigate(['/mock-dashboard']); // This new route will lead to your mock dashboard
//   }
// }
// src/app/mock-config/mock-config.component.ts
// import { Component, OnInit } from '@angular/core';
// import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // <--- Ensure these are imported
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-mock-config',
//   standalone: true, // <--- This MUST be true
//   imports: [
//     CommonModule,
//     FormsModule,
//     RouterLink,       // <--- Ensure these are here
//     RouterLinkActive  // <--- Ensure these are here
//   ],
//   templateUrl: './mock-config.component.html',
//   styleUrls: ['./mock-config.component.css']
// })
// export class MockConfigComponent implements OnInit {

//   constructor(private router: Router) { }

//   ngOnInit(): void {
//   }

//   navigateToMockDashboard() {
//     this.router.navigate(['/mock-dashboard']);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mock-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './mock-config.component.html',
  styleUrls: ['./mock-config.component.css'] // This file is mostly empty as Tailwind handles styling
})
export class MockConfigComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  // This method is no longer called by a button directly,
  // as navigation is now handled by the HTML navigation bar.
  navigateToMockDashboard() {
    this.router.navigate(['/mock-dashboard']);
  }
}
