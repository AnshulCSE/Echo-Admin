import { useState, useEffect } from "react";
import { X, Search, Star, Plus, Trash2, Flame } from "lucide-react";
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "../firebase";

// Now accepts "field" (e.g., 'isFeatured' or 'isTrending') and "title"
export default function SectionManagerModal({ isOpen, onClose, type = "featured" }) {
  const [activeStories, setActiveStories] = useState([]);
  const [searchStories, setSearchStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Configuration based on type
  const config = type === "featured" 
    ? { field: "isFeatured", title: "Featured Manager", icon: <Star className="text-indigo-500 fill-indigo-500" size={20}/>, color: "indigo" }
    : { field: "isTrending", title: "Trending Manager", icon: <Flame className="text-orange-500 fill-orange-500" size={20}/>, color: "orange" };

  useEffect(() => {
    if (isOpen) {
      fetchActive();
      searchAllStories("");
    }
  }, [isOpen, type]);

  const fetchActive = async () => {
    // Dynamic Query based on field
    const q = query(collection(db, "stories"), where(config.field, "==", true));
    const snapshot = await getDocs(q);
    setActiveStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const searchAllStories = async (term) => {
    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const filtered = all.filter(s => 
      !s[config.field] && // Check dynamic field
      (s.title.toLowerCase().includes(term.toLowerCase()) || 
       s.author.toLowerCase().includes(term.toLowerCase()))
    );
    setSearchStories(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    searchAllStories(e.target.value);
  };

  const toggleStatus = async (story, status) => {
    // 1. Update DB dynamically
    await updateDoc(doc(db, "stories", story.id), { [config.field]: status });

    // 2. Refresh lists
    if (status) {
        setActiveStories([...activeStories, { ...story, [config.field]: true }]);
        setSearchStories(searchStories.filter(s => s.id !== story.id));
    } else {
        setActiveStories(activeStories.filter(s => s.id !== story.id));
        if (story.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            setSearchStories(prev => [{ ...story, [config.field]: false }, ...prev]);
        }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-5xl h-[80vh] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
           <div>
             <h3 className="text-xl font-bold text-white flex items-center gap-2">{config.icon} {config.title}</h3>
             <p className="text-slate-400 text-sm">Manage stories appearing in the "{type}" row</p>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
            {/* LEFT: Active List */}
            <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-900/50">
                <div className={`p-4 border-b border-slate-800/50 bg-${config.color}-900/10`}>
                    <h4 className={`text-${config.color}-400 font-bold text-sm`}>ACTIVE LIST ({activeStories.length})</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeStories.map(story => (
                        <div key={story.id} className={`flex items-center gap-3 p-2 bg-slate-900 border border-${config.color}-500/30 rounded-lg shadow-sm`}>
                            <img src={story.coverUrl} className="w-10 h-14 object-cover rounded bg-slate-800" />
                            <div className="flex-1 min-w-0">
                                <h5 className="text-white text-sm font-bold truncate">{story.title}</h5>
                                <p className="text-xs text-slate-500 truncate">{story.author}</p>
                            </div>
                            <button onClick={() => toggleStatus(story, false)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Search List */}
            <div className="w-1/2 flex flex-col bg-slate-950/30">
                <div className="p-4 border-b border-slate-800/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                        <input type="text" placeholder="Search library..." value={searchTerm} onChange={handleSearch} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-white text-sm outline-none focus:border-indigo-500" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                     {searchStories.map(story => (
                        <div key={story.id} className="flex items-center gap-3 p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-600">
                            <img src={story.coverUrl} className="w-10 h-14 object-cover rounded bg-slate-800" />
                            <div className="flex-1 min-w-0">
                                <h5 className="text-slate-300 text-sm font-medium truncate">{story.title}</h5>
                                <p className="text-xs text-slate-500 truncate">{story.author}</p>
                            </div>
                            <button onClick={() => toggleStatus(story, true)} className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-600 rounded-lg">
                                <Plus size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}