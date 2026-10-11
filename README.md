# Student Record Management System

A responsive web app to **add, view, search, update, and delete student records** using Firebase Authentication and Cloud Firestore.

## Features
- Email/password administrator sign-in and account creation
- Student name, roll number, course/class, academic year, contact, marks/CGPA, date of birth, and address
- Add new records and edit or delete existing records
- Search by name, roll number, course, email, or phone
- Responsive layout for desktop and mobile
- Firestore security rules requiring a signed-in user

## Setup

1. Open [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Build → Authentication → Sign-in method**, enable **Email/Password**.
3. In **Build → Firestore Database**, create a database.
4. In Project settings → General → Your apps, register a **Web app** and copy its Firebase config.
5. Open `app.js` and replace the placeholder values in `firebaseConfig` with your project's real values.
6. In Firestore → Rules, paste the contents of `firestore.rules` and publish the rules.
7. Serve the folder using a local web server (recommended), for example VS Code Live Server, or deploy it using Firebase Hosting. ES modules may not work when opening `index.html` directly as a `file://` URL.
8. Open the app, choose **Create account** for your administrator account, then sign in and add records.

## Firestore data structure

Collection: `students`

Each document contains fields such as:
- `fullName`, `rollNo`, `email`, `phone`
- `course`, `academicYear`, `marks`
- `dob`, `address`
- `createdAt`, `updatedAt`

Firestore creates the `students` collection automatically when the first student is saved.

## Important security note

The included rules allow any authenticated account to read and change all student records. This is acceptable only for a small demo/class project where account creation is controlled. Before using real student data, disable public account creation and implement administrator-only access (for example, Firebase custom claims or a trusted backend). Never publish your Firebase service-account private key in frontend code. Firebase web config is not a service-account secret, but access must be protected by Authentication and Firestore rules.

## Troubleshooting
- **Setup required**: replace all `YOUR_...` values in `app.js`.
- **Permission denied**: ensure you are signed in and published `firestore.rules`.
- **Firebase auth error**: check that Email/Password is enabled and the domain is authorized in Firebase Authentication settings.
- **Page is blank / imports fail**: use a local server or Firebase Hosting rather than opening the HTML file directly.
