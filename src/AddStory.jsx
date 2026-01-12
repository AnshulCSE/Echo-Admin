import { useState } from "react";
import { db } from "./firebase"; 
import { collection, addDoc } from "firebase/firestore";
import { BookOpen, Sparkles } from "lucide-react";

export default function AddStory() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "Sci-Fi",
    color: "#6366f1", // Indigo
    coverUrl: "" 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // LOGIC: If URL is empty, generate a random one based on random number
      let finalCoverUrl = formData.coverUrl;
      if (!finalCoverUrl) {
          const randomSeed = Math.floor(Math.random() * 1000);
          finalCoverUrl = `https://picsum.photos/seed/${randomSeed}/500/500`;
      }

    await addDoc(collection(db, "stories"), {
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        color: formData.color,
        coverUrl: finalCoverUrl, // Uses the generated URL if input was empty
        episodes: [] 
      });

      setStatus({ type: "success", message: "Story published successfully!" });
      setFormData({ title: "", author: "", genre: "Sci-Fi", color: "#6366f1", coverUrl: "" });
      
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Create Story</h2>
          <p className="text-slate-400 mt-1">Start a new audio series</p>
        </div>
        <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
          <BookOpen className="text-indigo-400" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        {status.message && (
          <div className={`p-4 rounded-xl border flex items-center ${
            status.type === "error" ? "bg-red-900/20 border-red-800 text-red-400" : "bg-green-900/20 border-green-800 text-green-400"
          }`}>
            <Sparkles size={18} className="mr-2" /> {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="group">
                    <label className="block text-sm font-medium text-slate-400 mb-1 group-focus-within:text-indigo-400 transition-colors">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                        placeholder="e.g. The Midnight Library"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Author</label>
                    <input type="text" name="author" value={formData.author} onChange={handleChange} required 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Genre</label>
                        <select name="genre" value={formData.genre} onChange={handleChange} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                        >
                            <option>Sci-Fi</option><option>Horror</option><option>Mystery</option><option>Romance</option><option>Fantasy</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Theme</label>
                        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-2 h-[50px]">
                            <input type="color" name="color" value={formData.color} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"/>
                            <span className="text-xs text-slate-500 font-mono">{formData.color}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-400">Cover Image <span className="text-slate-600 text-xs">(Optional)</span></label>
                <div className="relative group">
                    <input type="url" name="coverUrl" value={formData.coverUrl} onChange={handleChange} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                        placeholder="https://..."
                    />
                    <div className="absolute left-3 top-3.5 text-slate-600 group-focus-within:text-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><linkpath d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></linkpath><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </div>
                </div>
                
                <div className="h-48 border border-dashed border-slate-800 rounded-xl flex items-center justify-center bg-slate-950/50 overflow-hidden relative">
                    {formData.coverUrl ? (
                         <img src={formData.coverUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                        <div className="text-center p-6">
                            <div className="mx-auto h-12 w-12 text-slate-700 mb-2 border border-slate-800 rounded-full flex items-center justify-center">📷</div>
                            <p className="text-sm text-slate-600">No image selected</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="pt-4">
            <button type="submit" disabled={loading} 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Creating..." : "Create Story"}
            </button>
        </div>
      </form>
    </div>
  );
}