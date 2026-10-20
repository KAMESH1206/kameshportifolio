import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const settingsFilePath = path.join(process.cwd(), "data", "settings.json");

async function readSettings() {
  try {
    const data = await fs.readFile(settingsFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return {
      smtp: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        user: "mrkamesh8@gmail.com",
        pass: "",
        receiverEmail: "mrkamesh8@gmail.com",
      },
    };
  }
}

async function writeSettings(settings: any) {
  await fs.mkdir(path.dirname(settingsFilePath), { recursive: true });
  await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), "utf-8");
}

export async function GET() {
  try {
    const settings = await readSettings();
    const envUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const envPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    const merged = {
      ...settings,
      smtp: {
        ...settings.smtp,
        user: settings.smtp?.user || envUser || "mrkamesh8@gmail.com",
        pass: settings.smtp?.pass || envPass || "",
        isConfigured: Boolean(settings.smtp?.pass || envPass),
      },
    };

    return NextResponse.json(merged);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await readSettings();
    const updated = {
      ...current,
      smtp: {
        ...current.smtp,
        ...body.smtp,
      },
    };

    await writeSettings(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Test email sender
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const settings = await readSettings();

    const host = body.host || settings.smtp?.host || "smtp.gmail.com";
    const port = Number(body.port) || settings.smtp?.port || 465;
    const user = body.user || settings.smtp?.user || process.env.SMTP_USER;
    const pass = body.pass || settings.smtp?.pass || process.env.SMTP_PASS;
    const receiver = body.receiverEmail || settings.smtp?.receiverEmail || "mrkamesh8@gmail.com";

    if (!user || !pass) {
      return NextResponse.json(
        {
          error:
            "Gmail User and 16-character App Password are required to send emails. Please enter your App Password and try again.",
        },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: pass.replace(/\s+/g, "") },
    });

    const testInfo = await transporter.sendMail({
      from: `"Portfolio Alert Engine" <${user}>`,
      to: receiver,
      subject: "🧪 Test Email: Your Portfolio Contact Alerts are Working!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #059669; margin-top: 0;">🎉 Live Email Delivery Verified!</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Hello Kamesh, this is a live test notification from your personal portfolio website (<strong>Kamesh M R — Artificial Intelligence Developer</strong>).
          </p>
          <div style="background: #f1f5f9; padding: 14px; border-radius: 8px; margin: 16px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Delivered to:</strong> ${receiver}</p>
            <p style="margin: 4px 0;"><strong>Sender Account:</strong> ${user}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> Active & Ready for Live Contact Messages</p>
          </div>
          <p style="color: #64748b; font-size: 12px;">
            Whenever recruiters, clients, or visitors submit a message on your website or leave an urgent callback request with your 24/7 AI Agent, an email will arrive directly in this inbox.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully delivered to ${receiver}!`,
      messageId: testInfo.messageId,
    });
  } catch (err: any) {
    console.error("Test email error:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Failed to send email. If using Gmail, make sure you generated an App Password from https://myaccount.google.com/apppasswords",
      },
      { status: 500 }
    );
  }
}
