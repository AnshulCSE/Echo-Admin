import { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Mic, Search, CheckCircle, Music } from "lucide-react";

export default function AddEpisode() {
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [episodeData, setEpisodeData] = useState({
    number: "",
    title: "",
    duration: "",
    audioUrl: ""
  });

  // Fetch Stories
  useEffect(() => {
    const fetchStories = async () => {
      const snapshot = await getDocs(collection(db, "stories"));
      setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchStories();
  }, []);

  // Filter logic
  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStory) return setStatus("Please select a story first!");

    setLoading(true);
    setStatus("");
    try {
      const storyRef = doc(db, "stories", selectedStory.id);
      
      await updateDoc(storyRef, {
        episodes: arrayUnion({
            number: parseInt(episodeData.number || 0),
            title: episodeData.title,
            duration: episodeData.duration,
            audioUrl: episodeData.audioUrl
        })
      });

      setStatus("Episode Added Successfully!");
      setEpisodeData({ number: parseInt(episodeData.number) + 1, title: "", duration: "", audioUrl: "" });
      
    } catch (error) {
      setStatus("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Add Episode</h2>
          <p className="text-slate-400 mt-1">Upload content to {selectedStory ? selectedStory.title : "a story"}</p>
        </div>
        <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
          <Mic className="text-indigo-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Search & Select Story */}
        <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full shadow-xl">
                <label className="block text-sm font-bold text-slate-400 mb-3">1. Find Story</label>
                
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search stories..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredStories.map(story => (
                        <div 
                            key={story.id}
                            onClick={() => setSelectedStory(story)}
                            className={`p-3 rounded-xl cursor-pointer transition-all border ${
                                selectedStory?.id === story.id 
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50" 
                                : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                            }`}
                        >
                            <div className="font-semibold">{story.title}</div>
                            <div className={`text-xs ${selectedStory?.id === story.id ? "text-indigo-200" : "text-slate-500"}`}>
                                {story.author}
                            </div>
                        </div>
                    ))}
                    {filteredStories.length === 0 && (
                        <div className="text-center text-slate-500 py-8 text-sm">No stories found</div>
                    )}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Episode Form */}
        <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl relative overflow-hidden">
                {/* Visual Checkmark if story selected */}
                {selectedStory && (
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CheckCircle size={100} className="text-indigo-500" />
                    </div>
                )}

                {status && (
                    <div className="p-3 bg-green-900/20 border border-green-800 text-green-400 rounded-xl text-sm font-medium">
                        {status}
                    </div>
                )}

                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ep. No</label>
                        <input type="number" value={episodeData.number} onChange={e => setEpisodeData({...episodeData, number: e.target.value})} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-center font-mono" placeholder="#" required />
                    </div>
                    <div className="col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
                        <input type="text" value={episodeData.duration} onChange={e => setEpisodeData({...episodeData, duration: e.target.value})} 
                             className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="10:00" required />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Episode Title</label>
                    <input type="text" value={episodeData.title} onChange={e => setEpisodeData({...episodeData, title: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="The Beginning..." required />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">MP3 Link</label>
                    <div className="relative">
                        <Music className="absolute left-3 top-3.5 text-slate-600" size={16} />
                        <input type="url" value={episodeData.audioUrl} onChange={e => setEpisodeData({...episodeData, audioUrl: e.target.value})} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:border-indigo-500 outline-none font-mono text-sm" placeholder="https://..." required />
                    </div>
                </div>

                <button type="submit" disabled={loading || !selectedStory} 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-indigo-900/20">
                    {loading ? "Adding..." : "Upload Episode"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}