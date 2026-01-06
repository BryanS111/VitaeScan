import os
import sys
import json
import asyncio
import fitz  # PyMuPDF
from typing import List
from dotenv import load_dotenv
from openai import OpenAI, AsyncOpenAI # Importamos AsyncOpenAI para peticiones paralelas
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
model_name = os.getenv("MODEL_NAME")

if not api_key:
    sys.exit(1)

# Usamos el cliente ASÍNCRONO para poder lanzar 10 peticiones a la vez
client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. LECTURA ULTRA RÁPIDA (PyMuPDF) ---
def extract_text_fast(file_bytes, filename):
    text_content = ""
    try:
        if filename.lower().endswith('.pdf'):
            with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                for page in doc:
                    text_content += page.get_text() + "\n"
        else:
            text_content = file_bytes.decode("utf-8", errors="ignore")
    except Exception:
        text_content = "Error leyendo archivo."
        
    return {"filename": filename, "text": text_content[:3000]}

# --- 2. ANÁLISIS INDIVIDUAL (PARALELIZABLE) ---
async def analyze_single_candidate(candidate, job_description):
    """
    Envía UN solo candidato a la IA. 
    Esto permite que si son 10 candidatos, los 10 se procesen a la vez.
    """
    
    # Adaptamos levemente el prompt para contexto singular, 
    # pero MANTENIENDO TUS REGLAS EXACTAS.
    system_prompt = """
    Eres un reclutador experto AI. Analiza este candidato contra la descripción.
    
    REGLAS DE SALIDA (JSON):
    1. Responde ÚNICAMENTE con un objeto JSON válido.
    2. Mantén el "filename" EXACTO.
    3. CONTENIDO estrictamente en ESPAÑOL.
    4. NO traduzcas las claves (summary, pros, cons, score, filename).
    
    Estructura requerida:
    {
        "filename": "nombre_exacto.pdf", 
        "score": 85,
        "summary": "Resumen en español...",
        "pros": ["Pro 1", "Pro 2"],
        "cons": ["Con 1", "Con 2"]
    }
    """

    user_prompt = f"""
    PUESTO: {job_description}
    CANDIDATO: {json.dumps(candidate, ensure_ascii=False)}
    """

    try:
        completion = await client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "VitaeScanWeb"
            },
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            response_format={ "type": "json_object" }
        )
        
        raw = completion.choices[0].message.content
        clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
        
    except Exception as e:
        print(f"⚠️ Error analizando {candidate['filename']}: {e}")
        # Retornamos un objeto dummy en caso de fallo para no romper todo
        return {
            "filename": candidate['filename'],
            "score": 0,
            "summary": "Error al procesar este candidato con la IA.",
            "pros": [],
            "cons": []
        }

@app.post("/analyze")
async def analyze_endpoint(
    job_description: str = Form(...),
    files: List[UploadFile] = File(...)
):
    try:
        print(f"⚡ Recibiendo {len(files)} archivos...")
        
        # PASO 1: Leer Archivos (Paralelo en Hilos CPU)
        files_data = []
        for file in files:
            content = await file.read()
            files_data.append((content, file.filename))
            
        loop = asyncio.get_running_loop()
        # Tareas de lectura de PDF
        read_tasks = [
            loop.run_in_executor(None, extract_text_fast, content, name)
            for content, name in files_data
        ]
        # Esperamos a que todos los PDFs se lean
        candidates_text_list = await asyncio.gather(*read_tasks)
        
        print(f"🚀 Enviando {len(candidates_text_list)} peticiones SIMULTÁNEAS a la IA...")

        # PASO 2: Peticiones IA (Paralelo en Red)
        # Aquí ocurre la magia: Se lanzan todas las peticiones a la vez
        ai_tasks = [
            analyze_single_candidate(cand, job_description)
            for cand in candidates_text_list
        ]
        
        # Esperamos a que vuelvan todas (tardará lo que tarde la más lenta, no la suma)
        results_list = await asyncio.gather(*ai_tasks)
        
        print("✅ Todo completado.")

        # Reconstruimos la estructura que espera tu Frontend
        return { "results": results_list }

    except Exception as e:
        print(f"❌ Error General: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)