import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MOCK } from '../services/data';

// ── Urgency level → colors ────────────────────────────────────
const URGENCY = {
  urgent:   { label:'URGENT',   border:'#D63030', tag:'#FFE8E8', tagText:'#D63030' },
  priority: { label:'PRIORITY', border:'#E07B00', tag:'#FFF3E0', tagText:'#E07B00' },
  routine:  { label:'ROUTINE',  border:'#4CAF85', tag:'#E8F8F2', tagText:'#4CAF85' },
};

// ── Doctor bottom nav tabs ────────────────────────────────────
function DoctorBottomNav({ active, onSelect, navigate }) {
  const tabs = [
    { id:'queue',    emoji:'📋', label:'Queue',    path:'/doctor'          },
    { id:'patients', emoji:'👩', label:'Patients', path:'/doctor'          },
    { id:'reports',  emoji:'📊', label:'Reports',  path:'/doctor'          },
    { id:'profile',  emoji:'👤', label:'Profile',  path:'/doctor/profile'  },
  ];
  return (
    <div className="bottom-nav">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => { onSelect(t.id); navigate(t.path); }}
          style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            padding:'8px 14px', borderRadius:14, border:'none',
            background: active === t.id ? 'rgba(200,66,109,0.10)' : 'transparent',
            color:      active === t.id ? '#C8426D'               : '#9A7A88',
            cursor:'pointer', transition:'all 0.2s ease',
            fontFamily:'Nunito,sans-serif', fontSize:'0.68rem', fontWeight:700,
          }}
        >
          <span style={{ fontSize:'1.15rem' }}>{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Export so DoctorVideoCall + PrescribePage can reuse it
export { DoctorBottomNav };

export default function DoctorPortal() {
  const { user } = useApp();
  const navigate  = useNavigate();
  const [activeTab, setActiveTab] = useState('queue');
  const [online,    setOnline]    = useState(true);

  const { specialty, queue } = MOCK.doctor;
  const name = user?.name || MOCK.doctor.name;

  return (
    <div style={{
      minHeight:'100vh',
      // Peach-warm background — distinct from patient (rose) and WHF (mint)
      background:'linear-gradient(160deg,#FFF8F0 0%,#FFF0F5 50%,#FFF8F0 100%)',
      paddingBottom:90,
    }}>

      {/* ── Header ── */}
      <div style={{
        background:'rgba(255,255,255,0.92)', backdropFilter:'blur(16px)',
        padding:'52px 22px 18px',
        borderBottom:'1px solid rgba(200,66,109,0.10)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{
            width:34, height:34,
            background:'linear-gradient(135deg,#C8426D,#E8799A)',
            borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
          </div>
          <span style={{
            fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:'1.1rem',
            background:'linear-gradient(135deg,#C8426D,#9E2F52)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>
            SHEALTH
          </span>
        </div>

        {/* Doctor info + online toggle */}
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#3D1F2E' }}>
              Dr. {name}
            </div>
            <div style={{ fontSize:'0.70rem', color:'#9A7A88' }}>{specialty}</div>
          </div>

          {/* Online/Offline toggle pill */}
          <div
            onClick={() => setOnline(o => !o)}
            style={{
              display:'flex', alignItems:'center', gap:5,
              background: online ? '#E8F8F2' : '#F5F5F5',
              borderRadius:9999, padding:'5px 11px', cursor:'pointer',
              border:`1px solid ${online ? '#4CAF85' : '#ccc'}`,
              transition:'all 0.22s ease',
            }}
          >
            <div style={{
              width:8, height:8, borderRadius:'50%',
              background: online ? '#4CAF85' : '#aaa',
              transition:'background 0.2s',
            }}/>
            <span style={{
              fontSize:'0.73rem', fontWeight:700,
              color: online ? '#4CAF85' : '#aaa',
            }}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Doctor avatar */}
          <div style={{
            width:40, height:40, borderRadius:'50%',
            background:'linear-gradient(135deg,#FFCBA4,#FF8A65)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.3rem', boxShadow:'0 2px 10px rgba(255,138,101,0.4)',
          }}>
            👩‍⚕️
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ padding:'18px 20px 0', animation:'fadeUp 0.4s ease' }}>
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
          gap:10, marginBottom:22,
        }}>
          {[
            { icon:'⏱️', label:`Queue – ${MOCK.doctor.queue.length}` },
            { icon:'✅', label:`Completed – 8` },
            { icon:'⏳', label:`Avg. wait – 12 min` },
          ].map((s, i) => (
            <div key={i} style={{
              background:'rgba(255,255,255,0.87)',
              borderRadius:18, padding:'13px 10px',
              textAlign:'center',
              boxShadow:'0 2px 9px rgba(0,0,0,0.055)',
              border:'1px solid rgba(200,66,109,0.07)',
              animation:`fadeUp 0.4s ${i * 0.07}s ease both`,
            }}>
              <div style={{ fontSize:'1.25rem', marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontWeight:700, fontSize:'0.78rem', color:'#4A3040' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Patient queue cards ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          {queue.map((p, i) => {
            const u = URGENCY[p.urgency];
            return (
              <div
                key={p.id}
                style={{
                  background:'rgba(255,255,255,0.92)',
                  borderRadius:22, padding:'17px',
                  // left border color shows urgency level
                  borderLeft:`4px solid ${u.border}`,
                  boxShadow:'0 2px 13px rgba(0,0,0,0.07)',
                  animation:`fadeUp 0.4s ${i * 0.07}s ease both`,
                }}
              >
                {/* top row: avatar + info */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                  {/* patient avatar */}
                  <div style={{
                    width:44, height:44, borderRadius:'50%',
                    background:'linear-gradient(135deg,#F7D5E0,#EDE8F8)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.35rem', flexShrink:0,
                  }}>
                    👩
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    {/* urgency label + name */}
                    <div style={{
                      display:'flex', alignItems:'center',
                      gap:7, marginBottom:3, flexWrap:'wrap',
                    }}>
                      <span style={{
                        fontWeight:800, fontSize:'0.82rem', color:u.border,
                      }}>
                        {u.label}:
                      </span>
                      <span style={{ fontWeight:700, color:'#3D1F2E', fontSize:'0.88rem' }}>
                        {p.name}, Age {p.age}
                      </span>
                    </div>

                    {/* symptoms */}
                    <div style={{
                      fontSize:'0.78rem', color:'#9A7A88', marginBottom:7,
                    }}>
                      {p.symptoms}
                    </div>

                    {/* AI report badge + wait time */}
                    <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                      <span style={{
                        background:u.tag, color:u.tagText,
                        padding:'3px 10px', borderRadius:9999,
                        fontSize:'0.70rem', fontWeight:700,
                      }}>
                        ✨ AI Report Ready
                      </span>
                      <span style={{ fontSize:'0.70rem', color:'#9A7A88' }}>
                        ⏱ {p.wait}
                      </span>
                    </div>
                  </div>
                </div>

                {/* action buttons */}
                <div style={{ display:'flex', gap:10 }}>
                  {/* Start Call — goes to video call page */}
                  <button
                    onClick={() => navigate('/doctor/video-call')}
                    onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1)';    }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    }}
                    style={{
                      flex:1, padding:'11px 0', borderRadius:9999, border:'none',
                      background:'linear-gradient(135deg,#C8426D,#9E2F52)',
                      color:'white', fontFamily:'Nunito,sans-serif',
                      fontWeight:700, fontSize:'0.84rem', cursor:'pointer',
                      boxShadow:'0 3px 11px rgba(200,66,109,0.38)',
                      transition:'transform 0.15s ease',
                    }}
                  >
                    📹 Start Call
                  </button>

                  {/* Read AI Report — goes to report page */}
                  <button
                    onClick={() => navigate('/doctor/ai-report')}
                    style={{
                      flex:1, padding:'11px 0', borderRadius:9999,
                      border:'2px solid rgba(200,66,109,0.28)',
                      background:'transparent',
                      color:'#C8426D', fontFamily:'Nunito,sans-serif',
                      fontWeight:700, fontSize:'0.84rem', cursor:'pointer',
                      transition:'all 0.18s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,66,109,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    📋 Read AI Report
                  </button> 
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Doctor bottom nav ── */}
      <DoctorBottomNav
        active={activeTab}
        onSelect={setActiveTab}
        navigate={navigate}
      />

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0);    }
        }
      `}</style>
    </div>
  );
}