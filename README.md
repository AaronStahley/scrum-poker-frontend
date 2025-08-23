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
- **Database**: Firebase Firestore for real-time data synchronization
- **Authentication**: Firebase Auth with anonymous and email/password support
- **Styling**: TailwindCSS 4 + DaisyUI 5 component library
- **Testing**: Vitest + React Testing Library
- **State Management**: React Context API with custom hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scrum-poker-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

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

This project is private and proprietary.
