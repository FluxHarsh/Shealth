import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';


const MOODS = [
  { icon: '🌙', label: 'Tired',     color: '#FF8A65' },
  { icon: '⚡', label: 'Energetic', color: '#26C6DA' },
  { icon: '💗', label: 'Loving',    color: '#EC407A' },
  { icon: '💪', label: 'Strong',    color: '#66BB6A' },
  { icon: '🍃', label: 'Calm',      color: '#FFA726' },
];


const DAYS      = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DATE_NUMS = [3, 4, 5, 6, 7, 8, 9];
const TODAY_IDX = 1; // Saturday highlighted


export function BottomNav({ active, onSelect, navigate, role }) {
  const patientTabs = [
    { id: 'home',    emoji: '🏠', label: 'Home',    path: '/patient'          },
    { id: 'health',  emoji: '📊', label: 'Health',  path: '/patient/results'  },
    { id: 'learn',   emoji: '📚', label: 'Learn',   path: '/patient/learn'    },
    { id: 'profile', emoji: '👤', label: 'Profile', path: '/patient/profile'  },
  ];
  const whfTabs = [
    { id: 'home',     emoji: '🏠', label: 'Home',     path: '/whf'          },
    { id: 'patients', emoji: '👩', label: 'Patients', path: '/whf'          },
    { id: 'earnings', emoji: '💰', label: 'Earnings', path: '/whf/earnings' },
    { id: 'profile',  emoji: '👤', label: 'Profile',  path: '/whf/profile'  },
  ];
  const doctorTabs = [
    { id: 'queue',   emoji: '📋', label: 'Queue',    path: '/doctor'          },
    { id: 'patients',emoji: '👩', label: 'Patients', path: '/doctor'          },
    { id: 'reports', emoji: '📊', label: 'Reports',  path: '/doctor'          },
    { id: 'profile', emoji: '👤', label: 'Profile',  path: '/doctor/profile'  },
  ];

  const tabs = role === 'patient' ? patientTabs
             : role === 'whf'     ? whfTabs
             : doctorTabs;

  return (
    <div className="bottom-nav">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => { onSelect(t.id); navigate(t.path); }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '8px 14px', borderRadius: 14, border: 'none',
            background: active === t.id ? 'rgba(200,66,109,0.10)' : 'transparent',
            color:      active === t.id ? '#C8426D' : '#9A7A88',
            cursor: 'pointer', transition: 'all 0.2s ease',
            fontFamily: 'Nunito, sans-serif', fontSize: '0.68rem', fontWeight: 700,
          }}
        >
          <span style={{ fontSize: '1.15rem' }}>{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}


function QuickCard({ icon, title, subtitle, color, accent, onClick }) {
  return (
    <div
      onClick={onClick}
      onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.96)'; }}
      onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1)';    }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    }}
      style={{
        background: color, borderRadius: 20, padding: '16px',
        cursor: 'pointer', transition: 'transform 0.15s ease',
        border: `1px solid ${accent}22`,
      }}
    >
      <div style={{ fontSize: '1.55rem', marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3D1F2E', marginBottom: 2 }}>
        {title}
      </div>
      <div style={{ fontSize: '0.74rem', color: accent }}>{subtitle}</div>
    </div>
  );
}


