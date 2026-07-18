import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure the API key
api_key = os.getenv("GOOGLE_API_KEY")
if api_key and not api_key.startswith("AQUI_TU_LLAVE"):
    genai.configure(api_key=api_key)

# We use gemini-flash-latest to ensure maximum compatibility and free tier access
MODEL_NAME = "gemini-flash-latest"

class GeminiPaciService:
    def __init__(self):
        try:
            self.model = genai.GenerativeModel(
                model_name=MODEL_NAME,
                generation_config={"response_mime_type": "application/json"}
            )
        except Exception as e:
            self.model = None
            print(f"Error inicializando Gemini: {e}")
            
        # Cargar Base de Conocimiento Normativo
        self.normativa = ""
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            normativa_path = os.path.join(base_dir, "knowledge", "normativa_mineduc.json")
            if os.path.exists(normativa_path):
                with open(normativa_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.normativa = json.dumps(data, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error cargando normativa: {e}")

    def generar_propuesta_paci(self, estudiante_id: int, evidencias_mock: str) -> dict:
        # 1. Abstención de la IA: Si no hay evidencia, no se inventan datos.
        if not evidencias_mock or len(evidencias_mock.strip()) < 50:
            raise ValueError("No hay evidencia suficiente para generar una propuesta. Sube informes o evaluaciones al expediente del estudiante primero.")

        # 2. Eficiencia: Limitar el tamaño del texto para no gastar demasiados tokens de API
        # 20.000 caracteres son aprox 5.000 tokens, suficiente para un resumen sólido de 3-4 informes.
        max_chars = 20000
        evidencia_limpia = evidencias_mock.strip()[:max_chars]

        if not self.model or os.getenv("GOOGLE_API_KEY") == "AQUI_TU_LLAVE_DE_GOOGLE":
            return self._get_mock_response(evidencia_limpia)

        prompt = f"""
        Eres el Motor de Decisión Pedagógica PACIA, un experto en la normativa chilena de Educación Especial.
        Tu objetivo es razonar sobre las evidencias de un estudiante y proponer respuestas educativas estrictamente justificadas.
        
        BASE DE CONOCIMIENTO NORMATIVO (DECRETO 83 Y 170):
        {self.normativa}

        REGLAS ESTRICTAS DEL MOTOR DE DECISIÓN:
        1. NO diagnostiques ni reemplaces al equipo educativo. Solo propón alternativas.
        2. En la sección de 'herramientas_metodologicas', debes proponer SIEMPRE al menos 3 alternativas distintas de respuesta educativa.
        3. Para cada propuesta, debes justificarla brevemente en 'justificacion', y en 'sustento_normativo' debes citar el principio o artículo exacto de la BASE DE CONOCIMIENTO NORMATIVO que respalda esta decisión (ej. 'Basado en el principio de Flexibilidad del Decreto 83...').
        4. Identifica qué profesionales especializados (ej. Fonoaudiólogo, Psicólogo, Terapeuta Ocupacional, Kinesiólogo, etc.) intervinieron en la evaluación o son necesarios para este caso basándote en la evidencia, y lístalos en 'profesionales_involucrados'.
        
        Evidencias del estudiante:
        {evidencias_mock}

        Debes retornar estrictamente un objeto JSON con la siguiente estructura (no añadas markdown externo ni nada más):
        {{
            "perfil_funcional": "Perfil Funcional del estudiante (Fortalezas, barreras de aprendizaje y facilitadores basados estrictamente en la evidencia).",
            "criterios_adecuacion": "Criterios de adecuación curricular y asignaturas en que se aplicarán (Graduación del nivel de complejidad, priorización de OA, etc).",
            "objetivos_aprendizaje": "Objetivos de Aprendizaje específicos a trabajar dependiendo para cada una de las asignaturas.",
            "propuestas": [
                {{
                    "titulo": "Título de la propuesta metodológica 1 (ej. Apoyo Educadora Diferencial)",
                    "nivel_confianza": "Alto",
                    "justificacion": "Por qué se sugiere esta propuesta según la evidencia.",
                    "sustento_normativo": "El principio del Decreto 83 o 170 que lo fundamenta."
                }},
                {{
                    "titulo": "Título de la propuesta metodológica 2",
                    "nivel_confianza": "Medio",
                    "justificacion": "..."
                }},
                {{
                    "titulo": "Título de la propuesta metodológica 3",
                    "nivel_confianza": "Medio",
                    "justificacion": "..."
                }}
            ],
            "tiempo_aplicacion": "Tiempo de aplicación estimado (ej. Anual).",
            "responsables_aplicacion": "Responsable de su aplicación y seguimiento.",
            "recursos_involucrados": "Recursos humanos y materiales involucrados.",
            "estrategia_seguimiento": "Estrategia de seguimiento y evaluación de medidas y acciones de apoyo definidas en el plan.",
            "evaluacion_resultados": "Evaluación de resultados de aprendizaje del estudiante.",
            "revision_ajuste": "Revisión y ajuste del plan.",
            "profesionales_involucrados": ["Psicólogo", "Fonoaudiólogo"]
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            # Remove any markdown code block wrappers if gemini added them
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Error llamando a Gemini: {e}")
            return self._get_mock_response(evidencias_mock)

    def _get_mock_response(self, texto_extraido: str) -> dict:
        return {
            "perfil_funcional": "Benjamín presenta importantes fortalezas en el área visual y kinestésica...",
            "criterios_adecuacion": "Se aplicará Graduación del Nivel de Complejidad en Lenguaje...",
            "objetivos_aprendizaje": "LENGUAJE (OA 4): Leer independientemente...",
            "propuestas": [
                {
                    "titulo": "Uso de mapas mentales",
                    "nivel_confianza": "Alto",
                    "justificacion": "Se apoya en su fortaleza visual.",
                    "sustento_normativo": "Decreto 83: Adecuación de Acceso en Formas de Presentación."
                },
                {
                    "titulo": "Material concreto en matemáticas",
                    "nivel_confianza": "Medio",
                    "justificacion": "Ayuda con la comprensión kinestésica.",
                    "sustento_normativo": "Decreto 83: Adecuación de Acceso."
                },
                {
                    "titulo": "Segmentación de tareas",
                    "nivel_confianza": "Alto",
                    "justificacion": "Evita la fatiga cognitiva por TDAH.",
                    "sustento_normativo": "Decreto 83: Organización del tiempo."
                }
            ],
            "tiempo_aplicacion": "Anual, con hitos de revisión trimestrales.",
            "responsables_aplicacion": "Profesor Jefe, Educadora Diferencial.",
            "recursos_involucrados": "Material didáctico, Pizarrones interactivos.",
            "estrategia_seguimiento": "Reunión de equipo mensual.",
            "evaluacion_resultados": "Evaluación formativa diferenciada.",
            "revision_ajuste": "Ajuste formal al finalizar el primer semestre.",
            "profesionales_involucrados": ["Terapeuta Ocupacional", "Psicólogo"]
        }

    def analizar_coherencia_paci(self, estudiante_diagnostico: str, paci_text: str) -> list:
        if not self.model or os.getenv("GOOGLE_API_KEY") == "AQUI_TU_LLAVE_DE_GOOGLE":
            return [
                {
                    "modulo": "Objetivos de Aprendizaje",
                    "tipo": "Crítica",
                    "mensaje": "El objetivo de matemáticas propuesto exige mucha abstracción que no es coherente con las barreras descritas."
                },
                {
                    "modulo": "Tiempo de aplicación",
                    "tipo": "Sugerencia",
                    "mensaje": "Se sugiere reducir el tiempo de evaluación continua a mensual en vez de semestral."
                }
            ]
            
        prompt = f"""
        Eres un Supervisor Técnico PIE (Programa de Integración Escolar) experto en Decreto 83.
        Tu tarea es revisar el siguiente PACI de un estudiante con el diagnóstico: {estudiante_diagnostico}.
        
        Busca incoherencias lógicas entre el diagnóstico y las adecuaciones, o entre los mismos módulos del PACI.
        Por ejemplo, si se mencionan barreras visuales pero no hay adecuaciones de formato.
        
        Texto del PACI:
        {paci_text}
        
        Retorna ESTRICTAMENTE un JSON Array con objetos que tengan esta estructura:
        [
          {{
            "modulo": "Nombre del módulo afectado (ej. 4. Objetivos de Aprendizaje)",
            "tipo": "Crítica o Sugerencia",
            "mensaje": "Descripción de la incoherencia",
            "propuesta_correccion": "Redacta de manera directa el texto exacto que sugerirías colocar en ese módulo para corregir el problema."
          }}
        ]
        Si no hay incoherencias, retorna un array vacío [].
        NO agregues markdown alrededor del JSON.
        """
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Error en analizar_coherencia_paci: {e}")
            return []

    def chat_con_copiloto(self, mensaje: str, contexto: str = "") -> str:
        if not self.model or os.getenv("GOOGLE_API_KEY") == "AQUI_TU_LLAVE_DE_GOOGLE":
            return "El Motor de IA está desactivado porque falta tu GOOGLE_API_KEY. No puedo responder tu mensaje."

        prompt = f"""
        Eres Alex (PACIA AI), un compañero de trabajo y asistente experto en Educación Especial (PIE) y normativa chilena (Decreto 83 y 170). 
        Tu personalidad es sumamente humana, cálida, empática y colaborativa. Nunca suenes como un robot o una IA genérica.
        Habla como un colega profesor o coordinador PIE que está sentado al lado del usuario, dispuesto a ayudarle a aliviar su carga laboral.
        Usa un tono conversacional, cercano (puedes tutear) y muy natural. Si el usuario te saluda, devuélvele el saludo con calidez.
        Sé muy conciso y directo al grano, pero siempre manteniendo la empatía.
        Cuando te hagan preguntas legales o normativas, basa estrictamente tu respuesta en el siguiente conocimiento normativo:
        
        BASE DE CONOCIMIENTO NORMATIVO (DECRETO 83 Y 170):
        {self.normativa}
        
        Contexto de lo que el usuario está viendo en su pantalla ahora mismo: {contexto}
        
        Mensaje de tu colega (usuario): {mensaje}
        """

        try:
            # Recrear el modelo sin la restricción JSON para el chat libre
            chat_model = genai.GenerativeModel(model_name=MODEL_NAME)
            response = chat_model.generate_content(prompt)
            return response.text
        except Exception as e:
            error_str = str(e)
            print(f"Error llamando a Gemini Chat: {error_str}")
            if "429" in error_str or "Quota exceeded" in error_str:
                return "¡Uf! Me estás haciendo pensar muy rápido. Hemos alcanzado el límite de consultas gratuitas por minuto de la IA. Por favor, dame unos 40 segunditos para respirar y vuelve a preguntarme."
            return "Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo en unos momentos."
