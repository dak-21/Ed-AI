
import { AppDatabase, User, ResourceItem, SchoolEvent, AITool, UserRole, Course, Presentation, CalendarTask, LessonPlan } from '../types';
import { AI_TOOLS, RESOURCES, EVENTS, DIRECTORY } from '../constants';

const DB_KEY = 'edusphere_db_v4';

const INITIAL_DATA: AppDatabase = {
  users: DIRECTORY,
  resources: RESOURCES,
  events: EVENTS,
  tools: AI_TOOLS,
  presentations: [],
  tasks: [],
  lessonPlans: [],
  courses: [
    { id: 'c1', name: 'Advanced Physics', code: 'PHY-401', instructor: 'Dr. Tellapur', studentsCount: 45, progress: 65 },
  ]
};

export const db = {
  init: (): AppDatabase => {
    const existing = localStorage.getItem(DB_KEY);
    if (!existing) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(existing);
  },

  getRaw: (): AppDatabase => {
    return JSON.parse(localStorage.getItem(DB_KEY) || JSON.stringify(INITIAL_DATA));
  },

  saveRaw: (data: AppDatabase) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    const data = db.getRaw();
    data.users = data.users.map(u => u.id === userId ? { ...u, ...updates } : u);
    db.saveRaw(data);
    return data.users.find(u => u.id === userId);
  },

  addPresentation: async (presentation: Presentation) => {
    const data = db.getRaw();
    if (!data.presentations) data.presentations = [];
    data.presentations.unshift(presentation);
    db.saveRaw(data);
  },

  addLessonPlan: async (plan: LessonPlan) => {
    const data = db.getRaw();
    if (!data.lessonPlans) data.lessonPlans = [];
    data.lessonPlans.unshift(plan);
    db.saveRaw(data);
  },

  getPresentations: async (): Promise<Presentation[]> => {
    return db.getRaw().presentations || [];
  },

  addResource: async (resource: ResourceItem) => {
    const data = db.getRaw();
    data.resources.unshift(resource);
    db.saveRaw(data);
  },

  deleteResource: async (id: string) => {
    const data = db.getRaw();
    data.resources = data.resources.filter(r => r.id !== id);
    db.saveRaw(data);
  },

  getTasks: async (): Promise<CalendarTask[]> => {
    return db.getRaw().tasks || [];
  },

  addTask: async (task: CalendarTask) => {
    const data = db.getRaw();
    if (!data.tasks) data.tasks = [];
    data.tasks.push(task);
    db.saveRaw(data);
  },

  getResources: async (): Promise<ResourceItem[]> => {
    return db.getRaw().resources;
  },

  getEvents: async (): Promise<SchoolEvent[]> => {
    return db.getRaw().events;
  },

  getCourses: async (): Promise<Course[]> => {
    return db.getRaw().courses;
  },

  getUsers: async (): Promise<User[]> => {
    return db.getRaw().users;
  }
};

db.init();
