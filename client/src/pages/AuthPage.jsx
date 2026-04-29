import { useState, useEffect } from "react";
import api from "../utils/api";

function getResetToken() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token") || null;
}

function AuthInput({ label, type, placeholder, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1 mb-3.5">
      <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`px-3.5 py-3 border rounded-xl font-sans text-sm bg-[#F2EFE9] transition-colors focus:outline-none focus:border-[#BBD4CE] ${error ? "border-[#E08478]" : "border-[#E0E0E0]"}`}
      />
      {error && <span className="text-xs text-[#E08478] mt-0.5">{error}</span>}
    </div>
  );
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  // Reset password state
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const token = getResetToken();
    if (token) {
      setResetToken(token);
      setMode("resetPassword");
    }
  }, []);

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setServerError("");
  }

  function validate() {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setServerError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const res = await api.post(endpoint, payload);
      const { token, name } = res.data;
      localStorage.setItem("token", token);
      onAuth({ email: form.email, name: name || form.email.split("@")[0] });
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError("Enter a valid email");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      setLinkSent(true);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  const resetValid =
    newPassword.length >= 8 &&
    (/[0-9]/.test(newPassword) || /[^a-zA-Z0-9]/.test(newPassword)) &&
    newPassword === confirmPassword;

  async function handleResetPassword() {
    if (!resetValid) return;
    setResetLoading(true);
    setResetError("");
    try {
      await api.post("/auth/reset-password", { token: resetToken, newPassword });
      setResetSuccess(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setResetError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setResetLoading(false);
    }
  }

  const canSubmit = !loading && (mode === "login"
    ? form.email && form.password
    : form.name && form.email && form.password);

  // ── Forgot Password ───────────────────────────────────────────────
  if (mode === "forgotPassword") {
    if (linkSent) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#FFFCF7" }}>
          <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-md flex flex-col items-center text-center">
            <h1 className="font-sans text-4xl tracking-widest mb-2" style={{ color: "#264E70" }}>REMIND</h1>
            <div className="flex items-center gap-1.5 mb-2">
              <span style={{ color: "#4C756B" }}>●</span>
              <p className="text-sm" style={{ color: "#4A4A4A" }}>Email sent</p>
            </div>
            <p className="text-sm mb-5" style={{ color: "#4A4A4A" }}>
              Check your inbox — the link expires in 15 minutes.
            </p>
            <div className="w-full px-4 py-3 rounded-xl text-sm mb-5" style={{ backgroundColor: "#F2EFE9", color: "#4A4A4A" }}>
              Sent to {forgotEmail}
            </div>
            <p className="text-xs mb-3" style={{ color: "#4A4A4A" }}>
              Didn't get an email? Check your spam, or
            </p>
            <button
              onClick={() => { setLinkSent(false); setForgotError(""); }}
              className="w-full py-3.5 px-6 rounded-xl text-sm tracking-widest uppercase font-sans transition-all border-none mb-4 hover:opacity-85 hover:-translate-y-0.5 cursor-pointer"
              style={{ backgroundColor: "#BBD4CE", color: "#264E70" }}
            >
              Resend Link
            </button>
            <p className="text-xs" style={{ color: "#4A4A4A" }}>
              Wrong Email?{" "}
              <span
                className="underline cursor-pointer"
                style={{ color: "#1D1D1D" }}
                onClick={() => { setLinkSent(false); setForgotEmail(""); setForgotError(""); }}
              >
                Try a different address
              </span>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#FFFCF7" }}>
        <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-md flex flex-col items-center">
          <h1 className="font-sans text-4xl tracking-widest mb-1" style={{ color: "#264E70" }}>REMIND</h1>
          <p className="text-sm mb-7 tracking-wide" style={{ color: "#4A4A4A" }}>We'll send a reset link to your email.</p>
          {forgotError && (
            <div className="w-full mb-4 px-3 py-2 rounded-xl text-sm" style={{ backgroundColor: "#FAD7D3", color: "#7a2a2a" }}>
              {forgotError}
            </div>
          )}
          <div className="w-full flex flex-col gap-1 mb-4">
            <label className="font-mono text-xs tracking-widest uppercase" style={{ color: "#4A4A4A" }}>Email:</label>
            <input
              type="email"
              placeholder="Email"
              value={forgotEmail}
              onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
              className="px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] focus:outline-none focus:border-[#BBD4CE]"
            />
          </div>
          <button
            onClick={handleForgotPassword}
            disabled={forgotLoading || !forgotEmail.trim()}
            className={`w-full py-3.5 px-6 rounded-xl text-sm tracking-widest uppercase font-sans transition-all border-none mb-4 ${forgotEmail.trim() && !forgotLoading ? "hover:opacity-85 hover:-translate-y-0.5 cursor-pointer" : "opacity-35 cursor-not-allowed"}`}
            style={{ backgroundColor: "#BBD4CE", color: "#264E70" }}
          >
            {forgotLoading ? "Sending..." : "Send Reset Link"}
          </button>
          <p className="text-xs" style={{ color: "#4A4A4A" }}>
            Remembered your password?{" "}
            <span
              className="underline cursor-pointer"
              style={{ color: "#1D1D1D" }}
              onClick={() => { setMode("login"); setForgotError(""); setForgotEmail(""); }}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ── Reset Password ────────────────────────────────────────────────
  if (mode === "resetPassword") {
    if (resetSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#FFFCF7" }}>
          <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-md flex flex-col items-center text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#9CBBB3" }}
            >
              <span style={{ color: "#4C756B", fontSize: "1.25rem" }}>✓</span>
            </div>
            <h1 className="font-sans text-4xl tracking-widest mb-2" style={{ color: "#264E70" }}>REMIND</h1>
            <p className="text-sm mb-5" style={{ color: "#4A4A4A" }}>Password updated successfully.</p>
            <div
              className="w-full px-4 py-3 rounded-xl text-xs mb-5"
              style={{ backgroundColor: "#F2EFE9", color: "#4A4A4A" }}
            >
              For your security, all other active sessions have been signed out.
            </div>
            <button
              onClick={() => { setMode("login"); setResetToken(null); setResetSuccess(false); }}
              className="w-full py-3.5 px-6 rounded-xl text-sm tracking-widest uppercase font-sans transition-all border-none hover:opacity-85 hover:-translate-y-0.5 cursor-pointer"
              style={{ backgroundColor: "#BBD4CE", color: "#264E70" }}
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#FFFCF7" }}>
        <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-md flex flex-col items-center">
          <h1 className="font-sans text-4xl tracking-widest mb-1" style={{ color: "#264E70" }}>REMIND</h1>
          <p className="text-sm mb-7 tracking-wide" style={{ color: "#4A4A4A" }}>Choose a new password.</p>
          {resetError && (
            <div className="w-full mb-4 px-3 py-2 rounded-xl text-sm" style={{ backgroundColor: "#FAD7D3", color: "#7a2a2a" }}>
              {resetError}
            </div>
          )}
          <div className="w-full">
            <div className="flex flex-col gap-1 mb-4">
              <label className="font-mono text-xs tracking-widest uppercase" style={{ color: "#4A4A4A" }}>New Password:</label>
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setResetError(""); }}
                className="px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] focus:outline-none focus:border-[#BBD4CE]"
              />
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <label className="font-mono text-xs tracking-widest uppercase" style={{ color: "#4A4A4A" }}>Confirm Password:</label>
              <input
                type="password"
                placeholder="Password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setResetError(""); }}
                className="px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] focus:outline-none focus:border-[#BBD4CE]"
              />
            </div>
            <ul className="mb-5 flex flex-col gap-0.5">
              {["At least 8 characters", "One number or symbol", "Both fields must match"].map((rule) => (
                <li key={rule} className="text-xs" style={{ color: "#4A4A4A" }}>• {rule}</li>
              ))}
            </ul>
            <button
              onClick={handleResetPassword}
              disabled={!resetValid || resetLoading}
              className={`w-full py-3.5 px-6 rounded-xl text-sm tracking-widest uppercase font-sans transition-all border-none ${resetValid && !resetLoading ? "hover:opacity-85 hover:-translate-y-0.5 cursor-pointer" : "opacity-35 cursor-not-allowed"}`}
              style={{ backgroundColor: "#BBD4CE", color: "#264E70" }}
            >
              {resetLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Login ─────────────────────────────────────────────────────────
  if (mode === "login") {
    return (
      <div className="min-h-screen bg-[#FFFCF7] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-md flex flex-col items-center">
          <h1 className="font-sans text-4xl tracking-widest mb-1 text-[#1D1D1D]">REMIND</h1>
          <p className="text-sm text-[#4A4A4A] mb-7 tracking-wide">Welcome Back!</p>
          {serverError && (
            <div className="w-full mb-4 px-3 py-2 bg-[#FAD7D3] text-[#7a2a2a] text-sm rounded-xl">{serverError}</div>
          )}
          <div className="w-full flex flex-col gap-0">
            <AuthInput label="Email:" type="email" placeholder="Email" value={form.email}
              onChange={(e) => set("email", e.target.value)} error={errors.email} />
            <AuthInput label="Password:" type="password" placeholder="Password" value={form.password}
              onChange={(e) => set("password", e.target.value)} error={errors.password} />
            <p
              className="text-xs text-[#4A4A4A] mb-3 underline cursor-pointer hover:text-[#1D1D1D]"
              onClick={() => { setMode("forgotPassword"); setServerError(""); }}
            >
              Forgot Password?
            </p>
            <button onClick={handleSubmit} disabled={!canSubmit}
              className={`py-3.5 px-6 rounded-xl w-full text-sm tracking-widest uppercase font-sans flex items-center justify-center transition-all ${canSubmit ? "bg-[#BBD4CE] text-[#264E70] hover:opacity-85 hover:-translate-y-0.5 cursor-pointer" : "bg-[#BBD4CE] text-[#264E70] opacity-35 cursor-not-allowed"}`}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <div className="mt-3.5">
              <p className="text-xs text-[#4A4A4A]">Don't have an account?{" "}
                <span className="underline cursor-pointer text-[#1D1D1D] hover:text-[#BBD4CE]"
                  onClick={() => { setMode("signup"); setErrors({}); setServerError(""); setForm({ name: "", email: "", password: "" }); }}>
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Signup ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFFCF7] flex items-center justify-center p-6">
      <div className="flex w-full max-w-3xl min-h-[580px] rounded-2xl overflow-hidden shadow-md">
        <div className="w-96 flex-shrink-0 p-9 flex flex-col justify-between"
          style={{ background: "linear-gradient(160deg, #BBD4CE 0%, #C6D5E1 40%, #F9B4AB 100%)" }}>
          <h1 className="font-sans text-3xl text-[#264E70] tracking-widest">REMIND</h1>
          <p className="text-xl leading-relaxed text-[#1D1D1D] font-medium">
            Log your regrets,<br />Receive friendly nudges.<br />Get started today!
          </p>
        </div>
        <div className="flex-1 bg-white p-12 flex flex-col justify-center">
          <h2 className="font-sans text-3xl mb-6 text-[#1D1D1D]">Create an account</h2>
          {serverError && (
            <div className="mb-4 px-3 py-2 bg-[#FAD7D3] text-[#7a2a2a] text-sm rounded-xl">{serverError}</div>
          )}
          <div className="w-full flex flex-col">
            {[
              { field: "name", label: "Name:", type: "text", placeholder: "Your Name" },
              { field: "email", label: "Email:", type: "email", placeholder: "Your Email" },
              { field: "password", label: "Password:", type: "password", placeholder: "Create a password" },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field} className="flex flex-col gap-1 mb-3.5">
                <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">{label}</label>
                <input type={type} placeholder={placeholder} value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                  className={`px-3.5 py-3 border rounded-xl font-sans text-sm bg-[#F2EFE9] transition-colors ${errors[field] ? "border-[#E08478]" : "border-[#E0E0E0]"} focus:outline-none focus:border-[#BBD4CE]`} />
                {errors[field] && <span className="text-xs text-[#E08478] mt-0.5">{errors[field]}</span>}
              </div>
            ))}
            <button onClick={handleSubmit} disabled={!canSubmit}
              className={`py-3.5 px-6 rounded-xl w-full text-sm tracking-widest uppercase font-sans flex items-center justify-center transition-all mt-1 ${canSubmit ? "bg-[#F9B4AB] text-[#7a2a2a] hover:opacity-85 hover:-translate-y-0.5 cursor-pointer" : "bg-[#F9B4AB] text-[#7a2a2a] opacity-35 cursor-not-allowed"}`}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
            <p className="text-xs text-[#4A4A4A] mt-3.5 text-center">Already have an account?{" "}
              <span className="underline cursor-pointer text-[#1D1D1D] hover:text-[#BBD4CE]"
                onClick={() => { setMode("login"); setErrors({}); setServerError(""); setForm({ name: "", email: "", password: "" }); }}>
                Log In
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
