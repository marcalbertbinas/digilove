import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseclient'; 

const ViewLetter = () => {
  const { id } = useParams(); 
  const [letterData, setLetterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const fetchLetter = async () => {
      const { data, error } = await supabase
        .from('Letters') 
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error("Fetch Error:", error.message);
      if (data) setLetterData(data);
      setLoading(false);
    };

    if (id) fetchLetter();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center text-rose-500 font-bold">Opening your letter...</div>;
  if (!letterData) return <div className="h-screen flex items-center justify-center text-rose-500 font-bold">Letter not found. ❤️</div>;

  return (
    <div className="relative min-h-screen bg-rose-50 flex items-center justify-center overflow-hidden p-6">
      
      {/* Background Layer: Logic for Photo Hearts OR Broken Hearts */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {isRejected ? (
          // Broken Hearts falling
          [...Array(20)].map((_, i) => (
            <div
              key={`broken-${i}`}
              className="absolute animate-falling-heart text-5xl"
              style={{
                left: `${Math.random() * 90}%`,
                animationDuration: `${3 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 2}s`,
                top: '-60px',
              }}
            >
              💔
            </div>
          ))
        ) : (
          // Photo Hearts falling
          letterData.images?.map((url, i) => {
            const randomX = (i * 27) % 85; 
            const randomSize = 150 + ((i * 47) % 100); 
            const randomDuration = 6 + (i % 5);
            
            return (
              <div
                key={i}
                className="absolute animate-falling-heart"
                style={{
                  left: `${randomX}%`,
                  width: `${randomSize}px`,
                  height: `${randomSize}px`,
                  animationDuration: `${randomDuration}s`,
                  top: '-300px',
                  WebkitMaskImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>')`,
                  maskImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>')`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat'
                }}
              >
                <img src={url} className="w-full h-full object-cover" alt="falling-memory" />
              </div>
            );
          })
        )}
      </div>

      {/* The Single Letter Card */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-rose-100 animate-in fade-in zoom-in duration-700">
        
        <h1 className="text-3xl font-bold text-rose-600 mb-4">
          {isRejected ? "Noooooo" : isAccepted ? "Thank You, See you on Feb 14!" : `For ${letterData.recipient}`}
        </h1>
        
        <p className="text-rose-800 text-lg leading-relaxed italic mb-6">
          {isRejected 
            ? "Aray mo pakak" 
            : isAccepted 
            ? "You've made me the happiest person ever! see you soon! "
            : `"${letterData.messages || "No message found."}"`}
        </p>

        {!isRejected && !isAccepted && (
          <>
            <h2 className="text-2xl font-bold text-rose-500 mb-6 tracking-tight">Can you be my Valentine?</h2>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setIsAccepted(true)} 
                className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform active:scale-95"
              >
                Yes!
              </button>
              <button 
                onClick={() => setIsRejected(true)} 
                className="bg-rose-200 text-rose-700 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-rose-300 transition-colors active:scale-95"
              >
                No
              </button>
            </div>
          </>
        )}

        {isRejected && (
           <button onClick={() => setIsRejected(false)} className="mt-4 text-rose-400 text-sm hover:underline">
             Wait, I changed my mind! 🥺
           </button>
        )}

        <p className="text-rose-400 font-medium mt-8 border-t border-rose-100 pt-4">— With love, {letterData.sender}</p>
      </div>
    </div>
  );
};

export default ViewLetter;