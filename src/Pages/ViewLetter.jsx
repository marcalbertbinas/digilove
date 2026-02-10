import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseclient"; 

const ViewLetter = () => {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState("");
  const [showWriter, setShowWriter] = useState(false); // Toggle for writing

  useEffect(() => {
    const fetchLetter = async () => {
      const { data } = await supabase.from("valentine_messages").select("*").eq("id", id).single();
      setLetter(data);
    };
    fetchLetter();
  }, [id]);

  const sendResponse = async (finalMessage) => {
    setStatus("Sending...");

    const { data, error } = await supabase.functions.invoke("send-valentine", {
      body: { 
        letterId: id, 
        replyMessage: finalMessage
      },
    });

    if (error) {
      setStatus("Failed to send notification.");
    } else {
      await supabase.from("valentine_messages").update({ 
        reply_message: finalMessage, 
        accepted: true 
      }).eq("id", id);
      setStatus("Reply sent! The sender has been notified ❤️");
      setReplyText("");
      setShowWriter(false);
    }
  };

  if (!letter) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff5f5]">
      <p className="text-[#ff2d55] font-medium animate-pulse">Loading Secret Message...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans text-[#4a0e0e] selection:bg-pink-100">
      <header className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">❤️</span>
          <h1 className="text-2xl font-bold tracking-tight text-[#ff2d55]">DigiLove</h1>
        </div>
        <div className="flex gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          <Link to="/" className="hover:text-[#ff2d55] transition-colors">Create Yours</Link>
          <span>EST. 2026</span>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center pt-4 pb-20 px-4">
        <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(255,182,193,0.15)] p-8 max-w-md w-full text-center relative border border-white/50">
          
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#ff2d55] text-white p-4 rounded-full shadow-lg">
            <HeartIcon />
          </div>

          <p className="text-[10px] uppercase tracking-[0.3em] text-[#ff2d55] font-black mt-4 mb-6">Secret Message</p>
          
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight">For {letter.recipient_name}</h2>
          
          <div className="bg-[#fffafa] border-2 border-dashed border-pink-100 rounded-[24px] p-6 mb-8">
            <p className="italic text-lg text-gray-700 leading-relaxed">"{letter.content}"</p>
          </div>

          <h3 className="text-[#ff2d55] italic font-bold text-xs mb-8 tracking-widest uppercase">
            Will you be my Valentine?
          </h3>

          {!showWriter ? (
            /* CHOICE 1: The Quick Buttons */
            <div className="space-y-4 max-w-xs mx-auto">
              <div className="flex gap-3">
                <button
                  onClick={() => sendResponse("Yes! ❤️")}
                  className="flex-[2] bg-[#ff2d55] hover:bg-[#e6264d] text-white font-black py-4 rounded-full shadow-lg transition-all active:scale-95 uppercase text-[10px] tracking-widest"
                >
                  ✓ Yes
                </button>
                <button
                  onClick={() => setStatus("Nice try! You have to say yes 😉")}
                  className="flex-1 bg-white border border-gray-100 text-gray-300 font-bold py-4 rounded-full hover:bg-gray-50 transition-all uppercase text-[10px] tracking-widest"
                >
                  ✕ No
                </button>
              </div>
              
              <button 
                onClick={() => setShowWriter(true)}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-600 underline transition-colors"
              >
                Or write a custom reply
              </button>
            </div>
          ) : (
            /* CHOICE 2: The Custom Writer */
            <div className="animate-in fade-in zoom-in-95 duration-300 max-w-xs mx-auto space-y-4">
              <textarea
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none text-center text-sm text-gray-600 shadow-inner"
                placeholder="What's on your mind?..."
                rows="3"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => sendResponse(replyText)}
                  disabled={!replyText}
                  className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-full text-[10px] uppercase tracking-widest shadow-md disabled:opacity-50"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowWriter(false)}
                  className="px-4 py-3 bg-gray-100 text-gray-400 rounded-full text-[10px] font-bold"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-pink-50">
             <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">With Love,</p>
             <p className="text-2xl font-black text-[#4a0e0e]">{letter.sender_nickname || "Anonymous"}</p>
          </div>

          {status && (
            <div className="mt-6">
              <p className="text-[11px] font-bold text-[#ff2d55] bg-pink-50 inline-block px-6 py-2 rounded-full animate-pulse shadow-sm">
                {status}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
)

export default ViewLetter;