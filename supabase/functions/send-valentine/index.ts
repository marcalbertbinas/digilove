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
    const { letterId, replyMessage } = await req.json()
    console.log(`Processing reply for ID: ${letterId}`)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Fetch data
    const { data: letter, error: dbError } = await supabase
      .from('valentine_messages')
      .select('sender_email, recipient_name')
      .eq('id', letterId)
      .single()

    if (dbError || !letter?.sender_email) {
      console.error("DB Error:", dbError?.message)
      throw new Error("No sender email found in database.")
    }

    // 2. Setup Transporter with your Secrets
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: Deno.env.get('GMAIL_USER'),
        pass: Deno.env.get('GMAIL_PASS'),
      },
    });

    // 3. Send Email
    console.log("Sending email to:", letter.sender_email)
    await transporter.sendMail({
      from: `"Valentine App" <${Deno.env.get('GMAIL_USER')}>`,
      to: letter.sender_email,
      subject: `❤️ ${letter.recipient_name} just replied!`,
      text: `They said: ${replyMessage}`,
      html: `<b>${letter.recipient_name}</b> said: <i>"${replyMessage}"</i>`
    });

    console.log("Email sent successfully!")
    return new Response(JSON.stringify({ success: true }), { headers, status: 200 })

  } catch (error) {
    console.error("CRITICAL ERROR:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 })
  }
})