import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const messagesFilePath = path.join(process.cwd(), "data", "messages.json");
const portfolioFilePath = path.join(process.cwd(), "data", "portfolio.json");

// Helper to read messages
async function readMessages() {
  try {
    const data = await fs.readFile(messagesFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to write messages
async function writeMessages(messages: any[]) {
  await fs.mkdir(path.dirname(messagesFilePath), { recursive: true });
  await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf-8");
}

export async function GET() {
  try {
    const messages = await readMessages();
    return NextResponse.json(messages);
  } catch (err) {
    console.error("Error reading messages:", err);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, projectType, message, phone, source } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Read portfolio to get Kamesh's email
    let receiverEmail = "mrkamesh8@gmail.com";
    try {
      const pData = await fs.readFile(portfolioFilePath, "utf-8");
      const pJson = JSON.parse(pData);
      if (pJson?.profile?.email) {
        receiverEmail = pJson.profile.email;
      }
    } catch {
      // fallback to mrkamesh8@gmail.com
    }

    // Read settings.json for user-configured SMTP
    const settingsFilePath = path.join(process.cwd(), "data", "settings.json");
    let settings: any = {};
    try {
      const sData = await fs.readFile(settingsFilePath, "utf-8");
      settings = JSON.parse(sData);
    } catch {
      // no settings file
    }

    if (settings?.smtp?.receiverEmail) {
      receiverEmail = settings.smtp.receiverEmail;
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      name,
      email,
      projectType: projectType || "General Inquiry",
      message,
      phone: phone || "",
      timestamp: new Date().toISOString(),
      status: "unread",
      source: source || "contact_form",
    };

    // Save message locally (wrapped for Vercel serverless read-only filesystem resilience)
    try {
      const existingMessages = await readMessages();
      const updatedMessages = [newMessage, ...existingMessages];
      await writeMessages(updatedMessages);
    } catch (fsErr) {
      console.warn("[Vercel Notice] Local filesystem write skipped:", fsErr);
    }

    // Attempt to send email via SMTP if credentials exist
    let emailSent = false;
    let emailError: string | null = null;

    const smtpHost = settings?.smtp?.host || process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(settings?.smtp?.port || process.env.SMTP_PORT) || 465;
    const smtpUser = settings?.smtp?.user || process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = (settings?.smtp?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailSubject = `🚀 New Portfolio Message from ${name} (${projectType || "General"})`;
        const mailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 20px;">New Inbound Portfolio Message</h2>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Received via your personal portfolio website</p>
            </div>

            <div style="margin-bottom: 16px; background: #f8fafc; padding: 14px; border-radius: 8px;">
              <p style="margin: 4px 0;"><strong>Sender Name:</strong> ${name}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ""}
              <p style="margin: 4px 0;"><strong>Opportunity / Project Type:</strong> <span style="background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${projectType || "General Inquiry"}</span></p>
              <p style="margin: 4px 0;"><strong>Source:</strong> ${source || "Contact Form"}</p>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="color: #0f172a; font-size: 15px; margin-bottom: 8px;">Message Content:</h3>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; color: #334155; line-height: 1.6; white-space: pre-wrap;">
${message}
              </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 20px;">
              <a href="mailto:${email}?subject=Re: Your message to Kamesh M R" style="background: #059669; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Reply to ${name}</a>
              ${phone ? `<a href="tel:${phone}" style="background: #1e293b; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Call Phone</a>` : ""}
            </div>

            <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
              Sent to ${receiverEmail} via Kamesh M R Portfolio Contact Engine.
            </p>
          </div>
        `;

        await transporter.sendMail({
          from: `"Portfolio Contact Engine" <${smtpUser}>`,
          to: receiverEmail,
          replyTo: email,
          subject: mailSubject,
          html: mailHtml,
        });

        emailSent = true;
      } catch (err: any) {
        console.error("Nodemailer dispatch error:", err);
        emailError = err.message || "Failed to dispatch email";
      }
    } else {
      console.log(
        "[Contact API] Message recorded in data/messages.json. (To enable instant live email dispatch, configure SMTP_USER & SMTP_PASS in .env.local or /admin settings)."
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent and recorded! Kamesh has been notified.",
      id: newMessage.id,
      emailSent,
      emailError,
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    const messages = await readMessages();
    const updated = messages.filter((m: any) => m.id !== id);
    await writeMessages(updated);

    return NextResponse.json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("Error deleting message:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    const messages = await readMessages();
    const updated = messages.map((m: any) => (m.id === id ? { ...m, status } : m));
    await writeMessages(updated);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
