import { createApp } from 'vue'
import App from './App.vue'

// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.VUE_FRBS_API_KEY,
  authDomain: process.env.VUE_FRBS_PROJECTID + ".firebaseapp.com",
  projectId: process.env.VUE_FRBS_PROJECTID,
  storageBucket: process.env.VUE_FRBS_PROJECTID + ".appspot.com",
  messagingSenderId: "744312773738",
  appId: "1:744312773738:web:8865b1328221739939fe13",
  measurementId: "G-YMB3CN59H1"
};

const fbApp = initializeApp(firebaseConfig);
getAnalytics(fbApp);

createApp(App).mount('#app')
