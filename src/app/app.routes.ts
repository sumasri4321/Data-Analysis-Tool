import { Routes } from '@angular/router';
import { MigrationDashboardComponent } from './migration-dashboard/migration-dashboard.component';
import { MockMigrationDashboardComponent } from './mock-migration-dashboard/mock-migration-dashboard.component';
import { MigrationToolComponent } from './migration-tool/migration-tool.component';
import { SqlExecutorComponent } from './sql-executor/sql-executor.component';
import { AuthComponent } from './auth/auth.component';
import { AuthTestComponent } from './components/auth-test.component';
import { DebugAuthComponent } from './components/debug-auth.component';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent }, // Authentication page
  { path: '', redirectTo: '/auth', pathMatch: 'full' }, // Default route redirects to auth

  // Debug pages
  { path: 'debug-auth', component: DebugAuthComponent, canActivate: [MsalGuard] },
  { path: 'auth-test', component: AuthTestComponent, canActivate: [MsalGuard] },

  // The main configuration interface
  { path: 'configure', component: MigrationToolComponent, canActivate: [MsalGuard] },

  // The mock dashboard page (now just "Dashboard")
  { path: 'mock-dashboard', component: MockMigrationDashboardComponent, canActivate: [MsalGuard] },

  // Existing 'migrate-data' route (keep if still relevant, otherwise remove)
  { path: 'migrate-data', component: MigrationDashboardComponent, canActivate: [MsalGuard] },

  // Route for SQL Executor (Admin only)
  { path: 'sql-executor', component: SqlExecutorComponent, canActivate: [MsalGuard, RoleGuard], data: { roles: ['Admin'] } },

  // Wildcard route to redirect any unmatched paths to /auth
  { path: '**', redirectTo: '/auth' }
];
