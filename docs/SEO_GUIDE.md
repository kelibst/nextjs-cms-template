# SEO Configuration Guide

This template includes a built-in SEO configuration module that allows you to manage how your web application is presented on search engines and social media platforms (WhatsApp, Facebook, Twitter).

## Overview

The SEO settings are globally applied to your Next.js application via the `src/app/layout.tsx` file. All settings are managed directly from your Admin Dashboard.

## Configuring SEO in the Admin Dashboard

1. Log in to the application as a `super_admin`.
2. Navigate to the **Settings** page (`/dashboard/settings`).
3. Scroll down to the **SEO & Search** section.

Here you can configure the following fields:

- **SEO Title**: The default `<title>` tag for your website. If left blank, it will fall back to your Organisation Name.
- **SEO Description**: The default `<meta name="description">` tag. This description is also used for OpenGraph (Facebook/WhatsApp) and Twitter cards. If left blank, it falls back to the Site Description.
- **SEO Keywords**: A comma-separated list of keywords representing your site. (e.g., `agency, web development, nextjs`)
- **Default Social Share Image**: This is the image that appears when your website URL is shared on platforms like WhatsApp, Twitter, LinkedIn, and Facebook. Click **Select Image** to upload or pick from your media library. It is recommended to use an image with an aspect ratio of `1200x630` pixels for optimal display.
- **Search Engine Visibility**: A toggle that controls whether search engines are allowed to index your site. 
  - **On (Allowed)**: Generates `<meta name="robots" content="index, follow">`.
  - **Off (Hidden)**: Generates `<meta name="robots" content="noindex, nofollow">`. This is highly recommended while your site is still in development or on a staging server.

## Technical Details (For Developers)

If you are expanding upon this template, it is important to know how the SEO tags are structured.

### `generateMetadata()`

In `src/app/layout.tsx`, we use Next.js's native `generateMetadata()` function to dynamically fetch the settings from the database cache and construct the `<head>` metadata.

```tsx
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  // ... maps settings to OpenGraph, Twitter, and standard metadata objects
}
```

### Overriding SEO on Specific Pages

Because Next.js automatically merges metadata from leaf pages with the root layout, you can override the global SEO settings on specific pages (like a specific blog post) simply by exporting a `generateMetadata` function from that page.

```tsx
// src/app/(public)/posts/[slug]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetchPost(params.slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [{ url: post.featuredImage }]
    }
  }
}
```

This will automatically merge with the default OpenGraph and Twitter settings defined in the root layout, replacing only the fields you explicitly define.
