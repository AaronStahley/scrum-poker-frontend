# Changelog

## [1.6.0] - 2026-07-15

### 🆕 New Features

#### Player Presence Indicator
- **Online/Offline Dot**: Every player row now shows a small status dot — green when that player is currently connected, gray when they're not. Visible to everyone in the room, not just the host
- **Hover Tooltip**: Hovering the dot shows "Online now" or "Last active Xm/Xh/Xd ago", so anyone can see how recently a player was around without needing a persistent table column

### ⚡ Breaking Changes
None — all changes are additive.

---

## [1.5.3] - 2026-07-12

### 🐛 Bug Fixes

- Fixed a bug where joining a room at the exact moment it was deleted could leave your account in a broken state, still pointing at a room you were never actually added to
- Errors that happened while automatically joining a room via a direct link were previously silent — they're now shown to you
- Fixed an issue where opening a shared room link could briefly flash an incorrect "You have been removed from the room" message before correctly joining
- Fixed a rare crash that could occur while the player list was still loading

### ✨ Improvements

- The loading screen shown while joining a room now stays visible for a minimum amount of time, so it doesn't flicker on and off too quickly to register

### ⚡ Breaking Changes
None.

---

## [1.5.2] - 2026-06-23

### 📊 Analytics

- Added Firebase and Vercel analytics and Core Web Vitals monitoring to help us understand usage and site performance over time

### ⚡ Breaking Changes
None — all changes are additive and transparent to users.

---

## [1.5.1] - 2026-06-17

### ✨ Improvements

- Rooms now track when they were last active (created, visited, or updated), laying the groundwork for automatically cleaning up old, inactive rooms in the future

### ⚡ Breaking Changes
None.

---

## [1.5.0] - 2026-06-13

### 🆕 New Features

#### Spectator Mode
- **Join as Spectator**: When joining a room, users are now prompted to choose whether they want to join as a **Player** (votes on estimates) or a **Spectator** (observes without voting)
- **Spectators Excluded from Stats**: Vote statistics (Recommended, Range, Consensus) only count votes from active players
- **Role Toggle**: Players can switch themselves between Player and Spectator at any time. Hosts can also toggle any other player's role
- **Split Player Table**: The player table now has two sections — **Players** at the top and a collapsible **Spectators** section at the bottom, with a count badge

### 🐛 Bug Fixes
- Spectators no longer briefly see the voting card selector when the page loads

### ⚡ Breaking Changes
None — all changes are additive. Existing rooms without spectators are unaffected.

---

## [1.4.0] - 2026-06-12

### 🆕 New Features

#### Vote Statistics
- **Vote Summary Bar**: After votes are revealed, a summary bar appears above the player table showing key statistics at a glance
- **Recommended Story Point**: Displays the nearest valid story point to the average of all numeric votes
- **Vote Range**: Shows the lowest and highest numeric votes cast
- **Consensus Badge**: Color-coded badge indicating team agreement — Unanimous, Close, or Split
- **Participation Count**: Shows how many players cast numeric votes out of the total in the room
- **Hover Tooltips**: Each stat has a tooltip explaining what it means and how it's calculated

### ⚡ Breaking Changes
None — all changes are additive.

---

## [1.3.0] - 2025-09-04

### 🆕 New Features

#### Theme System
- New comprehensive theme selector with 30+ light and dark themes, live preview, and popular-theme highlights
- Choose separate preferred light and dark themes, with automatic switching based on System/Light/Dark mode
- Automatic detection of your system's dark/light preference in System mode
- Theme selection is now available for guests too, not just logged-in accounts
- Theme preferences sync across devices for logged-in users, and persist locally for guests

#### Room & Host Management
- New host settings modal with a cleaner, card-based layout
- Dedicated confirmation step before deleting a room
- Improved visual hierarchy throughout host controls

#### Display Name Management
- Update your display name at any time from Settings, with real-time character validation (3–50 characters)

#### Other Improvements
- Forgot password now opens as a modal instead of navigating to a separate page
- Improved autofill support and accessibility across modals
- Better loading skeletons throughout navigation and profile areas

### 🐛 Bug Fixes
- Fixed button sizing issues in modals that caused overflow
- Fixed modal focus and keyboard navigation issues
- Fixed a performance issue when switching themes

### ⚡ Breaking Changes
None.

---

## [1.1.0] - 2025-01-24

### 🆕 New Features

#### Password Reset & Account Management
- New "Forgot Password?" flow — reset your password via email from the login page
- New Settings page where logged-in users can change their password
- Client-side validation for password strength and confirmation matching

### 🐛 Bug Fixes
- Fixed the navigation dropdown not closing after clicking Settings or Logout

### ⚡ Breaking Changes
None — all changes are backward compatible.

---

## [1.0.0] - 2024-08-23

### 🐛 Bug Fixes

- Fixed a bug where the player list could lose players or show them disappearing when multiple people joined a room at the same time
- Fixed a race condition that could cause conflicting updates to overwrite each other during concurrent play
- Users can now only update their own card selection, preventing one player's actions from corrupting another's

### ✨ Improvements

- Card selections now show immediately, with automatic rollback if the update fails
- Rapid interactions are now debounced to avoid overwhelming the backend
- Added friendly error messages so unexpected errors no longer crash the whole app

### ⚡ Breaking Changes
None — all changes are backward compatible.
