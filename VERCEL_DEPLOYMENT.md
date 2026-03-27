# NetShield Deployment on Vercel

This project can be deployed as a single Vercel app:

- `src/` is the Vite frontend
- `api/index.js` exposes the Express backend as a Vercel Function
- `vercel.json` routes `/auth/*` and `/api/*` requests to the backend function

## Environment Variables

Add these to your Vercel project:

```bash
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/netshield
JWT_SECRET=your_secure_random_secret_key
FRONTEND_URL=https://your-project.vercel.app
```

`VITE_API_URL` is optional. If omitted, the frontend uses same-origin requests in production.

## Deploy Steps

1. Push the repository to GitHub
2. Import the repository into Vercel
3. Add the environment variables above
4. Deploy

## MongoDB Atlas Checklist

1. Create a database user
2. Add `0.0.0.0/0` to `Network Access`
3. Use the database name `netshield` in the connection string

## Local Development

```bash
npm install
npm run server
npm run dev
```

## Packet Analyzer

For local development:

```bash
export API_URL='http://localhost:5000'
```

For production:

```bash
export API_URL='https://your-project.vercel.app'
```
