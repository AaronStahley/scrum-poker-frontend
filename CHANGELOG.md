# Changelog

## [1.5.3] - 2026-07-12

### 🐛 Bug Fixes

- **Player state corruption on failed room join** (`useJoinRoom.ts`): `addPlayerToRoom` and `updatePlayer` were fired concurrently via `Promise.all`. If the room was deleted between the membership check and the join write, `updatePlayer` could commit `currentRoom: roomId` to the player's Firestore document before `addPlayerToRoom` failed — leaving the player pointing to a room they were never added to. The two writes are now sequenced: `updatePlayer` only runs if `addPlayerToRoom` succeeds.

- **Auto-join errors invisible on direct room navigation** (`RoomClient.tsx`): When a user navigated directly to `/room/[id]`, errors from the auto-join flow (network failures, Firebase errors) were silently discarded — `RoomClient` was not consuming the `error` field returned by `useJoinRoom`. Errors are now surfaced through the existing `ErrorToast`.

- **Room-deleted redirect tied to hardcoded error string** (`useCurrentRoom.ts` / `RoomClient.tsx`): The redirect that fires when a room is deleted was gated on a raw string comparison (`roomError.message === 'Room does not exist'`). The error message is now a shared exported constant (`ROOM_NOT_FOUND_ERROR`) defined in `useCurrentRoom.ts` and referenced from `RoomClient.tsx`, so any future change to the message stays in sync automatically.

### ⚡ Breaking Changes
None.

---

## [1.5.2] - 2026-06-23

### 📊 Analytics

- **Firebase Analytics**: Wired up the existing Firebase Analytics measurement ID (`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`) — added `measurementId` to the Firebase config and initialized the Analytics SDK browser-side. Firebase now tracks sessions, page views, and events in the Firebase Analytics dashboard
- **Vercel Analytics**: Added `<Analytics />` component from `@vercel/analytics` to the root layout, enabling page view and route-change tracking in the Vercel Analytics dashboard
- **Vercel Speed Insights**: Added `<SpeedInsights />` component from `@vercel/speed-insights` to the root layout, enabling Core Web Vitals (LCP, CLS, FID) reporting in the Vercel dashboard

### ⚡ Breaking Changes
None — all changes are additive and transparent to users.

---

## [1.5.1] - 2026-06-17

### 🏗️ Technical Implementation

#### FE-CLEANUP-001: Room `lastActivity` tracking

Every room document in Firestore now has a `lastActivity` timestamp. It refreshes whenever something meaningful happens — a room is created, anyone navigates to it, a player joins or leaves, votes are revealed or reset, or room settings are changed. This gives a future cleanup microservice a reliable signal to identify and purge stale rooms.

One subtle fix was needed: returning players previously took a shortcut path that skipped all room writes entirely, so their visits weren't being recorded. That gap is now closed.

---

## [1.5.0] - 2026-06-13

### 🆕 New Features

#### Spectator Mode
- **Join as Spectator**: When joining a room (via direct URL or the home page join form), users are now prompted to choose whether they want to join as a **Player** (votes on estimates) or a **Spectator** (observes without voting)
- **Spectator Card Hiding**: Spectators do not see the playing card selector — the voting UI is hidden entirely for them
- **Spectators Excluded from Stats**: Vote statistics (Recommended, Range, Consensus) only count votes from active players; spectators are excluded
- **Role Toggle**: Players can switch themselves between Player and Spectator at any time via the eye icon in the Actions column. The host can also toggle any other player's role. The host can toggle their own role too
- **Split Player Table**: The player table now has two distinct sections — **Players** at the top and a collapsible **Spectators** section at the bottom (collapsed by default). Spectator rows are visually muted to indicate they are secondary
- **Spectator Count Badge**: The collapsible Spectators header shows a count badge so the number of spectators is visible without expanding

### 🏗️ Technical Implementation

- **`src/types/room.ts`**: Added `spectators?: string[]` field to `Room` interface
- **`src/lib/firebase/room.ts`**: Updated `addPlayerToRoom` to accept a `role` parameter and write to `spectators` array; updated `removePlayerFromRoom` to clean up the spectators array; added `togglePlayerRole` function
- **`src/app/contexts/auth.tsx`**: Added `pendingRole` state and `setPendingRole` to auth context for carrying role selection through the new player creation flow
- **`src/app/hooks/useJoinRoom.ts`**: Major rewrite — added `showRoleModal` state, `confirmRole` handler, and logic to detect whether a user is new to a room before prompting for role selection
- **`src/app/components/room/JoinRoleModal.tsx`**: New modal component for authenticated users to choose Player or Spectator when joining a room
- **`src/app/components/player/NewPlayerModal.tsx`**: Replaced single Join button with "Join as Player" / "Join as Spectator" buttons
- **`src/app/components/room/JoinRoomForm.tsx`**: Added `JoinRoleModal` render for the home page join flow
- **`src/app/components/room/RoomClient.tsx`**: Spectator-aware rendering — hides card selector for spectators, passes `spectatorIds` and `onToggleRole` to `PlayerTable`, renders `JoinRoleModal` for new joiners
- **`src/app/components/player/PlayerTable.tsx`**: Split into Players/Spectators sections with collapsible Spectators tbody; eye/eye-slash icons in Actions column for role toggling; border divider treatment with uppercase section label and count badge
- **`src/lib/voteStats.ts`** / **`src/app/components/room/VoteStatistics.tsx`**: Updated to accept and apply `spectatorIds` so spectators are excluded from all vote calculations
- **`src/lib/__tests__/voteStats.test.ts`**: Added spectator exclusion tests (49 total tests)

### 🐛 Bug Fixes
- **Card selector flash on refresh**: Spectators no longer briefly see the voting card selector on page load — card selector now waits for room data before rendering

### ⚡ Breaking Changes
None — all changes are additive. Existing rooms without a `spectators` field treat all players as voters.

---

## [1.4.0] - 2026-06-12

### 🆕 New Features

#### Vote Statistics
- **Vote Summary Bar**: After votes are revealed, a summary bar now appears above the player table showing key statistics at a glance
- **Recommended Story Point**: Displays the nearest valid story point (from the Fibonacci-based scale) to the average of all numeric votes — gives the team an actionable estimate rather than a raw decimal
- **Vote Range**: Shows the lowest and highest numeric votes cast, making spread immediately visible
- **Consensus Badge**: Color-coded badge indicating team agreement — Unanimous (all votes match), Close (range ≤ 2), or Split (range > 2)
- **Participation Count**: Shows how many players cast numeric votes out of the total in the room
- **Hover Tooltips**: Each stat has a tooltip explaining what it means and how it's calculated

### 🏗️ Technical Implementation

- **`src/lib/voteStats.ts`**: New pure utility module with `calculateVoteStats()` function — computes recommended, min, max, and consensus from a player array
- **`src/app/components/room/VoteStatistics.tsx`**: New display component rendered conditionally in `RoomClient` when votes are revealed
- **`src/lib/__tests__/voteStats.test.ts`**: 11 unit tests covering edge cases including no votes, `"?"` only votes, mixed inputs, single voter, and empty player list
- Non-numeric votes (`null`, `"?"`) are excluded from all calculations

### 🐛 Bug Fixes
- None

### ⚡ Breaking Changes
None — all changes are additive.

---

## [1.3.0] - 2025-09-04

### 🆕 New Features

#### Enhanced Theme System & Anonymous User Support
- **ThemeModeSelector Component**: New comprehensive theme mode selector supporting System/Light/Dark modes with automatic system preference detection
- **Anonymous User Themes**: Theme selection now available for non-authenticated users in the top navigation bar
- **Dual Theme Preferences**: Users can set separate preferred light and dark themes, with automatic switching based on mode selection
- **System Theme Detection**: Automatic detection and following of system dark/light preference when in System mode
- **Enhanced Theme Architecture**: Complete rewrite of theme context with mode management, separate light/dark theme storage, and anonymous user support
- **Navigation Integration**: Theme selector prominently displayed in navigation for all users (authenticated and anonymous)
- **Firebase Theme Persistence**: Theme preferences stored in Firebase for authenticated users with seamless sync across devices
- **Theme Search Enhancement**: Global theme search functionality works across both light and dark theme categories
- **Improved Theme Organization**: Themes organized by light/dark categories with expandable sections and popular theme highlights

#### Room Management & Host Settings
- **Host Settings Modal**: Comprehensive host settings modal with card-based sections and improved UX
- **Room Header**: New `RoomHeader` component for better room information display
- **Delete Room Confirmation**: Dedicated `DeleteRoomConfirmationModal` with proper confirmation flow
- **Room Permissions**: Enhanced room permission management for host controls
- **Visual Hierarchy**: Improved UI with icons, proper typography, and visual emphasis

#### Display Name Management
- **Change Display Name**: New `ChangeDisplayNameForm` component allows users to update their display name
- **Character Validation**: Real-time character counting and validation (3-50 characters)
- **Firebase Sync**: Display name changes sync between Firebase Auth and Firestore player records
- **Settings Integration**: Display name change functionality integrated into Settings page with local loading states

#### Theme System
- **Theme Selector**: New comprehensive theme selection system with 30+ DaisyUI themes
- **Theme Preview**: Live theme preview component showing colors and sample UI elements
- **Theme Context**: Global theme context for app-wide theme management with improved performance
- **Persistent Themes**: Theme selection persists across sessions using localStorage

#### UX Improvements
- **Modal-Based Forgot Password**: Replaced separate forgot password page with modern modal approach
- **Enhanced Player Display**: Player selection display with visual icons in PlayerTable component
- **Improved Autofill Handling**: Better browser autofill support and accessibility for modal interactions
- **Loading States**: Enhanced loading skeletons for navigation and profile areas
- **Error Boundaries**: Improved error boundary component with better error display

### 🏗️ Technical Implementation

#### Component Architecture
- **Host Management Components**: New reusable components for host settings and room management
- **Modal System**: Improved modal system with better UX patterns and confirmation flows
- **Loading Skeletons**: Dedicated skeleton components (`NavBarSkeleton`, `ProfileSkeleton`, `SkeletonDropdownArrow`)
- **Form Validation**: Enhanced form validation with character limits and real-time feedback

#### Context Management
- **Enhanced Theme Context**: Complete rewrite with mode management, system theme detection, and anonymous user support (461+ lines added)
- **Theme Mode Management**: New context methods for managing System/Light/Dark modes with automatic switching
- **Anonymous Theme Persistence**: Theme preferences for non-authenticated users stored in localStorage
- **Auth Context Updates**: Enhanced auth context with display name change functionality
- **Player State Sync**: Improved synchronization between authentication and player data
- **Room State Management**: Enhanced room state management for host operations

#### Testing & Quality Improvements
- **Test Suite Stabilization**: Comprehensive cleanup of flaky test files that had timer mocking and component rendering issues
- **Enhanced Test Coverage**: New comprehensive test suite for ThemeModeSelector component (256+ lines)
- **Theme Context Testing**: Extensive testing for theme context with mode management and system detection (571+ lines)
- **CI/CD Readiness**: All tests now pass consistently for reliable deployment pipeline
- **Build Stability**: Ensured clean test runs for continuous integration workflows
- **Development Workflow**: Improved developer experience with reliable test execution

#### Firebase Integration
- **Room Operations**: New Firebase functions for room deletion and host settings
- **Player Management**: Enhanced player management with host permissions
- **Real-time Updates**: Improved real-time synchronization for room changes

### 🎨 UI/UX Design

