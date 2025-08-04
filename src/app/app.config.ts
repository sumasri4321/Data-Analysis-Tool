import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms'; 
import { MsalModule, MsalService, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MsalInterceptor, MSAL_INTERCEPTOR_CONFIG, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { routes } from './app.routes';
import { MsalGuard, MsalBroadcastService } from '@azure/msal-angular';

const msalConfig = {
  auth: {
    clientId: 'be1ee057-734b-47b1-9f5f-f16151b14d9d',
    authority: 'https://login.microsoftonline.com/45597f60-6e37-4be7-acfb-4c9e23b261ea',
    redirectUri: 'http://localhost:4200/configure', // Make sure this matches your Azure config
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  }
};

const API_SCOPE = 'api://be1ee057-734b-47b1-9f5f-f16151b14d9d/access_as_user';
const API_URL = 'http://localhost:8080/api/*'; // More specific pattern for API endpoints 

export function MSALInstanceFactory() {
  return new PublicClientApplication(msalConfig);
}

function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [API_SCOPE]
    }
  };
}

function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  
  // Add specific endpoint patterns
  protectedResourceMap.set('http://localhost:8080/api/*', [API_SCOPE]);
  protectedResourceMap.set('http://localhost:8080/api/migration/*', [API_SCOPE]);
  protectedResourceMap.set('http://localhost:8080/api/auth/*', [API_SCOPE]);
  protectedResourceMap.set('http://localhost:8080/api/db-profiles/*', [API_SCOPE]);
  protectedResourceMap.set('http://localhost:8080/api/db-config/*', [API_SCOPE]);
  
  console.log('MSAL Interceptor: Protected resource map:', protectedResourceMap);
  
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(FormsModule),
    importProvidersFrom(MsalModule),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ]
};