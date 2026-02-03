import { useState, useEffect } from "react";
import { Save, Server, Smartphone, MessageCircle, Link as LinkIcon, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // CONFIG STATE
  const [config, setConfig] = useState({
    maintenanceMode: false,
    minVersion: "1.0.0",
    latestVersion: "1.0.0",
    supportEmail: "",
    privacyUrl: "",
    playStoreUrl: ""
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, "settings", "app_config");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setConfig(snap.data());
      } else {
        // Initialize default if doesn't exist
        await setDoc(docRef, config);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await setDoc(doc(db, "settings", "app_config"), config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading configuration...</div>;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <Server className="text-slate-400" /> App Configuration
            </h2>
            <p className="text-slate-400 mt-1 text-sm">Remote control for your mobile application</p>
        </div>
        
        {/* SAVE BUTTON */}
        <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
        >
            {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
            {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <CheckCircle size={20} /> Changes pushed to live app successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 1. APP STATUS & VERSIONING */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
            <h3 className="text-white font-bold flex items-center gap-2 border-b border-slate-800 pb-4">
                <Smartphone className="text-pink-500" size={20}/> App Status
            </h3>
            
            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <div>
                    <span className="text-white font-bold text-sm block">Maintenance Mode</span>
                    <span className="text-slate-500 text-xs">If on, users will see a "Down for Maintenance" screen.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={config.maintenanceMode} 
                        onChange={e => setConfig({...config, maintenanceMode: e.target.checked})}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
            </div>
            {config.maintenanceMode && (
                <div className="flex gap-2 items-center text-red-400 text-xs bg-red-500/10 p-2 rounded">
                    <AlertTriangle size={14} /> Warning: Your app is currently inaccessible to users.
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Min App Version</label>
                    <input 
                        type="text" 
                        value={config.minVersion} 
                        onChange={e => setConfig({...config, minVersion: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm outline-none focus:border-indigo-500"
                        placeholder="1.0.0"
                    />
                    <p className="text-[10px] text-slate-600 mt-1">Force update if user is below this.</p>
                </div>
                <div>
                    <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Latest Version</label>
                    <input 
                        type="text" 
                        value={config.latestVersion} 
                        onChange={e => setConfig({...config, latestVersion: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm outline-none focus:border-indigo-500"
                        placeholder="1.2.0"
                    />
                </div>
            </div>
        </div>

        {/* 2. SUPPORT & LINKS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
            <h3 className="text-white font-bold flex items-center gap-2 border-b border-slate-800 pb-4">
                <LinkIcon className="text-indigo-500" size={20}/> Dynamic Links
            </h3>
            
            <div>
                <label className="text-xs text-slate-500 font-bold uppercase block mb-1 flex items-center gap-2">
                    <MessageCircle size={12}/> Support Email / Contact
                </label>
                <input 
                    type="text" 
                    value={config.supportEmail} 
                    onChange={e => setConfig({...config, supportEmail: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm outline-none focus:border-indigo-500"
                    placeholder="support@zingfm.com"
                />
            </div>

            <div>
                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Privacy Policy URL</label>
                <input 
                    type="url" 
                    value={config.privacyUrl} 
                    onChange={e => setConfig({...config, privacyUrl: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm outline-none focus:border-indigo-500"
                    placeholder="https://..."
                />
            </div>

            <div>
                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Play Store Link</label>
                <input 
                    type="url" 
                    value={config.playStoreUrl} 
                    onChange={e => setConfig({...config, playStoreUrl: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm outline-none focus:border-indigo-500"
                    placeholder="https://play.google.com/..."
                />
            </div>
        </div>

      </div>
    </div>
  );
}