import React, { useState, useEffect, useCallback } from 'react';
import { BookMarked, Plus, Edit3, Trash2, Save, X, Tag, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { getJSON, setJSON } from '../utils/localStorage';

interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string;
  rating: number;
  created_at: string;
}

const STORAGE_KEY = 'neevv_stories';

export const StoryBank: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', situation: '', task: '', action: '', result: '', tags: '', rating: 3 });
  const [filterTag, setFilterTag] = useState('all');

  useEffect(() => {
    setStories(getJSON<Story[]>(STORAGE_KEY, []));
  }, []);

  const persist = (updated: Story[]) => {
    setStories(updated);
    setJSON(STORAGE_KEY, updated);
  };

  const saveStory = () => {
    if (!form.title.trim() || !form.situation.trim()) return;
    const id = editingId || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const now = new Date().toISOString();
    const rating = Math.max(1, Math.min(5, Math.floor(Number(form.rating) || 3)));

    const newStory: Story = {
      id,
      title: form.title,
      situation: form.situation,
      task: form.task,
      action: form.action,
      result: form.result,
      tags: form.tags,
      rating,
      created_at: editingId ? (stories.find(s => s.id === editingId)?.created_at || now) : now,
    };

    let updated: Story[];
    if (editingId) {
      updated = stories.map(s => s.id === editingId ? newStory : s);
    } else {
      updated = [newStory, ...stories];
    }

    persist(updated);
    setIsAdding(false);
    setEditingId(null);
    setForm({ title: '', situation: '', task: '', action: '', result: '', tags: '', rating: 3 });
  };

  const deleteStory = (id: string) => {
    persist(stories.filter(s => s.id !== id));
  };

  const startEdit = (story: Story) => {
    setEditingId(story.id);
    setForm({ title: story.title, situation: story.situation, task: story.task, action: story.action, result: story.result, tags: story.tags, rating: story.rating });
    setIsAdding(true);
  };

  const allTags = Array.from(new Set(stories.flatMap(s => s.tags.split(',').map(t => t.trim()).filter(Boolean))));
  const filtered = filterTag === 'all' ? stories : stories.filter(s => s.tags.toLowerCase().includes(filterTag.toLowerCase()));

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
              <BookMarked size={28} className="text-primary" /> Story Bank
            </h1>
            <p className="text-base-content/60 mt-1">
              Save your best STAR stories. {stories.length} {stories.length === 1 ? 'story' : 'stories'} saved.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm gap-1"
            onClick={() => { setIsAdding(true); setEditingId(null); setForm({ title: '', situation: '', task: '', action: '', result: '', tags: '', rating: 3 }); }}
          >
            <Plus size={16} /> Add Story
          </button>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            <button className={`btn btn-xs ${filterTag === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterTag('all')}>All</button>
            {allTags.map(tag => (
              <button key={tag} className={`btn btn-xs gap-1 ${filterTag === tag ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterTag(tag)}>
                <Tag size={10} /> {tag}
              </button>
            ))}
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="card bg-base-200 border border-primary/30 mb-6">
            <div className="card-body p-4 space-y-3">
              <h3 className="font-semibold text-base-content">{editingId ? 'Edit Story' : 'New STAR Story'}</h3>
              <input className="input input-bordered w-full input-sm" placeholder="Story title (e.g., 'Led Product Launch at TCS')" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea className="textarea textarea-bordered w-full textarea-sm" placeholder="Situation — What was the context? Set the scene." rows={2} value={form.situation} onChange={e => setForm({ ...form, situation: e.target.value })} />
              <textarea className="textarea textarea-bordered w-full textarea-sm" placeholder="Task — What was YOUR specific responsibility?" rows={2} value={form.task} onChange={e => setForm({ ...form, task: e.target.value })} />
              <textarea className="textarea textarea-bordered w-full textarea-sm" placeholder="Action — What did YOU do? Be specific about your steps." rows={3} value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} />
              <textarea className="textarea textarea-bordered w-full textarea-sm" placeholder="Result — What was the measurable outcome? Quantify if possible." rows={2} value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} />
              <div className="flex gap-3 items-center">
                <input className="input input-bordered input-sm flex-1" placeholder="Tags (comma-separated: leadership, teamwork)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-secondary" />
                  <select className="select select-bordered select-sm" value={form.rating} onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}/5</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm gap-1" onClick={saveStory}><Save size={14} /> Save</button>
                <button className="btn btn-ghost btn-sm gap-1" onClick={() => { setIsAdding(false); setEditingId(null); }}><X size={14} /> Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Stories List */}
        {filtered.length === 0 && !isAdding ? (
          <div className="space-y-4">
            {/* Description */}
            <div className="text-center py-8">
              <BookMarked size={48} className="mx-auto mb-3 text-primary/30" />
              <h2 className="text-xl font-bold text-base-content mb-2">Your STAR Story Bank</h2>
              <p className="text-sm text-base-content/60 max-w-md mx-auto mb-4">
                Save your best interview stories here. Organize by tags, rate their impact, and have them ready when your interviewer asks "Tell me about a time..."
              </p>
            </div>

            {/* Sample Story Card */}
            <div className="card bg-base-200 border border-dashed border-primary/30 opacity-70">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-ghost badge-xs">📌 Example</span>
                  <h3 className="font-semibold text-base-content text-sm">Led Cross-Functional Product Launch at TCS</h3>
                  <div className="flex">
                    {[1,2,3,4].map(i => <Star key={i} size={10} className="text-secondary fill-secondary" />)}
                    <Star size={10} className="text-secondary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 bg-base-300 rounded text-xs"><span className="font-semibold text-primary">S:</span> <span className="text-base-content/60">Led a 12-person team to launch a new SaaS product...</span></div>
                  <div className="p-2 bg-base-300 rounded text-xs"><span className="font-semibold text-primary">T:</span> <span className="text-base-content/60">Coordinate 3 departments and ship in 8 weeks...</span></div>
                  <div className="p-2 bg-base-300 rounded text-xs"><span className="font-semibold text-primary">A:</span> <span className="text-base-content/60">Created daily standups, resolved vendor conflict...</span></div>
                  <div className="p-2 bg-base-300 rounded text-xs"><span className="font-semibold text-primary">R:</span> <span className="text-base-content/60">Shipped 2 weeks early, ₹3.2Cr revenue in Q1...</span></div>
                </div>
                <div className="flex gap-1 mt-2">
                  <span className="badge badge-ghost badge-xs">#leadership</span>
                  <span className="badge badge-ghost badge-xs">#cross-functional</span>
                  <span className="badge badge-ghost badge-xs">#product-launch</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button className="btn btn-primary btn-sm gap-1" onClick={() => setIsAdding(true)}>
                <Plus size={16} /> Create Your First Story
              </button>
              <p className="text-xs text-base-content/40 mt-2">Most successful candidates have 6-8 stories ready</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(story => {
              const isExpanded = expandedId === story.id;
              return (
                <div key={story.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : story.id)}>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base-content">{story.title}</h3>
                          <div className="flex">
                            {Array.from({ length: story.rating }).map((_, i) => (
                              <Star key={i} size={12} className="text-secondary fill-secondary" />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {story.tags.split(',').filter(Boolean).map(t => (
                            <span key={t} className="badge badge-ghost badge-xs">#{t.trim()}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="btn btn-ghost btn-xs btn-square" onClick={() => startEdit(story)}><Edit3 size={14} /></button>
                        <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => deleteStory(story.id)}><Trash2 size={14} /></button>
                        <button className="btn btn-ghost btn-xs btn-square" onClick={() => setExpandedId(isExpanded ? null : story.id)}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        <div className="p-2 bg-base-300 rounded"><p className="text-xs font-semibold text-primary">Situation</p><p className="text-sm text-base-content/70">{story.situation}</p></div>
                        <div className="p-2 bg-base-300 rounded"><p className="text-xs font-semibold text-primary">Task</p><p className="text-sm text-base-content/70">{story.task}</p></div>
                        <div className="p-2 bg-base-300 rounded"><p className="text-xs font-semibold text-primary">Action</p><p className="text-sm text-base-content/70">{story.action}</p></div>
                        <div className="p-2 bg-base-300 rounded"><p className="text-xs font-semibold text-primary">Result</p><p className="text-sm text-base-content/70">{story.result}</p></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
