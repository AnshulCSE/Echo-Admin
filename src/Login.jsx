import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import { Radio, Lock, Mail, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

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
      // 1. Authenticate
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Authorization Check (RBAC)
      const q = query(collection(db, "admins"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Access Denied: You do not have admin privileges.");
      }

      // 3. Save Session Data
      const adminDoc = querySnapshot.docs[0].data();
      localStorage.setItem("adminRole", adminDoc.role);
      localStorage.setItem("adminName", adminDoc.name);

      // 4. Redirect
      if (adminDoc.role === "editor") {
        navigate("/content");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error(err);
      setError("Invalid credentials or authorized personnel only.");
      await auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      
      {/* LOGIN CARD */}
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-4">
            <Radio className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">ZingFM Admin</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Internal Access Only</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="admin@zingfm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Secure Login"}
          </button>
        </form>
      </div>

      {/* COMPLIANCE FOOTER - CRITICAL FOR GOOGLE */}
      <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} ZingFM Media. All rights reserved.
          </p>
          <div className="flex gap-4 justify-center text-xs text-slate-400">
              <a href="#" className="hover:text-indigo-400 hover:underline">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-indigo-400 hover:underline">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-indigo-400 hover:underline">Support</a>
          </div>
          <p className="text-[10px] text-slate-600 max-w-xs mx-auto mt-2">
            Authorized personnel only. Unauthorized access is prohibited and monitored.
          </p>
      </div>

    </div>
  );
}