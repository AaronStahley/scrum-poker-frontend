# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js TypeScript configuration

## Project Architecture

This is a Next.js 15 scrum poker application built with the App Router architecture. The project uses Firebase for authentication and data storage, with DaisyUI + Tailwind CSS for styling.

### Core Technologies
- Next.js 15 with App Router and Turbopack
- TypeScript with strict configurationI
- Firebase (Firestore + Auth) with anonymous and email authentication
- TailwindCSS 4 + DaisyUI 5 for UI components
- React 19 with Context API for state management

### Key Architecture Patterns

**Authentication Flow:**
- Uses Firebase Auth with anonymous sign-in for guest users
- Supports upgrading anonymous users to email/password accounts
- Auth context (`src/app/contexts/auth.tsx`) manages global authentication state
- AuthProviderWrapper wraps the entire app to provide auth context

**Room Management:**
- Rooms are Firebase Firestore documents with real-time listeners
- Room types defined in `src/types/room.ts` and `src/types/player.ts`
- Firebase operations abstracted in `src/lib/firebase/` modules
- Room-specific logic handled in `src/app/room/[roomId]/page.tsx`

**Component Structure:**
- Components organized by feature in `src/app/components/`
- Reusable hooks in `src/app/hooks/` for Firebase operations
- Global layout with TopNavBar and authentication modals

**State Management:**
- React Context for authentication state
- Custom hooks for Firebase real-time data (useCurrentRoom, usePlayersInRoom, useJoinRoom)
- Component-level state for UI interactions

**Styling:**
- DaisyUI components with "business" theme
- Tailwind utility classes for custom styling
- Global styles in `src/app/globals.css`

### Environment Variables
Firebase configuration requires these environment variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Import Paths
Uses TypeScript path mapping with `@/*` pointing to `./src/*` for clean imports.

## Recent Multi-User Bug Fixes

This application experienced critical race conditions and data corruption with multiple concurrent users. The following fixes have been implemented:

### Fixed Issues:
1. **Race Condition in Player Data Fetching** - Fixed `usePlayersInRoom` hook that was overwriting player arrays when multiple chunks loaded simultaneously
2. **Unsafe Concurrent Firebase Updates** - Replaced unsafe `forEach` async pattern with `Promise.all` in `updatePlayers` function
3. **Missing User Validation** - Added strict validation that users can only update their own card selections
4. **Optimistic Updates** - Implemented immediate UI feedback with server sync and rollback on failure
5. **Debouncing** - Added 300ms debouncing to prevent Firebase spam from rapid user interactions
6. **Error Handling** - Comprehensive error boundaries and user-friendly error messages

### Testing
- **Setup**: Vitest + React Testing Library + JSDOM environment
- **Run Tests**: `npm test`, `npm run test:ui`, `npm run test:coverage`
- **E2E Tests**: Requires Firebase emulator — run `npm run emulators` first, then `npm run test:e2e`
- **E2E Test Files**: Located in `e2e/` directory; emulator must be running on ports 8080 (Firestore) and 9099 (Auth)
- **Unit Test Files**: Located in `__tests__` directories and `src/test/`
- **Coverage**: Unit tests for Firebase operations, integration tests for multi-user scenarios

### Key Architecture Changes:
- Player chunk aggregation uses Map-based merging to prevent data loss
- All Firebase operations wrapped with error handling
- Debounced card selections prevent concurrent update conflicts
- Optimistic UI updates provide immediate feedback
- Error boundaries catch and display runtime errors gracefully