/*
 * COMMENTED OUT FOR DEVELOPMENT - UNCOMMENT WHEN AZURE AD AUTH IS READY
 * 
 * This Angular HTTP Interceptor adds JWT tokens to API requests.
 * Currently commented out as it depends on Azure AD authentication.
 * 
 * To re-enable:
 * 1. Uncomment Spring Boot SecurityConfig, JwtConfig, AuthController, and AuthorizationService
 * 2. Uncomment AuthService.ts and RoleGuard.ts
 * 3. Uncomment this entire file
 * 4. Re-enable in app.config.ts providers
 * 5. Switch Spring Boot from dev-no-auth profile to default profile
 */

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // During development, pass requests through without modification
    console.log('AuthInterceptor: Development mode - passing request through without auth headers');
    return next.handle(req);
  }
}

/*
// ORIGINAL CODE - UNCOMMENT WHEN READY TO USE AUTHENTICATION

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { MsalService } from '@azure/msal-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private msalService: MsalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for non-API requests
    if (!req.url.includes('/api/') || req.url.includes('localhost:5000')) {
      console.log('AuthInterceptor: Skipping non-API request:', req.url);
      return next.handle(req);
    }

    console.log('AuthInterceptor: Processing API request to:', req.url);

    // Get the active account
    const account = this.msalService.instance.getActiveAccount();
    
    if (account) {
      console.log('AuthInterceptor: Found active account:', account.name);
      
      // Get the access token using from() to convert Promise to Observable
      const silentRequest = {
        scopes: ['api://be1ee057-734b-47b1-9f5f-f16151b14d9d/access_as_user'],
        account: account
      };

      console.log('AuthInterceptor: Acquiring token with request:', silentRequest);

      return from(this.msalService.instance.acquireTokenSilent(silentRequest)).pipe(
        switchMap((response) => {
          console.log('AuthInterceptor: Token acquired successfully, adding to request headers');
          // Clone the request and add the authorization header
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`
            }
          });
          console.log('AuthInterceptor: Modified request headers:', authReq.headers.keys());
          return next.handle(authReq);
        }),
        catchError((error) => {
          console.error('AuthInterceptor: Failed to acquire token silently:', error);
          
          // If token acquisition fails, try interactive login
          const loginRequest = {
            scopes: ['api://be1ee057-734b-47b1-9f5f-f16151b14d9d/access_as_user']
          };
          
          this.msalService.loginRedirect(loginRequest);
          
          return throwError(() => new HttpErrorResponse({
            error: 'Authentication required - redirecting to login',
            status: 401,
            statusText: 'Unauthorized'
          }));
        })
      );
    } else {
      console.warn('AuthInterceptor: No active account found, redirecting to login');
      
      // If no account, redirect to login
      const loginRequest = {
        scopes: ['api://be1ee057-734b-47b1-9f5f-f16151b14d9d/access_as_user']
      };
      
      this.msalService.loginRedirect(loginRequest);
      
      return throwError(() => new HttpErrorResponse({
        error: 'No active account - redirecting to login',
        status: 401,
        statusText: 'Unauthorized'
      }));
    }
  }
}
*/
