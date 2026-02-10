import { supabase } from './supabaseclient.js';

/**
 * This calls the Supabase Edge Function we just deployed.
 * It is 100% safe and won't leak your API key.
 */
export const sendValentine = async (to, generatedLink, nickname = "A Secret Admirer") => {
  try {
    const { data, error } = await supabase.functions.invoke('send-valentine', {
      body: { 
        to: to, 
        generatedLink: generatedLink, 
        nickname: nickname 
      }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Failed to trigger edge function:", err);
    return { success: false, error: err.message };
  }
};