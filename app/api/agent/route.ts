import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import nodemailer from "nodemailer";

const portfolioFilePath = path.join(process.cwd(), "data", "portfolio.json");
const messagesFilePath = path.join(process.cwd(), "data", "messages.json");
const settingsFilePath = path.join(process.cwd(), "data", "settings.json");

// Helper to record callback requests from the AI agent
async function recordCallbackLead(name: string, phone: string, inquiry: string) {
  try {
    let messages: any[] = [];
    try {
      const data = await fs.readFile(messagesFilePath, "utf-8");
      messages = JSON.parse(data);
    } catch {
      messages = [];
    }

    const newLead = {
      id: `ai-lead-${Date.now()}`,
      name: name || "Website Visitor (via AI Agent)",
      email: "Captured via AI Agent",
      phone: phone || "",
      projectType: "Urgent Call-Back Request",
      message: `[AI Agent Alert - Missed Call / Urgent Inquiry]: ${inquiry}`,
      timestamp: new Date().toISOString(),
      status: "unread",
      source: "ai_agent",
    };

    messages.unshift(newLead);
    try {
      await fs.mkdir(path.dirname(messagesFilePath), { recursive: true });
      await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf-8");
    } catch (fsErr) {
      console.warn("[Vercel Notice] Local lead filesystem write skipped:", fsErr);
    }

    // Attempt email alert
    try {
      let settings: any = {};
      try {
        const sData = await fs.readFile(settingsFilePath, "utf-8");
        settings = JSON.parse(sData);
      } catch {}

      const smtpHost = settings?.smtp?.host || process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = Number(settings?.smtp?.port || process.env.SMTP_PORT) || 465;
      const smtpUser = settings?.smtp?.user || process.env.SMTP_USER || process.env.GMAIL_USER;
      const smtpPass = (settings?.smtp?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
      const receiverEmail = settings?.smtp?.receiverEmail || "mrkamesh8@gmail.com";

      if (smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"Kamesh AI Agent" <${smtpUser}>`,
          to: receiverEmail,
          subject: `🚨 Urgent AI Lead / Missed Call Alert: ${phone}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 580px; padding: 22px; border: 1px solid #10b981; border-radius: 12px; background: #ffffff;">
              <h3 style="color: #059669; margin-top: 0;">⚡ Urgent Callback Request Captured by 24/7 AI Agent</h3>
              <p style="color: #334155; font-size: 14px;">A visitor requested an immediate callback while you were away or on another call:</p>
              <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Phone / Contact:</strong> <a href="tel:${phone}" style="font-size: 16px; font-weight: bold; color: #059669;">${phone}</a></p>
                <p style="margin: 4px 0;"><strong>Inquiry Details:</strong> ${inquiry}</p>
                <p style="margin: 4px 0; font-size: 12px; color: #64748b;"><strong>Timestamp:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
              </div>
              <a href="tel:${phone}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">Call Back Now</a>
            </div>
          `,
        });
      }
    } catch (e) {
      console.error("AI Agent email dispatch error:", e);
    }

    return true;
  } catch (err) {
    console.error("Failed to record AI lead:", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { userMessage, history } = await request.json();

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Load portfolio context
    let portfolioData: any = null;
    try {
      const fileData = await fs.readFile(portfolioFilePath, "utf-8");
      portfolioData = JSON.parse(fileData);
    } catch (err) {
      console.error("Error reading portfolio data for agent:", err);
    }

    const profile = portfolioData?.profile || {};
    const kameshName = profile.name || "Kamesh M R";
    const kameshPhone = profile.phone || "+91 63824 86456";
    const kameshEmail = profile.email || "mrkamesh8@gmail.com";

    const text = userMessage.toLowerCase().trim();

    // Check if user is sharing a phone number or requesting callback
    const phoneRegex = /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})|(\d{10})/g;
    const phoneMatch = userMessage.match(phoneRegex);

    if (
      phoneMatch ||
      text.includes("call me") ||
      text.includes("callback") ||
      text.includes("phone number") ||
      text.includes("contact me at")
    ) {
      const extractedPhone = phoneMatch ? phoneMatch[0] : "";
      await recordCallbackLead("Urgent Caller", extractedPhone || userMessage, userMessage);

      return NextResponse.json({
        reply: `Thank you for sharing your contact details! 📞\n\nI have recorded your urgent callback request${
          extractedPhone ? ` for **${extractedPhone}**` : ""
        }. Since Kamesh is currently in deep engineering focus or on a client call, this alert has been immediately dispatched to his notification inbox. He will call you back as soon as he steps away from his terminal!\n\nYou can also reach him directly at **${kameshPhone}** or **${kameshEmail}**.`,
        isCallbackRecorded: true,
      });
    }

    // Check query topics
    if (text.includes("gojobsync") || text.includes("flagship") || text.includes("recruitment") || text.includes("project 1")) {
      return NextResponse.json({
        reply: `**GoJobSync.com** is Kamesh's flagship production platform! 🚀\n\n• **Solo Built Full-Stack**: Independently architected, developed, and deployed end-to-end.\n• **Tech Stack**: Next.js 15 (App Router), TypeScript, Prisma ORM, and Supabase (PostgreSQL + Auth).\n• **AWS Cloud**: Automated recurring alerts via AWS SNS and production hosting.\n• **Features**: Full candidate lifecycle, internal CRM for campus drives, and AI prompt workflows.\n\nYou can click on the GoJobSync card on the homepage to open the full engineering breakdown, or visit the live app directly!`,
      });
    }

    if (text.includes("hire") || text.includes("available") || text.includes("job") || text.includes("role") || text.includes("interview") || text.includes("opportunity")) {
      return NextResponse.json({
        reply: `Yes, **${kameshName} is actively available for hire!** 💼\n\n• **Open Roles**: Full-Time Artificial Intelligence Developer, Full-Stack Software Engineer, and high-impact contract consulting.\n• **Locations**: Chennai, Bangalore, or Remote worldwide.\n• **Notice Period / Availability**: Immediate / Active Interviewing.\n\nYou can request an interview right here by sending a message through the contact form, or leave your phone number and I will notify Kamesh right away for an instant callback!`,
      });
    }

    if (text.includes("tech stack") || text.includes("skill") || text.includes("languages") || text.includes("python") || text.includes("react")) {
      return NextResponse.json({
        reply: `Here is a summary of ${kameshName}'s technical toolkit: 🛠️\n\n• **AI & Machine Learning**: Python, Scikit-Learn, Pandas, NumPy, Prompt Engineering.\n• **AI Agents & LLM**: LangChain, OpenAI API, Agent tool calling, task automation.\n• **Full-Stack & Web**: React.js, Next.js 15, TypeScript, Prisma ORM, Supabase, Tailwind CSS, REST APIs.\n• **Cloud & Tools**: AWS (SNS, EC2), Git/GitHub, Postman, VS Code.\n\nHe has a rare balance of strong machine-learning competencies combined with proven solo full-stack delivery experience!`,
      });
    }

    if (text.includes("education") || text.includes("degree") || text.includes("college") || text.includes("qualification") || text.includes("study") || text.includes("mca") || text.includes("bca")) {
      return NextResponse.json({
        reply: `${kameshName}'s academic credentials: 🎓\n\n1. **Master of Computer Application (MCA)** — SRM Institute of Science and Technology (2024 — 2026), with Specialization in Artificial Intelligence & Advanced Software Systems.\n2. **Bachelor of Computer Application (BCA)** — Patrician College of Arts and Science (2021 — 2024), Computer Applications & Core Software Engineering.\n\n(All higher credentials verified and featured in his portfolio).`,
      });
    }

    if (text.includes("experience") || text.includes("company") || text.includes("thejobsync") || text.includes("willo") || text.includes("work")) {
      return NextResponse.json({
        reply: `${kameshName}'s professional experience: 💼\n\n• **Application Developer @ Thejobsync** (Jul 2026 — Present): Solo built www.gojobsync.com, modeled Prisma schemas, integrated Supabase auth, and deployed on AWS with SNS notifications.\n• **Frontend Developer Intern @ Willo Web Studio** (Nov 2025 — Feb 2026): Engineered modular React/Next.js UI components and integrated REST APIs.\n• **Web Development Intern @ Object Automation** (Aug 2023): Delivered custom WordPress CMS web solutions with performance and SEO fine-tuning.`,
      });
    }

    if (text.includes("call") || text.includes("contact") || text.includes("phone") || text.includes("reach") || text.includes("number") || text.includes("email")) {
      return NextResponse.json({
        reply: `You can reach ${kameshName} directly: 📱\n\n• **Direct Phone / WhatsApp**: **${kameshPhone}**\n• **Direct Email**: **${kameshEmail}**\n• **LinkedIn**: linkedin.com/in/kamesh-m-r-95101840a\n• **GitHub**: github.com/KAMESH1206\n\nIf you called and he was unavailable to attend, simply type your phone number or message here, and I will dispatch an urgent callback request directly to him!`,
      });
    }

    if (text.includes("who are you") || text.includes("agent") || text.includes("bot") || text.includes("what can you do")) {
      return NextResponse.json({
        reply: `I am **Kamesh's AI Autonomous Representative**! 🤖\n\nI am designed to represent Kamesh 24/7 whenever he is coding in his IDE or unable to answer calls directly. I can:\n• Answer any questions about his GoJobSync architecture and code.\n• Review his AI/ML skills and full-stack capabilities.\n• Clarify his availability for roles.\n• Record your phone number and schedule an urgent call-back.\n\nHow can I help you today?`,
      });
    }

    // Default intelligent conversational reply
    return NextResponse.json({
      reply: `Thanks for asking! As ${kameshName}'s AI Representative, I'm here to ensure you get immediate answers even when Kamesh is away on calls or working on code.\n\n• **Flagship Project**: Solo built GoJobSync.com (Next.js 15, Prisma, Supabase, AWS SNS).\n• **Education**: MCA @ SRM Institute (AI Specialization), BCA @ Patrician College.\n• **Phone / WhatsApp**: ${kameshPhone}\n• **Email**: ${kameshEmail}\n\nIf you'd like him to call you back directly, just reply with your phone number and message!`,
    });
  } catch (err) {
    console.error("AI Agent API error:", err);
    return NextResponse.json(
      { reply: "Sorry, I encountered a temporary connection issue. You can reach Kamesh directly at +91 63824 86456." },
      { status: 500 }
    );
  }
}
