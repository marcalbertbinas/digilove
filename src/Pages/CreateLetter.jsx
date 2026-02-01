import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FallingImages from '../components/FallingImg.jsx';
import { supabase } from '../supabaseclient.js';

function CreateLetter() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ recipient: '', from: '', messages: '', theme: 'rose' });
  const [isSealing, setIsSealing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  
  // FIXED: Added missing previews state and initialized imageFile as an array
  const [previews, setPreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  
  const navigate = useNavigate(); // Use lowercase navigate (best practice)
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // FIXED: Logic for image handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...urls]);
    setImageFiles([...imageFiles, ...files]);
  };

  const removeImage = (index) => {
    setPreviews(previews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleSealAndSend = async () => {
  setIsSealing(true);

  try {
    const imageUrls = [];

    // 1. Loop through your images and upload them
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('letter-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the Public URL to store in the database
      const { data: { publicUrl } } = supabase.storage
        .from('letter-images')
        .getPublicUrl(filePath);
      
      imageUrls.push(publicUrl);
    }

    // 2. Insert the letter data into the 'Letters' table
    const { data, error: insertError } = await supabase
      .from('Letters')
      .insert([
        {
          recipient: formData.recipient,
          sender: formData.from,
          messages: formData.messages,
          images: imageUrls, // This saves the array of URLs
        }
      ])
      .select();

    if (insertError) throw insertError;

    // 3. Generate the link using the ID Supabase just created
    const newId = data[0].id;
    setGeneratedLink(`${window.location.origin}/letter/${newId}`);
    setIsSealing(false);
    setStep(6); // Move to the success screen

  } catch (error) {
    console.error('Error:', error.message);
    alert('Something went wrong. Please check your Supabase policies!');
    setIsSealing(false);
  }
};

  return (
    
    <div className="min-h-screen w-full bg-rose-50 flex items-center justify-center pt-24 px-4 relative overflow-hidden">
    <Header />
      {/* Background Layer */}
      <FallingImages images={previews} />

      <div className="w-full max-w-lg bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 relative z-10">
        
        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-3 mb-10">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <React.Fragment key={num}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                  step >= num ? 'bg-rose-500 text-white scale-110 shadow-lg' : 'bg-rose-100 text-rose-300'
                }`}>
                {num}
              </div>
              {num < 6 && (
                <div className={`h-1 w-6 md:w-8 rounded-full transition-colors duration-500 ${step > num ? 'bg-rose-500' : 'bg-rose-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: RECIPIENT */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-rose-600 mb-6 text-center">Who is this for?</h2>
            <input 
              type="text" 
              placeholder="Their name..."
              className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl focus:ring-2 focus:ring-rose-400 outline-none"
              value={formData.recipient}
              onChange={(e) => setFormData({...formData, recipient: e.target.value})}
            />
            <button onClick={nextStep} disabled={!formData.recipient} className="w-full mt-8 bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer">
              Next: Your Name
            </button>
            <button className="w-full mt-4 text-rose-400 text-sm cursor-pointer hover:underline" onClick={()=> navigate('/')}>
              Go back to home
            </button>
          </div>
        )}

        {/* STEP 2: SENDER */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-xl font-bold text-rose-600 mb-4">Your Name:</h2>
            <input 
              type="text" 
              placeholder="Your name..."
              className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl focus:ring-2 focus:ring-rose-400 outline-none"
              value={formData.from}
              onChange={(e) => setFormData({...formData, from: e.target.value})}
            />
            <div className="flex gap-4 mt-8">
              <button onClick={prevStep} className="flex-1 text-rose-500 font-bold cursor-pointer rounded-xl border border-rose-200">Back</button>
              <button onClick={nextStep} disabled={!formData.from} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer">
                Next: Write Message
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MESSAGE */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-rose-600 mb-6 text-center">Your Message</h2>
            <textarea 
              rows="5"
              placeholder="Type here..."
              className="w-full p-4 bg-white/60 border border-rose-100 rounded-2xl focus:ring-2 focus:ring-rose-400 outline-none resize-none"
              value={formData.message}
              onChange={(e) => setFormData({...formData, messages: e.target.value})}
            />
            <div className="flex gap-4 mt-8">
              <button onClick={prevStep} className="flex-1 text-rose-500 font-bold cursor-pointer rounded-xl border border-rose-200">Back</button>
              <button onClick={nextStep} disabled={!formData.messages} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer">
                Next: Attachment
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: IMAGES */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-rose-600 mb-2 text-center">Falling Memories</h2>
            <p className="text-rose-400 text-sm text-center mb-6">Photos will float behind your letter.</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {previews.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img src={url} className="w-full h-full object-cover rounded-xl border-2 border-white shadow-sm" />
                  <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg">✕</button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-rose-200 rounded-xl flex flex-col items-center justify-center bg-white/20 hover:bg-white/40 cursor-pointer transition-all">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                <span className="text-2xl text-rose-400">+</span>
                <span className="text-[10px] text-rose-300 font-bold uppercase">Add</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 text-rose-500 font-bold cursor-pointer">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg cursor-pointer">
                Preview Letter
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FINAL PREVIEW */}
        {step === 5 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-bold text-rose-600 mb-6 text-center">Ready to send?</h2>
            <div className="p-6 bg-white/80 rounded-2xl border border-rose-50 shadow-inner italic text-rose-900">
              <p className="mb-2 font-bold text-rose-600 not-italic uppercase text-xs">To: {formData.recipient}</p>
              <p className="text-lg leading-relaxed whitespace-pre-wrap">"{formData.messages}"</p>
              <p className="text-sm text-rose-500 mt-4 not-italic font-bold text-right">— {formData.from}</p>
            </div>
            <button className="w-full mt-8 bg-rose-600 text-white py-4 rounded-2xl font-bold shadow-xl cursor-pointer hover:bg-rose-700 transition-colors"
            onClick={handleSealAndSend}
            >
              Seal & Send ❤️
            </button>
            <button onClick={prevStep} className="w-full mt-4 text-rose-400 text-sm cursor-pointer hover:underline text-center">
              {previews.length === 1 ? 'Change Photo': 'Change Photos'}
            </button>
          </div>
        )}

        {/* LOADING SCREEN: SEALING ANIMATION */}
            {isSealing && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-rose-50/90 backdrop-blur-md">
                <div className="relative w-32 h-32 mb-8">
                {/* Envelope Body */}
                <div className="absolute bottom-0 w-full h-20 bg-rose-400 rounded-b-xl shadow-lg transition-all"></div>
                {/* Sliding Letter Animation */}
                <div className="absolute bottom-6 left-4 right-4 h-20 bg-white rounded shadow-sm animate-bounce flex flex-col p-2 gap-2">
                    <div className="h-2 w-full bg-rose-100 rounded"></div>
                    <div className="h-2 w-3/4 bg-rose-100 rounded"></div>
                </div>
                {/* Envelope Flap */}
                <div className="absolute top-12 w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-t-[50px] border-t-rose-300"></div>
                </div>
                <h2 className="text-2xl font-bold text-rose-600 animate-pulse">Sealing with love...</h2>
                <p className="text-rose-400 mt-2">Uploading your memories to the cloud.</p>
            </div>
            )}

            {/* STEP 6: SUCCESS & LINK GENERATION */}
            {step === 6 && (
            <div className="animate-in zoom-in-95 duration-700 text-center">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                ✓
                </div>
                <h2 className="text-3xl font-bold text-rose-600 mb-2">Sent Successfully!</h2>
                <p className="text-rose-400 mb-8 font-medium">Your digital memory is now live.</p>
                
                <div className="p-5 bg-rose-50/50 border-2 border-dashed border-rose-200 rounded-2xl flex flex-col items-center gap-4 mb-8">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Your Private Link</p>
                <code className="text-rose-800 text-sm break-all bg-white px-3 py-2 rounded-lg border border-rose-100">
                    {generatedLink}
                </code>
                <button 
                    onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    alert("Link copied to clipboard!");
                    }}
                    className="bg-rose-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-600 transition-all shadow-md active:scale-95"
                >
                    Copy Link
                </button>
                </div>
                
                <button 
                onClick={() => window.location.reload()} 
                className="text-rose-400 text-sm hover:underline font-medium"
                >
                Create another one
                </button>
            </div>
            )}
                </div>
                </div>
  );
}

export default CreateLetter;