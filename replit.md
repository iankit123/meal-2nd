# Overview

Meal Book is a mobile-first recipe management web application built with React that allows users to create, search, bookmark, and plan meals. The app features anonymous authentication for immediate access without signup, real-time data synchronization through Firebase, and a responsive design optimized for mobile devices. Users can manage their recipe collection, bookmark favorites, and plan weekly meals across breakfast, lunch, and dinner slots.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern React features
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **Form Management**: React Hook Form with Zod schema validation for type-safe form handling

## Backend Architecture
- **Server**: Express.js server with TypeScript
- **Database**: Currently configured for PostgreSQL with Drizzle ORM, but Firebase Firestore is the primary data store
- **Authentication**: Firebase Anonymous Authentication for frictionless user onboarding
- **File Storage**: Firebase Storage for recipe images with automatic cleanup

## Data Storage Solutions
- **Primary Database**: Firebase Firestore for real-time data synchronization
  - Collections: recipes, weekPlans
  - Document structure includes user ownership and bookmarking arrays
- **Backup/Alternative**: PostgreSQL with Drizzle ORM (configured but not actively used)
- **File Storage**: Firebase Storage with organized folder structure (recipes/{userId}/{imageId})
- **Client-side Caching**: TanStack Query for optimistic updates and offline-first experience

## Authentication and Authorization
- **Authentication Method**: Firebase Anonymous Authentication
  - Automatic sign-in on first visit
  - No user registration required
  - Persistent sessions across browser sessions
- **Authorization**: User-based data isolation through Firestore security rules
  - Users can only access their own recipes and week plans
  - Bookmark functionality uses array-based user ID tracking

## Mobile-First Design
- **Responsive Layout**: Mobile-first approach with max-width containers (max-w-md for mobile, expanding for desktop)
- **Touch-Friendly Interface**: Large tap targets, swipe gestures, and mobile-optimized navigation
- **Progressive Enhancement**: Core functionality works on all devices with enhanced features for larger screens

## Key Features Implementation
- **Recipe Management**: Full CRUD operations with image upload and Firebase Storage integration
- **Search and Filtering**: Client-side search by title, ingredients, and tags with category-based filtering
- **Bookmarking System**: Array-based bookmarking stored in recipe documents for real-time updates
- **Week Planning**: Grid-based meal planning with drag-and-drop-style assignment of recipes to time slots
- **Real-time Sync**: Firebase Firestore listeners ensure data consistency across devices

# External Dependencies

## Firebase Services
- **Firestore**: NoSQL document database for storing recipes and week plans
- **Authentication**: Anonymous authentication service for user management
- **Storage**: File storage service for recipe images with automatic URL generation
- **Security Rules**: Custom rules for data access control (firestore.rules, storage.rules)

## UI and Styling Libraries
- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library based on Radix UI

## Development Tools
- **Vite**: Build tool and development server with React plugin
- **TypeScript**: Type checking and enhanced development experience
- **Replit Integration**: Development environment plugins for Replit platform

## Data Management
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for form inputs and data structures
- **UUID**: Unique identifier generation for images and data records

## Potential Database Migration
- **Drizzle ORM**: Configured for PostgreSQL database as an alternative to Firebase
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)
- **Database Migration**: Schema defined in shared/schema.ts for potential Firebase-to-PostgreSQL migration