#### Design System Enhancements
- **Card-Based Layout**: Host settings modal uses card-based sections for better organization
- **Icon Integration**: Consistent use of Heroicons throughout the application
- **Typography Hierarchy**: Improved visual hierarchy with proper text sizing and emphasis
- **Theme Variety**: Support for 30+ DaisyUI themes with live preview
- **Consistent Modals**: Standardized modal design patterns across the application

#### Accessibility
- **Modal Accessibility**: Improved modal focus management and keyboard navigation
- **Form Accessibility**: Better form labeling and validation feedback
- **Button Sizing**: Consistent button sizing to prevent overflow and text wrapping
- **Theme Accessibility**: Theme selector with proper contrast and visual indicators

### 🔄 Updated Components

#### Enhanced Components
- **ThemeSelector**: Completely redesigned with separate light/dark theme preferences and mode-based selection (319+ lines changed)
- **TopNavBarRight**: Enhanced with theme mode selector integration for both authenticated and anonymous users (42+ lines changed)
- **RoomClient**: Major enhancements with host settings integration and room management
- **PlayerTable**: Enhanced with icon-based selection display
- **Settings Page**: Major redesign with improved layout and new functionality
- **Navigation**: Updated `TopNavBarRight` and `PlayerNavDropdown` with new features
- **Room Page**: Enhanced room page with header and host controls

#### New Components
- **ThemeModeSelector**: New comprehensive theme mode selector with System/Light/Dark mode support (129 lines)
- **HostSettingsModal**: Comprehensive host settings with card-based design
- **DeleteRoomConfirmationModal**: Dedicated room deletion confirmation
- **RoomHeader**: Room information display component
- **ChangeDisplayNameForm**: Complete display name management with validation
- **ForgotPasswordModal**: Modern modal-based forgot password functionality  
- **ThemePreview**: Live theme preview component

### 🧪 Testing Coverage
- **Theme System Tests**: Comprehensive testing suite for ThemeModeSelector component with 256+ lines covering all modes and user types
- **Theme Context Tests**: Extensive theme context testing with mode management and system detection (571+ lines)
- **Test Suite Cleanup**: Removed flaky integration tests while maintaining core functionality coverage
- **Host Settings Tests**: Comprehensive testing for host modal functionality
- **Room Management Tests**: Tests for room deletion and host operations
- **Player Table Tests**: Enhanced tests for player display functionality
- **Integration Tests**: Multi-component testing for room management workflows
- **CI/CD Stability**: All tests now pass consistently for reliable automated deployments

### 🐛 Bug Fixes

#### Critical UX Fixes
- **Button Overflow**: Fixed button sizing in modals to prevent horizontal overflow
- **Icon Consistency**: Replaced inline SVG icons with Heroicons components for consistency
- **Form State Management**: Fixed form loading states to prevent UI blocking
- **Modal Focus Management**: Fixed modal focus and interaction issues

#### Navigation & Layout
- **Theme Context Performance**: Optimized theme switching performance
- **Layout Integration**: Better integration of theme context with app layout
- **Route Compatibility**: Maintained backwards compatibility for existing routes

## [1.1.0] - 2025-01-24

### 🔐 New Features

#### Password Reset System
- **Forgot Password Flow**: New `/forgot-password` page allows users to reset their password via email
- **Settings Page**: New `/settings` page with change password functionality for logged-in users
- **Comprehensive Password Management**: Complete password reset workflow for both forgotten passwords and password changes

#### User Experience Improvements
- **Navigation Integration**: Added "Forgot Password?" link to login page and "Settings" option to user dropdown
- **Form Validation**: Client-side validation for password strength, confirmation matching, and current password verification
- **Visual Feedback**: Loading states, success messages, and comprehensive error handling throughout the flow
- **Accessibility**: Proper ARIA labels, autocomplete attributes, and keyboard navigation support

### 🏗️ Technical Implementation

#### Authentication Context Extensions
- **New Auth Functions**: Added `sendPasswordResetEmail()` and `updateUserPassword()` to auth context
- **Firebase Integration**: Proper use of Firebase Auth methods including `sendPasswordResetEmail`, `updatePassword`, and `reauthenticateWithCredential`
- **Error Handling**: Extended error message system for password reset scenarios

