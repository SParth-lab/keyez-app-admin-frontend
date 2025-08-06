// Firebase configuration for real-time messaging
import React from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://demo-project-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
let app = null;
let database = null;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase initialization failed:', error.message);
  console.warn('Real-time messaging will be disabled');
}

// Real-time messaging hook
export const useRealTimeMessages = (userId1, userId2) => {
  if (!database || !userId1 || !userId2) {
    return { messages: [], loading: false, error: 'Firebase not configured or missing user IDs' };
  }

  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    try {
      // Create consistent chat path (same as backend)
      const chatPath = [userId1, userId2].sort().join('_');
      const messagesRef = ref(database, `chats/${chatPath}`);
      
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convert Firebase object to array and sort by timestamp
          const messageArray = Object.values(data).sort((a, b) => 
            a.timestamp - b.timestamp
          );
          setMessages(messageArray);
        } else {
          setMessages([]);
        }
        setLoading(false);
        setError(null);
      }, (error) => {
        console.error('Firebase listener error:', error);
        setError(error.message);
        setLoading(false);
      });

      return () => off(messagesRef);
    } catch (err) {
      console.error('Firebase setup error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [userId1, userId2]);

  return { messages, loading, error };
};

// Function to generate chat path (for external use)
export const getChatPath = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

export { database };
export default database;