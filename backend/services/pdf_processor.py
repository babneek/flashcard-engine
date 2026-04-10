import os
import re
import pdfplumber
from PyPDF2 import PdfReader
from config import UPLOAD_DIR, GROQ_API_KEY, OPENAI_API_KEY
import sys
from pathlib import Path

# PageIndex is optional - only used if available
PAGEINDEX_AVAILABLE = False
try:
    # Add local PageIndex to path (prioritize it over installed package)
    LIB_PATH = str(Path(__file__).parent.parent / "libs" / "PageIndex")
    if LIB_PATH not in sys.path:
        sys.path.insert(0, LIB_PATH)
    
    from pageindex import page_index_main
    from pageindex.utils import ConfigLoader
    PAGEINDEX_AVAILABLE = True
except ImportError:
    print("⚠ PageIndex not available, using fallback PDF processing")

from services.topic_extractor import organize_content_by_topics


def index_pdf_with_pageindex(file_path: str) -> str:
    """
    Uses PageIndex to index the PDF (if available).
    Falls back to simple extraction if PageIndex is not installed.
    Saves the structure to a JSON file and returns the path.
    """
    if not PAGEINDEX_AVAILABLE:
        print("⚠ PageIndex not available, skipping indexing")
        return None
    
    # Ensure environment variables are set for litellm (used by PageIndex)
    if GROQ_API_KEY and not os.getenv("GROQ_API_KEY"):
        os.environ["GROQ_API_KEY"] = GROQ_API_KEY
    if OPENAI_API_KEY and not os.getenv("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

    try:
        # 1. Load configuration
        # Use llama-3.3-70b-versatile via groq prefix since PageIndex uses litellm
        model = "groq/llama-3.3-70b-versatile" if GROQ_API_KEY else "gpt-4o"
        opt = ConfigLoader().load({
            "model": model,
            "if_add_node_summary": "yes",
            "if_add_node_text": "yes"
        })

        # 2. Run local indexing
        # This will return a hierarchical JSON structure
        structure = page_index_main(file_path, opt)
        
        # 3. Save structure locally for reference
        base_name = os.path.basename(file_path)
        json_filename = f"{base_name}_structure.json"
        json_path = os.path.join(UPLOAD_DIR, json_filename)
        
        import json
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(structure, f, indent=2)
            
        print(f"Local PageIndex processing complete. Structure saved to {json_path}")
        return json_path # Using the path as the "doc_id" locally
    except Exception as e:
        print(f"Local PageIndex processing failed: {e}")
        import traceback
        traceback.print_exc()
        return None
def extract_text_from_pdf(file_path: str, organize_by_topics: bool = False) -> dict | str:
    """
    Extract text from a PDF file using pdfplumber (primary) with PyPDF2 fallback.
    Cleans up the extracted text for better LLM processing.
    
    Args:
        file_path: Path to the PDF file
        organize_by_topics: If True, returns organized topics dict; if False, returns cleaned text string
    
    Returns:
        If organize_by_topics=True: dict with 'topics' and 'metadata'
        If organize_by_topics=False: cleaned text string
    """
    text = ""

    # Try pdfplumber first (better for complex layouts)
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception:
        pass

    # Fallback to PyPDF2 if pdfplumber extracted nothing
    if not text.strip():
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        except Exception as e:
            raise ValueError(f"Could not extract text from PDF: {str(e)}")

    if not text.strip():
        raise ValueError("No text could be extracted from this PDF. It may be image-based or empty.")

    cleaned_text = clean_text(text)
    
    # Return organized topics or just cleaned text
    if organize_by_topics:
        return organize_content_by_topics(cleaned_text)
    else:
        return cleaned_text


def clean_text(text: str) -> str:
    """
    Deep clean extracted PDF text by removing noise and organizing content.
    Removes headers, footers, page numbers, URLs, and other non-content elements.
    """
    # Remove page numbers and pagination
    text = re.sub(r"Page \d+ of \d+", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^\d+\s*$", "", text, flags=re.MULTILINE)  # Standalone page numbers
    text = re.sub(r"\[\d+\]", "", text)  # Reference numbers like [1], [2]
    
    # Remove common headers/footers patterns
    text = re.sub(r"^(Chapter|Section|Part)\s+\d+.*$", "", text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r"^\d{4}-\d{2}-\d{2}.*$", "", text, flags=re.MULTILINE)  # Dates
    text = re.sub(r"^©.*$", "", text, flags=re.MULTILINE)  # Copyright notices
    
    # Remove URLs and email addresses
    text = re.sub(r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+", "", text)
    text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "", text)
    
    # Remove form feeds and special characters
    text = re.sub(r"\f", "", text)
    text = re.sub(r"[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f-\x9f]", "", text)
    
    # Remove excessive whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    
    # Remove lines with only special characters or very short lines
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        # Keep lines that have at least 3 words or are part of a list
        if len(line.split()) >= 3 or (line and line[0] in "•-*"):
            cleaned_lines.append(line)
    
    text = "\n".join(cleaned_lines)
    
    return text.strip()


def chunk_text(text: str, max_tokens: int = 600) -> list[str]:
    """
    Split text into chunks of approximately max_tokens words.
    Tries to break on paragraph boundaries.
    Reduced chunk size to generate more cards.
    """
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len((current_chunk + " " + para).split()) > max_tokens and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            current_chunk += "\n\n" + para if current_chunk else para

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # If we got no chunks (very short text), return the whole text as one chunk
    if not chunks and text.strip():
        chunks = [text.strip()]

    return chunks


def save_uploaded_pdf(file_content: bytes, filename: str) -> str:
    """Save uploaded PDF to disk and return the file path."""
    safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    # Avoid overwriting
    base, ext = os.path.splitext(file_path)
    counter = 1
    while os.path.exists(file_path):
        file_path = f"{base}_{counter}{ext}"
        counter += 1

    with open(file_path, "wb") as f:
        f.write(file_content)

    return file_path
