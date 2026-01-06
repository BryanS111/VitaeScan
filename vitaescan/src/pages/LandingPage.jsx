import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Orb from '../components/Orb/Orb';
import { 
  Lock, LogIn, UserPlus, Zap, Brain, ShieldCheck, Upload, Search, Trophy, 
  Mail, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Importamos nuestros hooks personalizados
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  // --- ESTADOS DE UI Y AUTH ---
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState('menu'); // 'menu' | 'login' | 'register'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // --- HOOKS (Eliminado useLanguage) ---
  const { login, signup, user, logout } = useAuth();
  const navigate = useNavigate();

  // --- LÓGICA DE LOGIN / REGISTRO MEJORADA ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authView === 'login') {
        await login(email, password);
      } else {
        // --- VALIDACIÓN DE 6 CARACTERES ---
        if (password.length < 6) {
          throw new Error('password-too-short');
        }
        await signup(email, password);
      }
      
      // ÉXITO:
      setShowAuthModal(false);     
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowSuccessToast(true);   
      setTimeout(() => setShowSuccessToast(false), 5000);

    } catch (err) {
      console.error(err);
      // --- MENSAJES DE ERROR AMIGABLES ---
      if (err.message === 'password-too-short' || err.code === 'auth/weak-password') {
        setError('La contraseña es muy corta. Debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Intenta iniciar sesión.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error. Verifica tus datos.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DEL BOTÓN HERO ---
  const handleHeroClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  // --- LÓGICA DEL NAVBAR (LOGIN/LOGOUT) ---
  const handleNavAuthClick = () => {
    if (user) {
      logout();
    } else {
      setShowAuthModal(true);
    }
  };

  // Reseteo del modal al cerrar
  const handleOpenChange = (open) => {
    setShowAuthModal(open);
    if (!open) {
      setTimeout(() => {
        setAuthView('menu');
        setError('');
        setEmail('');
        setPassword('');
        setShowPassword(false); 
      }, 300);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
      
      <style>{`
        @keyframes attention-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 255, 255, 0.5); }
        }
        .btn-attention {
          animation: attention-pulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* --- NOTIFICACIÓN LATERAL --- */}
      <div className={`fixed top-24 right-5 z-50 transition-all duration-700 transform ${showSuccessToast ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-zinc-900 border border-green-500/50 text-white px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.2)] flex items-center gap-4 backdrop-blur-md max-w-sm">
          <div className="bg-green-500/20 p-2 rounded-full min-w-[40px] flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-green-400">¡Sesión Iniciada!</h4>
            <p className="text-xs text-gray-300 mt-1">Te hemos llevado al inicio. Presiona el botón para ir al Dashboard.</p>
          </div>
        </div>
      </div>

      {/* --- FONDO ORB --- */}
      <div className="fixed inset-0 z-0">
        <Orb hoverIntensity={1.5} rotateOnHover={true} hue={0} forceHoverState={false} backgroundColor="#000000"/>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-20 flex justify-between items-center p-6 container mx-auto pointer-events-none">
        <div className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 pointer-events-auto">
          VitaeScan
        </div>
        <div className="flex gap-4 items-center pointer-events-auto">
          <button onClick={handleNavAuthClick} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition backdrop-blur-md">
            {user ? 'Cerrar Sesión' : 'Iniciar Sesión'}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center pointer-events-none">
        <div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Reclutamiento Inteligente con <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Inteligencia Artificial
            </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-8 leading-relaxed">
              Optimiza tu proceso de selección. Analiza cientos de CVs en segundos y encuentra al candidato ideal con la potencia de nuestra IA avanzada.
            </p>
        </div>
        <button 
          onClick={handleHeroClick}
          className={`pointer-events-auto px-8 py-4 text-lg font-semibold bg-white text-black rounded-full transition-all duration-300 cursor-pointer flex items-center gap-2 
            ${user ? 'btn-attention' : 'hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'}`}
        >
          {user ? (<>Ir al Dashboard <ArrowLeft className="w-4 h-4 rotate-180" /></>) : ("Comenzar Ahora")}
        </button>
      </main>

      {/* --- SECCIONES INFERIORES --- */}
      <section className="relative z-10 py-20 bg-black/80 backdrop-blur-md border-t border-white/5">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Potencia tu proceso con <span className="text-purple-400">VitaeScan</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-purple-500/50 transition-all hover:bg-zinc-900/80">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Análisis Instantáneo</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Procesa múltiples documentos simultáneamente y obtén resultados en tiempo real.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-blue-500/50 transition-all hover:bg-zinc-900/80">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">IA Contextual</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Nuestros algoritmos entienden el contexto profesional más allá de las palabras clave simples.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-pink-500/50 transition-all hover:bg-zinc-900/80">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Datos Seguros</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Tu información y la de tus candidatos está protegida con los más altos estándares de seguridad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CÓMO FUNCIONA --- */}
      <section className="relative z-10 py-24 bg-black/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
               Flujo de trabajo <span className="text-blue-400">simplificado</span>
            </h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-12 relative">
                <div className="hidden md:block absolute top-12 left-20 right-20 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent -z-10"></div>
                <div className="flex flex-col items-center max-w-xs">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full border-2 border-zinc-800 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <Upload className="w-10 h-10 text-gray-300" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">1. Sube los CVs</h4>
                    <p className="text-sm text-gray-500">Carga los archivos PDF de tus candidatos.</p>
                </div>
                <div className="flex flex-col items-center max-w-xs">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full border-2 border-purple-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        <Search className="w-10 h-10 text-purple-400 animate-pulse" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">2. Análisis IA</h4>
                    <p className="text-sm text-gray-500">Nuestra IA procesa y evalúa cada perfil.</p>
                </div>
                <div className="flex flex-col items-center max-w-xs">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full border-2 border-zinc-800 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">3. Ranking</h4>
                    <p className="text-sm text-gray-500">Obtén los mejores candidatos al instante.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      {!user && (
        <section className="relative z-10 py-20 border-t border-white/10 bg-gradient-to-b from-black/90 to-purple-900/20 backdrop-blur-lg">
          <div className="container mx-auto px-6 text-center">
              <h2 className="text-4xl font-bold mb-6">¿Listo para transformar tu contratación?</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">Únete al futuro del reclutamiento y ahorra horas de trabajo manual.</p>
              <button onClick={() => setShowAuthModal(true)} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">
                Crear Cuenta Gratis
              </button>
          </div>
        </section>
      )}

      {/* --- FOOTER --- */}
      <footer className="relative z-10 w-full p-8 bg-black border-t border-zinc-900 text-center text-gray-600 text-xs flex flex-col md:flex-row justify-between items-center container mx-auto">
        <span>© 2024 VitaeScan. Todos los derechos reservados.</span>
        <a href="https://wa.me/50370404773" target="_blank" rel="noopener noreferrer" className="mt-2 md:mt-0 flex items-center gap-2 hover:text-green-400 transition">
          <span>Soporte</span>
        </a>
      </footer>

      {/* --- MODAL (DIALOG) CON MEJORAS --- */}
      <Dialog open={showAuthModal} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
          
          <DialogHeader>
            <div className="mx-auto bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
               <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <DialogTitle className="text-center text-xl">
              {authView === 'menu' && 'Bienvenido a VitaeScan'}
              {authView === 'login' && 'Bienvenido de nuevo'}
              {authView === 'register' && 'Crea tu cuenta'}
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400 pt-2">
              {authView === 'menu' && 'Accede para comenzar a analizar CVs con IA.'}
              {authView === 'login' && 'Ingresa tus credenciales para continuar.'}
              {authView === 'register' && 'Regístrate para comenzar a optimizar.'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            
            {/* VISTA 1: MENU */}
            {authView === 'menu' && (
              <div className="flex flex-col gap-3">
                <Button onClick={() => setAuthView('login')} className="w-full bg-white text-black hover:bg-gray-200 gap-2 h-11 text-md font-semibold">
                  <LogIn className="w-4 h-4" /> Iniciar Sesión
                </Button>
                <Button onClick={() => setAuthView('register')} variant="outline" className="w-full border-zinc-700 hover:bg-zinc-900 hover:text-white text-zinc-300 gap-2 h-11">
                  <UserPlus className="w-4 h-4" /> Registrarse
                </Button>
              </div>
            )}

            {/* VISTA 2 y 3: FORMULARIOS */}
            {(authView === 'login' || authView === 'register') && (
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                
                {/* EMAIL */}
                <div className="space-y-1 relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input 
                      type="email" 
                      required 
                      placeholder="Email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full h-10 pl-10 pr-3 rounded-md border border-zinc-800 bg-zinc-900 text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" 
                    />
                </div>

                {/* PASSWORD CON OJITO Y VALIDACIÓN */}
                <div className="space-y-1 relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="Password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full h-10 pl-10 pr-10 rounded-md border border-zinc-800 bg-zinc-900 text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" 
                    />
                    {/* BOTÓN MOSTRAR/OCULTAR */}
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {/* MENSAJE DE ERROR MEJORADO */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2 flex items-center gap-2 text-red-200 text-xs animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full bg-white text-black hover:bg-gray-200 mt-2 font-bold">
                  {isLoading ? <Loader2 className="animate-spin" /> : (authView === 'login' ? 'Entrar' : 'Registrarse')}
                </Button>

                <button type="button" onClick={() => { setAuthView('menu'); setError(''); }} className="flex justify-center gap-2 text-xs text-zinc-500 hover:text-white mt-2">
                  <ArrowLeft className="w-3 h-3" /> Volver
                </button>
              </form>
            )}

          </div>

          {authView === 'menu' && (
            <div className="mt-2 text-center">
              <button onClick={() => setShowAuthModal(false)} className="text-xs text-zinc-500 hover:text-white transition underline">
                Cancelar
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}