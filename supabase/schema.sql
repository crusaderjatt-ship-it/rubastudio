create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  name text,
  image_urls text[] not null default '{}',
  ai_analysis_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists generated_images (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid references outfits(id) on delete set null,
  prompt_text text not null,
  image_url text not null,
  thumbnail_url text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists edit_history (
  id uuid primary key default gen_random_uuid(),
  generated_image_id uuid references generated_images(id) on delete cascade,
  instruction text not null,
  previous_image_url text not null,
  new_image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists captions (
  id uuid primary key default gen_random_uuid(),
  generated_image_id uuid references generated_images(id) on delete cascade,
  caption_text text not null,
  hashtags text,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  default_model text not null default 'ruba',
  default_backdrop text not null default 'Chandigarh garden',
  default_aspect_ratio text not null default '9:16',
  created_at timestamptz not null default now()
);

-- Create a public bucket named "ruba-studio" in Supabase Storage.
-- For this private PWA MVP, generated public URLs are used for easy mobile preview, download, and sharing.
