# The Scrum Poker

A real-time collaborative story point estimation tool for agile development teams. Built with Next.js 15 and Firebase for seamless team planning sessions.

## What is Scrum Poker?

Scrum Poker (also known as Planning Poker) is an agile estimation technique where team members use cards to estimate the effort required for user stories or tasks. This application enables remote teams to conduct these estimation sessions in real-time, ensuring everyone's input is captured simultaneously before revealing estimates.

## Features

- **Real-time Collaboration**: Multiple team members can join estimation sessions simultaneously
- **Anonymous Authentication**: Start immediately as a guest, with option to upgrade to email account
- **Room-based Sessions**: Create or join estimation rooms with unique room codes
- **Card Selection Interface**: Choose from standard story point values (1, 2, 3, 5, 8, 13, 21, 34, 55, 89)
- **Synchronized Reveals**: All estimates are hidden until everyone has voted
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict configuration
- **Database**: Firebase Firestore for real-time data synchronization, plus the Realtime Database for player presence
- **Authentication**: Firebase Auth with anonymous and email/password support
- **Styling**: TailwindCSS 4 + DaisyUI 5 component library
- **Testing**: Vitest + React Testing Library
- **State Management**: React Context API with custom hooks

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- A Firebase project with Authentication, Firestore and the Realtime Database enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AaronStahley/scrum-poker-frontend.git
cd scrum-poker-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file from the example and fill in your Firebase configuration:
```bash
cp .env.example .env.local
```

   Your Firebase project needs Authentication (Anonymous and Email/Password providers), Firestore and the Realtime Database enabled. The Realtime Database powers the online/idle presence indicators.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:rules` - Run the Firestore security rules tests against the emulator
- `npm run emulators` - Start the Firebase Auth, Firestore and Realtime Database emulators
- `npm run test:e2e` - Run the Playwright end-to-end tests (start the emulators first)

### Architecture Overview

- **Authentication**: Firebase Auth with React Context for global state management
- **Real-time Data**: Custom hooks (`useCurrentRoom`, `usePlayersInRoom`) for Firebase listeners
- **Component Structure**: Feature-organized components in `src/app/components/`
- **Type Safety**: Comprehensive TypeScript interfaces in `src/types/`
- **Import Paths**: Clean imports using `@/*` path mapping to `./src/*`

### Testing

The project uses Vitest with React Testing Library for comprehensive testing:

- Unit tests for Firebase operations and custom hooks
- Integration tests for multi-user scenarios  
- Error boundary testing for robust error handling
- Coverage reports available via `npm run test:coverage`
- Firestore security rules tests (`rules-tests/`) run against the Firestore emulator
- Playwright end-to-end tests (`e2e/`) run against the Auth, Firestore and Realtime Database emulators

### Firestore Security Rules

Access rules live in `firestore.rules` and are tested by `npm run test:rules`. Deploy changes with:

```bash
npx firebase deploy --only firestore:rules --project <your-project-id>
```

## Related Repositories

- [scrum-poker-cleanup](https://github.com/AaronStahley/scrum-poker-cleanup): scheduled Cloud Function that deletes stale rooms, players and anonymous users.

## Changes & Updates

For detailed version history, bug fixes, and feature additions, see [CHANGELOG.md](./CHANGELOG.md).

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`
4. Run linting: `npm run lint`  
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a pull request

## License

Copyright 2025–2026 Aaron Stahley. Licensed under the [Apache License 2.0](./LICENSE).

The license covers the code only. It grants no rights to the "The Scrum Poker" name or logo.
