import { useState } from "react";
import { X, Save, Pencil, Trash2, Tags } from "lucide-react";

export default function GenreModal({ isOpen, onClose, genres, onAdd, onUpdate, onDelete }) {
  const [newGenre, setNewGenre] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-white font-bold flex gap-2"><Tags size={20} className="text-indigo-500"/> Genres</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-2">
          {genres.map(genre => (
            <div key={genre.id} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
              {editingId === genre.id ? (
                <div className="flex gap-2 w-full">
                  <input value={editingName} onChange={e => setEditingName(e.target.value)} className="flex-1 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-white text-xs" autoFocus />
                  <button onClick={() => { onUpdate(genre.id, editingName); setEditingId(null); }} className="p-1 bg-green-600 rounded text-white"><Save size={14}/></button>
                </div>
              ) : (
                <>
                  <span className="text-slate-300 text-sm">{genre.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(genre.id); setEditingName(genre.name); }} className="p-1 text-slate-500 hover:text-indigo-400"><Pencil size={14}/></button>
                    <button onClick={() => onDelete(genre.id)} className="p-1 text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onAdd(newGenre); setNewGenre(""); }} className="p-5 border-t border-slate-800 flex gap-2">
          <input className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white text-sm" placeholder="New Genre..." value={newGenre} onChange={e => setNewGenre(e.target.value)} />
          <button type="submit" disabled={!newGenre.trim()} className="bg-indigo-600 px-4 rounded text-white text-sm">Add</button>
        </form>
      </div>
    </div>
  );
}