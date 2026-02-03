import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
// 1. Added 'Flame' to imports
import { RefreshCw, Search, Tags, Plus, Star, Flame } from "lucide-react"; 

// Imports
import StoryCard from "./components/StoryCard";
import CreateStoryModal from "./components/CreateStoryModal";
import EditStoryModal from "./components/EditStoryModal";
import GenreModal from "./components/GenreModal";
import SectionManagerModal from "./components/SectionManagerModal"; 

export default function ManageStories() {
  const [stories, setStories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // UI States
  const [selectedStory, setSelectedStory] = useState(null); 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false); 
  
  // This state controls BOTH Featured and Trending modals
  const [activeManager, setActiveManager] = useState(null); // 'featured' | 'trending' | null

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const storyQ = query(collection(db, "stories"), orderBy("createdAt", "desc"));
      const storySnap = await getDocs(storyQ);
      setStories(storySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const genreQ = query(collection(db, "genres"), orderBy("name"));
       const genreSnap = await getDocs(genreQ);
      setGenres(genreSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIC HANDLERS ---
  const handleAddGenre = async (name) => {
    const ref = await addDoc(collection(db, "genres"), { name });
    setGenres([...genres, { id: ref.id, name }]);
  };
  const handleDeleteGenre = async (id) => {
    await deleteDoc(doc(db, "genres", id));
    setGenres(genres.filter(g => g.id !== id));
  };
  const handleUpdateGenre = async (id, name) => {
    await updateDoc(doc(db, "genres", id), { name });
    setGenres(genres.map(g => g.id === id ? { ...g, name } : g));
  };

  const handleCreateStory = async (data) => {
    const newStory = {
      ...data,
      coverUrl: data.coverUrl || `https://picsum.photos/seed/${Math.floor(Math.random()*1000)}/500/500`,
      createdAt: serverTimestamp(),
      episodes: [], isTrending: false, isFeatured: false
    };
    const ref = await addDoc(collection(db, "stories"), newStory);
    setStories([{ id: ref.id, ...newStory, createdAt: new Date() }, ...stories]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateStory = async (id, updates) => {
    await updateDoc(doc(db, "stories", id), updates);
    const updated = { ...selectedStory, ...updates };
    setStories(stories.map(s => s.id === id ? updated : s));
    setSelectedStory(updated);
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm("Delete this series?")) return;
    await deleteDoc(doc(db, "stories", id));
    setStories(stories.filter(s => s.id !== id));
    setSelectedStory(null);
  };

  const updateEpisodes = async (storyId, newEpisodes) => {
    const cleanEpisodes = newEpisodes.map((ep, i) => ({ ...ep, number: i + 1 }));
    await updateDoc(doc(db, "stories", storyId), { episodes: cleanEpisodes });
    const updated = { ...selectedStory, episodes: cleanEpisodes };
    setStories(stories.map(s => s.id === storyId ? updated : s));
    setSelectedStory(updated);
  };

  const handleAddEpisode = (storyId, data) => {
    const newEp = { ...data, id: Date.now().toString() };
    updateEpisodes(storyId, [...(selectedStory.episodes || []), newEp]);
  };

  const handleUpdateEpisode = (storyId, index, data) => {
    const eps = [...selectedStory.episodes];
    eps[index] = { ...eps[index], ...data };
    updateEpisodes(storyId, eps);
  };

  const handleDeleteEpisode = (storyId, index) => {
    const eps = [...selectedStory.episodes];
    eps.splice(index, 1);
    updateEpisodes(storyId, eps);
  };

  const filteredStories = stories.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">Content Library</h2><p className="text-slate-400 text-sm">{stories.length} Series</p></div>
        <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-3 top-2.5 text-slate-500" size={16} /><input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-white text-sm outline-none w-48" /></div>
            <button onClick={fetchData} className="p-2 bg-slate-800 rounded-lg text-slate-400"><RefreshCw size={18} /></button>
            
            {/* 2. ADDED TRENDING BUTTON */}
            <button onClick={() => setActiveManager("trending")} className="flex gap-2 px-3 py-2 bg-orange-600/10 text-orange-400 border border-orange-600/20 hover:bg-orange-600 hover:text-white rounded-lg text-sm transition-colors">
                <Flame size={16} /> Trending
            </button>

            {/* 3. FIXED FEATURED BUTTON (Uses setActiveManager now) */}
            <button onClick={() => setActiveManager("featured")} className="flex gap-2 px-3 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 hover:bg-indigo-600 hover:text-white rounded-lg text-sm transition-colors">
                <Star size={16} /> Featured
            </button>

            <button onClick={() => setIsGenreModalOpen(true)} className="flex gap-2 px-3 py-2 bg-slate-800 rounded-lg text-slate-300 text-sm"><Tags size={16} /> Genres</button>
            <button onClick={() => setIsCreateModalOpen(true)} className="flex gap-2 px-3 py-2 bg-indigo-600 rounded-lg text-white font-medium text-sm"><Plus size={16} /> New Series</button>
        </div>
      </div>

      {loading ? <div className="text-slate-500 text-center py-20">Loading...</div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredStories.map(story => (
            <StoryCard 
              key={story.id} 
              story={story} 
              onClick={() => setSelectedStory(story)} 
              onDelete={handleDeleteStory} 
            />
          ))}
        </div>
      )}

      <CreateStoryModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} genres={genres} onCreate={handleCreateStory} />
      <GenreModal isOpen={isGenreModalOpen} onClose={() => setIsGenreModalOpen(false)} genres={genres} onAdd={handleAddGenre} onUpdate={handleUpdateGenre} onDelete={handleDeleteGenre} />
      
      <SectionManagerModal 
        isOpen={!!activeManager} 
        type={activeManager} 
        onClose={() => { 
            setActiveManager(null); 
            fetchData(); 
        }} 
      />

      <EditStoryModal 
        story={selectedStory} 
        onClose={() => setSelectedStory(null)} 
        onDeleteStory={handleDeleteStory}
        onSaveStory={handleUpdateStory}
        onAddEpisode={handleAddEpisode}
        onUpdateEpisode={handleUpdateEpisode}
        onDeleteEpisode={handleDeleteEpisode}
        onReorderEpisodes={updateEpisodes}
      />
    </div>
  );
}