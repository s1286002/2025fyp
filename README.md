# Student Gamification Tracking System

A Next.js 15 application for tracking student progress in educational games, providing teachers with insights and administrators with management capabilities.

## Features

- **Authentication**: Secure email/password authentication via Firebase
- **Teacher Dashboard**: Monitor student performance with visualizations and quick data entry
- **Admin Controls**: Manage users, students, and system settings
- **Performance Reports**: Generate comprehensive reports with interactive visualizations
- **Mobile Optimized**: Fully responsive design for on-the-go monitoring and data entry

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Charts**: Chart.js / Recharts
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/student-gamification-tracking.git
   cd student-gamification-tracking
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Firebase configuration:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   ├── admin/            # Admin pages
│   └── reports/          # Reporting pages
├── components/           # Reusable components
│   ├── ui/               # UI components (shadcn)
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   └── layouts/          # Layout components
├── lib/                  # Utility functions
│   ├── firebase/         # Firebase setup
│   ├── hooks/            # Custom hooks
│   └── utils/            # Helper functions
├── public/               # Static assets
└── styles/               # Global styles
```

## Development Guidelines

- Follow the mobile-first responsive design approach
- Use shadcn/ui components for consistent UI
- Implement proper form validation using Zod
- Optimize Firebase queries for performance
- Write descriptive commit messages

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Email/Password authentication
3. Create a Firestore database
4. Set up Firestore security rules
5. Generate a web app configuration and add to your environment variables

## Deployment

The application can be deployed to Vercel:

1. Push your code to GitHub
2. Import the repository to Vercel
3. Configure environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.
