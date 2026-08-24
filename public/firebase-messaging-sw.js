// Scripts for firebase and firebase messaging
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
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

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  // Remove HTML tags from title and body
  const notificationTitle = payload.notification.title.replace(/<[^>]+>/g, '');
  // const notificationOptions = {
  //   body: payload.notification.body.replace(/<[^>]+>/g, ''),
  //   icon: '/logo192.png',
  // };

  // eslint-disable-next-line no-restricted-globals
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
