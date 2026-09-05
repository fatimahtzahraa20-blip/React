-- ============================================
-- Seed Categories
-- ============================================

insert into public.categories (
    name,
    slug,
    description
)
values
(
    'YouTube Editing',
    'youtube-editing',
    'Long-form YouTube videos, tutorials, vlogs, and engaging channel content.'
),
(
    'Reels and Shorts',
    'reels-and-shorts',
    'Short-form vertical videos for Instagram Reels, YouTube Shorts, and TikTok.'
),
(
    'Commercial Ads',
    'commercial-ads',
    'Promotional advertisements, product videos, and brand campaigns.'
),
(
    'Motion Graphics',
    'motion-graphics',
    'Animated titles, logo animations, visual effects, and motion design.'
),
(
    'Wedding Films',
    'wedding-films',
    'Cinematic wedding highlights, teasers, and complete event films.'
)
on conflict (slug) do update
set
    name = excluded.name,
    description = excluded.description;

-- ============================================
-- Seed Subcategories
-- ============================================

insert into public.subcategories (
    category_id,
    name,
    slug
)
select
    c.id,
    seed.name,
    seed.slug
from public.categories c
join (
    values
        ('youtube-editing', 'Vlogs', 'youtube-vlogs'),
        ('youtube-editing', 'Tutorials', 'youtube-tutorials'),
        ('reels-and-shorts', 'Instagram Reels', 'instagram-reels'),
        ('reels-and-shorts', 'YouTube Shorts', 'youtube-shorts'),
        ('commercial-ads', 'Product Ads', 'product-ads'),
        ('commercial-ads', 'Brand Promotions', 'brand-promotions'),
        ('motion-graphics', 'Logo Animation', 'logo-animation'),
        ('motion-graphics', 'Animated Titles', 'animated-titles'),
        ('wedding-films', 'Wedding Highlights', 'wedding-highlights'),
        ('wedding-films', 'Wedding Teasers', 'wedding-teasers')
) as seed(category_slug, name, slug)
on c.slug = seed.category_slug
on conflict (slug) do update
set
    name = excluded.name,
    category_id = excluded.category_id;

-- ============================================
-- Seed Videos
-- Replace example URLs before production
-- ============================================

insert into public.videos (
    title,
    slug,
    description,
    thumbnail_url,
    video_url,
    video_source,
    category_id,
    subcategory_id,
    featured,
    views,
    display_order,
    tags
)
select
    'Cinematic Travel Vlog',
    'cinematic-travel-vlog',
    'A cinematic travel vlog edit featuring smooth transitions, sound design, color grading, and dynamic storytelling.',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube',
    c.id,
    sc.id,
    true,
    1250,
    1,
    array['travel', 'cinematic', 'vlog']
from public.categories c
left join public.subcategories sc
    on sc.slug = 'youtube-vlogs'
where c.slug = 'youtube-editing'
on conflict (slug) do update
set
    title = excluded.title,
    description = excluded.description,
    thumbnail_url = excluded.thumbnail_url,
    video_url = excluded.video_url,
    video_source = excluded.video_source,
    category_id = excluded.category_id,
    subcategory_id = excluded.subcategory_id,
    featured = excluded.featured,
    views = excluded.views,
    display_order = excluded.display_order,
    tags = excluded.tags;

insert into public.videos (
    title,
    slug,
    description,
    thumbnail_url,
    video_url,
    video_source,
    category_id,
    subcategory_id,
    featured,
    views,
    display_order,
    tags
)
select
    'Product Commercial Edit',
    'product-commercial-edit',
    'A modern product advertisement with fast cuts, premium typography, motion graphics, and professional sound effects.',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    'https://drive.google.com/file/d/REPLACE_WITH_FILE_ID/view',
    'google_drive',
    c.id,
    sc.id,
    true,
    890,
    2,
    array['product', 'commercial', 'advertisement']
from public.categories c
left join public.subcategories sc
    on sc.slug = 'product-ads'
where c.slug = 'commercial-ads'
on conflict (slug) do update
set
    title = excluded.title,
    description = excluded.description,
    thumbnail_url = excluded.thumbnail_url,
    video_url = excluded.video_url,
    video_source = excluded.video_source,
    category_id = excluded.category_id,
    subcategory_id = excluded.subcategory_id,
    featured = excluded.featured,
    views = excluded.views,
    display_order = excluded.display_order,
    tags = excluded.tags;

insert into public.videos (
    title,
    slug,
    description,
    thumbnail_url,
    video_url,
    video_source,
    category_id,
    subcategory_id,
    featured,
    views,
    display_order,
    tags
)
select
    'Social Media Reel',
    'social-media-reel',
    'A fast-paced vertical reel designed for social media engagement with captions, transitions, and music synchronization.',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube',
    c.id,
    sc.id,
    false,
    640,
    3,
    array['reel', 'vertical-video', 'social-media']
from public.categories c
left join public.subcategories sc
    on sc.slug = 'instagram-reels'
where c.slug = 'reels-and-shorts'
on conflict (slug) do update
set
    title = excluded.title,
    description = excluded.description,
    thumbnail_url = excluded.thumbnail_url,
    video_url = excluded.video_url,
    video_source = excluded.video_source,
    category_id = excluded.category_id,
    subcategory_id = excluded.subcategory_id,
    featured = excluded.featured,
    views = excluded.views,
    display_order = excluded.display_order,
    tags = excluded.tags;

-- ============================================
-- Seed Portfolio Settings
-- Keeps only one settings row
-- ============================================

insert into public.portfolio_settings (
    portfolio_name,
    logo_url,
    hero_title,
    hero_subtitle,
    about,
    owner_name,
    email,
    phone,
    address,
    facebook,
    instagram,
    youtube,
    linkedin,
    seo_title,
    seo_description,
    seo_keywords
)
select
    'Fatima Creative Studio',
    null,
    'Professional Video Editor',
    'I create cinematic videos, engaging social media content, advertisements, and motion graphics.',
    'I am a creative video editor focused on storytelling, pacing, color grading, motion graphics, and professional post-production.',
    'Fatima Khan',
    'contact@example.com',
    '+92 300 1234567',
    'Pakistan',
    '',
    '',
    '',
    '',
    'Fatima Khan | Professional Video Editor',
    'Professional video editor portfolio featuring cinematic videos, YouTube editing, reels, shorts, advertisements, and motion graphics.',
    'video editor, cinematic editing, YouTube editor, reels editor, motion graphics'
where not exists (
    select 1
    from public.portfolio_settings
);