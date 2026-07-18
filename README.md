# Nexo PACI (PACIA)

Plataforma inteligente para la creación y gestión de Planes de Adecuación Curricular Individual (PACI).
Este sistema integra Inteligencia Artificial para asistir a los profesionales de la educación en la redacción, análisis y seguimiento de las adecuaciones curriculares.

## Tecnologías Utilizadas

- **Frontend:** Next.js (React), TailwindCSS, TypeScript
- **Backend:** FastAPI (Python), SQLAlchemy, LangChain
- **Base de Datos:** PostgreSQL (alojado en Supabase)
- **Despliegue:** Vercel (Frontend), Render (Backend)

## Arquitectura del Proyecto

El proyecto está dividido en dos carpetas principales:
- `frontend/`: Contiene toda la interfaz visual y la lógica del cliente (Next.js).
- `backend/`: Contiene el motor de base de datos, la API RESTful y el servicio de Inteligencia Artificial (FastAPI).

## Despliegue (Producción)

La plataforma se encuentra configurada para despliegue continuo:
- Cualquier cambio en la rama `main` que afecte la carpeta `frontend/` se actualizará automáticamente en Vercel.
- Cualquier cambio que afecte la carpeta `backend/` se actualizará automáticamente en Render.

### Variables de Entorno en Producción
Para que el sistema funcione en la nube, asegúrate de configurar las siguientes variables:
**En Render (Backend):**
- `DATABASE_URL` (URL de conexión a Supabase)
- `OPENAI_API_KEY` (Llave de la API de OpenAI)
- `SECRET_KEY` (Clave secreta para la generación de tokens JWT)

**En Vercel (Frontend):**
- `NEXT_PUBLIC_API_URL` (URL pública del backend en Render, sin barra final)

## Ejecución Local (Desarrollo)

Para probar la plataforma en tu computador local:

1. **Backend:**
   ```bash
   cd backend
   source ../test_env/bin/activate
   uvicorn main:app --reload --port 8000
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
