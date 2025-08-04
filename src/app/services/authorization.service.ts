import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  constructor(private msalService: MsalService) {}

  getUserClaims(): any {
    const account = this.msalService.instance.getActiveAccount();
    return account?.idTokenClaims || {};
  }

  getUserRoles(): string[] {
    const claims = this.getUserClaims();
    // Azure AD roles claim is usually 'roles' or 'role'
    return claims["roles"] || claims["role"] || [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }
}
