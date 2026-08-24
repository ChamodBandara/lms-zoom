import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken as getFirebaseToken,
  onMessage,
  // MessagePayload,
} from 'firebase/messaging';

// Firebase configuration
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

// Initialize Messaging
const messaging = getMessaging(app);

const publicKey: string | undefined =
  'BBksD1xblgy02aJvV4eY199InnqVO5clqKAYeJRsJ1j0sZ09lSU6xILO6LV1vzhtaoKk023VC2oDTy30nGGKy_0';

if (!publicKey) {
  throw new Error(
    'VAPID key is missing. Please set REACT_APP_VAPID_KEY in your environment variables.',
  );
}

// Function to get the token
export const getToken = async (
  setTokenFound: (found: boolean) => void,
): Promise<string> => {
  let currentToken = '';

  try {
    currentToken = await getFirebaseToken(messaging, { vapidKey: publicKey });
    if (currentToken) {
      setTokenFound(true);
    } else {
      setTokenFound(false);
    }
  } catch (error) {
    console.error('An error occurred while retrieving token: ', error);
    setTokenFound(false);
  }

  return currentToken;
};

// Function to listen for incoming messages
export const onMessageListener = (callback: (payload: any) => void): void => {
  onMessage(messaging, (payload) => {
    callback(payload); // Execute callback on every message
  });
};
