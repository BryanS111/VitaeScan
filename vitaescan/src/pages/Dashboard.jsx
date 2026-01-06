import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeCandidates } from '../services/aiService'; // Asegúrate de que este archivo exista
import { 
  LogOut, 
  Upload, 
  FileText, 
  Sparkles, 
  Briefcase, 
  AlertCircle,
  Loader2,
  Trash2,
  Info,
  CheckCircle2,
  Zap // Agregamos el icono de rayo
} from 'lucide-react';

import Orb from '../components/Orb/Orb';
import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [jobDescription, setJobDescription] = useState('');
  const [files, setFiles] = useState([]); 
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para controlar la visibilidad del tooltip de info
  const [showInfo, setShowInfo] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // --- LOGICA DE ARCHIVOS ---
  const handleFilesAdded = (newFiles) => {
    setError('');
    const validFiles = [];
    const invalidFiles = [];
    Array.from(newFiles).forEach(file => {
      if (file.type === 'application/pdf') {
        if (!files.some(f => f.name === file.name)) {
          validFiles.push(file);
        }
      } else {
        invalidFiles.push(file.name);
      }
    });
    if (invalidFiles.length > 0) setError(`Algunos archivos no eran PDF: ${invalidFiles.length}`);
    if (validFiles.length > 0) setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) handleFilesAdded(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFilesAdded(e.dataTransfer.files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  
  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const clearAllFiles = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // --- LÓGICA DE ANÁLISIS CON IA ---
  const handleAnalyze = async () => {
    // 1. Validaciones previas
    if (!jobDescription.trim()) {
        setError("Por favor, ingresa una descripción del puesto.");
        return;
    }
    if (files.length === 0) {
        setError("Por favor, sube al menos un CV.");
        return;
    }

    setIsAnalyzing(true);
    setError(''); // Limpiar errores previos

    try {
      // 2. Llamada al servicio de IA
      const analysisResults = await analyzeCandidates(jobDescription, files);
      
      // 3. Navegación a resultados con los datos obtenidos
      navigate('/results', { 
        state: { 
          results: analysisResults,
          jobTitle: jobDescription.substring(0, 30) + (jobDescription.length > 30 ? '...' : '') 
        } 
      });

    } catch (err) {
      console.error("Error en análisis:", err);
      // Mensaje amigable para el usuario
      setError("Hubo un error al conectar con la IA. Verifica tu API Key en el archivo .env o intenta más tarde.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden flex flex-col">
      
      {/* FONDO ORB */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <Orb hoverIntensity={0.15} rotateOnHover={false} hue={220} forceHoverState={true} backgroundColor="#000000"/>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-5 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            VitaeScan
          </span>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full border border-zinc-700/50">
            Dashboard
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={handleLogout} variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2 text-sm">
            <LogOut className="w-4 h-4" /> <span>Salir</span>
          </Button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 flex-grow flex flex-col items-center p-6 pb-32">
        
        {/* TEXTO INTRODUCTORIO */}
        <div className="w-full max-w-4xl text-center mb-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Comienza tu Análisis Inteligente</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Para obtener los mejores resultados, pega la descripción completa de tu vacante a la izquierda y carga todos los CVs que quieras analizar a la derecha. Nuestra IA se encargará del resto.
          </p>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          
          {/* IZQUIERDA: JOB DESCRIPTION */}
          <div className="flex flex-col gap-3 relative z-20"> 
            <div className="flex items-center gap-2 text-purple-400 pl-1">
              <Briefcase className="w-4 h-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Descripción de la Vacante</h3>
            </div>
            
            <div className="relative h-[500px] group">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Ej: Buscamos un Desarrollador Frontend con 3 años de experiencia en React..."
                className="relative w-full h-full bg-zinc-900/60 backdrop-blur-md rounded-xl p-6 text-sm md:text-base text-zinc-200 resize-none border border-zinc-800/60 focus:outline-none  transition-all placeholder:text-zinc-600 custom-scrollbar shadow-sm hover:border-zinc-700"
              />
              
              {/* --- BOTÓN DE INFORMACIÓN CON HOVER --- */}
              <div 
                className="absolute top-4 right-4"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
              >
                <div className="text-zinc-500 hover:text-purple-400 transition-colors cursor-help p-1">
                  <Info className="w-5 h-5" />
                </div>

                {/* --- TOOLTIP MODAL FLOTANTE --- */}
                {showInfo && (
                  <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <h4 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Tips para una Descripción Perfecta
                    </h4>
                    <p className="text-zinc-400 text-xs mb-3 leading-relaxed">
                      Para que la IA encuentre al mejor candidato, asegúrate de incluir:
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Nombre exacto del puesto",
                        "Años de experiencia requerida",
                        "Habilidades técnicas (Hard Skills)",
                        "Habilidades blandas (Soft Skills)",
                        "Carreras o estudios afines",
                        "Certificaciones obligatorias"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500/80 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-zinc-500 italic">
                      Cuanto más detalle, mejor será el ranking.
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* DERECHA: MULTI UPLOAD */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-blue-400 pl-1 pr-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Base de Candidatos</h3>
              </div>
              {files.length > 0 && (
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  {files.length} {files.length === 1 ? 'ARCHIVO' : 'ARCHIVOS'}
                </span>
              )}
            </div>

            <div className="relative h-[500px] flex flex-col">
              <div className="relative flex-grow bg-zinc-900/60 backdrop-blur-md rounded-xl overflow-hidden flex flex-col border border-zinc-800/60 shadow-sm hover:border-zinc-700 transition-all">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className={`
                    transition-all duration-300 cursor-pointer flex flex-col items-center justify-center border-b border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-800/50
                    ${files.length === 0 ? 'h-full' : 'h-32 shrink-0'}
                    ${isDragging ? 'bg-blue-500/5 border-blue-500/30' : ''}
                  `}
                >
                  <div className="p-4 text-center">
                    <Upload className={`w-10 h-10 mx-auto mb-4 transition-colors ${isDragging ? 'text-blue-400 animate-bounce' : 'text-zinc-500'}`} />
                    <p className="text-base font-medium text-zinc-300">
                      {isDragging ? '¡Suelta los archivos aquí!' : 'Haz clic o arrastra múltiples CVs'}
                    </p>
                     <p className="text-xs text-zinc-500 mt-2">Soporta carga masiva de archivos PDF</p>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
                </div>

                {files.length > 0 && (
                  <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar bg-black/10">
                    <div className="flex justify-end mb-1 sticky top-0 bg-black/10 py-1 backdrop-blur-sm z-10">
                      <button onClick={clearAllFiles} className="text-[10px] font-medium text-red-400 hover:text-red-300 transition-colors uppercase tracking-wide flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Limpiar lista
                      </button>
                    </div>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 bg-zinc-800/30 rounded-lg border border-zinc-700/20 hover:border-zinc-600/50 transition-colors group/item">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-red-500/5 to-orange-500/5 flex items-center justify-center flex-shrink-0 border border-red-500/10">
                            <FileText className="w-4 h-4 text-red-400/70" />
                          </div>
                          <span className="text-sm font-medium text-zinc-300 truncate pr-4">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(index)} className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-60 group-hover/item:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 text-red-200 text-xs p-3 rounded-lg border border-red-500/30 flex items-center gap-2 backdrop-blur-md z-10 shadow-lg animate-in slide-in-from-bottom-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- BOTÓN DE ACCIÓN FLOTANTE --- */}
        <div className="fixed bottom-10 left-0 right-0 flex justify-center z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || files.length === 0 || !jobDescription}
            className={`
              pointer-events-auto shadow-[0_4px_20px_rgba(0,0,0,0.2)]
              relative overflow-hidden px-10 py-6 text-base font-bold rounded-full transition-all duration-300 border border-white/5
              ${(files.length === 0 || !jobDescription) 
                ? 'bg-zinc-900/80 text-zinc-600 backdrop-blur-md cursor-not-allowed' 
                : 'bg-white text-black hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(120,119,198,0.3)] active:scale-[0.98]'}
            `}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analizando {files.length} candidatos...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className={`w-5 h-5 ${(files.length === 0 || !jobDescription) ? '' : 'text-purple-600 fill-purple-600'}`} />
                <span>Analizar {files.length > 0 ? files.length : ''} Candidatos</span>
              </div>
            )}
            {!isAnalyzing && files.length > 0 && jobDescription && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_1.5s_infinite]"></div>
            )}
          </Button>
        </div>
      </main>
      
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(200%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #52525b; }
      `}</style>
    </div>
  );
}