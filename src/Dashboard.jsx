import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { 
  BarChart3, Mic2, Library, TrendingUp, Users, Crown, Activity, FileAudio, UserPlus
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStories: 0,
    totalEpisodes: 0,
    totalUsers: 0,
    premiumUsers: 0
  });

  // Graph & Activity States
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [genreData, setGenreData] = useState([]);
  const [premiumData, setPremiumData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]); // NEW

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6']; 

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // 1. FETCH STORIES
        const storiesSnap = await getDocs(collection(db, "stories"));
        const stories = storiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'story' }));
        
        // 2. FETCH USERS
        const usersQ = query(collection(db, "users"), orderBy("createdAt", "asc"));
        const usersSnap = await getDocs(usersQ);
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'user' }));

        // --- CALCULATE STATS ---
        
        // A. Totals
        const totalEpisodes = stories.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);
        const premCount = users.filter(u => u.Premium).length;

        // B. Genre Chart
        const genreCounts = {};
        stories.forEach(s => {
            const g = s.genre || "Unknown";
            genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
        setGenreData(Object.keys(genreCounts).map(k => ({ name: k, value: genreCounts[k] })));

        // C. Premium Chart
        setPremiumData([
            { name: 'Free', value: users.length - premCount },
            { name: 'Premium', value: premCount }
        ]);

        // D. Growth Chart
        const dateMap = {};
        let accumulatedUsers = 0;
        users.forEach(user => {
            if (user.createdAt) {
                const d = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dateMap[key] = (dateMap[key] || 0) + 1;
            }
        });
        setUserGrowthData(Object.keys(dateMap).map(date => {
            accumulatedUsers += dateMap[date];
            return { date, totalUsers: accumulatedUsers };
        }));

        // E. RECENT ACTIVITY FEED (Merge & Sort)
        const allEvents = [...stories, ...users];
        
        // Sort by CreatedAt Descending
        allEvents.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        // Take top 5
        setRecentActivity(allEvents.slice(0, 5));

        // Final Stats
        setStats({
          totalStories: storiesSnap.size,
          totalEpisodes: totalEpisodes,
          totalUsers: usersSnap.size,
          premiumUsers: premCount
        });

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Helper for Activity Feed Dates
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;
    
    if (diffInHours < 24) return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{loading ? "-" : value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10 ${color.bg} ${color.text}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-white">Analytics Overview</h2>
        <p className="text-slate-400 mt-1 text-sm">Real-time performance metrics</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color={{ bg: "bg-indigo-500", text: "text-indigo-500" }} />
        <StatCard title="Premium Members" value={stats.premiumUsers} icon={Crown} color={{ bg: "bg-yellow-500", text: "text-yellow-500" }} />
        <StatCard title="Total Series" value={stats.totalStories} icon={Library} color={{ bg: "bg-pink-500", text: "text-pink-500" }} />
        <StatCard title="Total Episodes" value={stats.totalEpisodes} icon={Mic2} color={{ bg: "bg-emerald-500", text: "text-emerald-500" }} />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
           <h3 className="text-white font-bold mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-500"/> User Growth</h3>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={userGrowthData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                 <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                 <Line type="monotone" dataKey="totalUsers" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
           <h3 className="text-white font-bold mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-pink-500"/> Content by Genre</h3>
           <div className="h-[300px] w-full relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={genreData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                   {genreData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-bold text-white">{stats.totalStories}</span>
             </div>
           </div>
        </div>
      </div>

      {/* CHARTS ROW 2 - REPLACED PRO TIP WITH ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* SUBSCRIPTION STATUS */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
             <h3 className="text-white font-bold mb-6 flex items-center gap-2"><Crown size={18} className="text-yellow-500"/> Subscription Status</h3>
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={premiumData}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {premiumData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Premium' ? '#eab308' : '#334155'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
         </div>
         
         {/* RECENT ACTIVITY FEED */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Activity size={18} className="text-blue-500"/> Recent Activity
                </h3>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Live Feed</span>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {recentActivity.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-10">No recent activity found.</p>
                ) : (
                    recentActivity.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-colors">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'user' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-pink-900/30 text-pink-400'}`}>
                                {item.type === 'user' ? <UserPlus size={18} /> : <FileAudio size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                    {item.type === 'user' ? (item.name || item.phone || "New User") : (item.title || "New Story")}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {item.type === 'user' ? "Joined the platform" : "Added to library"}
                                </p>
                            </div>
                            <div className="text-xs text-slate-600 font-mono whitespace-nowrap">
                                {formatTimeAgo(item.createdAt)}
                            </div>
                        </div>
                    ))
                )}
             </div>
         </div>

      </div>
    </div>
  );
}