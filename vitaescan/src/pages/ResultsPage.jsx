import { useLocation, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, CheckCircle, XCircle, Star } from 'lucide-react';
import Orb from '../components/Orb/Orb'; // Asegúrate de que la ruta sea correcta
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Recuperamos datos con fallback para evitar errores si llega vacío
  const { results = [], jobTitle = 'Análisis de Candidatos' } = location.state || {};

  // --- FUNCIÓN GENERADORA DE PDF ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 14;
    
    let finalY = 20; // Cursor vertical

    // 1. TÍTULO
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    const titleLines = doc.splitTextToSize(`Reporte: ${jobTitle}`, pageWidth - (marginX * 2));
    doc.text(titleLines, marginX, finalY);
    finalY += (titleLines.length * 8); 
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado por VitaeScan AI - ${new Date().toLocaleDateString()}`, marginX, finalY);
    finalY += 10;

    // 2. TABLA RESUMEN PRINCIPAL
    const summaryData = results.map(r => [r.filename, `${r.score}%`, r.summary]);
    
    autoTable(doc, {
      startY: finalY,
      head: [['Candidato', 'Match', 'Resumen Ejecutivo']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 'auto' }
      },
      didDrawPage: (data) => {
        finalY = data.cursor.y + 15;
      }
    });

    // 3. DETALLE DE CANDIDATOS
    results.forEach((candidate, index) => {
        // Verificar salto de página
        if (finalY > 230) {
            doc.addPage();
            finalY = 20;
        }

        // Línea separadora
        if (index > 0 || finalY > 50) {
            doc.setDrawColor(220);
            doc.line(marginX, finalY - 5, pageWidth - marginX, finalY - 5);
        }

        // --- ENCABEZADO DEL CANDIDATO ---
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); 
        doc.setFont(undefined, 'bold');
        doc.text(`${candidate.filename} (${candidate.score}%)`, marginX, finalY);
        finalY += 7;

        // Resumen
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.setFont(undefined, 'normal');
        
        const summaryLines = doc.splitTextToSize(`"${candidate.summary}"`, pageWidth - (marginX * 2));
        doc.text(summaryLines, marginX, finalY);
        finalY += (summaryLines.length * 5) + 5;

        // --- TABLA DE PROS Y CONS ---
        const maxRows = Math.max(candidate.pros.length, candidate.cons.length);
        const comparisonBody = [];

        for (let i = 0; i < maxRows; i++) {
            const proText = candidate.pros[i] ? `• ${candidate.pros[i]}` : "";
            const conText = candidate.cons[i] ? `• ${candidate.cons[i]}` : "";
            comparisonBody.push([proText, conText]);
        }

        autoTable(doc, {
            startY: finalY,
            head: [['Puntos Fuertes (Pros)', 'Áreas de Mejora (Cons)']],
            body: comparisonBody,
            theme: 'plain', 
            headStyles: { 
                fillColor: [255, 255, 255], 
                textColor: [0, 0, 0], 
                fontStyle: 'bold',
                fontSize: 10
            },
            columnStyles: {
                0: { textColor: [0, 120, 0], cellWidth: 'auto', cellPadding: 2 }, // Verde
                1: { textColor: [180, 0, 0], cellWidth: 'auto', cellPadding: 2 }  // Rojo
            },
            styles: {
                fontSize: 9,
                overflow: 'linebreak',
                valign: 'top'
            },
            didDrawPage: (data) => {
                finalY = data.cursor.y + 10;
            }
        });

        finalY = doc.lastAutoTable.finalY + 15;
    });

    const cleanTitle = jobTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    doc.save(`VitaeScan_${cleanTitle}.pdf`);
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden p-6">
      
      {/* Orb de Fondo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Orb hoverIntensity={1.2} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* --- HEADER CORREGIDO --- */}
        {/* Cambiamos 'flex' simple por 'flex-col md:flex-row' para que en móviles se apilen y no se rompa el diseño */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-zinc-900/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md gap-4 shadow-xl">
            <div className="flex-1">
                <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-2 text-sm transition group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Dashboard
                </button>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 mb-1">
                    Resultados del Análisis
                </h1>
                <p className="text-gray-400 text-sm md:text-base truncate max-w-full md:max-w-xl">
                    Puesto: <span className="text-gray-200">{jobTitle}</span>
                </p>
            </div>
            
            <button 
                onClick={downloadPDF}
                className="w-full md:w-auto bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
                <Download className="w-5 h-5" /> Descargar PDF
            </button>
        </div>

        {/* Grid de Resultados */}
        <div className="grid gap-6 pb-20">
            {results.sort((a,b) => b.score - a.score).map((candidate, index) => (
                <div key={index} className="bg-zinc-900/60 border border-white/10 rounded-xl p-6 hover:border-white/30 transition duration-300 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        
                        {/* Score Circle */}
                        <div className="flex-shrink-0 mx-auto md:mx-0">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 text-2xl font-bold shadow-lg backdrop-blur-sm
                                ${candidate.score >= 80 ? 'border-green-500 text-green-400 shadow-green-500/20' : 
                                  candidate.score >= 60 ? 'border-yellow-500 text-yellow-400 shadow-yellow-500/20' : 
                                  'border-red-500 text-red-400 shadow-red-500/20'}`}>
                                {candidate.score}%
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-grow w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                                    {candidate.filename}
                                    {index === 0 && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />}
                                </h2>
                                {/* Badge de estado opcional */}
                                <span className={`text-xs px-2 py-1 rounded border ${
                                    candidate.score >= 60 ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'
                                }`}>
                                    {candidate.score >= 60 ? 'Candidato Viable' : 'No Recomendado'}
                                </span>
                            </div>

                            <p className="text-gray-300 mb-5 text-sm leading-relaxed bg-black/40 p-4 rounded-lg border border-white/5 italic">
                                "{candidate.summary}"
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-green-500/20 pb-1">
                                        <CheckCircle className="w-4 h-4" /> Puntos Fuertes
                                    </h4>
                                    <ul className="text-sm text-gray-400 space-y-2">
                                        {candidate.pros.map((p, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-green-500/50 mt-1">•</span> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-red-500/20 pb-1">
                                        <XCircle className="w-4 h-4" /> Áreas de Mejora
                                    </h4>
                                    <ul className="text-sm text-gray-400 space-y-2">
                                        {candidate.cons.map((c, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-red-500/50 mt-1">•</span> {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}