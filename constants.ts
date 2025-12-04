
import { User, Feedback, Suggestion, Appointment, ChartData, PeerTutor, Session, Instructor, FullTimetable, Notification, TutorRequest, AdminStat } from './types';
import { LayoutDashboard, BookOpen, MessageSquare, Calendar, Users, BarChart2, Star, Shield, Building2, UserCircle, Award } from 'lucide-react';

export const MOCK_USER_STUDENT: User = {
  id: 's1',
  name: 'Liam Grayson',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  email: 'liam.g@scholarx.edu',
  program: 'Computer Science',
  year: 'Year 3',
  phone: '+1 (555) 012-3456',
  bio: 'Computer Science student passionate about AI and Web Development.'
};

export const INSTRUCTOR_BADGES = [
  { name: 'Novice Educator', threshold: 0, color: 'text-slate-400', bg: 'bg-slate-500/20' },
  { name: 'Mentorship Star', threshold: 1000, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  { name: 'Scholar Guide', threshold: 2500, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  { name: 'Master Teacher', threshold: 5000, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { name: 'Academic Legend', threshold: 10000, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
];

export const MOCK_USER_INSTRUCTOR: Instructor = {
  id: 'i1',
  name: 'Dieudonne, U.',
  role: 'instructor',
  title: 'Professor',
  department: 'Economics',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  rating: 4.8,
  availableSlots: 4,
  specialty: 'Managerial Economics',
  teachingYears: ['Year 1', 'Year 3'],
  email: 'dieudonne@scholarx.edu',
  phone: '078-555-0101',
  bio: 'Expert in Macroeconomics and Policy.',
  points: 2450,
  badge: 'Mentorship Star'
};

export const MOCK_USER_TUTOR: User = {
  id: 't1',
  name: 'Sarah Chen',
  role: 'tutor',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  email: 'sarah.c@scholarx.edu',
  program: 'Data Science',
  points: 12500,
  phone: '+1 (555) 123-4567',
  year: 'Year 3'
};

export const MOCK_USER_ADMIN: User = {
  id: 'a1',
  name: 'Admin User',
  role: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6d28d9&color=fff',
  email: 'admin@scholarx.edu'
};

export const MOCK_PEER_TUTORS: PeerTutor[] = [
  { id: 't1', name: 'Sarah Chen', role: 'tutor', program: 'Data Science', year: 'Year 3', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', badge: 'Gold', stars: 5.8, phone: '+1 (555) 123-4567', points: 12500, expertise: ['Python', 'Statistics', 'React'], bio: 'I love helping students master data structures!' },
  { id: 't2', name: 'Marcus Johnson', role: 'tutor', program: 'Physics', year: 'Year 2', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', badge: 'Silver', stars: 5.2, phone: '+1 (555) 234-5678', points: 6200, expertise: ['Mechanics', 'Thermodynamics'], bio: 'Physics enthusiast helping with core concepts.' },
  { id: 't3', name: 'Emily Davis', role: 'tutor', program: 'Literature', year: 'Year 4', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', badge: 'Bronze', stars: 4.9, phone: '+1 (555) 345-6789', points: 2100, expertise: ['Essay Writing', 'Analysis'], bio: 'Can help review your final papers.' },
  { id: 't4', name: 'David Kim', role: 'tutor', program: 'Mathematics', year: 'Year 2', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', badge: 'Silver', stars: 5.5, phone: '+1 (555) 456-7890', points: 5400, expertise: ['Calculus', 'Algebra'], bio: 'Math doesn\'t have to be hard.' },
  { id: 't5', name: 'Jessica Wong', role: 'tutor', program: 'Biology', year: 'Year 3', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', badge: 'Gold', stars: 5.9, phone: '+1 (555) 567-8901', points: 15000, expertise: ['Genetics', 'Cell Bio'], bio: 'Ace your biology exams with me.' },
];

export const MOCK_INSTRUCTORS: Instructor[] = [
  { id: 'i1', name: 'Dieudonne, U.', role: 'instructor', title: 'Professor', department: 'Economics', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', rating: 4.8, availableSlots: 4, specialty: 'Managerial Economics', teachingYears: ['Year 1', 'Year 3'], email: 'dieudonne@scholarx.edu', phone: '078-555-0101', bio: 'Expert in Macroeconomics and Policy.', points: 2450, badge: 'Mentorship Star' },
  { id: 'i2', name: 'Jean Claude, S.', role: 'instructor', title: 'Senior Lecturer', department: 'Supply Chain', avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', rating: 5.7, availableSlots: 2, specialty: 'Procurement', teachingYears: ['Year 2'], email: 'jc.supply@scholarx.edu', phone: '078-555-0102', bio: 'Focus on global supply chain logistics.', points: 5200, badge: 'Master Teacher' },
  { id: 'i3', name: 'Dr. Sam, B.', role: 'instructor', title: 'Associate Prof', department: 'Project Mgmt', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', rating: 6.0, availableSlots: 1, specialty: 'Strategic Mgmt', teachingYears: ['Year 1', 'Year 3'], email: 'sam.b@scholarx.edu', phone: '078-555-0103', bio: 'Strategic project planning and execution.', points: 8900, badge: 'Master Teacher' },
  { id: 'i4', name: 'Genevieve, U.', role: 'instructor', title: 'Lab Instructor', department: 'Marketing', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', rating: 5.5, availableSlots: 8, specialty: 'Principles of Marketing', teachingYears: ['Year 1'], email: 'genevieve@scholarx.edu', phone: '078-555-0104', bio: 'Digital marketing enthusiast.', points: 1200, badge: 'Mentorship Star' },
];

export const MOCK_SESSIONS: Session[] = [
  { id: 'ses1', tutorId: 't1', tutorName: 'Sarah Chen', subject: 'Python Basics', date: '2025-10-25 14:00', status: 'completed', feedbackGiven: false, type: 'peer', missedFeedback: true },
  { id: 'ses2', tutorId: 'i2', tutorName: 'Jean Claude, S.', subject: 'Supply Chain Review', date: '2025-10-26 10:00', status: 'upcoming', feedbackGiven: false, type: 'instructor', concern: 'I dont understand the new logistics model.' },
  { id: 'ses3', tutorId: 't3', tutorName: 'Emily Davis', subject: 'Essay Review', date: '2025-10-24 16:00', status: 'completed', feedbackGiven: true, type: 'peer' },
  { id: 'ses4', tutorId: 'i1', tutorName: 'Dieudonne, U.', subject: 'Econ Graphs Help', date: '2025-10-28 11:30', status: 'pending', feedbackGiven: false, type: 'instructor', concern: 'Struggling with elasticity concepts.' },
];

export const MOCK_TUTOR_REQUESTS: TutorRequest[] = [
  { id: 'req1', tutorId: 't1', tutorName: 'Sarah Chen', studentName: 'Alex Mercer', studentAvatar: 'https://i.pravatar.cc/150?u=alex', requestTime: '10m ago', subject: 'Data Science 101', date: '2025-11-02 10:00', status: 'pending', feedbackGiven: false, type: 'peer', concern: 'Need help with Pandas library' },
  { id: 'req2', tutorId: 't1', tutorName: 'Sarah Chen', studentName: 'Jordan Lee', studentAvatar: 'https://i.pravatar.cc/150?u=jordan', requestTime: '1h ago', subject: 'Python Scripting', date: '2025-11-03 14:00', status: 'pending', feedbackGiven: false, type: 'peer', concern: 'Debugging assignment code' },
];

export const MOCK_INSTRUCTOR_FEEDBACK: Feedback[] = [
  { id: 'f1', studentName: 'Alice M.', rating: 6, comment: 'The way you explained neural networks was amazing! Finally clicked.', isAnonymous: false, timestamp: '2h ago', category: 'thankful', cohort: 'BAPM_2025', section: 'Section_A', program: 'BAPM' },
  { id: 'f2', studentName: 'Anonymous', rating: 3, comment: 'I am struggling to keep up with the Python syntax in labs.', isAnonymous: true, timestamp: '5h ago', category: 'struggling', cohort: 'BAPM_2025', section: 'Section_B', program: 'BAPM' },
  { id: 'f3', studentName: 'John D.', rating: 2, comment: 'The assignment instructions were very unclear and conflicting.', isAnonymous: false, timestamp: '1d ago', category: 'critical', cohort: 'SNHU_2025', section: 'Section_A', program: 'SNHU' },
  { id: 'f4', studentName: 'Sarah L.', rating: 6, comment: 'Loved the guest speaker today. Very inspiring!', isAnonymous: false, timestamp: '1d ago', category: 'thankful', cohort: 'BAPM_2025', section: 'Section_A', program: 'BAPM' },
  { id: 'f5', studentName: 'Anonymous', rating: 4, comment: 'Can we have more practice problems for the exam?', isAnonymous: true, timestamp: '2d ago', category: 'struggling', cohort: 'BsBA_2025', section: 'Section_C', program: 'BsBA' },
  { id: 'f6', studentName: 'Mike T.', rating: 5, comment: 'Great pace, but the room was too cold.', isAnonymous: false, timestamp: '2d ago', category: 'uncategorized', cohort: 'BAPM_2025', section: 'Section_A', program: 'BAPM' },
];

export const DEPARTMENTS = [
  'IT Support',
  'Dining Services',
  'Administration',
  'Library',
  'Housing',
  'Financial Aid'
];

export const NAV_ITEMS = {
  student: [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'sessions', label: 'Sessions', icon: BookOpen },
    { id: 'schedule', label: 'Appointments', icon: Calendar },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'suggestions', label: 'Suggestions', icon: Building2 },
  ],
  tutor: [
    { id: 'dashboard', label: 'Tutor Hub', icon: LayoutDashboard },
    { id: 'requests', label: 'Help Requests', icon: BookOpen },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'rewards', label: 'Badges & Points', icon: Star },
  ],
  instructor: [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'feedback', label: 'Analytics', icon: BarChart2 },
    { id: 'schedule', label: 'Sessions', icon: Calendar },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ],
  department: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'suggestions', label: 'Inbox', icon: Building2 },
    { id: 'analytics', label: 'Reports', icon: BarChart2 },
  ],
  admin: [
    { id: 'dashboard', label: 'Master View', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'reports', label: 'Global Analytics', icon: BarChart2 },
  ],
};

export const ANALYTICS_DATA: ChartData[] = [
  { name: 'Mon', value: 24, value2: 12 },
  { name: 'Tue', value: 18, value2: 28 },
  { name: 'Wed', value: 32, value2: 15 },
  { name: 'Thu', value: 45, value2: 38 },
  { name: 'Fri', value: 28, value2: 42 },
  { name: 'Sat', value: 15, value2: 20 },
  { name: 'Sun', value: 10, value2: 8 },
];

export const ADMIN_STATS: AdminStat[] = [
  { label: 'Total Users', value: 24500, change: '+12%', trend: 'up' },
  { label: 'Active Sessions', value: 142, change: '+5%', trend: 'up' },
  { label: 'Feedback Sat.', value: '94%', change: '-1%', trend: 'down' },
  { label: 'Reports', value: 15, change: '0%', trend: 'neutral' },
];

export const RECENT_SUGGESTIONS: Suggestion[] = [
  { id: '1', department: 'Dining Services', subject: 'More vegan options', message: 'The cafeteria needs better plant-based protein.', status: 'pending', authorId: 's1' },
  { id: '2', department: 'IT Support', subject: 'Slow WiFi in Library', message: 'Connection drops every 10 mins on 3rd floor.', status: 'in-progress', authorId: 's2' },
  { id: '3', department: 'Administration', subject: 'Exam Schedule', message: 'Finals are too close together.', status: 'resolved', authorId: 's3' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'New Appointment', message: 'Liam G. booked a slot for "Econ Graphs Help"', type: 'info', time: '10m ago', read: false, actionLabel: 'View' },
  { id: 'n2', title: 'Feedback Alert', message: '3 students marked "Struggling" in BAPM_2023', type: 'alert', time: '1h ago', read: false, actionLabel: 'Check Class' },
  { id: 'n3', title: 'Admin Message', message: 'Please review the new grading policy.', type: 'info', time: '2h ago', read: true, actionLabel: 'Reply' },
];

export const REAL_TIMETABLE_DATA: FullTimetable = {
  "Term_1_AY_2025/2026_Timetable": {
    "BAPM_2023_Section_A": {
      "Monday": {},
      "Tuesday": {
        "Session 1": { "Course": "Managerial Economics", "Instructor": "Dieudonne, U.", "Classroom": "Nyanza Classroom", "Type": "Lecture", "Time": "9:00-10:00" },
        "Session 2": { "Course": "Project Procurement and Supply Chain Management", "Instructor": "Jean Claude, S.", "Classroom": "Gasabo Classroom", "Type": "Lecture", "Time": "10:30-12:30" },
        "Session 3": { "Course": "Capstone II: Strategic Project Management", "Instructor": "Dr. Sam, B.", "Classroom": "Kirehe Classroom", "Type": "Lecture", "Time": "14:00-16:00" },
        "Session 4": { "Course": "Project Procurement and Supply Chain Management", "Instructor": "Jean Claude, S.", "Classroom": "N/A", "Type": "Office Hours", "Time": "16:15-17:15" }
      },
      "Thursday": {
        "Session 1": { "Course": "Managerial Economics", "Instructor": "Dieudonne, U.", "Classroom": "Gasabo Classroom", "Type": "Lecture", "Time": "8:00-10:00" },
        "Session 3": { "Course": "Project Procurement and Supply Chain Management", "Instructor": "Jean Claude, S.", "Classroom": "Rubavu Classroom", "Type": "Lecture", "Time": "14:00-16:00" }
      },
      "Friday": {
        "Session 2": { "Course": "Managerial Economics", "Instructor": "Dieudonne, U.", "Classroom": "Kayonza Classroom", "Type": "Office Hours", "Time": "11:30-12:30" }
      }
    },
    "BAPM_2025_Section_A": {
      "Monday": {
        "Session 2": { "Course": "Organizational Behavior", "Instructor": "Moses, M.", "Classroom": "Karongi Classroom", "Type": "Lecture", "Time": "10:30-12:30" }
      }
    }
  }
} as any; 

export const PEER_TUTOR_LEADERBOARD = [
  { id: '1', name: 'Sarah Chen', points: 12500, badge: 'Gold', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', subject: 'Data Science' },
  { id: '2', name: 'Marcus Johnson', points: 9200, badge: 'Silver', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', subject: 'Physics' },
];
