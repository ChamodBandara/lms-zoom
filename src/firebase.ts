import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue } from 'firebase/database';

// Your Firebase config object (replace with your actual config from Firebase Console)
const firebaseConfig = {
  apiKey: 'AIzaSyAmy2v4dPSFOlwoIpAHTtbBFu9PcCJ5oRY',
  authDomain: 'lmschat-a1bf6.firebaseapp.com',
  databaseURL: 'https://lmschat-a1bf6-default-rtdb.firebaseio.com',
  projectId: 'lmschat-a1bf6',
  storageBucket: 'lmschat-a1bf6.firebasestorage.app',
  messagingSenderId: '951823598999',
  appId: '1:951823598999:web:587c02279e8dcf84f3f0d2',
  measurementId: 'G-YP7SBJZWSM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
const database = getDatabase(app);

export { database, ref, set, push, onValue };
