import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseclient.js';
import { 
    Mail, Send, ArrowLeft, Copy, CheckCircle2, 
    Heart 
} from 'lucide-react';

function CreateAnonymous() {
    const navigate = useNavigate();
    const [recipient, setRecipient] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // --- 1. SAVE TO DATABASE ---
    const handleCreateNotice = async (e) => {
        e.preventDefault();
        if (!recipient.trim() || !message.trim()) return;

        setIsSending(true);
        const { data, error } = await supabase
            .from('valentine_messages')
            .insert([{ 
                recipient_name: recipient.trim(), 
                content: message.trim(), 
                is_anonymous: true 
            }])
            .select();

        if (error) {
            console.error("Supabase Error:", error.message);
            alert("Oops! We couldn't seal the letter.");
        } else {
            const messageId = data[0].id;
            const link = `${window.location.origin}/letter/${messageId}`;
            setGeneratedLink(link);
        }
        setIsSending(false);
    };

    // --- 2. TRIGGER GMAIL MIDDLEMAN ---
    const handleSendAnonymousEmail = async () => {
        if (!recipientEmail) return alert("Please enter the recipient's email!");
        
        setIsSending(true);
        
        // Pulls your key from .env
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
                    recipientEmail: recipientEmail,
                    valentineLink: generatedLink
                })
            });

            if (response.ok) {
                setEmailSent(true);
                alert("Anonymous Email Sent! ❤️");
            } else {
                const errorData = await response.json();
                console.error("Middleman Error:", errorData);
                alert("Middleman failed. Check your Gmail App Password or Edge Function Logs.");
            }
        } catch (err) {
            console.error("Connection Error:", err);
            // If this alert triggers, check the browser console for red CORS errors!
            alert("Connection failed. Check your Edge Function CORS settings.");
        } finally {
            setIsSending(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen w-full bg-[#fdf2f2] text-rose-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-rose-600 to-rose-400" />
            <Heart className="absolute -top-16 -left-16 text-rose-100/50 rotate-12" size={320} fill="currentColor" />
            
            <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-2 text-rose-400 hover:text-rose-600 transition-all font-bold text-sm uppercase z-20">
                <ArrowLeft size={18} /> Back
            </button>

            {!generatedLink ? (
                /* --- STAGE 1: WRITE THE LETTER --- */
                <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-20 h-20 bg-white border-4 border-rose-100 rounded-[2rem] flex items-center justify-center mb-4 shadow-xl rotate-3">
                            <Mail className="w-10 h-10 text-rose-500" />
                        </div>
                        <h1 className="text-4xl font-black text-rose-600 mb-1 tracking-tight">Secret Admirer</h1>
                        <p className="text-rose-400 font-medium">Send a mystery letter anonymously.</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-rose-50">
                        <form onSubmit={handleCreateNotice} className="space-y-6">
                            <input 
                                required
                                placeholder="Recipient's Name (e.g. My Crush)"
                                className="w-full bg-rose-50/50 border-2 border-rose-100 rounded-2xl p-4 outline-none focus:border-rose-400 text-rose-900 placeholder:text-rose-200"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                            />
                            <textarea 
                                required
                                placeholder="Write your secret message..."
                                className="w-full bg-rose-50/50 border-2 border-rose-100 rounded-2xl p-4 outline-none focus:border-rose-400 min-h-[150px] resize-none text-rose-900 placeholder:text-rose-200"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button disabled={isSending} className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                {isSending ? "Sealing..." : "Generate Secret Link ✨"}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* --- STAGE 2: SEND ANONYMOUSLY --- */
                <div className="w-full max-w-md z-10 text-center animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-rose-100">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-rose-600 mb-2">Letter Sealed!</h2>
                        
                        <div className="space-y-4 mt-6">
                            {/* OPTION 1: THE MIDDLEMAN EMAIL */}
                            <div className="p-4 border-2 border-dashed border-rose-100 rounded-2xl bg-rose-50/30">
                                <p className="text-[10px] font-bold text-rose-400 uppercase mb-3 tracking-[0.2em]">Send via Anonymous Email</p>
                                <input 
                                    type="email"
                                    placeholder="Enter their email address..."
                                    className="w-full p-3 text-center outline-none bg-white border border-rose-100 rounded-xl mb-3 shadow-sm text-sm"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                />
                                <button 
                                    onClick={handleSendAnonymousEmail}
                                    disabled={isSending || emailSent}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                                        emailSent 
                                        ? "bg-green-500 text-white cursor-default" 
                                        : "bg-rose-600 text-white hover:bg-rose-700"
                                    }`}
                                >
                                    {emailSent ? <CheckCircle2 size={18} /> : <Send size={18} />}
                                    {emailSent ? "Delivered!" : "Send to Inbox"}
                                </button>
                            </div>

                            {/* OPTION 2: MANUAL LINK */}
                            <div className="pt-2">
                                <p className="text-[10px] font-bold text-rose-400 uppercase mb-3 tracking-[0.2em]">Or Copy Link manually</p>
                                <button onClick={copyToClipboard} className="w-full py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-all shadow-sm">
                                    <Copy size={18} /> {copied ? "Link Copied!" : "Copy Private Link"}
                                </button>
                            </div>
                        </div>
                        
                        <button onClick={() => {setGeneratedLink(''); setEmailSent(false); setRecipientEmail('');}} className="mt-8 text-rose-300 text-xs font-bold uppercase tracking-widest hover:text-rose-500 transition-colors">
                            Write another secret note
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateAnonymous;