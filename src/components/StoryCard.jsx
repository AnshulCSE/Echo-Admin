import { Pencil, Trash2, Flame, Star, Music } from "lucide-react";

export default function StoryCard({ story, onClick, onDelete }) {
  return (
    <div 
      onClick={onClick} 
      className="group relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1"
    >
      {/* CHANGED: aspect-[3/4] -> aspect-square for 1:1 ratio */}
      <div className="aspect-square w-full relative">
        <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" loading="lazy" />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <div className="bg-slate-800 rounded-full p-2 text-white hover:bg-indigo-600 transition-colors">
            <Pencil size={16} />
          </div>
          <div 
            className="bg-slate-800 rounded-full p-2 text-white hover:bg-red-600 transition-colors" 
            onClick={(e) => { e.stopPropagation(); onDelete(story.id, story.title); }}
          >
            <Trash2 size={16} />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {story.isTrending && <div className="bg-orange-500 text-white p-1.5 rounded-full shadow-sm"><Flame size={12} fill="white" /></div>}
          {story.isFeatured && <div className="bg-indigo-600 text-white p-1.5 rounded-full shadow-sm"><Star size={12} fill="white" /></div>}
        </div>
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 font-medium">
          <Music size={10} /> {story.episodes?.length || 0}
        </div>
      </div>

      <div className="p-3 bg-slate-900">
        <h3 className="text-white text-sm font-bold truncate" title={story.title}>{story.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{story.author}</p>
      </div>
    </div>
  );
}