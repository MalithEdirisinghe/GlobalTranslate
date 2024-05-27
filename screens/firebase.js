import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCnYEe6QK9wiCuzEiPdtelOPE2t45MR8-E",
    authDomain: "globaltranslate-dd451.firebaseapp.com",
    projectId: "globaltranslate-dd451",
    storageBucket: "globaltranslate-dd451.appspot.com",
    messagingSenderId: "1072634860917",
    appId: "1:1072634860917:web:386259f81928b3ff37ef3c"
};

// Initialize Firebase if it's not already initialized
const app = initializeApp(firebaseConfig);

// Get the Firebase Authentication instance
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firebase Storage
const storage = getStorage(app);

const db = getFirestore(app);

export { auth, db, storage };