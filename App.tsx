
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, UserRole, AITool, ViewType, ResourceItem, SchoolEvent, Course, Presentation, Slide, TransitionType, CalendarTask, LessonPlan } from './types';
import { runAITool, generateSlideImage, askKnowledgeBase, generateLessonPlan } from './services/gemini';
import { DIRECTORY, EVENTS, RESOURCES, COURSES, AI_TOOLS } from './constants';
import { db } from './services/db';
import Layout from './components/Layout';
import ToolModal from './components/ToolModal';
import { Icons } from './components/Icons';
import { GoogleGenAI, Type } from "@google/genai";

// --- Directory View Implementation ---
const DirectoryView = ({ currentUser }: { currentUser: User }) => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    db.getUsers().then(setUsers);
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {users.map(u => (
        <div key={u.id} className="bg-white p-10 rounded-[4rem] border border-pink-100 shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center gap-6 mb-8">
            <img src={u.avatar || `https://i.pravatar.cc/150?u=${u.id}`} className="w-20 h-20 rounded-3xl object-cover shadow-lg" alt={u.name} />
            <div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{u.name}</h3>
              <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{u.role}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold border-b border-pink-50 pb-2">
              <span className="text-slate-400">Department</span>
              <span className="text-slate-900">{u.department || 'General'}</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-b border-pink-50 pb-2">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-900">{u.email}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Calendar View (Navigable Monthly Grid) ---
const CalendarView = ({ user }: { user: User }) => {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [newTask, setNewTask] = useState<Partial<CalendarTask>>({
    title: '', description: '', subject: 'General', type: 'Task', targetGrade: user.assignedGrades?.[0] || user.grade || '10', date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    const t = await db.getTasks();
    const e = await db.getEvents();
    if (user.role === UserRole.STUDENT) {
      setTasks(t.filter(task => task.targetGrade === user.grade));
    } else {
      setTasks(t);
    }
    setEvents(e);
  };

  useEffect(() => { loadData(); }, []);

  const currentMeta = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + monthOffset);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      firstDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
      days: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
      name: date.toLocaleString('default', { month: 'long' })
    };
  }, [monthOffset]);

  const calendarDays = useMemo(() => {
    const arr = [];
    for (let i = 0; i < currentMeta.firstDay; i++) arr.push(null);
    for (let i = 1; i <= currentMeta.days; i++) arr.push(i);
    return arr;
  }, [currentMeta]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const task: CalendarTask = {
      id: 'task-' + Date.now(),
      title: newTask.title || '',
      description: newTask.description || '',
      subject: newTask.subject || '',
      date: newTask.date || '',
      assignedBy: user.name,
      assignedById: user.id,
      targetGrade: newTask.targetGrade || '10',
      type: newTask.type as any || 'Task'
    };
    await db.addTask(task);
    setShowTaskForm(false);
    loadData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-pink-100 shadow-xl">
        <div className="flex items-center gap-6">
          <button onClick={() => setMonthOffset(m => m - 1)} className="w-12 h-12 rounded-full border border-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-600 hover:text-white transition-all">←</button>
          <div className="text-center min-w-[150px]">
            <h3 className="text-2xl font-black text-slate-900">{currentMeta.name} {currentMeta.year}</h3>
            <button onClick={() => setMonthOffset(0)} className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mt-1">Today</button>
          </div>
          <button onClick={() => setMonthOffset(m => m + 1)} className="w-12 h-12 rounded-full border border-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-600 hover:text-white transition-all">→</button>
        </div>
        {user.role !== UserRole.STUDENT && (
          <button onClick={() => setShowTaskForm(true)} className="px-8 py-3 bg-slate-900 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl hover:scale-105 transition-all">Assign Grade Task</button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
        ))}
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="aspect-square bg-pink-50/20 rounded-3xl"></div>;
          const dateStr = `${currentMeta.year}-${String(currentMeta.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTasks = tasks.filter(t => t.date === dateStr);
          const isToday = day === new Date().getDate() && currentMeta.month === new Date().getMonth() && currentMeta.year === new Date().getFullYear();

          return (
            <div key={day} className={`aspect-square p-4 border border-pink-100 rounded-[2rem] transition-all group relative ${isToday ? 'bg-pink-50 ring-2 ring-pink-500' : 'bg-white hover:bg-pink-50/30'}`}>
              <span className={`text-sm font-black ${isToday ? 'text-pink-600' : 'text-slate-400'}`}>{day}</span>
              <div className="mt-2 flex flex-col gap-1">
                {dayTasks.map(t => (
                  <div key={t.id} className="w-full h-1.5 rounded-full bg-pink-500" title={t.title}></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl p-10 rounded-[4rem] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 border border-pink-100">
             <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-slate-900">Broadcast Task</h3>
                <button onClick={() => setShowTaskForm(false)} className="text-pink-400 text-2xl">✕</button>
             </div>
             <form onSubmit={handleAddTask} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" required className="px-6 py-4 bg-pink-50 rounded-2xl font-bold" value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} />
                  <select className="px-6 py-4 bg-pink-50 rounded-2xl font-bold" value={newTask.targetGrade} onChange={e => setNewTask({...newTask, targetGrade: e.target.value})}>
                    {['9', '10', '11', '12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
                <input type="text" required placeholder="Task Title" className="w-full px-6 py-4 bg-pink-50 rounded-2xl font-bold" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                <textarea required placeholder="Instructions" className="w-full px-6 py-4 bg-pink-50 rounded-2xl font-bold min-h-[120px]" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                <button type="submit" className="w-full py-5 bg-pink-600 text-white font-black uppercase rounded-3xl shadow-xl shadow-pink-100">Broadcast to Selected Grade</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Presentation View (With AI Autofill) ---
const PresentationView = ({ currentUser, onExit }: { currentUser: User, onExit: () => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [activePres, setActivePres] = useState<Presentation | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [config, setConfig] = useState({ topic: '', objective: '', numSlides: 5, concepts: '', grade: currentUser.grade || '10' });

  const handleAutofill = async () => {
    if (!config.topic.trim()) return alert("Enter topic");
    setIsAutofilling(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Topic: ${config.topic}, Grade: ${config.grade}. Suggest learning objective and core concepts. JSON format: {objective, concepts}.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      // Fix: Access .text property directly
      const data = JSON.parse(response.text || '{}');
      setConfig(prev => ({ ...prev, objective: data.objective || '', concepts: data.concepts || '' }));
    } catch (e) { console.error(e); } finally { setIsAutofilling(false); }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Create ${config.numSlides} educational slides. Topic: ${config.topic}. Grade: ${config.grade}. Obj: ${config.objective}. JSON: {topic, slides: [{title, content: [], notes}]}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      // Fix: Access .text property directly
      const data = JSON.parse(response.text || '{}');
      const slidesWithImages = await Promise.all(data.slides.map(async (s: any) => ({ ...s, imageUrl: await generateSlideImage(s.title + " " + config.topic) || undefined })));
      const pres = { id: 'p-'+Date.now(), topic: data.topic, slides: slidesWithImages, createdAt: new Date().toISOString() };
      await db.addPresentation(pres);
      setActivePres(pres);
    } catch (e) { alert("Error generating"); } finally { setIsGenerating(false); }
  };

  if (activePres) {
    const slide = activePres.slides[currentSlide];
    return (
      <div className="h-full flex flex-col space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-pink-100">
           <button onClick={() => setActivePres(null)} className="text-xs font-black text-slate-400 uppercase">← Configuration</button>
           <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Slide {currentSlide + 1} / {activePres.slides.length}</span>
           <button onClick={onExit} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase">Close</button>
        </div>
        <div className="flex-1 grid lg:grid-cols-4 gap-6">
           <div className="lg:col-span-3 bg-white rounded-[4rem] border border-pink-100 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex-1 p-20 flex flex-col justify-center">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-10">{slide.title}</h2>
                <ul className="space-y-6">
                  {slide.content.map((c, i) => (
                    <li key={i} className="flex gap-4 text-xl font-bold text-slate-600 items-start">
                      <div className="w-2.5 h-2.5 bg-pink-500 rounded-full mt-2.5 flex-shrink-0"></div>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-pink-50 flex justify-between">
                <button disabled={currentSlide === 0} onClick={() => setCurrentSlide(s => s - 1)} className="px-8 py-3 bg-white rounded-2xl font-black uppercase text-xs border border-pink-200 disabled:opacity-30">Prev</button>
                <button disabled={currentSlide === activePres.slides.length - 1} onClick={() => setCurrentSlide(s => s + 1)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs disabled:opacity-30">Next</button>
              </div>
           </div>
           <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white/90 shadow-xl">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Presenter Context</h4>
                 <p className="text-sm font-medium leading-relaxed italic">"{slide.notes}"</p>
              </div>
              {slide.imageUrl && <img src={slide.imageUrl} className="w-full rounded-[2.5rem] border-4 border-white shadow-xl" alt="AI Asset" />}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">AI Slide <span className="text-pink-600">Architect</span></h2>
        <p className="text-slate-500 font-medium">Engineer grade-specific curriculum decks in seconds.</p>
      </div>
      <div className="bg-white p-12 rounded-[4rem] border border-pink-100 shadow-2xl space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic</label>
            <button onClick={handleAutofill} disabled={isAutofilling} className="text-[10px] font-black text-pink-500 uppercase">✨ Autofill</button></div>
            <input type="text" className="w-full px-6 py-4 bg-pink-50 rounded-2xl font-bold outline-none" placeholder="e.g. Modern Biology" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</label>
            <select className="w-full px-6 py-4 bg-pink-50 rounded-2xl font-bold outline-none" value={config.grade} onChange={e => setConfig({...config, grade: e.target.value})}>
              {['9', '10', '11', '12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
        </div>
        <input type="text" placeholder="Objective" className="w-full px-6 py-4 bg-pink-50 rounded-2xl font-bold" value={config.objective} onChange={e => setConfig({...config, objective: e.target.value})} />
        <div className="grid grid-cols-3 gap-6">
           <input type="number" min="1" max="15" className="px-6 py-4 bg-pink-50 rounded-2xl font-bold" value={config.numSlides} onChange={e => setConfig({...config, numSlides: parseInt(e.target.value) || 5})} />
           <input type="text" placeholder="Core Concepts" className="col-span-2 px-6 py-4 bg-pink-50 rounded-2xl font-bold" value={config.concepts} onChange={e => setConfig({...config, concepts: e.target.value})} />
        </div>
        <button onClick={handleGenerate} disabled={isGenerating || !config.topic} className="w-full py-6 bg-slate-900 text-white font-black uppercase rounded-3xl shadow-xl hover:bg-pink-600 transition-all">
          {isGenerating ? 'Synthesizing Decks...' : 'Generate full Deck'}
        </button>
      </div>
    </div>
  );
};

// --- Cloud Resources Management ---
const ResourcesView = ({ user, searchQuery }: { user: User, searchQuery: string }) => {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [trafficLoad, setTrafficLoad] = useState(12);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadResources = async () => {
    const r = await db.getResources();
    setItems(r);
  };

  useEffect(() => { 
    loadResources();
    const interval = setInterval(() => setTrafficLoad(Math.floor(Math.random() * 20) + 10), 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let base = items;
    if (user.role === UserRole.STUDENT) {
      base = base.filter(r => r.grade === user.grade);
    } else if (user.role === UserRole.TEACHER) {
      base = base.filter(r => user.assignedGrades?.includes(r.grade));
    }
    const q = searchQuery.toLowerCase().trim();
    return q ? base.filter(r => r.title.toLowerCase().includes(q)) : base;
  }, [items, searchQuery, user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const resource: ResourceItem = {
        id: 'cloud-' + Date.now(),
        title: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 'Doc',
        subject: 'Cloud Upload',
        grade: user.role === UserRole.STUDENT ? (user.grade || '10') : (user.assignedGrades?.[0] || '10'),
        author: user.name,
        authorId: user.id,
        url: base64
      };
      await db.addResource(resource);
      await loadResources();
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-700 to-pink-800 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex justify-between items-center">
        <div className="relative z-10">
          <h3 className="text-4xl font-black mb-2 tracking-tighter">Cloud Repository</h3>
          <p className="opacity-80 font-bold">Secure, global CDN-powered learning assets.</p>
        </div>
        <div className="text-right space-y-2 relative z-10">
           <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Traffic Load</div>
           <div className="flex items-center gap-4">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${trafficLoad}%` }}></div>
              </div>
              <span className="font-black text-xl">{trafficLoad} Gbps</span>
           </div>
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      {(user.role !== UserRole.STUDENT) && (
        <div className="bg-white p-8 rounded-[3rem] border border-pink-100 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl">☁️</div>
            <div>
              <h4 className="font-black text-slate-900">Upload to Primary Bucket</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Supports PDF, Video, Scorm Packages</p>
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-pink-600 transition-all shadow-xl">
             {isUploading ? 'Encrypting & Syncing...' : 'Upload Asset'}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(r => (
          <div key={r.id} className="bg-white p-10 rounded-[4rem] border border-pink-100 shadow-xl hover:-translate-y-2 transition-all group">
            <div className="flex justify-between items-start mb-10">
               <div className="px-4 py-2 bg-pink-50 text-pink-600 rounded-xl font-black text-[10px] uppercase">{r.type}</div>
               <div className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">Grade {r.grade}</div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{r.title}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Vaulted by {r.author}</p>
            <button 
              onClick={() => {
                if(r.url.startsWith('data:')) {
                   const win = window.open();
                   win?.document.write(`<iframe src="${r.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                } else {
                   window.open(r.url, '_blank');
                }
              }} 
              className="w-full py-4 bg-pink-50 text-slate-900 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-900 hover:text-white transition-all shadow-sm"
            >
              Secure Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Implementation ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);

  const handleLogin = (role: UserRole) => {
    const found = DIRECTORY.find(u => u.role === role);
    if (found) setUser(found);
    else setUser({ id: 'u-' + role, name: role, role, email: `${role.toLowerCase()}@meru.edu`, assignedGrades: ['9','10','11','12'], grade: role === UserRole.STUDENT ? '10' : undefined });
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview': return (
        <div className="space-y-12 animate-in fade-in duration-1000">
           <div className="bg-gradient-to-br from-indigo-700 to-pink-900 p-20 rounded-[5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
              <h3 className="text-xl font-black text-pink-300 uppercase tracking-widest mb-6">Cloud Command Platform</h3>
              <h2 className="text-8xl font-black tracking-tighter mb-10 leading-none">Welcome, {user!.name}</h2>
              <div className="flex gap-4">
                 <button onClick={() => setCurrentView('tools')} className="px-10 py-5 bg-white text-pink-600 font-black uppercase text-xs rounded-2xl shadow-xl transition-all">Launch AI Tools</button>
                 <button onClick={() => setCurrentView('resources')} className="px-10 py-5 bg-pink-500/30 border border-white/20 text-white font-black uppercase text-xs rounded-2xl transition-all">Cloud Bucket</button>
              </div>
           </div>
           <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-white p-12 rounded-[4.5rem] border border-pink-100 shadow-xl">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Security Context</h4>
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 font-black text-3xl">{user!.name[0]}</div>
                    <div>
                       <div className="text-3xl font-black text-slate-900 leading-tight">{user!.role}</div>
                       <div className="text-xs font-black text-pink-400 uppercase tracking-widest mt-1">
                          {user!.role === UserRole.STUDENT ? `Grade ${user!.grade}` : `Scopes: ${(user!.assignedGrades || []).join(', ')}`}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="bg-white p-12 rounded-[4.5rem] border border-pink-100 shadow-xl flex items-center justify-center">
                 <div className="text-center">
                    <div className="text-emerald-500 font-black text-6xl mb-2">Secure</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TLS 1.3 Encryption Active</div>
                 </div>
              </div>
           </div>
        </div>
      );
      case 'directory': return <DirectoryView currentUser={user!} />;
      case 'calendar': return <CalendarView user={user!} />;
      case 'resources': return <ResourcesView user={user!} searchQuery={searchQuery} />;
      case 'presentation': return <PresentationView currentUser={user!} onExit={() => setCurrentView('overview')} />;
      case 'knowledge-base': return (
        <div className="max-w-4xl mx-auto py-10 animate-in fade-in">
           <h2 className="text-5xl font-black text-slate-900 text-center mb-10 tracking-tighter">Institutional Oracle</h2>
           <div className="bg-white p-12 rounded-[4rem] border border-pink-100 shadow-2xl space-y-8">
              <input type="text" placeholder="Query the school's global knowledge bucket..." className="w-full px-8 py-6 bg-pink-50 rounded-[2.5rem] font-bold text-xl outline-none" />
              <button className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-widest rounded-3xl shadow-xl">Consult AI Oracle</button>
           </div>
        </div>
      );
      case 'tools': return (
        <div className="grid md:grid-cols-3 gap-10 animate-in fade-in">
           {AI_TOOLS.filter(t => t.roles.includes(user!.role)).map(tool => (
             <button key={tool.id} onClick={() => tool.id === 'presentation-gen' ? setCurrentView('presentation') : setSelectedTool(tool)} className="p-12 bg-white border border-pink-100 rounded-[4rem] text-left hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-10 shadow-lg ${tool.color}`}>{tool.icon}</div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-none">{tool.title}</h3>
                <p className="text-slate-500 font-medium mb-12 leading-relaxed text-sm opacity-80">{tool.description}</p>
                <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{tool.category}</span><div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-slate-400 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">→</div></div>
             </button>
           ))}
        </div>
      );
      default: return <div>Under Construction</div>;
    }
  };

  if (!user) return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6 font-inter">
      <div className="w-full max-w-xl bg-white p-20 rounded-[5rem] shadow-2xl border border-white text-center space-y-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-indigo-500 to-pink-500"></div>
        <div className="flex flex-col items-center gap-6"><Icons.Logo className="w-24 h-24 shadow-2xl" /><h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">EduSphere Command Platform</h2></div>
        <div className="grid grid-cols-2 gap-6 relative z-10">
          {[UserRole.TEACHER, UserRole.STUDENT, UserRole.ADMIN, UserRole.PRINCIPAL].map(role => (
            <button key={role} onClick={() => handleLogin(role)} className="p-10 bg-pink-50 border border-pink-100 rounded-[3rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all hover:scale-105 shadow-sm">{role}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout user={user} onLogout={() => setUser(null)} activeRole={user.role} currentView={currentView} onViewChange={(v) => { setCurrentView(v); setSearchQuery(''); }}>
      <div className="max-w-7xl mx-auto pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 print:hidden">
          <div><h2 className="text-7xl font-black text-slate-900 tracking-tighter capitalize">{currentView.replace('-', ' ')}</h2><p className="text-pink-400 font-black text-xs uppercase tracking-[0.4em] mt-3">Advanced Cloud Node v4.2</p></div>
          {(currentView === 'tools' || currentView === 'resources') && (
            <div className="relative group">
              <Icons.Search className="w-6 h-6 absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600 transition-colors" />
              <input type="text" placeholder={`Search global index...`} className="pl-20 pr-10 py-6 border border-pink-200 rounded-[2rem] w-[28rem] shadow-2xl focus:ring-8 focus:ring-pink-50 outline-none font-bold text-slate-900 transition-all text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          )}
        </div>
        {renderView()}
      </div>
      <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
    </Layout>
  );
};

export default App;
