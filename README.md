# ToLetBro - Real Estate & Property Management

A modern, full-stack real-estate application built with React, Vite, Tailwind CSS, and Firebase.

## Features

- **Property Listings**: Search and filter properties in Hyderabad.
- **Owner Profiles**: View owner details and their other listings.
- **Privacy Controls**: "Do Not Disturb" and "Only Message" modes for owners.
- **QR Integration**: Generate and scan QR codes for property listings.
- **Responsive Design**: Optimized for both desktop and mobile.
- **SEO Ready**: Dynamic meta tags and sitemap generation.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Motion (Framer Motion)
- **Backend**: Express (for sitemap and health checks)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google Login & Phone OTP)
- **Storage**: Firebase Storage (Property images & Profile pictures)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase Project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/toletbro.git
   cd toletbro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Firebase and Google Maps credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Netlify (Recommended for Frontend)

This project is optimized for Netlify deployment.

1. **Connect to GitHub**: Push your code to a GitHub repository.
2. **Create a New Site**: In Netlify, select "Import from git" and choose your repository.
3. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables**: Add the variables from `.env.example` to the Netlify site settings (Site settings > Build & deploy > Environment).
5. **Redirects**: The `netlify.toml` file handles SPA routing automatically.

### GitHub Actions (Optional)

You can set up a GitHub Action to automatically deploy to Netlify or other platforms on every push to the `main` branch.

## Firebase Security Rules

Make sure to deploy the security rules for Firestore and Storage:

- **Firestore**: Use the contents of `firestore.rules`.
- **Storage**: Use the contents of `storage.rules`.

## License

MIT License
