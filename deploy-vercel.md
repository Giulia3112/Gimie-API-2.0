# Deployment Script
# deploy-vercel.md

## Vercel Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy Your API
```bash
vercel --prod
```

### 4. Your API will be available at:
```
https://your-project-name.vercel.app
```

### 5. Update your mobile app configuration:
```javascript
const BASE_URL = 'https://your-project-name.vercel.app';
```

## Environment Variables (Optional)
If you want to use environment variables:

```bash
vercel env add MICROLINK_API_KEY
vercel env add DATABASE_PATH
```

## Automatic Deployments
Connect your GitHub repository for automatic deployments on every push.
