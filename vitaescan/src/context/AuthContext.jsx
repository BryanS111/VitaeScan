import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase'; // <--- IMPORTANTE: Revisa que esta ruta sea correcta

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función de Registro
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Función de Login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Función de Logout
  function logout() {
    return signOut(auth);
  }

  // Efecto para detectar cambios de sesión (Login persistente)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}