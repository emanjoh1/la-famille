# La Famille - AWS Amplify Deployment

## Prerequisites

- AWS Account
- All required API keys and credentials

## Environment Variables

Set these in Amplify Console (App Settings > Environment Variables):

```
NEXT_PUBLIC_APP_URL=https://your-app-domain.amplifyapp.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Deployment Steps

1. Push code to GitHub/GitLab/Bitbucket
2. Go to AWS Amplify Console
3. Click "New app" > "Host web app"
4. Connect your repository
5. Amplify will auto-detect `amplify.yml`
6. Add all environment variables
7. Deploy

## Post-Deployment

1. Update Clerk allowed origins with your Amplify domain
2. Update Stripe webhook endpoint with your Amplify domain
3. Update Supabase allowed origins
4. Test health endpoint: `https://your-domain.amplifyapp.com/api/health`

## Monitoring

- Health check: `/api/health`
- Amplify Console provides logs and metrics
