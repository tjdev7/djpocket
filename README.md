
# 🎵 DJpocket 🎵

A lightweight, web-based remote control for Spotify, built with **Next.js** and the **Spotify Web API**. Log in with your Spotify account, see what's playing, and control playback — all from your browser.


## ✨ Features

- 🔐 **OAuth Login** – Secure Spotify authentication using the Authorization Code Flow.
- 🎶 **Now Playing** – Displays current track, artist, album, and album art.
- ⏯️ **Playback Controls** – Play, pause, skip to next, and go to previous track.
- 📊 **Progress Bar** – Shows real-time progress with time elapsed and duration.
- 🖥️ **Device Info** – Shows which device is active.
- 🔄 **Auto-Refresh** – Polls the Spotify API every 3 seconds for up-to-date state.
- 🔁 **Token Refreshing** – Automatically refreshes access tokens without user intervention.
- 📱 **Responsive** – Works great on desktop and mobile.

## 🚀 Demo

Live demo: [https://djpocket.vercel.app](https://djpocket.vercel.app) *(replace with your own URL)*

## 📦 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Spotify OAuth 2.0
- **API:** Spotify Web API
- **Deployment:** [Vercel](https://vercel.com)

## 🛠️ Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- A Spotify account (free or premium)
- A Spotify App registered in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)

## 📋 Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/yourusername/djpocket.git
cd djpocket
```

### 2. Run

```
npm install
# or
yarn install
```

### 3. Add Spotify credentials

Go to the Spotify Developer Dashboard.
Click Create app.
Fill in the app name and description (e.g., "Mini Spotify Player").
In Redirect URIs, add:

http://localhost:3000/api/auth/callback (for local development)
https://your-domain.vercel.app/api/auth/callback (for production)
Click Save.
On the app's Settings page, copy your Client ID and click View client secret to copy the Client Secret.

### 4. Configure environment variables

Create a .env.local file in the root of your project:

```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 5. Run the development server

```
npm run dev
# or
yarn dev
```