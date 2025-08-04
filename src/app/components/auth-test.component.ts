/*
 * COMMENTED OUT FOR DEVELOPMENT - UNCOMMENT WHEN AZURE AD AUTH IS READY
 * 
 * This component tests authentication and authorization functionality.
 * Currently simplified for development mode without authentication.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Azure AD Authorization Test (Development Mode)</h2>
      
      <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <h3 class="text-lg font-semibold mb-2 text-yellow-800">Development Mode Notice</h3>
        <p class="text-yellow-700">
          Authentication and authorization are currently disabled for development. 
          All authentication methods return false and no user data is available.
        </p>
      </div>

      <!-- Simplified User Info Section -->
      <div class="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 class="text-lg font-semibold mb-3">Authentication Status</h3>
        <p><strong>Is Authenticated:</strong> {{ isAuthenticated ? 'Yes' : 'No' }}</p>
        <p><strong>Is Admin:</strong> {{ isAdmin ? 'Yes' : 'No' }}</p>
        <p><strong>Is User:</strong> {{ isUser ? 'Yes' : 'No' }}</p>
        <p><strong>Has Admin Role:</strong> {{ hasAdminRole ? 'Yes' : 'No' }}</p>
        
        <button 
          class="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          (click)="checkStatus()">
          Check Status
        </button>
      </div>

      <!-- Development Actions -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-semibold mb-3">Development Actions</h3>
        <p class="text-gray-600 mb-3">
          In production, these buttons would test authentication endpoints. 
          Currently they are disabled for development.
        </p>
        <div class="space-x-2">
          <button 
            class="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
            disabled>
            Test User Endpoint (Disabled)
          </button>
          <button 
            class="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
            disabled>
            Test Admin Endpoint (Disabled)
          </button>
          <button 
            class="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
            disabled>
            Get JWT Claims (Disabled)
          </button>
        </div>
      </div>
    </div>
  `
})
export class AuthTestComponent implements OnInit {
  isAuthenticated = false;
  isAdmin = false;
  isUser = false;
  hasAdminRole = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.hasAdminRole = this.authService.hasRole('Admin');
    console.log('Development mode - all auth checks return false');
  }
}

/*
// ORIGINAL CODE - UNCOMMENT WHEN READY TO USE AUTHENTICATION
// [Original component code with full authentication functionality would go here]
*/