export default function PatientHome() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] = useState(2); // default: Loving
  const [activeTab,    setActiveTab]    = useState('home');

  
  const name  = user?.name || 'Priya';
  const hour  = new Date().getHours();
  const greet = hour < 12 ? 'Good morning'
              : hour < 17 ? 'Good afternoon'
              : 'Good evening';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#FEF0F5 0%,#F0EBFF 40%,#FFF5EC 100%)',
      paddingBottom: 90, position: 'relative', overflow: 'hidden',
    }}>

     
      <div style={{
        position:'absolute', top:-80, right:-60, width:260, height:260,
        borderRadius:'50%',
        background:'radial-gradient(circle,rgba(201,184,232,0.45) 0%,transparent 70%)',
        filter:'blur(30px)', pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute', top:'38%', left:-80, width:200, height:200,
        borderRadius:'50%',
        background:'radial-gradient(circle,rgba(255,203,164,0.4) 0%,transparent 70%)',
        filter:'blur(25px)', pointerEvents:'none',
      }}/>

     
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'54px 20px 14px',
      }}>
        <div style={{
          width:42, height:42, borderRadius:14,
          background:'rgba(255,255,255,0.72)', border:'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
        }}>
          📅
        </div>

        <div style={{ textAlign:'center', color:'#9A7A88', fontSize:'0.84rem', fontWeight:600 }}>
          {new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' })}
        </div>

        
        <div style={{
          width:42, height:42, borderRadius:'50%',
          background:'linear-gradient(135deg,#E8799A,#C8426D)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'white', fontWeight:800, fontSize:'1.1rem',
          boxShadow:'0 2px 10px rgba(200,66,109,0.35)', cursor:'pointer',
        }}>
          {name[0]}
        </div>
      </div>

      
      <div style={{ padding:'0 20px', marginBottom:6 }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ textAlign:'center', width:40 }}>
             
              <div style={{
                fontSize:'0.68rem', fontWeight:600,
                color:'#B8909C', marginBottom:5, textTransform:'uppercase',
              }}>
                {d}
              </div>
              
              <div style={{
                width:38, height:38, borderRadius:'50%',
                background: i === TODAY_IDX
                  ? 'linear-gradient(135deg,#C8426D,#E8799A)'
                  : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.88rem',
                fontWeight: i === TODAY_IDX ? 800 : 500,
                color:      i === TODAY_IDX ? 'white' : '#4A3040',
                boxShadow:  i === TODAY_IDX ? '0 4px 14px rgba(200,66,109,0.4)' : 'none',
                cursor:'pointer', transition:'all 0.2s ease',
              }}>
                {DATE_NUMS[i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      
      <div style={{
        margin:'10px 20px', padding:'22px',
        borderRadius:26,
        background:'linear-gradient(135deg,rgba(201,184,232,0.62),rgba(247,213,224,0.62))',
        backdropFilter:'blur(12px)',
        border:'1px solid rgba(255,255,255,0.72)',
        boxShadow:'0 4px 20px rgba(200,66,109,0.10)',
        textAlign:'center',
        animation:'fadeUp 0.5s ease',
      }}>
        <p style={{ color:'#8B72C8', fontSize:'0.83rem', fontWeight:600, marginBottom:4 }}>
          Ovulation in
        </p>
        <h1 style={{
          fontFamily:'Cormorant Garamond,serif',
          fontSize:'3rem', fontWeight:700, color:'#3D1F2E', lineHeight:1, marginBottom:6,
        }}>
          2 days
        </h1>
        <p style={{ color:'#9A7A88', fontSize:'0.82rem', marginBottom:14 }}>
          probability of getting pregnant
        </p>
        <button style={{
          padding:'9px 26px',
          background:'rgba(255,255,255,0.86)',
          border:'2px solid rgba(200,66,109,0.22)',
          borderRadius:9999,
          fontFamily:'Nunito,sans-serif', fontWeight:700,
          color:'#C8426D', cursor:'pointer', fontSize:'0.88rem',
          backdropFilter:'blur(8px)', transition:'all 0.2s ease',
        }}>
          mark your period
        </button>
      </div>

     
      <div style={{ padding:'18px 20px 0', animation:'fadeUp 0.5s 0.1s ease both' }}>

        <p style={{ color:'#9A7A88', fontSize:'0.92rem', marginBottom:3 }}>
          {greet}, {name}!
        </p>
        <h2 style={{
          fontFamily:'Cormorant Garamond,serif',
          fontSize:'2.3rem', fontWeight:700, color:'#3D1F2E',
          lineHeight:1.1, marginBottom:24,
        }}>
          How are you<br />feeling today?
        </h2>

        
        <div style={{ display:'flex', justifyContent:'space-around', marginBottom:28 }}>
          {MOODS.map((m, i) => (
            <div
              key={i}
              onClick={() => setSelectedMood(i)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}
            >
              <div style={{
                width:54, height:54, borderRadius:'50%',
                background: selectedMood === i ? m.color : `${m.color}28`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.45rem',
                transition:'all 0.22s ease',
                transform:  selectedMood === i ? 'scale(1.18)' : 'scale(1)',
                boxShadow:  selectedMood === i ? `0 6px 18px ${m.color}55` : 'none',
              }}>
                {m.icon}
              </div>
            
              {selectedMood === i && (
                <span style={{ fontSize:'0.68rem', fontWeight:700, color:m.color }}>
                  {m.label}
                </span>
              )}
            </div>
          ))}
        </div>

        
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          <QuickCard
            icon="🤖" title="AI Health Check" subtitle="Start assessment"
            color="#EDE8F8" accent="#8B72C8"
            onClick={() => navigate('/patient/assessment')}
          />
          <QuickCard
            icon="📅" title="Upcoming" subtitle="No appointments"
            color="#FFF0E6" accent="#E07B00"
            onClick={() => {}}
          />
          <QuickCard
            icon="💊" title="Health Tips" subtitle="3 tips today"
            color="#E8F8F2" accent="#4CAF85"
            onClick={() => navigate('/patient/learn')}
          />
          <QuickCard
            icon="🧠" title="Mental Wellness" subtitle="Check in"
            color="#FEF0F5" accent="#C8426D"
            onClick={() => navigate('/patient/learn')}
          />
        </div>

        
        <div
          onClick={() => navigate('/patient/assessment')}
          style={{
            padding:'18px 20px', borderRadius:22,
            background:'linear-gradient(135deg,#C8426D,#9E2F52)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            cursor:'pointer', boxShadow:'0 6px 22px rgba(200,66,109,0.42)',
            animation:'fadeUp 0.5s 0.2s ease both',
          }}
        >
          <div>
            <div style={{ color:'rgba(255,255,255,0.78)', fontSize:'0.78rem', marginBottom:3 }}>
              Feeling unwell?
            </div>
            <div style={{ color:'white', fontWeight:800, fontSize:'1rem' }}>
              Start AI Health Check →
            </div>
          </div>
          <div style={{ fontSize:'2rem' }}>🩺</div>
        </div>
      </div>

      
      <BottomNav
        active={activeTab}
        onSelect={setActiveTab}
        navigate={navigate}
        role="patient"
      />

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
      `}</style>
    </div>
  );
}
