import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseclient"; 

const ViewLetter = () => {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);
  const [sourceTable, setSourceTable] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState("");
  const [showWriter, setShowWriter] = useState(false);

  useEffect(() => {
    const fetchDynamicLetter = async () => {
      // 1. Check Letters Table
      const { data: letterData } = await supabase
        .from("Letters")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (letterData) {
        setLetter(letterData);
        setSourceTable("Letters");
        return;
      }

      // 2. Check valentine_messages Table
      const { data: anonData } = await supabase
        .from("valentine_messages")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (anonData) {
        setLetter(anonData);
        setSourceTable("valentine_messages");
      }
    };
    if (id) fetchDynamicLetter();
  }, [id]);

  const sendResponse = async (finalMessage) => {
    setStatus("Sending...");

    // This invokes your Edge Function which is currently failing because 
    // it can't find 'sender_email' in the row it's looking up.
    const { error: funcError } = await supabase.functions.invoke("send-valentine", {
      body: { letterId: id, replyMessage: finalMessage },
    });

    if (funcError) {
      console.error("Function Error:", funcError);
      setStatus("Failed to send notification email.");
      return; 
    }

    // Update the correct table based on where the letter was found
    const { error: dbError } = await supabase
      .from(sourceTable)
      .update({ 
        reply_message: finalMessage, 
        ...(sourceTable === "valentine_messages" ? { accepted: true } : { response: "Accepted" }) 
      })
      .eq("id", id);

    if (dbError) {
      setStatus("Failed to save reply to database.");
    } else {
      setStatus("Reply sent! ❤️");
      setShowWriter(false);
    }
  };

  if (!letter) return <div className="p-20 text-center text-rose-500">Loading...</div>;

  // Map display fields based on which table we found the data in
  const displayRecipient = sourceTable === "Letters" ? letter.recipient : letter.recipient_name;
  const displayContent = sourceTable === "Letters" ? (letter.messages || letter.content) : letter.content;
  const displaySender = sourceTable === "Letters" ? letter.sender : letter.sender_nickname;

  return (
    <div className="min-h-screen bg-[#fff5f5] p-4 flex flex-col items-center justify-center">
      <div className="bg-white rounded-[40px] shadow-xl p-8 max-w-md w-full text-center border border-white/50">
        <p className="text-[10px] uppercase tracking-widest text-rose-500 font-bold mb-4">
          {sourceTable === "Letters" ? "Valentine Letter" : "Secret Message"}
        </p>
        <h2 className="text-3xl font-black mb-4">For {displayRecipient}</h2>
        <div className="bg-rose-50 rounded-2xl p-6 mb-6 italic text-gray-700">
          "{displayContent}"
        </div>
        
        {/* Reply Logic remains similar to your original ViewLetter.jsx */}
        {!showWriter ? (
          <button onClick={() => sendResponse("Yes! ❤️")} className="bg-rose-500 text-white w-full py-4 rounded-full font-bold">
            ✓ Say Yes
          </button>
        ) : (
          <textarea 
            className="w-full p-4 bg-gray-50 rounded-xl mb-4" 
            value={replyText} 
            onChange={(e) => setReplyText(e.target.value)} 
          />
        )}
        
        <div className="mt-8 pt-6 border-t border-rose-50">
          <p className="text-xs text-gray-400 uppercase">From</p>
          <p className="text-xl font-bold">{displaySender}</p>
        </div>
        {status && <p className="mt-4 text-rose-500 font-bold text-sm">{status}</p>}
      </div>
    </div>
  );
};

export default ViewLetter;