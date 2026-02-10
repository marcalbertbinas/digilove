import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FallingImages from '../components/FallingImg.jsx';
import { supabase } from '../supabaseclient.js';

function CreateAnonymous() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    recipient: '', 
    nickname: '', 
    message: '', 
    recipientEmail: '',
    senderEmail: '' 
  });
  const [isSealing, setIsSealing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const navigate = useNavigate();
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSealAndSend = async () => {
    setIsSealing(true);
    try {
      const { data, error } = await supabase
        .from('valentine_messages')
        .insert([{ 
            recipient_name: formData.recipient.trim(), 
            sender_nickname: formData.nickname.trim() || "Anonymous", 
            content: formData.message.trim(), 
            sender_email: formData.senderEmail.trim(), 
            recipient_email: formData.recipientEmail.trim(),
            is_anonymous: true 
        }])
        .select();

      if (error) throw error;

      setTimeout(() => {
        setGeneratedLink(`${window.location.origin}/letter/${data[0].id}`);
        setIsSealing(false);
        setStep(6); 
      }, 2500);
    } catch (error) {
      setIsSealing(false);
      alert('Error: Submission failed.');
    }
  };

  const handleSendEmail = async () => {
    if (!formData.recipientEmail) return alert("Required field: Recipient Email.");
    setIsSealing(true);
    try {
      const { error } = await supabase.functions.invoke('send-valentine', {
        body: {
          type: 'VALENTINE', 
          recipientEmail: formData.recipientEmail,
          valentineLink: generatedLink,
          senderNickname: formData.nickname || "Anonymous"
        }
      });
      if (error) throw error;
      setEmailSent(true);
    } catch (err) {
      alert("Notification failed. Link remains active.");
    } finally {
      setIsSealing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-rose-50 flex items-center justify-center pt-24 px-4 relative overflow-hidden font-sans">
      <Header />
      <FallingImages images={[]} />

      {isSealing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-rose-50/90 backdrop-blur-md">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute bottom-0 w-full h-20 bg-rose-400 rounded-b-xl shadow-lg"></div>
            <div className="absolute bottom-6 left-4 right-4 h-20 bg-white rounded shadow-sm animate-bounce flex flex-col p-2 gap-2">
              <div className="h-2 w-full bg-rose-100 rounded"></div>
              <div className="h-2 w-3/4 bg-rose-100 rounded"></div>
            </div>
            <div className="absolute top-12 w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-t-[50px] border-t-rose-300"></div>
          </div>
          <h2 className="text-2xl font-bold text-rose-600 animate-pulse uppercase tracking-widest text-center px-6">Processing Submission</h2>
          <p className="text-rose-400 mt-2 font-medium">Finalizing encryption...</p>
        </div>
      )}

      <div className="w-full max-w-lg bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 relative z-10">
        {step < 6 && (
          <div className="flex justify-center items-center gap-3 mb-10">
            {[1, 2, 3, 4, 5].map((num) => (
              <React.Fragment key={num}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= num ? 'bg-rose-500 text-white scale-110 shadow-lg' : 'bg-rose-100 text-rose-300'}`}>{num}</div>
                {num < 5 && <div className={`h-1 w-6 md:w-8 rounded-full transition-colors duration-500 ${step > num ? 'bg-rose-500' : 'bg-rose-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center">
            <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-4">Recipient Identifier</label>
            <input type="text" placeholder="Enter recipient name" className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-300" value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} />
            <button onClick={nextStep} disabled={!formData.recipient} className="w-full mt-8 bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 ml-1">Sender Pseudonym</label>
                <input type="text" placeholder="Alias (Optional)" className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-rose-300" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 ml-1">Verification Email</label>
                <input type="email" placeholder="Private email address" className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-rose-300" value={formData.senderEmail} onChange={(e) => setFormData({...formData, senderEmail: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={prevStep} className="flex-1 text-rose-400 font-bold">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 ml-1">Message Body</label>
            <textarea rows="5" placeholder="Enter anonymous message..." className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none resize-none focus:ring-2 focus:ring-rose-300" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
            <div className="flex gap-4 mt-8">
              <button onClick={prevStep} className="flex-1 text-rose-400 font-bold">Back</button>
              <button onClick={nextStep} disabled={!formData.message} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg transition-all">Review</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 text-center">Submission Preview</label>
            <div className="p-6 bg-white/80 rounded-3xl border border-rose-50 shadow-inner text-rose-900">
              <p className="mb-2 font-bold text-rose-600 uppercase text-[10px] tracking-widest">Recipient: {formData.recipient}</p>
              <p className="text-lg leading-relaxed whitespace-pre-wrap">"{formData.message}"</p>
              <p className="text-sm text-rose-500 mt-4 font-bold text-right">— {formData.nickname || "Anonymous"}</p>
            </div>
            <button onClick={handleSealAndSend} className="w-full mt-8 bg-rose-600 text-white py-5 rounded-2xl font-bold shadow-xl active:scale-95 transition-all uppercase tracking-widest">Send Anonymously</button>
          </div>
        )}

        {step === 6 && (
          <div className="animate-in zoom-in-95 duration-700 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-green-50">✓</div>
            <h2 className="text-3xl font-bold text-rose-600 mb-2 leading-tight">Submitted</h2>
            <div className="p-6 bg-rose-50/50 border-2 border-dashed border-rose-200 rounded-3xl mb-6 mt-6">
              <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">Optional Notification</label>
              <input type="email" placeholder="Recipient Email" className="w-full p-4 text-center outline-none bg-white border border-rose-100 rounded-2xl mb-4 shadow-sm" value={formData.recipientEmail} onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})} />
              <button onClick={handleSendEmail} disabled={emailSent || !formData.recipientEmail} className={`w-full py-4 rounded-2xl font-bold shadow-md transition-all uppercase text-xs tracking-widest ${emailSent ? "bg-green-500 text-white" : "bg-rose-600 text-white hover:bg-rose-700"}`}>
                {emailSent ? "Notification Sent" : "Send Email Notification"}
              </button>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Link copied to clipboard."); }} className="w-full py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm mb-4 active:scale-95">Copy Access Link</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateAnonymous;