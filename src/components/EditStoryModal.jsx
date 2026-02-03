import { useState, useRef } from "react";
import { 
  X, Pencil, Trash2, Save, Plus, Music, Clock, 
  Play, Pause, GripVertical, CheckCircle, Flame, Star 
} from "lucide-react";

export default function EditStoryModal({ story, onClose, onDeleteStory, onSaveStory, onAddEpisode, onUpdateEpisode, onDeleteEpisode, onReorderEpisodes }) {
  // Local UI State
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaData, setMetaData] = useState({ ...story });
  
  const [isAddingEp, setIsAddingEp] = useState(false);
  const [newEpData, setNewEpData] = useState({ title: "", duration: "", audioUrl: "" });
  
  const [editingEpIndex, setEditingEpIndex] = useState(null);
  const [editingEpData, setEditingEpData] = useState(null);

  const [playingAudio, setPlayingAudio] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // --- Handlers ---
  const handleDragSort = () => {
    const episodes = [...story.episodes];
    const draggedItem = episodes.splice(dragItem.current, 1)[0];
    episodes.splice(dragOverItem.current, 0, draggedItem);
    onReorderEpisodes(story.id, episodes);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* --- HEADER: METADATA --- */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900">
            <div className="flex gap-5 w-full">
                <img src={story.coverUrl} className="w-24 h-32 rounded-lg object-cover bg-slate-800 shadow-lg shrink-0" />
                <div className="flex-1 space-y-3">
                    {isEditingMeta ? (
                        <div className="space-y-3 w-full">
                            <div className="grid grid-cols-2 gap-3">
                                <input value={metaData.title} onChange={e => setMetaData({...metaData, title: e.target.value})} className="bg-slate-950 border border-slate-700 p-2 rounded text-white w-full" placeholder="Title" />
                                <input value={metaData.author} onChange={e => setMetaData({...metaData, author: e.target.value})} className="bg-slate-950 border border-slate-700 p-2 rounded text-white w-full" placeholder="Author" />
                            </div>
                            <textarea rows="2" value={metaData.description} onChange={e => setMetaData({...metaData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white text-sm" placeholder="Description"/>
                            <div className="flex gap-4 p-2 bg-slate-950 rounded border border-slate-800">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={metaData.isTrending} onChange={e => setMetaData({...metaData, isTrending: e.target.checked})} className="accent-orange-500"/> <span className="text-sm text-slate-300">Trending</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={metaData.isFeatured} onChange={e => setMetaData({...metaData, isFeatured: e.target.checked})} className="accent-indigo-500"/> <span className="text-sm text-slate-300">Featured</span></label>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <button onClick={() => { onSaveStory(story.id, metaData); setIsEditingMeta(false); }} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                                <button onClick={() => setIsEditingMeta(false)} className="px-3 py-1 text-slate-400">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {story.title}
                                    <button onClick={() => { setIsEditingMeta(true); setMetaData(story); }} className="text-slate-600 hover:text-indigo-400"><Pencil size={18} /></button>
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">{story.author} • {story.genre}</p>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2 max-w-2xl">{story.description}</p>
                            <div className="flex gap-2">
                                {story.isTrending && <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded flex items-center gap-1"><Flame size={12}/> TRENDING</span>}
                                {story.isFeatured && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded flex items-center gap-1"><Star size={12}/> FEATURED</span>}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onDeleteStory(story.id, story.title)} className="p-2 text-slate-400 hover:text-red-500 rounded"><Trash2 size={20} /></button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded"><X size={24} /></button>
            </div>
        </div>

        {/* --- BODY: EPISODES --- */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/30 flex flex-col gap-4">
            
            {/* Add Episode Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                {!isAddingEp ? (
                     <button onClick={() => setIsAddingEp(true)} className="w-full py-2 border-2 border-dashed border-slate-700 rounded text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 flex items-center justify-center gap-2 font-medium"><Plus size={20} /> Add New Episode</button>
                ) : (
                     <div className="space-y-3">
                        <div className="flex justify-between"><h4 className="text-white text-sm font-bold">New Episode</h4><button onClick={() => setIsAddingEp(false)}><X size={16} className="text-slate-500"/></button></div>
                        <div className="grid grid-cols-3 gap-2">
                            <input className="col-span-2 bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Title" value={newEpData.title} onChange={e => setNewEpData({...newEpData, title: e.target.value})} />
                            <input className="bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Duration" value={newEpData.duration} onChange={e => setNewEpData({...newEpData, duration: e.target.value})} />
                        </div>
                        <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Audio URL" value={newEpData.audioUrl} onChange={e => setNewEpData({...newEpData, audioUrl: e.target.value})} />
                        <button onClick={() => { onAddEpisode(story.id, newEpData); setIsAddingEp(false); setNewEpData({title:"", duration:"", audioUrl:""}); }} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm w-full">Add Episode</button>
                     </div>
                )}
            </div>

            {/* List */}
            <div className="space-y-2">
                {story.episodes?.map((ep, index) => (
                    <div key={index} draggable onDragStart={() => dragItem.current=index} onDragEnter={() => dragOverItem.current=index} onDragEnd={handleDragSort} onDragOver={e => e.preventDefault()} 
                        className="group flex items-center gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30">
                        
                        <div className="cursor-move text-slate-700 hover:text-slate-400"><GripVertical size={20} /></div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-sm">{ep.number}</div>
                        
                        <div className="flex-1">
                            {editingEpIndex === index ? (
                                <div className="flex gap-2">
                                    <input value={editingEpData.title} onChange={e => setEditingEpData({...editingEpData, title: e.target.value})} className="bg-slate-950 border border-slate-700 p-1 rounded text-white flex-1 text-sm" />
                                    <button onClick={() => { onUpdateEpisode(story.id, index, editingEpData); setEditingEpIndex(null); }} className="p-1 bg-green-600 rounded text-white"><Save size={16} /></button>
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-slate-200 text-sm font-medium">{ep.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={10} /> {ep.duration}</span>
                                        <button onClick={() => setPlayingAudio(playingAudio === ep.audioUrl ? null : ep.audioUrl)} className={`flex items-center gap-1 hover:underline ${playingAudio === ep.audioUrl ? "text-green-400" : "text-indigo-400"}`}>
                                            {playingAudio === ep.audioUrl ? <Pause size={10} /> : <Play size={10} />} {playingAudio === ep.audioUrl ? "Playing" : "Preview"}
                                        </button>
                                    </div>
                                    {playingAudio === ep.audioUrl && <audio src={ep.audioUrl} autoPlay controls className="h-6 w-64 mt-2 opacity-80" />}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingEpIndex(index); setEditingEpData(ep); }} className="p-2 text-slate-500 hover:text-indigo-400"><Pencil size={16} /></button>
                            <button onClick={() => onDeleteEpisode(story.id, index)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}