import React, { useState, useRef } from "react";
import {
  Truck,
  User,
  MapPin,
  Phone,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  Camera,
  Sparkles,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "0.8rem 1rem",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontFamily: "inherit",
  fontSize: "0.95rem",
  backgroundColor: "white",
  transition: "border-color 0.2s ease",
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.5rem",
  fontWeight: 600,
  fontSize: "0.9rem",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
};

// ─── AI Photo Detection Component ────────────────────────────────────────────
function AIPhotoDetector({ onDetected }) {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImageBase64(e.target.result.split(",")[1]);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const analyzeImage = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: imageBase64,
                  },
                },
                {
                  type: "text",
                  text: `Kamu adalah sistem deteksi e-waste. Analisa gambar ini dan kembalikan JSON SAJA (tanpa penjelasan, tanpa markdown, tanpa backtick) dengan format persis:
{
  "deviceTypes": ["<jenis perangkat dari list: Smartphone, Laptop, Tablet, TV / Monitor, Printer, Kabel / Aksesori, Lainnya>"],
  "kondisi": ["<kondisi dari list: Menyala normal, Mati total, Layar retak, Baterai bocor, Fisik rusak, Kondisi baik>"],
  "estimasiKondisi": "<deskripsi singkat kondisi dalam Bahasa Indonesia, max 1 kalimat>",
  "confidence": "<tinggi/sedang/rendah>"
}
Pilih deviceTypes dan kondisi yang relevan dari list yang disediakan. Jika bukan perangkat elektronik, tetap isi dengan Lainnya.`,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((c) => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError("Gagal menganalisa gambar. Coba lagi ya.");
    } finally {
      setAnalyzing(false);
    }
  };

  const applyResult = () => {
    if (result) onDetected(result);
  };

  const reset = () => {
    setImage(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
  };

  return (
    <div
      className="card"
      style={{
        background:
          "linear-gradient(135deg, rgba(46,211,113,0.06) 0%, rgba(46,211,113,0.02) 100%)",
        border: "2px dashed rgba(46,211,113,0.35)",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(46,211,113,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles size={18} color="var(--primary)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            Auto-Detect via Foto{" "}
            <span
              style={{
                background: "var(--primary)",
                color: "white",
                fontSize: "0.65rem",
                padding: "0.15rem 0.5rem",
                borderRadius: 999,
                fontWeight: 700,
                letterSpacing: 0.5,
                verticalAlign: "middle",
                marginLeft: 4,
              }}
            >
              AI
            </span>
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            Upload foto perangkat → AI tebak jenis & kondisi otomatis
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!image ? (
        <div
          onClick={() => fileRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: "2px dashed #ddd",
            borderRadius: 16,
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            background: "white",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.background = "rgba(46,211,113,0.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#ddd";
            e.currentTarget.style.background = "white";
          }}
        >
          <Camera
            size={32}
            color="var(--text-muted)"
            style={{ margin: "0 auto 0.75rem" }}
          />
          <div
            style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              marginBottom: "0.25rem",
            }}
          >
            Klik atau drag foto perangkat di sini
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            JPG, PNG, WEBP — maks. 10MB
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Preview */}
          <div style={{ position: "relative" }}>
            <img
              src={image}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                borderRadius: 12,
                display: "block",
              }}
            />
            <button
              onClick={reset}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "none",
              }}
            >
              <X size={14} color="white" />
            </button>
          </div>

          {/* Analyze Button */}
          {!result && !analyzing && (
            <button
              onClick={analyzeImage}
              className="pill-btn"
              style={{ width: "100%", gap: "0.5rem" }}
            >
              <Sparkles size={16} />
              Analisa dengan AI
            </button>
          )}

          {/* Loading */}
          {analyzing && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                padding: "0.75rem",
                background: "rgba(46,211,113,0.08)",
                borderRadius: 12,
                color: "var(--primary)",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              <Loader2
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Sedang menganalisa gambar...
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                background: "rgba(255,80,80,0.08)",
                borderRadius: 12,
                color: "#e53e3e",
                fontSize: "0.88rem",
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              style={{
                background: "white",
                border: "1.5px solid rgba(46,211,113,0.4)",
                borderRadius: 14,
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                animation: "fadeIn 0.4s ease",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <CheckCircle2 size={18} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  Hasil Deteksi AI
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.75rem",
                    color:
                      result.confidence === "tinggi"
                        ? "var(--primary)"
                        : result.confidence === "sedang"
                          ? "#f6ad55"
                          : "#fc8181",
                    fontWeight: 700,
                    background:
                      result.confidence === "tinggi"
                        ? "rgba(46,211,113,0.1)"
                        : result.confidence === "sedang"
                          ? "rgba(246,173,85,0.15)"
                          : "rgba(252,129,129,0.15)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: 999,
                  }}
                >
                  Kepercayaan {result.confidence}
                </span>
              </div>

              <div
                style={{
                  fontSize: "0.88rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)" }}>
                    Jenis perangkat:{" "}
                  </span>
                  <strong>{result.deviceTypes?.join(", ")}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Kondisi: </span>
                  <strong>{result.kondisi?.join(", ")}</strong>
                </div>
                <div
                  style={{ color: "var(--text-muted)", fontStyle: "italic" }}
                >
                  "{result.estimasiKondisi}"
                </div>
              </div>

              <button
                onClick={applyResult}
                className="pill-btn"
                style={{
                  width: "100%",
                  fontSize: "0.88rem",
                  padding: "0.65rem 1.5rem",
                }}
              >
                ✓ Terapkan ke Form
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Checklist Kondisi Component ─────────────────────────────────────────────
function KondisiChecklist({ value, onChange }) {
  const options = [
    { id: "menyala", label: "Menyala normal", icon: "✅" },
    { id: "mati", label: "Mati total", icon: "⚫" },
    { id: "layarRetak", label: "Layar retak", icon: "💔" },
    { id: "bateraiBocor", label: "Baterai bocor", icon: "⚠️" },
    { id: "fisikRusak", label: "Fisik rusak", icon: "🔨" },
    { id: "kondisiBaik", label: "Kondisi baik", icon: "👍" },
  ];

  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {options.map((opt) => (
        <div
          key={opt.id}
          onClick={() => toggle(opt.id)}
          style={{
            padding: "0.5rem 1rem",
            border: `2px solid ${value.includes(opt.id) ? "var(--primary)" : "#ddd"}`,
            borderRadius: 999,
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
            backgroundColor: value.includes(opt.id)
              ? "rgba(46,211,113,0.1)"
              : "white",
            color: value.includes(opt.id)
              ? "var(--primary)"
              : "var(--text-main)",
            transition: "var(--transition)",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <span>{opt.icon}</span>
          {opt.label}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function PickupSchedule() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    date: "",
    time: "",
    deviceTypes: [],
    deviceCount: "",
    kondisi: [],
    notes: "",
    priority: "reguler",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [aiApplied, setAiApplied] = useState(false);

  const deviceOptions = [
    "Smartphone",
    "Laptop",
    "Tablet",
    "TV / Monitor",
    "Printer",
    "Kabel / Aksesori",
    "Lainnya",
  ];

  const timeSlots = [
    "08:00 – 10:00",
    "10:00 – 12:00",
    "13:00 – 15:00",
    "15:00 – 17:00",
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDevice = (device) => {
    setForm((prev) => ({
      ...prev,
      deviceTypes: prev.deviceTypes.includes(device)
        ? prev.deviceTypes.filter((d) => d !== device)
        : [...prev.deviceTypes, device],
    }));
  };

  // Map AI kondisi labels to checklist IDs
  const kondisiLabelToId = {
    "Menyala normal": "menyala",
    "Mati total": "mati",
    "Layar retak": "layarRetak",
    "Baterai bocor": "bateraiBocor",
    "Fisik rusak": "fisikRusak",
    "Kondisi baik": "kondisiBaik",
  };

  const handleAIDetected = (result) => {
    // Auto-fill device types
    const validDevices = (result.deviceTypes || []).filter((d) =>
      deviceOptions.includes(d),
    );
    // Auto-fill kondisi
    const validKondisi = (result.kondisi || [])
      .map((k) => kondisiLabelToId[k])
      .filter(Boolean);
    // Auto-fill notes with estimasi
    const notes = result.estimasiKondisi
      ? `[AI] ${result.estimasiKondisi}${form.notes ? "\n" + form.notes : ""}`
      : form.notes;

    setForm((prev) => ({
      ...prev,
      deviceTypes: validDevices.length > 0 ? validDevices : prev.deviceTypes,
      kondisi: validKondisi.length > 0 ? validKondisi : prev.kondisi,
      notes,
    }));
    setAiApplied(true);
    // Scroll to device section
    setTimeout(() => {
      document
        .getElementById("device-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ["name", "phone", "address", "city", "date", "time"];
    const missing = required.filter((f) => !form[f]);
    if (missing.length > 0 || form.deviceTypes.length === 0) {
      alert(
        "Harap lengkapi semua field yang wajib diisi (termasuk pilih minimal 1 jenis perangkat).",
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/pickups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Gagal menjadwalkan penjemputan: " + (result.error || "Terjadi kesalahan."));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Gagal terhubung ke server. Pastikan backend menyala.");
    }
  };

  const handleReset = () => {
    setForm({
      name: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      date: "",
      time: "",
      deviceTypes: [],
      deviceCount: "",
      kondisi: [],
      notes: "",
      priority: "reguler",
    });
    setSubmitted(false);
    setAiApplied(false);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const getFocusStyle = (field) =>
    focusedField === field
      ? {
          ...inputStyle,
          borderColor: "var(--primary)",
          boxShadow: "0 0 0 3px rgba(46,211,113,0.15)",
        }
      : inputStyle;

  return (
    <div className="container" style={{ padding: "2rem 2rem 6rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span className="tag-badge">Logistics</span>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          Pickup Scheduling
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Tidak bisa ke drop point? Jadwalkan penjemputan e-waste ke rumahmu.
          Mitra eco-logistics kami siap menjemput langsung ke lokasimu.
        </p>
      </div>

      {submitted ? (
        /* ── Success State ── */
        <div
          className="card highlight"
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            textAlign: "center",
            padding: "3rem 2rem",
            animation: "fadeIn 0.5s ease",
          }}
        >
          <CheckCircle2
            size={56}
            color="var(--primary)"
            style={{ margin: "0 auto 1.5rem" }}
          />
          <h2 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
            Penjemputan Terjadwal!
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
            Terima kasih, <strong>{form.name}</strong>! Tim kami akan menjemput
            e-waste kamu pada:
          </p>
          <div
            style={{
              backgroundColor: "rgba(46,211,113,0.08)",
              borderRadius: 16,
              padding: "1.5rem",
              marginBottom: "2rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {[
                {
                  icon: (
                    <Calendar
                      size={18}
                      color="var(--primary)"
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                  ),
                  main: form.date
                    ? new Date(form.date + "T00:00:00").toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "-",
                  sub: form.time,
                },
                {
                  icon: (
                    <MapPin
                      size={18}
                      color="var(--primary)"
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                  ),
                  main: form.address,
                  sub:
                    form.city + (form.postalCode ? `, ${form.postalCode}` : ""),
                },
                {
                  icon: (
                    <Package
                      size={18}
                      color="var(--primary)"
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                  ),
                  main: form.deviceTypes.join(", "),
                  sub: form.deviceCount
                    ? `Estimasi ${form.deviceCount} perangkat`
                    : "",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                  }}
                >
                  {row.icon}
                  <div>
                    <div style={{ fontWeight: 700 }}>{row.main}</div>
                    {row.sub && (
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {row.sub}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.88rem",
              marginBottom: "2rem",
            }}
          >
            Konfirmasi akan dikirim via WhatsApp ke{" "}
            <strong>{form.phone}</strong>. Harap siapkan e-waste kamu sebelum
            kurir tiba.
          </p>
          <button
            className="pill-btn"
            style={{ width: "100%" }}
            onClick={handleReset}
          >
            Jadwalkan Pickup Lain
          </button>
        </div>
      ) : (
        /* ── Form ── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Left: Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* AI Photo Detector */}
            <AIPhotoDetector onDetected={handleAIDetected} />

            {aiApplied && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  background: "rgba(46,211,113,0.1)",
                  borderRadius: 12,
                  fontSize: "0.88rem",
                  color: "var(--primary)",
                  fontWeight: 600,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <Sparkles size={16} />
                AI berhasil mengisi form! Silakan cek & sesuaikan di bawah.
              </div>
            )}

            {/* Data Diri */}
            <div
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.25rem",
                }}
              >
                <User size={18} color="var(--primary)" /> Data Diri
              </h3>
              <div style={fieldStyle}>
                <label style={labelStyle}>Nama Lengkap *</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  style={getFocusStyle("name")}
                  required
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Nomor Telepon / WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  style={getFocusStyle("phone")}
                  required
                />
              </div>
            </div>

            {/* Alamat */}
            <div
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.25rem",
                }}
              >
                <MapPin size={18} color="var(--primary)" /> Alamat Penjemputan
              </h3>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Alamat Lengkap (Jalan, No. Rumah, RT/RW) *
                </label>
                <textarea
                  placeholder="Contoh: Jl. Raya Darmo No. 45, RT 03/RW 07"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  style={{
                    ...getFocusStyle("address"),
                    resize: "vertical",
                    lineHeight: "1.5",
                  }}
                  required
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div style={fieldStyle}>
                  <label style={labelStyle}>Kota / Kabupaten *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Surabaya"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    onFocus={() => setFocusedField("city")}
                    onBlur={() => setFocusedField(null)}
                    style={getFocusStyle("city")}
                    required
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Kode Pos</label>
                  <input
                    type="text"
                    placeholder="Contoh: 60241"
                    value={form.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    onFocus={() => setFocusedField("postalCode")}
                    onBlur={() => setFocusedField(null)}
                    style={getFocusStyle("postalCode")}
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            {/* Jadwal */}
            <div
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.25rem",
                }}
              >
                <Calendar size={18} color="var(--primary)" /> Jadwal Penjemputan
              </h3>
              <div style={fieldStyle}>
                <label style={labelStyle}>Tanggal *</label>
                <input
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  onFocus={() => setFocusedField("date")}
                  onBlur={() => setFocusedField(null)}
                  style={getFocusStyle("date")}
                  required
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Slot Waktu *</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.5rem",
                  }}
                >
                  {timeSlots.map((slot) => (
                    <div
                      key={slot}
                      onClick={() => handleChange("time", slot)}
                      style={{
                        padding: "0.75rem 1rem",
                        border: `2px solid ${form.time === slot ? "var(--primary)" : "#eee"}`,
                        borderRadius: 12,
                        cursor: "pointer",
                        textAlign: "center",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        backgroundColor:
                          form.time === slot
                            ? "rgba(46,211,113,0.07)"
                            : "white",
                        transition: "var(--transition)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <Clock
                        size={14}
                        color={
                          form.time === slot
                            ? "var(--primary)"
                            : "var(--text-muted)"
                        }
                      />
                      {slot}
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Prioritas Pickup</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  {[
                    {
                      id: "reguler",
                      label: "Reguler",
                      desc: "Gratis · 1–2 hari kerja",
                      icon: "🚚",
                    },
                    {
                      id: "prioritas",
                      label: "Prioritas",
                      desc: "Berbayar · Hari yang sama",
                      icon: "⚡",
                    },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleChange("priority", opt.id)}
                      style={{
                        padding: "1rem",
                        border: `2px solid ${form.priority === opt.id ? "var(--primary)" : "#eee"}`,
                        borderRadius: 12,
                        cursor: "pointer",
                        background:
                          form.priority === opt.id
                            ? "rgba(46,211,113,0.07)"
                            : "white",
                        transition: "var(--transition)",
                      }}
                    >
                      <div
                        style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}
                      >
                        {opt.icon}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        {opt.label}
                      </div>
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.78rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        {opt.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Perangkat */}
            <div
              id="device-section"
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.25rem",
                }}
              >
                <Package size={18} color="var(--primary)" /> Informasi Perangkat
                {aiApplied && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.72rem",
                      background: "rgba(46,211,113,0.15)",
                      color: "var(--primary)",
                      padding: "0.2rem 0.6rem",
                      borderRadius: 999,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <Sparkles size={11} /> Diisi AI
                  </span>
                )}
              </h3>

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Jenis Perangkat *{" "}
                  <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                    (pilih semua yang ada)
                  </span>
                </label>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {deviceOptions.map((device) => (
                    <div
                      key={device}
                      onClick={() => toggleDevice(device)}
                      style={{
                        padding: "0.5rem 1rem",
                        border: `2px solid ${form.deviceTypes.includes(device) ? "var(--primary)" : "#ddd"}`,
                        borderRadius: 999,
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        backgroundColor: form.deviceTypes.includes(device)
                          ? "rgba(46,211,113,0.1)"
                          : "white",
                        color: form.deviceTypes.includes(device)
                          ? "var(--primary)"
                          : "var(--text-main)",
                        transition: "var(--transition)",
                        userSelect: "none",
                      }}
                    >
                      {form.deviceTypes.includes(device) ? "✓ " : ""}
                      {device}
                    </div>
                  ))}
                </div>
              </div>

              {/* Kondisi Checklist */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Kondisi Perangkat{" "}
                  <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                    (pilih semua yang sesuai)
                  </span>
                </label>
                <KondisiChecklist
                  value={form.kondisi}
                  onChange={(val) => handleChange("kondisi", val)}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Estimasi Jumlah Perangkat</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.deviceCount}
                    onChange={(e) =>
                      handleChange("deviceCount", e.target.value)
                    }
                    style={{
                      ...inputStyle,
                      appearance: "none",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">Pilih jumlah</option>
                    <option value="1–3">1 – 3 perangkat</option>
                    <option value="4–7">4 – 7 perangkat</option>
                    <option value="8–15">8 – 15 perangkat</option>
                    <option value="15+">Lebih dari 15 perangkat</option>
                  </select>
                  <ChevronDown
                    size={16}
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "var(--text-muted)",
                    }}
                  />
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Catatan Tambahan</label>
                <textarea
                  placeholder="Contoh: Perangkat ada di lantai 2, ada anjing, dsb."
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  onFocus={() => setFocusedField("notes")}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  style={{
                    ...getFocusStyle("notes"),
                    resize: "vertical",
                    lineHeight: "1.5",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="pill-btn"
              style={{ width: "100%", fontSize: "1rem" }}
            >
              <Truck size={18} style={{ marginRight: "0.5rem" }} />
              Jadwalkan Penjemputan
            </button>
          </form>

          {/* Right: Info Panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              position: "sticky",
              top: "2rem",
            }}
          >
            <div className="card highlight" style={{ padding: "1.75rem" }}>
              <h3 style={{ marginBottom: "1.25rem" }}>Cara Kerja</h3>
              {[
                {
                  icon: <Camera size={18} color="var(--primary)" />,
                  title: "Upload Foto (Opsional)",
                  desc: "AI kami otomatis mendeteksi jenis & kondisi perangkatmu.",
                },
                {
                  icon: <Calendar size={18} color="var(--primary)" />,
                  title: "Isi Formulir",
                  desc: "Lengkapi data diri, alamat, dan jadwal penjemputan.",
                },
                {
                  icon: <CheckCircle2 size={18} color="var(--primary)" />,
                  title: "Konfirmasi WhatsApp",
                  desc: "Tim kami konfirmasi jadwal via WhatsApp dalam 1 jam.",
                },
                {
                  icon: <Truck size={18} color="var(--primary)" />,
                  title: "Kurir Datang",
                  desc: "Kurir eco-logistics kami menjemput di waktu yang disepakati.",
                },
                {
                  icon: <Package size={18} color="var(--primary)" />,
                  title: "E-Waste Terproses",
                  desc: "Perangkatmu diproses secara ramah lingkungan.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginBottom: i < 4 ? "1rem" : 0,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: "rgba(46,211,113,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {step.title}
                    </div>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "1.75rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Area Layanan</h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  marginBottom: "1rem",
                }}
              >
                Saat ini layanan pickup tersedia di:
              </p>
              {[
                "Surabaya & Sidoarjo",
                "Jakarta & Tangerang",
                "Bandung",
                "Semarang",
                "Yogyakarta",
              ].map((area) => (
                <div
                  key={area}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                    ✓
                  </span>{" "}
                  {area}
                </div>
              ))}
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.82rem",
                  marginTop: "1rem",
                }}
              >
                Area lain segera hadir. Hubungi kami untuk info lebih lanjut.
              </p>
            </div>

            <div
              className="card"
              style={{
                padding: "1.75rem",
                backgroundColor: "var(--bg-color-alt)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <Phone size={18} color="var(--primary)" />
                <h3>Butuh Bantuan?</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Hubungi tim kami:
              </p>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  marginTop: "0.4rem",
                }}
              >
                +62 812-3456-7890
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Senin–Sabtu, 08.00–17.00 WIB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PickupSchedule;