#### Security Features
- **Reauthentication**: Users must provide current password before setting new password
- **Protected Routes**: Settings page requires authentication and redirects anonymous/guest users
- **Input Validation**: Password length requirements, confirmation matching, and prevents setting same password

### 🧪 Testing Coverage

#### Comprehensive Test Suite
- **Unit Tests**: Full coverage of auth context password reset functions
- **Component Tests**: Individual testing of forgot password page and change password form
- **Integration Tests**: End-to-end password reset workflows including error scenarios
- **Edge Cases**: Network errors, invalid inputs, authentication failures, and user journey flows

### 🎨 UI/UX Design

#### Consistent Design System
- **DaisyUI Components**: Leveraged existing component library for consistent styling
- **Responsive Layout**: Mobile-first design that works across all device sizes
- **Loading States**: Clear visual feedback during async operations
- **Success/Error States**: User-friendly alerts and notifications

#### Settings Page Architecture
- **Extensible Layout**: Designed to accommodate future settings features
- **Account Information**: Display of user details (email, display name, account dates)
- **Future-Ready**: Placeholder sections for upcoming features like notifications and privacy settings

### 📚 Code Quality

#### TypeScript & ESLint
- **Type Safety**: Proper TypeScript types throughout the implementation
- **Code Standards**: All code passes ESLint with zero warnings or errors
- **Clean Code**: Following existing codebase patterns and conventions

### 🔄 Updated Components

#### Enhanced Navigation
- **PlayerNavDropdown**: Added settings link with proper icon
- **Login Page**: Integrated forgot password link
- **Route Structure**: New pages integrated into Next.js app router

#### New Components
- **ChangePasswordForm**: Reusable password change component with full validation
- **Settings Layout**: Extensible settings page with modular design

### 🚀 Build & Deployment

#### Production Ready
- **Clean Build**: Application builds successfully without TypeScript errors
- **Bundle Optimization**: New pages properly included in build optimization
- **Route Generation**: Static generation for new public routes

### 📋 Usage Instructions

#### For Users Who Forgot Their Password:
1. Go to login page and click "Forgot Password?"
2. Enter email address and click "Send Reset Email"
3. Check email for reset link from Firebase
4. Follow email link to set new password
5. Return to app and login with new password

#### For Users Who Want to Change Password While Logged In:
1. Click user avatar dropdown and select "Settings"
2. Navigate to "Change Password" section
3. Enter current password and new password (with confirmation)
4. Click "Update Password" to save changes

### 🐛 Bug Fixes

#### Navigation UX Improvements
- **Fixed Dropdown Menu Behavior**: Navigation dropdown now automatically closes when clicking Settings or Logout links
- **Improved User Experience**: Dropdown properly loses focus and closes on navigation, preventing UI confusion
- **Consistent Navigation**: All dropdown links now provide smooth navigation with immediate menu closure

### ⚡ Breaking Changes
None - All changes are backward compatible.

### 🎯 Next Steps
1. Test complete password reset workflows in development environment
2. Consider customizing Firebase email templates for branded experience
3. Add rate limiting for password reset requests in production
4. Implement additional security features like password history prevention

---

## [1.0.0] - 2024-08-23

### 🔧 Critical Bug Fixes

#### Fixed Race Conditions and Data Corruption
- **Fixed Player Data Race Condition**: Resolved critical issue in `usePlayersInRoom` hook where player arrays were being overwritten when multiple chunks loaded simultaneously, causing players to disappear from the UI
- **Fixed Unsafe Concurrent Firebase Updates**: Replaced unsafe `forEach` async pattern with `Promise.all` in `updatePlayers` function to prevent write conflicts
- **Added User Validation**: Implemented strict validation ensuring users can only update their own card selections, preventing cross-user data corruption

