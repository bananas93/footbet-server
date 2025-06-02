/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyCmhZ6jlItI9EiQ2uvMZFJ639iBlngN-sc',
  authDomain: 'footbet-2d3b7.firebaseapp.com',
  projectId: 'footbet-2d3b7',
  storageBucket: 'footbet-2d3b7.appspot.com',
  messagingSenderId: '112215657600',
  appId: '1:112215657600:web:b30c8b5ab58dd176cd2a65',
  measurementId: 'G-VKR0R9Y6ZS',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
