import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthorizationService } from './services/authorization.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthorizationService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const requiredRole = route.data["role"];
    if (!requiredRole || this.authService.hasRole(requiredRole)) {
      return true;
    }
    // Redirect to home or error page if not authorized
    return this.router.parseUrl('/auth');
  }
}
