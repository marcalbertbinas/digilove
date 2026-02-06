import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { Heart, Sparkles, Calendar, MapPin } from 'lucide-react';

const ViewLetter = () => {
  const { id } = useParams();
  const [letterData, setLetterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchLetter = async () => {
      const { data, error } = await supabase.from('Letters').select('*').eq('id', id).single();
      if (data) setLetterData(data);
      setLoading(false);
    };
    if (id) fetchLetter();
  }, [id]);

  const moveNoButton = () => {
    const x = Math.random() * 250 - 125;
    const y = Math.random() * 150 - 75;
    setNoButtonPos({ x, y });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fff5f5]">
      <div className="relative">
        <Heart className="w-12 h-12 text-rose-400 animate-ping absolute opacity-20" />
        <Heart className="w-12 h-12 text-rose-500 animate-pulse relative" />
      </div>
      <p className="mt-4 text-rose-400 font-medium tracking-widest animate-pulse">UNSEALING...</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#fff5f5] flex items-center justify-center overflow-hidden p-4">
      
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200 rounded-full blur-[120px] opacity-50 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200 rounded-full blur-[120px] opacity-50 animate-pulse delay-700" />
      </div>

      {/* Floating Memories (Images) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {!isRejected && letterData?.images?.map((url, i) => (
          <div
            key={i}
            className="absolute animate-float shadow-2xl border-[6px] border-white overflow-hidden bg-white"
            style={{
              left: `${(i * 25) + 5}%`,
              width: '140px',
              height: '160px',
              animationDuration: `${6 + i}s`,
              animationDelay: `${i * 0.5}s`,
              top: '110%',
              transform: `rotate(${i % 2 === 0 ? 5 : -5}deg)`,
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)'
            }}
          >
            <img src={url} className="w-full h-[80%] object-cover" alt="us" />
            <div className="h-[20%] flex items-center justify-center">
              <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
            </div>
          </div>
        ))}
      </div>

      {/* The Letter Card */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Top Decorative Wax Seal or Icon */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-rose-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <Sparkles className="text-white w-6 h-6" />
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,182,193,0.4)] border border-white/50 text-center relative overflow-hidden">
          
          {/* Content */}
          <header className="mb-6">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-[0.2em]">Private Message</span>
            <h1 className="text-4xl font-serif font-bold text-rose-900 mt-2">
              {isAccepted ? "It's a Date! ✨" : isRejected ? "Oh, My Heart... 🥺" : `For ${letterData.recipient}`}
            </h1>
          </header>

          <div className="relative py-6">
            <p className="text-rose-800 text-xl leading-relaxed font-serif italic">
              {isAccepted 
                ? "You've just made this Valentine's Day the most special one yet. I can't wait to see your smile! ❤️" 
                : isRejected 
                ? "Aray ko! My heart just did a little backflip of sadness... are you really sure?" 
                : `"${letterData.messages}"`}
            </p>
          </div>

          {!isAccepted && !isRejected && (
            <div className="mt-8 space-y-6">
              <div className="flex flex-col items-center gap-2 text-rose-400">
                <Heart className="w-5 h-5 fill-rose-400 animate-bounce" />
                <h2 className="text-xl font-medium tracking-tight">Will you be my Valentine?</h2>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-4 relative h-16">
                <button 
                  onClick={() => setIsAccepted(true)}
                  className="px-10 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-lg shadow-xl shadow-rose-200 transition-all hover:scale-110 active:scale-95 z-20"
                >
                  Yes, I'd love to!
                </button>

                <button 
                  onMouseEnter={moveNoButton}
                  onClick={moveNoButton}
                  style={{ 
                    transform: `translate(${noButtonPos.x}px, ${noButtonPos.y}px)`,
                  }}
                  className="px-8 py-3 bg-white text-rose-300 border border-rose-100 rounded-full font-semibold transition-all duration-200 z-10"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {isAccepted && (
            <div className="mt-8 p-6 bg-rose-50/50 rounded-2xl border border-rose-100 animate-in zoom-in duration-500">
              <div className="flex items-center justify-center gap-4 text-rose-600 font-medium">
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Feb 14</div>
                <div className="w-1 h-1 bg-rose-300 rounded-full" />
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Secret Location</div>
              </div>
            </div>
          )}

          {isRejected && (
            <button 
              onClick={() => {setIsRejected(false); setNoButtonPos({x:0, y:0})}}
              className="mt-6 text-rose-400 text-sm font-medium underline underline-offset-4 hover:text-rose-600 transition-colors"
            >
              Wait, I clicked by mistake! Take me back 🥺
            </button>
          )}

          <footer className="mt-12 pt-6 border-t border-rose-100/50">
            <p className="text-rose-300 italic">Always yours,</p>
            <p className="text-2xl font-serif font-bold text-rose-700">{letterData.sender}</p>
          </footer>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120vh) rotate(20deg); opacity: 0; }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ViewLetter;