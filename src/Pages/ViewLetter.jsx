import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseclient";

const ViewLetter = () => {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchLetter = async () => {
      const { data } = await supabase.from("valentine_messages").select("*").eq("id", id).single();
      setLetter(data);
    };
    fetchLetter();
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke("send-valentine", {
      body: { letterId: id, replyMessage: replyText },
    });

    if (error) {
      console.error("Function Error:", error);
      setStatus("Failed to send notification.");
    } else {
      // Also update the DB row to show it was accepted/replied
      await supabase.from("valentine_messages").update({ reply_message: replyText, accepted: true }).eq("id", id);
      setStatus("Reply sent! The sender has been notified ❤️");
      setReplyText("");
    }
  };

  if (!letter) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff5f5]">
      <p className="text-[#ff2d55] font-medium animate-pulse">Loading Secret Message...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans text-[#4a0e0e] selection:bg-pink-100">
      {/* Header matching DigiLove branding */}
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

      {/* Main Content Card */}
      <main className="flex flex-col items-center justify-center pt-10 pb-20 px-4">
        <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(255,182,193,0.2)] p-8 md:p-12 max-w-lg w-full text-center relative border border-white/50">
          
          {/* Floating Action Icon */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#ff2d55] text-white p-4 rounded-full shadow-lg shadow-pink-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>

          <p className="text-[10px] uppercase tracking-[0.3em] text-[#ff2d55] font-black mb-8">Secret Message</p>
          
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">For {letter.recipient_name}</h2>
          
          {/* The Content Bubble */}
          <div className="bg-[#fffafa] border-2 border-dashed border-pink-100 rounded-[30px] p-8 mb-8">
            <p className="italic text-xl text-gray-700 leading-relaxed">
              "{letter.content}"
            </p>
          </div>

          <h3 className="text-[#ff2d55] italic font-bold text-lg mb-8 tracking-wide">
            Will you be my Valentine?
          </h3>

          {/* Form and Reply Logic */}
          <form onSubmit={handleReply} className="space-y-6">
            <textarea
              className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none text-center text-gray-600 placeholder:text-gray-300 shadow-inner"
              placeholder="Write a message back..."
              rows="3"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="flex-[2] bg-[#ff2d55] hover:bg-[#e6264d] text-white font-black py-5 px-8 rounded-full shadow-xl shadow-pink-100 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
              >
                <span className="bg-white/20 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                Yes, I'd love to!
              </button>
              
              <button
                type="button"
                onClick={() => setStatus("Nice try! You have to say yes 😉")}
                className="flex-1 bg-white border border-gray-100 text-gray-300 font-bold py-5 px-8 rounded-full hover:bg-gray-50 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
              >
                ✕ No
              </button>
            </div>
          </form>

          {/* Sender Signature */}
          <div className="mt-12 pt-8 border-t border-pink-50">
             <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">With Love,</p>
             <p className="text-3xl font-black text-[#4a0e0e]">{letter.sender_name || "Anonymous"}</p>
          </div>

          {/* Status Notification */}
          {status && (
            <div className="absolute -bottom-16 left-0 right-0">
              <p className="text-sm font-bold text-[#ff2d55] bg-white inline-block px-6 py-2 rounded-full shadow-md animate-bounce">
                {status}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewLetter;