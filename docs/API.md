# API Documentation

Base URL: `http://localhost:3001` (development)

All API endpoints require authentication unless otherwise specified.

## Authentication

### Register
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login
Authenticate a user.

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** Same as register

## Tickets

All ticket endpoints require authentication via Bearer token.

### Get All Tickets
Retrieve tickets with optional filters.

**Endpoint:** `GET /tickets`

**Query Parameters:**
- `status` (optional): Filter by status (OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `assigneeId` (optional): Filter by assignee ID
- `requesterId` (optional): Filter by requester ID

**Example:** `GET /tickets?status=OPEN&priority=HIGH`

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Need AWS S3 access",
    "description": "I need read access to the production S3 bucket...",
    "status": "OPEN",
    "priority": "HIGH",
    "toolchain": "AWS",
    "requesterId": "uuid",
    "assigneeId": null,
    "aiSuggestion": "You can follow our self-service guide...",
    "selfServiceAvailable": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "requester": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null
    },
    "assignee": null
  }
]
```

### Get Ticket by ID
Retrieve a specific ticket with comments.

**Endpoint:** `GET /tickets/:id`

**Response:**
```json
{
  "id": "uuid",
  "title": "Need AWS S3 access",
  "description": "I need read access to the production S3 bucket...",
  "status": "OPEN",
  "priority": "HIGH",
  "toolchain": "AWS",
  "requesterId": "uuid",
  "assigneeId": null,
  "aiSuggestion": "You can follow our self-service guide...",
  "selfServiceAvailable": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "requester": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null
  },
  "assignee": null,
  "comments": [
    {
      "id": "uuid",
      "content": "Thanks for creating this ticket. I'll look into it.",
      "ticketId": "uuid",
      "authorId": "uuid",
      "mentions": [],
      "createdAt": "2024-01-01T01:00:00.000Z",
      "updatedAt": "2024-01-01T01:00:00.000Z",
      "author": {
        "id": "uuid",
        "email": "support@example.com",
        "name": "Support User",
        "avatar": null
      }
    }
  ]
}
```

### Create Ticket
Create a new support ticket. AI analysis is performed automatically.

**Endpoint:** `POST /tickets`

**Request:**
```json
{
  "title": "Need AWS S3 access",
  "description": "I need read access to the production S3 bucket for the data-analytics project. My team is blocked on this.",
  "priority": "HIGH",
  "toolchain": "AWS"
}
```

**Response:** Same structure as Get Ticket by ID

### Update Ticket
Update an existing ticket.

**Endpoint:** `PUT /tickets/:id`

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "assigneeId": "uuid",
  "priority": "URGENT"
}
```

**Response:** Updated ticket object

### Delete Ticket
Delete a ticket.

**Endpoint:** `DELETE /tickets/:id`

**Response:**
```json
{
  "message": "Ticket deleted successfully"
}
```

### Get Metrics
Get ticket analytics and metrics.

**Endpoint:** `GET /tickets/metrics`

**Response:**
```json
{
  "totalTickets": 150,
  "openTickets": 35,
  "resolvedTickets": 100,
  "aiDeflectionRate": 42.5,
  "averageResponseTime": 0
}
```

## Comments

### Get Comments by Ticket
Retrieve all comments for a specific ticket.

**Endpoint:** `GET /comments/ticket/:ticketId`

**Response:**
```json
[
  {
    "id": "uuid",
    "content": "Looking into this now @JohnDoe",
    "ticketId": "uuid",
    "authorId": "uuid",
    "mentions": ["JohnDoe"],
    "createdAt": "2024-01-01T01:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z",
    "author": {
      "id": "uuid",
      "email": "support@example.com",
      "name": "Support User",
      "avatar": null
    }
  }
]
```

### Create Comment
Add a comment to a ticket. Supports @mentions.

**Endpoint:** `POST /comments`

**Request:**
```json
{
  "content": "Thanks for the quick response! @SupportUser let me know if you need more details.",
  "ticketId": "uuid"
}
```

**Response:** Created comment object

**Note:** Users mentioned with @username will receive a notification.

## Notifications

### Get User Notifications
Retrieve notifications for the authenticated user.

**Endpoint:** `GET /notifications`

**Query Parameters:**
- `unreadOnly` (optional): If "true", only return unread notifications

**Example:** `GET /notifications?unreadOnly=true`

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "MENTION",
    "userId": "uuid",
    "ticketId": "uuid",
    "commentId": "uuid",
    "message": "Support User mentioned you in a comment",
    "read": false,
    "createdAt": "2024-01-01T01:00:00.000Z"
  }
]
```

### Get Unread Count
Get the count of unread notifications.

**Endpoint:** `GET /notifications/unread-count`

**Response:**
```json
{
  "count": 5
}
```

### Mark as Read
Mark a specific notification as read.

**Endpoint:** `PUT /notifications/:id/read`

**Response:** Updated notification object

### Mark All as Read
Mark all notifications as read for the authenticated user.

**Endpoint:** `PUT /notifications/read-all`

**Response:**
```json
{
  "count": 5,
  "message": "All notifications marked as read"
}
```

## Users

### Search Users
Search for users by name or email (for @mentions).

**Endpoint:** `GET /users/search`

**Query Parameters:**
- `q` (required): Search query

**Example:** `GET /users/search?q=john`

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "avatar": null
  }
]
```

## WebSocket Events

The application uses Socket.IO for real-time communication.

### Connection
Connect to the WebSocket server with user ID:
```javascript
const socket = io('http://localhost:3001', {
  query: { userId: 'user-uuid' }
});
```

### Events to Emit

**Join Ticket Room:**
```javascript
socket.emit('joinTicket', ticketId);
```

**Leave Ticket Room:**
```javascript
socket.emit('leaveTicket', ticketId);
```

### Events to Listen

**New Comment:**
```javascript
socket.on('newComment', (comment) => {
  console.log('New comment:', comment);
});
```

**Ticket Updated:**
```javascript
socket.on('ticketUpdated', (ticket) => {
  console.log('Ticket updated:', ticket);
});
```

**Notification:**
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

## Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Ticket not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- 100 requests per 15 minutes per IP for unauthenticated endpoints
- 1000 requests per 15 minutes per user for authenticated endpoints

## Pagination

Endpoints that return lists support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Example: `GET /tickets?page=2&limit=20`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Obtain a token by logging in or registering.

## API Versioning

Currently using v1 (implicit). Future versions will be prefixed: `/api/v2/tickets`

## Support

For API questions or issues, please create an issue on GitHub.
