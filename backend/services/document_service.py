import os
import io
import pdfplumber
import docx

class DocumentService:
    @staticmethod
    def extract_text(file_bytes: bytes, filename: str) -> str:
        text = ""
        ext = os.path.splitext(filename)[1].lower()
        
        try:
            if ext == '.pdf':
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                            
            elif ext in ['.docx', '.doc']:
                doc = docx.Document(io.BytesIO(file_bytes))
                for para in doc.paragraphs:
                    text += para.text + "\n"
                    
            elif ext == '.txt':
                text = file_bytes.decode('utf-8')
                
            else:
                raise ValueError(f"Formato no soportado: {ext}")
                
            return text.strip()
            
        except Exception as e:
            print(f"Error procesando documento {filename}: {str(e)}")
            raise e
