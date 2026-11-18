import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  // Handles file selection from the file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  // Sends data to FastAPI (or runs mock data while testing frontend)
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jobDescription.trim()) return;

    setIsAnalyzing(true);

    try {
      // Prepare FormData to send both a file and text to FastAPI
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_description', jobDescription);

      // TODO: Uncomment this once your FastAPI backend is running on port 8000
      /*
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data);
      */

      // Temporary simulated delay & mock NLP response so you can test the UI now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResults({
        overall_score: 78,
        semantic_score: 84,
        keyword_score: 70,
        matched_keywords: ['Python', 'React', 'SQL', 'Data Cleaning', 'Git'],
        missing_keywords: ['Docker', 'AWS', 'CI/CD', 'Kubernetes'],
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to connect to the analysis server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    // Outer full-screen deep navy / almost-black background
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation / Header */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Resume<span className="text-indigo-400">Fit</span> AI
          </h1>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
          TF-IDF + SBERT Hybrid Engine
        </span>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL: Dark Grayish Input Card */}
        <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-6 flex-1 flex flex-col">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">1. Upload Resume</h2>
              <p className="text-sm text-zinc-400 mb-3">Upload your resume in PDF format for text extraction.</p>
              
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl cursor-pointer bg-zinc-950/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {resumeFile ? (
                    <>
                      <FileText className="w-8 h-8 text-indigo-400 mb-2" />
                      <p className="text-sm font-medium text-zinc-200">{resumeFile.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">Click to replace PDF</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                      <p className="text-sm text-zinc-300">
                        <span className="font-semibold text-indigo-400">Click to upload</span> your PDF resume
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">PDF files only (Max 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-1">2. Target Job Description</h2>
              <p className="text-sm text-zinc-400 mb-3">Paste the full job posting requirements below.</p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job responsibilities, required skills, and qualifications here..."
                className="flex-1 min-h-[220px] w-full rounded-xl bg-zinc-950/70 border border-zinc-800 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!resumeFile || !jobDescription.trim() || isAnalyzing}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-indigo-950/50 cursor-pointer"
            >
              {isAnalyzing ? 'Running NLP Models...' : 'Calculate Match Score'}
            </button>
          </form>
        </section>

        {/* RIGHT PANEL: Dark Grayish Results Card */}
        <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-1">Match Analysis</h2>
          <p className="text-sm text-zinc-400 mb-6">Hybrid semantic & exact keyword breakdown.</p>

          {!results ? (
            // Empty State before running analysis
            <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-xl p-8 bg-zinc-950/30">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-zinc-300 font-medium">Ready to analyze</p>
              <p className="text-sm text-zinc-500 max-w-xs mt-1">
                Upload your resume and paste a job description on the left to see your fit score and missing keywords.
              </p>
            </div>
          ) : (
            // Results Dashboard
            <div className="space-y-6 flex-1">
              {/* Overall Score Banner */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                    Overall Fit Score
                  </span>
                  <div className="text-4xl font-extrabold text-white mt-1">
                    {results.overall_score}%
                  </div>
                </div>

                {/* Sub-scores */}
                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-xs text-zinc-400">Semantic AI</div>
                    <div className="text-lg font-bold text-indigo-400">{results.semantic_score}%</div>
                  </div>
                  <div className="border-l border-zinc-800 pl-4">
                    <div className="text-xs text-zinc-400">Exact Keywords</div>
                    <div className="text-lg font-bold text-emerald-400">{results.keyword_score}%</div>
                  </div>
                </div>
              </div>

              {/* Matched Keywords */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matched Keywords ({results.matched_keywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.matched_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-amber-400 mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>Missing Keywords ({results.missing_keywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.missing_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/60"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}