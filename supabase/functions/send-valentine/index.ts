import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createTransport } from "npm:nodemailer";

// 1. Setup CORS headers so your website can talk to this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle Preflight (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { recipientEmail, valentineLink, senderNickname } = await req.json();

    // 2. Configure the Transporter (Using your Middleman Gmail)
    const transporter = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: Deno.env.get("GMAIL_USER"),
        pass: Deno.env.get("GMAIL_APP_PASSWORD"), // The 16-character App Password
      },
    });

    // 3. Create a "Human-Like" Email
    // We avoid big images or colorful buttons to stay out of the Spam folder.
    const mailOptions = {
      from: `"Secret Admirer" <${Deno.env.get("GMAIL_USER")}>`,
      to: recipientEmail,
      subject: `Someone sent you a secret message... 💌`,
      text: `Hi! Someone who wants to stay anonymous (using the nickname "${senderNickname}") has left a secret Valentine's message for you. 

You can read your letter here: ${valentineLink}

Stay sweet!`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
          <h2 style="color: #e11d48;">You have a secret message! 💌</h2>
          <p>Hi there,</p>
          <p>Someone who wants to stay anonymous (going by the name <b>"${senderNickname}"</b>) has written a digital letter for you.</p>
          <p style="margin: 25px 0;">
            <a href="${valentineLink}" style="background-color: #e11d48; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              Open Your Letter
            </a>
          </p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">If the button doesn't work, copy and paste this link: <br/> ${valentineLink}</p>
        </div>
      `,
    };

    // 4. Send the mail
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: "Email sent successfully!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
})