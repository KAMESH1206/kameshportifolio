"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  Bot,
  BrainCircuit,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Cpu,
  Database,
  Download,
  Dumbbell,
  ExternalLink,
  Eye,
  FileCode2,
  FileText,
  FolderGit2,
  Github,
  Globe,
  GraduationCap,
  Layers,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Menu,
  Newspaper,
  Phone,
  Rocket,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  User,
  Vote,
  X,
  Zap,
} from "lucide-react";

import defaultPortfolioData from "../data/portfolio.json";
import AiAgentWidget from "./components/AiAgentWidget";

export default function Home() {
  const [data, setData] = useState<any>(defaultPortfolioData);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroVisualMode, setHeroVisualMode] = useState<"photo" | "terminal">("photo");
  const [activeTab, setActiveTab] = useState(0);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isGoJobSyncModalOpen, setIsGoJobSyncModalOpen] = useState(false);

  // Interactive Cursor Hover Details View
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [cursorTip, setCursorTip] = useState<string | null>(null);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState("Full-Time Role");
  const [formSent, setFormSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  // Sync data from API if available
  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((json) => {
        if (json && json.profile) {
          setData(json);
        }
      })
      .catch((err) => console.log("Using static data cache"));
  }, []);

  const email = data?.profile?.email || "mrkamesh8@gmail.com";
  const phone = data?.profile?.phone || "+91 63824 86456";

  // Cursor tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setCurrentTime(new Intl.DateTimeFormat("en-IN", options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2400);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2400);
    } catch {
      window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
    }
  };

  const terminalTabs = [
    {
      id: "profile",
      name: "Kamesh.ts",
      content: `// Kamesh M R — Artificial Intelligence & Application Developer
export const kamesh = {
  name: "${data?.profile?.name || "Kamesh M R"}",
  role: "${data?.profile?.role || "Artificial Intelligence Developer"}",
  location: "${data?.profile?.location || "Chennai / Bangalore, India"}",
  phone: "${data?.profile?.phone || "+91 63824 86456"}",
  email: "${data?.profile?.email || "mrkamesh8@gmail.com"}",
  github: "${data?.profile?.github || "https://github.com/KAMESH1206"}",
  flagshipProject: "${data?.profile?.flagshipProject || "www.gojobsync.com"}",
  currentRole: "Application Developer @ ${data?.profile?.currentCompany || "Thejobsync"}"
};`,
    },
    {
      id: "gojobsync",
      name: "GoJobSync_Arch.ts",
      content: `// GoJobSync Platform Architecture
export const gojobsyncSpecs = {
  frontend: "Next.js 15 (App Router) + TypeScript + Tailwind CSS",
  database: "Prisma ORM with Supabase (Auth + Realtime Postgres)",
  messaging: "AWS Simple Notification Service (SNS) for recurring alerts",
  internalModules: ["Campus Drives CRM", "Placement Pipeline", "Job Fair Engine"],
  aiAcceleration: ["LangChain", "OpenAI API", "Agentic Workflows"],
  cloudHost: "AWS (Production Deployment)"
};`,
    },
  ];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(terminalTabs[activeTab].content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          projectType: selectedProjectType,
          message: formData.message,
          source: "contact_form",
        }),
      });

      if (res.ok) {
        setFormSent(true);
        setSubmitMessage("Message successfully sent! Kamesh has been notified.");
        setTimeout(() => {
          setFormSent(false);
          setFormData({ name: "", email: "", phone: "", message: "" });
        }, 5000);
      } else {
        setFormSent(true);
        setSubmitMessage("Message recorded in inbox.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setFormSent(true);
      setSubmitMessage("Message recorded in inbox.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      {/* Interactive Cursor Hover Details View Card */}
      {cursorTip && (
        <div
          className="cursor-detail-card"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
          }}
        >
          <Sparkles size={13} color="var(--accent-emerald)" />
          <span>{cursorTip}</span>
        </div>
      )}

      {/* Background Natural Light Atmosphere */}
      <div className="ambient-canvas" aria-hidden="true">
        <div className="ambient-grid" />
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <div className="ambient-glow-3" />
      </div>

      {/* Floating Island Navigation */}
      <header className="navbar-wrap">
        <nav className="navbar-island" aria-label="Main Navigation">
          <a
            href="#hero"
            className="nav-brand"
            onMouseEnter={() => setCursorTip("Kamesh M R Portfolio")}
            onMouseLeave={() => setCursorTip(null)}
          >
            <span className="brand-dot" />
            <span>KAMESH<span className="gradient-text">.DEV</span></span>
          </a>

          <div className="nav-links">
            <a href="#hero" className="nav-link">Home</a>
            <a href="#about" className="nav-link">Architecture</a>
            <a href="#projects" className="nav-link">Projects</a>
            <a href="#skills" className="nav-link">Skills</a>
            <a href="#experience" className="nav-link">Experience</a>
            <a href="#education" className="nav-link">Education</a>
            <a href="#highlights" className="nav-link">Highlights</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>

          <div className="nav-actions">
            <div className="status-pill">
              <span className="pulse-dot" />
              <span>Available for Hire</span>
            </div>
            <a href="#contact" className="nav-cta-btn">
              Let&apos;s Connect <ArrowUpRight size={14} />
            </a>
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="status-pill" style={{ width: "fit-content" }}>
              <span className="pulse-dot" />
              <span>Open for Full-Time & Freelance Roles</span>
            </div>
            <a href="#hero" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>Architecture & Systems</a>
            <a href="#projects" className="nav-link" onClick={() => setMenuOpen(false)}>Projects (GoJobSync)</a>
            <a href="#skills" className="nav-link" onClick={() => setMenuOpen(false)}>Skills & Technologies</a>
            <a href="#experience" className="nav-link" onClick={() => setMenuOpen(false)}>Work Experience</a>
            <a href="#education" className="nav-link" onClick={() => setMenuOpen(false)}>Higher Education</a>
            <a href="#highlights" className="nav-link" onClick={() => setMenuOpen(false)}>Extra Highlights</a>
            <a href="#contact" className="nav-link" onClick={() => setMenuOpen(false)}>Get in Touch</a>
            <Link href="/admin" className="nav-link" style={{ color: "var(--accent-emerald-dark)", fontWeight: 700 }} onClick={() => setMenuOpen(false)}>
              Admin Portal ⚙️
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-container">
        {/* HERO SECTION */}
        <section className="hero-section" id="hero">
          <div className="hero-grid">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="hero-eyebrow">
                <Sparkles size={14} />
                <span>{data?.profile?.eyebrow || "ARTIFICIAL INTELLIGENCE & APPLICATION DEVELOPER"}</span>
              </div>

              <h1 className="hero-title">
                BUILDING INTELLIGENT AI AGENTS &{" "}
                <span className="gradient-text">SCALABLE WEB PLATFORMS</span>
              </h1>

              <p className="hero-subtitle">
                {data?.profile?.subtitle ||
                  "I'm Kamesh M R — an Artificial Intelligence Developer experienced in building AI-agent-powered features and machine-learning workflows, combined with production full-stack delivery experience as the solo builder of GoJobSync.com."}
              </p>

              <div className="hero-actions">
                <a
                  href="#projects"
                  className="btn-primary"
                  onMouseEnter={() => setCursorTip("Explore GoJobSync & GitHub Repos")}
                  onMouseLeave={() => setCursorTip(null)}
                >
                  Explore Selected Work <ArrowDownRight size={17} />
                </a>

                <a
                  href={data?.profile?.resumePdf || "/kamesh-resume.pdf"}
                  download="Kamesh_M_R_Resume.pdf"
                  className="btn-secondary"
                  onMouseEnter={() => setCursorTip("Download Official PDF Resume")}
                  onMouseLeave={() => setCursorTip(null)}
                >
                  <Download size={15} />
                  <span>Download CV</span>
                </a>

                <button
                  type="button"
                  className="btn-copy"
                  onClick={handleCopyEmail}
                  onMouseEnter={() => setCursorTip(`Click to copy ${email}`)}
                  onMouseLeave={() => setCursorTip(null)}
                  aria-label="Copy email address"
                >
                  {copiedEmail ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  <span>{copiedEmail ? "Copied!" : email}</span>
                </button>

                <div className="hero-socials">
                  <a
                    href={data?.profile?.github || "https://github.com/KAMESH1206"}
                    target="_blank"
                    rel="noreferrer"
                    className="social-icon-btn"
                    aria-label="GitHub Profile"
                    onMouseEnter={() => setCursorTip("github.com/KAMESH1206")}
                    onMouseLeave={() => setCursorTip(null)}
                  >
                    <Github size={18} />
                  </a>
                  <a
                    href={data?.profile?.linkedin || "https://linkedin.com/in/kamesh-m-r-95101840a"}
                    target="_blank"
                    rel="noreferrer"
                    className="social-icon-btn"
                    aria-label="LinkedIn Profile"
                    onMouseEnter={() => setCursorTip("LinkedIn Profile")}
                    onMouseLeave={() => setCursorTip(null)}
                  >
                    <Linkedin size={18} />
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="social-icon-btn"
                    aria-label="Send Email"
                    onMouseEnter={() => setCursorTip("Send Email Directly")}
                    onMouseLeave={() => setCursorTip(null)}
                  >
                    <Mail size={18} />
                  </a>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="social-icon-btn"
                    aria-label="Call Kamesh"
                    onMouseEnter={() => setCursorTip(`Call: ${phone}`)}
                    onMouseLeave={() => setCursorTip(null)}
                  >
                    <Phone size={18} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* HERO VISUAL: KAMESH'S REAL PORTRAIT SHOWCASE */}
            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Floating tech badge chips */}
              <div
                className="hero-floating-chip chip-top-right"
                onClick={() => setIsGoJobSyncModalOpen(true)}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setCursorTip("Click for Full Work Breakdown!")}
                onMouseLeave={() => setCursorTip(null)}
              >
                <Zap size={16} color="#059669" />
                <span>Solo Builder of GoJobSync.com</span>
              </div>

              <div className="hero-floating-chip chip-bottom-left">
                <BrainCircuit size={16} color="#d97706" />
                <span>AI Agents & LangChain Workflows</span>
              </div>

              {heroVisualMode === "photo" ? (
                <div
                  className="portrait-showcase-card"
                  onMouseEnter={() => setCursorTip("Kamesh M R — AI & Application Developer")}
                  onMouseLeave={() => setCursorTip(null)}
                >
                  <div className="portrait-image-wrapper">
                    <Image
                      src={data?.profile?.photo || "/kamesh-profile.jpg"}
                      alt={data?.profile?.name || "Kamesh M R"}
                      fill
                      priority
                      className="portrait-img"
                      sizes="(max-width: 768px) 100vw, 440px"
                    />
                    <div className="portrait-overlay" />

                    <div className="portrait-bottom-meta">
                      <div>
                        <div className="portrait-meta-name">{data?.profile?.name || "Kamesh M R"}</div>
                        <div className="portrait-meta-role">{data?.profile?.role || "Artificial Intelligence Developer"}</div>
                      </div>
                      <div className="status-pill" style={{ background: "rgba(255, 255, 255, 0.9)" }}>
                        <MapPin size={11} color="#e11d48" />
                        <span>{data?.profile?.location || "Chennai / Bangalore"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="terminal-card">
                  <div className="terminal-header">
                    <div className="terminal-dots">
                      <span className="t-dot red" />
                      <span className="t-dot yellow" />
                      <span className="t-dot green" />
                    </div>

                    <div className="terminal-tabs">
                      {terminalTabs.map((tab, idx) => (
                        <button
                          key={tab.id}
                          type="button"
                          className={`t-tab ${activeTab === idx ? "active" : ""}`}
                          onClick={() => setActiveTab(idx)}
                        >
                          <FileCode2 size={12} />
                          <span>{tab.name}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      style={{ color: "var(--text-dim)", padding: 4 }}
                      title="Copy snippet"
                    >
                      {copiedCode ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="terminal-body">
                    <pre>
                      <code>{terminalTabs[activeTab].content}</code>
                    </pre>
                  </div>

                  <div className="terminal-footer">
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#059669" }}>
                      <span className="pulse-dot" />
                      <span>Production Ready · Clean TypeScript</span>
                    </div>
                    <span>UTF-8</span>
                  </div>
                </div>
              )}

              {/* View Switcher: Photo vs Terminal */}
              <div className="hero-mode-switch">
                <button
                  type="button"
                  className={`mode-btn ${heroVisualMode === "photo" ? "active" : ""}`}
                  onClick={() => setHeroVisualMode("photo")}
                >
                  <User size={13} />
                  <span>Profile Photo</span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${heroVisualMode === "terminal" ? "active" : ""}`}
                  onClick={() => setHeroVisualMode("terminal")}
                >
                  <Terminal size={13} />
                  <span>Interactive Code</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Key Metrics Strip */}
          <div className="metrics-strip">
            {data?.metrics?.map((m: any, i: number) => (
              <div
                key={i}
                className="metric-item"
                onClick={() => {
                  if (m.value.includes("GoJobSync")) setIsGoJobSyncModalOpen(true);
                }}
                style={{ cursor: m.value.includes("GoJobSync") ? "pointer" : "default" }}
                onMouseEnter={() => setCursorTip(m.tip || m.label)}
                onMouseLeave={() => setCursorTip(null)}
              >
                <div className="metric-value">
                  {m.value}<span>{m.suffix}</span>
                </div>
                <div className="metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Marquee Ticker */}
        <div className="marquee-container" aria-hidden="true">
          <div className="marquee-track">
            {[
              "PYTHON",
              "SCIKIT-LEARN",
              "LANGCHAIN",
              "OPENAI API",
              "REACT.JS",
              "NEXT.JS 15",
              "TYPESCRIPT",
              "PRISMA ORM",
              "SUPABASE",
              "AWS SNS",
              "PANDAS & NUMPY",
              "AI AGENT WORKFLOWS",
              "RESTFUL APIS",
              "POSTMAN",
              "GIT & GITHUB",
              "PYTHON",
              "SCIKIT-LEARN",
              "LANGCHAIN",
              "OPENAI API",
              "REACT.JS",
              "NEXT.JS 15",
              "TYPESCRIPT",
              "PRISMA ORM",
              "SUPABASE",
              "AWS SNS",
              "PANDAS & NUMPY",
              "AI AGENT WORKFLOWS",
              "RESTFUL APIS",
              "POSTMAN",
              "GIT & GITHUB",
            ].map((tech, i) => (
              <span key={i} className="marquee-item">
                <Cpu size={14} /> {tech}
              </span>
            ))}
          </div>
        </div>

        {/* BENTO GRID: SYSTEMS ARCHITECTURE */}
        <section className="section-wrap" id="about">
          <div className="section-header-flex">
            <div>
              <div className="section-tag">
                <Layers size={14} />
                <span>FULL-STACK & AI ARCHITECTURE</span>
              </div>
              <h2 className="section-title">
                Engineered for <br />
                <span className="gradient-text">Real-World Production Impact.</span>
              </h2>
            </div>
            <p className="section-description">
              Bridging modern Next.js/React frontend delivery with robust Prisma database models,
              Supabase authentication, AWS cloud infrastructure, and intelligent AI agent workflows.
            </p>
          </div>

          <div className="bento-grid">
            {/* Bento Card 1: GoJobSync Production Architecture */}
            <div
              className="bento-card bento-col-8"
              onClick={() => setIsGoJobSyncModalOpen(true)}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setCursorTip("Click to inspect GoJobSync work details")}
              onMouseLeave={() => setCursorTip(null)}
            >
              <div className="bento-icon-badge">
                <Rocket size={24} />
              </div>
              <h3 className="bento-title">Production Full-Stack Delivery: GoJobSync</h3>
              <p className="bento-desc">
                As the sole developer behind <strong>www.gojobsync.com</strong>, I owned the entire
                product lifecycle — from database modeling with Prisma ORM to building the
                Next.js/TypeScript frontend, Supabase real-time sync, and automated AWS SNS
                notification workflows. <em>Click to read complete work details →</em>
              </p>

              <div className="arch-flow-diagram">
                <div className="arch-node">
                  <div className="arch-node-header">
                    <span className="arch-node-badge">Frontend UI</span>
                    <Code2 size={16} color="#059669" />
                  </div>
                  <div className="arch-node-title">React.js & Next.js 15</div>
                  <div className="arch-node-tech">TypeScript · Fast · Responsive</div>
                </div>

                <div className="arch-node">
                  <div className="arch-node-header">
                    <span className="arch-node-badge">Data & Auth</span>
                    <Database size={16} color="#0284c7" />
                  </div>
                  <div className="arch-node-title">Prisma & Supabase</div>
                  <div className="arch-node-tech">Type-safe schema · Real-time</div>
                </div>

                <div className="arch-node">
                  <div className="arch-node-header">
                    <span className="arch-node-badge">Cloud & Alerts</span>
                    <Server size={16} color="#d97706" />
                  </div>
                  <div className="arch-node-title">AWS & SNS</div>
                  <div className="arch-node-tech">Recurring alerts · Campus CRM</div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Live Clock & Location */}
            <div
              className="bento-card bento-col-4"
              onMouseEnter={() => setCursorTip("Chennai / Bangalore Tech Hubs")}
              onMouseLeave={() => setCursorTip(null)}
            >
              <div className="bento-icon-badge">
                <Clock size={24} />
              </div>
              <h3 className="bento-title">Chennai / Bangalore</h3>
              <p className="bento-desc">
                Based in South India&apos;s premier tech hubs. Ready for on-site, hybrid, or
                distributed engineering teams worldwide.
              </p>

              <div className="clock-widget">
                <div>
                  <div className="clock-time">{currentTime || "12:00:00 PM"}</div>
                  <div style={{ fontSize: 11, color: "var(--accent-emerald-dark)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    Indian Standard Time (IST)
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-dim)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    <MapPin size={12} color="#e11d48" /> Chennai, IN
                  </div>
                  <span style={{ color: "#059669", fontWeight: 700 }}>● Open for Roles</span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: AI Agents & Machine Learning */}
            <div
              className="bento-card bento-col-6"
              onMouseEnter={() => setCursorTip("LangChain, OpenAI API & Scikit-Learn workflows")}
              onMouseLeave={() => setCursorTip(null)}
            >
              <div className="bento-icon-badge" style={{ background: "var(--accent-gold-subtle)", color: "#d97706" }}>
                <BrainCircuit size={24} />
              </div>
              <h3 className="bento-title">AI Agents, LangChain & ML</h3>
              <p className="bento-desc">
                Leveraging Scikit-Learn, Pandas, NumPy, and LangChain to automate repetitive
                engineering tasks, parse structured candidate data, and build contextual AI agent
                pipelines.
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                <span className="showcase-tag">LangChain</span>
                <span className="showcase-tag">OpenAI API</span>
                <span className="showcase-tag">Prompt Engineering</span>
                <span className="showcase-tag">Scikit-Learn</span>
                <span className="showcase-tag">Pandas & NumPy</span>
              </div>
            </div>

            {/* Bento Card 4: Education & Specialization */}
            <div
              className="bento-card bento-col-6"
              onMouseEnter={() => setCursorTip("Master of Computer Applications in AI")}
              onMouseLeave={() => setCursorTip(null)}
            >
              <div className="bento-icon-badge" style={{ background: "var(--accent-sky-subtle)", color: "#0284c7" }}>
                <GraduationCap size={24} />
              </div>
              <h3 className="bento-title">MCA @ SRM Institute of Science & Tech</h3>
              <p className="bento-desc">
                Postgraduate degree (2024 — 2026) in Master of Computer Applications with a focus
                on Artificial Intelligence, following a Bachelor of Computer Applications from
                Patrician College (2021 — 2024).
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                <span className="showcase-tag">SRM Institute (MCA 2024-26)</span>
                <span className="showcase-tag">Patrician College (BCA 2021-24)</span>
                <span className="showcase-tag">Science Expo Winner (2019)</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PROJECTS SECTION (TOP 3 MAIN + VIEW ALL TOGGLE) */}
        <section className="section-wrap" id="projects">
          <div className="section-header-flex">
            <div>
              <div className="section-tag">
                <Code2 size={14} />
                <span>PROJECT PORTFOLIO</span>
              </div>
              <h2 className="section-title">
                Featured Projects & <br />
                <span className="gradient-text">GitHub Repositories.</span>
              </h2>
            </div>
            <p className="section-description">
              Showing top 3 main production & GitHub projects. Click on GoJobSync to see full
              architecture details or explore all public repositories.
            </p>
          </div>

          {/* TOP 3 MAIN PROJECTS */}
          <div className="projects-showcase-grid">
            {data?.mainProjects?.slice(0, 3).map((project: any, idx: number) => (
              <motion.article
                key={project.id || idx}
                className={`showcase-card ${idx % 2 === 1 ? "reverse" : ""}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => {
                  if (project.id === "gojobsync") {
                    setIsGoJobSyncModalOpen(true);
                  }
                }}
                onMouseEnter={() => {
                  if (project.id === "gojobsync") {
                    setCursorTip("Click to view full work details of GoJobSync!");
                  } else {
                    setCursorTip(`View ${project.name}`);
                  }
                }}
                onMouseLeave={() => setCursorTip(null)}
              >
                {/* Project Details */}
                <div className="showcase-info">
                  <div>
                    <div className="showcase-badge">
                      <Sparkles size={12} />
                      <span>{project.badge || "Featured Platform"}</span>
                    </div>

                    <h3 className="showcase-title">{project.name}</h3>
                    <p style={{ fontSize: 13, color: "var(--accent-emerald-dark)", marginBottom: 12, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {project.category}
                    </p>

                    <p className="showcase-desc">{project.description}</p>

                    {project.highlights && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
                          KEY DELIVERABLES
                        </div>
                        <div className="timeline-bullet-list">
                          {project.highlights.map((h: string, i: number) => (
                            <div key={i} className="timeline-bullet-item" style={{ fontSize: 12.5 }}>
                              <Check size={14} />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="showcase-tags">
                      {project.tags?.map((tag: string) => (
                        <span key={tag} className="showcase-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="showcase-actions">
                    {project.id === "gojobsync" ? (
                      <button
                        type="button"
                        className="project-btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsGoJobSyncModalOpen(true);
                        }}
                      >
                        <FileText size={14} />
                        <span>View Full Work Details</span>
                      </button>
                    ) : (
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noreferrer"
                        className="project-btn-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{project.liveLinkText || "Live Demo"}</span>
                        <ArrowUpRight size={14} />
                      </a>
                    )}

                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="project-btn-quiet"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github size={14} />
                        <span>Source Code</span>
                      </a>
                    )}

                    {project.id === "gojobsync" && (
                      <a
                        href="http://localhost:3001"
                        target="_blank"
                        rel="noreferrer"
                        className="project-btn-quiet"
                        style={{ color: "#059669", fontWeight: 700 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
                        <span>Open Live App</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Project Visual Showcase */}
                <div className="showcase-visual">
                  <div className="mockup-frame">
                    <div className="mockup-browser-bar">
                      <div className="terminal-dots">
                        <span className="t-dot red" />
                        <span className="t-dot yellow" />
                        <span className="t-dot green" />
                      </div>
                      <div className="mockup-address">
                        {project.id === "gojobsync"
                          ? "https://www.gojobsync.com"
                          : project.id === "smart-voterai"
                          ? "https://github.com/KAMESH1206/smart-voterai"
                          : "https://github.com/KAMESH1206/gym-crm"}
                      </div>
                      <ExternalLink size={12} color="var(--text-dim)" />
                    </div>

                    {/* Custom Project Screenshot / Image if uploaded */}
                    {project.image ? (
                      <div style={{ position: "relative", width: "100%", height: 260, background: "#f8fafc", overflow: "hidden" }}>
                        <Image
                          src={project.image}
                          alt={project.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 550px"
                        />
                      </div>
                    ) : (
                      <>
                        {/* GoJobSync Visual */}
                        {project.id === "gojobsync" && (
                          <div style={{ padding: 18 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>STACK</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-heading)" }}>Next.js 15</div>
                                <div style={{ fontSize: 10, color: "#059669", fontWeight: 600 }}>Prisma + Supabase</div>
                              </div>
                              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>ALERTS</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-heading)" }}>AWS SNS</div>
                                <div style={{ fontSize: 10, color: "#d97706", fontWeight: 600 }}>Recurring Workflows</div>
                              </div>
                              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>CAMPUS CRM</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-heading)" }}>Placement Hub</div>
                                <div style={{ fontSize: 10, color: "#0284c7", fontWeight: 600 }}>Drive Management</div>
                              </div>
                            </div>

                            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid var(--border-subtle)", fontSize: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontWeight: 700, color: "var(--text-heading)" }}>Recruitment Job Fair Engine</span>
                                <span style={{ color: "#059669", fontWeight: 700, fontSize: 11 }}>● Production Active</span>
                              </div>
                              <div style={{ color: "var(--text-muted)", fontSize: 11.5, lineHeight: 1.6 }}>
                                Built solo: Full candidate lifecycle, internal CRM dashboards, real-time Supabase auth, and AI agent workflow automation.
                              </div>
                            </div>

                            <div style={{ marginTop: 12, textAlign: "center" }}>
                              <span style={{ fontSize: 11, color: "var(--accent-emerald-dark)", fontWeight: 700, textDecoration: "underline" }}>
                                Click card to open full engineering breakdown & modal →
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Smart Voter AI Visual */}
                        {project.id === "smart-voterai" && (
                          <div style={{ padding: 22, textAlign: "center" }}>
                            <div style={{ width: 68, height: 68, borderRadius: "50%", border: "2px dashed #059669", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Vote size={32} color="#059669" />
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-heading)", marginBottom: 4 }}>
                              Biometric & OCR Digital Voting
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 12 }}>
                              TypeScript · Face Match Verification · Aadhaar OCR Extraction
                            </div>
                            <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid var(--border-subtle)", fontSize: 11, fontFamily: "var(--font-mono)", textAlign: "left" }}>
                              <div style={{ color: "#059669", fontWeight: 600 }}>✔ JWT Voter Authentication</div>
                              <div style={{ color: "#0284c7", fontWeight: 600 }}>✔ Role-Based Access Control (RBAC)</div>
                              <div style={{ color: "#d97706", fontWeight: 600 }}>✔ Real-time Admin Election Tally</div>
                            </div>
                          </div>
                        )}

                        {/* Gym CRM Visual */}
                        {project.id === "gym-crm" && (
                          <div style={{ padding: 22, textAlign: "left" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                              <Dumbbell size={26} color="#059669" />
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-heading)" }}>
                                  Gym Management & Operations CRM
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                                  TypeScript · Member Subscriptions & Pipelines
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                              <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>SUBSCRIPTIONS</div>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>Recurring Plans</div>
                              </div>
                              <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>TRAINERS</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>Schedule System</div>
                              </div>
                            </div>

                            <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                              • Member lifecycle tracking with automated renewal alerts
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* VIEW ALL PROJECTS TOGGLE BUTTON */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowAllProjects(!showAllProjects)}
              onMouseEnter={() => setCursorTip(showAllProjects ? "Collapse Repository List" : "Expand All 7 GitHub Repositories")}
              onMouseLeave={() => setCursorTip(null)}
            >
              <FolderGit2 size={16} />
              <span>
                {showAllProjects ? "Show Top 3 Projects Only" : "View All Projects (7 GitHub Repositories)"}
              </span>
              <ChevronDown
                size={16}
                style={{
                  transform: showAllProjects ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.25s ease",
                }}
              />
            </button>
          </div>

          {/* EXPANDABLE ALL GITHUB REPOSITORIES GRID */}
          <AnimatePresence>
            {showAllProjects && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ paddingTop: 30 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 8 }}>
                      <Github size={16} />
                      <span>All Repositories on github.com/KAMESH1206</span>
                    </div>
                    <a
                      href="https://github.com/KAMESH1206?tab=repositories"
                      target="_blank"
                      rel="noreferrer"
                      className="project-btn-quiet"
                      style={{ fontSize: 12 }}
                    >
                      <span>Open on GitHub</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>

                  <div className="github-repos-grid">
                    {data?.githubRepos?.map((repo: any, i: number) => (
                      <div
                        key={i}
                        className="github-repo-card"
                        onMouseEnter={() => setCursorTip(`View ${repo.name} on GitHub`)}
                        onMouseLeave={() => setCursorTip(null)}
                      >
                        <div>
                          <div className="repo-header">
                            <span className="repo-title">{repo.name}</span>
                            <span className="repo-lang-tag">
                              <span className={`lang-dot ${repo.langClass || "lang-ts"}`} />
                              {repo.language}
                            </span>
                          </div>
                          <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
                            {repo.description}
                          </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
                          <span style={{ fontSize: 10.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                            {repo.updated}
                          </span>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="project-btn-quiet"
                            style={{ fontSize: 11, padding: "5px 10px" }}
                          >
                            <span>Repo</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* TECHNICAL SKILLS SPECTRUM */}
        <section className="section-wrap" id="skills">
          <div className="section-header-flex">
            <div>
              <div className="section-tag">
                <Cpu size={14} />
                <span>SKILLS & CAPABILITIES</span>
              </div>
              <h2 className="section-title">
                Technical Stack & <br />
                <span className="gradient-text">Core Proficiencies.</span>
              </h2>
            </div>
            <p className="section-description">
              Hover over each skill to view exact contextual usage and production experience.
            </p>
          </div>

          <div className="skills-container">
            {data?.skillsData?.map((category: any, idx: number) => {
              const iconMap: Record<string, any> = {
                BrainCircuit,
                Bot,
                Code2,
                Server,
              };
              const Icon = iconMap[category.iconName] || Code2;
              return (
                <div key={category.category || idx} className="skill-category-card">
                  <div className="skill-card-top">
                    <div className="skill-badge-icon">
                      <Icon size={18} />
                    </div>
                    <h3 className="skill-card-title">{category.category}</h3>
                  </div>

                  <div className="skill-pill-list">
                    {category.skills?.map((skill: any) => (
                      <div
                        key={skill.name}
                        className="skill-pill-item"
                        onMouseEnter={() => setCursorTip(`${skill.name}: ${skill.tip || "Production skill"}`)}
                        onMouseLeave={() => setCursorTip(null)}
                      >
                        <span>{skill.name}</span>
                        <span className="skill-level-tag">{skill.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Languages & Recognitions Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 22 }}>
            <div className="bento-card" style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Award size={18} color="#d97706" />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-heading)" }}>Certifications & Honors</h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "var(--text-muted)" }}>
                {data?.recognitions?.certifications?.map((c: string, i: number) => (
                  <div key={i}>• {c}</div>
                ))}
              </div>
            </div>

            <div className="bento-card" style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Globe size={18} color="#0284c7" />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-heading)" }}>Spoken Languages</h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data?.recognitions?.languages?.map((lang: any, i: number) => (
                  <div key={i} className="skill-pill-item">
                    <span>{lang.name}</span>
                    <span className="skill-level-tag">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WORK EXPERIENCE */}
        <section className="section-wrap" id="experience">
          <div className="section-header-flex">
            <div>
              <div className="section-tag">
                <Briefcase size={14} />
                <span>CAREER TRACK RECORD</span>
              </div>
              <h2 className="section-title">
                Work Experience & <br />
                <span className="gradient-text">Production Delivery.</span>
              </h2>
            </div>
            <p className="section-description">
              Hands-on engineering roles across full-stack SaaS delivery and modern studio web development.
            </p>
          </div>

          <div className="journey-timeline">
            {data?.experience?.map((exp: any, idx: number) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot">
                  <Briefcase size={20} />
                </div>
                <div
                  className="timeline-card"
                  onMouseEnter={() => setCursorTip(`${exp.role} @ ${exp.company}`)}
                  onMouseLeave={() => setCursorTip(null)}
                >
                  <div className="timeline-header">
                    <div>
                      <h3 className="timeline-role">{exp.role}</h3>
                      <div className="timeline-org">
                        {exp.company} · {exp.location}
                      </div>
                    </div>
                    <span className="timeline-date">{exp.period}</span>
                  </div>

                  <p className="timeline-desc">{exp.description}</p>

                  <div className="timeline-bullet-list">
                    {exp.bullets?.map((b: string, i: number) => (
                      <div key={i} className="timeline-bullet-item">
                        <Check size={14} />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="timeline-tags">
                    {exp.tags?.map((t: string) => (
                      <span key={t} className="timeline-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EDUCATION (HIGHER EDUCATION ONLY - HSC & SSLC OMITTED) */}
        <section className="section-wrap" id="education">
          <div className="section-header-flex">
            <div>
              <div className="section-tag">
                <GraduationCap size={14} />
                <span>ACADEMIC FOUNDATION</span>
              </div>
              <h2 className="section-title">
                Higher Education & <br />
                <span className="gradient-text">Qualifications.</span>
              </h2>
            </div>
            <p className="section-description">
              Postgraduate and undergraduate credentials in computer applications and artificial intelligence.
            </p>
          </div>

          <div className="journey-timeline">
            {data?.education?.map((edu: any, idx: number) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot" style={{ borderColor: idx === 0 ? "var(--accent-amber)" : "var(--accent-emerald)" }}>
                  <GraduationCap size={20} color={idx === 0 ? "#d97706" : "#059669"} />
                </div>
                <div
                  className="timeline-card"
                  onMouseEnter={() => setCursorTip(`${edu.degree} — ${edu.institution}`)}
                  onMouseLeave={() => setCursorTip(null)}
                >
                  <div className="timeline-header">
                    <div>
                      <h3 className="timeline-role">{edu.degree}</h3>
                      <div className="timeline-org" style={{ color: idx === 0 ? "var(--accent-amber)" : "var(--accent-emerald-dark)" }}>
                        {edu.institution}
                      </div>
                    </div>
                    <span className="timeline-date">{edu.period}</span>
                  </div>

                  <p className="timeline-desc" style={{ marginBottom: 0 }}>
                    {edu.focus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KEY HIGHLIGHTS & EXTRA DETAILS (CUSTOM SECTION EDITABLE IN ADMIN) */}
        {data?.extraDetails && data.extraDetails.length > 0 && (
          <section className="section-wrap" id="highlights">
            <div className="section-header-flex">
              <div>
                <div className="section-tag">
                  <Sparkles size={14} />
                  <span>ADDITIONAL CREDENTIALS & HIGHLIGHTS</span>
                </div>
                <h2 className="section-title">
                  Key Highlights & <br />
                  <span className="gradient-text">Extra Details.</span>
                </h2>
              </div>
              <p className="section-description">
                Specialized domain competencies, hackathon awards, and engineering achievements.
              </p>
            </div>

            <div className="extra-details-grid">
              {data.extraDetails.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="extra-detail-card"
                  onMouseEnter={() => setCursorTip(item.title)}
                  onMouseLeave={() => setCursorTip(null)}
                >
                  {item.image && (
                    <div className="extra-detail-image-box">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                  )}

                  <div className="extra-detail-content">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                      <span className="status-pill" style={{ fontSize: 11, padding: "3px 8px" }}>
                        {item.badge || item.category || "Highlight"}
                      </span>
                      {item.category && item.badge && (
                        <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                          {item.category}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, color: "var(--text-heading)", marginBottom: 8 }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: item.link ? 14 : 0, flex: 1 }}>
                      {item.description}
                    </p>

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="project-btn-quiet"
                        style={{ fontSize: 12, display: "inline-flex", width: "fit-content", marginTop: 8 }}
                      >
                        <span>{item.linkText || "View Details"}</span>
                        <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* HIRE ME / CONTACT SECTION */}
        <section className="contact-section-wrap" id="contact">
          <div className="contact-card-master">
            <div className="contact-grid">
              <div className="contact-left">
                <div>
                  <div className="section-tag">
                    <Sparkles size={14} />
                    <span>LET&apos;S WORK TOGETHER</span>
                  </div>

                  <h2 className="contact-heading">
                    Have an opportunity or project?<br />
                    Let&apos;s build it <span className="gradient-text">together.</span>
                  </h2>

                  <p className="contact-body-text">
                    I&apos;m actively open to full-time engineering roles, high-impact AI/web
                    projects, and freelance consulting. Feel free to call, email, or send a message
                    directly.
                  </p>
                </div>

                <div className="contact-quick-links">
                  {/* Phone Click & Copy */}
                  <div
                    className="contact-link-row"
                    onClick={handleCopyPhone}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setCursorTip(`Click to copy ${phone}`)}
                    onMouseLeave={() => setCursorTip(null)}
                  >
                    <Phone size={18} />
                    <div>
                      <div className="contact-link-label">Direct Phone / WhatsApp</div>
                      <div className="contact-link-value">{phone}</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--accent-emerald-dark)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                      {copiedPhone ? "Copied! ✓" : "Click to copy"}
                    </span>
                  </div>

                  {/* Email Click & Copy */}
                  <div
                    className="contact-link-row"
                    onClick={handleCopyEmail}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setCursorTip(`Click to copy ${email}`)}
                    onMouseLeave={() => setCursorTip(null)}
                  >
                    <Mail size={18} />
                    <div>
                      <div className="contact-link-label">Direct Email</div>
                      <div className="contact-link-value">{email}</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--accent-emerald-dark)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                      {copiedEmail ? "Copied! ✓" : "Click to copy"}
                    </span>
                  </div>

                  {/* LinkedIn */}
                  <a
                    href={data?.profile?.linkedin || "https://linkedin.com/in/kamesh-m-r-95101840a"}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-link-row"
                    onMouseEnter={() => setCursorTip("Open LinkedIn Profile in New Tab")}
                    onMouseLeave={() => setCursorTip(null)}
                  >
                    <Linkedin size={18} />
                    <div>
                      <div className="contact-link-label">LinkedIn Profile</div>
                      <div className="contact-link-value">linkedin.com/in/kamesh-m-r-95101840a</div>
                    </div>
                    <ExternalLink size={14} style={{ marginLeft: "auto", color: "var(--text-dim)" }} />
                  </a>

                  {/* GitHub Profile */}
                  <a
                    href={data?.profile?.github || "https://github.com/KAMESH1206"}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-link-row"
                    onMouseEnter={() => setCursorTip("Open github.com/KAMESH1206 in New Tab")}
                    onMouseLeave={() => setCursorTip(null)}
                  >
                    <Github size={18} />
                    <div>
                      <div className="contact-link-label">GitHub Repositories</div>
                      <div className="contact-link-value">github.com/KAMESH1206</div>
                    </div>
                    <ExternalLink size={14} style={{ marginLeft: "auto", color: "var(--text-dim)" }} />
                  </a>

                  {/* Location Base */}
                  <div className="contact-link-row">
                    <MapPin size={18} />
                    <div>
                      <div className="contact-link-label">Location Base</div>
                      <div className="contact-link-value">{data?.profile?.location || "Chennai / Bangalore, India"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Contact Form */}
              <div className="contact-right">
                <form className="contact-form-wrap" onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label className="form-label">OPPORTUNITY / PROJECT TYPE</label>
                    <div className="project-type-selector">
                      {[
                        "Full-Time Role",
                        "AI Agent / ML Project",
                        "Full-Stack Web App",
                        "Freelance Contract",
                        "Quick Discussion",
                      ].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`type-pill ${selectedProjectType === type ? "selected" : ""}`}
                          onClick={() => setSelectedProjectType(type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label htmlFor="name-input" className="form-label">YOUR NAME *</label>
                      <input
                        id="name-input"
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan"
                        className="form-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email-input" className="form-label">YOUR EMAIL ADDRESS *</label>
                      <input
                        id="email-input"
                        type="email"
                        required
                        placeholder="alex@company.com"
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone-input" className="form-label">
                      YOUR PHONE NUMBER (FOR INSTANT CALL-BACK / WHATSAPP)
                    </label>
                    <input
                      id="phone-input"
                      type="text"
                      placeholder="+91 98765 43210 (Optional)"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message-input" className="form-label">MESSAGE OR ROLE DETAILS *</label>
                    <textarea
                      id="message-input"
                      rows={3}
                      required
                      placeholder="Tell me about your product requirements, interview invite, or role scope..."
                      className="form-input"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="form-submit-btn"
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="pulse-dot" />
                        <span>Sending Message & Dispatching Email...</span>
                      </>
                    ) : formSent ? (
                      <>
                        <Check size={16} />
                        <span>{submitMessage || "Message Sent! Kamesh Notified."}</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message / Request Interview</span>
                      </>
                    )}
                  </button>

                  {/* AI Agent Callout Notice */}
                  <div
                    style={{
                      marginTop: 14,
                      padding: "12px 16px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "rgba(5, 150, 105, 0.15)",
                        border: "1.5px solid #059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Bot size={18} color="#059669" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>Call Not Answered? Kamesh&apos;s AI Agent is Online!</span>
                        <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        If Kamesh is on another call or coding, his autonomous AI Representative answers questions & logs urgent callbacks 24/7.
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer-wrap">
          <div className="footer-brand">
            <span className="brand-dot" />
            <span>KAMESH M R · ARTIFICIAL INTELLIGENCE DEVELOPER</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span>Built with Next.js 15, React 19 & Framer Motion · © {new Date().getFullYear()}</span>
            <span>·</span>
            <Link
              href="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                color: "var(--accent-emerald-dark)",
                fontWeight: 700,
                fontSize: 12,
                textDecoration: "underline",
              }}
              onMouseEnter={() => setCursorTip("Open /admin CMS Portal")}
              onMouseLeave={() => setCursorTip(null)}
            >
              <Settings size={13} />
              <span>Admin Portal</span>
            </Link>
          </div>

          <a href="#hero" className="back-to-top-btn">
            Back to Top <ArrowUpRight size={13} />
          </a>
        </footer>
      </div>

      {/* ========================================================
          GOJOBSYNC FULL WORK BREAKDOWN MODAL DIALOG
          ======================================================== */}
      <AnimatePresence>
        {isGoJobSyncModalOpen && (
          <div
            className="modal-overlay"
            onClick={() => setIsGoJobSyncModalOpen(false)}
          >
            <motion.div
              className="modal-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <div className="showcase-badge" style={{ marginBottom: 6 }}>
                    <Sparkles size={11} />
                    <span>SOLO APPLICATION DEVELOPER & ARCHITECT</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--text-heading)" }}>
                    GoJobSync (www.gojobsync.com) — Full Work Breakdown
                  </h3>
                  <div style={{ fontSize: 12.5, color: "var(--accent-emerald-dark)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    Thejobsync, Chennai · Jul 2026 — Present
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsGoJobSyncModalOpen(false)}
                  aria-label="Close Modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div>
                  <div className="modal-section-title">
                    <Rocket size={17} color="#059669" />
                    <span>Project Overview & Solo Ownership</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.7 }}>
                    Independently designed, built and deployed <strong>www.gojobsync.com</strong>,
                    a recurring end-to-end recruitment/job-sync platform. I owned the project
                    full stack from initial architecture, database schema design, and UI component
                    delivery all the way to production deployment and maintenance on AWS.
                  </p>
                </div>

                <div>
                  <div className="modal-section-title">
                    <Code2 size={17} color="#059669" />
                    <span>Detailed Technical Responsibilities & Modules Delivered</span>
                  </div>

                  <div className="work-breakdown-grid">
                    <div className="work-breakdown-card">
                      <h5>1. Next.js 15 & TypeScript Frontend</h5>
                      <p>
                        Engineered the client architecture using Next.js 15 (App Router), React.js,
                        and TypeScript. Delivered a fast, type-safe, and fully responsive UI with
                        seamless client/server component boundaries.
                      </p>
                    </div>

                    <div className="work-breakdown-card">
                      <h5>2. Prisma ORM & Supabase Backend</h5>
                      <p>
                        Modeled the relational database schema with Prisma ORM. Integrated Supabase
                        for real-time data synchronization, secure user authentication, and high-speed
                        API connections.
                      </p>
                    </div>

                    <div className="work-breakdown-card">
                      <h5>3. AWS SNS Recurring Notifications</h5>
                      <p>
                        Implemented automated notification workflows using Amazon Simple Notification
                        Service (AWS SNS) for recurring candidate updates, status alerts, and employer
                        digests.
                      </p>
                    </div>

                    <div className="work-breakdown-card">
                      <h5>4. Internal Campus CRM Module</h5>
                      <p>
                        Designed and built an internal CRM system to manage college campus recruitment
                        drives, candidate pipelines, interview scheduling, and placement coordination.
                      </p>
                    </div>

                    <div className="work-breakdown-card">
                      <h5>5. AWS Deployment & Maintenance</h5>
                      <p>
                        Deployed and maintained the platform infrastructure on AWS, configuring secure
                        networking, environment management, and ensuring zero downtime.
                      </p>
                    </div>

                    <div className="work-breakdown-card">
                      <h5>6. AI Agents & Prompt Engineering</h5>
                      <p>
                        Applied AI agents and prompt engineering (LangChain, OpenAI API) to automate
                        repetitive engineering workflows, auto-generate candidate summaries, and
                        support data-driven hiring decisions.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="showcase-tag">Next.js 15</span>
                    <span className="showcase-tag">Prisma ORM</span>
                    <span className="showcase-tag">Supabase</span>
                    <span className="showcase-tag">AWS SNS</span>
                    <span className="showcase-tag">LangChain</span>
                  </div>

                  <div className="modal-actions-bar" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href="http://localhost:3001"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      style={{ fontSize: 13, padding: "10px 18px" }}
                    >
                      <span>Open Live Platform</span>
                      <ExternalLink size={14} />
                    </a>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsGoJobSyncModalOpen(false)}
                      style={{ fontSize: 13, padding: "10px 18px" }}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {(copiedEmail || copiedPhone) && (
          <motion.div
            className="toast-notice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Check size={18} color="#34d399" />
            <span>
              {copiedEmail
                ? `Email copied to clipboard (${email})`
                : `Phone number copied (${phone})`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 24/7 Interactive AI Autonomous Representative Widget */}
      <AiAgentWidget kameshPhone={phone} kameshEmail={email} />
    </main>
  );
}
