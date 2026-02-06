import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { supabase } from '../supabaseclient.js';
import { Inbox, Sparkles, Send, X } from 'lucide-react'; // Swapping for Lucide

function LandingPage() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [errorModal, setErrorModal] = useState (false);
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
            setErrorModal(true)
            setTimeout(() => setErrorModal(false), 3000); // Auto-hide after 5s
            // alert("Oops! Couldn't send. Check your connection.");
        } else {
            setSuggestion('');
            setSuccessModal(true)
            setIsModalOpen(false);
            setTimeout(() => setSuccessModal(false), 3000); // Auto-hide after 5s
            
            // You could trigger a toast notification here instead of alert
        }
    };

    return (
        <div className="min-h-screen w-full bg-rose-50 flex flex-col relative overflow-hidden font-sans">
            {/* Background Decorative Hearts */}
            <div className="absolute top-20 left-10 text-rose-200/40 rotate-12 select-none pointer-events-none">
                <Heart size={120} fill="currentColor" />
            </div>

            <Header />

            <main className="flex-1 flex flex-col justify-center items-center gap-4 px-4 text-center z-10">
                <div className="bg-white/50 backdrop-blur-sm p-2 rounded-full mb-2">
                    <div className="text-rose-500 text-3xl animate-bounce">💌</div>
                </div>

                <h1 className="text-[52px] md:text-[72px] font-black text-rose-500 leading-tight tracking-tight">
                    Digi<span className="text-rose-600">Love</span>
                </h1>

                <div className="max-w-md space-y-2 mb-8">
                    <p className="text-xl text-rose-800 font-semibold italic">
                        Create memories in a click.
                    </p>
                    <p className="text-rose-700/70">
                        Design a custom digital Valentine's letter that 
                        captures your story perfectly.
                    </p>
                </div>

                <button 
                    className="group relative bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-12 rounded-full shadow-[0_10px_20px_rgba(244,63,94,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 overflow-hidden"
                    onClick={() => navigate('/create')}
                >
                    <span className="relative cursor-pointer z-10 flex items-center gap-2">
                        Get Started <Sparkles size={18} />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
            </main>

            {/* --- FLOATING SUGGESTION BOX ICON --- */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
                <div className="group relative">
                    <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-4 py-2 bg-rose-900 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        Leave a suggestion! 📮
                    </span>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white border-2 border-rose-200 p-4 rounded-2xl shadow-2xl hover:border-rose-400 hover:rotate-6 transition-all duration-300 cursor-pointer group-hover:shadow-rose-200/50"
                    >
                        <Inbox className="w-7 h-7 text-rose-500" />
                    </button>
                </div>
            </div>

            {errorModal && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-4 bg-white border-2 border-rose-200 p-4 rounded-2xl shadow-xl animate-in slide-in-from-bottom-5">
                    {/* Error Icon */}
                    <div className="bg-rose-100 p-2 rounded-full">
                    <X className="w-4 h-4 text-rose-500" />
                </div>
                    <p className="text-rose-800 text-sm font-medium pr-8">
                    Oops! Couldn't send. Check your connection.
                    </p>

                    <button 
                    className="absolute top-2 right-2 p-1 hover:bg-rose-50 rounded-full transition-colors" 
                    onClick={() => setErrorModal(false)} // Fixed arrow function
                    >
                    <X className="w-4 h-4 text-rose-300" />
                    </button>
                </div>
                )}

            {successModal && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-4 bg-white border-2 border-rose-200 p-4 rounded-2xl shadow-xl animate-in slide-in-from-bottom-5">
                    {/* Error Icon */}
                    
                    <p className="text-rose-800 text-sm font-medium pr-8">
                        Thank you for your suggestion, It will help our software to provide a good experience to everyone
                    </p>
                    <button 
                    className="absolute top-2 right-2 p-1 hover:bg-rose-50 rounded-full transition-colors" 
                    onClick={() => setSuccessModal(false)} // Fixed arrow function
                    >
                    <X className="w-4 h-4 text-rose-300" />
                    </button>
                </div>
            )}

            {/* --- SUGGESTION MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-rose-900/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-b-8 border-rose-500 animate-in zoom-in duration-300 relative">
                        {/* Close Button */}
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-rose-300 hover:text-rose-500"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                                <Inbox className="w-8 h-8 text-rose-500" />
                            </div>
                            <h2 className="text-2xl font-black text-rose-900 mb-2">Help us grow! 💌</h2>
                            <p className="text-rose-400 text-sm mb-6">Your ideas make DigiLove more romantic.</p>
                            
                            <textarea 
                                className="w-full bg-rose-50/50 border-2 border-rose-100 rounded-2xl p-4 outline-none focus:border-rose-400 text-rose-800 min-h-[120px] transition-colors resize-none"
                                placeholder="What feature should we add next?"
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                            />
                            
                            <button 
                                onClick={handleSendSuggestion}
                                disabled={isSending || !suggestion.trim()}
                                className="w-full mt-6 py-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSending ? "Sending..." : <>Send Message <Send size={18} /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Small helper for the background deco
const Heart = ({ size, fill }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

export default LandingPage;