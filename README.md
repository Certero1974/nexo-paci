# SYNEXA - Plataforma Colaborativa de Inteligencia Artificial para la Educación Especial

SYNEXA es un MVP (Producto Mínimo Viable) diseñado para revolucionar la elaboración de Programas de Adecuación Curricular Individual (PACI) mediante el uso de Inteligencia Artificial (Google Gemini) y arquitectura RAG (Generación Aumentada por Recuperación).

## Características Principales

*   **Motor de Decisión Pedagógica:** Utiliza Gemini Flash para analizar informes de especialistas y sugerir barreras, fortalezas y propuestas de adecuación.
*   **Extracción de Documentos:** Lee y procesa documentos PDF y Word automáticamente sin necesidad de pre-procesamiento manual.
*   **Interfaz de Usuario Premium:** Desarrollada en Next.js y TailwindCSS, enfocada en la usabilidad y la estética profesional para docentes.
*   **Arquitectura Desacoplada:** Backend robusto en FastAPI (Python) separado del frontend para máxima escalabilidad.

## Requisitos Previos

*   **Node.js** (v18+)
*   **Python** (3.9+)
*   **PostgreSQL** (Para almacenamiento persistente a futuro)
*   **Google API Key** (Gemini)

## Instalación y Ejecución Local

### 1. Backend (FastAPI / IA)

1.  Abre una terminal y entra a la carpeta `backend`:
    ```bash
    cd backend
    ```
2.  Crea un entorno virtual y actívalo:
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Windows usa: venv\Scripts\activate
    ```
3.  Instala las dependencias necesarias:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configura las variables de entorno:
    Asegúrate de que el archivo `backend/.env` tenga tu llave de API de Google (la que comienza con `AQUI_TU_LLAVE...` o un token OAuth válido).
    ```env
    GOOGLE_API_KEY="TU_LLAVE_AQUI"
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexo_paci"
    ```
5.  Inicia el servidor backend:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```
    El backend estará corriendo en `http://localhost:8000`.

### 2. Frontend (Next.js / React)

1.  Abre otra terminal y entra a la carpeta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias de Node.js:
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
4.  Abre tu navegador web en `http://localhost:3000` para ver la plataforma SYNEXA en acción.

## Uso de la Plataforma

1. Selecciona a un estudiante en el panel principal (ej. Martina).
2. Haz clic en **Subir Informe** y selecciona un documento real (PDF/Word).
3. Espera a que el documento se cargue (aparecerá un check verde).
4. Presiona **GENERAR PACI EN 1 CLIC**.
5. La Inteligencia Artificial analizará el documento y te entregará el perfil funcional y las estrategias pedagógicas recomendadas.
6. Valida y Guarda el PACI.
