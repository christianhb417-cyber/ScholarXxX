
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion as m, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { 
  Users, Settings, LogOut, Bell, Search, 
  Send, CheckCircle, Clock, XCircle, Plus, ChevronRight, Menu, ArrowLeft, Filter, Home, BookOpen, Star, Calendar, MessageSquare, LayoutDashboard, BarChart2, Shield, Building2, Phone, Award, MoreVertical, X, Sparkles, GraduationCap, ChevronLeft, Calendar as CalendarIcon, Mic, ThumbsUp, HelpCircle, AlertTriangle, UserCircle, Briefcase, Mail, Check, TrendingUp, TrendingDown, Activity, ChevronRight as ChevronRightIcon, Edit, Monitor, FileText, Lock, Trophy, Zap, MousePointerClick, Upload, RefreshCw, Eye, Timer, Trash2, Database, Server, Power, Download, FileBarChart, Sliders, ToggleLeft, ToggleRight, Save, Play, Pause, Hexagon, Layers, Cpu, Globe
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Logo } from './components/Logo';
import { Counter } from './components/Counter';
import { Role, User, Suggestion, PeerTutor, Session, Instructor, Feedback, FeedbackCategory, FullTimetable, Notification, TutorRequest, AdminStat, ManagedSession, ClassData, TutorRating, SystemAlert, ActivityLog, Department } from './types';
import { NAV_ITEMS, ANALYTICS_DATA, RECENT_SUGGESTIONS, DEPARTMENTS, MOCK_PEER_TUTORS, MOCK_SESSIONS, MOCK_USER_STUDENT, MOCK_INSTRUCTORS, MOCK_INSTRUCTOR_FEEDBACK, MOCK_USER_INSTRUCTOR, REAL_TIMETABLE_DATA, MOCK_NOTIFICATIONS, MOCK_TUTOR_REQUESTS, ADMIN_STATS, MOCK_USER_TUTOR, MOCK_USER_ADMIN, PEER_TUTOR_LEADERBOARD, INSTRUCTOR_BADGES, WEEKLY_POINTS_DATA, MOCK_TUTOR_RATINGS, MOCK_SYSTEM_ALERTS, MOCK_ACTIVITY_FEED, MOCK_DEPARTMENTS } from './constants';

const motion = m as any;

const getInstructorClassesFlattened = (instructorName: string, data: any): ClassData[] => {
  const classes: ClassData[] = [];
  const termKey = "Term_1_AY_2025/2026_Timetable";
  const termData = data[termKey] || {};

  Object.keys(termData).forEach(sectionKey => {
    const parts = sectionKey.split('_');
    const program = parts[0]; 
    const year = parts[1]; 
    const section = parts.slice(2).join(' ');

    Object.keys(termData[sectionKey]).forEach(day => {
      Object.entries(termData[sectionKey][day]).forEach(([sessionKey, session]: [string, any]) => {
        if (session.Instructor && session.Instructor.includes(instructorName.split(',')[0])) { 
           classes.push({ 
             term: "Term 1",
             program,
             year,
             section,
             course: session.Course,
             day,
             time: session.Time,
             classroom: session.Classroom,
             instructor: session.Instructor
           });
        }
      });
    });
  });
  return classes;
};

const isInstructorBusy = (instructorName: string, day: string, time: string, data: any) => {
  const classes = getInstructorClassesFlattened(instructorName, data);
  return classes.some(c => {
      if (c.day !== day) return false;
      const [start, end] = c.time.split('-');
      const startHour = parseInt(start.split(':')[0]);
      const endHour = parseInt(end.split(':')[0]);
      const checkHour = parseInt(time.split(':')[0]);
      return checkHour >= startHour && checkHour < endHour;
  });
};

const getSectionFreeSlots = (section: string, data: any) => {
  const termData = data["Term_1_AY_2025/2026_Timetable"] || {};
  const sectionSchedule = termData[section] || {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const standardSlots = ['08:00-10:00', '10:30-12:30', '14:00-16:00', '16:15-18:15'];
  
  const freeSlots: {day: string, time: string}[] = [];

  days.forEach(day => {
    const daySessions = sectionSchedule[day] ? Object.values(sectionSchedule[day]) : [];
    const busyTimes = daySessions.map((s: any) => s.Time);
    standardSlots.forEach(slot => {
      if (!busyTimes.includes(slot)) {
        freeSlots.push({ day, time: slot });
      }
    });
  });
  return freeSlots;
};

const getInstructorsForCohort = (cohort: string, allInstructors: Instructor[], data: any): Instructor[] => {
  const termData = data["Term_1_AY_2025/2026_Timetable"] || {};
  const sectionSchedule = termData[cohort] || {};
  const cohortInstructors = new Set<string>();

  Object.values(sectionSchedule).forEach((dayData: any) => {
     Object.values(dayData).forEach((session: any) => {
        if (session.Instructor) {
           const namePart = session.Instructor.split(',')[0].trim();
           cohortInstructors.add(namePart);
        }
     });
  });

  return allInstructors.filter(inst => {
     const instNamePart = inst.name.split(',')[0].trim();
     return cohortInstructors.has(instNamePart);
  });
};

const getEligiblePeerTutors = (studentYear: string, allTutors: PeerTutor[]): PeerTutor[] => {
  if (!studentYear) return allTutors;
  const sYear = parseInt(studentYear.replace('Year ', ''));
  return allTutors.filter(t => {
     const tYear = parseInt(t.year.replace('Year ', ''));
     return tYear >= sYear;
  });
};

const getTodaysClasses = (cohort: string, data: any) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const demoDay = (today === 'Saturday' || today === 'Sunday') ? 'Tuesday' : today;
    const termData = data["Term_1_AY_2025/2026_Timetable"] || {};
    const daySchedule = termData[cohort]?.[demoDay] || {};
    return Object.entries(daySchedule).map(([key, session]: [string, any]) => ({
        id: key,
        subject: session.Course,
        tutorName: session.Instructor,
        time: session.Time,
        type: session.Type,
        classroom: session.Classroom,
        date: demoDay
    }));
};

const checkClassTimeStatus = (timeRange: string) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    const [start, end] = timeRange.split('-');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    const startTimeVal = startH * 60 + startM;
    const endTimeVal = endH * 60 + endM;

    if (currentTimeVal < startTimeVal) return 'future';
    if (currentTimeVal >= startTimeVal && currentTimeVal < endTimeVal) return 'live';
    return 'past';
};

const NotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleAction = (id: string, action: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
  };

  return (
    <div className="relative z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
        <Bell className="w-6 h-6 text-slate-400" />
        {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-slate-900" />}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
              <h4 className="font-bold text-white">Notifications</h4>
              <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-xs text-violet-400 hover:text-violet-300">Mark all read</button>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm">No notifications</div> : notifications.map(notif => (
                <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-violet-500/5' : ''}`}>
                   <div className="flex gap-3">
                     <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.type === 'alert' ? 'bg-red-500' : 'bg-violet-500'}`} />
                     <div className="flex-1">
                        <h5 className={`text-sm font-bold ${!notif.read ? 'text-white' : 'text-slate-400'}`}>{notif.title}</h5>
                        <p className="text-xs text-slate-400 mt-1 mb-2">{notif.message}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-600">{notif.time}</span>
                          {notif.actionLabel && (
                            <button onClick={() => handleAction(notif.id, notif.actionLabel!)} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 px-2 py-1 bg-cyan-900/20 rounded">{notif.actionLabel}</button>
                          )}
                        </div>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

const RateSessionModal: React.FC<{ session: any, onClose: () => void }> = ({ session, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(onClose, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative overflow-hidden">
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Rate Session</h3>
                            <p className="text-slate-400 text-sm">How was <span className="text-violet-400 font-bold">{session.subject}</span>?</p>
                            <p className="text-xs text-slate-500 mt-1">Instructor: {session.tutorName}</p>
                        </div>
                        
                        <div className="flex justify-center gap-2">
                            {[1,2,3,4,5,6].map(star => (
                                <button key={star} type="button" onClick={() => setRating(star)} className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-700'}`}>
                                    <Star className="w-8 h-8 fill-current" />
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comments (Optional)</label>
                            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-violet-500 outline-none" placeholder="What went well? What could be improved?"></textarea>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <input type="checkbox" id="anon-rate" className="rounded bg-slate-950 border-white/10"/>
                            <label htmlFor="anon-rate" className="text-xs text-slate-400">Submit Anonymously</label>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 rounded-xl font-bold text-white hover:bg-slate-700">Cancel</button>
                            <button type="submit" disabled={rating === 0} className="flex-1 py-3 bg-violet-600 rounded-xl font-bold text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed">Submit</button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Feedback Sent!</h3>
                        <p className="text-slate-400 text-sm">Thank you for helping us improve.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const UserProfileModal: React.FC<{ user: User | Instructor | PeerTutor, onClose: () => void, onBook: (u: any) => void, onMessage: (u: any) => void }> = ({ user, onClose, onBook, onMessage }) => {
  const isInstructor = 'teachingYears' in user;
  const isTutor = 'points' in user;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} className="bg-slate-900 border border-white/10 rounded-3xl p-0 max-w-lg w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
         <div className="relative h-32 bg-gradient-to-r from-slate-800 to-slate-900">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white"><X className="w-5 h-5"/></button>
         </div>
         <div className="px-8 pb-8 -mt-16">
            <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-slate-900 object-cover shadow-lg mb-4" />
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <p className="text-slate-400">{isInstructor ? (user as Instructor).title : (user as PeerTutor).program}</p>
                  {isInstructor && <p className="text-xs text-violet-400 mt-1 font-bold">{(user as Instructor).department}</p>}
                  {isTutor && <p className="text-xs text-orange-400 mt-1 font-bold">{(user as PeerTutor).year}</p>}
               </div>
               {isTutor && (
                 <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                       <Star className="w-5 h-5 fill-current" />
                       <span className="text-lg font-bold">{(user as PeerTutor).stars}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${(user as PeerTutor).badge === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}`}>{(user as PeerTutor).badge} Badge</span>
                 </div>
               )}
            </div>

            <div className="space-y-6">
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-2 uppercase opacity-70">About</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{(user as any).bio || "Passionate about education and helping others succeed."}</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Details</h4>
                     <ul className="text-sm text-slate-300 space-y-2">
                        {isInstructor && (user as Instructor).teachingYears.map(y => <li key={y} className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-violet-500"/> {y}</li>)}
                        {isTutor && (user as PeerTutor).expertise.map(e => <li key={e} className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-orange-500"/> {e}</li>)}
                     </ul>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Contact</h4>
                     <div className="text-sm text-slate-300 space-y-2">
                        <div className="flex items-center gap-2"><Mail className="w-3 h-3"/> {(user as any).email || "email@scholarx.edu"}</div>
                        <div className="flex items-center gap-2"><Phone className="w-3 h-3"/> {(user as any).phone || "555-0123"}</div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-3 mt-4">
                  <button onClick={() => onMessage(user)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2"><MessageSquare className="w-4 h-4" /> Chat</button>
                  <button onClick={() => onBook(user)} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2"><Calendar className="w-4 h-4" /> Book Session</button>
               </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
};

const EditProfileModal: React.FC<{ user: User, onClose: () => void }> = ({ user, onClose }) => {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
       <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
          <form className="space-y-4">
             <div className="flex flex-col items-center mb-6">
                <img src={avatarUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-white/10" />
                <label className="cursor-pointer flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase mb-2">
                   <Upload className="w-4 h-4" /> Upload New Photo
                   <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
             </div>
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bio</label><textarea className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" rows={3} defaultValue={user.bio}></textarea></div>
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label><input type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" defaultValue={user.phone} /></div>
             <div className="pt-4 flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 rounded-xl font-bold text-white">Cancel</button><button type="submit" className="flex-1 py-3 bg-cyan-600 rounded-xl font-bold text-white">Save Changes</button></div>
          </form>
       </div>
    </div>
  );
};

const DigitalClockHero: React.FC<{ user: User }> = ({ user }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 border border-white/5 overflow-hidden shadow-2xl">
       <div className="relative z-10 flex justify-between items-start">
          <div><h2 className="text-3xl font-black text-white mb-2">Welcome, {user.name.split(' ')[0]}</h2><div className="text-4xl font-thin text-cyan-200 tabular-nums">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div><div className="text-sm text-slate-400 uppercase tracking-widest mt-1">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div></div>
          <div className="hidden md:block"><div className="bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-xs"><div className="flex items-center gap-2 mb-2 text-cyan-400 animate-pulse"><Clock className="w-4 h-4" /><span className="text-xs font-bold uppercase">Up Next</span></div><div className="text-white font-bold">Supply Chain Review</div><div className="text-xs text-slate-400">Tomorrow • 10:00 AM</div></div></div>
       </div>
    </div>
  );
};

const RightProfileSidebar: React.FC<{ user: User, onEdit: () => void }> = ({ user, onEdit }) => (
  <div className="w-full bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 sticky top-6">
    <div className="flex flex-col items-center text-center">
      <div className="relative w-24 h-24 mb-4"><div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-full blur-sm opacity-50"></div><img src={user.avatar} alt={user.name} className="relative w-full h-full rounded-full object-cover border-4 border-slate-900" /></div>
      <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3><p className="text-slate-400 text-sm mb-4">{user.program || user.department}</p>
      <div className="w-full space-y-3 mb-6"><div className="flex items-center gap-3 text-sm text-slate-400"><Mail className="w-4 h-4" /><span className="truncate">{user.email || 'email@scholarx.edu'}</span></div><div className="flex items-center gap-3 text-sm text-slate-400"><Phone className="w-4 h-4" /><span>{user.phone || '555-0123'}</span></div>{user.role === 'student' && (<div className="flex items-center gap-3 text-sm text-slate-400"><GraduationCap className="w-4 h-4" /><span>{user.year}</span></div>)}</div>
      
      {user.role === 'tutor' && user.points && (
         <div className="w-full mb-6 text-left space-y-3">
             <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>Tutor Rank</span><span className="text-cyan-400">Gold Badge</span></div>
             <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[75%]"></div></div>
             <div className="flex items-center gap-2 text-sm text-white font-bold"><Award className="w-4 h-4 text-yellow-500"/> {user.points.toLocaleString()} Points</div>
         </div>
      )}

      <button onClick={onEdit} className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><Edit className="w-4 h-4" /> Edit Profile</button>
    </div>
  </div>
);

const ChatInterface: React.FC<{ role?: Role, preselectedContact?: User }> = ({ role = 'student', preselectedContact }) => {
  const [selectedContact, setSelectedContact] = useState<string | null>(preselectedContact?.id || null);
  const contacts = useMemo(() => {
    if (role === 'tutor') {
        return [
            { id: 's1', name: 'Liam Grayson', role: 'Student', avatar: MOCK_USER_STUDENT.avatar, online: true, lastMsg: 'Thanks for the help!' },
            { id: 'i1', name: 'Dieudonne, U.', role: 'Instructor', avatar: MOCK_INSTRUCTORS[0].avatar, online: false, lastMsg: 'Can you cover for me?' },
        ];
    }
    return role === 'instructor' ? [
       { id: 'admin1', name: 'System Admin', role: 'Administrator', avatar: MOCK_USER_ADMIN.avatar, online: true, lastMsg: 'Timetable updated.' },
       { id: 's1', name: 'Liam Grayson', role: 'Student', avatar: MOCK_USER_STUDENT.avatar, online: true, lastMsg: 'Exam question.' }
    ] : [
       { id: '1', name: 'Sarah Chen', role: 'Peer Tutor', avatar: MOCK_PEER_TUTORS[0].avatar, online: true, lastMsg: 'Sure, I can help!' },
       { id: '2', name: 'Dieudonne, U.', role: 'Instructor', avatar: MOCK_INSTRUCTORS[0].avatar, online: false, lastMsg: 'Office hours moved.' },
    ];
  }, [role]);
  const activeUser = contacts.find(c => c.id === selectedContact) || (preselectedContact ? { id: preselectedContact.id, name: preselectedContact.name, avatar: preselectedContact.avatar, role: 'User', online: true, lastMsg: '' } : null);
  return (
    <div className="flex h-[600px] bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden animate-in fade-in duration-500">
      <div className="w-80 border-r border-white/5 flex flex-col"><div className="p-4 border-b border-white/5"><h3 className="font-bold text-white mb-4">Messages</h3><div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" /><input type="text" placeholder="Search..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors" /></div></div><div className="flex-1 overflow-y-auto">{contacts.map(c => (<div key={c.id} onClick={() => setSelectedContact(c.id)} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors ${selectedContact === c.id ? 'bg-white/5' : ''}`}><div className="relative"><img src={c.avatar} className="w-10 h-10 rounded-full object-cover" alt={c.name} />{c.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>}</div><div className="flex-1 min-w-0"><div className="flex justify-between items-baseline mb-1"><h4 className="font-bold text-sm text-white truncate">{c.name}</h4></div><p className="text-xs text-slate-400 truncate">{c.lastMsg}</p></div></div>))}</div></div>
      <div className="flex-1 flex flex-col bg-slate-950/30">{activeUser ? (<><div className="p-4 border-b border-white/5 flex justify-between items-center"><div className="flex items-center gap-3"><img src={activeUser.avatar} className="w-8 h-8 rounded-full object-cover" alt="Active" /><h4 className="font-bold text-white">{activeUser.name} <span className="text-xs text-slate-500 ml-2 font-normal">({activeUser.role})</span></h4></div></div><div className="flex-1 p-4 overflow-y-auto space-y-4">{activeUser.lastMsg && <div className="flex justify-start"><div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 max-w-sm text-sm text-slate-300">{activeUser.lastMsg}</div></div>}</div><div className="p-4 border-t border-white/5 bg-slate-900/50 flex items-center gap-2"><button className="p-2 hover:bg-white/10 rounded-full text-slate-400"><Plus className="w-5 h-5" /></button><button className="p-2 hover:bg-white/10 rounded-full text-slate-400"><Mic className="w-5 h-5" /></button><input type="text" placeholder="Type a message..." className="flex-1 bg-slate-950 border border-white/10 rounded-full py-2 px-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" /><button className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white"><Send className="w-4 h-4" /></button></div></>) : (<div className="flex-1 flex flex-col items-center justify-center text-slate-500"><MessageSquare className="w-12 h-12 mb-4 opacity-50" /><p>Select a conversation</p></div>)}</div>
    </div>
  );
};

