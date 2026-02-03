import { useState } from "react";
import { BookOpen, X } from "lucide-react";

export default function CreateStoryModal({ isOpen, onClose, genres, onCreate }) {
  const [formData, setFormData] = useState({ title: "", author: "", description: "", genre: genres[0]?.name || "", coverUrl: "" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
           <h3 className="text-lg font-bold text-white flex gap-2"><BookOpen className="text-indigo-500"/> Create Series</h3>
           <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        
        <input className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        <input className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm" placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
        <textarea rows="3" className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm resize-none" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        
        <div className="grid grid-cols-2 gap-3">
            <select className="bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
            <input className="bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm" placeholder="Cover URL" value={formData.coverUrl} onChange={e => setFormData({...formData, coverUrl: e.target.value})} />
        </div>

        <button onClick={() => onCreate(formData)} className="w-full py-3 bg-indigo-600 text-white rounded font-medium text-sm hover:bg-indigo-500">Create Series</button>
      </div>
    </div>
  );
}