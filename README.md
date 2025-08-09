# makingbaby

Starter monorepo combining a simple backend and frontend for the MakingBaby MVP.

## Development

Install dependencies:

```
npm install
```

Build both apps:

```
npm run build
```

Run backend:

```
npm run dev -w backend
```

Run frontend:

```
npm run dev -w frontend
```


Run both apps concurrently:

```
npm run dev
```

## Environment Variables

Example `.env.example` files are provided for the backend and frontend.
Copy them to `.env` in each app and adjust as needed.

## Deployment

### Docker

Build and run the backend with Docker:

```
docker build -t makingbaby-backend .
docker run -p 3000:3000 makingbaby-backend
```

### Vercel

Deploy the frontend using the provided `vercel.json`:

```
vercel --prod apps/frontend
```

### Render

The `render.yaml` config demonstrates how to deploy the backend on Render.

