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
    
    // Form Data State matching your table structure
    const [formData, setFormData] = useState({
        recipient: '',
        nickname: '',
        message: '',
        recipientEmail: '',
        senderEmail: '' 
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSealAndSend = async () => {
        setIsSealing(true);

        try {
            // TARGETING: 'valentine_messages' table
            // COLUMN: 'content' (from your screenshot)
            const { data, error } = await supabase
                .from('valentine_messages')
                .insert([{ 
                    recipient_name: formData.recipient.trim(), 
                    sender_nickname: formData.nickname.trim() || "Secret Admirer", 
                    content: formData.message.trim(), 
                    sender_email: formData.senderEmail.trim(), 
                    recipient_email: formData.recipientEmail.trim(),
                    is_anonymous: true 
                }])
                .select();

            if (error) {
                console.error("DATABASE ERROR:", error.message);
                alert(`The envelope tore! Error: ${error.message}`);
                return;
            }

            if (data && data.length > 0) {
                const messageId = data[0].id;
                // Update this link format if your viewer page uses a different route
                const link = `${window.location.origin}/letter/${messageId}`;
                setGeneratedLink(link);
                setStep(5); 
            }

        } catch (err) {
            console.error("CRITICAL ERROR:", err);
            alert("Connection error. Please try again.");
        } finally {
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
                    type: 'VALENTINE', 
                    recipientEmail: formData.recipientEmail,
                    valentineLink: generatedLink,
                    senderNickname: formData.nickname || "Secret Admirer"
                })
            });

            if (response.ok) {
                setEmailSent(true);
            } else {
                alert("The Middleman is busy, but your link is still valid!");
            }
        } catch (err) {
            alert("Email connection error.");
        } finally {
            setIsSealing(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#fdf2f2] flex items-center justify-center py-20 px-4 relative overflow-hidden font-sans">
            <Header />
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-rose-600 to-rose-400" />
            
            <div className="w-full max-w-lg bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl p-8 relative z-10">
                
                {/* Stepper Navigation */}
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

                {/* Step 1: Recipient Name */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-black text-rose-600 mb-6 text-center">Who is it for?</h2>
                        <input 
                            type="text" 
                            placeholder="Recipient's Name..."
                            className="w-full p-5 bg-white border-2 border-rose-100 rounded-2xl focus:border-rose-400 outline-none shadow-sm"
                            value={formData.recipient}
                            onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                        />
                        <button onClick={nextStep} disabled={!formData.recipient} className="w-full mt-8 bg-rose-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-rose-700 transition-all">
                            Next
                        </button>
                    </div>
                )}

                {/* Step 2: Sender Info */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-black text-rose-600 mb-6 text-center">Your Details</h2>
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Your Secret Nickname..."
                                className="w-full p-5 bg-white border-2 border-rose-100 rounded-2xl focus:border-rose-400 outline-none shadow-sm"
                                value={formData.nickname}
                                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                            />
                            <input 
                                type="email" 
                                placeholder="Your Email (Private)"
                                className="w-full p-5 bg-white border-2 border-rose-100 rounded-2xl focus:border-rose-400 outline-none shadow-sm"
                                value={formData.senderEmail}
                                onChange={(e) => setFormData({...formData, senderEmail: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={prevStep} className="flex-1 text-rose-400 font-bold">Back</button>
                            <button onClick={nextStep} className="flex-[2] bg-rose-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-rose-700 transition-all">
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: The Message */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-black text-rose-600 mb-6 text-center">Write from the Heart</h2>
                        <textarea 
                            rows="5"
                            placeholder="Type your message..."
                            className="w-full p-5 bg-white border-2 border-rose-100 rounded-2xl focus:border-rose-400 outline-none shadow-sm resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                        <div className="flex gap-4 mt-8">
                            <button onClick={prevStep} className="flex-1 text-rose-400 font-bold">Back</button>
                            <button onClick={nextStep} disabled={!formData.message} className="flex-[2] bg-rose-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-rose-700 transition-all">
                                Preview
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Final Preview */}
                {step === 4 && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <h2 className="text-2xl font-black text-rose-600 mb-6 text-center">Final Check</h2>
                        <div className="p-8 bg-white border-2 border-rose-100 rounded-[2rem] shadow-inner italic text-rose-900 relative text-left">
                            <p className="mb-4 font-black text-rose-600 not-italic uppercase text-xs tracking-widest">To: {formData.recipient}</p>
                            <p className="text-lg leading-relaxed whitespace-pre-wrap">"{formData.message}"</p>
                            <p className="text-sm text-rose-400 mt-6 not-italic font-bold text-right">— {formData.nickname || "Secret Admirer"}</p>
                        </div>
                        <button onClick={handleSealAndSend} className="w-full mt-8 bg-rose-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-rose-700 active:scale-95 transition-all">
                            Seal & Send ❤️
                        </button>
                    </div>
                )}

                {/* Step 5: Success & Sharing */}
                {step === 5 && (
                    <div className="animate-in zoom-in-95 duration-700 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">✓</div>
                        <h2 className="text-3xl font-black text-rose-600 mb-2">Letter Sealed!</h2>
                        
                        <div className="p-6 bg-rose-50/50 border-2 border-dashed border-rose-200 rounded-3xl mb-6 mt-6">
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

                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(generatedLink);
                                alert("Link copied!");
                            }}
                            className="w-full py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors shadow-sm"
                        >
                            <Copy size={18} /> Copy Private Link
                        </button>
                    </div>
                )}
            </div>

            {/* Loading Overlay */}
            {isSealing && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-rose-50/90 backdrop-blur-md">
                    <Heart className="text-rose-500 animate-bounce mb-4" size={60} fill="currentColor" />
                    <h2 className="text-2xl font-black text-rose-600 animate-pulse">Sealing with love...</h2>
                </div>
            )}
        </div>
    );
}

export default CreateAnonymous;