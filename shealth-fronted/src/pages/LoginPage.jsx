
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';


const ROLES = [
  {
    id: 'patient', label: 'Patient',
    desc: 'Personalized care, tracking & medical records',
    icon: '🩺',
    bg: '#EDE8F8', border: 'rgba(201,184,232,0.7)',
  },
  
  {
    id: 'whf', label: 'Facilitator',
    desc: 'Manage patient care and bridge the gap',
    icon: '👥',
    bg: '#E8F8F2', border: 'rgba(168,230,207,0.8)',
  },
  {
    id: 'doctor', label: 'Doctor',
    desc: 'Access clinical insights & consult patients',
    icon: '👩‍⚕️',
    bg: '#FFF0E6', border: 'rgba(255,203,164,0.8)',
  },
];


const ROLE_ROUTES = { patient: '/patient', whf: '/whf', doctor: '/doctor' };
const ROLE_NAMES  = { patient: 'Priya',   whf: 'Sunita', doctor: 'Meera' };
const DEMO_OTP    = '123456';


const inputBase = {
  padding: '13px 16px',
  border: '2px solid rgba(200,66,109,0.16)',
  borderRadius: 14,
  fontFamily: 'Nunito, sans-serif',
  fontSize: '1rem',
  color: '#4A3040',
  background: 'white',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  width: '100%',
};

