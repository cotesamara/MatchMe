import re
import fitz  # PyMuPDF
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util

app = FastAPI(title="MatchMe AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://cotesamara.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Expanded curated tech & industry skill vocabulary
SKILL_TAXONOMY = {
    "python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin", "r",
    "react", "react native", "next.js", "vue", "angular", "html", "css", "tailwind", "node.js", "express",
    "fastapi", "django", "flask", "spring boot", "graphql", "rest api", "restful api",
    "sql", "postgresql", "mysql", "sqlite", "mongodb", "supabase", "firebase", "redis",
    "aws", "azure", "gcp", "docker", "kubernetes", "nginx", "ci/cd", "git", "github", "linux", "terraform",
    "pandas", "numpy", "matplotlib", "scikit-learn", "statsmodels", "tensorflow", "pytorch", "spacy", "nlp",
    "machine learning", "deep learning", "data cleaning", "data analysis", "data visualization", "statistics",
    "excel", "vba", "tableau", "power bi", "agile", "scrum", "unit testing", "vhdl", "arm assembly"
}

# Normalize common variations so "React.js" matches "React" and "Postgres" matches "PostgreSQL"
SKILL_ALIASES = {
    "reactjs": "react",
    "react.js": "react",
    "nextjs": "next.js",
    "nodejs": "node.js",
    "node": "node.js",
    "postgres": "postgresql",
    "tailwindcss": "tailwind",
    "tailwind css": "tailwind",
    "rest apis": "rest api",
    "restful apis": "restful api",
    "ml": "machine learning",
    "dl": "deep learning",
    "js": "javascript",
    "ts": "typescript",
    "amazon web services": "aws",
    "google cloud": "gcp",
}

UPPERCASE_SKILLS = {"sql", "aws", "gcp", "ci/cd", "nlp", "vba", "html", "css", "vhdl", "c", "c++", "c#", "r"}


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts clean plain text from an uploaded PDF file."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = [page.get_text("text") for page in doc]
    doc.close()
    return "\n".join(pages).strip()


def extract_keywords(text: str) -> dict[str, str]:
    """
    Finds matching skills from SKILL_TAXONOMY and SKILL_ALIASES.
    Returns {canonical_skill: display_label}.
    """
    text_lower = text.lower()
    found: dict[str, str] = {}

    # 1. Check canonical skills
    for skill in SKILL_TAXONOMY:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, text_lower):
            display = skill.upper() if skill in UPPERCASE_SKILLS else skill.title()
            found[skill] = display

    # 2. Check aliases and map to canonical skill
    for alias, canonical in SKILL_ALIASES.items():
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(alias) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, text_lower) and canonical not in found:
            display = canonical.upper() if canonical in UPPERCASE_SKILLS else canonical.title()
            found[canonical] = display

    return found


def compute_semantic_score(resume_text: str, job_description: str) -> int:
    """
    Computes semantic similarity using top-k requirement alignment so strong matches
    reach 90-100% instead of being penalized by short headers or boilerplate.
    """
    # Filter to meaningful sentences/bullets (at least 4 words)
    resume_lines = [line.strip() for line in resume_text.splitlines() if len(line.strip().split()) >= 4]
    jd_lines = [line.strip() for line in job_description.splitlines() if len(line.strip().split()) >= 4]

    if not resume_lines or not jd_lines:
        resume_emb = embedder.encode(resume_text, convert_to_tensor=True)
        jd_emb = embedder.encode(job_description, convert_to_tensor=True)
        raw_sim = float(util.cos_sim(resume_emb, jd_emb)[0][0])
    else:
        resume_embs = embedder.encode(resume_lines, convert_to_tensor=True)
        jd_embs = embedder.encode(jd_lines, convert_to_tensor=True)
        sim_matrix = util.cos_sim(jd_embs, resume_embs)

        # Best resume match for each JD line
        best_per_jd_line = sim_matrix.max(dim=1).values

        # Focus on the top 60% strongest requirement matches so EEO/company fluff doesn't penalize the user
        k = max(1, int(len(best_per_jd_line) * 0.6))
        top_matches = best_per_jd_line.topk(k).values
        raw_sim = float(top_matches.mean())

    # Realistic calibration for MiniLM sentence-level similarity (0.20 -> 0%, 0.58 -> 100%)
    calibrated = ((raw_sim - 0.20) / (0.58 - 0.20)) * 100
    return round(min(100.0, max(0.0, calibrated)))

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

    # 1. Calibrated Top-K Semantic Score (0 - 100)
    semantic_score = compute_semantic_score(resume_text, job_description)

    # 2. Normalized Skill Overlap Score (0 - 100)
    resume_skills = extract_keywords(resume_text)
    jd_skills = extract_keywords(job_description)

    if jd_skills:
        matched = [display for norm, display in jd_skills.items() if norm in resume_skills]
        missing = [display for norm, display in jd_skills.items() if norm not in resume_skills]
        ratio = len(matched) / len(jd_skills)
        keyword_score = round((ratio ** 0.75) * 100)

        # If the candidate hits 100% of listed skills, ensure Role Alignment reflects that strong fit
        if ratio == 1.0:
            semantic_score = max(semantic_score, 92)
    else:
        matched = list(resume_skills.values())[:10]
        missing = []
        keyword_score = semantic_score

    # 3. Weighted Hybrid Overall Score (65% Must-Have Skills, 35% Role Alignment)
    overall_score = round((0.35 * semantic_score) + (0.65 * keyword_score))
    return {
        "overall_score": overall_score,
        "semantic_score": semantic_score,
        "keyword_score": keyword_score,
        "matched_keywords": sorted(matched),
        "missing_keywords": sorted(missing),
    }