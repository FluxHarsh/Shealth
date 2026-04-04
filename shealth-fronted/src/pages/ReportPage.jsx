import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Normalize AI route report format → ReportPage display format
// Handles both { symptomsSummary, urgencyLevel, possibleConcerns } (AI route)
// and { symptoms[], severity, keyObservations[] } (legacy/fallback)
function normalizeReport(raw) {
  if (!raw) return null;
  if (Array.isArray(raw.symptoms) && raw.symptoms.length) return raw;

  const urgency = raw.urgencyLevel || 'routine';
  const severityMap = { urgent: 'Severe', priority: 'Moderate', routine: 'Mild' };
  const rawSev = raw.severity || severityMap[urgency] || 'Moderate';
  const severity = rawSev.charAt(0).toUpperCase() + rawSev.slice(1).toLowerCase();

  return {
    symptoms:         raw.possibleConcerns?.length ? raw.possibleConcerns
                      : raw.symptomsSummary ? [raw.symptomsSummary] : ['Symptoms recorded'],
    duration:         raw.duration || 'As reported',
    severity,
    keyObservations:  raw.keyObservations?.length ? raw.keyObservations
                      : raw.possibleConcerns?.length ? raw.possibleConcerns
                      : [raw.symptomsSummary || 'Please consult your doctor.'],
    riskFlags:        urgency === 'urgent' ? 'Urgent attention recommended based on reported symptoms.' : null,
    riskLevel:        urgency === 'urgent' ? 'high' : urgency === 'priority' ? 'medium' : 'low',
    recommendedTests: raw.recommendedTests || [],
    summary:          raw.symptomsSummary || '',
  };
}

const SEVERITY = {
  Mild:     { color:'#4CAF85', bg:'#E8F8F2', icon:'🟢' },
  Moderate: { color:'#F0A000', bg:'#FFF3E0', icon:'🟡' },
  Severe:   { color:'#D63030', bg:'#FFE8E8', icon:'🔴' },
  mild:     { color:'#4CAF85', bg:'#E8F8F2', icon:'🟢' },
  moderate: { color:'#F0A000', bg:'#FFF3E0', icon:'🟡' },
  severe:   { color:'#D63030', bg:'#FFE8E8', icon:'🔴' },
};


const TAG_BG     = ['#F7D5E0','#D4EEF8','#D4F0E8','#FFF0D4','#EDE8F8','#FFE8D4'];
const TAG_ACCENT = ['#C8426D','#2196F3','#4CAF85','#F0A000','#8B72C8','#E07B00'];

