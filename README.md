# React Firebase Chat

A real-time chat application built with React and Firebase. It supports authentication, direct messaging, chat list management, emoji picker, and user blocking.

## Features

- Email/password authentication (register + login)
- Real-time 1:1 chat with Firestore
- Chat list with last message + updated time
- Add users to start new chats
- Emoji picker in messages
- User blocking and unblock flow
- Profile avatar upload (Cloudinary)

## Tech Stack

- React + Vite
- Firebase (Auth, Firestore, Storage)
- Zustand (state management)
- React Router
- React Toastify
- SCSS Modules

## Project Structure

```
src/
	components/
		Auth/
		chat/
		details/
		list/
	lib/
		firebase.js
		useChatState.js
		useUserState.js
```

## Getting Started

### 1) Install dependencies

```
npm install
```

### 2) Configure environment

Create a `.env` file in the project root with your Firebase config:

```
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

Update Firebase initialization in `src/lib/firebase.js` if needed.

### 3) Run the app

```
npm run dev
```

## Firestore Rules (Development)

Use strict rules in production. For local testing, you can start with:

```
rules_version = '2';

service cloud.firestore {
	match /databases/{database}/documents {
		match /users/{userId} {
			allow read: if request.auth != null;
			allow create, update, delete: if request.auth.uid == userId;
		}

		match /userChats/{userId} {
			allow read: if request.auth != null && request.auth.uid == userId;
			allow create, update: if request.auth != null && request.auth.uid == userId;
		}

		match /chats/{chatId} {
			allow read, write: if request.auth != null;
		}
	}
}
```

## Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run preview` - preview production build

## Notes

- `serverTimestamp()` cannot be used inside array fields in Firestore. This project stores `updatedAt` as `Date.now()` in chat list arrays.

## License

MIT
