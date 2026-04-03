import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';


const SEVERITY = {
  Mild:     { color:'#4CAF85', bg:'#E8F8F2', icon:'🟢' },
  Moderate: { color:'#F0A000', bg:'#FFF3E0', icon:'🟡' },
  Severe:   { color:'#D63030', bg:'#FFE8E8', icon:'🔴' },
};


const TAG_BG     = ['#F7D5E0','#D4EEF8','#D4F0E8','#FFF0D4','#EDE8F8','#FFE8D4'];
const TAG_ACCENT = ['#C8426D','#2196F3','#4CAF85','#F0A000','#8B72C8','#E07B00'];

export default function ReportPage() {
  const { aiReport } = useApp();
  const navigate     = useNavigate();

  
  const report = aiReport || {
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
                {report.symptoms.map((s, i) => (
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
              {report.keyObservations.map((obs, i) => (
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

        
        <button
          onClick={() => navigate('/patient/video-call')}
          style={{
            width:'100%', padding:'17px', borderRadius:9999, border:'none',
            background:'linear-gradient(135deg,#8B72C8,#C8426D)',
            color:'white', fontFamily:'Nunito,sans-serif',
            fontWeight:800, fontSize:'1rem',
            cursor:'pointer', boxShadow:'0 6px 22px rgba(139,114,200,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            marginBottom:10, transition:'all 0.22s ease',
            animation:'fadeUp 0.5s 0.2s ease both',
          }}
        >
          🎥 Start Video Consultation
        </button>

        <p style={{ textAlign:'center', color:'#9A7A88', fontSize:'0.78rem', marginBottom:14 }}>
          Connect with a rural healthcare specialist. Available 24/7.
        </p>

        
        {report.recommendedTests?.length > 0 && (
          <button
            onClick={() => navigate('/patient/diagnostics')}
            style={{
              width:'100%', padding:'15px', borderRadius:9999,
              border:'2px solid rgba(200,66,109,0.3)', background:'transparent',
              color:'#C8426D', fontFamily:'Nunito,sans-serif',
              fontWeight:700, fontSize:'0.95rem',
              cursor:'pointer', transition:'all 0.2s ease',
              animation:'fadeUp 0.5s 0.3s ease both',
            }}
          >
            Order Diagnostics
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
