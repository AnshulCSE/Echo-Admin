import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, query, limit, getCountFromServer } from "firebase/firestore";
import { Users as UsersIcon, Search, Phone, Calendar, RefreshCw, Crown, User, AlertCircle, TrendingUp } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // Store real total
  const [premiumCount, setPremiumCount] = useState(0); // Store premium total
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch List (Limited to 50 for table speed)
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersRef = collection(db, "users");
      
      // A. Get the Table Data (Limited)
      const q = query(usersRef, limit(50));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setUsers(list);

      // B. Get the REAL Total Count (Server-side count)
      const countSnapshot = await getCountFromServer(usersRef);
      setTotalCount(countSnapshot.data().count);

      // C. Calculate Premium stats from the loaded chunk (Approximation)
      // Note: To get exact premium count of thousands, you'd need a separate query, 
      // but for now counting the loaded list is a good 'sample' statistic.
      setPremiumCount(list.filter(u => u.Premium).length);

    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Filter Logic (Client Side)
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const phone = user.phone || ""; 
    const name = user.name || "";
    return phone.toLowerCase().includes(term) || name.toLowerCase().includes(term);
  });

  const formatDate = (val) => {
    if (!val) return "N/A";
    try {
        if (val.toDate) return val.toDate().toLocaleDateString();
        return new Date(val).toLocaleDateString();
    } catch (e) { return "Invalid Date"; }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UsersIcon className="text-indigo-500" /> App Users
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time user directory
          </p>
        </div>
        <div className="flex gap-2 items-center">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input 
                  placeholder="Search Name or Phone..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-white text-sm outline-none w-64 focus:border-indigo-500" 
                />
            </div>
            <button onClick={fetchUsers} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <RefreshCw size={18} />
            </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* TOTAL USERS CARD */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={40} className="text-indigo-500"/>
              </div>
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Registered</h4>
              <p className="text-3xl font-bold text-white mt-1">
                  {loading ? "..." : totalCount}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Lifetime Signups</p>
          </div>

          {/* PREMIUM USERS CARD */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 p-3 opacity-10">
                  <Crown size={40} className="text-yellow-500"/>
              </div>
              <h4 className="text-yellow-500/80 text-xs font-bold uppercase tracking-wider">Premium Members</h4>
              <p className="text-3xl font-bold text-white mt-1">
                  {loading ? "..." : premiumCount}
                  <span className="text-sm text-slate-500 font-normal ml-1">visible</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Active Subscribers</p>
          </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-start gap-3 text-red-400">
            <AlertCircle className="shrink-0 mt-0.5" />
            <div><h4 className="font-bold text-sm">Error</h4><p className="text-xs">{error}</p></div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
            <div className="p-10 text-center text-slate-500">Loading directory...</div>
        ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No users found.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">User Name</th>
                            <th className="px-6 py-4">Phone Number</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Plan Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredUsers.map((user) => (
                            <tr key={user.docId} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                            <User size={16} />
                                        </div>
                                        <span className="font-bold text-white">{user.name || "Unknown"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Phone size={14} className="text-slate-500"/>
                                        {user.phone || "---"}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Calendar size={14} />
                                        {formatDate(user.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.Premium ? (
                                        <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20 flex items-center gap-1 w-fit">
                                            <Crown size={12} fill="currentColor"/> PREMIUM
                                        </span>
                                    ) : (
                                        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-700 w-fit">
                                            FREE
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-3 bg-slate-950/50 text-center text-xs text-slate-500 border-t border-slate-800">
                    Showing latest {filteredUsers.length} of {totalCount} users
                </div>
            </div>
        )}
      </div>
    </div>
  );
}