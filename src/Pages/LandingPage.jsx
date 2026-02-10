import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { supabase } from '../supabaseclient.js';
import { 
    Inbox, 
    Sparkles, 
    Send, 
    X, 
    Ghost, 
    Heart, 
    Mail, 
    MessageSquareHeart 
} from 'lucide-react';

function LandingPage() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);

    const handleSendSuggestion = async () => {
        if (!suggestion.trim()) return;
        
        setIsSending(true);
        const { error } = await supabase
            .from('Suggestions')
            .insert([{ suggestion: suggestion.trim() }]);

        setIsSending(false);

        if (error) {
            console.error("Error sending suggestion:", error.message);
            setErrorModal(true);
            setTimeout(() => setErrorModal(false), 3000);
        } else {
            setSuggestion('');
            setSuccessModal(true);
            setIsModalOpen(false);
            setTimeout(() => setSuccessModal(false), 3000);
        }
    };

    return (
        <div className="min-h-screen w-full bg-rose-50 flex flex-col relative overflow-hidden font-sans">
            
            {/* Background Decorative Icons */}
            <div className="absolute top-20 left-10 text-rose-200/40 rotate-12 select-none pointer-events-none">
                <Heart size={120} fill="currentColor" />
            </div>
            <div className="absolute bottom-10 right-10 text-rose-200/30 -rotate-12 select-none pointer-events-none">
                <Mail size={160} />
            </div>

            <Header />

            <main className="flex-1 flex flex-col justify-center items-center gap-6 px-4 text-center z-10 py-12">
                
                {/* Floating Icon Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm animate-bounce">
                        <Heart className="w-8 h-8 text-rose-500" fill="currentColor" />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm animate-bounce [animation-delay:0.2s]">
                        <Ghost className="w-8 h-8 text-rose-400" />
                    </div>
                </div>

                <h1 className="text-[52px] md:text-[82px] font-black text-rose-500 leading-tight tracking-tight">
                    Digi<span className="text-rose-600">Love</span>
                </h1>

                <div className="max-w-lg space-y-4 mb-8">
                    <p className="text-xl md:text-2xl text-rose-800 font-semibold italic">
                        The modern way to say "I love you."
                    </p>
                    <p className="text-rose-700/70 text-base md:text-lg leading-relaxed">
                        Design a custom digital letter for your person, or send an 
                        <span className="font-bold text-rose-600"> Anonymous Notice</span> as a secret admirer.
                    </p>
                </div>

                {/* --- DUAL CTA SECTION --- */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl px-4">
                    {/* CTA 1: Standard Letter */}
                    <button 
                        onClick={() => navigate('/create')}
                        className="group relative flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-5 px-8 rounded-3xl shadow-[0_15px_30px_-10px_rgba(244,63,94,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                            Create Letter <Sparkles size={20} />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>

                    {/* CTA 2: Anonymous Letter */}
                    <button 
                        onClick={() => navigate('/create-anonymous')}
                        className="group relative flex-1 bg-white border-2 border-rose-200 text-rose-600 hover:border-rose-400 hover:bg-rose-50 font-bold py-5 px-8 rounded-3xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                            Secret Admirer <Ghost size={20} />
                        </span>
                        <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                            New
                        </span>
                    </button>
                </div>
                
                <p className="mt-8 text-rose-400 text-sm font-medium flex items-center gap-2">
                    <MessageSquareHeart size={16} /> Fast, secure, and 100% digital.
                </p>
            </main>

            {/* --- FLOATING SUGGESTION BOX --- */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
                <div className="group relative">
                    <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-4 py-2 bg-rose-900 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        Leave a suggestion!
                    </span>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white border-2 border-rose-100 p-4 rounded-2xl shadow-2xl hover:border-rose-400 hover:rotate-6 transition-all duration-300 group-hover:shadow-rose-200/50"
                    >
                        <Inbox className="w-7 h-7 text-rose-500" />
                    </button>
                </div>
            </div>

            {/* ERROR MODAL */}
            {errorModal && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-4 bg-white border-2 border-rose-200 p-4 rounded-2xl shadow-xl animate-in slide-in-from-bottom-5">
                    <div className="bg-rose-100 p-2 rounded-full">
                        <X className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-rose-800 text-sm font-medium pr-8">
                        Oops! Couldn't send. Check your connection.
                    </p>
                    <button onClick={() => setErrorModal(false)} className="absolute top-2 right-2 p-1 hover:bg-rose-50 rounded-full">
                        <X className="w-4 h-4 text-rose-300" />
                    </button>
                </div>
            )}

            {/* SUCCESS MODAL */}
            {successModal && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] max-w-md w-[90%] flex items-center gap-4 bg-white border-2 border-rose-200 p-4 rounded-2xl shadow-xl animate-in slide-in-from-top-5">
                    <div className="bg-green-100 p-2 rounded-full">
                        <Heart className="w-4 h-4 text-green-500" fill="currentColor" />
                    </div>
                    <p className="text-rose-800 text-xs md:text-sm font-medium pr-8 leading-tight">
                        Thank you for your suggestion! You're helping us build a better experience for everyone.
                    </p>
                    <button onClick={() => setSuccessModal(false)} className="absolute top-2 right-2 p-1 hover:bg-rose-50 rounded-full">
                        <X className="w-4 h-4 text-rose-300" />
                    </button>
                </div>
            )}

            {/* SUGGESTION MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-rose-900/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border-b-[12px] border-rose-500 animate-in zoom-in duration-300 relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-rose-300 hover:text-rose-500 transition-colors">
                            <X size={28} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-4 rotate-3 shadow-inner">
                                <Inbox className="w-10 h-10 text-rose-500" />
                            </div>
                            <h2 className="text-3xl font-black text-rose-900 mb-2">Help us grow!</h2>
                            <p className="text-rose-400 text-sm mb-6">Your ideas make DigiLove more romantic.</p>
                            
                            <textarea 
                                className="w-full bg-rose-50/50 border-2 border-rose-100 rounded-3xl p-5 outline-none focus:border-rose-400 text-rose-800 min-h-[140px] transition-all resize-none placeholder:text-rose-300"
                                placeholder="What feature should we add next?"
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                            />
                            
                            <button 
                                onClick={handleSendSuggestion}
                                disabled={isSending || !suggestion.trim()}
                                className="w-full mt-6 py-5 bg-rose-500 text-white font-black text-lg rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSending ? "Sending..." : <>Send Suggestion <Send size={20} /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LandingPage;