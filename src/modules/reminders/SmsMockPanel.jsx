import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Smartphone,
  Wifi,
  Battery,
  Signal,
  Sparkles,
  User,
} from 'lucide-react';
import { Card } from '../../shared/Card';
import { subscribeToSmsMessages } from '../../shared/dataService';
import { sendMockSms } from './sendMockSms';
import { useAuth } from '../../auth/AuthContext';

export function SmsMockPanel({ patientId: propPatientId, className = '' }) {
  const { currentUser } = useAuth();
  const patientId = propPatientId || currentUser?.patientId || (currentUser?.uid === 'demo-patient-001' ? 'pat-001' : 'pat-001');

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Subscribe to live SMS messages from Firestore / local demoStore
  useEffect(() => {
    if (!patientId) return;

    const unsubscribe = subscribeToSmsMessages(patientId, (smsList) => {
      setMessages(smsList || []);
    });

    const handleCustomSent = (e) => {
      if (e.detail && e.detail.patientId === patientId) {
        setMessages((prev) => [e.detail, ...prev.filter((m) => m.id !== e.detail.id)]);
      }
    };
    window.addEventListener('mediflow_sms_sent', handleCustomSent);

    return () => {
      unsubscribe();
      window.removeEventListener('mediflow_sms_sent', handleCustomSent);
    };
  }, [patientId]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim()) return;

    setIsSending(true);
    await sendMockSms(patientId, text.trim());
    setInputText('');
    setIsSending(false);
  };

  return (
    <Card className={`p-4 sm:p-5 hover:border-slate-300 transition-colors ${className}`}>
      {/* Title */}
      <div className="flex items-center space-x-2.5 mb-3 pb-2.5 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-mediteal-light text-mediteal flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 stroke-[2]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            Non-Smartphone SMS Simulator
          </h4>
          <p className="text-[11px] text-slate-500">
            Simulates text alerts for patients without smartphones
          </p>
        </div>
      </div>

      {/* ==============================================================
          PHONE-STYLE FRAME
         ============================================================== */}
      <div className="w-full rounded-2xl bg-slate-900 text-white p-2.5 shadow-md border-2 border-slate-800">
        
        {/* Phone Status Bar */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 pt-0.5 pb-2 border-b border-slate-800 font-mono">
          <span>MediFlow Cellular</span>
          <div className="flex items-center space-x-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* Messaging App Top Bar */}
        <div className="flex items-center space-x-2 py-2 px-1 border-b border-slate-800/80">
          <div className="w-6 h-6 rounded-full bg-mediteal text-white flex items-center justify-center text-[10px] font-bold">
            MF
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">MediFlow Health SMS</div>
            <div className="text-[10px] text-emerald-400 font-mono">SMS Service Active</div>
          </div>
        </div>

        {/* Messages Feed (Scrollable) */}
        <div className="space-y-2.5 my-2 max-h-48 overflow-y-auto px-1 py-1">
          {messages.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No messages yet. Send a simulated SMS below.
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex flex-col items-start space-y-0.5">
                <div className="max-w-[88%] p-2.5 rounded-2xl rounded-tl-sm bg-slate-800 text-slate-100 text-xs shadow-sm border border-slate-700/60 leading-relaxed">
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 font-mono pl-1">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Delivered'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Bottom SMS Compose Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex items-center gap-1.5 pt-1 border-t border-slate-800"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type mock SMS message..."
            className="flex-1 h-8 px-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-mediteal"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="h-8 px-3 rounded-xl bg-mediteal hover:bg-mediteal-dark text-white font-bold text-xs flex items-center justify-center disabled:opacity-40 transition"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>

      {/* Quick Test Prompt Templates */}
      <div className="mt-3 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          One-Click Test Messages
        </span>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleSend('Token 40. Now serving 35. 5 to go.')}
            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 hover:border-mediteal hover:text-mediteal transition text-left"
            title="Prompt sample: Token 40. Now serving 35. 5 to go."
          >
            "Token 40. Now serving 35. 5 to go."
          </button>

          <button
            type="button"
            onClick={() => handleSend('MediFlow Alert: Time to take your Metformin 500mg dose.')}
            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 hover:border-mediteal hover:text-mediteal transition text-left"
          >
            "Medication Due Alert"
          </button>

          <button
            type="button"
            onClick={() => handleSend('MediFlow Alert: You missed your 08:00 AM medicine.')}
            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 hover:border-medicoral hover:text-medicoral transition text-left"
          >
            "Missed Dose Alert"
          </button>
        </div>
      </div>
    </Card>
  );
}

export default SmsMockPanel;
