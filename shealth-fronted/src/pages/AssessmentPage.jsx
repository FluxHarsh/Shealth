import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { QUESTIONS, generateReport } from '../services/data';


const OPT_BG      = ['#F7D5E0','#D4EEF8','#D4F0E8','#FFF0D4','#EDE8F8','#FFE8D4'];
const OPT_ACCENT  = ['#C8426D','#2196F3','#4CAF85','#F0A000','#8B72C8','#E07B00'];

export default function AssessmentPage() {
  const { setAiReport } = useApp();
  const navigate        = useNavigate();

  // ── State ─────────────────────────────────────────────────
  const [step,      setStep]      = useState(0);       
  const [answers,   setAnswers]   = useState([]);       
  const [selected,  setSelected]  = useState([]);       
  const [loading,   setLoading]   = useState(false);    

  const q         = QUESTIONS[step];                    
  const total     = QUESTIONS.length;                   
  const progress  = (step / total) * 100;               

  
  const toggleOption = (opt) => {
    if (q.type === 'multi') {
      
      setSelected(prev =>
        prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
      );
    } else {
      
      setSelected([opt]);
    }
  };

  
  const handleNext = async () => {
    
    const ans        = q.type === 'multi' ? selected : selected[0];
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);
    setSelected([]);

    if (step < total - 1) {
      
      setStep(step + 1);
    } else {
    
      setLoading(true);
      const report = await generateReport(newAnswers);
      setAiReport(report);    
      setLoading(false);
      navigate('/patient/report');
    }
  };

  
  const handleBack = () => {
    if (step === 0) {
      navigate('/patient');   
    } else {
      setStep(step - 1);
      setSelected([]);
    }
  };

  
  if (loading) {
    return (
      <div style={{
        minHeight:'100vh',
        background:'linear-gradient(160deg,#FEF0F5,#F0EBFF,#FFF5EC)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:24,
      }}>
        <div style={{ textAlign:'center', animation:'fadeIn 0.5s ease' }}>
          
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background:'linear-gradient(135deg,#C8426D,#8B72C8)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 22px',
            animation:'spin 1.8s linear infinite',
          }}>
            <span style={{ fontSize:'2rem' }}>✨</span>
          </div>

          <h2 style={{
            fontFamily:'Cormorant Garamond,serif',
            fontSize:'1.9rem', color:'#3D1F2E', marginBottom:10,
          }}>
            Generating Your Report
          </h2>
          <p style={{ color:'#9A7A88', fontSize:'0.92rem', lineHeight:1.6 }}>
            Our AI is analysing your responses<br />
            and preparing a summary for your doctor…
          </p>

          
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:28 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:10, height:10, borderRadius:'50%', background:'#C8426D',
                animation:`pulse 1.2s ${i*0.2}s ease-in-out infinite`,
              }}/>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes spin  { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
          @keyframes fadeIn{ from{opacity:0} to{opacity:1} }
        `}</style>
      </div>
    );
  }

  
  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg,#FEF0F5,#F0EBFF,#FFF5EC)',
      display:'flex', flexDirection:'column',
    }}>

      
      <div style={{
        padding:'52px 22px 18px',
        background:'rgba(255,255,255,0.62)',
        backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(200,66,109,0.10)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
         
          <button
            onClick={handleBack}
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

          
          <div style={{ flex:1 }}>
            <div style={{
              fontFamily:'Cormorant Garamond,serif',
              fontWeight:700, fontSize:'1.15rem', color:'#3D1F2E',
            }}>
              AI Health Check
            </div>
            <div style={{ fontSize:'0.78rem', color:'#9A7A88' }}>
              {step + 1} of {total} steps
            </div>
          </div>

          
          <div style={{
            background:'rgba(200,66,109,0.10)',
            borderRadius:9999, padding:'5px 13px',
            fontSize:'0.78rem', fontWeight:700, color:'#C8426D',
          }}>
            {Math.round(((step + 1) / total) * 100)}%
          </div>
        </div>

       
        <div style={{
          background:'rgba(200,66,109,0.12)',
          borderRadius:9999, height:6,
        }}>
          <div style={{
            height:'100%', borderRadius:9999,
            background:'linear-gradient(90deg,#C8426D,#E8799A)',
            width:`${progress}%`,
            transition:'width 0.4s ease',
            boxShadow:'0 2px 6px rgba(200,66,109,0.38)',
          }}/>
        </div>
      </div>

     
      <div style={{ padding:'28px 22px', flex:1, animation:'fadeUp 0.4s ease' }}>
        <div style={{
          background:'rgba(255,255,255,0.87)',
          borderRadius:26, padding:'26px 22px', marginBottom:22,
          backdropFilter:'blur(12px)',
          boxShadow:'0 4px 22px rgba(200,66,109,0.09)',
          border:'1px solid rgba(255,255,255,0.92)',
        }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
            
            <div style={{
              width:40, height:40, borderRadius:'50%',
              background:'linear-gradient(135deg,#C8426D,#8B72C8)',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, fontSize:'1.05rem',
            }}>
              ✨
            </div>
            
            <p style={{
              fontFamily:'Cormorant Garamond,serif',
              fontSize:'1.45rem', fontWeight:600, color:'#3D1F2E',
              lineHeight:1.3, margin:0, paddingTop:4,
            }}>
              {q.q}
            </p>
          </div>

         
          {q.type === 'multi' && (
            <p style={{
              color:'#9A7A88', fontSize:'0.77rem',
              marginTop:10, paddingLeft:52,
            }}>
              Select all that apply
            </p>
          )}
        </div>

        
        <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
          {q.opts.map((opt, i) => {
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleOption(opt)}
                style={{
                  padding:'17px 18px',
                  borderRadius:18,
                  border: isSelected
                    ? `2px solid ${OPT_ACCENT[i % 6]}`
                    : '2px solid transparent',
                  background: isSelected
                    ? `${OPT_ACCENT[i % 6]}18`
                    : OPT_BG[i % 6],
                  cursor:'pointer', textAlign:'left',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  transition:'all 0.2s ease',
                  transform:  isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow:  isSelected ? `0 4px 14px ${OPT_ACCENT[i % 6]}28` : 'none',
                  animation:  `fadeUp 0.4s ${i * 0.05}s ease both`,
                }}
              >
                <span style={{
                  fontFamily:'Nunito,sans-serif',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize:'0.95rem',
                  color: isSelected ? OPT_ACCENT[i % 6] : '#4A3040',
                }}>
                  {opt}
                </span>
               
                {isSelected && (
                  <div style={{
                    width:24, height:24, borderRadius:'50%',
                    background: OPT_ACCENT[i % 6],
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      
      <div style={{ padding:'0 22px 36px', display:'flex', gap:11 }}>
        {step > 0 && (
          <button
            onClick={() => { setStep(step - 1); setSelected([]); }}
            style={{
              flex:1, padding:'15px', borderRadius:9999,
              border:'2px solid rgba(200,66,109,0.25)', background:'transparent',
              color:'#C8426D', fontFamily:'Nunito,sans-serif',
              fontWeight:700, fontSize:'0.95rem', cursor:'pointer',
            }}
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={selected.length === 0}
          style={{
            flex:2, padding:'15px', borderRadius:9999, border:'none',
            background: selected.length > 0
              ? 'linear-gradient(135deg,#C8426D,#9E2F52)'
              : 'rgba(200,66,109,0.18)',
            color:  selected.length > 0 ? 'white' : '#C8909C',
            fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:'0.95rem',
            cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
            boxShadow: selected.length > 0 ? '0 4px 18px rgba(200,66,109,0.35)' : 'none',
            transition:'all 0.22s ease',
          }}
        >
          {step === total - 1 ? '✨ Generate Report' : 'Next →'}
        </button>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0);    }
        }
      `}</style>
    </div>
  );
}
