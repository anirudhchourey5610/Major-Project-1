# NetShield Backend Deployment on Render

## Prerequisites

- A [Render](https://render.com) account
- MongoDB Atlas account (or MongoDB URI)
- GitHub repository

## Deployment Steps

### 1. Set up MongoDB Atlas (if not already done)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Render
5. Get your connection string

### 2. Deploy on Render

1. **Create a new Web Service:**

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service:**

   - **Name:** netshield-backend (or your preferred name)
   - **Environment:** Node
   - **Region:** Choose closest to your users
   - **Branch:** main
   - **Root Directory:** Leave empty
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server`

3. **Environment Variables:**
   Add the following environment variables in Render:

   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_secret_key
   PORT=5000
   ```

4. **Advanced Settings (Optional):**

   - **Auto-Deploy:** Yes (deploys on every push to main)
   - **Health Check Path:** Leave default

5. Click "Create Web Service"

### 3. Update Frontend Configuration

After deployment, Render will provide a URL like:

```
https://netshield-backend.onrender.com
```

Update your frontend `.env` file:

```
VITE_API_URL=https://netshield-backend.onrender.com
```

## Testing

Test your deployed backend:

```bash
curl https://your-service-name.onrender.com/
```

## Notes

- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- For production, consider upgrading to a paid plan
- Keep your JWT_SECRET secure and different from development

## Troubleshooting

If deployment fails:

1. Check Render logs in the dashboard
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0
4. Check that the connection string is properly formatted
