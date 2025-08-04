import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-debug-auth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Authentication Debug</h2>
      
      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 class="text-lg font-semibold mb-3">MSAL Account Info</h3>
        <div *ngIf="accountInfo; else noAccount">
          <p><strong>Name:</strong> {{ accountInfo.name || accountInfo.username }}</p>
          <p><strong>Account ID:</strong> {{ accountInfo.homeAccountId }}</p>
          <p><strong>Tenant ID:</strong> {{ accountInfo.tenantId }}</p>
        </div>
        <ng-template #noAccount>
          <p class="text-red-600">No active account found</p>
        </ng-template>
      </div>

      <div class="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 class="text-lg font-semibold mb-3">Token Test</h3>
        <button 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-3"
          (click)="testTokenAcquisition()">
          Test Token Acquisition
        </button>
        <div *ngIf="tokenResult" class="mt-3">
          <h4 class="font-semibold">Token Result:</h4>
          <pre class="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{{ tokenResult }}</pre>
        </div>
        <div *ngIf="tokenError" class="mt-3 text-red-600">
          <h4 class="font-semibold">Token Error:</h4>
          <pre class="bg-red-100 p-2 rounded text-xs overflow-x-auto">{{ tokenError }}</pre>
        </div>
      </div>

      <div class="bg-green-50 p-4 rounded-lg mb-6">
        <h3 class="text-lg font-semibold mb-3">Manual API Test</h3>
        <button 
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-3"
          (click)="testApiCallWithManualToken()">
          Test API Call with Manual Token
        </button>
        <div *ngIf="apiResult" class="mt-3">
          <h4 class="font-semibold">API Result:</h4>
          <pre class="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{{ apiResult }}</pre>
        </div>
        <div *ngIf="apiError" class="mt-3 text-red-600">
          <h4 class="font-semibold">API Error:</h4>
          <pre class="bg-red-100 p-2 rounded text-xs overflow-x-auto">{{ apiError }}</pre>
        </div>
      </div>

      <div class="bg-yellow-50 p-4 rounded-lg">
        <h3 class="text-lg font-semibold mb-3">Direct HTTP Test</h3>
        <button 
          class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-3"
          (click)="testDirectHttpCall()">
          Test Direct HTTP Call (Should Use Interceptor)
        </button>
        <div *ngIf="httpResult" class="mt-3">
          <h4 class="font-semibold">HTTP Result:</h4>
          <pre class="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{{ httpResult }}</pre>
        </div>
        <div *ngIf="httpError" class="mt-3 text-red-600">
          <h4 class="font-semibold">HTTP Error:</h4>
          <pre class="bg-red-100 p-2 rounded text-xs overflow-x-auto">{{ httpError }}</pre>
        </div>
      </div>
    </div>
  `
})
export class DebugAuthComponent implements OnInit {
  accountInfo: any = null;
  tokenResult: string | null = null;
  tokenError: string | null = null;
  apiResult: string | null = null;
  apiError: string | null = null;
  httpResult: string | null = null;
  httpError: string | null = null;

  constructor(
    private msalService: MsalService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.accountInfo = this.msalService.instance.getActiveAccount();
    console.log('DebugAuthComponent: Active account:', this.accountInfo);
  }

  async testTokenAcquisition(): Promise<void> {
    this.tokenResult = null;
    this.tokenError = null;

    try {
      const account = this.msalService.instance.getActiveAccount();
      if (!account) {
        this.tokenError = 'No active account found';
        return;
      }

      const silentRequest = {
        scopes: ['api://be1ee057-734b-47b1-9f5f-f16151b14d9d/access_as_user'],
        account: account
      };

      console.log('DebugAuthComponent: Attempting token acquisition with request:', silentRequest);
      const response = await this.msalService.instance.acquireTokenSilent(silentRequest);
      
      this.tokenResult = JSON.stringify({
        accessToken: response.accessToken.substring(0, 50) + '...',
        expiresOn: response.expiresOn,
        scopes: response.scopes,
        account: response.account?.name
      }, null, 2);

      console.log('DebugAuthComponent: Token acquired successfully:', response);
    } catch (error: any) {
      this.tokenError = JSON.stringify(error, null, 2);
      console.error('DebugAuthComponent: Token acquisition failed:', error);
    }
  }

  async testApiCallWithManualToken(): Promise<void> {
    this.apiResult = null;
    this.apiError = null;

    try {
      const account = this.msalService.instance.getActiveAccount();
      if (!account) {
        this.apiError = 'No active account found';
        return;
      }

      const silentRequest = {
        scopes: ['api://be1ee057-734b-47b1-9f5f-f16151b14d9d/access_as_user'],
        account: account
      };

      const tokenResponse = await this.msalService.instance.acquireTokenSilent(silentRequest);
      
      // Make API call with manual Authorization header
      const headers = {
        'Authorization': `Bearer ${tokenResponse.accessToken}`,
        'Content-Type': 'application/json'
      };

      console.log('DebugAuthComponent: Making API call with headers:', headers);

      const response = await fetch('http://localhost:8080/api/auth/user-info', {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        this.apiResult = JSON.stringify(data, null, 2);
        console.log('DebugAuthComponent: API call successful:', data);
      } else {
        this.apiError = `HTTP ${response.status}: ${response.statusText}`;
        console.error('DebugAuthComponent: API call failed:', response.status, response.statusText);
      }
    } catch (error: any) {
      this.apiError = JSON.stringify(error, null, 2);
      console.error('DebugAuthComponent: API call error:', error);
    }
  }

  testDirectHttpCall(): void {
    this.httpResult = null;
    this.httpError = null;

    console.log('DebugAuthComponent: Making direct HTTP call through Angular HttpClient');
    
    this.http.get('http://localhost:8080/api/auth/user-info').subscribe({
      next: (data) => {
        this.httpResult = JSON.stringify(data, null, 2);
        console.log('DebugAuthComponent: Direct HTTP call successful:', data);
      },
      error: (error) => {
        this.httpError = JSON.stringify({
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        }, null, 2);
        console.error('DebugAuthComponent: Direct HTTP call failed:', error);
      }
    });
  }
}
