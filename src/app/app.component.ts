import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EventType } from '@azure/msal-browser';

import { MigrationToolComponent } from './migration-tool/migration-tool.component';
import { MockMigrationDashboardComponent } from './mock-migration-dashboard/mock-migration-dashboard.component';
import { MigrationDashboardComponent } from './migration-dashboard/migration-dashboard.component';
import { SqlExecutorComponent } from './sql-executor/sql-executor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MigrationToolComponent,
    MockMigrationDashboardComponent,
    MigrationDashboardComponent,
    SqlExecutorComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100 pb-8">
      <div *ngIf="!isAuthPage" class="flex justify-end items-center p-4">
        <span *ngIf="userName" class="text-gray-800 font-semibold mr-4">{{ userName }}</span>
        <button *ngIf="userName" (click)="signOut()" class="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">Sign Out</button>
        <span *ngIf="!userName" class="text-gray-500">Not signed in</span>
      </div>
      <nav *ngIf="!isAuthPage" class="bg-gray-800 p-4 rounded-lg shadow-lg mb-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mx-auto mt-4 max-w-6xl">
        <a routerLink="/configure" routerLinkActive="active" class="nav-button">Configure</a>
        <a routerLink="/mock-dashboard" routerLinkActive="active" class="nav-button">Dashboard</a>
        <a routerLink="/sql-executor" routerLinkActive="active" class="nav-button">SQL Executor</a>
      </nav>
      <div class="p-6">
        <router-outlet></router-outlet>
      </div>
    </div>
    <style>
      .nav-button {
        background-color: #1d4ed8; /* blue-700 */
        color: white;
        font-weight: 600; /* semibold */
        padding: 8px 16px; /* py-2 px-4 */
        border-radius: 8px; /* rounded-lg */
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
        transition: background-color 200ms ease-in-out; /* transition duration-200 ease-in-out */
        outline: none; /* focus:outline-none */
      }

      .nav-button:hover {
        background-color: #1e40af; /* blue-800 */
      }

      .nav-button:focus {
        box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.75); /* focus:ring-2 focus:ring-blue-300 focus:ring-opacity-75 */
      }

      /* Style for the currently active navigation button */
      .nav-button.active { /* Use 'active' class from routerLinkActive */
        background-color: #1e3a8a; /* blue-900 */
        color: white;
        cursor: default;
      }
    </style>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'data-migration-ui';
  userName: string | null = null;
  isAuthPage: boolean = false;

  constructor(private msalService: MsalService, private router: Router, private msalBroadcastService: MsalBroadcastService) {}

  async ngOnInit() {
    await this.msalService.instance.initialize();
    this.msalService.instance.handleRedirectPromise().then((result) => {
      if (result && result.account) {
        this.msalService.instance.setActiveAccount(result.account);
        this.setUserName();
      } else {
        this.setUserName();
      }
    });
    this.msalBroadcastService.msalSubject$
      .pipe(filter((msg: any) => msg.eventType === EventType.LOGIN_SUCCESS))
      .subscribe(() => {
        this.setUserName();
      });

    this.isAuthPage = this.router.url === '/auth';
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAuthPage = event.urlAfterRedirects === '/auth';
      }
    });
  }

  setUserName() {
    const account = this.msalService.instance.getActiveAccount();
    this.userName = account?.name || null;
  }

  signOut() {
    this.msalService.instance.setActiveAccount(null);
    this.msalService.logoutRedirect({ postLogoutRedirectUri: '/auth' });
  }
}