export default function ReportPage() {
  const { aiReport } = useApp();
  const navigate     = useNavigate();

  
  const rawReport = aiReport || {
    symptoms:        ['Fatigue', 'Headache', 'Nausea', 'Joint Pain'],
    duration:        'Last 3 Days',
    severity:        'Moderate',
    severityScore:   5,
    keyObservations: [
      'Symptoms suggest a viral illness.',
      'Hydration and rest are recommended.',
      'If symptoms persist beyond 5 days, consult a doctor.',
      'Consider dietary adjustments for better recovery.',
    ],
    riskFlags:        null,
    riskLevel:        'low',
    recommendedTests: [],
    summary:          'Patient presents with moderate symptoms for 3 days.',
  };

  const report = normalizeReport(rawReport) || rawReport;

  // Ensure arrays are always arrays (guard against undefined crashes)
  const symptoms        = Array.isArray(report.symptoms)        ? report.symptoms        : ['Symptoms recorded'];
  const keyObservations = Array.isArray(report.keyObservations) ? report.keyObservations : ['Please consult a doctor.'];
  const recommendedTests= Array.isArray(report.recommendedTests)? report.recommendedTests: [];

  const sev = SEVERITY[report.severity] || SEVERITY.Moderate;

  return (
    <div style={{
      minHeight:'100vh',
      background:'#F5F0FF',
      paddingBottom:40,
    }}>

      
      <div style={{
        background:'rgba(255,255,255,0.92)',
        backdropFilter:'blur(12px)',
        padding:'52px 22px 16px',
        borderBottom:'1px solid rgba(200,66,109,0.08)',
        display:'flex', alignItems:'center', gap:12,
      }}>
        
        <button
          onClick={() => navigate('/patient')}
          style={{
            width:40, height:40, borderRadius:'50%',
            background:'rgba(255,255,255,0.82)', border:'none',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="#4A3040" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12,19 5,12 12,5"/>
          </svg>
        </button>

        <div>
          <div style={{
            fontFamily:'Cormorant Garamond,serif',
            fontWeight:700, fontSize:'1.15rem', color:'#3D1F2E',
          }}>
            Your Health Summary
          </div>
          <div style={{ fontSize:'0.73rem', color:'#9A7A88' }}>
            AI-Powered Insights for Your Wellbeing
          </div>
        </div>
      </div>

     
      <div style={{ padding:'22px 20px' }}>
        <div style={{
          background:'linear-gradient(135deg,#B8F0E0,#A0D8EF)',
          borderRadius:26, padding:'22px',
          boxShadow:'0 8px 30px rgba(0,0,0,0.09)',
          marginBottom:18, animation:'fadeUp 0.5s ease',
        }}>

         
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <span style={{ fontSize:'1.5rem' }}>✨</span>
            <h1 style={{
              fontFamily:'Cormorant Garamond,serif',
              fontSize:'1.9rem', fontWeight:700, color:'#1A3C34',
            }}>
              Your Health Summary
            </h1>
          </div>

         
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1fr',
            gap:12, marginBottom:12,
          }}>
            
            <div style={{
              background:'rgba(255,255,255,0.72)',
              borderRadius:18, padding:'14px',
            }}>
              <h3 style={{
                fontWeight:700, fontSize:'0.88rem',
                color:'#2D5A4E', marginBottom:9,
              }}>
                Symptoms
              </h3>
              
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {symptoms.map((s, i) => (
                  <span key={s} style={{
                    background: TAG_BG[i % 6],
                    color:      TAG_ACCENT[i % 6],
                    padding:'3px 9px', borderRadius:9999,
                    fontSize:'0.72rem', fontWeight:700,
                  }}>
                    • {s}
                  </span>
                ))}
              </div>
            </div>

            
            <div style={{
              background:'rgba(255,255,255,0.72)',
              borderRadius:18, padding:'14px',
            }}>
              <h3 style={{
                fontWeight:700, fontSize:'0.88rem',
                color:'#2D5A4E', marginBottom:9,
              }}>
                Severity
              </h3>
              <div style={{
                background: sev.bg,
                padding:'9px 12px', borderRadius:12,
                display:'flex', alignItems:'center', gap:7,
              }}>
                <span>{sev.icon}</span>
                <span style={{ color:sev.color, fontWeight:700, fontSize:'0.8rem' }}>
                  {report.severity} — Monitor Carefully
                </span>
              </div>
            </div>
          </div>

          
          <div style={{
            background:'rgba(255,255,255,0.72)',
            borderRadius:18, padding:'14px', marginBottom:12,
          }}>
            <h3 style={{ fontWeight:700, fontSize:'0.88rem', color:'#2D5A4E', marginBottom:7 }}>
              Duration
            </h3>
            <div style={{ display:'flex', alignItems:'center', gap:7, color:'#2D5A4E' }}>
              <span>⏱️</span>
              <span style={{ fontWeight:600 }}>{report.duration}</span>
            </div>
          </div>

         
          <div style={{
            background:'rgba(255,255,255,0.72)',
            borderRadius:18, padding:'14px',
            marginBottom: report.riskFlags ? 12 : 0,
          }}>
            <h3 style={{ fontWeight:700, fontSize:'0.88rem', color:'#2D5A4E', marginBottom:9 }}>
              Key Observations
            </h3>
            <ul style={{ margin:0, paddingLeft:17 }}>
              {keyObservations.map((obs, i) => (
                <li key={i} style={{
                  color:'#2D5A4E', fontSize:'0.82rem', marginBottom:5, lineHeight:1.5,
                }}>
                  {obs}
                </li>
              ))}
            </ul>
          </div>

          
          {report.riskFlags && report.riskFlags !== 'null' && (
            <div style={{
              background:'rgba(255,235,150,0.88)',
              borderRadius:18, padding:'14px',
              border:'1px solid rgba(240,160,0,0.38)', marginTop:12,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
                <span>⚠️</span>
                <h3 style={{ fontWeight:800, fontSize:'0.88rem', color:'#8A5C00' }}>
                  Risk Flags
                </h3>
              </div>
              <p style={{ color:'#8A5C00', fontSize:'0.82rem', lineHeight:1.5, margin:0 }}>
                <strong>High Risk:</strong> {report.riskFlags}
              </p>
            </div>
          )}
        </div>

        
        {/* ── Workflow steps ── */}
        <div style={{ marginBottom:18, animation:'fadeUp 0.5s 0.15s ease both' }}>

          {/* Step indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:18 }}>
            {['Report Ready','Save PDF','Schedule Call'].map((label, i) => (
              <React.Fragment key={i}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%',
                    background: i === 0 ? 'linear-gradient(135deg,#4CAF85,#2E8B57)'
                               : i === 1 ? 'linear-gradient(135deg,#C8426D,#9E2F52)'
                               : 'linear-gradient(135deg,#8B72C8,#6B52A8)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'white', fontSize:'0.72rem', fontWeight:800,
                    boxShadow: i === 0 ? '0 3px 10px rgba(76,175,133,0.4)'
                              : i === 1 ? '0 3px 10px rgba(200,66,109,0.4)'
                              : '0 3px 10px rgba(139,114,200,0.4)',
                  }}>{i + 1}</div>
                  <span style={{ fontSize:'0.62rem', color:'#9A7A88', fontWeight:600, marginTop:4, textAlign:'center' }}>{label}</span>
                </div>
                {i < 2 && (
                  <div style={{ flex:0.5, height:2, background:'rgba(200,66,109,0.18)', marginBottom:14 }}/>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1 already done — report shown above */}
          <div style={{
            display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
            borderRadius:14, background:'rgba(76,175,133,0.10)',
            border:'1.5px solid rgba(76,175,133,0.3)', marginBottom:10,
          }}>
            <span style={{ fontSize:'1.2rem' }}>✅</span>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.85rem', color:'#2D5A4E' }}>AI Health Report Generated</div>
              <div style={{ fontSize:'0.74rem', color:'#6B9E8A' }}>Your summary is ready for your doctor</div>
            </div>
          </div>

          {/* Step 2 — Download PDF */}
          <button
            onClick={() => {
              // Build a simple printable page from report data
              const content = `
                <html><head><title>Health Report</title>
                <style>body{font-family:sans-serif;padding:32px;color:#2D2D2D}
                h1{color:#C8426D}h2{color:#3D1F2E;font-size:1rem;margin-top:20px}
                .tag{display:inline-block;background:#F7D5E0;color:#C8426D;padding:3px 10px;border-radius:20px;margin:3px;font-size:0.85rem}
                ul{padding-left:20px}li{margin-bottom:6px;font-size:0.9rem}
                .sev{padding:8px 14px;border-radius:8px;display:inline-block;margin-top:4px;font-weight:700}
                </style></head><body>
                <h1>✨ Your Health Summary</h1>
                <p style="color:#9A7A88;font-size:0.85rem">Generated by SHEALTH AI · ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
                <h2>Symptoms</h2>
                <div>${(report.symptoms||[]).map(s=>`<span class="tag">${s}</span>`).join('')}</div>
                <h2>Severity</h2>
                <div class="sev" style="background:${sev.bg};color:${sev.color}">${sev.icon} ${report.severity} — Monitor Carefully</div>
                <h2>Duration</h2><p>⏱ ${report.duration}</p>
                <h2>Key Observations</h2>
                <ul>${(report.keyObservations||[]).map(o=>`<li>${o}</li>`).join('')}</ul>
                ${report.riskFlags && report.riskFlags!=='null' ? `<h2 style="color:#D63030">⚠️ Risk Flags</h2><p style="color:#8A5C00">${report.riskFlags}</p>` : ''}
                <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
                <p style="font-size:0.75rem;color:#9A7A88">This report is a pre-consultation AI summary and does not constitute a medical diagnosis. Please consult a qualified doctor.</p>
                </body></html>`;
              const blob = new Blob([content], { type: 'text/html' });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement('a');
              a.href     = url;
              a.download = `shealth-report-${Date.now()}.html`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              width:'100%', padding:'15px', borderRadius:14, border:'none',
              background:'linear-gradient(135deg,#C8426D,#9E2F52)',
              color:'white', fontFamily:'Nunito,sans-serif',
              fontWeight:800, fontSize:'0.95rem',
              cursor:'pointer', boxShadow:'0 4px 18px rgba(200,66,109,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:9,
              marginBottom:10,
            }}
          >
            📄 Download PDF Report
          </button>

          {/* Step 3 — Schedule video call */}
          <button
            onClick={() => navigate('/patient/video-call')}
            style={{
              width:'100%', padding:'15px', borderRadius:14, border:'none',
              background:'linear-gradient(135deg,#8B72C8,#6B52A8)',
              color:'white', fontFamily:'Nunito,sans-serif',
              fontWeight:800, fontSize:'0.95rem',
              cursor:'pointer', boxShadow:'0 4px 18px rgba(139,114,200,0.38)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:9,
              marginBottom:10,
            }}
          >
            📅 Schedule Video Consultation
          </button>

          <p style={{ textAlign:'center', color:'#9A7A88', fontSize:'0.76rem', marginBottom:6 }}>
            Doctor will receive your AI report before the call
          </p>
        </div>

        {recommendedTests.length > 0 && (
          <button
            onClick={() => navigate('/patient/diagnostics')}
            style={{
              width:'100%', padding:'15px', borderRadius:14,
              border:'2px solid rgba(200,66,109,0.3)', background:'transparent',
              color:'#C8426D', fontFamily:'Nunito,sans-serif',
              fontWeight:700, fontSize:'0.95rem',
              cursor:'pointer', transition:'all 0.2s ease',
              animation:'fadeUp 0.5s 0.3s ease both',
            }}
          >
            🔬 Order Diagnostics
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
      `}</style>
    </div>
  );
}