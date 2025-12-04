
import React, { useState, useEffect, useMemo } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { 
  Users, Settings, LogOut, Bell, Search, 
  Send, CheckCircle, Clock, XCircle, Plus, ChevronRight, Menu, ArrowLeft, Filter, Home, BookOpen, Star, Calendar, MessageSquare, LayoutDashboard, BarChart2, Shield, Building2, Phone, Award, MoreVertical, X, Sparkles, GraduationCap, ChevronLeft, Calendar as CalendarIcon, Mic, ThumbsUp, HelpCircle, AlertTriangle, UserCircle, Briefcase, Mail, Check, TrendingUp, TrendingDown, Activity, ChevronRight as ChevronRightIcon, Edit, Monitor, FileText, Lock, Trophy, Zap, MousePointerClick, Upload
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Logo } from './components/Logo';
import { Counter } from './components/Counter';
import { Role, User, Suggestion, PeerTutor, Session, Instructor, Feedback, FeedbackCategory, FullTimetable, Notification, TutorRequest, AdminStat, ManagedSession } from './types';
import { NAV_ITEMS, ANALYTICS_DATA, RECENT_SUGGESTIONS, DEPARTMENTS, MOCK_PEER_TUTORS, MOCK_SESSIONS, MOCK_USER_STUDENT, MOCK_INSTRUCTORS, MOCK_INSTRUCTOR_FEEDBACK, MOCK_USER_INSTRUCTOR, REAL_TIMETABLE_DATA, MOCK_NOTIFICATIONS, MOCK_TUTOR_REQUESTS, ADMIN_STATS, MOCK_USER_TUTOR, MOCK_USER_ADMIN, PEER_TUTOR_LEADERBOARD, INSTRUCTOR_BADGES } from './constants';

const motion = m as any;

// --- Helper Functions ---

const getInstructorClasses = (instructorName: string, data: any) => {
  const classes: any[] = [];
  const termData = data["Term_1_AY_2025/2026_Timetable"] || {};
  Object.keys(termData).forEach(section => {
    Object.keys(termData[section]).forEach(day => {
      Object.values(termData[section][day]).forEach((session: any) => {
        // Loose matching for names (simple includes check)
        if (session.Instructor && session.Instructor.includes(instructorName.split(',')[0])) { 
           classes.push({ ...session, Section: section, Day: day });
        }
      });
    });
  });
  return classes;
};

// Check if a specific slot is busy for a specific instructor
const isInstructorBusy = (instructorName: string, day: string, time: string, data: any) => {
  const classes = getInstructorClasses(instructorName, data);
  // Simple check: if instructor has a class on this day at this time
  return classes.some(c => c.Day === day && c.Time === time);
};

// Find free slots for a section (for Support Classes)
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

// --- Shared Components ---

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
      <div className="w-full space-y-3 mb-6"><div className="flex items-center gap-3 text-sm text-slate-400"><Mail className="w-4 h-4" /><span className="truncate">{user.email}</span></div><div className="flex items-center gap-3 text-sm text-slate-400"><Phone className="w-4 h-4" /><span>{user.phone}</span></div>{user.role === 'student' && (<div className="flex items-center gap-3 text-sm text-slate-400"><GraduationCap className="w-4 h-4" /><span>{user.year}</span></div>)}</div>
      <button onClick={onEdit} className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><Edit className="w-4 h-4" /> Edit Profile</button>
    </div>
  </div>
);

