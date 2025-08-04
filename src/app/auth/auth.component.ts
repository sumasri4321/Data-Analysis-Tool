import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  constructor(
    private msalService: MsalService, 
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.msalService.instance.initialize();
    this.msalService.instance.handleRedirectPromise().then((result) => {
      console.log('MSAL redirect result:', result);
      const account =
        this.msalService.instance.getActiveAccount() ||
        (result && result.account);
      if (account) {
        this.msalService.instance.setActiveAccount(account);
        console.log('Authenticated, redirecting to /configure');
        
        // Load user info after successful authentication - COMMENTED OUT FOR DEV
        // this.authService.loadUserInfo();
        
        this.router.navigate(['/configure']);
      } else {
        console.log('No account found after redirect');
      }
    });
  }

  async login() {
    try {
      await this.msalService.instance.initialize();
      await this.msalService.loginRedirect({
        scopes: ['api://be1ee057-734b-47b1-9f5f-f16151b14d9d/access_as_user']
      });
    } catch (err) {
      console.error('Login failed', err);
    }
  }
}
