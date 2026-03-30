# Background Task Notification Implementation Proposal

## Overview

This proposal implements server-to-browser event notification for background-task-manager over HTTP using WebSockets, while maintaining the existing IPC functionality. The implementation follows the established architecture with transport-agnostic services and transport-specific API servers.

## Key Architectural Decisions

1. **Service-Agnostic Transports**: Transport notification layers use generic `broadcast(eventType, data)` methods
2. **Event Notification Manager**: Central coordinator between services and transport broadcasts
3. **Transport Separation**: IPC and HTTP notifications handled in respective API server layers
4. **Window Management Decoupling**: Window-manager no longer directly coupled to background-task-manager
5. **Generic Event System**: API clients implement service-specific methods using internal generic event dispatchers

## Proposed Changes

### 1. BackgroundTaskService Enhancement
**File**: `src/main/services/BackgroundTaskService.ts`
- Add `clearNotifyFn(fn)` method that delegates to `background-task-manager.clearNotifyFn`
- Maintain existing `setNotifyFn(fn)` for programmatic use

### 2. API Server Notification Exposure
**Decision**: Not implemented. WebSocket broadcasting is automatic through the event notification manager. Programmatic notification registration (setNotifyFn/clearNotifyFn) remains available at the service layer for special cases but is not exposed through API servers.

### 3. IPC Transport Notifications
**New File**: `src/main/api-server/ipc/notifications.ts`
```typescript
export function setWindow(window: BrowserWindow): void
export function broadcast(eventType: string, data: any): void
```
- `setWindow()`: Registers the current Electron window for IPC broadcasting
- `broadcast()`: Sends IPC events to registered window using `window.webContents.send(eventType, data)`

**Modified**: `src/main/api-server/ipc/index.ts`
- Export `setWindow` and `broadcast` from `notifications.ts`

### 4. HTTP Transport Notifications
**New File**: `src/main/api-server/http/notifications.ts`
```typescript
export function broadcast(eventType: string, data: any): void
```
- Manages WebSocket server instance
- `broadcast()`: Sends `{ type: eventType, data }` messages to all connected WebSocket clients

**Modified**: `src/main/api-server/http/index.ts`
- Export `broadcast` from `notifications.ts`
- Initialize WebSocket server alongside Express routes

### 5. Event Notification Manager
**New File**: `src/main/event-notification-manager.ts`
```typescript
export function initialize(): void
```
- Registers callback with `background-task-manager.setNotifyFn()`
- Callback broadcasts to both transports: `ipcNotifications.broadcast('background-task-update', state)` and `httpNotifications.broadcast('background-task-update', state)`

### 6. Window Manager Refactor
**Modified**: `src/main/window-manager.ts`
- Remove import of `background-task-manager`
- Remove `handleBackgroundTaskUpdate()`, `registerCallbacks()`, `unregisterCallbacks()`
- In `createAppWindow()`: Call `ipcApiServer.setWindow(mainWindow)` instead of registering callback

### 7. HTTP API Client Generic Event System
**Modified**: `src/renderer/api-client/http/index.ts`
- Add generic event system: `on(eventType, callback)`, `off(eventType, callback)`
- Single WebSocket connection established on first event registration
- WebSocket message handler dispatches events to registered callbacks
- Connection closed when no more listeners

**Modified**: `src/renderer/api-client/http/background-tasks.ts`
- Implement `onBackgroundTaskUpdate(callback)` by calling internal `this.on('background-task-update', callback)`
- Maintains service-specific API while using generic event system internally

**New Dependency**: Add `ws` library to `package.json` for WebSocket server

### 8. Main Application Initialization
**Modified**: `src/main/index.ts`
- Import and call `initializeEventNotificationManager()` after API servers are set up
- Ensure proper initialization order: Services → API Servers → Event Notifications

### 9. WebSocket Server Setup
**Modified**: `src/main/server.ts`
- Integrate WebSocket server with Express server
- Add WebSocket upgrade handling
- Maintain localhost-only security (same as HTTP)

## Testing Plan

### Unit Tests
- `BackgroundTaskService.test.ts`: Test `clearNotifyFn` method
- `event-notification-manager.test.ts`: Test callback registration and broadcasting
- `notifications.test.ts` (both IPC and HTTP): Test broadcast methods
- API client tests: Test event registration/unregistration and WebSocket handling

### Integration Tests
- End-to-end WebSocket broadcasting: Start server, connect client, trigger background task, verify event receipt
- IPC broadcasting: Verify existing IPC events still work
- Concurrent transports: Test both IPC and HTTP clients receiving events simultaneously
- Connection lifecycle: Test WebSocket connect/disconnect, cleanup, and reconnection

### Component Tests
- Update existing component tests that use `onBackgroundTaskUpdate`
- Test event callback execution in `AppLayout.tsx`, `SettingsPage.tsx`, `BackgroundTasksPage.tsx`

### Cucumber Feature Tests
- Add scenarios for HTTP UI background task notifications
- Test WebSocket event delivery in feature tests

## Documentation Updates

### ARCHITECTURE_ANALYSIS.md
- Add section on "Event Notification System" describing the event notification manager and transport broadcasting
- Update "Dual Transport Pattern" to include WebSocket notifications
- Document the generic event system in API clients
- Add sequence diagrams for event notification flow

