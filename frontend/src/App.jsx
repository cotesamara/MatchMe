import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jobDescription.trim()) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_description', jobDescription);

      // Temporary simulated NLP response while testing the frontend
      await new Promise((resolve) => setTimeout(resolve, 900));
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
    // Deep navy / almost-black outer background
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans">
      
      {/* Header: gap-1.5 brings the title right next to your logo */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-0.1">
          <img 
            src="/logo.png" 
            alt="MatchMe Logo" 
            className="w-13 h-13 object-contain scale-125" 
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Match<span className="text-sky-300">Me</span>
          </h1>
        </div>

      </header>

      {/* Main Split-Screen Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL: Dark Grayish Input Card */}
        <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-6 flex-1 flex flex-col">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Upload Resume</h2>
              <p className="text-sm text-zinc-400 mb-3">Please upload your resume in PDF format.</p>
              
              <label className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-700 hover:border-sky-400 rounded-xl cursor-pointer bg-zinc-950/50 transition-colors">
              {/* Speech Bubble */}
                <div className="absolute -top-9 right-[88px] bg-zinc-800 text-sky-200 border border-sky-400/50 text-[8px] leading-none font-medium px-2 py-1 rounded-lg rounded-br-none shadow-lg pointer-events-none z-10 whitespace-nowrap">
                  Show me your skills
                  {/* Little speech-bubble tail pointing toward the cat */}
                  <span className="absolute -right-1 bottom-1 w-1.5 h-1.5 bg-zinc-800 border-r border-b border-sky-400/50 -rotate-45"></span>
                </div>
                {/* SmartCat anchored to the top-right corner of the dashed upload box */}
                <img 
                  /*src="/catTopScreen.png" */
                  src="/smartCat.png"
                  alt="Cat Top Screen" 
                  className="absolute -top-11 right-4 w-18 h-18 object-contain drop-shadow-md pointer-events-none z-10"
                  style={{ imageRendering: 'pixelated' }}
                />

                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {resumeFile ? (
                    <>
                      <FileText className="w-8 h-8 text-sky-300 mb-2" />
                      <p className="text-sm font-medium text-zinc-200">{resumeFile.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">Click to replace PDF</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                      <p className="text-sm text-zinc-300">
                        <span className="font-semibold text-sky-300">Click to upload</span> your PDF resume
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
            {/* TARGET JOB DESCRIPTOPN SECTION */}
            <div className="flex-1 flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-1">Target Job Description</h2>
              <p className="text-sm text-zinc-400 mb-3">Please copy and paste the full job posting requirements below.</p>
              <div className="relative flex-1 flex flex-col">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job responsibilities, required skills, and qualifications here..."
                  className="flex-1 min-h-[220px] w-full rounded-xl bg-zinc-950/70 border border-zinc-800 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 resize-none"
                />
                <img 
                  src="/recruiter.png"
                  alt="Recruiter" 
                  className="absolute -bottom-9 -left-10 w-24 h-24 object-contain drop-shadow-md pointer-events-none z-10"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="absolute -bottom-1 left-[27px] bg-zinc-800 text-sky-200 border border-sky-400/50 text-[8px] leading-none font-medium px-2 py-1 rounded-md rounded-bl-none shadow-lg pointer-events-none z-10 whitespace-nowrap">
                  This is what I want
                  {/* Little speech-bubble tail pointing left toward the recruiter */}
                  <span className="absolute -left-1 bottom-1 w-1.5 h-1.5 bg-zinc-800 border-l border-b border-sky-400/50 rotate-45"></span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!resumeFile || !jobDescription.trim() || isAnalyzing}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-sky-400 hover:bg-sky-300 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-slate-950 transition-all shadow-lg shadow-sky-950/40 cursor-pointer"
            >
              {isAnalyzing ? 'Running NLP Models...' : 'Match Me'}
            </button>
          </form>
        </section>

        {/* RIGHT PANEL: Dark Grayish Results Card */}
        <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-1">Match Analysis</h2>
          <p className="text-sm text-zinc-400 mb-6">Hybrid semantic & exact keyword breakdown.</p>

          {!results ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-xl p-8 bg-zinc-950/30">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-sky-300/70" />
              </div>
              <p className="text-zinc-300 font-medium">Ready to analyze</p>
              <p className="text-sm text-zinc-500 max-w-xs mt-1">
                Upload your resume and paste a job description on the left to see your fit score and missing keywords.
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1">
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                    Overall Fit Score
                  </span>
                  <div className="text-4xl font-extrabold text-white mt-1">
                    {results.overall_score}%
                  </div>
                </div>

                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-xs text-zinc-400">Semantic AI</div>
                    <div className="text-lg font-bold text-sky-300">{results.semantic_score}%</div>
                  </div>
                  <div className="border-l border-zinc-800 pl-4">
                    <div className="text-xs text-zinc-400">Exact Keywords</div>
                    <div className="text-lg font-bold text-emerald-400">{results.keyword_score}%</div>
                  </div>
                </div>
              </div>

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