// --- CORE LAYOUT COMPONENT ---
const DashboardLayout: React.FC<{
  role: Role;
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}> = ({ role, user, activeTab, onTabChange, onLogout, children }) => {
  const navItems = NAV_ITEMS[role] || [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 font-sans selection:bg-violet-500/30">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed lg:sticky top-0 left-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Logo className="w-8 h-8 text-violet-500" />
          <span className="ml-3 font-bold text-lg tracking-tight text-white">ScholarX</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="ml-3 font-medium">{item.label}</span>
                {isActive && <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform" />
            <span className="ml-3 font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white"><Menu className="w-6 h-6"/></button>
              <h2 className="text-xl font-bold text-white capitalize truncate">{activeTab.replace('-', ' ')}</h2>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden md:flex items-center bg-slate-950/50 border border-white/10 rounded-full px-4 py-2 focus-within:border-violet-500/50 transition-colors w-64">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-200 placeholder-slate-600"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationPopover />
              <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-bold text-white max-w-[150px] truncate">{user.name}</div>
                  <div className="text-xs text-slate-400 capitalize">{user.role}</div>
                </div>
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-slate-800 object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// --- DASHBOARDS & VIEWS ---

const StudentHomeView: React.FC<{ user: User }> = ({ user }) => {
    return (
        <div className="space-y-6 animate-in fade-in">
             <DigitalClockHero user={user} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div whileHover={{ y: -5 }} className="bg-slate-900 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-violet-400"/> Your Instructors</h3>
                      <div className="space-y-4">
                          {getInstructorsForCohort(user.cohort || '', MOCK_INSTRUCTORS, REAL_TIMETABLE_DATA).map(inst => (
                              <div key={inst.id} className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-colors">
                                  <img src={inst.avatar} className="w-12 h-12 rounded-full object-cover" />
                                  <div className="flex-1">
                                      <h4 className="font-bold text-white text-sm">{inst.name}</h4>
                                      <p className="text-xs text-slate-400">{inst.title}</p>
                                  </div>
                                  <div className="flex gap-2">
                                      <button className="p-2 bg-slate-800 hover:bg-violet-600 rounded-lg text-white transition-colors" title="Chat"><MessageSquare className="w-4 h-4"/></button>
                                      <button className="p-2 bg-slate-800 hover:bg-cyan-600 rounded-lg text-white transition-colors" title="Book"><Calendar className="w-4 h-4"/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} className="bg-slate-900 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400"/> Recent Activity</h3>
                      <div className="space-y-4">
                          {MOCK_ACTIVITY_FEED.slice(0, 3).map(act => (
                              <div key={act.id} className="flex gap-3 text-sm">
                                  <div className="mt-1 w-2 h-2 bg-cyan-500 rounded-full shrink-0" />
                                  <p className="text-slate-400"><span className="text-white font-bold">{act.user}</span> {act.action} <span className="text-cyan-400">{act.target}</span></p>
                              </div>
                          ))}
                      </div>
                  </motion.div>
             </div>
        </div>
    );
};

const PeerTutorHorizontalList: React.FC<{ studentYear: string }> = ({ studentYear }) => {
    const tutors = getEligiblePeerTutors(studentYear, MOCK_PEER_TUTORS);
    const [selectedTutor, setSelectedTutor] = useState<PeerTutor | null>(null);

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400"/> Top Peer Tutors</h3>
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
                {tutors.map(tutor => (
                    <motion.div key={tutor.id} whileHover={{ y: -5, scale: 1.02 }} className="min-w-[280px] bg-slate-900 border border-white/5 rounded-3xl p-6 snap-center relative group overflow-hidden cursor-pointer" onClick={() => setSelectedTutor(tutor)}>
                         <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <div className="relative z-10 flex flex-col items-center text-center">
                             <div className="relative mb-3">
                                 <img src={tutor.avatar} className="w-20 h-20 rounded-full object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-colors" />
                                 <div className="absolute -bottom-2 px-2 py-0.5 bg-slate-800 rounded-full text-[10px] font-bold text-yellow-400 border border-white/10 flex items-center gap-1"><Star className="w-3 h-3 fill-current"/> {tutor.stars}</div>
                             </div>
                             <h4 className="font-bold text-white text-lg">{tutor.name}</h4>
                             <p className="text-xs text-slate-400 mb-2">{tutor.program} • {tutor.year}</p>
                             <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase mb-4 ${tutor.badge === 'Gold' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>{tutor.badge} Tutor</div>
                             <button className="w-full py-2 bg-white/5 hover:bg-cyan-600 hover:text-white rounded-xl text-xs font-bold text-slate-300 transition-all">View Profile</button>
                         </div>
                    </motion.div>
                ))}
            </div>
            <AnimatePresence>
                {selectedTutor && <UserProfileModal user={selectedTutor} onClose={() => setSelectedTutor(null)} onBook={() => {}} onMessage={() => {}} />}
            </AnimatePresence>
        </div>
    );
};

const StudentBookingView: React.FC<{ user: User }> = ({ user }) => {
    const [selectedType, setSelectedType] = useState<'instructor' | 'tutor'>('instructor');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    const instructors = useMemo(() => getInstructorsForCohort(user.cohort || '', MOCK_INSTRUCTORS, REAL_TIMETABLE_DATA), [user.cohort]);
    const tutors = useMemo(() => getEligiblePeerTutors(user.year || 'Year 1', MOCK_PEER_TUTORS), [user.year]);

    const activeList = selectedType === 'instructor' ? instructors : tutors;
    const activeUser = activeList.find(u => u.id === selectedUser);

    const availableSlots = useMemo(() => {
        if (!activeUser || selectedType !== 'instructor') return ['09:00', '10:00', '14:00', '15:00', '16:00'];
        const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
        if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') return [];
        
        const possibleSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
        return possibleSlots.filter(time => !isInstructorBusy(activeUser.name, dayOfWeek, time, REAL_TIMETABLE_DATA));
    }, [activeUser, selectedDate, selectedType]);

    const handleBook = () => {
        if (selectedTime && reason) {
            setConfirmed(true);
            setTimeout(() => {
                setConfirmed(false);
                setSelectedUser(null);
                setSelectedTime(null);
                setReason('');
            }, 3000);
        }
    };

    if (confirmed) return (
        <div className="flex flex-col items-center justify-center h-full animate-in zoom-in">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-500/20">
                <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Booking Confirmed!</h2>
            <p className="text-slate-400">Your session with {activeUser?.name} is set.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-2 flex gap-2">
                    {['instructor', 'tutor'].map(type => (
                        <button key={type} onClick={() => { setSelectedType(type as any); setSelectedUser(null); }} className={`flex-1 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${selectedType === type ? 'bg-violet-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                            {type}s
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeList.map(u => (
                        <div key={u.id} onClick={() => setSelectedUser(u.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${selectedUser === u.id ? 'bg-violet-600/10 border-violet-500' : 'bg-slate-900 border-white/5 hover:border-white/10'}`}>
                            <img src={u.avatar} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <h4 className="font-bold text-white">{u.name}</h4>
                                <p className="text-xs text-slate-400">{'title' in u ? (u as Instructor).title : (u as PeerTutor).program}</p>
                            </div>
                            {selectedUser === u.id && <CheckCircle className="ml-auto w-5 h-5 text-violet-500" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 h-fit sticky top-6">
                <h3 className="font-bold text-white mb-6">Booking Details</h3>
                {!selectedUser ? (
                    <div className="text-center text-slate-500 py-10">Select a user to proceed.</div>
                ) : (
                    <div className="space-y-6">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Date</label>
                             <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-violet-500" />
                         </div>
                         
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Free Slots</label>
                             <div className="grid grid-cols-4 gap-2">
                                 {availableSlots.length > 0 ? availableSlots.map(time => (
                                     <button key={time} onClick={() => setSelectedTime(time)} className={`py-2 rounded-lg text-xs font-bold transition-colors ${selectedTime === time ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{time}</button>
                                 )) : <div className="col-span-4 text-xs text-red-400">No slots available</div>}
                             </div>
                         </div>

                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reason for Appointment</label>
                             <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-violet-500 outline-none" placeholder={selectedType === 'tutor' ? "Describe your weakness..." : "Topic to discuss..."}></textarea>
                         </div>

                         <button onClick={handleBook} disabled={!selectedTime || !reason} className="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-bold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform">Confirm Appointment</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentSessionsView: React.FC = () => {
    const [view, setView] = useState<'upcoming' | 'history'>('upcoming');
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    const todaysSessions = useMemo(() => getTodaysClasses(MOCK_USER_STUDENT.cohort!, REAL_TIMETABLE_DATA), []);

    return (
        <div className="space-y-8">
            <div className="flex gap-4 border-b border-white/5 pb-4">
                <button onClick={() => setView('upcoming')} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${view === 'upcoming' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500'}`}>Upcoming</button>
                <button onClick={() => setView('history')} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${view === 'history' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500'}`}>History</button>
            </div>

            {view === 'upcoming' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-400"/> Today's Schedule</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {todaysSessions.length > 0 ? todaysSessions.map(session => {
                                const status = checkClassTimeStatus(session.time);
                                return (
                                    <div key={session.id} className="bg-slate-900 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-bold uppercase ${status === 'live' ? 'bg-red-500 text-white animate-pulse' : status === 'past' ? 'bg-slate-700 text-slate-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                            {status === 'live' ? 'Happening Now' : status === 'past' ? 'Finished' : 'Upcoming'}
                                        </div>
                                        <h4 className="font-bold text-white text-lg mb-1">{session.subject}</h4>
                                        <p className="text-sm text-slate-400 mb-4">{session.tutorName}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                                            <div className="flex items-center gap-1"><Clock className="w-3 h-3"/> {session.time}</div>
                                            <div className="flex items-center gap-1"><Building2 className="w-3 h-3"/> {session.classroom}</div>
                                        </div>
                                        {status === 'live' && <button className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition-colors">Join Room</button>}
                                        {status === 'past' && <button onClick={() => setSelectedSession(session as any)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-white transition-colors">Rate Session</button>}
                                        {status === 'future' && <button disabled className="w-full py-3 bg-slate-800/50 text-slate-500 rounded-xl font-bold cursor-not-allowed">Starts Soon</button>}
                                    </div>
                                );
                            }) : <div className="text-slate-500 italic">No classes today.</div>}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Booked Sessions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {/* Quick Book Card */}
                             <div className="bg-slate-900/50 border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
                                 <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-violet-500 transition-colors"><Plus className="w-6 h-6 text-white"/></div>
                                 <h4 className="font-bold text-white">Book Session</h4>
                                 <p className="text-xs text-slate-500">Find an instructor or tutor</p>
                             </div>
                             
                             {MOCK_SESSIONS.filter(s => s.status === 'upcoming').map(session => (
                                 <div key={session.id} className="bg-slate-900 border border-white/5 rounded-3xl p-6 relative">
                                     <div className="absolute top-4 right-4 text-xs font-bold text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded uppercase">Upcoming</div>
                                     <h4 className="font-bold text-white text-lg mb-1">{session.subject}</h4>
                                     <div className="flex items-center gap-2 mb-4 text-sm text-slate-400"><UserCircle className="w-4 h-4"/> {session.tutorName}</div>
                                     <div className="bg-slate-950 p-3 rounded-xl mb-4">
                                         <div className="text-xs text-slate-500 uppercase font-bold mb-1">Time</div>
                                         <div className="text-white font-mono">{session.date}</div>
                                     </div>
                                     <button className="w-full py-2 bg-violet-600/10 text-violet-400 font-bold rounded-lg hover:bg-violet-600 hover:text-white transition-colors">View Details</button>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {view === 'history' && (
                <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Instructor/Tutor</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_SESSIONS.filter(s => s.status === 'completed').map(session => (
                                <tr key={session.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-white">{session.subject}</td>
                                    <td className="p-4 text-slate-300">{session.tutorName}</td>
                                    <td className="p-4 text-slate-400 font-mono">{session.date}</td>
                                    <td className="p-4"><span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold uppercase">Completed</span></td>
                                    <td className="p-4">
                                        {!session.feedbackGiven ? (
                                            <button onClick={() => setSelectedSession(session)} className="text-xs font-bold bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-500">Rate</button>
                                        ) : <span className="text-slate-500 text-xs">Rated</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AnimatePresence>
                {selectedSession && <RateSessionModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
            </AnimatePresence>
        </div>
    );
};

const StudentSuggestionsView: React.FC = () => {
    const [department, setDepartment] = useState(DEPARTMENTS[0]);
    const [message, setMessage] = useState('');
    const [isAnon, setIsAnon] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setMessage('');
        }, 3000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                 
                 <div className="relative z-10">
                     <h2 className="text-2xl font-black text-white mb-2">Make a Suggestion</h2>
                     <p className="text-slate-400 mb-8">Help us improve campus life. Your voice matters.</p>

                     {!submitted ? (
                         <form onSubmit={handleSubmit} className="space-y-6">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Department</label>
                                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                     {DEPARTMENTS.map(dep => (
                                         <button type="button" key={dep} onClick={() => setDepartment(dep)} className={`py-3 px-2 rounded-xl text-xs font-bold transition-all ${department === dep ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-950 text-slate-400 hover:bg-white/5'}`}>
                                             {dep}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                             
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Suggestion</label>
                                 <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-cyan-500 outline-none transition-colors" placeholder="Describe your idea or concern..."></textarea>
                             </div>

                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsAnon(!isAnon)}>
                                     <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isAnon ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                                         <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isAnon ? 'translate-x-4' : ''}`}></div>
                                     </div>
                                     <span className="text-sm text-slate-400">Submit Anonymously</span>
                                 </div>
                                 <button type="submit" disabled={!message} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-cyan-50 transition-colors disabled:opacity-50">Send Suggestion</button>
                             </div>
                         </form>
                     ) : (
                         <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in">
                             <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-500/20">
                                 <Check className="w-10 h-10 text-white" />
                             </div>
                             <h3 className="text-2xl font-bold text-white">Suggestion Sent!</h3>
                             <p className="text-slate-400">The {department} team will review it shortly.</p>
                         </div>
                     )}
                 </div>
            </div>
        </div>
    );
};

const StudentDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    return (
        <DashboardLayout role="student" user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>
             {activeTab === 'dashboard' && (
                 <div className="flex gap-6">
                     <div className="flex-1 space-y-8">
                         <StudentHomeView user={user} />
                         <PeerTutorHorizontalList studentYear={user.year || 'Year 1'} />
                     </div>
                     <div className="w-80 hidden xl:block"><RightProfileSidebar user={user} onEdit={() => {}} /></div>
                 </div>
             )}
             {activeTab === 'sessions' && <StudentSessionsView />}
             {activeTab === 'schedule' && <StudentBookingView user={user} />}
             {activeTab === 'chat' && <ChatInterface role="student" />}
             {activeTab === 'suggestions' && <StudentSuggestionsView />}
        </DashboardLayout>
    );
};

// --- INSTRUCTOR DASHBOARD ---

const InstructorFeedbackAnalytics: React.FC = () => {
    const data = [
      { subject: 'Clarity', A: 120, fullMark: 150 },
      { subject: 'Engagement', A: 98, fullMark: 150 },
      { subject: 'Pacing', A: 86, fullMark: 150 },
      { subject: 'Support', A: 99, fullMark: 150 },
      { subject: 'Materials', A: 85, fullMark: 150 },
      { subject: 'Relevance', A: 65, fullMark: 150 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                <h3 className="font-bold text-white mb-6">Feedback Radar</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <Radar name="Feedback" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.3} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-bold text-white">Smart Detection</h3>
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                         <div className="text-slate-400 text-xs font-bold uppercase mb-2">Thankful</div>
                         <div className="text-3xl font-black text-green-400">85%</div>
                         <div className="h-1 w-full bg-slate-800 rounded-full mt-2"><div className="h-full bg-green-500 w-[85%] rounded-full"></div></div>
                     </div>
                     <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                         <div className="text-slate-400 text-xs font-bold uppercase mb-2">Struggling</div>
                         <div className="text-3xl font-black text-yellow-400">12%</div>
                         <div className="h-1 w-full bg-slate-800 rounded-full mt-2"><div className="h-full bg-yellow-500 w-[12%] rounded-full"></div></div>
                     </div>
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                     <h3 className="font-bold text-white mb-4">Sentiment Trend</h3>
                     <div className="h-32">
                         <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={ANALYTICS_DATA}>
                                 <defs><linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                 <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#colorSent)" />
                             </AreaChart>
                         </ResponsiveContainer>
                     </div>
                </div>
            </div>
        </div>
    );
};

const SmartSupportClassScheduler: React.FC<{ instructor: Instructor, onPointsUpdate: (pts: number) => void }> = ({ instructor, onPointsUpdate }) => {
  const [sessions, setSessions] = useState<ManagedSession[]>([]);
  const [selectedCohort, setSelectedCohort] = useState('BAPM_2023_Section_A');
  const [comment, setComment] = useState('');
  
  const handleCreate = () => {
      const newSession: ManagedSession = {
          id: Math.random().toString(),
          cohort: selectedCohort,
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          comment,
          targetStudents: ['s1', 's2', 's3'],
          status: 'scheduled',
          feedbackCollected: false,
          totalStudentCount: 3,
          respondedCount: 0
      };
      setSessions([...sessions, newSession]);
      setComment('');
  };

  const simulateResponses = (id: string) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'ready-to-collect', respondedCount: 3 } : s));
  };

  const collectPoints = (id: string) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'completed', feedbackCollected: true } : s));
      onPointsUpdate(instructor.points + 250);
  };

  return (
    <div className="space-y-8">
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
            <h3 className="font-bold text-white mb-6">Create Support Class</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Cohort</label>
                     <select className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none" value={selectedCohort} onChange={e => setSelectedCohort(e.target.value)}>
                         {Object.keys(REAL_TIMETABLE_DATA["Term_1_AY_2025/2026_Timetable"]).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                     </select>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Class Comment</label>
                     <input type="text" value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="e.g. Reviewing Chapter 4"/>
                 </div>
            </div>
            <button onClick={handleCreate} disabled={!comment} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white transition-colors">Schedule Session</button>
        </div>

        <div className="space-y-4">
             {sessions.map(session => (
                 <div key={session.id} className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                     <div>
                         <h4 className="font-bold text-white">{session.cohort.replace(/_/g, ' ')}</h4>
                         <p className="text-sm text-slate-400">{session.comment} • {session.date}</p>
                         <div className="mt-2 flex items-center gap-2">
                             <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500 transition-all" style={{ width: `${(session.respondedCount / session.totalStudentCount) * 100}%` }}></div>
                             </div>
                             <span className="text-xs text-slate-500">{session.respondedCount}/{session.totalStudentCount} Responded</span>
                         </div>
                     </div>
                     <div className="flex gap-2">
                         {session.status === 'scheduled' && <button onClick={() => setSessions(prev => prev.map(s => s.id === session.id ? {...s, status: 'waiting-for-responses'} : s))} className="px-4 py-2 bg-violet-600 rounded-lg text-xs font-bold text-white">Invite & Send Forms</button>}
                         {session.status === 'waiting-for-responses' && <button onClick={() => simulateResponses(session.id)} className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-300">Simulate Time</button>}
                         {session.status === 'ready-to-collect' && <button onClick={() => collectPoints(session.id)} className="px-4 py-2 bg-yellow-500 text-black rounded-lg text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1"><Trophy className="w-3 h-3"/> Collect Points</button>}
                         {session.status === 'completed' && <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold">Completed</div>}
                     </div>
                 </div>
             ))}
        </div>
    </div>
  );
};

const InstructorClassesView: React.FC<{ instructor: Instructor }> = ({ instructor }) => {
    const classes = useMemo(() => getInstructorClassesFlattened(instructor.name, REAL_TIMETABLE_DATA), [instructor.name]);
    const [filter, setFilter] = useState('');

    const filteredClasses = classes.filter(c => c.course.toLowerCase().includes(filter.toLowerCase()) || c.section.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">My Classes</h2>
                 <div className="relative">
                     <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                     <input type="text" placeholder="Filter classes..." value={filter} onChange={e => setFilter(e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white outline-none focus:border-violet-500"/>
                 </div>
             </div>

             <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-950 text-slate-500 uppercase text-xs font-bold">
                         <tr>
                             <th className="p-4">Day/Time</th>
                             <th className="p-4">Course</th>
                             <th className="p-4">Section</th>
                             <th className="p-4">Room</th>
                             <th className="p-4">Feedback</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {filteredClasses.map((cls, i) => (
                             <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                 <td className="p-4 font-mono text-cyan-400">{cls.day} • {cls.time}</td>
                                 <td className="p-4 font-bold text-white">{cls.course}</td>
                                 <td className="p-4 text-slate-300">{cls.program} {cls.year} - {cls.section}</td>
                                 <td className="p-4 text-slate-400">{cls.classroom}</td>
                                 <td className="p-4"><span className="text-violet-400 group-hover:underline">View 5 Reports</span></td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>
    );
};

const InstructorDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [instructor, setInstructor] = useState(MOCK_INSTRUCTORS[0]); // Demo state

    return (
        <DashboardLayout role="instructor" user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>
            {activeTab === 'dashboard' && (
                <div className="flex gap-6">
                    <div className="flex-1 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-2 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2"><Award className="w-6 h-6 text-yellow-300"/><span className="text-yellow-300 font-bold uppercase tracking-wider text-xs">Current Rank</span></div>
                                    <h2 className="text-3xl font-black text-white mb-2">{instructor.badge}</h2>
                                    <p className="text-violet-200 text-sm mb-6">You are in the top 5% of instructors this month.</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-white">{instructor.points.toLocaleString()}</span>
                                        <span className="text-violet-200 font-bold mb-1">Points</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/20 rounded-full mt-4 overflow-hidden"><div className="h-full bg-yellow-400 w-[70%]"></div></div>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                                 <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4"><Star className="w-8 h-8 fill-current"/></div>
                                 <div className="text-3xl font-black text-white">{instructor.rating}</div>
                                 <div className="text-xs text-slate-500 uppercase font-bold">Avg Rating</div>
                            </div>
                        </div>
                        <InstructorFeedbackAnalytics />
                    </div>
                    <div className="w-80 hidden xl:block"><RightProfileSidebar user={instructor} onEdit={() => {}} /></div>
                </div>
            )}
            {activeTab === 'feedback' && <InstructorFeedbackAnalytics />}
            {activeTab === 'classes' && <InstructorClassesView instructor={instructor} />}
            {activeTab === 'schedule' && <SmartSupportClassScheduler instructor={instructor} onPointsUpdate={(pts) => setInstructor({...instructor, points: pts})} />}
            {activeTab === 'chat' && <ChatInterface role="instructor" />}
        </DashboardLayout>
    );
};

// --- TUTOR DASHBOARD ---
const TutorDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    return (
        <DashboardLayout role="tutor" user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>
            {activeTab === 'dashboard' && (
                <div className="flex gap-6">
                    <div className="flex-1 space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                             <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                                 <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Points</div>
                                 <div className="text-3xl font-black text-white">{MOCK_USER_TUTOR.points?.toLocaleString()}</div>
                             </div>
                             <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                                 <div className="text-slate-500 text-xs font-bold uppercase mb-1">Sessions</div>
                                 <div className="text-3xl font-black text-cyan-400">42</div>
                             </div>
                         </div>
                         <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                             <h3 className="font-bold text-white mb-6">Weekly Progress</h3>
                             <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={WEEKLY_POINTS_DATA}><Bar dataKey="value" fill="#8b5cf6" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
                         </div>
                    </div>
                    <div className="w-80 hidden xl:block"><RightProfileSidebar user={MOCK_USER_TUTOR} onEdit={() => {}} /></div>
                </div>
            )}
            {activeTab === 'ratings' && <div className="text-white p-8">Ratings List</div>}
            {activeTab === 'appointments' && <div className="text-white p-8">Appointment Timeline</div>}
            {activeTab === 'chat' && <ChatInterface role="tutor" />}
        </DashboardLayout>
    );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <DashboardLayout role="admin" user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {ADMIN_STATS.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900 border border-white/5 p-4 rounded-2xl"
              >
                <div className="text-slate-400 text-xs font-bold uppercase mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-white mb-2">{stat.value}</div>
                <div className={`text-xs font-bold flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : stat.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                  {stat.change}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">System Activity</h3>
                <div className="flex gap-2">
                  <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><Filter className="w-4 h-4 text-slate-400" /></button>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ANALYTICS_DATA}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                <h3 className="font-bold text-white mb-4">System Health</h3>
                <div className="space-y-4">
                  {MOCK_SYSTEM_ALERTS.map(alert => (
                    <div key={alert.id} className="flex gap-3 items-start p-3 bg-slate-950/50 rounded-xl border border-white/5">
                       <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                       <div>
                         <p className="text-sm text-slate-300 leading-tight mb-1">{alert.message}</p>
                         <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-500 uppercase text-xs font-bold">
                    <tr><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/5"><td className="p-4 flex items-center gap-3"><img src={MOCK_USER_STUDENT.avatar} className="w-8 h-8 rounded-full"/><span className="text-white font-bold">{MOCK_USER_STUDENT.name}</span></td><td className="p-4 text-slate-400">Student</td><td className="p-4"><span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded">Active</span></td><td className="p-4"><button className="text-red-400 hover:text-red-300">Suspend</button></td></tr>
                    <tr className="hover:bg-white/5"><td className="p-4 flex items-center gap-3"><img src={MOCK_USER_INSTRUCTOR.avatar} className="w-8 h-8 rounded-full"/><span className="text-white font-bold">{MOCK_USER_INSTRUCTOR.name}</span></td><td className="p-4 text-slate-400">Instructor</td><td className="p-4"><span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded">Active</span></td><td className="p-4"><button className="text-red-400 hover:text-red-300">Suspend</button></td></tr>
                </tbody>
            </table>
        </div>
      )}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_DEPARTMENTS.map(dept => (
                <div key={dept.id} className="bg-slate-900 border border-white/5 rounded-3xl p-6 hover:border-violet-500/50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4"><Building2 className="w-6 h-6 text-white"/></div>
                    <h3 className="font-bold text-white text-lg">{dept.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">Head: {dept.head}</p>
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                        <span>Staff: {dept.staffCount}</span>
                        <span>Suggestions: {dept.suggestionCount}</span>
                    </div>
                </div>
            ))}
        </div>
      )}
    </DashboardLayout>
  );
};


// --- LANDING PAGE REDESIGN ---

const FeatureCard: React.FC<{ icon: any, title: string, desc: string, delay: number }> = ({ icon: Icon, title, desc, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-slate-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-3xl hover:bg-white/5 hover:border-violet-500/30 transition-all group"
    >
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-violet-500/20">
            <Icon className="w-6 h-6 text-violet-400 group-hover:text-violet-300" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
);

const HeroParallax: React.FC = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height, left, top } = currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left) / width - 0.5);
        mouseY.set((clientY - top) / height - 0.5);
    };

    return (
        <div className="relative h-[600px] w-full flex items-center justify-center perspective-1000" onMouseMove={handleMouseMove}>
            <motion.div 
                style={{ 
                    rotateX: useTransform(mouseY, [-0.5, 0.5], [10, -10]),
                    rotateY: useTransform(mouseX, [-0.5, 0.5], [-10, 10]),
                }}
                className="relative z-10 w-[90%] max-w-4xl"
            >
                {/* Main Glass Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-violet-500"></div>
                    
                    {/* Fake UI Header */}
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                        <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                             <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                        </div>
                        <div className="h-2 w-32 bg-slate-800 rounded-full"></div>
                    </div>

                    {/* Fake UI Content */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-4">
                            <div className="h-32 bg-slate-800/50 rounded-2xl border border-white/5 flex items-center justify-center">
                                <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-24 bg-slate-800/50 rounded-2xl border border-white/5"></div>
                                <div className="h-24 bg-slate-800/50 rounded-2xl border border-white/5"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-full bg-slate-800/50 rounded-2xl border border-white/5 p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20"></div>
                                    <div className="h-2 w-16 bg-slate-700 rounded"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-slate-700/50 rounded"></div>
                                    <div className="h-2 w-3/4 bg-slate-700/50 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <motion.div style={{ x: useTransform(mouseX, [-0.5, 0.5], [20, -20]), y: useTransform(mouseY, [-0.5, 0.5], [20, -20]) }} className="absolute -top-10 -right-10 bg-slate-800 border border-white/10 p-4 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-full text-green-400"><CheckCircle className="w-5 h-5"/></div>
                        <div><div className="text-xs text-slate-400 uppercase font-bold">Session</div><div className="font-bold text-white">Confirmed</div></div>
                    </div>
                </motion.div>

                <motion.div style={{ x: useTransform(mouseX, [-0.5, 0.5], [-30, 30]), y: useTransform(mouseY, [-0.5, 0.5], [-10, 10]) }} className="absolute -bottom-5 -left-5 bg-slate-800 border border-white/10 p-4 rounded-2xl shadow-xl">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-400"><Trophy className="w-5 h-5"/></div>
                        <div><div className="text-xs text-slate-400 uppercase font-bold">New Badge</div><div className="font-bold text-white">Gold Tutor</div></div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-violet-500/30 overflow-x-hidden">
            {/* Scroll Progress */}
            <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-cyan-500 origin-left z-[100]" style={{ scaleX }} />

            {/* Floating Nav */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-2">
                        <Logo className="w-6 h-6 text-white" />
                        <span className="font-bold tracking-tight">ScholarX</span>
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#tutors" className="hover:text-white transition-colors">Tutors</a>
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                    </div>
                    <button onClick={onLogin} className="px-5 py-2 bg-white text-slate-950 rounded-full text-xs font-bold hover:bg-violet-50 transition-colors shadow-lg shadow-white/10">Launch App</button>
                </div>
            </nav>

            {/* Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-violet-500 opacity-20 blur-[100px]"></div>
                <div className="absolute right-0 bottom-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-cyan-500 opacity-20 blur-[100px]"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 hover:bg-white/10 transition-colors cursor-default">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-slate-300">v2.0 is now live</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
                        The Academic <br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">Operating System</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Connect with peers, schedule with instructors, and gamify your learning journey. 
                        ScholarX is the all-in-one platform for the modern campus.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                         <button onClick={onLogin} className="group relative px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold text-lg hover:scale-105 transition-transform overflow-hidden">
                             <span className="relative z-10 flex items-center gap-2">Get Started <ChevronRight className="w-4 h-4"/></span>
                             <div className="absolute inset-0 bg-gradient-to-r from-violet-200 to-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </button>
                         <button className="px-8 py-4 rounded-2xl font-bold text-lg text-white border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2">
                             <Play className="w-4 h-4 fill-current"/> Watch Demo
                         </button>
                    </div>
                </motion.div>

                {/* 3D Visual */}
                <HeroParallax />
            </section>

            {/* Marquee Strip */}
            <div className="w-full bg-slate-950 border-y border-white/5 py-8 overflow-hidden">
                <div className="flex whitespace-nowrap gap-16 animate-infinite-scroll opacity-50">
                    {["Harvard", "MIT", "Stanford", "Oxford", "Cambridge", "Yale", "ScholarX", "Future", "Learning"].map((text, i) => (
                        <span key={i} className="text-2xl font-black uppercase text-slate-800">{text}</span>
                    ))}
                    {["Harvard", "MIT", "Stanford", "Oxford", "Cambridge", "Yale", "ScholarX", "Future", "Learning"].map((text, i) => (
                        <span key={`dup-${i}`} className="text-2xl font-black uppercase text-slate-800">{text}</span>
                    ))}
                </div>
            </div>

            {/* Bento Features Grid */}
            <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="mb-20">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Built for <span className="text-violet-400">Speed</span> & <span className="text-cyan-400">Scale</span>.</h2>
                    <p className="text-slate-400 max-w-xl text-lg">Everything you need to manage academic life, from peer support to administrative oversight, in one unified interface.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Large Card */}
                    <motion.div whileHover={{ scale: 0.98 }} className="md:col-span-2 row-span-2 bg-gradient-to-br from-violet-900/20 to-slate-900 border border-white/10 rounded-[32px] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] group-hover:bg-violet-500/30 transition-colors"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center mb-6">
                                    <LayoutDashboard className="w-6 h-6 text-white"/>
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Role-Based Command Centers</h3>
                                <p className="text-slate-400 max-w-sm">Tailored dashboards for Students, Instructors, Tutors, and Admins. Each view is optimized for specific workflows.</p>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <div className="bg-slate-900/50 backdrop-blur border border-white/10 p-4 rounded-xl flex items-center gap-3">
                                    <UserCircle className="w-5 h-5 text-cyan-400"/> <span className="text-sm font-bold">Student View</span>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur border border-white/10 p-4 rounded-xl flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-violet-400"/> <span className="text-sm font-bold">Admin View</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Card 1 */}
                    <motion.div whileHover={{ scale: 0.98 }} className="bg-slate-900/50 border border-white/10 rounded-[32px] p-8 relative overflow-hidden">
                        <Calendar className="w-10 h-10 text-cyan-400 mb-6" />
                        <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
                        <p className="text-sm text-slate-400">Conflict-free booking engine that syncs with real academic timetables.</p>
                    </motion.div>

                    {/* Small Card 2 */}
                    <motion.div whileHover={{ scale: 0.98 }} className="bg-slate-900/50 border border-white/10 rounded-[32px] p-8 relative overflow-hidden">
                        <Trophy className="w-10 h-10 text-yellow-400 mb-6" />
                        <h3 className="text-xl font-bold mb-2">Gamification</h3>
                        <p className="text-sm text-slate-400">Earn badges, points, and certificates for helping peers and attending sessions.</p>
                    </motion.div>

                    {/* Wide Card */}
                    <motion.div whileHover={{ scale: 0.98 }} className="md:col-span-3 bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10 rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                             <h3 className="text-2xl font-bold mb-2">Real-Time Analytics</h3>
                             <p className="text-slate-400 max-w-md">Instructors and Admins get instant insights into student performance and feedback trends.</p>
                        </div>
                        <div className="flex gap-2">
                             {[1,2,3,4,5].map(i => (
                                 <div key={i} className="w-8 bg-violet-500/20 rounded-t-lg border-t border-x border-violet-500/30" style={{ height: `${Math.random() * 40 + 20}px` }}></div>
                             ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Portal CTA */}
            <section className="py-32 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-violet-600/10 z-0"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[100px]"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-5xl md:text-7xl font-black mb-8">Ready to <br/>Enter the System?</h2>
                    <p className="text-xl text-slate-400 mb-12">Join thousands of students and educators transforming the way they learn.</p>
                    <button onClick={onLogin} className="px-12 py-5 bg-white text-slate-900 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                        Launch Dashboard
                    </button>
                </div>
            </section>

            {/* Modern Footer */}
            <footer className="bg-black border-t border-white/10 pt-20 pb-10 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Logo className="w-6 h-6 text-white"/>
                            <span className="font-bold text-lg">ScholarX</span>
                        </div>
                        <p className="text-slate-500 text-sm">The academic operating system for the next generation of learners.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <div className="flex gap-4">
                           <button className="text-sm text-slate-500 hover:text-white transition-colors">Privacy</button>
                           <button className="text-sm text-slate-500 hover:text-white transition-colors">Terms</button>
                        </div>
                    </div>
                </div>
                <div className="text-center border-t border-white/5 pt-8 text-slate-600 text-sm">
                    © 2025 ScholarX Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

const AuthPage: React.FC<{ onComplete: (role: Role) => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative z-10"
      >
        {/* Left Side - Visual */}
        <div className="relative p-12 bg-gradient-to-br from-violet-600 to-indigo-900 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div onClick={onBack} className="cursor-pointer relative z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </div>

          <div className="relative z-10 my-12">
            <Logo className="w-20 h-20 text-white mb-8" />
            <h1 className="text-4xl font-black text-white mb-4 leading-tight">
              Welcome to <br/> ScholarX
            </h1>
            <p className="text-violet-100 text-lg leading-relaxed max-w-md">
              The unified platform for academic excellence. Seamlessly connecting students, instructors, and peers.
            </p>
          </div>

          <div className="relative z-10 flex gap-2">
            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-full bg-white animate-progress-indeterminate origin-left"></div>
            </div>
            <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
            <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="p-12 bg-slate-900 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-white mb-2">Select Access Portal</h2>
          <p className="text-slate-400 mb-8">Choose your role to continue to the dashboard.</p>

          <div className="space-y-4">
            {[
              { id: 'student', label: 'Student Portal', icon: GraduationCap, desc: 'Manage courses, sessions & progress', color: 'group-hover:text-violet-400', bg: 'group-hover:bg-violet-500/10' },
              { id: 'instructor', label: 'Instructor Portal', icon: BookOpen, desc: 'Class management & analytics', color: 'group-hover:text-cyan-400', bg: 'group-hover:bg-cyan-500/10' },
              { id: 'tutor', label: 'Peer Tutor Portal', icon: Award, desc: 'Session requests & badge tracking', color: 'group-hover:text-yellow-400', bg: 'group-hover:bg-yellow-500/10' },
              { id: 'admin', label: 'Administrator', icon: Shield, desc: 'System-wide oversight & settings', color: 'group-hover:text-emerald-400', bg: 'group-hover:bg-emerald-500/10' },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => onComplete(option.id as Role)}
                  className="w-full text-left p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center transition-colors ${option.bg}`}>
                    <Icon className={`w-6 h-6 text-slate-400 transition-colors ${option.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-white transition-colors">{option.label}</h3>
                    <p className="text-sm text-slate-500">{option.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 ml-auto group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })}
          </div>

          <div className="mt-8 text-center text-xs text-slate-600">
            By accessing ScholarX, you agree to our <a href="#" className="underline hover:text-slate-400">Terms of Service</a>.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (role: Role) => {
    if (role === 'student') setUser(MOCK_USER_STUDENT);
    else if (role === 'instructor') setUser(MOCK_USER_INSTRUCTOR);
    else if (role === 'tutor') setUser(MOCK_USER_TUTOR);
    else if (role === 'admin') setUser(MOCK_USER_ADMIN);
    setView('dashboard');
  };

  const handleLogout = () => { setUser(null); setView('landing'); };

  return (
    <div className="font-sans text-slate-200">
      {view === 'landing' && <LandingPage onLogin={() => setView('auth')} />}
      {view === 'auth' && <AuthPage onComplete={handleLogin} onBack={() => setView('landing')} />}
      {view === 'dashboard' && user && (
        user.role === 'student' ? <StudentDashboard user={user} onLogout={handleLogout} /> :
        user.role === 'instructor' ? <InstructorDashboard user={user} onLogout={handleLogout} /> :
        user.role === 'tutor' ? <TutorDashboard user={user} onLogout={handleLogout} /> :
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
