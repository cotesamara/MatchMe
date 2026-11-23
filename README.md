<div align="center">
  <h1>
    <img src="frontend/public/logo.png" alt="MatchMe Logo" width="52" align="absmiddle" />
    MatchMe
  </h1>
  <p><strong>An AI-powered, retro-style resume & job description matcher.</strong></p>
  <p>Upload your PDF resume, paste a job posting, and let the pixel crew show how well you match and which skills you're missing in seconds.</p>

  <p>
    <a href="https://cotesamara.github.io/MatchMe/"><img src="https://img.shields.io/badge/Live_Demo-Play_Now-7dd3fc?style=for-the-badge&logo=githubpages&logoColor=050814" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/React-19-38bdf8?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-0ea5e9?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/FastAPI-Python-10b981?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/NLP-Sentence_Transformers-f59e0b?style=for-the-badge&logo=huggingface&logoColor=white" alt="Sentence Transformers" />
  </p>
</div>

---

## Meet the Crew

<p align="center">
  <img src="frontend/public/smartCat.png" width="56" alt="Smart Cat" /><br />
  <strong>Smart Cat</strong> — Checks your PDF Resume<br />
  <em>"Show me your skills"</em>
</p>

<p align="center">
  <img src="frontend/public/recruiter.png" width="80" alt="The Recruiter" /><br />
  <strong>The Recruiter</strong> — Looks over the job description requirements<br />
  <em>"This is what I want"</em>
</p>

<p align="center">
  <img src="frontend/public/chicken.png" width="56" alt="Pixel Chicken" /><br />
  <strong>Pixel Chicken</strong> — Reacts to your final Overall Fit Score<br />
  <em>"Wow, looking good" / "Always room for improvement"</em>
</p>

---

## Features

- **Smart Match Scoring:** Combines **65% Required Skills** with **35% Overall Experience Fit** (`all-MiniLM-L6-v2`) so you aren't unfairly penalized for generic company text or legal disclaimers in the job post.
- **Recognizes Different Skill Names:** Automatically knows that different spellings mean the same thing (for example, `React.js` = `React`, `Postgres` = `PostgreSQL`, `RESTful APIs` = `Rest Api`).
- **Fast PDF Reading:** Pulls clean text straight out of single or multi-page PDF resumes using **PyMuPDF (`fitz`)**.
- **Clear Skill Breakdown:** Separates keywords into **Matched Skills** and **Missing Skills** so you know exactly what to add before applying.
- **Retro Pixel Design:** Dark mode (`#050814`) built with pixel fonts (`Press Start 2P` and `Silkscreen`), custom drop-shadow titles, 3D-style pixel buttons, and live speech bubbles.

---

## How the Scoring Works

```text
  [ PDF Resume ] ──► Read Resume Text (PyMuPDF) ────┐
                                                    ├──► Compare Overall Meaning (35%) ──┐
  [ Job Posting ] ──────────────────────────────────┤                                    ├──► Overall Fit %
                                                    └──► Compare Matching Skills (65%) ──┘

## What I learned
