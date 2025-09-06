# NEET Logiq Cloudflare Worker

This repository contains the backend implementation for the NEET Logiq application using Cloudflare Workers.

## Features

- RESTful API endpoints for colleges and courses data
- AI-powered search using Cloudflare AI
- Vector search using Cloudflare Vectorize
- Real-time data updates
- Typesense integration for advanced search
- BMAD AI-powered optimization and recommendations

## Local Development

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Wrangler CLI (`npm install -g wrangler`)

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the local development server:

```bash
npm run dev
```

### Known Issues and Solutions

#### Running with Missing Dependencies

When running the worker locally, you might encounter issues with AI and Vectorize bindings since they require a Cloudflare account. The code has been modified to handle these missing dependencies gracefully:

- AI services will be disabled when `env.AI` is not available
- Vectorize services will be disabled when `env.VECTORIZE_INDEX` is not available
- TypesenseIntegration will check for availability before making requests
- BMADIntegration will check for AI availability before using AI features

To run the worker with Vectorize bindings in production mode:

```bash
npx wrangler dev --experimental-vectorize-bind-to-prod
```

#### Simplified Testing

For testing basic functionality without AI and Vectorize dependencies, use the minimal worker:

```bash
npx wrangler dev --config minimal-wrangler.toml
```

This will start a simplified worker with only the essential endpoints.

## API Endpoints

### Health Check

```
GET /api/health
```

Returns the health status of the worker.

### Colleges

```
GET /api/colleges
```

Query parameters:
- `search`: Search term
- `state`: Filter by state
- `college_type`: Filter by college type
- `management_type`: Filter by management type
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 24)

### Courses

```
GET /api/courses
```

Query parameters:
- `college_id`: Filter by college ID
- `stream`: Filter by stream
- `search`: Search term
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Search

```
GET /api/search
```

Query parameters:
- `q`: Search query
- `type`: Search type (all, colleges, courses)
- `limit`: Max results (default: 10)

### AI Search

```
GET /api/ai-search
```

Query parameters:
- `q`: Search query
- `type`: Search type (colleges, courses, cutoffs)

### Real-time Updates

```
GET /api/realtime/updates
```

Query parameters:
- `since`: Timestamp for updates since
- `type`: Update type (all, courses, colleges)

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

For development environment:

```bash
npm run deploy:dev
```

For production environment:

```bash
npm run deploy:prod
```

## Database Management

Create a new D1 database:

```bash
npm run db:create
```

Apply migrations:

```bash
npm run db:migrate
```

Execute a SQL query:

```bash
npm run db:query -- "SELECT * FROM colleges LIMIT 10"
```

Backup the database:

```bash
npm run db:backup
```

## Troubleshooting

If you encounter issues with the worker not responding, try the following:

1. Check if there are any error messages in the console
2. Try running with the `--log-level debug` flag
3. Make sure the D1 database is properly configured
4. Use the minimal worker to test basic functionality
5. Check if the port is already in use by another process

## License

This project is proprietary and confidential.