const ChatInterface: React.FC<{ role?: Role, preselectedContact?: User }> = ({ role = 'student', preselectedContact }) => {
  const [selectedContact, setSelectedContact] = useState<string | null>(preselectedContact?.id || null);
  const contacts = useMemo(() => {
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

// --- Student Specific Components ---

const PeerTutorHorizontalList: React.FC<{ onBook: (t: PeerTutor) => void }> = ({ onBook }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-white">Top Peer Tutors</h3>
        <button className="text-xs text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-1">View All <ChevronRight className="w-3 h-3"/></button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x scrollbar-thin scrollbar-thumb-slate-800">
        {MOCK_PEER_TUTORS.map(tutor => (
          <div key={tutor.id} className="snap-center shrink-0 w-64 h-80 bg-slate-900 border border-white/5 rounded-3xl relative overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-xl">
             <img src={tutor.avatar} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>
             
             <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex justify-between items-end mb-2">
                   <h3 className="font-bold text-white text-lg">{tutor.name}</h3>
                   <div className="flex items-center gap-1 text-yellow-400 font-bold"><Star className="w-4 h-4 fill-current"/> {tutor.stars}</div>
                </div>
                <p className="text-sm text-cyan-400 font-bold mb-1">{tutor.program}</p>
                <div className="flex gap-2 mb-4">
                   <span className="px-2 py-1 bg-white/10 rounded text-[10px] uppercase font-bold text-white">{tutor.badge}</span>
                   <span className="px-2 py-1 bg-white/10 rounded text-[10px] uppercase font-bold text-white">{tutor.year}</span>
                </div>
                <button onClick={() => onBook(tutor)} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                   <Calendar className="w-4 h-4"/> Request Help
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudentBookingView: React.FC = () => {
  const [activeType, setActiveType] = useState<'instructor' | 'tutor'>('instructor');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  
  // For Instructor Booking: check busy slots
  const [isBusy, setIsBusy] = useState(false);
  
  const handleTimeCheck = (t: string) => {
    setTime(t);
    if (activeType === 'instructor' && selectedPerson) {
       // Mock day check - assuming date input is basically mapped to a day of week
       const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
       // Check against REAL_TIMETABLE_DATA
       const busy = isInstructorBusy(selectedPerson.name, dayOfWeek, t, REAL_TIMETABLE_DATA);
       setIsBusy(busy);
    } else {
       setIsBusy(false);
    }
  };

  const handleBook = () => {
     if (isBusy) return;
     setSuccess(true);
     setTimeout(() => {
        setSuccess(false);
        setSelectedPerson(null);
        setDate('');
        setTime('');
        setReason('');
     }, 3000);
  };

  return (
    <div className="animate-in fade-in space-y-6">
       <div className="flex gap-4 border-b border-white/5 pb-4">
          <button onClick={() => setActiveType('instructor')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeType === 'instructor' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Book Instructor</button>
          <button onClick={() => setActiveType('tutor')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeType === 'tutor' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Book Peer Tutor</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Select {activeType === 'instructor' ? 'Instructor' : 'Peer Tutor'}</label>
             <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {(activeType === 'instructor' ? MOCK_INSTRUCTORS : MOCK_PEER_TUTORS).map(p => (
                   <button key={p.id} onClick={() => setSelectedPerson(p)} className={`p-3 rounded-xl flex items-center gap-3 border transition-all ${selectedPerson?.id === p.id ? 'bg-cyan-900/20 border-cyan-500' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}>
                      <img src={p.avatar} className="w-10 h-10 rounded-full object-cover" />
                      <div className="text-left">
                         <div className="font-bold text-white text-sm">{p.name}</div>
                         <div className="text-xs text-slate-400">{activeType === 'instructor' ? (p as Instructor).specialty : (p as PeerTutor).program}</div>
                      </div>
                      {selectedPerson?.id === p.id && <CheckCircle className="w-5 h-5 text-cyan-500 ml-auto"/>}
                   </button>
                ))}
             </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
             {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4 animate-bounce"><CheckCircle className="w-8 h-8"/></div>
                   <h3 className="text-xl font-bold text-white mb-2">Booking Confirmed!</h3>
                   <p className="text-slate-400 text-sm">You have successfully booked a session with {selectedPerson?.name}.</p>
                </div>
             ) : (
                <div className="space-y-4">
                   <h3 className="font-bold text-white text-lg mb-4">Session Details</h3>
                   
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-cyan-500 outline-none" />
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time Slot</label>
                      <div className="grid grid-cols-3 gap-2">
                         {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(t => (
                            <button key={t} onClick={() => handleTimeCheck(t)} className={`py-2 rounded-lg text-xs font-bold transition-all ${time === t ? (isBusy ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-cyan-600 text-white') : 'bg-slate-950 text-slate-400 hover:bg-white/10'}`}>
                               {t}
                            </button>
                         ))}
                      </div>
                      {isBusy && <p className="text-xs text-red-400 mt-2 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Instructor is busy at this time (checked via Timetable).</p>}
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{activeType === 'tutor' ? 'Describe your weakness / Topic' : 'Reason for appointment'}</label>
                      <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-cyan-500 outline-none" placeholder={activeType === 'tutor' ? "E.g., I don't understand recursion in Python..." : "E.g., Questions about the midterm grading..."}></textarea>
                   </div>

                   <button disabled={!selectedPerson || !date || !time || isBusy || !reason} onClick={handleBook} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2">
                      Book Session
                   </button>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

const StudentSessionsView: React.FC = () => {
  return (
     <div className="animate-in fade-in space-y-6">
        <h3 className="font-bold text-white text-lg mb-4">My Sessions History</h3>
        <div className="space-y-4">
           {MOCK_SESSIONS.map(session => (
              <div key={session.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-white/10 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${session.type === 'peer' ? 'bg-orange-500/20 text-orange-500' : 'bg-violet-500/20 text-violet-500'}`}>
                       {session.type === 'peer' ? <UserCircle className="w-6 h-6"/> : <GraduationCap className="w-6 h-6"/>}
                    </div>
                    <div>
                       <div className="font-bold text-white">{session.subject}</div>
                       <div className="text-sm text-slate-400">with {session.tutorName} • {session.date}</div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    {session.status === 'completed' ? (
                       session.feedbackGiven ? (
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold border border-green-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Rated</span>
                       ) : (
                          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2">
                             <Star className="w-4 h-4"/> Give Feedback
                          </button>
                       )
                    ) : (
                       <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-bold uppercase">{session.status}</span>
                    )}
                 </div>
              </div>
           ))}
        </div>
     </div>
  );
};

const StudentSuggestionView: React.FC = () => {
   const [dept, setDept] = useState('');
   const [msg, setMsg] = useState('');
   const [sent, setSent] = useState(false);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSent(true);
      setTimeout(() => {
         setSent(false);
         setDept('');
         setMsg('');
      }, 3000);
   };

   return (
      <div className="max-w-2xl mx-auto animate-in fade-in">
         <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400"><Building2 className="w-8 h-8"/></div>
               <div>
                  <h2 className="text-2xl font-bold text-white">Make a Suggestion</h2>
                  <p className="text-slate-400">Help us improve campus life. Anonymous options available.</p>
               </div>
            </div>

            {sent ? (
               <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6 animate-bounce"><CheckCircle className="w-10 h-10"/></div>
                  <h3 className="text-2xl font-bold text-white mb-2">Suggestion Sent!</h3>
                  <p className="text-slate-400">Thank you for your feedback. The department will review it shortly.</p>
               </div>
            ) : (
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Department</label>
                     <div className="relative">
                        <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-500"/>
                        <select required value={dept} onChange={e => setDept(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 outline-none appearance-none">
                           <option value="">Select Department...</option>
                           {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Suggestion / Feedback</label>
                     <textarea required value={msg} onChange={e => setMsg(e.target.value)} rows={5} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500 outline-none" placeholder="Describe your idea or concern..."></textarea>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                     <div className="w-10 h-6 bg-slate-800 rounded-full relative cursor-pointer border border-white/10">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full transition-all"></div>
                     </div>
                     <span className="text-sm text-slate-400 font-bold">Submit Anonymously</span>
                  </div>

                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-white text-lg shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2">
                     <Send className="w-5 h-5"/> Send Suggestion
                  </button>
               </form>
            )}
         </div>
      </div>
   );
};

// --- Instructor Specific Components ---

const InstructorFeedbackAnalytics: React.FC = () => {
   // Data for Radar Chart (Unusual/Modern look)
   const radarData = [
      { subject: 'Clarity', A: 120, fullMark: 150 },
      { subject: 'Engagement', A: 98, fullMark: 150 },
      { subject: 'Pace', A: 86, fullMark: 150 },
      { subject: 'Relevance', A: 99, fullMark: 150 },
      { subject: 'Support', A: 85, fullMark: 150 },
      { subject: 'Knowledge', A: 65, fullMark: 150 },
   ];

   const areaData = [
      { name: 'Week 1', thankful: 4, struggling: 1 },
      { name: 'Week 2', thankful: 3, struggling: 2 },
      { name: 'Week 3', thankful: 6, struggling: 0 },
      { name: 'Week 4', thankful: 5, struggling: 3 },
   ];

   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
         <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400"/> Understanding Metrics</h3>
            <p className="text-xs text-slate-400 mb-6">Qualitative breakdown of student feedback categories.</p>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                     <PolarGrid stroke="#334155" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                     <Radar name="Student Rating" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                     <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} itemStyle={{ color: '#c4b5fd' }} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-400"/> Sentiment Trend</h3>
            <p className="text-xs text-slate-400 mb-6">Tracking positive vs struggling feedback over time.</p>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                     <defs>
                        <linearGradient id="colorThankful" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorStruggling" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                     <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                     <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                     <Area type="monotone" dataKey="thankful" stroke="#4ade80" fillOpacity={1} fill="url(#colorThankful)" />
                     <Area type="monotone" dataKey="struggling" stroke="#facc15" fillOpacity={1} fill="url(#colorStruggling)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
   );
};

const SmartSupportClassScheduler: React.FC<{ instructor: Instructor }> = ({ instructor }) => {
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [suggestions, setSuggestions] = useState<{day: string, time: string}[]>([]);
  const [classComment, setClassComment] = useState('');
  const [strugglingStudents, setStrugglingStudents] = useState<string[]>([]);
  const [managedSessions, setManagedSessions] = useState<ManagedSession[]>([]);
  
  // New State for Points Animation
  const [showPointsToast, setShowPointsToast] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Get all unique sections from the JSON
  const allSections = Object.keys(REAL_TIMETABLE_DATA["Term_1_AY_2025/2026_Timetable"] || {});

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sec = e.target.value;
    setSelectedSection(sec);
    if (sec) {
      setSuggestions(getSectionFreeSlots(sec, REAL_TIMETABLE_DATA));
      // Mock finding struggling students for this section
      setStrugglingStudents(['Alex M.', 'Jordan L.', 'Casey R.', 'Taylor S.']);
    } else {
      setSuggestions([]);
      setStrugglingStudents([]);
    }
  };

  const handlePublish = (slot: {day: string, time: string}) => {
    const newSession: ManagedSession = {
      id: Math.random().toString(36).substr(2, 9),
      cohort: selectedSection,
      date: slot.day,
      time: slot.time,
      comment: classComment,
      targetStudents: strugglingStudents,
      status: 'scheduled',
      feedbackCollected: false
    };
    setManagedSessions([...managedSessions, newSession]);
    setSelectedSection('');
    setClassComment('');
  };

  const handleSendFeedbackForm = (sessionId: string) => {
    setManagedSessions(prev => prev.map(s => s.id === sessionId ? {...s, status: 'feedback-pending'} : s));
  };

  const handleSimulateResponses = (sessionId: string) => {
    setManagedSessions(prev => prev.map(s => s.id === sessionId ? {...s, status: 'completed', feedbackCollected: true} : s));
    setPointsEarned(150);
    setShowPointsToast(true);
    setTimeout(() => setShowPointsToast(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
       {/* Scheduler Card */}
       <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400"><Sparkles className="w-6 h-6"/></div>
             <div><h3 className="text-lg font-bold text-white">Smart Support Class Scheduler</h3><p className="text-xs text-slate-400">Finds empty slots & invites struggling students.</p></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Cohort Section</label>
                   <select value={selectedSection} onChange={handleSectionChange} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-violet-500 outline-none">
                      <option value="">-- Choose Section --</option>
                      {allSections.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                   </select>
                </div>
                
                {selectedSection && (
                   <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2"><AlertTriangle className="w-3 h-3"/> Struggling Students Identified</h4>
                      <ul className="space-y-2 max-h-32 overflow-y-auto">
                         {strugglingStudents.map((s, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                               <div className="w-2 h-2 rounded-full bg-red-500"></div> {s}
                            </li>
                         ))}
                      </ul>
                   </div>
                )}
             </div>
             
             <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Class Description / Comment</label>
                  <textarea 
                     value={classComment}
                     onChange={e => setClassComment(e.target.value)}
                     placeholder="E.g., Reviewing Chapter 4 concepts and addressing quiz concerns."
                     className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-violet-500 outline-none"
                     rows={2}
                  />
                </div>

                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Suggested Available Slots</label>
                {selectedSection ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-40 overflow-y-auto pr-2">
                     {suggestions.length > 0 ? suggestions.map((s, i) => (
                       <button key={i} onClick={() => handlePublish(s)} className="p-3 bg-slate-800 hover:bg-violet-600 rounded-xl text-left transition-colors group border border-white/5 hover:border-violet-500/50">
                          <div className="text-xs font-bold text-slate-300 group-hover:text-white">{s.day}</div>
                          <div className="text-sm font-bold text-white">{s.time}</div>
                       </button>
                     )) : <div className="text-slate-500 text-sm italic">No free slots found.</div>}
                  </div>
                ) : <div className="text-slate-500 text-sm italic p-4 border border-white/5 rounded-xl border-dashed">Select a section to see AI suggestions.</div>}
             </div>
          </div>
       </div>

       {/* Managed Sessions List */}
       <div>
          <h3 className="font-bold text-white text-lg mb-4">Active Support Classes</h3>
          {managedSessions.length === 0 ? (
             <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-3xl">No active support classes. Schedule one above.</div>
          ) : (
             <div className="space-y-4">
               {managedSessions.map(session => (
                 <div key={session.id} className="bg-slate-900 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1">
                       <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs font-bold rounded">{session.cohort.replace(/_/g, ' ')}</span>
                          <span className="text-slate-400 text-sm font-bold">{session.date} • {session.time}</span>
                       </div>
                       <p className="text-white font-bold mb-1">{session.comment || "Support Session"}</p>
                       <p className="text-xs text-slate-500">Targeting {session.targetStudents.length} identified students</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       {session.status === 'scheduled' && (
                          <button onClick={() => handleSendFeedbackForm(session.id)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-white/5 flex items-center gap-2">
                             <Send className="w-4 h-4"/> Send Feedback Form
                          </button>
                       )}
                       {session.status === 'feedback-pending' && (
                          <button onClick={() => handleSimulateResponses(session.id)} className="px-4 py-2 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 text-sm font-bold rounded-xl border border-yellow-600/20 flex items-center gap-2">
                             <Clock className="w-4 h-4"/> Collect Responses
                          </button>
                       )}
                       {session.status === 'completed' && (
                          <div className="px-4 py-2 bg-green-500/10 text-green-500 text-sm font-bold rounded-xl border border-green-500/20 flex items-center gap-2">
                             <CheckCircle className="w-4 h-4"/> Feedback Collected
                          </div>
                       )}
                    </div>
                 </div>
               ))}
             </div>
          )}
       </div>

       {/* Points Toast */}
       <AnimatePresence>
         {showPointsToast && (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="fixed bottom-8 right-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3">
               <Trophy className="w-6 h-6"/>
               <div>
                  <div className="font-bold text-lg">+{pointsEarned} Points!</div>
                  <div className="text-xs text-yellow-100">Feedback collection complete.</div>
               </div>
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

const InstructorClassesView: React.FC<{ instructorName: string }> = ({ instructorName }) => {
   const classes = getInstructorClasses(instructorName, REAL_TIMETABLE_DATA);
   const [selectedClass, setSelectedClass] = useState<any | null>(null);
   const [filter, setFilter] = useState('');

   // Get unique course names for filter
   const courseNames = Array.from(new Set(classes.map(c => c.Course)));
   
   const filteredClasses = filter ? classes.filter(c => c.Course === filter) : classes;

   return (
      <div className="animate-in fade-in space-y-6">
         <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-lg">Academic Timetable</h3>
            <div className="relative w-64">
               <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-500"/>
               <select onChange={(e) => setFilter(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none">
                  <option value="">All Courses</option>
                  {courseNames.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
         </div>

         {filteredClasses.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-white/5">
               No classes found matching criteria.
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredClasses.map((cls, idx) => (
                  <div 
                     key={idx} 
                     onClick={() => setSelectedClass(cls)}
                     className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 hover:bg-white/5 hover:border-violet-500/30 transition-all cursor-pointer group relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen className="w-24 h-24 text-white" />
                     </div>
                     <div className="relative z-10">
                        <div className="text-xs font-bold text-violet-400 mb-2 uppercase tracking-wide">{cls.Day} • {cls.Time}</div>
                        <h4 className="text-xl font-bold text-white mb-2 leading-tight">{cls.Course}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                           <Building2 className="w-4 h-4" />
                           {cls.Classroom}
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="inline-block px-3 py-1 bg-slate-800 rounded-lg text-xs text-slate-300 font-bold border border-white/5">
                            {cls.Section.replace(/_/g, ' ')}
                            </div>
                            {/* Simulating pending feedback status randomly */}
                            {idx % 3 === 0 && (
                                <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                                    <Clock className="w-3 h-3"/> Pending Feedback
                                </span>
                            )}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {selectedClass && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedClass(null)}>
               <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                     <div>
                        <h2 className="text-2xl font-bold text-white">{selectedClass.Course}</h2>
                        <p className="text-slate-400">{selectedClass.Section.replace(/_/g, ' ')}</p>
                     </div>
                     <button onClick={() => setSelectedClass(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X className="w-5 h-5 text-white"/></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Enrolled Students (Mock)</h4>
                        <ul className="space-y-2">
                           {['Liam Grayson', 'Emma Watson', 'Noah Smith', 'Olivia Jones', 'William Brown'].map((name, i) => (
                              <li key={i} className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-white/5">
                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                    {name.charAt(0)}
                                 </div>
                                 <span className="text-sm text-slate-300">{name}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Recent Class Feedback</h4>
                        <div className="space-y-3">
                           {MOCK_INSTRUCTOR_FEEDBACK.slice(0, 3).map(fb => (
                              <div key={fb.id} className="p-3 bg-slate-950 rounded-xl border border-white/5">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${fb.category === 'thankful' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{fb.category}</span>
                                    <span className="text-[10px] text-slate-500">{fb.timestamp}</span>
                                 </div>
                                 <p className="text-xs text-slate-300 italic">"{fb.comment}"</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

// ... End Shared Components

// --- Dashboards ---

const StudentDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedUserForBooking, setSelectedUserForBooking] = useState<any>(null);
  
  const handleBookUser = (u: any) => {
     setSelectedUserForBooking(u);
     setActiveTab('schedule');
  };

  return (
     <>
       <DashboardLayout role="student" user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>
          {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
                <div className="lg:col-span-3 space-y-8 animate-in fade-in duration-500">
                  <DigitalClockHero user={user} />
                  
                  {/* Restored Peer Tutor Horizontal List */}
                  <PeerTutorHorizontalList onBook={handleBookUser} />

                  {/* Restored Instructor List */}
                  <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">My Instructors</h3>
                        <button onClick={() => setActiveTab('schedule')} className="text-xs text-cyan-400 font-bold hover:text-cyan-300">View Schedule</button>
                     </div>
                     <div className="flex gap-4 overflow-x-auto pb-2">
                        {MOCK_INSTRUCTORS.map(i => (
                           <div key={i.id} className="min-w-[200px] p-4 bg-slate-950 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => handleBookUser(i)}>
                              <div className="flex items-center gap-3 mb-3">
                                 <img src={i.avatar} className="w-10 h-10 rounded-full" />
                                 <div>
                                    <div className="font-bold text-white text-sm">{i.name}</div>
                                    <div className="text-[10px] text-slate-500">{i.title}</div>
                                 </div>
                              </div>
                              <div className="text-xs text-slate-400">{i.specialty}</div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
                <div className="lg:col-span-1 hidden lg:block"><RightProfileSidebar user={user} onEdit={() => setEditingProfile(true)} /></div>
             </div>
          )}
          {activeTab === 'chat' && <ChatInterface role="student" />}
          {activeTab === 'sessions' && <StudentSessionsView />}
          {activeTab === 'schedule' && <StudentBookingView />}
          {activeTab === 'suggestions' && <StudentSuggestionView />}
       </DashboardLayout>
       {editingProfile && <EditProfileModal user={user} onClose={() => setEditingProfile(false)} />}
     </>
  );
};

const InstructorDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Cast user to Instructor to access specific fields
  const instructor = user as unknown as Instructor;
  
  // Calculate next badge progress
  const currentPoints = instructor.points || 0;
  const nextBadgeIndex = INSTRUCTOR_BADGES.findIndex(b => b.threshold > currentPoints);
  const nextBadge = nextBadgeIndex !== -1 ? INSTRUCTOR_BADGES[nextBadgeIndex] : INSTRUCTOR_BADGES[INSTRUCTOR_BADGES.length - 1];
  const prevBadgeThreshold = nextBadgeIndex > 0 ? INSTRUCTOR_BADGES[nextBadgeIndex - 1].threshold : 0;
  const progress = Math.min(100, Math.max(0, ((currentPoints - prevBadgeThreshold) / (nextBadge.threshold - prevBadgeThreshold)) * 100));

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
           <div className="lg:col-span-3 space-y-8 animate-in fade-in duration-500">
              {/* Welcome & Stats (Keep Rating) */}
              <div className="relative p-8 rounded-3xl bg-gradient-to-r from-violet-900 to-indigo-900 overflow-hidden shadow-2xl">
                 <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2">Welcome back, {user.name.split(' ')[0]}</h2>
                        <p className="text-violet-200 text-lg">Here is your feedback overview.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-white">{instructor.rating}/6.0</div>
                        <div className="text-xs text-violet-300 uppercase tracking-widest">Avg Rating</div>
                    </div>
                 </div>
              </div>

              {/* New: Impact & Progress (Replaces Analytics) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400"/> My Impact</h3>
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">🏆</div>
                       <div>
                          <div className="text-2xl font-black text-white">{currentPoints.toLocaleString()}</div>
                          <div className="text-xs text-slate-400 uppercase font-bold tracking-wide">Total Points</div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-bold text-slate-400">
                          <span>Current: {instructor.badge}</span>
                          <span>Next: {nextBadge.name}</span>
                       </div>
                       <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000" style={{width: `${progress}%`}}></div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-cyan-400"/> Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => setActiveTab('schedule')} className="p-4 bg-slate-800 hover:bg-violet-600/20 hover:border-violet-500 border border-white/5 rounded-2xl transition-all text-left group">
                          <Plus className="w-6 h-6 text-violet-400 group-hover:text-violet-300 mb-2"/>
                          <div className="font-bold text-white text-sm">Create Class</div>
                          <div className="text-[10px] text-slate-500 group-hover:text-slate-400">Support Session</div>
                       </button>
                       <button onClick={() => setActiveTab('classes')} className="p-4 bg-slate-800 hover:bg-cyan-600/20 hover:border-cyan-500 border border-white/5 rounded-2xl transition-all text-left group">
                          <CheckCircle className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 mb-2"/>
                          <div className="font-bold text-white text-sm">Review</div>
                          <div className="text-[10px] text-slate-500 group-hover:text-slate-400">Pending Feedback</div>
                       </button>
                    </div>
                 </div>
              </div>
              
              {/* Recent Activity Feed */}
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                 <h3 className="font-bold text-white mb-4">Recent Activity</h3>
                 <div className="space-y-4">
                    <div className="flex gap-4 items-start pb-4 border-b border-white/5">
                       <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Check className="w-4 h-4"/></div>
                       <div>
                          <div className="text-sm font-bold text-white">Class Completed</div>
                          <div className="text-xs text-slate-400">Managerial Economics • Section A</div>
                       </div>
                       <div className="ml-auto text-xs text-slate-500">2h ago</div>
                    </div>
                    <div className="flex gap-4 items-start">
                       <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Star className="w-4 h-4"/></div>
                       <div>
                          <div className="text-sm font-bold text-white">New Rating Received</div>
                          <div className="text-xs text-slate-400">+50 Points earned from feedback</div>
                       </div>
                       <div className="ml-auto text-xs text-slate-500">5h ago</div>
                    </div>
                 </div>
              </div>

           </div>
           
           <div className="lg:col-span-1 hidden lg:block">
              <RightProfileSidebar user={user} onEdit={() => setEditingProfile(true)} />
           </div>
        </div>
      );
      case 'feedback': return <InstructorFeedbackAnalytics />;
      case 'schedule': return <SmartSupportClassScheduler instructor={instructor} />;
      case 'classes': return <InstructorClassesView instructorName={user.name} />;
      case 'chat': return <ChatInterface role="instructor" />;
      default: return null;
    }
  };

  return (
    <>
      <DashboardLayout role="instructor" user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>{renderContent()}</DashboardLayout>
      {editingProfile && <EditProfileModal user={user} onClose={() => setEditingProfile(false)} />}
    </>
  );
};

// ... (TutorDashboard, AdminDashboard - Simplified)
const TutorDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => <DashboardLayout role="tutor" user={user} activeTab="dashboard" onTabChange={() => {}} onLogout={onLogout}><div className="text-white p-8">Tutor Dashboard</div></DashboardLayout>;
const AdminDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => <DashboardLayout role="admin" user={user} activeTab="dashboard" onTabChange={() => {}} onLogout={onLogout}><div className="text-white p-8">Admin Dashboard</div></DashboardLayout>;

const DashboardLayout: React.FC<{ role: Role, user: User, activeTab: string, onTabChange: (t: string) => void, onLogout: () => void, children: React.ReactNode }> = ({ role, user, activeTab, onTabChange, onLogout, children }) => {
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.student;
  const accentColor = role === 'student' ? 'text-cyan-500' : role === 'tutor' ? 'text-orange-500' : role === 'admin' ? 'text-red-500' : 'text-violet-500';
  const activeBg = role === 'student' ? 'bg-cyan-600' : role === 'tutor' ? 'bg-orange-600' : role === 'admin' ? 'bg-red-600' : 'bg-violet-600';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex overflow-hidden">
      <motion.aside className="w-20 lg:w-24 bg-slate-900 border-r border-white/5 flex flex-col items-center py-8 gap-8 z-20">
        <button onClick={() => onTabChange('dashboard')}><Logo className={`w-10 h-10 ${accentColor} hover:scale-110 transition-transform`} /></button>
        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          {navItems.map((item: any) => (
            <button key={item.id} onClick={() => onTabChange(item.id)} className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all group relative ${activeTab === item.id ? `${activeBg} text-white shadow-lg` : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
              <item.icon className="w-6 h-6" />
              <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 z-50">{item.label}</div>
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"><LogOut className="w-6 h-6" /></button>
      </motion.aside>
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-20 px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-white/5 shrink-0 z-10">
          <div className="relative w-96"><Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" /><input type="text" placeholder="Search..." className="w-full bg-slate-950 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" /></div>
          <div className="flex items-center gap-6"><NotificationPopover /><div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-white/10"><img src={user.avatar} className="w-full h-full object-cover" /></div></div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-slate-800">{children}</div>
      </main>
    </div>
  );
};

const PolicyModal: React.FC<{ type: 'terms' | 'privacy', onClose: () => void }> = ({ type, onClose }) => (
   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h2>
            <button onClick={onClose}><X className="w-6 h-6 text-slate-400 hover:text-white"/></button>
         </div>
         <div className="prose prose-invert prose-sm text-slate-300">
            <p>Welcome to ScholarX. By using our platform, you agree to comply with our academic integrity standards.</p>
            <h3 className="text-white font-bold mt-4">1. Acceptable Use</h3>
            <p>Users must maintain respectful communication. Harassment or misuse of the feedback system will result in suspension.</p>
            <h3 className="text-white font-bold mt-4">2. Data Privacy</h3>
            <p>We value your privacy. Feedback submitted anonymously remains anonymous to instructors, though administrators may access metadata for safety purposes.</p>
            <h3 className="text-white font-bold mt-4">3. Content Ownership</h3>
            <p>Course materials shared remain the property of the institution. Student submissions are their own intellectual property.</p>
         </div>
      </motion.div>
   </div>
);

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [policyType, setPolicyType] = useState<'terms' | 'privacy' | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-950 to-slate-950"></div>
       <div className="relative z-10 text-center px-4 flex-1 flex flex-col justify-center">
         <Logo className="w-20 h-20 text-white mx-auto mb-8 animate-pulse" />
         <h1 className="text-6xl font-black mb-6 tracking-tighter">ScholarX</h1>
         <p className="text-xl text-slate-400 mb-10 max-w-lg mx-auto">The advanced academic platform for feedback, collaboration, and growth.</p>
         <button onClick={onLogin} className="px-8 py-4 bg-white text-slate-950 font-bold rounded-full text-lg hover:scale-105 transition-transform mx-auto">Get Started</button>
       </div>
       <footer className="relative z-10 w-full p-6 border-t border-white/5 flex justify-center gap-8 text-sm text-slate-500">
          <button onClick={() => setPolicyType('terms')} className="hover:text-white transition-colors">Terms of Service</button>
          <button onClick={() => setPolicyType('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
       </footer>
       {policyType && <PolicyModal type={policyType} onClose={() => setPolicyType(null)} />}
    </div>
  );
};

const AuthPage: React.FC<{ onComplete: (role: Role) => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const roles: {id: Role, label: string}[] = [{id: 'student', label: 'Student'}, {id: 'instructor', label: 'Instructor'}, {id: 'tutor', label: 'Peer Tutor'}, {id: 'admin', label: 'Admin'}];
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
       <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 font-bold"><ArrowLeft className="w-5 h-5" /> Back</button>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
          {roles.map(r => (
            <button key={r.id} onClick={() => onComplete(r.id)} className="h-64 bg-slate-900/50 border border-white/10 rounded-3xl hover:bg-white/5 hover:border-violet-500 hover:scale-105 transition-all group flex flex-col items-center justify-center gap-4">
               <div className={`p-4 rounded-full bg-slate-950 group-hover:bg-white text-white group-hover:text-slate-950 transition-colors`}>
                  {r.id === 'student' ? <Users /> : r.id === 'instructor' ? <GraduationCap /> : r.id === 'tutor' ? <Award /> : <Shield />}
               </div>
               <span className="font-bold text-xl">{r.label}</span>
            </button>
          ))}
       </div>
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
