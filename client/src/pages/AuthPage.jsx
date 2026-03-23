import { useState } from "react";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onAuth({ email: form.email, name: form.name || form.email.split("@")[0] });
  }

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  const canSubmit = mode === "login"
    ? form.email && form.password
    : form.name && form.email && form.password;

  if (mode === "login") {
    return (
      <div className="min-h-screen bg-[#FFFCF7] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-md flex flex-col items-center">
          <h1 className="font-sans text-4xl tracking-widest mb-1 text-[#1D1D1D]">REMIND</h1>
          <p className="text-sm text-[#4A4A4A] mb-7 tracking-wide">Welcome Back!</p>

          <div className="w-full flex flex-col gap-0">
            <div className="flex flex-col gap-1 mb-3.5">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Email:</label>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={`px-3.5 py-3 border rounded-xl font-sans text-sm bg-[#F2EFE9] transition-colors ${errors.email ? "border-[#E08478]" : "border-[#E0E0E0]"} focus:outline-none focus:border-[#BBD4CE]`}
              />
              {errors.email && <span className="text-xs text-[#E08478] mt-0.5">{errors.email}</span>}
            </div>

            <div className="flex flex-col gap-1 mb-3.5">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Password:</label>
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={`px-3.5 py-3 border rounded-xl font-sans text-sm bg-[#F2EFE9] transition-colors ${errors.password ? "border-[#E08478]" : "border-[#E0E0E0]"} focus:outline-none focus:border-[#BBD4CE]`}
              />
              {errors.password && <span className="text-xs text-[#E08478] mt-0.5">{errors.password}</span>}
            </div>

            <p className="text-xs text-[#4A4A4A] mb-3 underline cursor-pointer hover:text-[#1D1D1D]"
              onClick={() => alert("Password reset coming soon")}>
              Forgot Password?
            </p>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`py-3.5 px-6 rounded-xl w-full text-sm tracking-widest uppercase font-sans flex items-center justify-center transition-all
                ${canSubmit ? "bg-[#BBD4CE] text-[#264E70] hover:opacity-85 hover:-translate-y-0.5 cursor-pointer" : "bg-[#BBD4CE] text-[#264E70] opacity-35 cursor-not-allowed"}`}
            >
              Sign In
            </button>

            <div className="mt-3.5 flex flex-col gap-1.5">
              <p className="text-xs text-[#4A4A4A]">
                Don't have an account?{" "}
                <span className="underline cursor-pointer text-[#1D1D1D] hover:text-[#BBD4CE]"
                  onClick={() => { setMode("signup"); setErrors({}); setForm({ name: "", email: "", password: "" }); }}>
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF7] flex items-center justify-center p-6">
      <div className="flex w-full max-w-3xl min-h-[580px] rounded-2xl overflow-hidden shadow-md">

        {/* Left gradient card */}
        <div className="w-96 flex-shrink-0 p-9 flex flex-col justify-between"
          style={{ background: "linear-gradient(160deg, #BBD4CE 0%, #C6D5E1 40%, #F9B4AB 100%)" }}>
          <h1 className="font-sans text-3xl text-[#264E70] tracking-widest">REMIND</h1>
          <p className="text-xl leading-relaxed text-[#1D1D1D] font-medium">
            Log your regrets,<br />
            Receive friendly nudges.<br />
            Get started today!
          </p>
        </div>

        {/* Right form */}
        <div className="flex-1 bg-white p-12 flex flex-col justify-center">
          <h2 className="font-sans text-3xl mb-6 text-[#1D1D1D]">Create an account</h2>

          <div className="w-full flex flex-col">
            {[
              { field: "name", label: "Name:", type: "text", placeholder: "Your Name" },
              { field: "email", label: "Email:", type: "email", placeholder: "Your Email" },
              { field: "password", label: "Password:", type: "password", placeholder: "Create a password" },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field} className="flex flex-col gap-1 mb-3.5">
                <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                  className={`px-3.5 py-3 border rounded-xl font-sans text-sm bg-[#F2EFE9] transition-colors ${errors[field] ? "border-[#E08478]" : "border-[#E0E0E0]"} focus:outline-none focus:border-[#BBD4CE]`}
                />
                {errors[field] && <span className="text-xs text-[#E08478] mt-0.5">{errors[field]}</span>}
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`py-3.5 px-6 rounded-xl w-full text-sm tracking-widest uppercase font-sans flex items-center justify-center transition-all mt-1
                ${canSubmit ? "bg-[#F9B4AB] text-[#7a2a2a] hover:opacity-85 hover:-translate-y-0.5 cursor-pointer" : "bg-[#F9B4AB] text-[#7a2a2a] opacity-35 cursor-not-allowed"}`}
            >
              Sign Up
            </button>

            <p className="text-xs text-[#4A4A4A] mt-3.5 text-center">
              Already have an account?{" "}
              <span className="underline cursor-pointer text-[#1D1D1D] hover:text-[#BBD4CE]"
                onClick={() => { setMode("login"); setErrors({}); setForm({ name: "", email: "", password: "" }); }}>
                Log In
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
