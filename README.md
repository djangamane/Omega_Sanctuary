# OMEGA Blog Generator - Admin Tool

This project is a React-based admin tool that uses the Gemini API to transform a daily news newsletter into an uplifting, SEO-optimized spiritual sermon. It's designed to be integrated into an existing static site, deployed on Vercel, and connected to a Supabase backend to store the generated content.

## Table of Contents

1.  [Technology Stack](#technology-stack)
2.  [Local Development Setup](#local-development-setup)
3.  [Deployment to Vercel](#deployment-to-vercel)
4.  [Supabase Integration: Saving Blog Posts](#supabase-integration-saving-blog-posts)
5.  [Webhook for Social Media Automation](#webhook-for-social-media-automation)
6.  [Integrating Into Your Static Admin Page](#integrating-into-your-static-admin-page)

---

## Technology Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **AI Model:** Google Gemini API via `@google/genai`
*   **Backend/Database:** Supabase
*   **Deployment:** Vercel

---

## Local Development Setup

Follow these steps to run the application on your local machine.

### 1. Prerequisites

*   [Node.js](https://nodejs.org/) (version 18 or later recommended)
*   A package manager like `npm` or `yarn`

### 2. Install Dependencies

In your project's root directory, run the following command to install the necessary packages, including the Supabase client:

```bash
npm install react react-dom @google/genai @supabase/supabase-js
```

### 3. Set Up Environment Variables

You need to provide API keys for the Gemini API and Supabase.

Create a file named `.env.local` in the root of your project. **This file should not be committed to Git.**

Copy the following into `.env.local` and replace the placeholder values with your actual keys:

```
# Get this from Google AI Studio: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Get these from your Supabase project settings > API
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```
**Important:** Because this is a Vite project, all environment variables that you want to expose to the browser **must** be prefixed with `VITE_`.

### 4. Run the Development Server

Once your dependencies are installed and environment variables are set, start the local development server:

```bash
npm run dev
```

You can now access the application at `http://localhost:5173` (or another port if 5173 is in use).

---

## Deployment to Vercel

Vercel makes deploying this project straightforward.

1.  **Push to Git:** Ensure your project is pushed to a GitHub, GitLab, or Bitbucket repository.
2.  **Create a Vercel Project:**
    *   Log in to your Vercel dashboard and click "Add New... > Project".
    *   Import the Git repository you just pushed.
3.  **Configure Project:**
    *   Vercel should automatically detect that you are using **Vite** and configure the build settings correctly.
    *   **Framework Preset:** Vite
    *   **Build Command:** `vite build` or `npm run build`
    *   **Output Directory:** `dist`
4.  **Add Environment Variables:**
    *   This is the most critical step. In your Vercel project's settings, navigate to the **Environment Variables** section.
    *   Add the same variables from your `.env.local` file:
        *   `VITE_GEMINI_API_KEY`
        *   `VITE_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY`
    *   These will be securely injected into the build process. **Do not hardcode keys in your source code.**
5.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your application.

---

## Supabase Integration: Saving Blog Posts

The application is configured to save the generated sermons to your Supabase database.

### 1. Create a Supabase Table

In your Supabase project dashboard, go to the **SQL Editor** and run the following query to create a `blog_posts` table:

```sql
CREATE TABLE public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  raw_newsletter_data TEXT
);

-- Optional: Enable Row Level Security (Recommended)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access (for your blog)
CREATE POLICY "Allow public read access" ON public.blog_posts
FOR SELECT USING (true);

-- Create a policy that allows inserts only for authenticated users (or service roles)
-- For this admin tool, you'll be using the ANON_KEY which is fine for an admin panel,
-- but for production security, consider using a service_role key from a secure backend.
-- For simplicity, this allows anyone with the anon key to write.
CREATE POLICY "Allow anon insert" ON public.blog_posts
FOR INSERT WITH CHECK (true);
```

### 2. How it Works

*   **`services/supabaseService.ts`:** This file initializes the Supabase client using your environment variables.
*   **`App.tsx`:** After a blog post is successfully generated, the "Save to Blog" button becomes active.
*   **`BlogDisplay.tsx`:** Clicking this button calls the `handleSave` function, which takes the title, body, and the original newsletter data and inserts it into your `blog_posts` table. The button provides UI feedback for loading, success, and error states.

---

## Webhook for Social Media Automation

To automatically post to social media when a new sermon is created, use Supabase's built-in Database Webhooks. This is a powerful feature available on Pro plans and up.

### 1. Get Your Webhook URL from Make.com / Zapier

*   In your automation tool (e.g., Make.com), create a new scenario.
*   The trigger module should be **"Webhooks" > "Custom webhook"**.
*   Add a new webhook. It will give you a unique URL. Copy this URL.

### 2. Create a Supabase Database Webhook

*   In your Supabase dashboard, navigate to **Database > Webhooks**.
*   Click **"Create a new webhook"**.
*   **Name:** Give it a descriptive name, like `New Blog Post to Social Media`.
*   **Table:** Select the `blog_posts` table.
*   **Events:** Check the **`Insert`** box. You only want this to trigger when a new post is created.
*   **HTTP Configuration:**
    *   **HTTP Method:** `POST`
    *   **URL:** Paste the webhook URL you copied from Make.com.
    *   **HTTP Headers:** Leave as default (Content-Type: application/json).

### 3. Activate and Test

*   Save the webhook in Supabase.
*   In your automation tool (Make.com), tell it to "listen" for a new event.
*   Go back to your OMEGA Blog Generator app and save a new post to the database.
*   Supabase will automatically send the new blog post data (the `record` object) to your Make.com webhook.
*   You can then use this data to create posts for your social media channels.

---

## Integrating Into Your Static Admin Page

The build process for this Vite/React app creates a standard set of static files (`.html`, `.js`, `.css`).

1.  **Build the Project:**
    Run `npm run build` in the project's root directory. This will generate a `dist` folder.

2.  **Copy Build Assets:**
    The `dist` folder contains everything you need.
    *   `dist/index.html`
    *   `dist/assets/` (folder with JS and CSS files)

3.  **Embed in Your Site:**
    *   **Method 1 (Recommended: Subdirectory):**
        *   Create a new directory in your main static site project, for example, `/admin/blog-generator`.
        *   Copy the **contents** of the `dist` folder into this new directory.
        *   You can now access the tool at `yoursite.com/admin/blog-generator/`. You can link to this page or embed it using an `<iframe>`.

    *   **Method 2 (iFrame):**
        *   Host the contents of the `dist` folder somewhere (e.g., its own Vercel project or a subdirectory).
        *   In your main admin page, embed it using an `<iframe>`:
          ```html
          <iframe src="/admin/blog-generator/" style="width:100%; height:80vh; border:none;"></iframe>
          ```
This setup cleanly separates your admin tool from the rest of your static site while allowing for easy integration.
