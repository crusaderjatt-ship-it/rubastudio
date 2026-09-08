# Ruba Studio – Architecture

## Recommended MVP Architecture

Frontend:
- Next.js PWA
- React
- TypeScript
- TailwindCSS
- shadcn/ui

Backend:
- Next.js API routes initially
- Optional FastAPI later if AI pipeline grows

Database:
- Supabase Postgres

Storage:
- Supabase Storage or Cloudflare R2

AI:
- OpenAI image generation
- OpenAI vision/outfit parsing
- OpenAI text generation for captions/hashtags

Hosting:
- Vercel

## System Flow
User uploads outfit
↓
Image stored in object storage
↓
AI parses outfit details
↓
Prompt builder combines:
- Ruba profile
- outfit details
- selected pose
- selected backdrop
- user instruction
↓
Image generation job starts
↓
Generated images saved
↓
User picks best output
↓
Caption + hashtags generated
↓
User downloads or shares to Instagram

## PWA Capabilities
- Installable on phone
- Mobile camera/photo picker
- Home screen icon
- Responsive 9:16 experience
- Native share sheet where supported
