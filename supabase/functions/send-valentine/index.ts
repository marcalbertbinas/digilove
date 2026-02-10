import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import nodemailer from "npm:nodemailer";

serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers })

  try {
    const body = await req.json();
    const GMAIL_USER = Deno.env.get('GMAIL_USER');
    const GMAIL_PASS = Deno.env.get('GMAIL_PASS');

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });

    // CASE A: Sending a NEW Valentine (From CreateAnonymous)
    if (body.type === 'VALENTINE') {
      console.log("Sending New Valentine to:", body.recipientEmail);
      await transporter.sendMail({
        from: `"DigiLove" <${GMAIL_USER}>`,
        to: body.recipientEmail,
        subject: `💌 Someone sent you a secret Valentine!`,
        html: `
          <div style="font-family: sans-serif; text-align: center; border: 1px solid #ff2d55; padding: 20px; border-radius: 20px;">
            <h1 style="color: #ff2d55;">You have a Secret Message!</h1>
            <p><b>${body.senderNickname}</b> has left a heart-felt note for you.</p>
            <a href="${body.valentineLink}" style="background: #ff2d55; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; margin: 20px 0;">Open Your Letter ❤️</a>
          </div>
        `
      });
    } 
    
    // CASE B: Sending a REPLY (Updated to support both tables)
    else {
      const { letterId, replyMessage } = body;
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // 1. Try finding the letter in 'valentine_messages' (Anonymous)
      let { data: letter } = await supabase
        .from('valentine_messages')
        .select('sender_email, recipient_name')
        .eq('id', letterId)
        .maybeSingle();

      // 2. If not found, try finding it in 'Letters' (Full Letter)
      if (!letter) {
        const { data: fullLetter } = await supabase
          .from('Letters')
          .select('sender_email, recipient')
          .eq('id', letterId)
          .maybeSingle();
        
        if (fullLetter) {
          letter = {
            sender_email: fullLetter.sender_email,
            recipient_name: fullLetter.recipient // Map 'recipient' to 'recipient_name' for the email template below
          };
        }
      }

      if (!letter?.sender_email) {
        throw new Error("Sender email not found in either table");
      }

      console.log("Sending Reply to:", letter.sender_email);
      await transporter.sendMail({
        from: `"DigiLove" <${GMAIL_USER}>`,
        to: letter.sender_email,
        subject: `❤️ ${letter.recipient_name} replied to your Valentine!`,
        text: `Message: ${replyMessage}`,
      });
    }

    return new Response(JSON.stringify({ success: true }), { headers, status: 200 });

  } catch (error) {
    console.error("SERVER ERROR:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
})