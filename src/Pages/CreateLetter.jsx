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
    recipient_email: '', // This stores the sender's email for notifications
    messages: '' 
  });

  const [isSealing, setIsSealing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [previews, setPreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  
  const navigate = useNavigate();

  // If this is a reply, fetch the original sender to make them the new recipient
  useEffect(() => {
    if (replyToId) {
      const fetchOriginalSender = async () => {
        const { data, error } = await supabase
          .from('Letters')
          .select('sender')
          .eq('id', replyToId)
          .single();

        if (!error && data) {
          setFormData(prev => ({ ...prev, recipient: data.sender }));
        }
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
      // 1. Upload Images to Supabase Storage
      const imageUrls = [];
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('letter-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('letter-images').getPublicUrl(fileName);
        imageUrls.push(data.publicUrl);
      }

      // 2. Insert into 'Letters' table
      const { data, error } = await supabase
        .from('Letters')
        .insert([{
            recipient: formData.recipient,
            sender: formData.from,
            sender_email: formData.recipient_email, // CRITICAL FIX: Maps step 2 input to DB
            messages: formData.messages,
            images: imageUrls,
            reply_message: replyToId ? `Reply to: ${replyToId}` : null
        }])
        .select();

      if (error) throw error;

      // 3. Generate the link and move to success step
      setTimeout(() => {
        const newId = data[0].id;
        setGeneratedLink(`${window.location.origin}/view-full/${newId}`);
        setIsSealing(false);
        setStep(6);
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to seal letter. Make sure your database has the sender_email column!');
      setIsSealing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-rose-50 flex items-center justify-center pt-24 px-4 relative overflow-hidden">
      <Header />
      <FallingImages images={previews} />

      <div className="w-full max-w-lg bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 relative z-10">
        {step < 6 && (
          <div className="flex justify-center items-center gap-3 mb-10">
            {[1, 2, 3, 4, 5].map((num) => (
              <React.Fragment key={num}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= num ? 'bg-rose-500 text-white shadow-lg' : 'bg-rose-100 text-rose-300'
                }`}>{num}</div>
                {num < 5 && <div className={`h-1 w-6 rounded-full ${step > num ? 'bg-rose-500' : 'bg-rose-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 1: Recipient */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-rose-600 mb-6 text-center">Who is this for?</h2>
            <input type="text" placeholder="Recipient's Name" className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none" value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} />
            <button onClick={nextStep} disabled={!formData.recipient} className="w-full mt-8 bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg">Next</button>
          </div>
        )}

        {/* Step 2: Sender Info */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-rose-600 mb-6 text-center">From you</h2>
            <input type="text" placeholder="Your Name" className="w-full p-4 mb-4 bg-white/60 border border-rose-100 rounded-2xl outline-none" value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})} />
            <input 
                type="email" 
                placeholder="Your Email (to get notified of replies)" 
                className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none" 
                value={formData.recipient_email} 
                onChange={(e) => setFormData({...formData, recipient_email: e.target.value})} 
            />
            <div className="flex gap-4 mt-8">
              <button onClick={prevStep} className="flex-1 text-rose-500 font-bold">Back</button>
              <button onClick={nextStep} disabled={!formData.from || !formData.recipient_email} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Message */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-rose-600 mb-6 text-center">Your Message</h2>
            <textarea rows="5" placeholder="Write your letter..." className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl outline-none resize-none" value={formData.messages} onChange={(e) => setFormData({...formData, messages: e.target.value})} />
            <div className="flex gap-4 mt-8">
              <button onClick={prevStep} className="flex-1 text-rose-500 font-bold">Back</button>
              <button onClick={nextStep} disabled={!formData.messages} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg">Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-rose-600 mb-6 text-center">Add Photos</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {previews.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img src={url} className="w-full h-full object-cover rounded-xl shadow-sm" alt="preview" />
                  <button onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-rose-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/40 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                <span className="text-2xl text-rose-400">+</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 text-rose-500 font-bold">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg">Preview</button>
            </div>
          </div>
        )}

        {/* Step 5: Final Preview */}
        {step === 5 && (
          <div className="animate-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-bold text-rose-600 mb-6 text-center">Ready to Seal?</h2>
            <div className="p-6 bg-white/80 rounded-2xl shadow-inner border border-rose-50">
                <p className="text-xs font-bold text-rose-400 uppercase">To: {formData.recipient}</p>
                <p className="italic text-gray-700 my-4">"{formData.messages}"</p>
                <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-400">{previews.length} photos attached</span>
                    <p className="text-sm font-bold text-rose-500">— {formData.from}</p>
                </div>
            </div>
            <button onClick={handleSealAndSend} className="w-full mt-8 bg-rose-600 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">Seal & Send ❤️</button>
            <button onClick={prevStep} className="w-full mt-4 text-rose-400 text-sm font-medium">Wait, I need to change something</button>
          </div>
        )}

        {/* Step 6: Success */}
        {step === 6 && (
          <div className="text-center animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-bold text-rose-600 mb-4">Letter Sealed!</h2>
            <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-200 rounded-2xl mb-6">
              <p className="text-xs font-bold text-rose-400 uppercase mb-2">Private Link</p>
              <code className="text-[10px] break-all text-rose-800 bg-white p-2 rounded block mb-4 select-all">{generatedLink}</code>
              <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied to clipboard!"); }} className="bg-rose-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-rose-600 transition-colors">Copy Link</button>
            </div>
            <button onClick={() => navigate('/')} className="text-rose-400 text-sm underline">Back to Home</button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isSealing && (
        <div className="fixed inset-0 z-50 bg-rose-50/80 backdrop-blur-md flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-2xl font-bold text-rose-600 animate-pulse">Sealing with love...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateLetter;