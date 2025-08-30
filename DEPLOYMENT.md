# HEKAYATY Platform Deployment Guide

## Project Overview
HEKAYATY is a fantasy story publishing and reading platform built with React, Express.js, and Supabase.

## Repository
- **GitHub**: https://github.com/hekayaty7-prog/Hekayaty-platform-.git
- **Branch**: main

## Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase)
- Cloudinary account for media storage
- Environment variables configured

## Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Security
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret

# Email (Optional)
RESEND_API_KEY=your_resend_api_key

# Node Environment
NODE_ENV=production
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Option 2: Railway
1. Connect GitHub repository to Railway
2. Configure environment variables
3. Deploy with automatic builds

### Option 3: Render
1. Create new web service from GitHub
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Configure environment variables

## Build Commands
```bash
# Install dependencies
npm install

# Build client
npm run build:client

# Build server
npm run build:server

# Start production server
npm start
```

## Database Setup
1. Set up Supabase project
2. Run database migrations:
   ```bash
   npm run db:push
   ```
3. Configure Row Level Security (RLS) policies in Supabase

## Post-Deployment Checklist
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Cloudinary integration working
- [ ] Authentication flow tested
- [ ] File uploads functional
- [ ] Admin dashboard accessible

## Monitoring
- Check server logs for errors
- Monitor database performance
- Track file upload success rates
- Monitor authentication metrics

## Support
For deployment issues, check:
1. Environment variables are correctly set
2. Database connection is established
3. Cloudinary credentials are valid
4. All required services are running
