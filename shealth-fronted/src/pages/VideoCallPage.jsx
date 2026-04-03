import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';


const SLOTS = [
  '7:00 AM – 9:00 AM',
  '9:00 AM – 11:00 AM',
  '4:00 PM – 6:00 PM',
  '6:00 PM – 8:00 PM',
];


function DiagnosticsSection({ onDone }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmed,    setConfirmed]    = useState(false);

  
  if (confirmed) {
    return (
      <div style={{
        minHeight:'100vh',
        background:'linear-gradient(160deg,#E8F8F2,#FEF0F5)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:24,
      }}>
        <div style={{ textAlign:'center', animation:'scaleIn 0.5s ease' }}>
          <div style={{ fontSize:'3.8rem', marginBottom:18 }}>✅</div>
          <h2 style={{
            fontFamily:'Cormorant Garamond,serif',
            fontSize:'2rem', color:'#3D1F2E', marginBottom:10,
          }}>
            Pickup Scheduled!
          </h2>
          <p style={{ color:'#9A7A88', fontSize:'0.9rem', marginBottom:8 }}>
            Your sample pickup is confirmed for
          </p>
         
          <div style={{
            background:'rgba(255,255,255,0.92)', borderRadius:18,
            padding:'12px 22px', display:'inline-block',
            marginBottom:24, boxShadow:'0 4px 18px rgba(0,0,0,0.07)',
          }}>
            <strong style={{ color:'#C8426D', fontSize:'0.96rem' }}>
              {selectedSlot}
            </strong>
          </div>
          <p style={{ color:'#9A7A88', fontSize:'0.82rem', marginBottom:28 }}>
            Our EV will come to your doorstep 🛻<br />
            You'll receive a notification before pickup.
          </p>
          <button
            onClick={onDone}
            style={{
              width:'100%', maxWidth:280, padding:'15px',
              borderRadius:9999, border:'none',
              background:'linear-gradient(135deg,#C8426D,#9E2F52)',
              color:'white', fontFamily:'Nunito,sans-serif',
              fontWeight:800, fontSize:'0.96rem', cursor:'pointer',
              boxShadow:'0 4px 18px rgba(200,66,109,0.4)',
            }}
          >
            Back to Home
          </button>
        </div>

        <style>{`
          @keyframes scaleIn { from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)} }
        `}</style>
      </div>
    );
  }

  
  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg,#FFF5EE,#FEF0F5)',
      paddingBottom:40,
    }}>

     
      <div style={{
        background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)',
        padding:'52px 22px 16px',
        borderBottom:'1px solid rgba(200,66,109,0.08)',
      }}>
        <div style={{
          fontFamily:'Cormorant Garamond,serif',
          fontWeight:700, fontSize:'1.15rem', color:'#3D1F2E',
        }}>
          Doctor Recommendation
        </div>
      </div>

      <div style={{ padding:'22px 20px' }}>

       
        <div style={{ textAlign:'center', marginBottom:22, animation:'fadeUp 0.5s ease' }}>
          <div style={{
            width:76, height:76, borderRadius:'50%',
            background:'linear-gradient(135deg,#FFCBA4,#FF8A65)',
            margin:'0 auto 12px',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2.4rem', position:'relative',
            boxShadow:'0 4px 18px rgba(255,138,101,0.4)',
          }}>
            👩‍⚕️
          
            <div style={{
              position:'absolute', bottom:2, right:2,
              width:22, height:22, borderRadius:'50%',
              background:'#4CAF85', border:'2px solid white',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="3">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </div>
          <h2 style={{
            fontFamily:'Cormorant Garamond,serif',
            fontSize:'1.55rem', color:'#C8426D',
          }}>
            Doctor Recommendation
          </h2>
        </div>

       
        <div style={{
          background:'rgba(255,255,255,0.92)', borderRadius:22,
          padding:'18px', marginBottom:18,
          boxShadow:'0 4px 18px rgba(0,0,0,0.07)',
          animation:'fadeUp 0.5s 0.1s ease both',
        }}>
          <h3 style={{ fontWeight:800, fontSize:'1.05rem', color:'#3D1F2E', marginBottom:7 }}>
            Complete Blood Count (CBC)
          </h3>
          <p style={{ color:'#9A7A88', fontSize:'0.87rem', lineHeight:1.5 }}>
            To assess overall health and detect a variety of disorders.
          </p>
        </div>

       
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:18 }}>

          
          <div style={{
            background:'rgba(201,184,232,0.28)',
            borderRadius:22, padding:'18px',
            border:'2px solid rgba(201,184,232,0.55)',
          }}>
            <div style={{ display:'flex', gap:9, alignItems:'center', marginBottom:11 }}>
              <div style={{ fontSize:'1.4rem' }}>🛻</div>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.85rem', color:'#3D1F2E' }}>
                  Schedule Pickup
                </div>
                <div style={{ fontSize:'0.72rem', color:'#9A7A88' }}>
                  Home collection via EV
                </div>
              </div>
            </div>

           
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {SLOTS.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding:'9px 12px', borderRadius:12,
                    border: selectedSlot === slot
                      ? '2px solid #8B72C8'
                      : '2px solid rgba(139,114,200,0.22)',
                    background: selectedSlot === slot
                      ? 'rgba(139,114,200,0.16)'
                      : 'rgba(255,255,255,0.72)',
                    color:  selectedSlot === slot ? '#8B72C8' : '#4A3040',
                    fontFamily:'Nunito,sans-serif',
                    fontSize:'0.77rem', fontWeight:700,
                    cursor:'pointer', transition:'all 0.18s ease', textAlign:'left',
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

        
          <div
            onClick={onDone}
            style={{
              background:'rgba(168,230,207,0.28)',
              borderRadius:22, padding:'18px',
              border:'2px solid rgba(168,230,207,0.55)',
              cursor:'pointer',
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:10,
            }}
          >
            <div style={{ fontSize:'1.7rem' }}>📅</div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:700, fontSize:'0.87rem', color:'#3D1F2E', marginBottom:3 }}>
                Skip for Now
              </div>
              <div style={{ fontSize:'0.72rem', color:'#9A7A88' }}>
                Review at a later date
              </div>
            </div>
          </div>
        </div>

       
        <button
          onClick={() => selectedSlot && setConfirmed(true)}
          disabled={!selectedSlot}
          style={{
            width:'100%', padding:'17px', borderRadius:9999, border:'none',
            background: selectedSlot
              ? 'linear-gradient(135deg,#C8426D,#9E2F52)'
              : 'rgba(200,66,109,0.18)',
            color:  selectedSlot ? 'white' : '#C8909C',
            fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:'1rem',
            cursor: selectedSlot ? 'pointer' : 'not-allowed',
            boxShadow: selectedSlot ? '0 6px 22px rgba(200,66,109,0.4)' : 'none',
            transition:'all 0.22s ease',
            animation:'fadeUp 0.5s 0.2s ease both',
          }}
        >
          Confirm Pickup
        </button>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}


