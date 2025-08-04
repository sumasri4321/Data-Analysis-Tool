/*
 * COMMENTED OUT FOR DEVELOPMENT - UNCOMMENT WHEN AZURE AD AUTH IS READY
 * 
 * This Angular RoleGuard provides route-level role-based access control.
 * Currently commented out as it depends on Spring Boot auth endpoints.
 * 
 * To re-enable:
 * 1. Uncomment Spring Boot SecurityConfig, JwtConfig, AuthController, and AuthorizationService
 * 2. Uncomment AuthService.ts
 * 3. Uncomment this entire file
 * 4. Switch Spring Boot from dev-no-auth profile to default profile
 */

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // During development, always allow access
    return true;
  }
}

/*
// ORIGINAL CODE - UNCOMMENT WHEN READY TO USE AUTHENTICATION

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role requirement
    }

    return this.authService.userInfo$.pipe(
      take(1),
      map(userInfo => {
        if (!userInfo) {
          console.warn('No user info available, redirecting to login');
          this.router.navigate(['/login']);
          return false;
        }

        const hasRequiredRole = requiredRoles.some(role => 
          userInfo.roles?.includes(role)
        );

        if (!hasRequiredRole) {
          console.warn('User does not have required role:', requiredRoles);
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}
*/
