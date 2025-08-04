# Azure AD Authorization Setup Guide

This guide explains how to set up Azure AD authorization for the Data Migration Tool.

## Azure AD Configuration

### Application Registration Details
- **Application (client) ID**: `be1ee057-734b-47b1-9f5f-f16151b14d9d`
- **Directory (tenant) ID**: `45597f60-6e37-4be7-acfb-4c9e23b261ea`
- **Application ID URI**: `api://be1ee057-734b-47b1-9f5f-f16151b14d9d`

### App Roles
- **Admin**: `Admin` - Full access to all resources
- **User**: `User` - Limited access to standard operations

## Authorization Flow

1. User authenticates via Azure AD through the Angular frontend
2. JWT token is acquired and sent with each API request
3. Spring Boot validates the token with Azure AD
4. Authorization is checked based on user roles

## API Endpoint Authorization

### User Level Access (`User` or `Admin` roles)
- `POST /api/migration/test-connection` - Test database connections
- `POST /api/migration/metadata` - Get database metadata
- `POST /api/migration/data-preview/{db}/{table}` - Preview table data
- `POST /api/db-profiles/save` - Save connection profiles
- `GET /api/db-profiles/list` - List connection profiles

### Admin Only Access (`Admin` role)
- `POST /api/migration/start-migration` - Initiate data migration
- `POST /api/migration/execute-sql` - Execute SQL queries
- `POST /api/db-config/upload` - Upload database configurations
- `GET /api/auth/debug/claims` - Debug JWT claims

### Public Access (No Authentication Required)
- `GET /api/auth/user-info` - Get current user information
- `GET /api/auth/admin-only` - Test admin access
- `GET /api/auth/user-level` - Test user access

## Testing Authorization

Navigate to `/auth-test` after logging in to test the authorization system:

1. **User Information**: View current user's roles and permissions
2. **Endpoint Testing**: Test user-level and admin-only endpoints
3. **JWT Claims**: View JWT token claims (admin only)

## Setup Instructions

### Spring Boot (Backend)

1. **Dependencies Added**:
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-security</artifactId>
   </dependency>
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
   </dependency>
   ```

2. **Configuration** (`application.properties`):
   ```properties
   spring.security.oauth2.resourceserver.jwt.issuer-uri=https://login.microsoftonline.com/45597f60-6e37-4be7-acfb-4c9e23b261ea/v2.0
   spring.security.oauth2.resourceserver.jwt.audiences=api://be1ee057-734b-47b1-9f5f-f16151b14d9d
   azure.activedirectory.tenant-id=45597f60-6e37-4be7-acfb-4c9e23b261ea
   azure.activedirectory.client-id=be1ee057-734b-47b1-9f5f-f16151b14d9d
   ```

### Angular (Frontend)

1. **MSAL Configuration**: Already configured in `app.config.ts`
2. **HTTP Interceptor**: Automatically adds JWT tokens to API requests
3. **Auth Service**: Manages user authentication state and role checking
4. **Role Guard**: Protects routes based on user roles

## Usage Examples

### Check User Role in Component
```typescript
constructor(private authService: AuthService) {}

ngOnInit() {
  if (this.authService.isAdmin()) {
    // Show admin features
  }
}
```

### Protect Routes
```typescript
{
  path: 'admin-feature',
  component: AdminComponent,
  canActivate: [MsalGuard, RoleGuard],
  data: { roles: ['Admin'] }
}
```

### Call Protected API
```typescript
// The interceptor automatically adds the JWT token
this.http.post('/api/migration/start-migration', data).subscribe(...)
```

## Troubleshooting

1. **Token Not Being Sent**: Check browser developer tools network tab for Authorization header
2. **403 Forbidden**: User doesn't have required role - check Azure AD app role assignments
3. **401 Unauthorized**: Token expired or invalid - try logging out and back in
4. **CORS Issues**: Ensure Spring Boot CORS configuration allows requests from Angular dev server

## Security Notes

- JWT tokens are validated server-side with Azure AD
- Roles are extracted from the JWT `roles` claim
- All API endpoints (except public ones) require authentication
- Admin operations require specific role authorization
- CORS is configured to allow requests only from the Angular development server

## Next Steps

1. Assign users to appropriate roles in Azure AD
2. Test the authorization system using the `/auth-test` page
3. Customize role-based UI elements in the Angular application
4. Add additional role-based restrictions as needed
