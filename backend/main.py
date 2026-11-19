import re
import fitz  # PyMuPDF
import spacy
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util

app = FastAPI(title="MatchMe AI Backend")

# Allow requests from your Vite React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "https://cotesamara.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load lightweight NLP models once on startup
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Curated tech & industry skill vocabulary for crisp keyword matching
SKILL_TAXONOMY = {
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin",
    "react", "next.js", "vue", "angular", "html", "css", "tailwind", "node.js", "express", "fastapi", "django", "flask",
    "sql", "postgresql", "mysql", "mongodb", "supabase", "firebase", "redis", "graphql", "rest api",
    "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "git", "github", "linux", "terraform",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "spacy", "nlp", "machine learning", "deep learning",
    "data cleaning", "data analysis", "excel", "vba", "tableau", "power bi", "agile", "scrum", "unit testing"
}


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts clean plain text from an uploaded PDF file."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = [page.get_text("text") for page in doc]
    doc.close()
    return "\n".join(pages).strip()


def extract_keywords(text: str) -> dict[str, str]:
    """
    Finds matching skills from SKILL_TAXONOMY plus capitalized proper-noun/tech entities via spaCy.
    Returns {normalized_lowercase: display_label}.
    """
    text_lower = text.lower()
    found: dict[str, str] = {}

    for skill in SKILL_TAXONOMY:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, text_lower):
            display = skill.upper() if skill in {"sql", "aws", "gcp", "ci/cd", "nlp", "vba", "html", "css"} else skill.title()
            found[skill] = display

    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ in {"ORG", "PRODUCT"}:
            clean = ent.text.strip()
            norm = clean.lower()
            if 2 <= len(clean) <= 25 and norm not in found and not any(ch.isdigit() for ch in clean):
                found[norm] = clean

    return found


@app.get("/")
def health_check():
    return {"status": "ok", "message": "MatchMe NLP API is running"}


@app.post("/api/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")

    pdf_bytes = await resume.read()
    resume_text = extract_text_from_pdf(pdf_bytes)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from the uploaded PDF.")

    # 1. Semantic AI Similarity Score (0 - 100)
    resume_emb = embedder.encode(resume_text, convert_to_tensor=True)
    jd_emb = embedder.encode(job_description, convert_to_tensor=True)
    cosine_sim = float(util.cos_sim(resume_emb, jd_emb).item())
    semantic_score = round(max(0.0, min(100.0, ((cosine_sim - 0.20) / 0.65) * 100)))

    # 2. Exact Keyword Overlap Score (0 - 100)
    resume_skills = extract_keywords(resume_text)
    jd_skills = extract_keywords(job_description)

    if jd_skills:
        matched = [display for norm, display in jd_skills.items() if norm in resume_skills]
        missing = [display for norm, display in jd_skills.items() if norm not in resume_skills]
        keyword_score = round((len(matched) / len(jd_skills)) * 100)
    else:
        matched = list(resume_skills.values())[:10]
        missing = []
        keyword_score = semantic_score

    # 3. Weighted Hybrid Overall Score (60% Semantic, 40% Keyword)
    overall_score = round((0.6 * semantic_score) + (0.4 * keyword_score))

    return {
        "overall_score": overall_score,
        "semantic_score": semantic_score,
        "keyword_score": keyword_score,
        "matched_keywords": sorted(matched),
        "missing_keywords": sorted(missing),
    }