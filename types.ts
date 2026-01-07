
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PRINCIPAL = 'PRINCIPAL',
  ADMIN = 'ADMIN'
}

export type ViewType = 'overview' | 'tools' | 'resources' | 'calendar' | 'directory' | 'reports' | 'database' | 'presentation' | 'knowledge-base' | 'lesson-planner';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  department?: string;
  grade?: string; // For Students
  assignedGrades?: string[]; // For Teachers/Principals/Admins
}

export interface Slide {
  title: string;
  content: string[];
  notes: string;
  imageUrl?: string;
}

export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'flip';

export interface Presentation {
  id: string;
  topic: string;
  slides: Slide[];
  createdAt: string;
  transition?: TransitionType;
}

export interface LessonPlan {
  id: string;
  topic: string;
  subject: string;
  grade: string;
  duration: string;
  objectives: string[];
  standards: string[];
  sections: {
    title: string;
    content: string;
    duration?: string;
  }[];
  assessment: string;
  differentiation: string;
}

export interface AITool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  roles: UserRole[];
  promptTemplate: string;
  color: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Link' | 'Doc';
  subject: string;
  grade: string; // The grade this resource belongs to
  author: string;
  authorId: string;
  url: string;
  textContent?: string; // For RAG processing
}

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  studentsCount: number;
  progress: number;
}

export interface CalendarTask {
  id: string;
  title: string;
  description: string;
  subject: string;
  date: string; // ISO string YYYY-MM-DD
  assignedBy: string;
  assignedById: string;
  targetGrade: string;
  type: 'Task' | 'Exam' | 'Project';
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  type: 'Academic' | 'Holiday' | 'Sports' | 'Meeting';
  description: string;
}

export interface AppDatabase {
  users: User[];
  resources: ResourceItem[];
  events: SchoolEvent[];
  courses: Course[];
  tools: AITool[];
  presentations: Presentation[];
  tasks: CalendarTask[];
  lessonPlans: LessonPlan[];
}
