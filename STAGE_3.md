# Stage 3: Secure Services and APIs

## Overview
Stage 3 builds on the UserService (Stage 1) and RoleService (Stage 2) by adding security layers to protect API endpoints and enforce permissions. This stage implements authentication and authorization middleware for both IPC and HTTP transports, adds login/session management endpoints, and ensures that services require proper authentication and permissions. A key requirement is allowing bootstrap operations (like creating the first admin user) when no users exist, while enforcing strict permissions thereafter.

## Security Design Principles
- **Authentication**: Users must authenticate to establish a session. Sessions are managed via tokens (HTTP) or IPC context (Electron).
- **Authorization**: All service methods check user permissions based on assigned roles. The `can-admin` permission grants all access.
- **Transport Agnostic**: Security logic is implemented at the service layer, with transport-specific middleware handling authentication.
- **Bootstrap Mode**: When no users exist, certain operations (role initialization, first admin creation) are allowed without authentication.
- **Error Handling**: Services return structured errors that transports can map to appropriate HTTP status codes (4xx for client errors, 5xx for server errors).

## User Context Propagation

**HTTP Transport (REST API best practices):**
- **Login Response**: `POST /api/auth/login` returns a JWT token containing user ID, roles, and expiration.
- **Client Storage**: Token stored securely in HTTP-only cookies or localStorage/sessionStorage.
- **Subsequent Requests**: All API calls include `Authorization: Bearer <token>` header.
- **Middleware Validation**: Express middleware validates token, extracts user ID, fetches full user context from UserService, and attaches it to the request object.
- **Common Practices**: Token expiration (1 hour), refresh tokens, HTTPS required.

**IPC Transport (Electron IPC patterns):**
- **Login Response**: IPC login handler returns user ID and session info.
- **Client Storage**: User ID stored in renderer process memory or secure storage.
- **Subsequent Calls**: Each IPC message includes user ID in the payload.
- **Handler Validation**: IPC handlers validate user ID, fetch user context from UserService, and proceed.
- **Common Practices**: Session management in main process, automatic logout on window close.

**Shared Practices**:
- User context object: { userId, username, roles[], permissions[] }
- Context fetched fresh per request for up-to-date permissions.
- Bootstrap mode bypasses context when no users exist.
- Errors: 401 for invalid tokens, 403 for insufficient permissions.

## Initial Admin Creation
- **Condition**: Allowed only when no users exist in database.
- **Endpoint**: `POST /api/users/bootstrap-admin` (HTTP) or IPC equivalent.
- **Permissions**: No authentication required in bootstrap mode.
- **Post-Creation**: After first user is created, all operations require authentication and permissions.
- **Validation**: Service checks user count before allowing bootstrap operations.

## Error Handling Enhancements
- **Service Layer Errors**: Define error types (AuthenticationError, AuthorizationError, ValidationError, etc.) with codes.
- **Transport Mapping**:
  - AuthenticationError → 401 Unauthorized (HTTP), specific IPC error code.
  - AuthorizationError → 403 Forbidden (HTTP), IPC permission denied.
  - ValidationError → 400 Bad Request (HTTP), IPC validation error.
  - Generic errors → 500 Internal Server Error (HTTP), IPC server error.
- **Error Propagation**: Services throw typed errors; middleware catches and converts to transport-specific responses.

## Implementation Steps
1. **Add Permission Checks to Services**:
   - Define basic error classes (AuthorizationError, AuthenticationError, etc.) in services.
   - Modify UserService and RoleService methods to accept user context and check permissions.
   - Services throw appropriate errors immediately when permissions are insufficient.
   - Implement bootstrap logic in services (allow operations when no users exist).

2. **Implement Authorization Middleware**:
   - **HTTP**: Express middleware to validate JWT tokens and attach user context to requests.
   - **IPC**: Electron IPC handlers to validate user sessions and permissions.

3. **Add Authentication Endpoints**:
   - Implement login/logout/session endpoints in api-server.
   - Update IPC handlers for authentication.

4. **Update API Clients**:
   - Modify renderer API client to handle authentication for both transports.

5. **Strengthen Error Handling**:
   - Enhance error classes with additional types and metadata.
   - Update middleware to map errors to transport-specific responses (HTTP status codes, IPC error codes).
   - Add comprehensive error logging and handling.

6. **Add Cucumber Tests**:
   - Test bootstrap mode (no users → allow admin creation).
   - Test authenticated mode (users exist → require permissions).
   - Test error responses across transports.

## Testing Strategy
- **Cucumber Features**: Scenarios for bootstrap vs authenticated flows, permission enforcement, error handling.
- **Integration Tests**: Verify HTTP and IPC transports handle authentication and errors correctly.
- **Unit Tests**: Test service permission checks and error throwing.

## Commit Message
`feat: secure services and APIs with authentication and authorization`