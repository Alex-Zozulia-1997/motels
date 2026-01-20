# Motel Checker

A Next.js application for browsing and checking motels/hotels with Firebase Firestore backend.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database (Start in production mode or test mode)

#### Get Firebase Credentials

**For Frontend (Client SDK):**
1. Go to Project Settings → General
2. Scroll to "Your apps" and click the web icon (</>)
3. Register your app and copy the config object

**For Backend (Admin SDK):**
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-service-account.json` in the project root
4. **⚠️ Important:** This file is gitignored - never commit it!

#### Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Firebase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   FIREBASE_PROJECT_ID=your_project_id
   ```

### 3. Database Schema

The application uses Firestore with the following structure:

- **places** (collection) - Main motel/hotel listings
  - **{place_id}/images** (subcollection) - Images for each place
  - **{place_id}/reviews** (subcollection) - Reviews for each place

See [docs/firestore-schema.md](docs/firestore-schema.md) for detailed schema documentation.

### 4. Import Data

If you have motel data in JSON format (e.g., from Google Maps scraper):

```bash
node scripts/import-data.js path/to/your/data.json
```

The script will:
- Import all places as documents in the `places` collection
- Create subcollections for images and reviews
- Handle batching automatically (max 400 operations per batch)
- Show progress during import

**Example:**
```bash
node scripts/import-data.js data/motels.json
```

### 5. Firestore Indexes (Optional but Recommended)

For better query performance, create these indexes in Firebase Console:

1. Go to Firestore Database → Indexes
2. Create composite indexes:
   - `places`: `country_code` (Ascending) + `total_score` (Descending)
   - `places`: `city` (Ascending) + `total_score` (Descending)

Or wait for Firebase to suggest indexes when you run queries.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
motel-checker/
├── app/                  # Next.js app directory
├── lib/
│   ├── firebase.js       # Firebase client config (frontend)
│   └── firebase-admin.js # Firebase Admin SDK (backend/scripts)
├── scripts/
│   └── import-data.js    # Data import script
├── docs/
│   └── firestore-schema.md # Database schema documentation
└── firebase-service-account.json # (gitignored) Admin credentials
```

## Security Notes

⚠️ **Never commit these files:**
- `.env.local` - Contains your API keys
- `firebase-service-account.json` - Admin credentials

Both are already in `.gitignore`.

## Firestore Security Rules

Before going to production, set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to places
    match /places/{placeId} {
      allow read: if true;
      allow write: if false; // Only server-side imports
      
      match /images/{imageId} {
        allow read: if true;
        allow write: if false;
      }
      
      match /reviews/{reviewId} {
        allow read: if true;
        allow write: if false;
      }
    }
  }
}
```

## Troubleshooting

### Import fails with "Permission denied"
- Check that your `firebase-service-account.json` is in the root directory
- Verify the service account has "Cloud Datastore User" or "Owner" role

### "Invalid API key" error
- Verify your `.env.local` has the correct values
- Restart the dev server after changing environment variables

### Queries are slow
- Create Firestore indexes (see step 5 above)
- Consider pagination for large result sets

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT
