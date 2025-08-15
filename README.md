# Meal Book - Recipe Management App

A mobile-first React web app for managing recipes, meal planning, and bookmarking your favorite dishes. Built with React, Firebase, and Tailwind CSS.

## Features

- **Recipe Management**: Create, edit, delete, and view recipes with images
- **Search & Filter**: Search recipes by title, ingredients, or tags; filter by meal type
- **Bookmarking**: Save your favorite recipes for quick access  
- **Week Planning**: Plan meals for each day of the week
- **Mobile-First Design**: Optimized for mobile devices with responsive design
- **Anonymous Authentication**: No signup required - get started immediately
- **Image Upload**: Upload and store recipe images via Firebase Storage
- **Real-time Sync**: All data synced via Firebase Firestore

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase v10 (Firestore, Storage, Anonymous Auth)
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable the following services:
   - **Authentication**: Enable Anonymous sign-in method
   - **Firestore Database**: Create database in production mode
   - **Storage**: Create default bucket

3. In Project Settings, add a Web app and note down the configuration values:
   - API Key
   - Auth Domain  
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

4. Set up security rules by deploying the included `firestore.rules` and `storage.rules` files:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   firebase deploy --only firestore:rules,storage
   ```

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd meal-book
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Add your Firebase configuration to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5000`.

### Deployment to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist/public`
   - Add environment variables in Netlify dashboard

3. The `netlify.toml` and `public/_redirects` files are already configured for SPA routing.

## Project Structure

