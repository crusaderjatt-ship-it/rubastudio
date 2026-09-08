# Ruba Studio – Deployment Guide

## MVP Deployment
Frontend + API:
- Vercel

Database:
- Supabase Postgres

Storage:
- Supabase Storage or Cloudflare R2

Environment Variables
- OPENAI_API_KEY
- DATABASE_URL
- STORAGE_BUCKET
- AUTH_SECRET

## CI/CD
- GitHub repo
- Vercel auto-deploy
- staging branch
- production branch

## Monitoring
Track:
- failed uploads
- failed generations
- generation cost
- average generation time
- storage usage