export default function LoginPage() {
  const { login, addNotification } = useApp();
  const navigate = useNavigate();

  
  const [step,         setStep]         = useState('main');  
  const [selectedRole, setSelectedRole] = useState(null);
  const [phone,        setPhone]        = useState('');
  const [otp,          setOtp]          = useState(['','','','','','']);
  const [loading,      setLoading]      = useState(false);
  const [otpError,     setOtpError]     = useState('');

 
  const handleSend = async () => {
    if (!selectedRole) { addNotification('Please select your role first 👆'); return; }
    if (phone.length < 10) { addNotification('Enter a valid 10-digit number'); return; }
    setLoading(true);
    
    await new Promise(r => setTimeout(r, 750));   // simulated delay
    setLoading(false);
    setStep('otp');
    addNotification('OTP sent! Use 123456 for demo 🌸');
  };

  
  const handleDigit = (val, idx) => {
    const clean = val.replace(/\D/, '').slice(-1);
    const next  = [...otp];
    next[idx]   = clean;
    setOtp(next);
    setOtpError('');
    if (clean && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  
  const handleKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    setOtpError('');
    try {
      
      
      await new Promise(r => setTimeout(r, 700));
      if (code !== DEMO_OTP) {
        setOtpError(`Wrong code — demo OTP is ${DEMO_OTP}`);
        setLoading(false);
        return;
      }
      login({ name: ROLE_NAMES[selectedRole], phone, role: selectedRole }, selectedRole);
      navigate(ROLE_ROUTES[selectedRole], { replace: true });
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Try again.');
      setLoading(false);
    }
  };

  
  
  if (step === 'otp') {
    const filled = otp.join('').length;
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(170deg,#FDF0F4,#F5EEFF,#FFF0E5)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
        position: 'relative',
      }}>
        
        <button
          onClick={() => { setStep('main'); setOtp(['','','','','','']); setOtpError(''); }}
          style={{
            position: 'absolute', top: 24, left: 24,
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.88)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.09)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#4A3040" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12,19 5,12 12,5"/>
          </svg>
        </button>

        
        <div style={{
          width: '100%', maxWidth: 380,
          background: 'rgba(255,255,255,0.93)',
          borderRadius: 30, padding: '36px 26px',
          boxShadow: '0 8px 40px rgba(200,66,109,0.16)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(200,66,109,0.10)',
          animation: 'scaleIn 0.38s ease',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ fontSize: '2.6rem', marginBottom: 10 }}>📱</div>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.85rem', fontWeight: 700, color: '#3D1F2E', marginBottom: 8,
            }}>
              Verify your number
            </h2>
            <p style={{ color: '#9A7A88', fontSize: '0.86rem', lineHeight: 1.6 }}>
              6-digit code sent to{' '}
              <strong style={{ color: '#4A3040' }}>+91 {phone}</strong>
            </p>
            <p style={{ color: '#C8426D', fontSize: '0.76rem', marginTop: 6, fontWeight: 700 }}>
              Demo code: {DEMO_OTP}
            </p>
          </div>

         
          <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginBottom: 10 }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={e => handleDigit(e.target.value, i)}
                onKeyDown={e => handleKey(e, i)}
                style={{
                  width: 46, height: 56, textAlign: 'center',
                  fontSize: '1.45rem', fontWeight: 800, color: '#3D1F2E',
                  border: otpError
                    ? '2px solid #D63030'
                    : digit
                      ? '2px solid #C8426D'
                      : '2px solid rgba(200,66,109,0.2)',
                  borderRadius: 13,
                  background: digit ? 'rgba(200,66,109,0.06)' : 'white',
                  outline: 'none',
                  transition: 'all 0.18s ease',
                  fontFamily: 'Nunito, sans-serif',
                }}
              />
            ))}
          </div>

         
          {otpError && (
            <p style={{
              color: '#D63030', fontSize: '0.80rem',
              textAlign: 'center', marginBottom: 12, fontWeight: 600,
            }}>
              ⚠️ {otpError}
            </p>
          )}

          <div style={{ height: otpError ? 0 : 14 }} />

        
          <button
            onClick={handleVerify}
            disabled={filled < 6 || loading}
            style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: 9999,
              background: filled < 6
                ? 'rgba(200,66,109,0.18)'
                : 'linear-gradient(135deg,#5B4D8E,#3D1F6E)',
              color: filled < 6 ? '#C8909C' : 'white',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem',
              letterSpacing: '0.8px', textTransform: 'uppercase',
              cursor: filled < 6 || loading ? 'not-allowed' : 'pointer',
              boxShadow: filled >= 6 ? '0 4px 20px rgba(91,77,142,0.4)' : 'none',
              transition: 'all 0.22s ease', marginBottom: 14,
            }}
          >
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </button>

          <p
            style={{
              textAlign: 'center', color: '#C8426D', fontSize: '0.76rem',
              fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
              cursor: 'pointer',
            }}
            onClick={() => !loading && addNotification('OTP resent! Use 123456')}
          >
            Resend Code
          </p>
        </div>

        <style>{`@keyframes scaleIn { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }`}</style>
      </div>
    );
  }

  
  
  const canSend = selectedRole && phone.length >= 10;
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg,#FDF0F4,#F5EEFF,#FFF0E5)',
      padding: '52px 22px 40px',
      overflowY: 'auto',
    }}>

      
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.78)',
          padding: '10px 20px', borderRadius: 9999,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 16px rgba(200,66,109,0.10)',
        }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg,#C8426D,#E8799A)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, fontSize: '1.4rem',
            background: 'linear-gradient(135deg,#C8426D,#9E2F52)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            SHEALTH
          </span>
        </div>
      </div>

      <h2 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.95rem', textAlign: 'center', color: '#3D1F2E', marginBottom: 6,
        animation: 'fadeUp 0.4s ease both',
      }}>
        Welcome, how can we help?
      </h2>
      <p style={{
        textAlign: 'center', color: '#9A7A88', marginBottom: 22, fontSize: '0.88rem',
        animation: 'fadeUp 0.4s 0.06s ease both',
      }}>
        Select your role to continue
      </p>

     
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 22 }}>
        {ROLES.map((r, i) => {
          const active = selectedRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '17px 18px',
                background: active ? r.bg : 'rgba(255,255,255,0.87)',
                border: active ? `2px solid ${r.border}` : '2px solid rgba(200,66,109,0.10)',
                borderRadius: 22,
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all 0.22s ease',
                boxShadow: active ? '0 4px 18px rgba(200,66,109,0.14)' : '0 2px 8px rgba(0,0,0,0.05)',
                transform: active ? 'scale(1.015)' : 'scale(1)',
                animation: `fadeUp 0.4s ${i * 0.07}s ease both`,
              }}
            >
             
              <div style={{
                width: 48, height: 48, borderRadius: 15,
                background: r.bg, border: `1px solid ${r.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0,
              }}>
                {r.icon}
              </div>

              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#3D1F2E', marginBottom: 2 }}>
                  {r.label}
                </div>
                <div style={{ fontSize: '0.79rem', color: '#9A7A88' }}>{r.desc}</div>
              </div>

              
              {active
                ? (
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#C8426D',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                  </div>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                    stroke="#C8C0C8" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                  </svg>
                )
              }
            </button>
          );
        })}
      </div>

     
      <div style={{
        background: 'rgba(255,255,255,0.82)',
        borderRadius: 26, padding: '22px 20px',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(200,66,109,0.10)',
        boxShadow: '0 4px 20px rgba(200,66,109,0.07)',
        animation: 'fadeUp 0.4s 0.22s ease both',
      }}>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.45rem', textAlign: 'center', color: '#3D1F2E', marginBottom: 5,
        }}>
          Continue with Phone
        </h3>
        <p style={{ textAlign: 'center', color: '#9A7A88', fontSize: '0.80rem', marginBottom: 18 }}>
          We'll send a code to verify your identity
        </p>

       
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'white', border: '2px solid rgba(200,66,109,0.15)',
            borderRadius: 13, padding: '13px 14px', flexShrink: 0,
          }}>
            <span style={{ fontSize: '1rem' }}>🇮🇳</span>
            <span style={{ fontWeight: 700, color: '#4A3040', fontSize: '0.9rem' }}>+91</span>
          </div>
          <input
            type="tel"
            placeholder="98765 43210"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            style={{ ...inputBase, flex: 1, letterSpacing: '1px' }}
            onFocus={e  => { e.target.style.borderColor = '#E8799A'; }}
            onBlur={e   => { e.target.style.borderColor = 'rgba(200,66,109,0.16)'; }}
          />
        </div>

        
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', border: 'none', borderRadius: 9999,
            background: canSend
              ? 'linear-gradient(135deg,#C8426D,#9E2F52)'
              : 'rgba(200,66,109,0.18)',
            color:  canSend ? 'white' : '#C8909C',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem',
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: canSend ? '0 4px 20px rgba(200,66,109,0.38)' : 'none',
            transition: 'all 0.22s ease',
          }}
        >
          {loading ? 'Sending…' : 'Send OTP →'}
        </button>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}
