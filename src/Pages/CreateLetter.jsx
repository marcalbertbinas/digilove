import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import FallingImages from '../components/FallingImg.jsx';
import { supabase } from '../supabaseclient.js';

function CreateLetter() {
  const [searchParams] = useSearchParams();
  const replyToId = searchParams.get('replyTo'); 

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    recipient: '', 
    from: '', 
    recipient_email: '', 
    messages: '' 
  });

  const [isSealing, setIsSealing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [previews, setPreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (replyToId) {
      const fetchOriginalSender = async () => {
        const { data, error } = await supabase
          .from('Letters')
          .select('sender')
          .eq('id', replyToId)
          .single();
        if (!error && data) setFormData(prev => ({ ...prev, recipient: data.sender }));
      };
      fetchOriginalSender();
    }
  }, [replyToId]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...urls]);
    setImageFiles([...imageFiles, ...files]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews(previews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleSealAndSend = async () => {
    setIsSealing(true);
    try {
      const imageUrls = [];
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        await supabase.storage.from('letter-images').upload(fileName, file);
        const { data } = supabase.storage.from('letter-images').getPublicUrl(fileName);
        imageUrls.push(data.publicUrl);
      }

      const { data, error } = await supabase
        .from('Letters')
        .insert([{
            recipient: formData.recipient,
            sender: formData.from,
            sender_email: formData.recipient_email, 
            messages: formData.messages,
            images: imageUrls,
            reply_message: replyToId ? `Reply to: ${replyToId}` : null
        }])
        .select();

      if (error) throw error;

      setTimeout(() => {
        setGeneratedLink(`${window.location.origin}/view-full/${data[0].id}`);
        setIsSealing(false);
        setStep(6);
      }, 2500);
    } catch (error) {
      setIsSealing(false);
      alert('Error: Submission failed.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-rose-50 flex items-center justify-center pt-24 px-4 relative overflow-hidden font-sans">
      <Header />
      <FallingImages images={previews} />

      {isSealing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-rose-50/90 backdrop-blur-md">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute bottom-0 w-full h-20 bg-rose-400 rounded-b-xl shadow-lg"></div>
            <div className="absolute bottom-6 left-4 right-4 h-20 bg-white rounded shadow-sm animate-bounce flex flex-col p-2 gap-2">
              <div className="h-2 w-full bg-rose-100 rounded"></div>
              <div className="h-2 w-3/4 bg-rose-100 rounded"></div>
            </div>
            <div className="absolute top-12 w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-t-[50px] border-t-rose-300"></div>
          </div>
          <h2 className="text-2xl font-bold text-rose-600 animate-pulse uppercase tracking-widest">Processing Letter</h2>
          <p className="text-rose-400 mt-2 font-medium">Securing your content...</p>
        </div>
      )}

      <div className="w-full max-w-lg bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 relative z-10">
        {step < 6 && (
          <div className="flex justify-center items-center gap-3 mb-10">
            {[1, 2, 3, 4, 5].map((num) => (
              <React.Fragment key={num}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= num ? 'bg-rose-500 text-white scale-110 shadow-lg' : 'bg-rose-100 text-rose-300'}`}>{num}</div>
                {num < 5 && <div className={`h-1 w-6 md:w-8 rounded-full transition-colors duration-500 ${step > num ? 'bg-rose-500' : 'bg-rose-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 ml-1">Recipient Name</label>
            <input type="text" placeholder="Full name or identifier" className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-300 transition-all" value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} />
            <button onClick={nextStep} disabled={!formData.recipient} className="w-full mt-8 bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">Next Step</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 ml-1">Sender Name</label>
                <input type="text" placeholder="Your name" className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-rose-300" value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 ml-1">Sender Email Address</label>
                <input type="email" placeholder="email@example.com" className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-rose-300" value={formData.recipient_email} onChange={(e) => setFormData({...formData, recipient_email: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={prevStep} className="flex-1 text-rose-400 font-bold">Back</button>
              <button onClick={nextStep} disabled={!formData.from || !formData.recipient_email} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg">Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 ml-1">Letter Content</label>
            <textarea rows="5" placeholder="Compose your message..." className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none resize-none focus:ring-2 focus:ring-rose-300" value={formData.messages} onChange={(e) => setFormData({...formData, messages: e.target.value})} />
            <div className="flex gap-4 mt-8">
              <button onClick={prevStep} className="flex-1 text-rose-400 font-bold">Back</button>
              <button onClick={nextStep} disabled={!formData.messages} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg">Next Step</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-4 ml-1">Image Attachments</label>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {previews.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img src={url} className="w-full h-full object-cover rounded-xl shadow-sm" alt="preview" />
                  <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">✕</button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-rose-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/60 transition-colors group">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                <span className="text-3xl text-rose-300">+</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 text-rose-400 font-bold">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg">Preview Letter</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in zoom-in-95 duration-500">
            <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 text-center">Final Review</label>
            <div className="p-6 bg-white/80 rounded-3xl border border-rose-50 shadow-inner text-rose-900">
                <p className="mb-2 font-bold text-rose-600 uppercase text-[10px] tracking-widest">Recipient: {formData.recipient}</p>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">"{formData.messages}"</p>
                <p className="text-sm text-rose-500 mt-4 font-bold text-right">— {formData.from}</p>
            </div>
            <button onClick={handleSealAndSend} className="w-full mt-8 bg-rose-600 text-white py-5 rounded-2xl font-bold shadow-xl active:scale-95 transition-all uppercase tracking-widest">Finalize Submission</button>
          </div>
        )}

        {step === 6 && (
          <div className="animate-in zoom-in-95 duration-700 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-green-50">✓</div>
            <h2 className="text-3xl font-bold text-rose-600 mb-2">Success</h2>
            <div className="p-6 bg-rose-50/50 border-2 border-dashed border-rose-200 rounded-3xl mb-6 mt-6 text-center">
              <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] mb-3">Access Link</label>
              <code className="text-[11px] break-all text-rose-800 bg-white p-3 rounded-xl block mb-4 border border-rose-100 shadow-sm select-all">{generatedLink}</code>
              <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Link copied to clipboard."); }} className="bg-rose-500 text-white px-8 py-2 rounded-xl text-sm font-bold shadow-md active:scale-95">Copy Link</button>
            </div>
            <button onClick={() => navigate('/')} className="text-rose-400 text-sm underline font-bold">Return to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateLetter;