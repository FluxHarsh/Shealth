import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AI_BASE  = import.meta.env.AI_SERVICE_URL  || 'http://localhost:8000';

const OPT_BG     = ['#F7D5E0','#D4EEF8','#D4F0E8','#FFF0D4','#EDE8F8','#FFE8D4'];
const OPT_ACCENT = ['#C8426D','#2196F3','#4CAF85','#F0A000','#8B72C8','#E07B00'];

// ── AI API helpers ─────────────────────────────────────────────────────────────

async function aiPost(path, body) {
  const res = await fetch(`${AI_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
  return res.json();
}

async function fetchFirstQuestion(patientId) {
  const data = await aiPost('/assessment/start', { patientId });
  if (!data.question) throw new Error('No question returned from AI');
  return data.question;
}

async function fetchNextQuestion(assessmentId, qa, questionNumber) {
  const data = await aiPost('/assessment/next-question', { assessmentId, qa, questionNumber });
  return data;
}

async function fetchReport(assessmentId, qa, imageContext) {
  const data = await aiPost('/report/generate', {
    assessmentId,
    qa,
    vitals: null,
    imageContext: imageContext || null,
  });
  return data.report || data;
}

async function analyzeImageApi(base64_image, mime_type, context) {
  const data = await aiPost('/image/analyze', { base64_image, mime_type, context });
  return data.analysis;
}

async function transcribeVoiceApi(base64_audio, mime_type = 'audio/webm') {
  const data = await aiPost('/voice/transcribe', { base64_audio, mime_type, language: 'hi' });
  return data.text;
}

async function speakQuestionApi(text) {
  try {
    const data = await aiPost('/voice/speak', { text, language: 'hi' });
    if (data.audio_base64) {
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio_base64}`);
      audio.play().catch(() => {});
    }
  } catch { /* non-fatal */ }
}

// ── Normalize AI report format → ReportPage-compatible format ─────────────────
// AI route returns: { symptomsSummary, duration, severity, keyObservations,
//                    possibleConcerns, urgencyLevel, recommendedTests }
// ReportPage expects: { symptoms[], duration, severity, keyObservations[],
//                       riskFlags, riskLevel, recommendedTests[] }
function normalizeReport(raw) {
  if (!raw) return null;
  // Already in legacy format
  if (Array.isArray(raw.symptoms) && raw.symptoms.length) return raw;

  const urgency = raw.urgencyLevel || 'routine';
  const severityMap = { urgent: 'Severe', priority: 'Moderate', routine: 'Mild' };
  const rawSev = raw.severity || severityMap[urgency] || 'Moderate';
  const severity = rawSev.charAt(0).toUpperCase() + rawSev.slice(1).toLowerCase();

  const symptoms = (raw.possibleConcerns?.length)
    ? raw.possibleConcerns
    : raw.symptomsSummary
      ? [raw.symptomsSummary]
      : ['Symptoms recorded'];

  return {
    symptoms,
    duration:         raw.duration || 'As reported',
    severity,
    keyObservations:  raw.keyObservations?.length ? raw.keyObservations
                      : raw.possibleConcerns?.length ? raw.possibleConcerns
                      : [raw.symptomsSummary || 'Please consult your doctor.'],
    riskFlags:        urgency === 'urgent'
                        ? 'Urgent attention recommended based on reported symptoms.'
                        : null,
    riskLevel:        urgency === 'urgent' ? 'high' : urgency === 'priority' ? 'medium' : 'low',
    recommendedTests: raw.recommendedTests || [],
    summary:          raw.symptomsSummary || '',
    urgencyLevel:     urgency,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const { setAiReport, user } = useApp();
  const navigate    = useNavigate();
  const patientId   = user?.id || user?._id || 'guest-' + Date.now();

  const [assessmentId]   = useState(() => 'sess-' + Date.now());
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [qa, setQa]      = useState([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [textAnswer, setTextAnswer] = useState('');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [initError, setInitError]   = useState(null);

  // Image state
  const [showCamera, setShowCamera]         = useState(false);
  const [capturedImage, setCapturedImage]   = useState(null);
  const [imageAnalysis, setImageAnalysis]   = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Voice state
  const [recording, setRecording]       = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);

  // Load first question on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = await fetchFirstQuestion(patientId);
        if (!cancelled) {
          setCurrentQuestion(q);
          setLoading(false);
          speakQuestionApi(q.question);
        }
      } catch (err) {
        if (!cancelled) {
          setInitError('Could not reach AI server. Make sure ai_route is running on port 8000.\n\n' + err.message);
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Camera helpers
  const openCamera = useCallback(async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert('Camera permission denied or not available.');
      setShowCamera(false);
    }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    setCapturedImage(base64);
    closeCamera();
    setAnalyzingImage(true);
    try {
      const ctx = qa.length > 0 ? qa.map(a => `${a.question}: ${a.answer}`).join('; ') : 'Patient health assessment';
      const analysis = await analyzeImageApi(base64, 'image/jpeg', ctx);
      setImageAnalysis(analysis);
    } catch {
      setImageAnalysis({ additionalContext: 'Image captured. Analysis unavailable — photo context noted.' });
    }
    setAnalyzingImage(false);
  }, [qa, closeCamera]);

  // Voice helpers
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          setTranscribing(true);
          try {
            const text = await transcribeVoiceApi(base64, 'audio/webm');
            setTextAnswer(prev => prev ? prev + ' ' + text : text);
          } catch {
            alert('Voice transcription failed. Please type your answer.');
          }
          setTranscribing(false);
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      alert('Microphone permission denied.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  // ── MAIN SUBMIT — fixes the report-page-not-loading bug ───────────────────
  const handleSubmit = useCallback(async () => {
    const answer = textAnswer.trim();
    if (!answer || !currentQuestion || submitting || generating) return;

    setSubmitting(true);

    const newQAItem = {
      questionId: currentQuestion.questionId || `q${questionNumber + 1}`,
      question:   currentQuestion.question,
      answer,
      category:   currentQuestion.category || 'general',
    };
    const updatedQA = [...qa, newQAItem];
    setQa(updatedQA);
    setTextAnswer('');

    try {
      const result = await fetchNextQuestion(assessmentId, updatedQA, questionNumber + 1);

      if (result.done) {
        // ── Report generation ──────────────────────────────────────────────
        setSubmitting(false);
        setGenerating(true);

        const imageContext = imageAnalysis
          ? `Image Analysis: ${imageAnalysis.additionalContext || ''}. Observations: ${(imageAnalysis.visualObservations || []).join(', ')}.`
          : null;

        let reportData;
        try {
          const raw = await fetchReport(assessmentId, updatedQA, imageContext);
          reportData = normalizeReport(raw);
        } catch (reportErr) {
          console.warn('Report fetch failed, using Q&A fallback:', reportErr.message);
          // Robust fallback — build from Q&A so ReportPage always has valid data
          reportData = {
            symptoms:        updatedQA.filter(q => q.category === 'symptom').map(q => q.answer).filter(Boolean),
            duration:        updatedQA.find(q => q.category === 'duration')?.answer || 'As described',
            severity:        'Moderate',
            keyObservations: updatedQA.map(q => `${q.question}: ${q.answer}`),
            riskFlags:       null,
            riskLevel:       'low',
            recommendedTests:[],
            summary:         `Patient reported: ${updatedQA[0]?.answer || 'various symptoms'}`,
          };
        }

        // FIX: setAiReport first, then navigate in next microtask to guarantee
        // React state flush before ReportPage renders and reads aiReport from context
        setAiReport(reportData);
        setGenerating(false);
        setTimeout(() => navigate('/patient/report'), 0);

      } else {
        // ── Next question ──────────────────────────────────────────────────
        const nextQ = result.question;
        if (!nextQ || !nextQ.question) {
          throw new Error('AI returned done:false but no next question');
        }
        setCurrentQuestion(nextQ);
        setQuestionNumber(n => n + 1);
        setSubmitting(false);
        speakQuestionApi(nextQ.question);
      }

    } catch (err) {
      console.error('Assessment submit error:', err);
      setSubmitting(false);
      setGenerating(false);
      alert(`Something went wrong: ${err.message}`);
    }
  }, [textAnswer, currentQuestion, qa, questionNumber, assessmentId, imageAnalysis, submitting, generating, setAiReport, navigate]);

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) return (
    <Centered>
      <Spinner />
      <h2 style={headingStyle}>Starting AI Assessment…</h2>
      <p style={subStyle}>Connecting to AI health server</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Centered>
  );

  if (initError) return (
    <Centered>
      <div style={{ fontSize:'2.5rem', marginBottom:16 }}>⚠️</div>
      <h2 style={{ ...headingStyle, fontSize:'1.1rem' }}>AI Server Unavailable</h2>
      <p style={{ ...subStyle, maxWidth:320, marginBottom:20, whiteSpace:'pre-line' }}>{initError}</p>
      <button onClick={() => navigate('/patient')} style={backBtnStyle}>← Go Back</button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Centered>
  );

  if (generating) return (
    <Centered>
      <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#C8426D,#8B72C8)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px', animation:'spin 1.8s linear infinite' }}>
        <span style={{ fontSize:'2rem' }}>✨</span>
      </div>
      <h2 style={headingStyle}>Generating Your Report</h2>
      <p style={subStyle}>AI is analysing your responses…</p>
      <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:22 }}>
        {[0,1,2].map(i => <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:'#C8426D', animation:`pulse 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
      </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
      `}</style>
    </Centered>
  );

  if (showCamera) return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <video ref={videoRef} autoPlay playsInline style={{ width:'100%', maxWidth:480, borderRadius:12 }}/>
      <canvas ref={canvasRef} style={{ display:'none' }}/>
      <div style={{ display:'flex', gap:16, marginTop:20 }}>
        <button onClick={capturePhoto} style={{ padding:'14px 32px', borderRadius:9999, border:'none', background:'#C8426D', color:'white', fontWeight:800, fontSize:'1rem', cursor:'pointer' }}>📷 Capture</button>
        <button onClick={closeCamera}  style={{ padding:'14px 24px', borderRadius:9999, border:'2px solid white', background:'transparent', color:'white', fontWeight:700, cursor:'pointer' }}>Cancel</button>
      </div>
    </div>
  );

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FEF0F5,#F0EBFF,#FFF5EC)', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ padding:'52px 22px 18px', background:'rgba(255,255,255,0.62)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(200,66,109,0.10)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <button onClick={() => navigate('/patient')} style={iconBtnStyle}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4A3040" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
            </svg>
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:'1.15rem', color:'#3D1F2E' }}>AI Health Check</div>
            <div style={{ fontSize:'0.78rem', color:'#9A7A88' }}>Question {questionNumber + 1} · Adaptive AI Assessment</div>
          </div>
          <div style={{ background:'rgba(200,66,109,0.10)', borderRadius:9999, padding:'5px 13px', fontSize:'0.78rem', fontWeight:700, color:'#C8426D' }}>Q{questionNumber + 1}</div>
        </div>
      </div>

      <div style={{ padding:'24px 22px', flex:1, overflowY:'auto' }}>

        {/* Question card */}
        <div style={{ background:'rgba(255,255,255,0.87)', borderRadius:26, padding:'22px', marginBottom:16, backdropFilter:'blur(12px)', boxShadow:'0 4px 22px rgba(200,66,109,0.09)', border:'1px solid rgba(255,255,255,0.92)' }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#C8426D,#8B72C8)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.05rem' }}>✨</div>
            <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', fontWeight:600, color:'#3D1F2E', lineHeight:1.3, margin:0, paddingTop:4 }}>
              {currentQuestion?.question}
            </p>
          </div>
          <button onClick={() => speakQuestionApi(currentQuestion?.question)}
            style={{ marginTop:12, marginLeft:52, padding:'6px 14px', borderRadius:9999, border:'1.5px solid rgba(139,114,200,0.4)', background:'rgba(139,114,200,0.08)', color:'#8B72C8', fontSize:'0.78rem', fontWeight:700, cursor:'pointer' }}>
            🔊 Read Aloud
          </button>
        </div>

        {/* Quick chips */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
          {getQuickOptions(currentQuestion?.category).map((opt, i) => (
            <button key={opt} onClick={() => setTextAnswer(opt)} style={{
              padding:'8px 14px', borderRadius:9999,
              border: textAnswer === opt ? `2px solid ${OPT_ACCENT[i%6]}` : '1.5px solid rgba(200,66,109,0.2)',
              background: textAnswer === opt ? `${OPT_ACCENT[i%6]}15` : OPT_BG[i%6],
              color: textAnswer === opt ? OPT_ACCENT[i%6] : '#4A3040',
              fontWeight: textAnswer === opt ? 700 : 500, fontSize:'0.85rem', cursor:'pointer', transition:'all 0.15s',
            }}>{opt}</button>
          ))}
        </div>

        {/* Image capture */}
        <div style={{ background:'rgba(255,255,255,0.7)', borderRadius:18, padding:'14px 16px', marginBottom:14, border:'1.5px dashed rgba(200,66,109,0.3)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: capturedImage ? 10 : 0 }}>
            <span style={{ fontSize:'0.82rem', color:'#9A7A88', fontWeight:600 }}>📷 Optional: Capture symptom photo</span>
            <button onClick={openCamera} style={{ padding:'7px 16px', borderRadius:9999, border:'none', background:'linear-gradient(135deg,#C8426D,#E8799A)', color:'white', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>Open Camera</button>
          </div>
          {capturedImage && (
            <div style={{ marginTop:8 }}>
              <img src={`data:image/jpeg;base64,${capturedImage}`} alt="Captured" style={{ width:'100%', maxHeight:160, objectFit:'cover', borderRadius:12 }}/>
              {analyzingImage && <p style={{ color:'#C8426D', fontSize:'0.8rem', marginTop:6 }}>🔍 Analyzing image with AI…</p>}
              {imageAnalysis && !analyzingImage && (
                <div style={{ marginTop:8, background:'rgba(200,66,109,0.07)', borderRadius:10, padding:'10px 12px' }}>
                  <p style={{ margin:0, fontSize:'0.8rem', color:'#4A3040', fontWeight:600 }}>AI Image Analysis:</p>
                  <p style={{ margin:'4px 0 0', fontSize:'0.78rem', color:'#6B4A5A' }}>{imageAnalysis.additionalContext}</p>
                  {(imageAnalysis.visualObservations||[]).length > 0 && (
                    <ul style={{ margin:'6px 0 0', paddingLeft:16 }}>
                      {imageAnalysis.visualObservations.map((obs,i) => <li key={i} style={{ fontSize:'0.75rem', color:'#9A7A88' }}>{obs}</li>)}
                    </ul>
                  )}
                  <button onClick={() => { setCapturedImage(null); setImageAnalysis(null); }} style={{ marginTop:6, background:'none', border:'none', color:'#C8426D', fontSize:'0.75rem', cursor:'pointer', padding:0 }}>✕ Remove photo</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Text answer + voice */}
        <div style={{ background:'rgba(255,255,255,0.87)', borderRadius:18, padding:'14px 16px', marginBottom:8, boxShadow:'0 2px 12px rgba(200,66,109,0.07)' }}>
          <label style={{ fontSize:'0.82rem', color:'#9A7A88', fontWeight:600, display:'block', marginBottom:8 }}>Your Answer</label>
          <textarea
            value={textAnswer}
            onChange={e => setTextAnswer(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey && textAnswer.trim()) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Type your answer, tap a chip above, or use the microphone…"
            rows={3}
            style={{ width:'100%', border:'1.5px solid rgba(200,66,109,0.2)', borderRadius:12, padding:'10px 12px', fontSize:'0.95rem', fontFamily:'Nunito,sans-serif', color:'#3D1F2E', background:'transparent', resize:'none', outline:'none', boxSizing:'border-box' }}
          />
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
            <button
              onPointerDown={startRecording} onPointerUp={stopRecording} onPointerLeave={stopRecording}
              disabled={transcribing}
              style={{ padding:'9px 18px', borderRadius:9999, border:'none', background: recording ? 'linear-gradient(135deg,#E07B00,#FFA040)' : 'linear-gradient(135deg,#4CAF85,#2E8B57)', color:'white', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', boxShadow: recording ? '0 0 0 4px rgba(224,123,0,0.25)' : 'none', transition:'all 0.15s' }}>
              {recording ? '🔴 Recording… (release to stop)' : '🎙 Hold to Speak'}
            </button>
            {transcribing && <span style={{ fontSize:'0.78rem', color:'#9A7A88' }}>Transcribing…</span>}
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div style={{ padding:'0 22px 36px' }}>
        <button
          onClick={handleSubmit}
          disabled={!textAnswer.trim() || submitting || generating}
          style={{ width:'100%', padding:'15px', borderRadius:9999, border:'none', background: textAnswer.trim() && !submitting ? 'linear-gradient(135deg,#C8426D,#9E2F52)' : 'rgba(200,66,109,0.18)', color: textAnswer.trim() && !submitting ? 'white' : '#C8909C', fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:'0.95rem', cursor: textAnswer.trim() && !submitting ? 'pointer' : 'not-allowed', boxShadow: textAnswer.trim() ? '0 4px 18px rgba(200,66,109,0.35)' : 'none', transition:'all 0.22s' }}>
          {submitting ? '⏳ Getting next question…' : generating ? '✨ Generating report…' : 'Next →'}
        </button>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function getQuickOptions(category) {
  switch (category) {
    case 'symptom':      return ['Fever', 'Pain', 'Fatigue', 'Nausea', 'Headache', 'Weakness'];
    case 'duration':     return ['1-2 days', '3-5 days', '1 week', 'More than a week'];
    case 'severity':     return ['Mild', 'Moderate', 'Severe', '8 out of 10'];
    case 'history':      return ['Diabetes', 'BP', 'Anemia', 'Thyroid', 'None'];
    case 'lifestyle':    return ['Eating well', 'Poor appetite', 'No exercise', 'Stressed'];
    case 'mental_health':return ['Anxious', 'Depressed', 'Stressed', 'Feeling okay'];
    default:             return ['Yes', 'No', 'Not sure', 'Sometimes'];
  }
}

function Centered({ children }) {
  return <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FEF0F5,#F0EBFF,#FFF5EC)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>{children}</div>;
}
function Spinner() {
  return <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#C8426D,#8B72C8)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', animation:'spin 1.5s linear infinite' }}><span style={{ fontSize:'1.6rem' }}>✨</span></div>;
}

const headingStyle = { fontFamily:'Cormorant Garamond,serif', fontSize:'1.7rem', color:'#3D1F2E', marginBottom:10, textAlign:'center' };
const subStyle     = { color:'#9A7A88', fontSize:'0.9rem', textAlign:'center' };
const iconBtnStyle = { width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.82)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' };
const backBtnStyle = { padding:'12px 28px', borderRadius:9999, border:'none', background:'linear-gradient(135deg,#C8426D,#9E2F52)', color:'white', fontWeight:700, cursor:'pointer' };