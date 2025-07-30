# API Reference

This document provides comprehensive documentation for all API endpoints in the Grow School application.

## Base URL

```
Development: http://localhost:3000/api
Production: https://growyourneed.com/api
```

## Authentication

All API endpoints require authentication unless otherwise specified. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": any,
  "error": string | null,
  "timestamp": string
}
```

## Error Codes

- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Missing or invalid authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## Authentication Endpoints

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "role": "student",
      "name": "John Doe"
    },
    "token": "jwt-token"
  }
}
```

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

### POST /api/auth/logout
Logout and invalidate the current session.

### GET /api/auth/me
Get current user information.

## User Management

### GET /api/users
Get list of users (admin only).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `role`: Filter by role
- `search`: Search by name or email

### GET /api/users/[id]
Get user by ID.

### PUT /api/users/[id]
Update user information.

### DELETE /api/users/[id]
Delete user (admin only).

## Journal Endpoints

### GET /api/journal/entries
Get user's journal entries.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `startDate`: Filter from date
- `endDate`: Filter to date
- `mood`: Filter by mood

### POST /api/journal/entries
Create a new journal entry.

**Request Body:**
```json
{
  "title": "My Day",
  "content": "Today was a great day...",
  "mood": "happy",
  "isPrivate": true,
  "tags": ["school", "friends"]
}
```

### GET /api/journal/entries/[id]
Get specific journal entry.

### PUT /api/journal/entries/[id]
Update journal entry.

### DELETE /api/journal/entries/[id]
Delete journal entry.

### GET /api/journal/analytics
Get journal analytics and insights.

## Wellness Endpoints

### POST /api/wellness/mood-tracking
Submit mood and focus check-in.

**Request Body:**
```json
{
  "mood": "happy",
  "focus": "high",
  "energy": "medium",
  "stress": "low",
  "notes": "Feeling productive today"
}
```

### GET /api/wellness/mood-tracking
Get mood tracking history.

### GET /api/wellness/analytics
Get wellness analytics and trends.

## Creative Assistant Endpoints

### POST /api/creative-assistant/brainstorm
Generate brainstorming ideas.

**Request Body:**
```json
{
  "prompt": "I want to write a story about space",
  "type": "writing",
  "context": "creative writing class"
}
```

### POST /api/creative-assistant/content
Generate creative content.

### GET /api/creative-assistant/history
Get user's creative assistant history.

## Learning Guide Endpoints

### GET /api/learning-guide/paths
Get available learning paths.

### GET /api/learning-guide/paths/[id]
Get specific learning path details.

### POST /api/learning-guide/progress
Update learning progress.

### GET /api/learning-guide/recommendations
Get personalized learning recommendations.

## Calendar Endpoints

### GET /api/calendar/events
Get calendar events.

**Query Parameters:**
- `start`: Start date (ISO string)
- `end`: End date (ISO string)
- `type`: Event type filter

### POST /api/calendar/events
Create new calendar event.

**Request Body:**
```json
{
  "title": "Math Class",
  "description": "Algebra lesson",
  "start": "2024-01-15T09:00:00Z",
  "end": "2024-01-15T10:00:00Z",
  "type": "class",
  "isRecurring": false
}
```

### PUT /api/calendar/events/[id]
Update calendar event.

### DELETE /api/calendar/events/[id]
Delete calendar event.

## Communications Endpoints

### GET /api/communications/messages
Get messages.

### POST /api/communications/messages
Send new message.

### GET /api/communications/conversations
Get conversations list.

### POST /api/communications/conversations
Start new conversation.

## Analytics Endpoints

### GET /api/analytics/dashboard
Get dashboard analytics.

### GET /api/analytics/performance
Get performance metrics.

### GET /api/analytics/engagement
Get engagement statistics.

## School Hub Endpoints

### GET /api/school-hub/classes
Get classes list.

### POST /api/school-hub/classes
Create new class.

### GET /api/school-hub/students
Get students list.

### POST /api/school-hub/enrollment
Enroll student in class.

## System Settings Endpoints

### GET /api/system-settings
Get system configuration.

### PUT /api/system-settings
Update system settings (admin only).

### GET /api/system-settings/themes
Get available themes.

### PUT /api/system-settings/themes/[id]
Update theme settings.

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute

## WebSocket Events

Real-time features use WebSocket connections:

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/api/ws');
```

### Events
- `message`: New message received
- `notification`: System notification
- `user_status`: User online/offline status
- `typing`: User typing indicator

## SDK and Client Libraries

### JavaScript/TypeScript
```javascript
import { GrowSchoolAPI } from '@grow-school/api-client';

const api = new GrowSchoolAPI({
  baseURL: 'http://localhost:3000/api',
  token: 'your-jwt-token'
});

// Usage
const entries = await api.journal.getEntries();
```

## Testing

Use the provided test utilities for API testing:

```javascript
import { createMockRequest } from '../__tests__/utils/test-helpers';

const request = createMockRequest('POST', '/api/journal/entries', {
  title: 'Test Entry',
  content: 'Test content'
});
```

## Changelog

### v1.0.0
- Initial API release
- Authentication system
- Core module endpoints
- WebSocket support

### v1.1.0
- Added analytics endpoints
- Enhanced error handling
- Rate limiting implementation
- Improved documentation
