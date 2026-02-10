import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createTransport } from "npm:nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, senderEmail, response, replyMessage, valentineLink } = await req.json();

    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('GMAIL_USER'),
        pass: Deno.env.get('GMAIL_APP_PASSWORD'),
      },
    });

    let mailOptions;

    // JOB 1: Send Notification to the SENDER when the crush replies
    if (type === 'NOTIFICATION') {
      mailOptions = {
        from: Deno.env.get('GMAIL_USER'),
        to: senderEmail,
        subject: `Your Crush Responded! ❤️`,
        text: `Good news! Your crush looked at your letter and responded: "${response}"\n\nTheir message to you: "${replyMessage || 'No extra message left.'}"`,
      };
    } 
    // JOB 2: The original Valentine email to the RECIPIENT
    else {
      mailOptions = {
        from: Deno.env.get('GMAIL_USER'),
        to: recipientEmail,
        subject: `Someone sent you a secret Valentine! 💌`,
        text: `You have a new secret message waiting for you! \n\nView it here: ${valentineLink}`,
      };
    }

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: "Success!" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})