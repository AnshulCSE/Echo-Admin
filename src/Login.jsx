import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirect to Dashboard on success
    } catch (err) {
      setError("Authorization Failed: Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 items-center justify-center p-4">
      
      {/* BRANDING HEADER (Crucial for Review) */}
      <div className="mb-8 text-center">
        <h2 className="text-slate-500 text-sm tracking-widest font-semibold uppercase">Internal System</h2>
        <h1 className="text-3xl font-bold text-white mt-1">ZingFM Operations Portal</h1>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 animate-in fade-in duration-500">
        
        {/* WARNING BANNER: Signals this is not a public login */}
        <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-3 mb-6 flex items-start gap-3">
            <ShieldAlert className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs text-amber-200/80 leading-relaxed">
                <strong>Restricted Access:</strong> This system is for authorized ZingFM administrators only. 
                Unauthorized access attempts are monitored and logged.
            </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Administrative Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                placeholder="admin@zingfm.com" // Specific placeholder
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Secure Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 text-sm uppercase tracking-wide"
          >
            {loading ? "Verifying Credentials..." : "Authenticate Access"}
          </button>
        </form>
      </div>

      {/* LEGAL FOOTER (Required for De-Risking) */}
      <div className="mt-8 text-center text-slate-600 text-xs">
        <p>© 2026 ZingFM Media. All Rights Reserved.</p>
        <p className="mt-1">Proprietary Content Management System v2.0</p>
      </div>
    </div>
  );
}