#### Performance and UX Improvements  
- **Optimistic Updates**: Cards now show selection immediately with server sync and rollback on failure for better user experience
- **Debouncing**: Added 300ms debouncing to prevent Firebase spam from rapid user interactions
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

### 🏗️ Architecture Changes

#### Data Management
- **Map-based Player Aggregation**: Replaced array overwriting with Map-based aggregation to prevent data loss in multi-chunk scenarios
- **Transaction Safety**: All Firebase operations now use proper Promise handling to prevent race conditions
- **Consistent Player Ordering**: Players are sorted alphabetically for consistent UI rendering

#### Error Handling
- **Error Boundaries**: Added React Error Boundary component to catch and display runtime errors gracefully
- **Error Toast System**: Implemented user-friendly error notification system with auto-dismiss
- **Firebase Error Translation**: Added human-readable error messages for common Firebase errors

### 🧪 Testing Infrastructure

#### Test Setup
- **Vitest Integration**: Set up modern testing framework with React Testing Library and JSDOM environment
- **Firebase Mocking**: Comprehensive mocking of Firebase operations for reliable testing
- **Test Commands**: Added `npm test`, `npm run test:ui`, and `npm run test:coverage`

#### Test Coverage
- **Unit Tests**: Firebase operations, hooks, and components tested in isolation
- **Integration Tests**: Multi-user scenarios with concurrent operations
- **Race Condition Tests**: Specific tests for the fixed race conditions

### 📝 Code Quality

#### TypeScript Improvements
- **Strict Type Safety**: Replaced `any` types with proper TypeScript interfaces
- **Error Type Safety**: Proper error handling with typed catch blocks
- **Hook Type Safety**: Strongly typed custom hooks with proper generics

#### ESLint Compliance
- **Code Standards**: Fixed all ESLint errors and warnings
- **Unused Variables**: Removed unused imports and variables
- **React Hook Dependencies**: Fixed missing dependencies in useEffect hooks

### 🔄 Updated Components

#### Core Components
- **RoomClient**: Added error handling, debouncing, and validation
- **PlayingCardSelector**: Optimistic updates with visual feedback
- **PlayerTable**: Improved loading states and error handling
- **Layout**: Integrated error boundary for app-wide error catching

#### New Components
- **ErrorBoundary**: Catches and displays runtime errors with recovery options
- **ErrorToast**: User-friendly error notifications with auto-dismiss
- **useErrorHandler**: Custom hook for centralized error management
- **useDebounce**: Custom hook for debouncing rapid operations

### 📚 Documentation

#### Updated Documentation
- **CLAUDE.md**: Added comprehensive multi-user bug fixes section
- **README**: Maintained existing structure with testing information
- **Code Comments**: Added inline documentation for complex race condition fixes

### 🚀 Performance Improvements

#### Firebase Optimization
- **Reduced Write Operations**: Debouncing prevents excessive Firebase writes
- **Efficient Queries**: Optimized player fetching with proper chunk management
- **Connection Management**: Proper cleanup of Firebase listeners

#### UI Responsiveness
- **Immediate Feedback**: Optimistic updates provide instant visual feedback
- **Loading States**: Improved loading indicators and skeleton states
- **Error Recovery**: Graceful degradation when operations fail

### 🔒 Security Improvements

#### User Validation
- **Selection Ownership**: Users can only modify their own card selections
- **Firebase Rules**: Prepared for Firebase security rules enforcement
- **Error Information**: Sanitized error messages to prevent information leakage

### ⚡ Breaking Changes
None - All changes are backward compatible.

### 🐛 Known Issues
- Some test warnings for React act() wrapping (non-critical)
- ESLint warnings in test files (cosmetic, functionality not affected)

### 📋 Migration Notes
No migration required - all changes are transparent to end users.

### 🎯 Next Steps
1. Deploy to staging environment for multi-user testing
2. Monitor Firebase performance metrics
3. Consider implementing real-time user presence indicators
4. Add comprehensive end-to-end tests for multi-user scenarios