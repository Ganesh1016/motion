# Motion API Contracts

Complete API documentation for the Motion Task Management Service.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "errors": { ... } // Optional validation errors
  }
}
```

## HTTP Status Codes

- `200 OK` - Successful GET, PUT, PATCH requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests (alternative: 200 with message)
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Authentication

Motion uses JWT (JSON Web Tokens) for authentication.

### Auth Header Format

```
Authorization: Bearer <access_token>
```

### Token Lifecycle

1. **Access Token**: Short-lived (15 minutes), used for API requests
2. **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

---

## Authentication Endpoints

### 1. Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Rate Limit**: 5 requests per 15 minutes

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe" // optional
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-01-20T12:45:28.000Z",
      "updatedAt": "2026-01-20T12:45:28.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Error Responses**:

**409 Conflict** - Email already exists:
```json
{
  "success": false,
  "error": {
    "message": "User with this email already exists",
    "statusCode": 409
  }
}
```

**422 Unprocessable Entity** - Validation errors:
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 422,
    "errors": {
      "password": ["Password must contain at least one uppercase letter"]
    }
  }
}
```

---

### 2. Login

Authenticate an existing user.

**Endpoint**: `POST /auth/login`

**Rate Limit**: 5 requests per 15 minutes

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-01-20T12:45:28.000Z",
      "updatedAt": "2026-01-20T12:45:28.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "statusCode": 401
  }
}
```

---

### 3. Refresh Token

Obtain a new access token using a refresh token.

**Endpoint**: `POST /auth/refresh`

**Rate Limit**: 5 requests per 15 minutes

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-01-20T12:45:28.000Z",
      "updatedAt": "2026-01-20T12:45:28.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully"
}
```

**Note**: Token rotation is implemented. The old refresh token is revoked and a new one is issued.

**Error Responses**:

```json
{
  "success": false,
  "error": {
    "message": "Invalid refresh token",
    "statusCode": 401
  }
}
```

```json
{
  "success": false,
  "error": {
    "message": "Refresh token has been revoked",
    "statusCode": 401
  }
}
```

---

### 4. Logout

Revoke a refresh token (client must also discard access token).

**Endpoint**: `POST /auth/logout`

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "message": "Logout successful"
}
```

**Note**: 
- Access tokens cannot be revoked server-side (stateless JWT)
- Client must discard the access token
- Refresh token is revoked in the database

---

### 5. Get Current User

Get the authenticated user's profile.

**Endpoint**: `GET /auth/me`

**Authentication**: Required

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-20T12:45:28.000Z",
    "updatedAt": "2026-01-20T12:45:28.000Z"
  }
}
```

**Error Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "message": "No token provided",
    "statusCode": 401
  }
}
```

---

## Project Endpoints

All project endpoints require authentication.

### 1. Create Project

Create a new project owned by the authenticated user.

**Endpoint**: `POST /projects`

**Authentication**: Required

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "name": "My Project",
  "description": "Project description" // optional
}
```

**Validation**:
- `name`: Required, max 200 characters
- `description`: Optional, max 1000 characters

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "name": "My Project",
    "description": "Project description",
    "userId": "user-uuid",
    "createdAt": "2026-01-20T12:45:28.000Z",
    "updatedAt": "2026-01-20T12:45:28.000Z",
    "_count": {
      "tasks": 0
    }
  },
  "message": "Project created successfully"
}
```

---

### 2. List User Projects

Get all projects owned by the authenticated user.

**Endpoint**: `GET /projects`

**Authentication**: Required

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "name": "My Project",
      "description": "Project description",
      "userId": "user-uuid",
      "createdAt": "2026-01-20T12:45:28.000Z",
      "updatedAt": "2026-01-20T12:45:28.000Z",
      "_count": {
        "tasks": 5
      }
    },
    {
      "id": "uuid-v4-2",
      "name": "Another Project",
      "description": null,
      "userId": "user-uuid",
      "createdAt": "2026-01-19T12:45:28.000Z",
      "updatedAt": "2026-01-19T12:45:28.000Z",
      "_count": {
        "tasks": 3
      }
    }
  ]
}
```

**Note**: Projects are ordered by `createdAt` descending (newest first)

---

### 3. Get Single Project

Get a specific project by ID (must be owned by authenticated user).

**Endpoint**: `GET /projects/:id`

**Authentication**: Required

