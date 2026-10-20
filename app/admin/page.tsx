"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Award,
  Bot,
  BrainCircuit,
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  FileCode,
  FileText,
  FolderGit2,
  GraduationCap,
  Image as ImageIcon,
  Key,
  Layers,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

import defaultPortfolioData from "../../data/portfolio.json";

export default function AdminPage() {
  const [data, setData] = useState<any>(defaultPortfolioData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "inbox" | "metrics" | "projects" | "experience" | "education" | "skills" | "extra" | "recognitions"
  >("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inquiries & AI Leads state
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Live Email SMTP state
  const [smtpSettings, setSmtpSettings] = useState({
    host: "smtp.gmail.com",
    port: 465,
    user: "mrkamesh8@gmail.com",
    pass: "",
    receiverEmail: "mrkamesh8@gmail.com",
    isConfigured: false,
  });
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // File input refs
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingProjectIdx, setUploadingProjectIdx] = useState<number | null>(null);
  const [uploadingExtraIdx, setUploadingExtraIdx] = useState<number | null>(null);

  // New Project modal state
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    id: "",
    number: "04",
    name: "",
    category: "",
    badge: "Featured",
    description: "",
    image: "",
    tags: "",
    type: "fullstack",
    href: "",
    github: "",
    liveLinkText: "Live Demo",
    highlights: "",
  });
  const [uploadingNewProjectImg, setUploadingNewProjectImg] = useState(false);

  // New Experience modal state
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [newExp, setNewExp] = useState({
    role: "",
    company: "",
    location: "Chennai, India",
    period: "2026 — Present",
    description: "",
    bullets: "",
    tags: "",
  });

  // New Education modal state
  const [showAddEduModal, setShowAddEduModal] = useState(false);
  const [newEdu, setNewEdu] = useState({
    degree: "",
    institution: "",
    period: "",
    focus: "",
  });

  // New Extra Detail modal state
  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [newExtra, setNewExtra] = useState({
    title: "",
    category: "Core Strengths",
    badge: "Achievement",
    description: "",
    image: "",
    link: "",
    linkText: "View Details",
  });
  const [uploadingNewExtraImg, setUploadingNewExtraImg] = useState(false);

  // Load portfolio data & messages from API
  useEffect(() => {
    fetchPortfolioData();
    fetchMessages();
    fetchSmtpSettings();
  }, []);

  const fetchSmtpSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        if (json?.smtp) {
          setSmtpSettings((prev) => ({
            ...prev,
            ...json.smtp,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load SMTP settings", err);
    }
  };

  const handleSaveSmtp = async () => {
    try {
      setSavingSmtp(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smtp: smtpSettings }),
      });
      if (res.ok) {
        showToast("Email alert settings saved successfully!");
        fetchSmtpSettings();
      } else {
        showToast("Failed to save email settings");
      }
    } catch {
      showToast("Error saving email settings");
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      setTestResult(null);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpSettings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Test email successfully sent to ${smtpSettings.receiverEmail}! Check your inbox.`,
        });
        showToast("Live test email sent successfully!");
      } else {
        setTestResult({
          success: false,
          message: data.error || "Failed to dispatch test email. Check your Gmail App Password.",
        });
        showToast("Email test failed: check app password");
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Network error while testing email",
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const res = await fetch("/api/contact");
      if (res.ok) {
        const json = await res.json();
        setMessages(json);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        showToast("Message deleted from inbox.");
      }
    } catch {
      showToast("Error deleting message");
    }
  };

  const handleToggleMessageStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "unread" ? "replied" : "unread";
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m))
        );
        showToast(`Marked as ${nextStatus}!`);
      }
    } catch {
      showToast("Error updating status");
    }
  };

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const json = await res.json();
        // Ensure defaults for optional arrays
        if (!json.extraDetails) json.extraDetails = [];
        if (!json.metrics) json.metrics = [];
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load portfolio data", err);
      showToast("Error loading portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast("Portfolio changes saved successfully! Live on website.");
      } else {
        showToast("Failed to save changes. Please try again.");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving data");
    } finally {
      setSaving(false);
    }
  };

  // Upload Profile Photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setData((prev: any) => ({
          ...prev,
          profile: {
            ...prev.profile,
            photo: result.url,
          },
        }));
        showToast("Profile photo uploaded! Remember to click Save.");
      } else {
        showToast("Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading file");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Upload Resume PDF
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setData((prev: any) => ({
          ...prev,
          profile: {
            ...prev.profile,
            resumePdf: result.url,
          },
        }));
        showToast("Resume document uploaded!");
      } else {
        showToast("Failed to upload resume");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading resume");
    } finally {
      setUploadingResume(false);
    }
  };

  // Upload Project Screenshot / Image
  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingProjectIdx(projectIdx);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setData((prev: any) => {
          const updated = [...prev.mainProjects];
          updated[projectIdx] = { ...updated[projectIdx], image: result.url };
          return { ...prev, mainProjects: updated };
        });
        showToast("Project image uploaded successfully!");
      } else {
        showToast("Failed to upload image.");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading project screenshot");
    } finally {
      setUploadingProjectIdx(null);
    }
  };

  // Upload Image for New Project Modal
  const handleNewProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingNewProjectImg(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setNewProject((prev) => ({ ...prev, image: result.url }));
        showToast("Project screenshot uploaded!");
      } else {
        showToast("Failed to upload image.");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading image");
    } finally {
      setUploadingNewProjectImg(false);
    }
  };

  // Upload Extra Detail Image
  const handleExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, extraIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingExtraIdx(extraIdx);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setData((prev: any) => {
          const updated = [...(prev.extraDetails || [])];
          updated[extraIdx] = { ...updated[extraIdx], image: result.url };
          return { ...prev, extraDetails: updated };
        });
        showToast("Extra card image uploaded!");
      } else {
        showToast("Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading file");
    } finally {
      setUploadingExtraIdx(null);
    }
  };

  // Upload Image for New Extra Detail Modal
  const handleNewExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingNewExtraImg(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setNewExtra((prev) => ({ ...prev, image: result.url }));
        showToast("Image uploaded for new card!");
      } else {
        showToast("Upload failed");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading file");
    } finally {
      setUploadingNewExtraImg(false);
    }
  };

  // Add new project
  const handleAddProject = () => {
    if (!newProject.name) return;

    const formattedTags = newProject.tags
      ? newProject.tags.split(",").map((t) => t.trim())
      : ["Next.js", "TypeScript"];
    const formattedHighlights = newProject.highlights
      ? newProject.highlights.split("\n").filter(Boolean)
      : ["Production quality delivery", "Clean architecture & responsive UI"];

    const projectObj = {
      id: newProject.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      number: String((data?.mainProjects?.length || 0) + 1).padStart(2, "0"),
      name: newProject.name,
      category: newProject.category || "Full-Stack Web App",
      badge: newProject.badge || "Featured",
      description: newProject.description,
      image: newProject.image || "",
      tags: formattedTags,
      type: newProject.type,
      href: newProject.href || "#",
      github: newProject.github || "https://github.com/KAMESH1206",
      liveLinkText: newProject.liveLinkText || "Live Demo",
      highlights: formattedHighlights,
    };

    setData((prev: any) => ({
      ...prev,
      mainProjects: [...(prev.mainProjects || []), projectObj],
    }));

    setShowAddProjectModal(false);
    setNewProject({
      id: "",
      number: "04",
      name: "",
      category: "",
      badge: "Featured",
      description: "",
      image: "",
      tags: "",
      type: "fullstack",
      href: "",
      github: "",
      liveLinkText: "Live Demo",
      highlights: "",
    });
    showToast("Project added! Click Save All Changes to publish.");
  };

  // Delete project
  const handleDeleteProject = (index: number) => {
    if (!confirm("Are you sure you want to remove this project?")) return;
    setData((prev: any) => {
      const updated = [...prev.mainProjects];
      updated.splice(index, 1);
      return { ...prev, mainProjects: updated };
    });
    showToast("Project removed from list.");
  };

  // Add new experience
  const handleAddExperience = () => {
    if (!newExp.role || !newExp.company) return;

    const bulletsList = newExp.bullets
      ? newExp.bullets.split("\n").filter(Boolean)
      : ["Delivered scalable features and responsive UI"];
    const tagsList = newExp.tags ? newExp.tags.split(",").map((t) => t.trim()) : ["React.js", "Next.js"];

    const expObj = {
      role: newExp.role,
      company: newExp.company,
      location: newExp.location,
      period: newExp.period,
      description: newExp.description,
      bullets: bulletsList,
      tags: tagsList,
    };

    setData((prev: any) => ({
      ...prev,
      experience: [expObj, ...prev.experience],
    }));

    setShowAddExpModal(false);
    setNewExp({
      role: "",
      company: "",
      location: "Chennai, India",
      period: "2026 — Present",
      description: "",
      bullets: "",
      tags: "",
    });
    showToast("Experience added! Click Save Changes.");
  };

  // Delete experience
  const handleDeleteExperience = (index: number) => {
    if (!confirm("Remove this experience entry?")) return;
    setData((prev: any) => {
      const updated = [...prev.experience];
      updated.splice(index, 1);
      return { ...prev, experience: updated };
    });
  };

  // Add education
  const handleAddEducation = () => {
    if (!newEdu.degree || !newEdu.institution) return;

    const eduObj = {
      degree: newEdu.degree,
      institution: newEdu.institution,
      period: newEdu.period,
      focus: newEdu.focus,
    };

    setData((prev: any) => ({
      ...prev,
      education: [...(prev.education || []), eduObj],
    }));

    setShowAddEduModal(false);
    setNewEdu({ degree: "", institution: "", period: "", focus: "" });
    showToast("Education degree added! Click Save Changes.");
  };

  // Delete education
  const handleDeleteEducation = (index: number) => {
    if (!confirm("Remove this education entry?")) return;
    setData((prev: any) => {
      const updated = [...prev.education];
      updated.splice(index, 1);
      return { ...prev, education: updated };
    });
  };

  // Add Extra Detail
  const handleAddExtraDetail = () => {
    if (!newExtra.title) return;

    const extraObj = {
      id: `extra-${Date.now()}`,
      title: newExtra.title,
      category: newExtra.category || "Specialized Strengths",
      badge: newExtra.badge || "Key Detail",
      description: newExtra.description,
      image: newExtra.image || "",
      link: newExtra.link || "",
      linkText: newExtra.linkText || "View Details",
    };

    setData((prev: any) => ({
      ...prev,
      extraDetails: [...(prev.extraDetails || []), extraObj],
    }));

    setShowAddExtraModal(false);
    setNewExtra({
      title: "",
      category: "Core Strengths",
      badge: "Achievement",
      description: "",
      image: "",
      link: "",
      linkText: "View Details",
    });
    showToast("Extra detail card added! Click Save Changes to publish.");
  };

  // Delete Extra Detail
  const handleDeleteExtraDetail = (index: number) => {
    if (!confirm("Remove this extra detail card?")) return;
    setData((prev: any) => {
      const updated = [...(prev.extraDetails || [])];
      updated.splice(index, 1);
      return { ...prev, extraDetails: updated };
    });
    showToast("Card removed.");
  };

  // Add Metric
  const handleAddMetric = () => {
    const newMetric = {
      value: "New",
      suffix: "+",
      label: "Metric Label",
      tip: "Metric description on hover",
    };
    setData((prev: any) => ({
      ...prev,
      metrics: [...(prev.metrics || []), newMetric],
    }));
    showToast("Metric badge added. Edit details below and Save.");
  };

  // Delete Metric
  const handleDeleteMetric = (index: number) => {
    setData((prev: any) => {
      const updated = [...(prev.metrics || [])];
      updated.splice(index, 1);
      return { ...prev, metrics: updated };
    });
  };

  if (loading || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18, fontWeight: 700, color: "var(--accent-emerald-dark)" }}>
          <RefreshCw className="animate-spin" size={24} />
          <span>Loading Portfolio Admin CMS...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "var(--text-main)", paddingBottom: 80 }}>
      {/* Top Admin Sticky Bar */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "16px 24px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-muted)",
                padding: "6px 12px",
                borderRadius: 8,
                background: "#f1f5f9",
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Portfolio</span>
            </Link>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LayoutDashboard size={18} color="var(--accent-emerald)" />
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                  Portfolio CMS Portal
                </h1>
                <span className="status-pill" style={{ padding: "3px 8px", fontSize: 10 }}>
                  Live Mode
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/"
              target="_blank"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-heading)",
                padding: "9px 16px",
                borderRadius: 10,
                border: "1px solid var(--border-subtle)",
                background: "#ffffff",
              }}
            >
              <span>View Live Website</span>
              <ExternalLink size={14} />
            </Link>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveChanges}
              disabled={saving}
              style={{ fontSize: 13, padding: "9px 22px" }}
            >
              <Save size={15} />
              <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Container */}
      <div style={{ maxWidth: 1240, margin: "24px auto 0", padding: "0 16px" }}>
        {/* Navigation Tabs */}
        <div className="admin-tabs-bar">
          {[
            { id: "profile", label: "Profile & Identity", icon: User },
            {
              id: "inbox",
              label: `Inquiries & AI Leads (${messages.filter((m) => m.status === "unread").length})`,
              icon: Mail,
              hasBadge: messages.filter((m) => m.status === "unread").length > 0,
            },
            { id: "metrics", label: "Hero Counters & Stats", icon: Layers },
            { id: "projects", label: "Featured Projects", icon: Rocket },
            { id: "experience", label: "Work Experience", icon: Briefcase },
            { id: "education", label: "Education (College)", icon: GraduationCap },
            { id: "skills", label: "Skills Matrix", icon: Cpu },
            { id: "extra", label: "Extra Details & Highlights", icon: Sparkles },
            { id: "recognitions", label: "Languages & Awards", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13.5,
                  fontWeight: 700,
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: isActive ? "var(--accent-slate)" : "#ffffff",
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  border: "1px solid",
                  borderColor: isActive ? "var(--accent-slate)" : "var(--border-subtle)",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 4px 12px rgba(15, 23, 42, 0.12)" : "none",
                  cursor: "pointer",
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: PROFILE & IDENTITY (PHOTO UPLOAD, BIO, CONTACTS)
            ======================================================== */}
        {activeTab === "profile" && (
          <div className="admin-2col-grid">
            {/* Left Column: Form Fields */}
            <div className="bento-card" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
                Personal Information & Bio
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">FULL NAME</label>
                  <input
                    type="text"
                    className="form-input"
                    value={data.profile.name || ""}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, name: e.target.value } })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PRIMARY PROFESSIONAL ROLE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={data.profile.role || ""}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, role: e.target.value } })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HERO EYEBROW BADGE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={data.profile.eyebrow || ""}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, eyebrow: e.target.value } })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HERO MAIN HEADLINE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={data.profile.title || ""}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, title: e.target.value } })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">BIO SUMMARY</label>
                  <textarea
                    rows={4}
                    className="form-input"
                    value={data.profile.subtitle || ""}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, subtitle: e.target.value } })
                    }
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">PHONE NUMBER</label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.profile.phone || ""}
                      onChange={(e) =>
                        setData({ ...data, profile: { ...data.profile, phone: e.target.value } })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      className="form-input"
                      value={data.profile.email || ""}
                      onChange={(e) =>
                        setData({ ...data, profile: { ...data.profile, email: e.target.value } })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">LOCATION BASE</label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.profile.location || ""}
                      onChange={(e) =>
                        setData({ ...data, profile: { ...data.profile, location: e.target.value } })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CURRENT COMPANY</label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.profile.currentCompany || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          profile: { ...data.profile, currentCompany: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">GITHUB PROFILE URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.profile.github || ""}
                      onChange={(e) =>
                        setData({ ...data, profile: { ...data.profile, github: e.target.value } })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">LINKEDIN PROFILE URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.profile.linkedin || ""}
                      onChange={(e) =>
                        setData({ ...data, profile: { ...data.profile, linkedin: e.target.value } })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Photo & Resume Uploaders */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Photo Uploader Card */}
              <div className="bento-card" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
                  Profile Photo Uploader
                </h3>

                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div
                    style={{
                      position: "relative",
                      width: 120,
                      height: 120,
                      borderRadius: 18,
                      overflow: "hidden",
                      border: "2px solid var(--accent-emerald-border)",
                      background: "#f1f5f9",
                      flexShrink: 0,
                    }}
                  >
                    {data.profile.photo ? (
                      <Image
                        src={data.profile.photo}
                        alt="Profile Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User size={48} color="var(--text-dim)" style={{ margin: "36px auto" }} />
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    <input
                      type="file"
                      ref={photoFileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => photoFileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      style={{ fontSize: 13, padding: "8px 16px" }}
                    >
                      <Camera size={14} />
                      <span>{uploadingPhoto ? "Uploading..." : "Upload New Photo"}</span>
                    </button>

                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                      Upload any portrait JPG, PNG or WEBP image.
                    </div>

                    <div style={{ marginTop: 4 }}>
                      <label className="form-label" style={{ fontSize: 10 }}>IMAGE PATH / URL</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: 11, padding: "6px 10px" }}
                        value={data.profile.photo || ""}
                        onChange={(e) =>
                          setData({ ...data, profile: { ...data.profile, photo: e.target.value } })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume File Uploader Card */}
              <div className="bento-card" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
                  Resume Document (PDF)
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "#f8fafc", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
                    <FileText size={24} color="#059669" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-heading)" }}>
                        Current Resume Document
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {data.profile.resumePdf || "/kamesh-resume.pdf"}
                      </div>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={resumeFileInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf,.doc,.docx"
                    style={{ display: "none" }}
                  />

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => resumeFileInputRef.current?.click()}
                      disabled={uploadingResume}
                      style={{ fontSize: 12, padding: "8px 14px", flex: 1 }}
                    >
                      <Upload size={14} />
                      <span>{uploadingResume ? "Uploading..." : "Upload New PDF"}</span>
                    </button>

                    <a
                      href={data.profile.resumePdf || "/kamesh-resume.pdf"}
                      target="_blank"
                      rel="noreferrer"
                      className="project-btn-quiet"
                      style={{ fontSize: 12, padding: "8px 14px" }}
                    >
                      <ExternalLink size={14} />
                      <span>View File</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: INQUIRIES & AI AGENT CALL-BACK LEADS INBOX
            ======================================================== */}
        {activeTab === "inbox" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-heading)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={18} color="var(--accent-emerald)" />
                  <span>Messages & AI Agent Leads Inbox ({messages.length})</span>
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
                  Every contact form submission and AI agent urgent callback request is recorded here in real-time.
                </p>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={fetchMessages}
                disabled={loadingMessages}
                style={{ fontSize: 12, padding: "8px 16px" }}
              >
                <RefreshCw size={13} className={loadingMessages ? "animate-spin" : ""} />
                <span>{loadingMessages ? "Refreshing..." : "Refresh Inbox"}</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
              <div className="bento-card" style={{ padding: 18, background: "#ffffff" }}>
                <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>TOTAL INQUIRIES</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-heading)", marginTop: 4 }}>
                  {messages.length}
                </div>
              </div>

              <div className="bento-card" style={{ padding: 18, background: "#ffffff" }}>
                <div style={{ fontSize: 11, color: "#d97706", textTransform: "uppercase", fontWeight: 700 }}>UNREAD LEADS</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#d97706", marginTop: 4 }}>
                  {messages.filter((m) => m.status === "unread").length}
                </div>
              </div>

              <div className="bento-card" style={{ padding: 18, background: "#ffffff" }}>
                <div style={{ fontSize: 11, color: "#059669", textTransform: "uppercase", fontWeight: 700 }}>AI AGENT CALLBACKS</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", marginTop: 4 }}>
                  {messages.filter((m) => m.source === "ai_agent" || m.projectType?.includes("Call-Back")).length}
                </div>
              </div>
            </div>

            {/* Live Email Notification Setup Card */}
            <div
              className="bento-card"
              style={{
                padding: 24,
                marginBottom: 24,
                border: "1.5px solid",
                borderColor: smtpSettings.isConfigured ? "var(--accent-emerald-border)" : "var(--accent-gold-border)",
                background: smtpSettings.isConfigured ? "#f0fdf4" : "#fffbeb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                      Live Email Alerts ({smtpSettings.receiverEmail || "mrkamesh8@gmail.com"})
                    </h4>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: smtpSettings.isConfigured ? "#ecfdf5" : "#fef3c7",
                        color: smtpSettings.isConfigured ? "#047857" : "#b45309",
                        border: `1px solid ${smtpSettings.isConfigured ? "#a7f3d0" : "#fde68a"}`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {smtpSettings.isConfigured ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      <span>{smtpSettings.isConfigured ? "Live Dispatch Ready" : "Setup Required for Email Inbox"}</span>
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                    Messages submitted on the portfolio & urgent AI leads are automatically saved in the inbox below. To receive them instantly on your personal email (<strong>mrkamesh8@gmail.com</strong>), enter your Gmail App Password below.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="admin-form-row-2" style={{ gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">SENDER GMAIL ACCOUNT</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="mrkamesh8@gmail.com"
                    value={smtpSettings.user}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, user: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>GMAIL 16-CHAR APP PASSWORD</span>
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      style={{ color: "var(--accent-emerald-dark)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                    >
                      {showSmtpPass ? "Hide" : "Show"}
                    </button>
                  </label>
                  <input
                    type={showSmtpPass ? "text" : "password"}
                    className="form-input"
                    placeholder="e.g. abcd efgh ijkl mnop"
                    value={smtpSettings.pass}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, pass: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">DELIVERY DESTINATION EMAIL</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="mrkamesh8@gmail.com"
                  value={smtpSettings.receiverEmail}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, receiverEmail: e.target.value })}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveSmtp}
                  disabled={savingSmtp}
                  style={{ fontSize: 12.5, padding: "9px 18px" }}
                >
                  <Save size={14} />
                  <span>{savingSmtp ? "Saving..." : "Save Email Settings"}</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp || !smtpSettings.pass}
                  style={{ fontSize: 12.5, padding: "9px 18px", background: "#ffffff" }}
                >
                  <Mail size={14} />
                  <span>{testingSmtp ? "Sending Test Email..." : "Send Live Test to mrkamesh8@gmail.com"}</span>
                </button>
              </div>

              {/* Test Result Alert */}
              {testResult && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    background: testResult.success ? "#ecfdf5" : "#fef2f2",
                    border: `1px solid ${testResult.success ? "#a7f3d0" : "#fecaca"}`,
                    color: testResult.success ? "#047857" : "#b91c1c",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* 3-Step Guide */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed rgba(15, 23, 42, 0.12)", fontSize: 12, color: "#475569" }}>
                <strong style={{ color: "var(--text-heading)" }}>⚡ 30-Second Setup to get your Gmail App Password:</strong>
                <ol style={{ paddingLeft: 18, marginTop: 6, lineHeight: 1.7 }}>
                  <li>Go to your Google Account: <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" style={{ color: "var(--accent-emerald-dark)", textDecoration: "underline", fontWeight: 600 }}>myaccount.google.com/security</a> (Ensure 2-Step Verification is ON).</li>
                  <li>Click or open: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: "var(--accent-emerald-dark)", textDecoration: "underline", fontWeight: 600 }}>myaccount.google.com/apppasswords</a></li>
                  <li>Type App Name: <strong>Portfolio</strong>, click <strong>Create</strong>, copy the 16-letter code generated by Google (e.g., <code>abcd efgh ijkl mnop</code>), paste it into the password box above, and click <strong>Save & Test</strong>!</li>
                </ol>
              </div>
            </div>

            {/* Messages List */}
            {messages.length === 0 ? (
              <div className="bento-card" style={{ padding: 48, textAlign: "center" }}>
                <Mail size={36} color="var(--text-dim)" style={{ margin: "0 auto 12px" }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-heading)", marginBottom: 6 }}>
                  No Messages Yet
                </h4>
                <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 420, margin: "0 auto" }}>
                  When recruiters, clients, or visitors submit the contact form or request a callback via your AI Agent, they will instantly appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bento-card"
                    style={{
                      padding: 24,
                      borderLeft: msg.status === "unread" ? "4px solid var(--accent-emerald)" : "1px solid var(--border-subtle)",
                      background: msg.status === "unread" ? "#ffffff" : "#fcfdfd",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <h4 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                            {msg.name}
                          </h4>

                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: msg.source === "ai_agent" ? "#ecfdf5" : "#f0f9ff",
                              color: msg.source === "ai_agent" ? "#047857" : "#0369a1",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {msg.source === "ai_agent" ? <Bot size={12} /> : <Mail size={12} />}
                            <span>{msg.source === "ai_agent" ? "AI Agent Call-Back Lead" : "Contact Form"}</span>
                          </span>

                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: msg.status === "unread" ? "#fef3c7" : "#f1f5f9",
                              color: msg.status === "unread" ? "#b45309" : "#64748b",
                            }}
                          >
                            {msg.status === "unread" ? "UNREAD" : "REPLIED"}
                          </span>
                        </div>

                        <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                          {new Date(msg.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleToggleMessageStatus(msg.id, msg.status)}
                          style={{
                            fontSize: 11,
                            padding: "6px 12px",
                            borderRadius: 6,
                            background: "#f1f5f9",
                            color: "var(--text-heading)",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          {msg.status === "unread" ? "Mark Replied" : "Mark Unread"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          style={{
                            color: "#ef4444",
                            background: "transparent",
                            border: "none",
                            padding: 6,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                          title="Delete message"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                      <span className="status-pill" style={{ fontSize: 11, padding: "3px 10px", background: "#f8fafc" }}>
                        Opportunity: <strong>{msg.projectType || "General"}</strong>
                      </span>

                      {msg.email && msg.email !== "Captured via AI Agent" && (
                        <a
                          href={`mailto:${msg.email}?subject=Re: Your message on Kamesh's Portfolio`}
                          style={{
                            fontSize: 12,
                            color: "var(--accent-emerald-dark)",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#ecfdf5",
                            padding: "3px 10px",
                            borderRadius: 6,
                          }}
                        >
                          <Mail size={12} />
                          <span>{msg.email}</span>
                        </a>
                      )}

                      {msg.phone && (
                        <a
                          href={`tel:${msg.phone.replace(/\s+/g, "")}`}
                          style={{
                            fontSize: 12,
                            color: "#1e293b",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#f1f5f9",
                            padding: "3px 10px",
                            borderRadius: 6,
                          }}
                        >
                          <Phone size={12} />
                          <span>{msg.phone}</span>
                        </a>
                      )}
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 10,
                        padding: 14,
                        fontSize: 13,
                        color: "var(--text-main)",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.message}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      {msg.email && msg.email !== "Captured via AI Agent" && (
                        <a
                          href={`mailto:${msg.email}?subject=Re: Your message to Kamesh M R`}
                          className="btn-primary"
                          style={{ fontSize: 11.5, padding: "7px 14px" }}
                        >
                          <Mail size={13} />
                          <span>Reply via Email</span>
                        </a>
                      )}

                      {msg.phone && (
                        <a
                          href={`tel:${msg.phone.replace(/\s+/g, "")}`}
                          className="btn-secondary"
                          style={{ fontSize: 11.5, padding: "7px 14px" }}
                        >
                          <Phone size={13} />
                          <span>Call {msg.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Email Dispatch Configuration & Tips */}
            <div className="bento-card" style={{ marginTop: 28, padding: 24, background: "#ffffff" }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={16} color="var(--accent-amber)" />
                <span>Live Email Dispatch Setup (Direct to Gmail)</span>
              </h4>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
                All incoming messages are safely recorded in your portfolio database (<code style={{ fontFamily: "var(--font-mono)", color: "var(--accent-emerald-dark)" }}>data/messages.json</code>).
                To also have them sent immediately to your personal Gmail inbox (<strong>mrkamesh8@gmail.com</strong>), set your Gmail App Password in your project root <code style={{ fontFamily: "var(--font-mono)" }}>.env.local</code> file:
              </p>

              <div style={{ background: "#0f172a", color: "#34d399", padding: 14, borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7 }}>
                GMAIL_USER=mrkamesh8@gmail.com<br />
                GMAIL_APP_PASSWORD=your_16_digit_google_app_password<br />
                SMTP_HOST=smtp.gmail.com<br />
                SMTP_PORT=465
              </div>

              <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 10 }}>
                💡 Tip: Generate an App Password in Google Account → Security → 2-Step Verification → App Passwords.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: HERO COUNTERS & STATS
            ======================================================== */}
        {activeTab === "metrics" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                  Hero Stat Counters & Metrics ({data.metrics?.length || 0})
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
                  These key metrics appear prominently in the hero strip under your bio.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleAddMetric}
                style={{ fontSize: 13, padding: "9px 18px" }}
              >
                <Plus size={15} />
                <span>Add New Metric</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {data.metrics?.map((m: any, idx: number) => (
                <div key={idx} className="bento-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span className="status-pill" style={{ fontSize: 10 }}>
                      Badge #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMetric(idx)}
                      style={{ color: "#ef4444", padding: 4, display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer" }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 8, marginBottom: 10 }}>
                    <div className="form-group">
                      <label className="form-label">VALUE</label>
                      <input
                        type="text"
                        className="form-input"
                        value={m.value}
                        onChange={(e) => {
                          const updated = [...data.metrics];
                          updated[idx].value = e.target.value;
                          setData({ ...data, metrics: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">SUFFIX</label>
                      <input
                        type="text"
                        className="form-input"
                        value={m.suffix}
                        onChange={(e) => {
                          const updated = [...data.metrics];
                          updated[idx].suffix = e.target.value;
                          setData({ ...data, metrics: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">LABEL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={m.label}
                      onChange={(e) => {
                        const updated = [...data.metrics];
                        updated[idx].label = e.target.value;
                        setData({ ...data, metrics: updated });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">HOVER TOOLTIP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={m.tip}
                      onChange={(e) => {
                        const updated = [...data.metrics];
                        updated[idx].tip = e.target.value;
                        setData({ ...data, metrics: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: FEATURED PROJECTS & SCREENSHOT UPLOAD
            ======================================================== */}
        {activeTab === "projects" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                  Featured Main Projects ({data.mainProjects?.length || 0})
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
                  Edit projects, upload live screenshots, customize tags, and add new projects.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowAddProjectModal(true)}
                style={{ fontSize: 13, padding: "9px 18px" }}
              >
                <Plus size={15} />
                <span>Add New Project</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {data.mainProjects?.map((proj: any, idx: number) => (
                <div key={proj.id || idx} className="bento-card" style={{ padding: 26 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="status-pill" style={{ fontSize: 11, padding: "3px 8px" }}>
                        #{proj.number || idx + 1}
                      </span>
                      <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                        {proj.name}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(idx)}
                      style={{ color: "#ef4444", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      title="Delete Project"
                    >
                      <Trash2 size={15} />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Project Screenshot Uploader Box */}
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px dashed var(--border-subtle)",
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: 140,
                        height: 85,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "#e2e8f0",
                        border: "1px solid var(--border-subtle)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {proj.image ? (
                        <Image
                          src={proj.image}
                          alt={proj.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>
                          <ImageIcon size={22} style={{ margin: "0 auto 4px" }} />
                          <span>No Image</span>
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-heading)" }}>
                        Project Screenshot / Cover Image
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          type="file"
                          id={`proj-img-${idx}`}
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleProjectImageUpload(e, idx)}
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => document.getElementById(`proj-img-${idx}`)?.click()}
                          disabled={uploadingProjectIdx === idx}
                          style={{ fontSize: 12, padding: "6px 14px" }}
                        >
                          <Camera size={13} />
                          <span>{uploadingProjectIdx === idx ? "Uploading..." : proj.image ? "Change Image" : "Upload Screenshot"}</span>
                        </button>

                        {proj.image && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...data.mainProjects];
                              updated[idx].image = "";
                              setData({ ...data, mainProjects: updated });
                            }}
                            style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--text-dim)", whiteSpace: "nowrap" }}>URL:</span>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: 11, padding: "5px 10px", flex: 1 }}
                          placeholder="/uploads/... or https://..."
                          value={proj.image || ""}
                          onChange={(e) => {
                            const updated = [...data.mainProjects];
                            updated[idx].image = e.target.value;
                            setData({ ...data, mainProjects: updated });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div className="form-group">
                      <label className="form-label">PROJECT TITLE</label>
                      <input
                        type="text"
                        className="form-input"
                        value={proj.name}
                        onChange={(e) => {
                          const updated = [...data.mainProjects];
                          updated[idx].name = e.target.value;
                          setData({ ...data, mainProjects: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CATEGORY / TAGLINE</label>
                      <input
                        type="text"
                        className="form-input"
                        value={proj.category}
                        onChange={(e) => {
                          const updated = [...data.mainProjects];
                          updated[idx].category = e.target.value;
                          setData({ ...data, mainProjects: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">DESCRIPTION</label>
                    <textarea
                      rows={3}
                      className="form-input"
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...data.mainProjects];
                        updated[idx].description = e.target.value;
                        setData({ ...data, mainProjects: updated });
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div className="form-group">
                      <label className="form-label">LIVE PLATFORM / DEMO URL</label>
                      <input
                        type="text"
                        className="form-input"
                        value={proj.href}
                        onChange={(e) => {
                          const updated = [...data.mainProjects];
                          updated[idx].href = e.target.value;
                          setData({ ...data, mainProjects: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">GITHUB REPO URL</label>
                      <input
                        type="text"
                        className="form-input"
                        value={proj.github}
                        onChange={(e) => {
                          const updated = [...data.mainProjects];
                          updated[idx].github = e.target.value;
                          setData({ ...data, mainProjects: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">TECH TAGS (COMMA SEPARATED)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={Array.isArray(proj.tags) ? proj.tags.join(", ") : proj.tags}
                      onChange={(e) => {
                        const updated = [...data.mainProjects];
                        updated[idx].tags = e.target.value.split(",").map((s) => s.trim());
                        setData({ ...data, mainProjects: updated });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">KEY DELIVERABLES / HIGHLIGHTS (ONE PER LINE)</label>
                    <textarea
                      rows={3}
                      className="form-input"
                      value={Array.isArray(proj.highlights) ? proj.highlights.join("\n") : proj.highlights}
                      onChange={(e) => {
                        const updated = [...data.mainProjects];
                        updated[idx].highlights = e.target.value.split("\n").filter(Boolean);
                        setData({ ...data, mainProjects: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: WORK EXPERIENCE MANAGEMENT
            ======================================================== */}
        {activeTab === "experience" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                  Work Experience ({data.experience?.length || 0})
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
                  Manage company roles, timelines, project deliverables, and stack tags.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowAddExpModal(true)}
                style={{ fontSize: 13, padding: "9px 18px" }}
              >
                <Plus size={15} />
                <span>Add Experience</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.experience?.map((exp: any, idx: number) => (
                <div key={idx} className="bento-card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                        {exp.role} @ {exp.company}
                      </h4>
                      <span style={{ fontSize: 12, color: "var(--accent-emerald-dark)", fontWeight: 600 }}>
                        {exp.period} · {exp.location}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(idx)}
                      style={{ color: "#ef4444", padding: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      title="Delete Experience"
                    >
                      <Trash2 size={15} />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div className="form-group">
                      <label className="form-label">ROLE TITLE</label>
                      <input
                        type="text"
                        className="form-input"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[idx].role = e.target.value;
                          setData({ ...data, experience: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">COMPANY NAME</label>
                      <input
                        type="text"
                        className="form-input"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[idx].company = e.target.value;
                          setData({ ...data, experience: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div className="form-group">
                      <label className="form-label">PERIOD / TIMELINE</label>
                      <input
                        type="text"
                        className="form-input"
                        value={exp.period}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[idx].period = e.target.value;
                          setData({ ...data, experience: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">LOCATION</label>
                      <input
                        type="text"
                        className="form-input"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[idx].location = e.target.value;
                          setData({ ...data, experience: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">OVERVIEW DESCRIPTION</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...data.experience];
                        updated[idx].description = e.target.value;
                        setData({ ...data, experience: updated });
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">KEY BULLET POINTS (ONE PER LINE)</label>
                    <textarea
                      rows={4}
                      className="form-input"
                      value={Array.isArray(exp.bullets) ? exp.bullets.join("\n") : exp.bullets}
                      onChange={(e) => {
                        const updated = [...data.experience];
                        updated[idx].bullets = e.target.value.split("\n").filter(Boolean);
                        setData({ ...data, experience: updated });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">TECH TAGS (COMMA SEPARATED)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={Array.isArray(exp.tags) ? exp.tags.join(", ") : exp.tags}
                      onChange={(e) => {
                        const updated = [...data.experience];
                        updated[idx].tags = e.target.value.split(",").map((s) => s.trim());
                        setData({ ...data, experience: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: EDUCATION (HIGHER EDUCATION ONLY - HSC/SSLC OMITTED)
            ======================================================== */}
        {activeTab === "education" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                  Higher Education & Qualifications ({data.education?.length || 0})
                </h3>
                <p style={{ fontSize: 13, color: "var(--accent-emerald-dark)", fontWeight: 600, margin: "4px 0 0" }}>
                  ✓ School education (10th SSLC & 12th HSC) has been cleanly omitted. Only higher degrees are featured.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowAddEduModal(true)}
                style={{ fontSize: 13, padding: "9px 18px" }}
              >
                <Plus size={15} />
                <span>Add Degree</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.education?.map((edu: any, idx: number) => (
                <div key={idx} className="bento-card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                        {edu.degree}
                      </h4>
                      <span style={{ fontSize: 12, color: "var(--accent-emerald-dark)", fontWeight: 600 }}>
                        {edu.institution} · {edu.period}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(idx)}
                      style={{ color: "#ef4444", padding: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      title="Delete Education"
                    >
                      <Trash2 size={15} />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div className="form-group">
                      <label className="form-label">DEGREE TITLE</label>
                      <input
                        type="text"
                        className="form-input"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...data.education];
                          updated[idx].degree = e.target.value;
                          setData({ ...data, education: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">INSTITUTION NAME</label>
                      <input
                        type="text"
                        className="form-input"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...data.education];
                          updated[idx].institution = e.target.value;
                          setData({ ...data, education: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">PERIOD / YEARS</label>
                      <input
                        type="text"
                        className="form-input"
                        value={edu.period}
                        onChange={(e) => {
                          const updated = [...data.education];
                          updated[idx].period = e.target.value;
                          setData({ ...data, education: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">SPECIALIZATION / FOCUS</label>
                      <input
                        type="text"
                        className="form-input"
                        value={edu.focus}
                        onChange={(e) => {
                          const updated = [...data.education];
                          updated[idx].focus = e.target.value;
                          setData({ ...data, education: updated });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: SKILLS MATRIX MANAGEMENT
            ======================================================== */}
        {activeTab === "skills" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                  Technical Skills & Domains ({data.skillsData?.length || 0} Categories)
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
                  Manage skill tags, competencies, and hover tooltips across domains.
                </p>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const newCat = {
                    category: "New Skill Domain",
                    iconName: "Code2",
                    skills: [{ name: "New Tool", level: "Intermediate", tip: "Production skill" }],
                  };
                  setData({ ...data, skillsData: [...(data.skillsData || []), newCat] });
                  showToast("New category added! Edit name and skills below.");
                }}
                style={{ fontSize: 12, padding: "8px 16px" }}
              >
                <Plus size={14} />
                <span>Add Domain Category</span>
              </button>
            </div>

            <div className="admin-2col-grid">
              {data.skillsData?.map((cat: any, catIdx: number) => (
                <div key={catIdx} className="bento-card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div className="form-group" style={{ flex: 1, marginRight: 10 }}>
                      <label className="form-label">CATEGORY NAME</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cat.category}
                        onChange={(e) => {
                          const updated = [...data.skillsData];
                          updated[catIdx].category = e.target.value;
                          setData({ ...data, skillsData: updated });
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm("Delete this entire skill category?")) return;
                        const updated = [...data.skillsData];
                        updated.splice(catIdx, 1);
                        setData({ ...data, skillsData: updated });
                      }}
                      style={{ color: "#ef4444", padding: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label className="form-label">SKILLS IN THIS CATEGORY</label>
                    {cat.skills?.map((sk: any, skIdx: number) => (
                      <div key={skIdx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 28px", gap: 8, alignItems: "center" }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: 12, padding: "8px 10px" }}
                          value={sk.name}
                          placeholder="Skill name"
                          onChange={(e) => {
                            const updated = [...data.skillsData];
                            updated[catIdx].skills[skIdx].name = e.target.value;
                            setData({ ...data, skillsData: updated });
                          }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: 12, padding: "8px 10px" }}
                          value={sk.level}
                          placeholder="Level / Tag"
                          onChange={(e) => {
                            const updated = [...data.skillsData];
                            updated[catIdx].skills[skIdx].level = e.target.value;
                            setData({ ...data, skillsData: updated });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...data.skillsData];
                            updated[catIdx].skills.splice(skIdx, 1);
                            setData({ ...data, skillsData: updated });
                          }}
                          style={{ color: "#ef4444", padding: 4, cursor: "pointer" }}
                          title="Delete skill"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        const updated = [...data.skillsData];
                        updated[catIdx].skills.push({ name: "New Skill", level: "Production", tip: "Skill details" });
                        setData({ ...data, skillsData: updated });
                      }}
                      style={{ fontSize: 11, padding: "6px 12px", marginTop: 6 }}
                    >
                      <Plus size={13} />
                      <span>Add Skill to {cat.category}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: EXTRA DETAILS & CUSTOM HIGHLIGHTS MANAGER
            ======================================================== */}
        {activeTab === "extra" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                  Extra Details & Highlights Cards ({data.extraDetails?.length || 0})
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
                  Add custom sections, hackathons, awards, or specialized competencies. Any card added here appears dynamically on the live portfolio homepage!
                </p>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowAddExtraModal(true)}
                style={{ fontSize: 13, padding: "9px 18px" }}
              >
                <Plus size={15} />
                <span>Add Extra Detail Card</span>
              </button>
            </div>

            <div className="admin-2col-grid">
              {data.extraDetails?.map((item: any, idx: number) => (
                <div key={item.id || idx} className="bento-card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <span className="status-pill" style={{ fontSize: 10, padding: "2px 8px" }}>
                        {item.badge || item.category || "Card"}
                      </span>
                      <h4 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, color: "var(--text-heading)", margin: "6px 0 0" }}>
                        {item.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteExtraDetail(idx)}
                      style={{ color: "#ef4444", padding: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Card Image / Photo Uploader */}
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px dashed var(--border-subtle)",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: 90,
                        height: 60,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#e2e8f0",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      ) : (
                        <ImageIcon size={18} color="var(--text-dim)" />
                      )}
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <input
                        type="file"
                        id={`extra-img-${idx}`}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleExtraImageUpload(e, idx)}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => document.getElementById(`extra-img-${idx}`)?.click()}
                        disabled={uploadingExtraIdx === idx}
                        style={{ fontSize: 11, padding: "5px 12px", width: "fit-content" }}
                      >
                        <Camera size={12} />
                        <span>{uploadingExtraIdx === idx ? "Uploading..." : item.image ? "Change Image" : "Upload Card Image"}</span>
                      </button>

                      {item.image && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...data.extraDetails];
                            updated[idx].image = "";
                            setData({ ...data, extraDetails: updated });
                          }}
                          style={{ fontSize: 10.5, color: "#ef4444", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                        >
                          Remove image
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div className="form-group">
                      <label className="form-label">TITLE</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...data.extraDetails];
                          updated[idx].title = e.target.value;
                          setData({ ...data, extraDetails: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">BADGE / PILL</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.badge || ""}
                        onChange={(e) => {
                          const updated = [...data.extraDetails];
                          updated[idx].badge = e.target.value;
                          setData({ ...data, extraDetails: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label">DESCRIPTION</label>
                    <textarea
                      rows={3}
                      className="form-input"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...data.extraDetails];
                        updated[idx].description = e.target.value;
                        setData({ ...data, extraDetails: updated });
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">ACTION LINK (OPTIONAL)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="https://... or #"
                        value={item.link || ""}
                        onChange={(e) => {
                          const updated = [...data.extraDetails];
                          updated[idx].link = e.target.value;
                          setData({ ...data, extraDetails: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">LINK TEXT</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Learn More"
                        value={item.linkText || ""}
                        onChange={(e) => {
                          const updated = [...data.extraDetails];
                          updated[idx].linkText = e.target.value;
                          setData({ ...data, extraDetails: updated });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 8: RECOGNITIONS & SPOKEN LANGUAGES
            ======================================================== */}
        {activeTab === "recognitions" && (
          <div className="admin-2col-grid">
            <div className="bento-card" style={{ padding: 26 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, marginBottom: 14 }}>
                Certifications & Awards
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>
                Enter each certification or award on a new line:
              </p>
              <textarea
                rows={8}
                className="form-input"
                value={
                  Array.isArray(data.recognitions?.certifications)
                    ? data.recognitions.certifications.join("\n")
                    : ""
                }
                onChange={(e) => {
                  setData({
                    ...data,
                    recognitions: {
                      ...data.recognitions,
                      certifications: e.target.value.split("\n").filter(Boolean),
                    },
                  });
                }}
              />
            </div>

            <div className="bento-card" style={{ padding: 26 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, marginBottom: 14 }}>
                Spoken Languages
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.recognitions?.languages?.map((lang: any, i: number) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 28px", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      className="form-input"
                      value={lang.name}
                      onChange={(e) => {
                        const updated = [...data.recognitions.languages];
                        updated[i].name = e.target.value;
                        setData({
                          ...data,
                          recognitions: { ...data.recognitions, languages: updated },
                        });
                      }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={lang.level}
                      onChange={(e) => {
                        const updated = [...data.recognitions.languages];
                        updated[i].level = e.target.value;
                        setData({
                          ...data,
                          recognitions: { ...data.recognitions, languages: updated },
                        });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...data.recognitions.languages];
                        updated.splice(i, 1);
                        setData({
                          ...data,
                          recognitions: { ...data.recognitions, languages: updated },
                        });
                      }}
                      style={{ color: "#ef4444", padding: 4, cursor: "pointer" }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    const updated = [...(data.recognitions?.languages || [])];
                    updated.push({ name: "Language", level: "Conversational" });
                    setData({
                      ...data,
                      recognitions: { ...data.recognitions, languages: updated },
                    });
                  }}
                  style={{ fontSize: 11, padding: "6px 12px", marginTop: 8 }}
                >
                  <Plus size={13} />
                  <span>Add Language</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          ADD NEW PROJECT MODAL
          ======================================================== */}
      {showAddProjectModal && (
        <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 660 }}
          >
            <div className="modal-header">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>
                Add New Featured Project
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddProjectModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">PROJECT NAME *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AI Workflow Engine"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">CATEGORY</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. AI Automation · Next.js"
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">BADGE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Production Platform"
                    value={newProject.badge}
                    onChange={(e) => setNewProject({ ...newProject, badge: e.target.value })}
                  />
                </div>
              </div>

              {/* Upload Screenshot in New Project Modal */}
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px dashed var(--border-subtle)" }}>
                <label className="form-label">PROJECT SCREENSHOT / COVER IMAGE</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                  <input
                    type="file"
                    id="new-proj-file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleNewProjectImageUpload}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => document.getElementById("new-proj-file")?.click()}
                    disabled={uploadingNewProjectImg}
                    style={{ fontSize: 12, padding: "6px 14px" }}
                  >
                    <Camera size={13} />
                    <span>{uploadingNewProjectImg ? "Uploading..." : "Upload Screenshot"}</span>
                  </button>
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontSize: 11, padding: "6px 10px", flex: 1 }}
                    placeholder="Or enter image URL"
                    value={newProject.image}
                    onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION *</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Overview of the product, architecture, key problem solved..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">LIVE DEMO / PLATFORM URL</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://..."
                    value={newProject.href}
                    onChange={(e) => setNewProject({ ...newProject, href: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GITHUB REPO URL</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://github.com/..."
                    value={newProject.github}
                    onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">TECH STACK TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="React.js, Next.js, TypeScript, Prisma"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">KEY DELIVERABLES / BULLETS (ONE PER LINE)</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Built solo with end-to-end architecture&#10;Integrated AWS SNS for notifications"
                  value={newProject.highlights}
                  onChange={(e) => setNewProject({ ...newProject, highlights: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddProjectModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddProject}
                disabled={!newProject.name}
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD NEW EXTRA DETAIL MODAL
          ======================================================== */}
      {showAddExtraModal && (
        <div className="modal-overlay" onClick={() => setShowAddExtraModal(false)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 600 }}
          >
            <div className="modal-header">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>
                Add Extra Detail / Highlight Card
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddExtraModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">TITLE *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hackathon Champion / Open Source Contributor"
                  value={newExtra.title}
                  onChange={(e) => setNewExtra({ ...newExtra, title: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">CATEGORY</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Engineering Leadership"
                    value={newExtra.category}
                    onChange={(e) => setNewExtra({ ...newExtra, category: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">BADGE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1st Place / Verified"
                    value={newExtra.badge}
                    onChange={(e) => setNewExtra({ ...newExtra, badge: e.target.value })}
                  />
                </div>
              </div>

              {/* Upload Image for New Extra Detail */}
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px dashed var(--border-subtle)" }}>
                <label className="form-label">CARD IMAGE / CERTIFICATE PHOTO (OPTIONAL)</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                  <input
                    type="file"
                    id="new-extra-file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleNewExtraImageUpload}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => document.getElementById("new-extra-file")?.click()}
                    disabled={uploadingNewExtraImg}
                    style={{ fontSize: 12, padding: "6px 14px" }}
                  >
                    <Camera size={13} />
                    <span>{uploadingNewExtraImg ? "Uploading..." : "Upload Image"}</span>
                  </button>
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontSize: 11, padding: "6px 10px", flex: 1 }}
                    placeholder="Or enter image URL"
                    value={newExtra.image}
                    onChange={(e) => setNewExtra({ ...newExtra, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION *</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Detailed description of the achievement, skill, or role..."
                  value={newExtra.description}
                  onChange={(e) => setNewExtra({ ...newExtra, description: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">ACTION LINK (OPTIONAL)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://..."
                    value={newExtra.link}
                    onChange={(e) => setNewExtra({ ...newExtra, link: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LINK BUTTON TEXT</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. View Project"
                    value={newExtra.linkText}
                    onChange={(e) => setNewExtra({ ...newExtra, linkText: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddExtraModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddExtraDetail}
                disabled={!newExtra.title}
              >
                <Plus size={14} />
                <span>Add Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD NEW EXPERIENCE MODAL
          ======================================================== */}
      {showAddExpModal && (
        <div className="modal-overlay" onClick={() => setShowAddExpModal(false)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 600 }}
          >
            <div className="modal-header">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>
                Add Work Experience
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddExpModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">ROLE *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. AI Engineer"
                    value={newExp.role}
                    onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">COMPANY *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Tech Corp"
                    value={newExp.company}
                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">TIMELINE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2026 — Present"
                    value={newExp.period}
                    onChange={(e) => setNewExp({ ...newExp, period: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LOCATION</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chennai / Remote"
                    value={newExp.location}
                    onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION</label>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="High level overview of your responsibilities..."
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">KEY BULLET POINTS (ONE PER LINE)</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Architected database models&#10;Deployed to AWS production"
                  value={newExp.bullets}
                  onChange={(e) => setNewExp({ ...newExp, bullets: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">TECH TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="React.js, Next.js, Python"
                  value={newExp.tags}
                  onChange={(e) => setNewExp({ ...newExp, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddExpModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddExperience}
                disabled={!newExp.role || !newExp.company}
              >
                <Plus size={14} />
                <span>Add Experience</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD NEW EDUCATION MODAL
          ======================================================== */}
      {showAddEduModal && (
        <div className="modal-overlay" onClick={() => setShowAddEduModal(false)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 560 }}
          >
            <div className="modal-header">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>
                Add Higher Education Degree
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddEduModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">DEGREE TITLE *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Master of Computer Application (MCA)"
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">INSTITUTION NAME *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SRM Institute of Science and Technology"
                  value={newEdu.institution}
                  onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">PERIOD</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2024 — 2026"
                    value={newEdu.period}
                    onChange={(e) => setNewEdu({ ...newEdu, period: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SPECIALIZATION / FOCUS</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Artificial Intelligence"
                    value={newEdu.focus}
                    onChange={(e) => setNewEdu({ ...newEdu, focus: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddEduModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddEducation}
                disabled={!newEdu.degree || !newEdu.institution}
              >
                <Plus size={14} />
                <span>Add Degree</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "var(--accent-slate)",
            color: "#ffffff",
            padding: "14px 22px",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 13.5,
            fontWeight: 700,
            zIndex: 9999,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <Check size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
