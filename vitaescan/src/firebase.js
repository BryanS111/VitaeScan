import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // <--- ESTA LÍNEA ES CRUCIAL

// Tu configuración real de VitaeScan
const firebaseConfig = {
  apiKey: "AIzaSyAfdAl2Wh6AkKzOSCmnUSO8HiD0YFRP-t8",
  authDomain: "vitaescan-8f86d.firebaseapp.com",
  projectId: "vitaescan-8f86d",
  storageBucket: "vitaescan-8f86d.firebasestorage.app",
  messagingSenderId: "318098440978",
  appId: "1:318098440978:web:a67876b05479abcc0369cb",
  measurementId: "G-T2TB754GVW"
};

// 1. Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 2. Inicializar Analytics (para que trackee las visitas)
export const analytics = getAnalytics(app);

// 3. Inicializar y Exportar Auth (para que funcione el Login)
export const auth = getAuth(app);