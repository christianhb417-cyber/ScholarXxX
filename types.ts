
export type Role = 'student' | 'tutor' | 'instructor' | 'admin' | 'department';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  department?: string; // For department heads
  points?: number; // For tutors/instructors
  email?: string;
  phone?: string;
  program?: string;
  year?: string;
  bio?: string;
}

export interface PeerTutor {
  id: string;
  name: string;
  role: 'tutor';
  program: string;
  year: string; // e.g., "Year 3"
  avatar: string;
  badge: 'Gold' | 'Silver' | 'Bronze';
  stars: number;
  phone: string;
  points: number;
  expertise: string[]; // e.g., ["Python", "Calculus"]
  bio: string;
}

export interface Instructor {
  id: string;
  name: string;
  role: 'instructor';
  title: string;
  department: string;
  avatar: string;
  rating: number; // Hidden from students
  availableSlots: number;
  specialty: string;
  teachingYears: string[]; // e.g., ["Year 1", "Year 2"]
  email: string;
  phone: string;
  bio: string;
  points: number; // New gamification field
  badge: string;  // New gamification field
}

export interface Session {
  id: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  date: string;
  status: 'completed' | 'upcoming' | 'cancelled' | 'pending';
  feedbackGiven: boolean;
  type: 'peer' | 'instructor';
  concern?: string; // Reason for appointment
  missedFeedback?: boolean; // If true, show alert
}

export interface ManagedSession {
  id: string;
  cohort: string;
  date: string;
  time: string;
  comment: string;
  targetStudents: string[];
  status: 'scheduled' | 'feedback-pending' | 'completed';
  feedbackCollected: boolean;
}

export interface TutorRequest extends Session {
  studentName: string;
  studentAvatar: string;
  requestTime: string;
}

export type FeedbackCategory = 'thankful' | 'struggling' | 'critical' | 'uncategorized';

export interface Feedback {
  id: string;
  instructorName?: string; // Optional if viewing from instructor side
  studentName?: string; // For instructor view
  rating: number; // 1-6
  comment: string;
  isAnonymous: boolean;
  timestamp: string;
  category: FeedbackCategory; // Smart detection result
  cohort?: string;
  program?: string;
  section?: string;
}

export interface Suggestion {
  id: string;
  department: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved';
  authorId: string;
}

export interface Appointment {
  id: string;
  withUser: string;
  role: string; // 'Instructor' or 'Peer Tutor'
  time: string;
  date: string;
  status: 'confirmed' | 'pending';
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
  color?: string;
}

// New Types for JSON Timetable Integration
export interface TimetableSession {
  Course: string;
  Instructor: string;
  Classroom: string;
  Type: string;
  Time: string;
}

export interface DaySchedule {
  [sessionKey: string]: TimetableSession;
}

export interface SectionSchedule {
  [day: string]: DaySchedule;
}

export interface FullTimetable {
  [sectionName: string]: SectionSchedule;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  time: string;
  read: boolean;
  actionLabel?: string;
}

export interface AdminStat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}
