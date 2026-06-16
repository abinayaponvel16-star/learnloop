# LearnLoop Backend API

LearnLoop is a MERN backend for mentorship and skill sharing. It uses Express, MongoDB Atlas, Mongoose, JWT, role-based authorization, Cloudinary uploads, pagination, search, and centralized validation/error handling.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill in MongoDB Atlas, JWT, and Cloudinary credentials.

3. Start the API:

```bash
npm run dev
```

Base URL:

```text
http://localhost:5000/api/v1
```

Health check:

```http
GET /health
```

## Authentication

Send JWTs as:

```http
Authorization: Bearer <token>
```

The API also sets an HTTP-only `token` cookie on login/register for browser clients.

## Response Shape

Success:

```json
{
  "success": true,
  "message": "Resource fetched",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "valid email is required" }]
}
```

## Query Features

Most collection endpoints support:

```text
?page=1&limit=10&search=react&sort=-createdAt
```

Additional filters are available per endpoint, such as `status`, `role`, `fileType`, `visibility`, `tags`, and `isRead`.

## Auth Routes

```http
POST /auth/register
POST /auth/login
POST /auth/logout
GET /auth/me
PUT /auth/profile
PUT /auth/change-password
```

Register body:

```json
{
  "name": "Aarav Mentor",
  "email": "aarav@example.com",
  "password": "Password123",
  "role": "mentor",
  "skillsToTeach": ["React", "Node.js"],
  "level": "advanced"
}
```

## Mentorship Routes

```http
POST /mentorships/request        learner
GET /mentorships                 authenticated
GET /mentorships/:id             participant or admin
PUT /mentorships/:id/accept      mentor
PUT /mentorships/:id/reject      mentor
PUT /mentorships/:id/complete    participant or admin
```

Accepting a pending mentorship automatically creates a `Session` document.

Request body:

```json
{
  "mentor": "665000000000000000000001",
  "skill": "React",
  "skillLevelRequired": "intermediate",
  "requestMessage": "I want help building reusable components."
}
```

Accept body:

```json
{
  "topic": "React component architecture",
  "scheduledTime": "2026-07-01T10:00:00.000Z",
  "duration": 60,
  "meetingPlatform": "google-meet",
  "meetingLink": "https://meet.google.com/example"
}
```

## Session Routes

```http
POST /sessions
GET /sessions
GET /sessions/:id
PUT /sessions/:id
PUT /sessions/:id/start
PUT /sessions/:id/end
DELETE /sessions/:id
```

Ending a session marks it completed and increments participant completion counts.

## Resource Routes

```http
POST /resources/upload
GET /resources
GET /resources/:id
DELETE /resources/:id
PATCH /resources/:id/download
```

Upload uses `multipart/form-data` with a `file` field. Link resources can send `fileUrl` without a file.

Form fields:

```text
title
description
sessionId
fileType=pdf|ppt|doc|image|video|link
tags[]=react
visibility=sessionOnly|public
fileUrl
```

## Rating Routes

```http
POST /ratings
GET /ratings
GET /ratings/:id
```

Only learners can rate completed sessions, and the target user must be the session mentor. Rating creation recalculates the mentor's `averageRating` and `totalRatings`.

Body:

```json
{
  "sessionId": "665000000000000000000010",
  "toUser": "665000000000000000000001",
  "stars": 5,
  "communication": 5,
  "teachingQuality": 5,
  "knowledgeLevel": 5,
  "helpfulness": 5,
  "feedback": "Clear and practical session."
}
```

## Notification Routes

```http
GET /notifications
PATCH /notifications/:id/read
```

Notifications are created for mentorship requests, acceptance/rejection, session creation, resource upload, and feedback.

## Admin Routes

All admin routes require `role=admin`.

```http
GET /admin/dashboard
GET /admin/users
DELETE /admin/users/:id
GET /admin/sessions
GET /admin/ratings
GET /admin/resources
GET /admin/skills
POST /admin/skills
PUT /admin/skills/:id
```

Dashboard returns:

```text
totalUsers, totalLearners, totalMentors, totalSessions,
completedSessions, pendingRequests, totalResources, totalRatings,
monthlyGrowth, topMentors, topSkills, mostActiveLearners
```

## Roles

- `learner`: requests mentorships, attends sessions, uploads resources, rates completed sessions.
- `mentor`: accepts/rejects mentorships, manages sessions, uploads resources.
- `admin`: analytics, users, sessions, ratings, resources, and skills management.

## Production Notes

- Keep `JWT_SECRET` long and private.
- Restrict `CLIENT_URL` to trusted origins in production.
- Use MongoDB Atlas IP/network access controls.
- Configure Cloudinary credentials before enabling file uploads.
- Put the API behind HTTPS and a process manager such as PM2, Docker, or your platform runtime.