**URL Parameters**:
- `id` - Project UUID

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "name": "My Project",
    "description": "Project description",
    "userId": "user-uuid",
    "createdAt": "2026-01-20T12:45:28.000Z",
    "updatedAt": "2026-01-20T12:45:28.000Z",
    "_count": {
      "tasks": 5
    }
  }
}
```

**Error Response** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "message": "Project not found",
    "statusCode": 404
  }
}
```

**Note**: Returns 404 if project doesn't exist OR doesn't belong to user (IDOR prevention)

---

### 4. Update Project

Update a project (must be owned by authenticated user).

**Endpoint**: `PUT /projects/:id`

**Authentication**: Required

**URL Parameters**:
- `id` - Project UUID

**Request Body**:

```json
{
  "name": "Updated Project Name",        // optional
  "description": "Updated description"   // optional
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "name": "Updated Project Name",
    "description": "Updated description",
    "userId": "user-uuid",
    "createdAt": "2026-01-20T12:45:28.000Z",
    "updatedAt": "2026-01-20T13:00:00.000Z",
    "_count": {
      "tasks": 5
    }
  },
  "message": "Project updated successfully"
}
```

---

### 5. Delete Project

Soft delete a project and all its tasks (must be owned by authenticated user).

**Endpoint**: `DELETE /projects/:id`

**Authentication**: Required

**URL Parameters**:
- `id` - Project UUID

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

**Note**: Soft deletes all tasks in the project

---

## Task Endpoints

All task endpoints require authentication.

### TaskStatus Enum Values

```
TODO
IN_PROGRESS
DONE
BLOCKED
```

### 1. Create Task

Create a new task under a project.

**Endpoint**: `POST /tasks`

**Authentication**: Required

**Request Body**:

```json
{
  "title": "My Task",
  "description": "Task description",  // optional
  "status": "TODO",                   // optional, default: TODO
  "projectId": "project-uuid"
}
```

**Validation**:
- `title`: Required, max 200 characters
- `description`: Optional, max 2000 characters
- `status`: Optional, must be one of: TODO, IN_PROGRESS, DONE, BLOCKED
- `projectId`: Required, must be a valid UUID

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "title": "My Task",
    "description": "Task description",
    "status": "TODO",
    "projectId": "project-uuid",
    "createdAt": "2026-01-20T12:45:28.000Z",
    "updatedAt": "2026-01-20T12:45:28.000Z",
    "project": {
      "id": "project-uuid",
      "name": "My Project"
    }
  },
  "message": "Task created successfully"
}
```

**Error Response** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "message": "Project not found",
    "statusCode": 404
  }
}
```

**Note**: Throws 404 if:
- Project doesn't exist
- Project doesn't belong to authenticated user

---

### 2. List Project Tasks

Get all tasks for a specific project (with optional status filtering).

**Endpoint**: `GET /projects/:projectId/tasks`

**Authentication**: Required

**URL Parameters**:
- `projectId` - Project UUID

**Query Parameters**:
- `status` - Optional, filter by status (TODO, IN_PROGRESS, DONE, BLOCKED)

**Examples**:
```
GET /projects/uuid-v4/tasks
GET /projects/uuid-v4/tasks?status=TODO
GET /projects/uuid-v4/tasks?status=IN_PROGRESS
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid-1",
      "title": "First Task",
      "description": "Task description",
      "status": "TODO",
      "projectId": "project-uuid",
      "createdAt": "2026-01-20T12:45:28.000Z",
      "updatedAt": "2026-01-20T12:45:28.000Z",
      "project": {
        "id": "project-uuid",
        "name": "My Project"
      }
    },
    {
      "id": "task-uuid-2",
      "title": "Second Task",
      "description": null,
      "status": "TODO",
      "projectId": "project-uuid",
      "createdAt": "2026-01-20T11:30:00.000Z",
      "updatedAt": "2026-01-20T11:30:00.000Z",
      "project": {
        "id": "project-uuid",
        "name": "My Project"
      }
    }
  ]
}
```

**Note**: 
- Tasks are ordered by `createdAt` descending
- Returns empty array if no tasks match

---

### 3. Get Single Task

Get a specific task by ID (must belong to user's project).

**Endpoint**: `GET /tasks/:id`

**Authentication**: Required

**URL Parameters**:
- `id` - Task UUID

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "My Task",
    "description": "Task description",
    "status": "IN_PROGRESS",
    "projectId": "project-uuid",
    "createdAt": "2026-01-20T12:45:28.000Z",
    "updatedAt": "2026-01-20T13:00:00.000Z",
    "project": {
      "id": "project-uuid",
      "name": "My Project"
    }
  }
}
```

**Error Response** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "statusCode": 404
  }
}
```

---

### 4. Update Task

Update a task (must belong to user's project).

**Endpoint**: `PUT /tasks/:id`

**Authentication**: Required

**URL Parameters**:
- `id` - Task UUID

**Request Body**:

```json
{
  "title": "Updated Task Title",      // optional
  "description": "Updated description", // optional
  "status": "IN_PROGRESS"             // optional
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "Updated Task Title",
    "description": "Updated description",
    "status": "IN_PROGRESS",
    "projectId": "project-uuid",
    "createdAt": "2026-01-20T12:45:28.000Z",
    "updatedAt": "2026-01-20T13:30:00.000Z",
    "project": {
      "id": "project-uuid",
      "name": "My Project"
    }
  },
  "message": "Task updated successfully"
}
```

---

### 5. Update Task Status

Update only the status of a task (dedicated endpoint).

**Endpoint**: `PATCH /tasks/:id/status`

**Authentication**: Required

**URL Parameters**:
- `id` - Task UUID

**Request Body**:

```json
{
  "status": "DONE"
}
```

**Allowed Status Values**:
- `TODO`
- `IN_PROGRESS`
- `DONE`
- `BLOCKED`

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "My Task",
    "description": "Task description",
    "status": "DONE",
    "projectId": "project-uuid",
    "createdAt": "2026-01-20T12:45:28.000Z",
    "updatedAt": "2026-01-20T14:00:00.000Z",
    "project": {
      "id": "project-uuid",
      "name": "My Project"
    }
  },
  "message": "Task status updated successfully"
}
```

**Error Response** (422 Unprocessable Entity):

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 422,
    "errors": {
      "status": ["Status must be one of: TODO, IN_PROGRESS, DONE, BLOCKED"]
    }
  }
}
```

---

### 6. Delete Task

Soft delete a task (must belong to user's project).

**Endpoint**: `DELETE /tasks/:id`

**Authentication**: Required

**URL Parameters**:
- `id` - Task UUID

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

---

## Common Error Scenarios

### 1. Missing Authentication

**Request**: Any protected endpoint without Authorization header

**Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "message": "No token provided",
    "statusCode": 401
  }
}
```

### 2. Invalid Token

**Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "message": "Invalid token",
    "statusCode": 401
  }
}
```

### 3. Expired Token

**Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "message": "Token expired",
    "statusCode": 401
  }
}
```

**Solution**: Use refresh token endpoint to get a new access token

### 4. Rate Limit Exceeded

**Response** (429 Too Many Requests):

```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "statusCode": 429
  }
}
```

### 5. Validation Errors

**Response** (422 Unprocessable Entity):

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 422,
    "errors": {
      "email": ["Invalid email format"],
      "password": [
        "Password must be at least 8 characters",
        "Password must contain at least one uppercase letter"
      ]
    }
  }
}
```

### 6. Resource Not Found

**Response** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "message": "Project not found",
    "statusCode": 404
  }
}
```

**Note**: Same response whether resource doesn't exist or user doesn't have access (IDOR prevention)

---

## Testing the API

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

**Create Project** (replace TOKEN):
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"My First Project","description":"Test project"}'
```

**List Projects**:
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer TOKEN"
```

**Create Task** (replace PROJECT_ID):
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"My Task","projectId":"PROJECT_ID","status":"TODO"}'
```

### Using JavaScript/Fetch

```javascript
// Register
const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test1234',
    name: 'Test User'
  })
});
const { data } = await registerResponse.json();
const { accessToken } = data;

// Create Project
const projectResponse = await fetch('http://localhost:3000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    name: 'My Project',
    description: 'Project description'
  })
});
const projectData = await projectResponse.json();
```

---

## Rate Limiting

- **General Endpoints**: 100 requests per 15 minutes
- **Auth Endpoints** (`/auth/*`): 5 requests per 15 minutes

Rate limits are per IP address.

**Headers in Response**:
```
RateLimit-Limit: 5
RateLimit-Remaining: 4
RateLimit-Reset: 1642684800
```

---

## Notes

1. **IDOR Protection**: All endpoints verify resource ownership before returning data
2. **Password Security**: Passwords are hashed with bcrypt (12 salt rounds)
3. **Token Storage**: Store refresh tokens securely (httpOnly cookies recommended for web apps)
4. **Client-Side Logout**: Access tokens cannot be revoked; client must discard them
5. **Soft Deletes**: Deleting a project marks the project and its tasks as deleted

---

## Support

For issues or questions about the API, please refer to the README.md or open an issue in the repository.
