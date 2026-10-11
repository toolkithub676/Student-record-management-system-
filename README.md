# Student Record Management System

A responsive GitHub Pages web app using Firebase Authentication and Cloud Firestore.

## Files
- `index.html` — page structure and student form
- `style.css` — responsive styling
- `app.js` — Firebase config, sign-in, CRUD, and search
- `firestore.rules` — sample Firestore security rules

## Firebase setup
1. In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
2. Create a Firestore database.
3. The Firebase Web App config has already been added to `app.js`.
4. In Firestore Database → Rules, publish the rules from `firestore.rules`.
5. In Authentication → Settings → Authorized domains, ensure `toolkithub676.github.io` is listed.
6. In your GitHub repository, replace the existing contents of these four files with the files in this folder and commit the changes.

## Important security note
The included demo rules allow any signed-in account to read and modify all student records. Do not store real student data until you restrict account creation and implement administrator-only access. Never put a Firebase service-account private key in frontend code.

## Deploy
GitHub Pages serves the files from the repository. Keep the filenames exactly as shown and ensure GitHub Pages is configured for the branch/folder you are editing.
