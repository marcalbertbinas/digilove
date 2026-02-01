import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { supabase } from '../supabaseclient.js';
import idea from '../assets/idea.png'

function LandingPage() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suggestion, setSuggestion] = useState('');

    const handleSendSuggestion = async () => {
    // 1. Check if suggestion is empty
    if (!suggestion.trim()) return;

    // 2. Send to Supabase
    const { data, error } = await supabase
        .from('Suggestions') // I recommend a separate table
        .insert([
            { suggestion: suggestion } // Matches the column name in your DB
        ]);

    if (error) {
        console.error("Error sending suggestion:", error.message);
        alert("Oops! Couldn't send. Check your connection.");
    } else {
        alert("Thanks for the suggestion!");
        setSuggestion('');
        setIsModalOpen(false);
    }
};

    return (
        <div className="min-h-screen w-full bg-rose-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_65%)] from-rose-200/60 flex flex-col relative">
            <Header />

            <div className="flex-1 flex flex-col justify-center items-center gap-2 px-4 text-center">
                <div className="text-rose-500 text-4xl mb-2 animate-bounce">❤️</div>

                <h1 className="text-[50px] md:text-[60px] font-bold text-rose-500 leading-tight">
                    Welcome to <span className="text-rose-600">DigiLove!</span>
                </h1>

                <div className="space-y-1 mb-6">
                    <p className="text-[16px] text-rose-800 font-medium">Make your own custom Valentine's Day message!</p>
                    <p className="text-[15px] text-rose-700/80">Make your loved one's day special!</p>
                </div>

                <button 
                    className="bg-rose-500 cursor-pointer hover:bg-rose-600 hover:scale-105 transition-all text-white font-bold py-3 px-10 rounded-full shadow-lg"
                    onClick={() => navigate('/create')}
                >
                    Get Started
                </button>
            </div>

            {/* --- FLOATING SUGGESTION ICON --- */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end group">
                {/* Hover Label */}
                <span className="mb-2 mr-2 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Have a suggestion??
                </span>
                
                {/* The "Icon" (Using an Emoji or Image) */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white border-2 border-rose-400 p-3 rounded-full shadow-xl hover:rotate-12 hover:scale-110 transition-all duration-300 cursor-pointer"
                >
                    <img className='h-7 w-7'  src={idea} alt="suggestion" />
                    {/* You can replace the emoji above with <img src="your-image.png" className="w-8 h-8"/> */}
                </button>
            </div>

            {/* --- MODAL FORM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-bold text-rose-600 mb-2 text-center">We'd Love to Hear! 💌</h2>
                        <p className="text-rose-400 text-sm text-center mb-4">How can we make DigiLove better?</p>
                        
                        <textarea 
                            className="w-full border-2 border-rose-100 rounded-xl p-3 outline-none focus:border-rose-400 text-rose-800 min-h-[100px]"
                            placeholder="Your suggestion..."
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                        />
                        
                        <div className="flex gap-3 mt-4">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-2 text-rose-400 font-bold hover:bg-rose-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendSuggestion}
                                className="flex-1 py-2 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-md"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LandingPage