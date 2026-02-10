import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseclient.js';
import Header from '../components/Header';
import { 
    Mail, Send, ArrowLeft, Copy, CheckCircle2, 
    Heart, UserRoundSearch, Sparkles 
} from 'lucide-react';

function CreateAnonymous() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSealing, setIsSealing] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    
    // Form Data
    const [formData, setFormData] = useState({
        recipient: '',
        nickname: '',
        message: '',
        recipientEmail: ''
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSealAndSend = async () => {
        setIsSealing(true);

        try {
            // 1. Insert into your valentine_messages table
            const { data, error } = await supabase
                .from('valentine_messages')
                .insert([{ 
                    recipient_name: formData.recipient.trim(), 
                    sender_nickname: formData.nickname.trim() || "Secret Admirer", 
                    content: formData.message.trim(), 
                    is_anonymous: true 
                }])
                .select();

            if (error) throw error;

            // 2. Generate Link
            const messageId = data[0].id;
            const link = `${window.location.origin}/letter/${messageId}`;
            setGeneratedLink(link);
            
            // 3. Move to Final Step
            setIsSealing(false);
            setStep(5); 

        } catch (err) {
            console.error("Error:", err.message);
            alert("Oops! The envelope tore. Try again!");
            setIsSealing(false);
        }
    };

    const handleSendEmail = async () => {
        if (!formData.recipientEmail) return alert("Where should we send it?");
        setIsSealing(true);
        
        const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const FUNCTION_URL = 'https://jgfipnchjsxpxtpnvnlk.supabase.co/functions/v1/send-valentine';

        try {
            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`
                },
                body: JSON.stringify({
                    recipientEmail: formData.recipientEmail,
                    valentineLink: generatedLink,
                    senderNickname: formData.nickname || "Secret Admirer"
                })
            });

            if (response.ok) {
                setEmailSent(true);
            } else {
                alert("The Middleman is busy. Link is still valid though!");
            }
        } catch (err) {
            alert("Connection error.");
        } finally {
            setIsSealing(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#fdf2f2] flex items-center justify-center py-20 px-4 relative overflow-hidden font-sans">
            <Header />
            
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-rose-600 to-rose-400" />
            <Heart className="absolute -bottom-20 -left-20 text-rose-100/50 rotate-12" size={400} fill="currentColor" />

            <div className="w-full max-w-lg bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl p-8 relative z-10">
                
                {/* Stepper Header */}
                {step < 5 && (
                    <div className="flex justify-center items-center gap-3 mb-10">
                        {[1, 2, 3, 4].map((num) => (
                            <React.Fragment key={num}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                                    step >= num ? 'bg-rose-500 text-white shadow-md' : 'bg-rose-100 text-rose-300'
                                }`}>
                                    {num === 4 ? <Sparkles size={14} /> : num}
                                </div>
                                {num < 4 && (
                                    <div className={`h-1 w-6 rounded-full transition-colors duration-500 ${step > num ? 'bg-rose-500' : 'bg-rose-100'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* STEP 1: RECIPIENT */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-black text-rose-600 mb-2 text-center">Who is the lucky person?</h2>
                        <p className="text-rose-400 text-center mb-8 text-sm">Their name will appear on the envelope.</p>
                        <input 
                            type="text" 
                            placeholder="Recipient's Name..."
                            className="w-full p-5 bg-white border-2 border-rose-100 rounded-2xl focus:border-rose-400 outline-none transition-all shadow-sm"
                            value={formData.recipient}
                            onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                        />
                        <button onClick={nextStep} disabled={!formData.recipient} className="w-full mt-8 bg-rose-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-rose-700 disabled:opacity-30 active:scale-95 transition-all">
                            Next: Choose your Identity
                        </button>
                    </div>
                )}

                {/* STEP 2: NICKNAME */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-black text-rose-600 mb-2 text-center">Your Secret Nickname</h2>
                        <p className="text-rose-400 text-center mb-8 text-sm">Don't use your real name if you want to stay anonymous!</p>
                        <input 
                            type="text" 
                            placeholder="e.g. Your Favorite Person / Secret Admirer"
                            className="w-full p-5 bg-white border-2 border-rose-100 rounded-2xl focus:border-rose-400 outline-none shadow-sm"
                            value={formData.nickname}
                            onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                        />
                        <div className="flex gap-4 mt-8">
                            <button onClick={prevStep} className="flex-1 text-rose-400 font-bold hover:text-rose-600 transition-colors">Back</button>
                            <button onClick={nextStep} className="flex-[2] bg-rose-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-rose-700 active:scale-95 transition-all">
                                Next: The Message
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: MESSAGE */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-black text-rose-600 mb-6 text-center">Write from the Heart</h2>
                        <textarea 
                            rows="5"
                            placeholder="Type your secret message here..."
                            className="w-full p-5 bg-white border-2 border-rose-100 rounded-2xl focus:border-rose-400 outline-none shadow-sm resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                        <div className="flex gap-4 mt-8">
                            <button onClick={prevStep} className="flex-1 text-rose-400 font-bold hover:text-rose-600 transition-colors">Back</button>
                            <button onClick={nextStep} disabled={!formData.message} className="flex-[2] bg-rose-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-rose-700 disabled:opacity-30 active:scale-95 transition-all">
                                Preview Letter
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: PREVIEW */}
                {step === 4 && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <h2 className="text-2xl font-black text-rose-600 mb-6 text-center">Final Check</h2>
                        <div className="p-8 bg-white border-2 border-rose-100 rounded-[2rem] shadow-inner italic text-rose-900 relative">
                            <Heart className="absolute top-4 right-4 text-rose-50" size={40} fill="currentColor" />
                            <p className="mb-4 font-black text-rose-600 not-italic uppercase text-xs tracking-widest">To: {formData.recipient}</p>
                            <p className="text-lg leading-relaxed whitespace-pre-wrap">"{formData.message}"</p>
                            <p className="text-sm text-rose-400 mt-6 not-italic font-bold text-right">— {formData.nickname || "Secret Admirer"}</p>
                        </div>
                        <button onClick={handleSealAndSend} className="w-full mt-8 bg-rose-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-rose-700 active:scale-95 transition-all">
                            Seal & Generate Link ❤️
                        </button>
                        <button onClick={prevStep} className="w-full mt-4 text-rose-300 text-xs font-bold uppercase tracking-widest hover:text-rose-500">
                            Edit Message
                        </button>
                    </div>
                )}

                {/* LOADING: SEALING ANIMATION (From your reference) */}
                {isSealing && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-rose-50/90 backdrop-blur-md">
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute bottom-0 w-full h-20 bg-rose-400 rounded-b-xl shadow-lg"></div>
                            <div className="absolute bottom-6 left-4 right-4 h-20 bg-white rounded shadow-sm animate-bounce flex flex-col p-2 gap-2">
                                <div className="h-2 w-full bg-rose-100 rounded"></div>
                                <div className="h-2 w-3/4 bg-rose-100 rounded"></div>
                            </div>
                            <div className="absolute top-12 w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-t-[50px] border-t-rose-300"></div>
                        </div>
                        <h2 className="text-2xl font-black text-rose-600 animate-pulse">Sealing with love...</h2>
                    </div>
                )}

                {/* STEP 5: SUCCESS & EMAIL DELIVERY */}
                {step === 5 && (
                    <div className="animate-in zoom-in-95 duration-700 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">✓</div>
                        <h2 className="text-3xl font-black text-rose-600 mb-2">Letter Sealed!</h2>
                        <p className="text-rose-400 mb-8 font-medium">Your secret is safe with us.</p>
                        
                        <div className="p-6 bg-rose-50/50 border-2 border-dashed border-rose-200 rounded-3xl mb-6">
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-4">Option A: Send via Anonymous Email</p>
                            <input 
                                type="email"
                                placeholder="Recipient's Email Address..."
                                className="w-full p-4 text-center outline-none bg-white border border-rose-100 rounded-2xl mb-4 shadow-sm text-sm"
                                value={formData.recipientEmail}
                                onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
                            />
                            <button 
                                onClick={handleSendEmail}
                                disabled={emailSent || !formData.recipientEmail}
                                className={`w-full py-4 rounded-2xl font-black transition-all shadow-md active:scale-95 ${
                                    emailSent ? "bg-green-500 text-white" : "bg-rose-600 text-white hover:bg-rose-700"
                                }`}
                            >
                                {emailSent ? "Sent Successfully!" : "Send Anonymous Email"}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em]">Option B: Manual Link</p>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedLink);
                                    alert("Link copied! Now go DM it.");
                                }}
                                className="w-full py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors shadow-sm"
                            >
                                <Copy size={18} /> Copy Private Link
                            </button>
                        </div>
                        
                        <button onClick={() => window.location.reload()} className="mt-8 text-rose-300 text-xs font-bold uppercase hover:text-rose-500">
                            Create another letter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateAnonymous;