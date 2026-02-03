import { useState, useEffect } from "react";
import { Send, Bell, Clock, CheckCircle, Smartphone, Loader2, AlertTriangle } from "lucide-react";
import { collection, addDoc, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "./firebase";

export default function Marketing() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false); // For "Sending..." state
  const [historyLoading, setHistoryLoading] = useState(true); // For initial list load
  
  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [image, setImage] = useState("");
  
  // Feedback State
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const q = query(collection(db, "marketing_notifications"), orderBy("sentAt", "desc"), limit(20));
      const snapshot = await getDocs(q);
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !body) return;

    // No more window.confirm popup. 
    // We trust the user clicked the button intentionally.

    setLoading(true);
    setStatus(null); // Clear previous messages

    try {
      // 1. Save to Firestore
      await addDoc(collection(db, "marketing_notifications"), {
        title,
        body,
        target,
        imageUrl: image,
        sentAt: new Date(),
        status: "queued"
      });

      // 2. Success Feedback
      setStatus({ type: 'success', message: 'Notification queued successfully!' });
      
      // 3. Reset Form
      setTitle("");
      setBody("");
      setImage("");
      
      // 4. Refresh List
      fetchHistory();

      // Clear success message after 3 seconds
      setTimeout(() => setStatus(null), 3000);

    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to send. Check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Bell className="text-pink-500" /> Marketing Console
        </h2>
        <p className="text-slate-400 mt-1 text-sm">Send push notifications to your mobile app users</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: COMPOSER */}
          <div className="flex-1 space-y-6">
              
              {/* INPUT FORM */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Send size={18} className="text-indigo-500"/> Compose Message
                  </h3>
                  
                  {/* FEEDBACK BANNER (Replaces Alert) */}
                  {status && (
                    <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-2 ${
                        status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {status.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
                        {status.message}
                    </div>
                  )}

                  <form onSubmit={handleSend} className="space-y-4">
                      <div>
                          <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Target Audience</label>
                          <select 
                            value={target} 
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                          >
                              <option value="all">All Users (Broadcast)</option>
                              <option value="premium">Premium Members Only</option>
                              <option value="free">Free Users Only</option>
                          </select>
                      </div>

                      <div>
                          <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Notification Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g., New Horror Series Available!" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={50}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                          />
                          <p className="text-right text-[10px] text-slate-600 mt-1">{title.length}/50</p>
                      </div>

                      <div>
                          <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Message Body</label>
                          <textarea 
                            rows={3}
                            placeholder="e.g., Listen to 'The Haunted House' now exclusively on ZingFM." 
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            maxLength={150}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                          />
                          <p className="text-right text-[10px] text-slate-600 mt-1">{body.length}/150</p>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading || !title || !body}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                      >
                         {loading ? (
                             <>
                                <Loader2 className="animate-spin" size={18} /> Sending...
                             </>
                         ) : (
                             "Send Notification"
                         )}
                      </button>
                  </form>
              </div>

              {/* HISTORY LIST */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Clock size={18} className="text-slate-500"/> Campaign History
                  </h3>
                  <div className="space-y-3">
                      {historyLoading ? (
                          <div className="text-center py-6 text-slate-500">
                              <Loader2 className="animate-spin mx-auto mb-2" size={20}/>
                              Loading history...
                          </div>
                      ) : history.length === 0 ? (
                          <p className="text-slate-500 text-sm text-center py-4">No notifications sent yet.</p>
                      ) : (
                          history.map(item => (
                              <div key={item.id} className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg flex justify-between items-center group hover:border-slate-700 transition-colors">
                                  <div>
                                      <p className="text-white text-sm font-bold">{item.title}</p>
                                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.body}</p>
                                  </div>
                                  <div className="text-right">
                                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold border border-emerald-500/20">Sent</span>
                                      <p className="text-[10px] text-slate-600 mt-1">
                                          {item.sentAt?.toDate ? item.sentAt.toDate().toLocaleDateString() : 'Just now'}
                                      </p>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>

          </div>

          {/* RIGHT: PREVIEW */}
          <div className="w-full lg:w-80 shrink-0">
             <div className="sticky top-6">
                 <h4 className="text-slate-500 text-xs font-bold uppercase mb-4 text-center">Live Preview</h4>
                 
                 {/* MOCK PHONE */}
                 <div className="bg-black border-4 border-slate-800 rounded-[2.5rem] p-3 shadow-2xl relative overflow-hidden h-[500px]">
                     
                     {/* Notch */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-10"></div>
                     
                     {/* Screen Content */}
                     <div className="h-full w-full bg-slate-900 rounded-[2rem] overflow-hidden relative" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=300")', backgroundSize: 'cover'}}>
                         
                         {/* Clock */}
                         <div className="text-center mt-12 text-white/80 font-thin text-5xl tracking-wider">
                             10:24
                         </div>
                         <div className="text-center text-white/60 text-sm mt-1">
                             Friday, January 30
                         </div>

                         {/* The Notification Card */}
                         {(title || body) && (
                             <div className="mt-8 mx-2 bg-slate-200/90 backdrop-blur-md rounded-xl p-3 shadow-lg animate-in slide-in-from-top-4 duration-500">
                                 <div className="flex items-center justify-between mb-1">
                                     <div className="flex items-center gap-1.5">
                                         <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
                                             <Smartphone size={10} className="text-white"/>
                                         </div>
                                         <span className="text-[10px] font-bold text-slate-700 uppercase">ZING FM</span>
                                     </div>
                                     <span className="text-[10px] text-slate-500">now</span>
                                 </div>
                                 <div className="pr-2">
                                     <p className="text-slate-900 text-xs font-bold leading-tight">{title || "Notification Title"}</p>
                                     <p className="text-slate-700 text-xs leading-tight mt-0.5">{body || "Your message will appear here..."}</p>
                                 </div>
                             </div>
                         )}

                         {/* Empty State Hint */}
                         {(!title && !body) && (
                            <div className="absolute bottom-10 left-0 w-full text-center px-6">
                                <p className="text-white/40 text-xs">Start typing to see how your alert looks on the lock screen.</p>
                            </div>
                         )}

                     </div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
}