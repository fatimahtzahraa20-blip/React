-- ============================================
-- Enable UUID Extension
-- ============================================

create extension if not exists "pgcrypto";

-- ============================================
-- Categories
-- ============================================

create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    description text,
    created_at timestamptz default now()
);

-- ============================================
-- Sub Categories
-- ============================================

create table if not exists subcategories (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null
        references categories(id)
        on delete cascade,
    name text not null,
    slug text not null unique,
    created_at timestamptz default now()
);

-- ============================================
-- Videos
-- ============================================

create table if not exists videos (
    id uuid primary key default gen_random_uuid(),

    title text not null,
    slug text not null unique,

    description text,

    thumbnail_url text,

    video_url text not null,

    video_source text not null
        check (video_source in ('youtube','google_drive')),

    category_id uuid
        references categories(id)
        on delete set null,

    subcategory_id uuid
        references subcategories(id)
        on delete set null,

    featured boolean default false,

    views integer default 0,

    display_order integer default 0,

    tags text[],

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);

-- ============================================
-- Contact Messages
-- ============================================

create table if not exists contacts (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    email text not null,

    subject text not null,

    message text not null,

    created_at timestamptz default now()
);

-- ============================================
-- Portfolio Settings
-- ============================================

create table if not exists portfolio_settings (

    id uuid primary key default gen_random_uuid(),

    portfolio_name text,

    logo_url text,

    hero_title text,

    hero_subtitle text,

    about text,

    owner_name text,

    email text,

    phone text,

    address text,

    facebook text,

    instagram text,

    youtube text,

    linkedin text,

    seo_title text,

    seo_description text,

    seo_keywords text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);

-- ============================================
-- Automatically update updated_at
-- ============================================

create or replace function update_updated_at_column()
returns trigger
language plpgsql
as
$$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists update_videos_updated_at on videos;

create trigger update_videos_updated_at
before update on videos
for each row
execute procedure update_updated_at_column();

drop trigger if exists update_settings_updated_at on portfolio_settings;

create trigger update_settings_updated_at
before update on portfolio_settings
for each row
execute procedure update_updated_at_column();