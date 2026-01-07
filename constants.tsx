
import { UserRole, AITool, ResourceItem, SchoolEvent, User, Course } from './types';

export const AI_TOOLS: AITool[] = [
  {
    id: 'presentation-gen',
    title: 'Presentation Generator',
    description: 'Create professional presentations with AI-powered content generation and slide organization.',
    icon: '📊',
    category: 'Teaching',
    roles: [UserRole.TEACHER, UserRole.ADMIN, UserRole.PRINCIPAL],
    promptTemplate: 'presentation-view-trigger', 
    color: 'bg-orange-100 text-orange-700'
  },
  {
    id: 'lesson-plan',
    title: 'Lesson Plan Generator',
    description: 'Create comprehensive lesson plans with learning objectives and activities.',
    icon: '📝',
    category: 'Teaching',
    roles: [UserRole.TEACHER],
    promptTemplate: 'Generate a detailed lesson plan for a grade ${grade} class on the topic: ${topic}. Include objectives, materials, timing, and assessment.',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'quiz-maker',
    title: 'Smart Quiz Builder',
    description: 'Generate MCQ or descriptive quizzes from any text or topic.',
    icon: '❓',
    category: 'Teaching',
    roles: [UserRole.TEACHER],
    promptTemplate: 'Create a 10-question multiple-choice quiz based on this content: ${content}. Provide answers at the end.',
    color: 'bg-indigo-100 text-indigo-700'
  },
  {
    id: 'grading-assistant',
    title: 'Grading Assistant',
    description: 'Get rubric suggestions and feedback drafts for student work.',
    icon: '⚖️',
    category: 'Teaching',
    roles: [UserRole.TEACHER, UserRole.ADMIN],
    promptTemplate: 'Analyze this student response and provide constructive feedback and a suggested grade based on a 1-10 scale: ${response}',
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'study-buddy',
    title: 'Concept Explainer',
    description: 'Break down complex topics into simple, easy-to-understand explanations.',
    icon: '💡',
    category: 'Learning',
    roles: [UserRole.STUDENT],
    promptTemplate: 'Explain the concept of ${concept} in simple terms that a student can understand, with a real-world analogy.',
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'summarizer',
    title: 'Document Summarizer',
    description: 'Get the key takeaways from long notes or articles.',
    icon: '📄',
    category: 'Learning',
    roles: [UserRole.STUDENT, UserRole.TEACHER],
    promptTemplate: 'Summarize the following text into 5 bullet points highlighting the core concepts: ${text}',
    color: 'bg-emerald-100 text-emerald-700'
  }
];

export const RESOURCES: ResourceItem[] = [
  { id: '1', title: 'Calculus Fundamentals', type: 'PDF', subject: 'Math', grade: '12', author: 'Sarah Wilson', authorId: '202', url: '#' },
  { id: '2', title: 'Photosynthesis Lab', type: 'Video', subject: 'Biology', grade: '10', author: 'John Doe', authorId: '201', url: '#' },
  { id: '3', title: 'World War II Timeline', type: 'Doc', subject: 'History', grade: '11', author: 'Michael Chen', authorId: '203', url: '#' },
  { id: '4', title: 'Introduction to Python', type: 'Link', subject: 'Computer Science', grade: '9', author: 'Michael Chen', authorId: '203', url: '#' },
];

export const EVENTS: SchoolEvent[] = [
  { id: '1', title: 'Mid-term Exams', date: '2025-03-15', type: 'Academic', description: 'Annual mid-term examination week for all grades.' },
  { id: '2', title: 'Annual Sports Meet', date: '2025-03-22', type: 'Sports', description: 'Field and track events at the main stadium.' },
];

export const DIRECTORY: User[] = [
  { id: '101', name: 'Dr. Tellapur', role: UserRole.PRINCIPAL, email: 'principal@meru.edu', department: 'Administration', assignedGrades: ['9', '10', '11', '12'] },
  { id: '201', name: 'John Doe', role: UserRole.TEACHER, email: 'jdoe@meru.edu', department: 'Science', assignedGrades: ['10'] },
  { id: '202', name: 'Sarah Wilson', role: UserRole.TEACHER, email: 'swilson@meru.edu', department: 'Mathematics', assignedGrades: ['12'] },
  { id: '203', name: 'Michael Chen', role: UserRole.TEACHER, email: 'mchen@meru.edu', department: 'Computer Science', assignedGrades: ['9', '11'] },
  { id: '301', name: 'Vishwa Karthikeya', role: UserRole.STUDENT, email: 'vishwa@meru.edu', grade: '12', department: 'Senior School' },
  { id: 'admin-1', name: 'System Admin', role: UserRole.ADMIN, email: 'admin@meru.edu', assignedGrades: ['9', '10', '11', '12'] },
];

export const COURSES: Course[] = [
  { id: 'c1', name: 'Advanced Physics', code: 'PHY-401', instructor: 'Dr. Tellapur', studentsCount: 45, progress: 65 },
];
