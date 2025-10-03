# Backend Configuration

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   - `NODE_ENV`: Set to `development` or `production`
   - `PORT`: Server port (default: 3000)
   - `BASE_URL`: Base URL for shortened links
   - `FRONTEND_URL`: Frontend URL for CORS

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Debug Mode
```bash
npm run dev:debug
```

## API Endpoints

- `GET /` - Health check
- `GET /api/status` - API status and stats
- `POST /shorten` - Create shortened URL
- `GET /:id` - Redirect to original URL

## CORS Configuration

The server is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:5173` (Vite dev server)
- `http://localhost:4173` (Vite preview)
- Production frontend URL (set via `FRONTEND_URL`)

## Error Handling

- All endpoints include proper error handling
- Errors are logged via the logging middleware
- Global error handler catches unhandled errors
- Development mode shows detailed error messages