function VideoSection({ onCallEnd }) {
  const { aiReport } = useApp();

  
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);

  
  const [muted,      setMuted]      = useState(false);
  const [camOff,     setCamOff]     = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [chatOpen,   setChatOpen]   = useState(false);
  const [chatMsg,    setChatMsg]    = useState('');
  const [chatLog,    setChatLog]    = useState([
    { from:'Doctor', text:'Hello! I have reviewed your AI report. How are you feeling?' },
  ]);
  const [callState, setCallState]   = useState('connecting'); 
  const [elapsed,   setElapsed]     = useState(0);

  
  const streamRef = useRef(null);

  
  useEffect(() => {
    let timer;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;   
        }
        
        setTimeout(() => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
          setCallState('live');
        }, 2000);
      } catch {
        
        setCallState('live');
      }
    })();

    
    timer = setInterval(() => setElapsed(s => s + 1), 1000);

    
    return () => {
      clearInterval(timer);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  
  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = muted; });
    setMuted(m => !m);
  };

  
  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = camOff; });
    setCamOff(c => !c);
  };

  
  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatLog(l => [...l, { from:'You', text:chatMsg }]);
    setChatMsg('');
  };

  
  const fmt = s =>
    `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  return (
    <div style={{
      minHeight:'100vh',
      background:'#2A1020',
      display:'flex', flexDirection:'column',
    }}>

     
      <div style={{
        padding:'48px 20px 12px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{
            width:30, height:30, borderRadius:'50%',
            background:'linear-gradient(135deg,#C8426D,#E8799A)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
          </div>
          <span style={{
            fontFamily:'Cormorant Garamond,serif', fontWeight:700,
            fontSize:'0.95rem', color:'rgba(255,255,255,0.85)',
          }}>
            SHEALTH
          </span>
        </div>

        
        <div style={{ textAlign:'center' }}>
          <div style={{ color:'white', fontWeight:700, fontSize:'0.88rem' }}>
            Video Consultation
          </div>
          {callState === 'live' && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
              <div style={{
                width:7, height:7, borderRadius:'50%', background:'#4CAF85',
                animation:'pulse 1.5s infinite',
              }}/>
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.72rem' }}>
                Live · {fmt(elapsed)}
              </span>
            </div>
          )}
          {callState === 'connecting' && (
            <span style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.72rem' }}>
              Connecting…
            </span>
          )}
        </div>

        <div style={{ width:36 }} /> 
      </div>

      
      <div style={{ padding:'0 16px', flex:1, display:'flex', flexDirection:'column', gap:9 }}>

       
        <div style={{
          position:'relative', borderRadius:22, overflow:'hidden',
          background:'linear-gradient(135deg,#4A1F3A,#2A1020)',
          flex:1, minHeight:260,
          boxShadow:'0 8px 38px rgba(0,0,0,0.5)',
        }}>
          
          <video ref={remoteVideoRef} autoPlay playsInline style={{
            width:'100%', height:'100%', objectFit:'cover',
            display: callState === 'live' ? 'block' : 'none',
          }}/>

         
          {callState !== 'live' && (
            <div style={{
              position:'absolute', inset:0,
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
            }}>
              <div style={{ fontSize:'2.8rem', marginBottom:10, animation:'pulse 1.5s infinite' }}>
                👩‍⚕️
              </div>
              <div style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.87rem' }}>
                Connecting to doctor…
              </div>
             
              <div style={{ display:'flex', gap:6, marginTop:10 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:8, height:8, borderRadius:'50%',
                    background:'rgba(255,255,255,0.45)',
                    animation:`bounce 1s ${i*0.15}s infinite`,
                  }}/>
                ))}
              </div>
            </div>
          )}

         
          <div style={{
            position:'absolute', bottom:12, left:12,
            background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)',
            borderRadius:9, padding:'5px 11px', pointerEvents:'none',
          }}>
            <div style={{ color:'white', fontWeight:700, fontSize:'0.80rem' }}>
              Dr. Meera Sharma
            </div>
            <div style={{ color:'rgba(255,255,255,0.62)', fontSize:'0.68rem' }}>
              Gynaecologist
            </div>
          </div>

          
          <div style={{
            position:'absolute', bottom:12, right:12,
            width:86, height:115, borderRadius:13, overflow:'hidden',
            border:'2px solid rgba(255,255,255,0.25)',
            boxShadow:'0 4px 14px rgba(0,0,0,0.4)',
            background:'#3D1F2E',
          }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{
              width:'100%', height:'100%', objectFit:'cover',
              display: !camOff ? 'block' : 'none',
            }}/>
            {camOff && (
              <div style={{
                width:'100%', height:'100%',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <span style={{ fontSize:'1.7rem' }}>👤</span>
              </div>
            )}
          </div>
        </div>

        
        <button
          onClick={() => setShowReport(s => !s)}
          style={{
            width:'100%', padding:'12px 16px',
            background:'rgba(255,255,255,0.09)', backdropFilter:'blur(10px)',
            border:'1px solid rgba(255,255,255,0.15)', borderRadius:15,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            cursor:'pointer', color:'white',
            fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:'0.86rem',
          }}
        >
          <span>📋 AI Report {showReport ? '(Expanded)' : '(Collapsed)'}</span>
          <span style={{ opacity:0.6 }}>{showReport ? '▲' : '▼'}</span>
        </button>

       
        {showReport && aiReport && (
          <div style={{
            background:'rgba(255,255,255,0.09)', backdropFilter:'blur(12px)',
            borderRadius:14, padding:'13px 15px',
            border:'1px solid rgba(255,255,255,0.12)',
            animation:'fadeUp 0.3s ease',
          }}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:7 }}>
              {aiReport.symptoms?.map(s => (
                <span key={s} style={{
                  background:'rgba(200,66,109,0.3)', color:'#FFB0C8',
                  padding:'3px 9px', borderRadius:9999,
                  fontSize:'0.73rem', fontWeight:600,
                }}>
                  {s}
                </span>
              ))}
            </div>
            <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'0.80rem', margin:0, lineHeight:1.5 }}>
              {aiReport.summary}
            </p>
          </div>
        )}

        
        {chatOpen && (
          <div style={{
            background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)',
            borderRadius:14, overflow:'hidden',
            border:'1px solid rgba(255,255,255,0.10)',
            animation:'fadeUp 0.3s ease',
          }}>
            
            <div style={{
              padding:'10px 13px', maxHeight:130,
              overflowY:'auto', display:'flex', flexDirection:'column', gap:7,
            }}>
              {chatLog.map((m, i) => (
                <div key={i} style={{ alignSelf: m.from === 'You' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.4)', marginBottom:2 }}>
                    {m.from}
                  </div>
                  <div style={{
                    background: m.from === 'You'
                      ? 'linear-gradient(135deg,#C8426D,#9E2F52)'
                      : 'rgba(255,255,255,0.16)',
                    color:'white', padding:'7px 11px',
                    borderRadius:11, fontSize:'0.80rem', maxWidth:200,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              display:'flex', gap:7, padding:'7px 11px',
              borderTop:'1px solid rgba(255,255,255,0.08)',
            }}>
              <input
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Type a message…"
                style={{
                  flex:1, background:'rgba(255,255,255,0.10)', border:'none',
                  borderRadius:9999, padding:'7px 13px',
                  color:'white', fontFamily:'Nunito,sans-serif',
                  fontSize:'0.83rem', outline:'none',
                }}
              />
              <button
                onClick={sendChat}
                style={{
                  width:34, height:34, borderRadius:'50%',
                  background:'#C8426D', border:'none',
                  color:'white', cursor:'pointer', fontSize:'0.95rem',
                }}
              >
                ↑
              </button>
            </div>
          </div>
        )}

      
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center',
          gap:13, paddingBottom:28,
        }}>
          
          <CtrlBtn icon={muted ? '🔇' : '🎙️'} label={muted ? 'Unmute' : 'Mute'}
            active={muted} onClick={toggleMic} />
          
          <CtrlBtn icon={camOff ? '📵' : '📷'} label="Camera"
            active={camOff} onClick={toggleCam} />
         
          <CtrlBtn icon="💬" label="Chat"
            active={chatOpen} onClick={() => setChatOpen(c => !c)} />
         
          <button
            onClick={onCallEnd}
            style={{
              width:62, height:62, borderRadius:'50%',
              background:'linear-gradient(135deg,#D63030,#A00)',
              border:'none', fontSize:'1.5rem', cursor:'pointer',
              boxShadow:'0 4px 18px rgba(214,48,48,0.58)',
              transition:'transform 0.15s ease',
            }}
            onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1)';    }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    }}
          >
            📵
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}


function CtrlBtn({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width:52, height:52, borderRadius:'50%', border:'none',
        background: active
          ? 'rgba(200,66,109,0.38)'
          : 'rgba(255,255,255,0.13)',
        backdropFilter:'blur(8px)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        cursor:'pointer', fontSize:'1.2rem', gap:2,
        transition:'all 0.18s ease',
        boxShadow: active ? '0 0 0 2px rgba(200,66,109,0.5)' : 'none',
      }}
    >
      {icon}
      <span style={{
        color:'rgba(255,255,255,0.52)',
        fontSize:'0.54rem', fontFamily:'Nunito,sans-serif', fontWeight:700,
      }}>
        {label}
      </span>
    </button>
  );
}


export default function VideoCallPage({ startOnDiagnostics = false }) {
  const navigate = useNavigate();

  
  const [showDiagnostics, setShowDiagnostics] = useState(startOnDiagnostics);

  
  const handleCallEnd = () => setShowDiagnostics(true);

  
  const handleDone = () => navigate('/patient');

  if (showDiagnostics) {
    return <DiagnosticsSection onDone={handleDone} />;
  }

  return <VideoSection onCallEnd={handleCallEnd} />;
}
