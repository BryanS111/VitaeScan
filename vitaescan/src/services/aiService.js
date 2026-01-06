import axios from 'axios';

export const analyzeCandidates = async (jobDescription, candidatesFiles) => {
  // Asegúrate de que este puerto coincida con el de main.py (8000)
  const API_URL = "https://vitaescan-backend.onrender.com/analyze";

  const formData = new FormData();
  
  formData.append("job_description", jobDescription);

  if (candidatesFiles && candidatesFiles.length > 0) {
    candidatesFiles.forEach((file) => {
      formData.append("files", file);
    });
  }

  try {
    console.log("🚀 Enviando datos al backend...");
    
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000 // 5 minutos
    });

    console.log("✅ Respuesta recibida:", response.data);

    // Validación de estructura para evitar pantallas en blanco
    if (response.data && response.data.results) {
        return response.data.results; // Devolvemos directamente el array
    } else {
        throw new Error("El formato de respuesta de la IA no es válido.");
    }

  } catch (error) {
    console.error("❌ Error en aiService:", error);
    if (error.code === "ERR_NETWORK") {
        throw new Error("Error de conexión: El backend no responde. Verifica que main.py esté corriendo.");
    }
    // Si el backend envió un error detallado (ej. 422 o 500)
    if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(`Error del Servidor: ${error.response.data.detail}`);
    }
    throw error;
  }
};