import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { Play, Users, Clock } from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState({ stories: 0, episodes: 0 });
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const snap = await getDocs(collection(db, "stories"));
            let epCount = 0;
            const storyList = [];
            snap.forEach(doc => {
                const data = doc.data();
                epCount += data.episodes?.length || 0;
                storyList.push({ id: doc.id, ...data });
            });
            setStats({ stories: snap.size, episodes: epCount });
            setRecent(storyList.slice(0, 3)); // Top 3
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><Play /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Stories</p>
                            <h3 className="text-3xl font-bold text-white">{stats.stories}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <div className="flex items-center space-x-4">
                         <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Clock /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Episodes</p>
                            <h3 className="text-3xl font-bold text-white">{stats.episodes}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-4">Recent Stories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recent.map(story => (
                        <div key={story.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-colors group">
                            <div className="h-32 bg-slate-800 relative">
                                <img src={story.coverUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-white truncate">{story.title}</h4>
                                <p className="text-sm text-slate-400">{story.episodes?.length || 0} Episodes</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}