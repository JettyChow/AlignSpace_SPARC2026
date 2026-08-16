'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import Icon from '@/components/Icon';

// First line is personalized with the signed-in user's name (see userName
// prop) rather than a hardcoded one.
function buildIntakeScript(userName) {
  const hi = userName ? `Hi ${userName}!` : 'Hi there!';
  return [
    { id: 'space', ai: `${hi} Let's start with the basics — what space are you renovating?`, chips: ['Living room', 'Kitchen', 'Master bedroom', 'Bathroom', 'Home office', 'Whole home'] },
    { id: 'goal', ai: "Love that. What's the primary goal for this renovation?", chips: ['Refresh the look', 'Better functionality', 'Increase home value', 'Create more space', 'Fix structural issues'] },
    { id: 'mood', ai: "What's your aesthetic direction? Pick the vibe that speaks to you.", chips: ['Warm minimal', 'Coastal calm', 'Modern luxe', 'Rustic chic', 'Bold & eclectic', 'Timeless classic'] },
    { id: 'budget', ai: "Last question — what's your budget range for this project?", chips: ['Under $25k', '$25k – $50k', '$50k – $100k', '$100k – $250k', '$250k+'] },
  ];
}

// NOTE: as-ai-server's MVP pipeline only has a bathroom catalog (see
// pipeline/presets.py) — whatever space the client picks here, the material
// package /assemble returns today will still be bathroom fixtures. That's a
// backend scope limit, not something this screen can work around; flagged
// for the AI pipeline team.
const BUDGET_BAND_BY_LABEL = {
  'Under $25k': 'low',
  '$25k – $50k': 'low',
  '$50k – $100k': 'medium',
  '$100k – $250k': 'high',
  '$250k+': 'high',
};

// Turns the intake script's chip answers into the BriefRequest shape
// as-ai-server's /intake and /assemble routes expect (see api_schemas.py).
function toBrief(answers) {
  return {
    room_type: (answers.space || 'bathroom').toLowerCase().replace(/\s+/g, '_'),
    budget_band: BUDGET_BAND_BY_LABEL[answers.budget] || 'medium',
    priorities: answers.goal ? [answers.goal] : [],
    style_chips: answers.mood ? [answers.mood] : [],
    chat_text: Object.values(answers).filter(Boolean).join('. '),
  };
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '12px 16px', background: 'rgba(255,255,255,0.07)', borderRadius: '18px 18px 18px 4px', width: 52 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(247,242,234,0.6)', animation: 'typingBounce 1.2s infinite', animationDelay: `${i * 0.18}s` }} />
      ))}
      <style>{`@keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
    </div>
  );
}

function Bubble({ role, text }) {
  const isAI = role === 'ai';
  return (
    <div style={{ display: 'flex', justifyContent: isAI ? 'flex-start' : 'flex-end', marginBottom: 10 }}>
      <div style={{
        maxWidth: '78%', padding: '12px 16px', borderRadius: isAI ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
        background: isAI ? 'rgba(255,255,255,0.07)' : 'rgba(198,163,107,0.22)',
        border: isAI ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(198,163,107,0.35)',
        fontFamily: 'var(--font-sans)', fontSize: 14.5, lineHeight: 1.5,
        color: isAI ? 'rgba(247,242,234,0.88)' : 'rgba(247,242,234,0.95)',
      }}>{text}</div>
    </div>
  );
}

export default function IntakeScreen({ onBack, onComplete, userName }) {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [chips, setChips] = useState([]);
  const [textVal, setTextVal] = useState('');
  const scrollRef = useRef(null);
  const answersRef = useRef({});
  const intakeScript = useMemo(() => buildIntakeScript(userName), [userName]);

  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages([{ role: 'ai', text: intakeScript[0].ai }]);
      setChips(intakeScript[0].chips);
    }, 900);
    return () => clearTimeout(t);
  }, [intakeScript]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  function pick(chip) {
    answersRef.current = { ...answersRef.current, [intakeScript[step].id]: chip };
    const nextMsgs = [...messages, { role: 'user', text: chip }];
    setMessages(nextMsgs);
    setChips([]);
    if (step < intakeScript.length - 1) {
      setTyping(true);
      setTimeout(() => {
        const next = step + 1;
        setTyping(false);
        setMessages(m => [...m, { role: 'ai', text: intakeScript[next].ai }]);
        setChips(intakeScript[next].chips);
        setStep(next);
      }, 1000);
    } else {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages(m => [...m, { role: 'ai', text: "Perfect! I have everything I need. Building your personalised design brief now..." }]);
        setTimeout(() => onComplete(toBrief(answersRef.current)), 1400);
      }, 1000);
    }
  }

  return (
    <LightScene>
      <AppBar onBack={onBack} eyebrow="Project Intake" title="Tell me about your space" />
      <div ref={scrollRef} style={{ position: 'absolute', top: 88, bottom: chips.length > 0 ? 142 : 88, left: 0, right: 0, overflowY: 'auto', padding: '16px 20px' }}>
        {typing && step === 0 && <TypingDots />}
        {messages.map((m, i) => <Bubble key={i} role={m.role} text={m.text} />)}
        {typing && step > 0 && <TypingDots />}
      </div>
      {chips.length > 0 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(20,16,12,0.72)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px 28px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {chips.map(c => (
              <button key={c} onClick={() => pick(c)} style={{
                padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
                border: '1px solid rgba(198,163,107,0.45)', background: 'rgba(198,163,107,0.10)',
                fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 500, color: 'var(--champagne)',
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: '0 8px 0 16px', border: '1px solid rgba(255,255,255,0.10)' }}>
            <input value={textVal} onChange={e => setTextVal(e.target.value)} placeholder="Or type your answer…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.9)', padding: '10px 0' }} />
            <button onClick={() => { if (textVal.trim()) { pick(textVal.trim()); setTextVal(''); } }} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--champagne)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="send" size={17} color="#2a1f0f" stroke={2} />
            </button>
          </div>
        </div>
      )}
    </LightScene>
  );
}
