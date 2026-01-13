import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Trash2, ChevronDown, ChevronUp, AlertTriangle, RefreshCw, Search, Pencil, Save, ArrowUp, ArrowDown, Play, Pause, GripVertical } from "lucide-react";

export default function ManageStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStory, setExpandedStory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Edit States
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editingEpisode, setEditingEpisode] = useState(null); 

  // Audio Preview State
  const [playingAudio, setPlayingAudio] = useState(null);

  // Drag & Drop State
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "stories"));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(list);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // --- HELPER: Fix Numbers 1, 2, 3... ---
  const recalculateNumbers = (episodes) => {
    return episodes.map((ep, index) => ({
        ...ep,
        number: index + 1 // Always force number to match position
    }));
  };

  // --- STORY ACTIONS ---

  const handleEditStoryClick = (story) => {
    setEditingStoryId(story.id);
    setEditFormData({ ...story });
  };

  const handleSaveStory = async () => {
    try {
      const storyRef = doc(db, "stories", editingStoryId);
      await updateDoc(storyRef, {
        title: editFormData.title,
        author: editFormData.author,
        genre: editFormData.genre,
        coverUrl: editFormData.coverUrl
      });
      
      setStories(stories.map(s => s.id === editingStoryId ? { ...s, ...editFormData } : s));
      setEditingStoryId(null);
    } catch (error) {
      alert("Error updating story: " + error.message);
    }
  };

  const handleDeleteStory = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "stories", id));
      setStories(stories.filter(s => s.id !== id));
    } catch (error) {
      alert("Error deleting: " + error.message);
    }
  };

  // --- EPISODE ACTIONS (DRAG & DROP + BUTTONS) ---

  const saveReorderedEpisodes = async (storyId, newEpisodes) => {
    try {
        // 1. Recalculate numbers before saving
        const cleanEpisodes = recalculateNumbers(newEpisodes);

        // 2. Update Firebase
        await updateDoc(doc(db, "stories", storyId), { episodes: cleanEpisodes });

        // 3. Update UI
        const storyIndex = stories.findIndex(s => s.id === storyId);
        const newStories = [...stories];
        newStories[storyIndex].episodes = cleanEpisodes;
        setStories(newStories);

    } catch (error) {
        alert("Save failed: " + error.message);
        fetchStories(); // Revert on error
    }
  };

  // Button Move
  const handleMoveEpisode = (storyId, index, direction) => {
    const storyIndex = stories.findIndex(s => s.id === storyId);
    const episodes = [...(stories[storyIndex].episodes || [])];

    if (index + direction < 0 || index + direction >= episodes.length) return;

    // Swap
    [episodes[index], episodes[index + direction]] = [episodes[index + direction], episodes[index]];

    saveReorderedEpisodes(storyId, episodes);
  };

  // Drag Start
  const handleDragStart = (e, position) => {
    dragItem.current = position;
  };

  // Drag Enter (Tracking where we are hovering)
  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  // Drop (Finalize Move)
  const handleDrop = (storyId) => {
    const storyIndex = stories.findIndex(s => s.id === storyId);
    const episodes = [...(stories[storyIndex].episodes || [])];

    const dragIndex = dragItem.current;
    const dropIndex = dragOverItem.current;

    if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) return;

    // Remove item from old spot
    const draggedEpisode = episodes[dragIndex];
    episodes.splice(dragIndex, 1);

    // Insert into new spot
    episodes.splice(dropIndex, 0, draggedEpisode);

    // Save
    saveReorderedEpisodes(storyId, episodes);
    
    // Reset refs
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSaveEpisode = async () => {
    const { storyId, index, data } = editingEpisode;
    try {
      const storyIndex = stories.findIndex(s => s.id === storyId);
      const episodes = [...stories[storyIndex].episodes];
      
      episodes[index] = { ...episodes[index], ...data, number: parseInt(data.number) };

      await updateDoc(doc(db, "stories", storyId), { episodes });

      const newStories = [...stories];
      newStories[storyIndex].episodes = episodes;
      setStories(newStories);
      setEditingEpisode(null);
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  const handleDeleteEpisode = async (storyId, index) => {
    if (!window.confirm("Delete this episode?")) return;
    try {
      const storyIndex = stories.findIndex(s => s.id === storyId);
      const episodes = [...stories[storyIndex].episodes];
      episodes.splice(index, 1);
      
      // Also recalculate numbers after deletion!
      const cleanEpisodes = recalculateNumbers(episodes);

      await updateDoc(doc(db, "stories", storyId), { episodes: cleanEpisodes });

      const newStories = [...stories];
      newStories[storyIndex].episodes = cleanEpisodes;
      setStories(newStories);
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
  };

  const filteredStories = stories.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center text-slate-400">Loading content...</div>;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Manage Content</h2>
          <p className="text-slate-400 mt-1">Drag to reorder, click to edit</p>
        </div>
        <button onClick={fetchStories} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400">
            <RefreshCw size={20} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
        <input 
            type="text" 
            placeholder="Search stories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="grid gap-6">
        {filteredStories.map((story) => (
          <div key={story.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-slate-700">
            
            {/* STORY HEADER */}
            <div className="p-4 bg-slate-900/50">
                {editingStoryId === story.id ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} className="bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                            <input value={editFormData.author} onChange={e => setEditFormData({...editFormData, author: e.target.value})} className="bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                        </div>
                        <input value={editFormData.coverUrl} onChange={e => setEditFormData({...editFormData, coverUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white text-sm" />
                        <div className="flex space-x-2 justify-end">
                            <button onClick={() => setEditingStoryId(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={handleSaveStory} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 flex items-center"><Save size={16} className="mr-2"/> Save</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img src={story.coverUrl} className="w-12 h-12 rounded-lg object-cover bg-slate-800" onError={(e) => e.target.style.display = 'none'} />
                            <div>
                                <h3 className="font-bold text-white text-lg">{story.title}</h3>
                                <p className="text-xs text-slate-400">{story.episodes?.length || 0} Episodes • {story.author}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button onClick={() => handleEditStoryClick(story)} className="p-2 text-slate-400 hover:text-indigo-400" title="Edit Story"><Pencil size={18} /></button>
                            <button onClick={() => handleDeleteStory(story.id, story.title)} className="p-2 text-slate-400 hover:text-red-400" title="Delete Story"><Trash2 size={18} /></button>
                            <button onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
                                {expandedStory === story.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* EPISODES LIST (DRAGGABLE) */}
            {expandedStory === story.id && (
                <div className="bg-slate-950/50 border-t border-slate-800 p-4 space-y-2">
                    {(!story.episodes || story.episodes.length === 0) ? (
                        <div className="text-center text-slate-500 py-4 text-sm flex items-center justify-center"><AlertTriangle size={16} className="mr-2" /> No episodes</div>
                    ) : (
                        story.episodes.map((ep, index) => (
                            <div 
                                key={index} 
                                // DRAG ATTRIBUTES
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={() => handleDrop(story.id)}
                                onDragOver={(e) => e.preventDefault()} // Necessary for drop to work
                                className="flex flex-col p-3 rounded-lg bg-slate-900 border border-slate-800/50 hover:border-slate-600 cursor-move active:bg-slate-800 transition-colors"
                            >
                                
                                {editingEpisode?.storyId === story.id && editingEpisode?.index === index ? (
                                    // EDIT MODE EPISODE
                                    <div className="space-y-3 cursor-default">
                                        <div className="grid grid-cols-4 gap-2">
                                            <input type="number" disabled value={editingEpisode.data.number} className="col-span-1 bg-slate-900 border border-slate-700 p-2 rounded text-slate-500 cursor-not-allowed" />
                                            <input type="text" value={editingEpisode.data.title} onChange={e => setEditingEpisode({...editingEpisode, data: {...editingEpisode.data, title: e.target.value}})} className="col-span-3 bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                                        </div>
                                        <input type="text" value={editingEpisode.data.audioUrl} onChange={e => setEditingEpisode({...editingEpisode, data: {...editingEpisode.data, audioUrl: e.target.value}})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white text-xs font-mono" />
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => setEditingEpisode(null)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                                            <button onClick={handleSaveEpisode} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500">Save Changes</button>
                                        </div>
                                    </div>
                                ) : (
                                    // VIEW MODE EPISODE
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            
                                            {/* Drag Handle Icon */}
                                            <GripVertical size={16} className="text-slate-600" />

                                            {/* Buttons for precise movement */}
                                            <div className="flex flex-col space-y-0.5 mr-2">
                                                <button onClick={() => handleMoveEpisode(story.id, index, -1)} disabled={index === 0} className="text-slate-600 hover:text-indigo-400 disabled:opacity-20"><ArrowUp size={10} /></button>
                                                <button onClick={() => handleMoveEpisode(story.id, index, 1)} disabled={index === story.episodes.length - 1} className="text-slate-600 hover:text-indigo-400 disabled:opacity-20"><ArrowDown size={10} /></button>
                                            </div>

                                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 text-xs font-mono shrink-0">
                                                {ep.number} 
                                            </div>
                                            
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-slate-300 text-sm font-medium truncate">{ep.title}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-slate-600">{ep.duration}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setPlayingAudio(playingAudio === ep.audioUrl ? null : ep.audioUrl); }}
                                                        className={`text-xs flex items-center space-x-1 ${playingAudio === ep.audioUrl ? "text-green-400" : "text-slate-500 hover:text-green-400"}`}
                                                    >
                                                        {playingAudio === ep.audioUrl ? <Pause size={10} /> : <Play size={10} />}
                                                        <span>Preview</span>
                                                    </button>
                                                </div>
                                                {playingAudio === ep.audioUrl && (
                                                    <audio src={ep.audioUrl} autoPlay controls className="h-6 w-48 mt-1 opacity-80" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1 pl-2">
                                            <button onClick={() => setEditingEpisode({ storyId: story.id, index, data: { ...ep } })} className="p-1 text-slate-600 hover:text-indigo-400"><Pencil size={16} /></button>
                                            <button onClick={() => handleDeleteEpisode(story.id, index)} className="p-1 text-slate-600 hover:text-red-400"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}