### SECURITY.md
- Add WebSocket security considerations: localhost-only connections, rate limiting, connection cleanup
- Document WebSocket message validation and sanitization
- Update security patterns for real-time communications

### TESTING.md
- Add "Event Notification Testing" section covering WebSocket and IPC event testing
- Document test isolation for event broadcasting
- Add guidelines for testing real-time features

### AGENTS.md
- **Agent Workflow Guidance**: Emphasize iterative proposal refinement - agents should expect multiple rounds of feedback before implementation
- **Interaction Patterns**: Add "Proposal Development" - create comprehensive proposals in dedicated files, share for feedback, iterate based on human guidance
- **Documentation Strategy**: Stress the importance of updating all relevant documentation files during architectural changes
- **Key Patterns**: Add "Generic Event Systems" pattern for extensible client-side event handling
- **Development Commands**: No changes needed

## Implementation Order

**Important Note**: The HTTP API layer may not be fully functional. If HTTP integration tests fail during implementation, do not attempt to fix unrelated HTTP API issues - focus only on the WebSocket notification functionality. The existing HTTP API problems should be addressed separately.

### Bite-Sized Implementation Pieces

1. **Add clearNotifyFn to BackgroundTaskService**
   - Modify `src/main/services/BackgroundTaskService.ts`
   - Add `clearNotifyFn(fn)` method
   - *Pause Point*: Test that service methods work correctly
   - *Commit*: `feat: add clearNotifyFn to BackgroundTaskService`

2. **Create IPC Transport Notifications**
   - Create `src/main/api-server/ipc/notifications.ts`
   - Implement `setWindow()` and `broadcast()` functions
   - Modify `src/main/api-server/ipc/index.ts` to export them
   - *Pause Point*: Verify IPC notification functions can be imported and called
   - *Commit*: `feat: add IPC transport notification broadcasting`

3. **Create HTTP Transport Notifications**
   - Create `src/main/api-server/http/notifications.ts`
   - Implement `broadcast()` function with WebSocket server management
   - Modify `src/main/api-server/http/index.ts` to export and initialize
   - Add `ws` dependency to `package.json`
   - *Pause Point*: Test that HTTP notification module can be imported
   - *Commit*: `feat: add HTTP transport notification broadcasting with WebSocket server`

4. **Create Event Notification Manager**
   - Create `src/main/event-notification-manager.ts`
   - Implement `initialize()` function with background-task-manager callback registration
   - *Pause Point*: Verify event notification manager initializes without errors
   - *Commit*: `feat: add event notification manager for cross-transport broadcasting`

5. **Refactor Window Manager**
   - Modify `src/main/window-manager.ts`
   - Remove background-task-manager coupling
   - Call `ipcApiServer.setWindow()` in `createAppWindow()`
   - *Pause Point*: Test that Electron window still receives IPC events
   - *Commit*: `refactor: decouple window-manager from background-task-manager`

6. **Implement HTTP API Client Generic Event System**
   - Modify `src/renderer/api-client/http/index.ts`
   - Add generic `on()` and `off()` methods with WebSocket connection management
   - *Pause Point*: Test that HTTP API client can establish WebSocket connections
   - *Commit*: `feat: add generic event system to HTTP API client`

7. **Update Background Tasks API Client**
   - Modify `src/renderer/api-client/http/background-tasks.ts`
   - Implement `onBackgroundTaskUpdate()` using generic event system
   - *Pause Point*: Test that background task API client methods work
   - *Commit*: `feat: implement background task notifications over WebSocket`

8. **Integrate WebSocket Server**
   - Modify `src/main/server.ts`
   - Add WebSocket server integration with security
   - *Pause Point*: Verify WebSocket server starts with HTTP server
   - *Commit*: `feat: integrate WebSocket server with Express for real-time notifications`

9. **Update Main Initialization**
   - Modify `src/main/index.ts`
   - Add `initializeEventNotificationManager()` call
   - *Pause Point*: Test that application starts with event notification system
   - *Commit*: `feat: initialize event notification system on app startup`

10. **Add Comprehensive Tests**
    - Add unit tests for new modules
    - Update integration tests for WebSocket functionality
    - Update component tests
    - *Pause Point*: All tests pass (except pre-existing HTTP API issues)
    - *Commit*: `test: add comprehensive tests for event notification system`

11. **Update Documentation**
    - Update ARCHITECTURE_ANALYSIS.md, SECURITY.md, TESTING.md, AGENTS.md
    - *Pause Point*: Documentation reviewed and approved
    - *Commit*: `docs: update documentation for event notification system`

## Security Considerations

- WebSocket connections restricted to localhost (match HTTP security)
- Rate limiting considerations for WebSocket messages
- Proper cleanup of WebSocket connections on client disconnect
- Message validation and sanitization for WebSocket data

## Future Extensibility

This architecture supports adding notifications for other services:
- Add new event types in event notification manager
- Transport broadcast methods remain generic
- API client generic event system handles any event type
- Components use service-specific methods that abstract event type strings</content>
<parameter name="filePath">NOTIFICATION_PROPOSAL.md