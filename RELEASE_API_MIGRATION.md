# Frontend Release API Migration

This document explains the changes made to implement form submission using the release API endpoint.

## Changes Made

### 1. New API Files

#### `lib/api/releases.ts`
- Created a new releases API file that mirrors the submissions API
- Uses `/release` endpoint instead of `/submissions`
- Contains all CRUD operations: `getReleases`, `createRelease`, `updateRelease`, `submitRelease`, `cancelRelease`, `deleteRelease`
- Handles file uploads via the existing `uploadFile` function

### 2. Updated Components

#### `app/dashboard/upload/page.tsx`
- Changed import from `submitNewSubmission` to `submitNewRelease`
- Updated form submission to use the new release API
- Added missing `format` field to form state
- Artist search uses backend API endpoints

#### `components/dashboard/upload/basic-info-step.tsx`
- Artist search calls backend endpoints: `/integrations/spotify/search` and `/integrations/youtube/search`
- Both searches run in parallel for better performance

#### `app/dashboard/page.tsx`
- Updated to use `getReleases` instead of `getSubmissions`
- Changed type from `Submission[]` to `Release[]`

#### `app/dashboard/releases/page.tsx`
- Replaced all submissions API calls with releases API equivalents
- Updated imports and function calls throughout

#### `app/upload/page.tsx`
- Updated to use `submitNewRelease` instead of `submitNewSubmission`
- Artist search uses backend API endpoints

### 3. Environment Variables

Updated `.env.example`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note**: Artist search API keys (Spotify, YouTube) should be configured in the backend, not the frontend.


## Setup Instructions

1. **Configure Environment Variables**:
   - Copy `.env.example` to `.env.local` in the frontend directory
   - Set `NEXT_PUBLIC_API_URL` to your backend URL (default: `http://localhost:3001`)

2. **Backend Configuration**:
   - Artist search API keys (Spotify, YouTube) should be configured in your backend
   - The backend should expose these endpoints:
     - `GET /integrations/spotify/search?q={query}&limit={limit}`
     - `GET /integrations/youtube/search?q={query}&limit={limit}`

## API Endpoint Changes

### Before
```typescript
// Submissions API
POST /submissions          // Create submission
GET /submissions           // Get all submissions
GET /submissions/:id       // Get single submission
PUT /submissions/:id       // Update submission
DELETE /submissions/:id    // Delete submission
POST /submissions/:id/submit    // Submit for review
POST /submissions/:id/cancel    // Cancel submission
```

### After
```typescript
// Release API (plural)
POST /releases              // Create release
GET /releases               // Get all releases
GET /releases/:id           // Get single release
PUT /releases/:id           // Update release
DELETE /releases/:id        // Delete release
POST /releases/:id/submit   // Submit for review
POST /releases/:id/cancel   // Cancel submission
```

## Architecture

### Artist Search Flow:
1. User types artist name in frontend
2. Frontend calls backend endpoints:
   - `GET /integrations/spotify/search`
   - `GET /integrations/youtube/search`
3. Backend handles API authentication and returns results
4. Frontend displays search results

### Form Submission Flow:
1. User fills out upload form
2. Frontend uploads files (currently mock, ready for S3/Cloudinary)
3. Frontend calls `POST /releases` with all form data
4. Backend creates release record

## Type Definitions

Both `ReleaseFormData` and `CreateReleaseData` types match the previous submission types, ensuring compatibility with existing form components.

## Next Steps

To make this production-ready:

1. Implement actual cloud storage for file uploads (S3/Cloudinary)
2. Add proper error handling and retry logic
3. Implement rate limiting for API calls
4. Add loading states and better UX feedback
5. Ensure backend has proper API key management for Spotify and YouTube
