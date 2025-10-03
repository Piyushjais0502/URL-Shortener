# Design Document

## Overview

The URL shortener application has several critical issues that prevent proper functionality:

1. **Deployment Architecture Mismatch**: The application has both a standalone Express server (`backend/index.js`) and Vercel serverless functions (`backend/api/`), but they're not properly integrated
2. **Frontend API Configuration**: The frontend is hardcoded to call `localhost:3000` which won't work in production or when the backend isn't running locally
3. **Incomplete Serverless Implementation**: The Vercel API endpoints are basic stubs that don't implement the full URL shortening logic
4. **Environment-Specific Configuration**: No environment-based API URL configuration for development vs production

The design will address these issues by creating a unified, environment-aware architecture that works both locally and in production.

## Architecture

### Deployment Strategy
- **Development**: Use the Express server (`backend/index.js`) running on localhost:3000
- **Production**: Use Vercel serverless functions (`backend/api/`) with proper API routes
- **Frontend**: Environment-aware API base URL configuration

### API Endpoint Structure
```
Development:
- POST http://localhost:3000/shorten
- GET http://localhost:3000/:id

Production (Vercel):
- POST /api/shorten
- GET /api/redirect/:id
```

### Environment Configuration
- Use environment variables to determine API base URL
- Fallback mechanisms for when backend is unavailable
- Proper CORS configuration for both development and production

## Components and Interfaces

### Backend Components

#### 1. Express Server (Development)
- **File**: `backend/index.js`
- **Purpose**: Local development server
- **Enhancements Needed**:
  - Better CORS configuration with specific origins
  - Environment-based port configuration
  - Improved error handling and validation
  - Consistent response format

#### 2. Vercel Serverless Functions (Production)
- **Files**: `backend/api/shorten.js`, `backend/api/redirect/[id].js`
- **Purpose**: Production API endpoints
- **Implementation Needed**:
  - Complete URL shortening logic (currently stub)
  - Shared database/storage solution
  - Consistent error handling
  - Proper CORS headers

#### 3. Shared Business Logic
- **File**: `backend/utils/urlShortener.js`
- **Purpose**: Reusable URL shortening logic for both Express and serverless
- **Functions**:
  - `shortenUrl(url, customCode, validity)`
  - `getOriginalUrl(shortCode)`
  - `validateUrl(url)`
  - `generateShortCode()`

### Frontend Components

#### 1. API Configuration
- **File**: `frontend/src/config/api.js`
- **Purpose**: Environment-aware API configuration
- **Features**:
  - Dynamic API base URL detection
  - Retry logic for failed requests
  - Error handling utilities

#### 2. Enhanced Error Handling
- **File**: `frontend/src/utils/errorHandler.js`
- **Purpose**: Centralized error handling and user feedback
- **Features**:
  - Network error detection
  - User-friendly error messages
  - Retry mechanisms

## Data Models

### URL Entry Model
```javascript
{
  id: string,           // Short code identifier
  url: string,          // Original URL
  shortUrl: string,     // Complete shortened URL
  expiresAt: number,    // Timestamp
  createdAt: number,    // Timestamp
  customCode: boolean   // Whether it uses custom code
}
```

### API Response Models
```javascript
// Success Response
{
  shortUrl: string,
  shortcode: string,
  expiresAt: number
}

// Error Response
{
  error: string,
  code?: string
}
```

## Error Handling

### Frontend Error Categories
1. **Network Errors**: Connection failures, timeouts
2. **Validation Errors**: Invalid URLs, custom codes
3. **Server Errors**: 4xx/5xx HTTP responses
4. **Application Errors**: JavaScript runtime errors

### Error Handling Strategy
- **Graceful Degradation**: Show meaningful messages when services are unavailable
- **Retry Logic**: Automatic retry for transient network errors
- **User Feedback**: Clear, actionable error messages
- **Logging**: Comprehensive error logging for debugging

### Backend Error Responses
- Consistent error format across all endpoints
- Appropriate HTTP status codes
- Detailed error messages for debugging
- Rate limiting and abuse prevention

## Testing Strategy

### Unit Tests
- URL validation functions
- Short code generation logic
- Error handling utilities
- API response formatting

### Integration Tests
- Frontend-backend communication
- Database operations (if implemented)
- CORS functionality
- Environment configuration

### End-to-End Tests
- Complete URL shortening workflow
- Redirect functionality
- Error scenarios
- Mobile responsiveness

## Implementation Phases

### Phase 1: Core Fixes
- Fix CORS configuration
- Implement environment-aware API URLs
- Complete serverless function implementation
- Add proper error handling

### Phase 2: Enhanced Features
- Shared business logic extraction
- Improved validation
- Better user feedback
- Performance optimizations

### Phase 3: Production Readiness
- Comprehensive testing
- Security enhancements
- Monitoring and logging
- Documentation updates