import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseclient.js';
import Header from '../components/Header';
import { Sparkles, Heart, Send, Check, X, Loader2, PartyPopper } from 'lucide-react';

function LetterView() {
    const { id } = useParams();
    const [letter, setLetter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sourceTable, setSourceTable] = useState('');
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showCustomReply, setShowCustomReply] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const fetchLetter = async () => {
        try {
            // Check both tables for the message
            let { data, error: firstError } = await supabase.from('Letters').select('*').eq('id', id).single();
            
            if (!firstError && data) {
                setLetter({ ...data, display_text: data.messages });
                setSourceTable('Letters');
            } else {
                let { data: secondData, error: secondError } = await supabase.from('valentine_messages').select('*').eq('id', id).single();
                if (secondError) throw secondError;
                setLetter({ ...secondData, display_text: secondData.content });
                setSourceTable('valentine_messages');
            }
        } catch (err) {
            setError("This letter hasn't arrived yet.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLetter(); }, [id]);

    const handleQuickResponse = async (isYes) => {
        const responseText = isYes ? "Yes, I'd love to! ❤️" : "No 💔";
        await submitReply(responseText, isYes);
    };

    const submitReply = async (text, isAccepted) => {
        setIsSending(true);
        try {
            // Update the columns we added to your table
            const { error } = await supabase
                .from(sourceTable)
                .update({ 
                    reply_message: text,
                    accepted: isAccepted 
                })
                .eq('id', id);

            if (error) throw error;
            
            // Show the "Sent" alert
            setShowSuccessAlert(true);
            
            // Re-fetch data to update UI
            await fetchLetter(); 

            // Hide alert after 3 seconds
            setTimeout(() => setShowSuccessAlert(false), 3000);
            
        } catch (err) {
            alert("Failed to send your reply.");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#fff1f2] flex items-center justify-center">
            <Heart className="text-[#ff2d55] animate-pulse" size={50} fill="currentColor" />
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#fff1f2] flex flex-col items-center justify-center p-6 font-sans relative">
            <Header />

            {/* Floating Success Alert */}
            {showSuccessAlert && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-[#ff2d55] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 duration-500">
                    <PartyPopper size={20} />
                    <span className="font-bold tracking-wide">Reply Sent Successfully!</span>
                </div>
            )}
            
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-10 text-center relative mt-10 border border-white/20">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#ff2d55] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-[#fff1f2]">
                    <Sparkles size={20} fill="currentColor" />
                </div>

                <div className="space-y-6">
                    <p className="text-[#ff7da0] font-bold uppercase text-[10px] tracking-[0.2em]">Secret Message</p>
                    <h1 className="text-4xl font-black text-[#8b1d31]">For {letter?.recipient_name}</h1>
                    <div className="text-xl text-[#8b1d31] italic py-4">"{letter?.display_text}"</div>

                    <div className="pt-6 border-t border-[#fff5f6]">
                        {!letter?.reply_message ? (
                            <div className="space-y-6">
                                <p className="font-bold text-[#ff2d55] text-lg italic">Will you be my Valentine?</p>
                                
                                {!showCustomReply ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-4 justify-center">
                                            <button 
                                                disabled={isSending}
                                                onClick={() => handleQuickResponse(true)}
                                                className="flex-1 bg-[#ff2d55] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#e6294d] transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                            >
                                                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Yes, I'd love to!
                                            </button>
                                            <button 
                                                disabled={isSending}
                                                onClick={() => handleQuickResponse(false)}
                                                className="flex-1 bg-white text-[#ccc] border border-[#eee] py-4 rounded-full font-bold hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2"
                                            >
                                                <X size={18} /> No
                                            </button>
                                        </div>
                                        <button 
                                            disabled={isSending}
                                            onClick={() => setShowCustomReply(true)}
                                            className="text-[#ff7da0] text-sm font-bold underline decoration-2 underline-offset-4 hover:text-[#ff2d55]"
                                        >
                                            Or write a message back
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                        <textarea 
                                            className="w-full p-4 rounded-2xl bg-[#fff8f9] border border-[#ffdee3] text-[#8b1d31] focus:outline-none focus:ring-2 focus:ring-[#ff7da0] transition-all resize-none italic"
                                            placeholder="Type your response here..."
                                            rows="3"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setShowCustomReply(false)}
                                                className="bg-white text-[#8b1d31] border border-[#ffdee3] px-6 py-4 rounded-full font-bold text-sm"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={() => submitReply(replyText, true)}
                                                disabled={isSending || !replyText.trim()}
                                                className="flex-1 bg-[#ff2d55] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Send
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* THE SUCCESS STATE: This is how they know for sure it sent */
                            <div className="bg-[#fff8f9] p-8 rounded-[2rem] text-center border-2 border-[#ffdee3] shadow-inner animate-in zoom-in-95 duration-700">
                                <div className="flex justify-center mb-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <Check size={24} strokeWidth={3} />
                                    </div>
                                </div>
                                <p className="text-[#ff7da0] text-xs font-bold uppercase tracking-widest mb-2">Message Sent!</p>
                                <p className="text-xl font-black text-[#ff2d55] italic uppercase tracking-tight leading-tight">
                                    "{letter.reply_message}"
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6">
                        <p className="text-[#ff7da0] text-[10px] uppercase font-bold tracking-widest mb-1">With love,</p>
                        <p className="text-2xl font-black text-[#8b1d31]">
                            {letter?.sender_nickname || letter?.sender || "Secret Admirer"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LetterView;