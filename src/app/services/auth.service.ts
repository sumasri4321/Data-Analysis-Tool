/*
 * COMMENTED OUT FOR DEVELOPMENT - UNCOMMENT WHEN AZURE AD AUTH IS READY
 * 
 * This Angular AuthService provides authentication and user information.
 * Currently commented out as it depends on Spring Boot auth endpoints.
 * 
 * To re-enable:
 * 1. Uncomment Spring Boot SecurityConfig, JwtConfig, AuthController, and AuthorizationService
 * 2. Uncomment this entire file
 * 3. Re-enable HTTP interceptor and role guards
 * 4. Switch Spring Boot from dev-no-auth profile to default profile
 */

import { Injectable } from '@angular/core';

// Placeholder interface for when service is re-enabled
export interface UserInfo {
  email: string;
  name: string;
  roles: string[];
  isAdmin: boolean;
  isUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Placeholder methods for when service is re-enabled
  isAuthenticated(): boolean {
    return false; // Always return false during development
  }

  hasRole(role: string): boolean {
    return false; // Always return false during development
  }

  isAdmin(): boolean {
    return false; // Always return false during development
  }

  isUser(): boolean {
    return false; // Always return false during development
  }
}

/*
// ORIGINAL CODE - UNCOMMENT WHEN READY TO USE AUTHENTICATION

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

export interface UserInfo {
  email: string;
  name: string;
  roles: string[];
  isAdmin: boolean;
  isUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private userInfoSubject = new BehaviorSubject<UserInfo | null>(null);
  public userInfo$ = this.userInfoSubject.asObservable();

  constructor(
    private http: HttpClient,
    private msalService: MsalService
  ) {}

  getUserInfo(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.apiUrl}/user-info`);
  }

  loadUserInfo(): void {
    this.getUserInfo().subscribe({
      next: (userInfo) => {
        this.userInfoSubject.next(userInfo);
      },
      error: (error) => {
        console.error('Failed to load user info:', error);
        this.userInfoSubject.next(null);
      }
    });
  }

  isAuthenticated(): boolean {
    const account = this.msalService.instance.getActiveAccount();
    return account !== null;
  }

  hasRole(role: string): boolean {
    const userInfo = this.userInfoSubject.value;
    return userInfo?.roles?.includes(role) || false;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isUser(): boolean {
    return this.hasRole('User');
  }

  getCurrentUserInfo(): UserInfo | null {
    return this.userInfoSubject.value;
  }

  clearUserInfo(): void {
    this.userInfoSubject.next(null);
  }

  logout(): void {
    this.clearUserInfo();
    this.msalService.logout();
  }

  testAdminEndpoint(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-only`);
  }

  testUserEndpoint(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-level`);
  }

  getJwtClaims(): Observable<any> {
    return this.http.get(`${this.apiUrl}/debug/claims`);
  }
}
*/
