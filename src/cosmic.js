import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Target, Lock, Folder, Plus, X, Check, Star, Sparkles, Moon, Sun, Bell, Edit2, Trash2, ChevronDown, ChevronRight, Zap, TrendingUp, AlertCircle, Brain, Mic, Image, FileText, Activity, BarChart3, RefreshCw, MessageSquare, Send, BellRing, Menu, Settings, Search, Filter, Link2, Archive, Eye, EyeOff, Save, Copy, Download, Upload } from 'lucide-react';

const CosmicAssistant = () => {
  // Core state
  const [activeView, setActiveView] = useState('dashboard');
  const [dailyGoals, setDailyGoals] = useState([]);
  const [longTermGoals, setLongTermGoals] = useState([]);
  const [secretNotes, setSecretNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // UI state
  const [showModal, setShowModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [showChat, setShowChat] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [vaultPassword, setVaultPassword] = useState('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  
  // AI & Advanced features
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [aiInsights, setAiInsights] = useState({ alignment: 85, productivity: 'high', recommendation: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [energyLevel, setEnergyLevel] = useState('peak');
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  
  // In-memory storage instead of localStorage
  const storageData = useRef({
    dailyGoals: [],
    longTermGoals: [],
    secretNotes: [],
    folders: [],
    tasks: [],
    theme: 'dark'
  });
  
  // Load data on mount
  useEffect(() => {
    setDailyGoals(storageData.current.dailyGoals);
    setLongTermGoals(storageData.current.longTermGoals);
    setSecretNotes(storageData.current.secretNotes);
    setFolders(storageData.current.folders);
    setTasks(storageData.current.tasks);
    setTheme(storageData.current.theme);
  }, []);
  
  // Save data whenever it changes
  useEffect(() => {
    storageData.current = {
      dailyGoals,
      longTermGoals,
      secretNotes,
      folders,
      tasks,
      theme
    };
  }, [dailyGoals, longTermGoals, secretNotes, folders, tasks, theme]);
  
  // Time and energy tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateEnergyLevel();
      checkReminders();
    }, 60000);
    return () => clearInterval(timer);
  }, [dailyGoals, tasks]);
  
  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  const updateEnergyLevel = () => {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 12) setEnergyLevel('peak');
    else if (hour >= 14 && hour < 17) setEnergyLevel('high');
    else if (hour >= 6 && hour < 9) setEnergyLevel('rising');
    else if (hour >= 12 && hour < 14) setEnergyLevel('dip');
    else setEnergyLevel('low');
  };
  
  const checkReminders = () => {
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    dailyGoals.forEach(goal => {
      if (goal.reminder && goal.time === currentTimeStr && !goal.completed && !goal.reminded) {
        showNotification('⏰ Goal Reminder', goal.title);
        setDailyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, reminded: true } : g));
      }
    });
    
    tasks.forEach(task => {
      if (task.time === currentTimeStr && !task.completed && !task.reminded) {
        showNotification('📋 Task Reminder', task.title);
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, reminded: true } : t));
      }
    });
  };
  
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        showNotification('Notifications Enabled', "You'll receive reminders for your goals and tasks");
      }
    }
  };
  
  const showNotification = (title, body) => {
    setNotifications(prev => [...prev, { id: Date.now(), title, body, time: new Date() }]);
  };
  
  const calculateGoalAlignment = () => {
    if (longTermGoals.length === 0) return 100;
    const todayTasks = dailyGoals.filter(g => !g.completed);
    const alignedTasks = todayTasks.filter(task => 
      longTermGoals.some(goal => 
        task.linkedGoalId === goal.id || 
        task.title.toLowerCase().includes(goal.title.toLowerCase().split(' ')[0])
      )
    );
    return Math.round((alignedTasks.length / Math.max(todayTasks.length, 1)) * 100);
  };
  
  // CRUD Operations
  const addDailyGoal = (goal) => {
    const newGoal = { 
      id: Date.now(), 
      ...goal, 
      completed: false, 
      reminder: goal.reminder !== false,
      createdAt: new Date().toISOString()
    };
    setDailyGoals([...dailyGoals, newGoal]);
    showNotification('Goal Added', goal.title);
    setShowModal(null);
  };
  
  const addLongTermGoal = (goal) => {
    setLongTermGoals([...longTermGoals, { 
      id: Date.now(), 
      ...goal, 
      progress: 0, 
      milestones: goal.milestones || [],
      createdAt: new Date().toISOString()
    }]);
    showNotification('Long-term Goal Created', goal.title);
    setShowModal(null);
  };
  
  const addTask = (task) => {
    setTasks([...tasks, { 
      id: Date.now(), 
      ...task, 
      completed: false,
      estimatedDuration: task.estimatedDuration || 30,
      priority: task.priority || 'medium'
    }]);
    showNotification('Task Added', task.title);
    setShowModal(null);
  };
  
  const addFolder = (folder) => {
    setFolders([...folders, { 
      id: Date.now(), 
      ...folder, 
      items: [],
      createdAt: new Date().toISOString()
    }]);
    showNotification('Folder Created', folder.name);
    setShowModal(null);
  };
  
  const addSecretNote = (note) => {
    setSecretNotes([...secretNotes, {
      id: Date.now(),
      ...note,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }]);
    showNotification('Secret Note Saved', 'Note securely stored');
    setShowModal(null);
  };
  
  const deleteItem = (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    switch(type) {
      case 'daily':
        setDailyGoals(dailyGoals.filter(g => g.id !== id));
        break;
      case 'longterm':
        setLongTermGoals(longTermGoals.filter(g => g.id !== id));
        break;
      case 'task':
        setTasks(tasks.filter(t => t.id !== id));
        break;
      case 'folder':
        setFolders(folders.filter(f => f.id !== id));
        break;
      case 'secret':
        setSecretNotes(secretNotes.filter(n => n.id !== id));
        break;
      default:
        break;
    }
    showNotification('Deleted', 'Item removed successfully');
  };
  
  const toggleTaskComplete = (id, type) => {
    if (type === 'daily') {
      setDailyGoals(dailyGoals.map(g => {
        if (g.id === id) {
          const newCompleted = !g.completed;
          if (newCompleted) {
            showNotification('Goal Completed! 🎉', g.title);
            if (g.linkedGoalId) {
              updateLongTermProgress(g.linkedGoalId);
            }
          }
          return { ...g, completed: newCompleted };
        }
        return g;
      }));
    } else if (type === 'task') {
      setTasks(tasks.map(t => {
        if (t.id === id && !t.completed) {
          showNotification('Task Done! ✅', t.title);
        }
        return t.id === id ? { ...t, completed: !t.completed } : t;
      }));
    }
  };
  
  const updateLongTermProgress = (goalId) => {
    const linkedTasks = dailyGoals.filter(g => g.linkedGoalId === goalId);
    const completedLinked = linkedTasks.filter(g => g.completed).length;
    const progress = linkedTasks.length > 0 ? Math.round((completedLinked / linkedTasks.length) * 100) : 0;
    
    setLongTermGoals(longTermGoals.map(lg => 
      lg.id === goalId ? { ...lg, progress } : lg
    ));
  };
  
  // AI Chat Functions
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMessage = { id: Date.now(), sender: 'user', text: chatInput, time: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      const response = processAICommand(chatInput);
      const aiMessage = { id: Date.now() + 1, sender: 'ai', text: response, time: new Date() };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 500);
    
    setChatInput('');
  };
  
  const processAICommand = (input) => {
    const lower = input.toLowerCase();
    
    if (lower.includes('add goal') || lower.includes('create goal')) {
      const goalText = input.replace(/add goal|create goal/i, '').trim();
      if (goalText) {
        addDailyGoal({ title: goalText, time: '' });
        return `✅ Added daily goal: "${goalText}"`;
      }
      return "What goal would you like to add?";
    }
    
    if (lower.includes('add task') || lower.includes('schedule')) {
      const taskText = input.replace(/add task|schedule/i, '').trim();
      if (taskText) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        addTask({ title: taskText, time: now.toTimeString().slice(0, 5), priority: 'medium' });
        return `✅ Scheduled task: "${taskText}" for ${now.toTimeString().slice(0, 5)}`;
      }
      return "What task should I schedule?";
    }
    
    if (lower.includes('alignment') || lower.includes('progress')) {
      const alignment = calculateGoalAlignment();
      return `📊 Your goal alignment is ${alignment}%. ${alignment > 80 ? 'Great job!' : 'Consider linking more tasks to your long-term goals.'}`;
    }
    
    if (lower.includes('energy') || lower.includes('when should i')) {
      return `⚡ Your energy level is ${energyLevel}. ${
        energyLevel === 'peak' ? 'Perfect time for your most important tasks!' :
        energyLevel === 'high' ? 'Good time for focused work.' :
        energyLevel === 'dip' ? 'Consider taking a break or doing lighter tasks.' :
        'Energy is low. Time to rest or do simple tasks.'
      }`;
    }
    
    if (lower.includes('stats') || lower.includes('summary')) {
      const completed = dailyGoals.filter(g => g.completed).length;
      const total = dailyGoals.length;
      return `📈 Today: ${completed}/${total} goals completed. ${longTermGoals.length} long-term goals tracked. ${tasks.length} tasks scheduled.`;
    }
    
    return `I can help you with:
• "Add goal [title]" - Create a new goal
• "Add task [title]" - Schedule a new task
• "Show alignment" - Check goal alignment
• "Energy advice" - Get productivity tips
• "Show stats" - See your progress`;
  };
  
  // Voice capture simulation
  const startVoiceCapture = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const voiceTask = {
        title: "Meeting about project strategy",
        time: new Date().toTimeString().slice(0, 5),
        priority: 'high'
      };
      addTask(voiceTask);
    }, 2000);
  };
  
  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setTimeout(() => {
      const extractedTask = {
        title: `Review ${file.name}`,
        time: new Date().toTimeString().slice(0, 5),
        priority: 'medium'
      };
      addTask(extractedTask);
    }, 1000);
  };
  
  // Theme colors
  const themeColors = theme === 'dark' ? {
    bg: 'from-indigo-950 via-purple-950 to-pink-950',
    cardBg: 'bg-black/30',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    border: 'border-purple-500/30',
    inputBg: 'bg-black/20',
    hoverBg: 'hover:bg-white/10'
  } : {
    bg: 'from-blue-100 via-purple-100 to-pink-100',
    cardBg: 'bg-white/80',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-purple-300/50',
    inputBg: 'bg-white/50',
    hoverBg: 'hover:bg-gray-200/50'
  };
  
  // Modal Component
  const Modal = ({ onClose, children, title }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`${themeColors.cardBg} backdrop-blur-xl rounded-2xl p-6 border ${themeColors.border} shadow-2xl max-w-md w-full relative z-10 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${themeColors.text}`}>{title}</h3>
          <button onClick={onClose} className={`${themeColors.textSecondary} hover:text-purple-400 transition-colors`}>
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
  
  // Daily Goal Modal
  const DailyGoalModal = () => {
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [linkedGoal, setLinkedGoal] = useState('');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (title.trim()) {
        addDailyGoal({ title, time, linkedGoalId: linkedGoal || null });
      }
    };
    
    return (
      <Modal onClose={() => setShowModal(null)} title="Add Daily Goal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="What do you want to achieve today?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            autoFocus
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
          <select
            value={linkedGoal}
            onChange={(e) => setLinkedGoal(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            <option value="">Link to long-term goal (optional)</option>
            {longTermGoals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            Add Goal
          </button>
        </form>
      </Modal>
    );
  };
  
  // Long-term Goal Modal
  const LongTermGoalModal = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState('');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (title.trim()) {
        addLongTermGoal({ title, description, targetDate });
      }
    };
    
    return (
      <Modal onClose={() => setShowModal(null)} title="Create Long-term Goal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="What's your long-term goal?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            autoFocus
          />
          <textarea
            placeholder="Describe your goal..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none`}
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            Create Goal
          </button>
        </form>
      </Modal>
    );
  };
  
  // Task Modal
  const TaskModal = () => {
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [priority, setPriority] = useState('medium');
    const [duration, setDuration] = useState(30);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (title.trim()) {
        addTask({ title, time, priority, estimatedDuration: duration });
      }
    };
    
    return (
      <Modal onClose={() => setShowModal(null)} title="Add Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            autoFocus
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="5"
            step="5"
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            Add Task
          </button>
        </form>
      </Modal>
    );
  };
  
  // Secret Note Modal
  const SecretNoteModal = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (title.trim() && content.trim()) {
        addSecretNote({ title, content });
      }
    };
    
    return (
      <Modal onClose={() => setShowModal(null)} title="Add Secret Note">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            autoFocus
          />
          <textarea
            placeholder="Your secret note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none`}
          />
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            Save Note
          </button>
        </form>
      </Modal>
    );
  };

  // Vault View
  const VaultView = () => {
    const handleUnlock = (e) => {
      e.preventDefault();
      if (vaultPassword === 'cosmic') {
        setIsVaultUnlocked(true);
      } else {
        alert('Incorrect password! Hint: cosmic');
      }
    };

    if (!isVaultUnlocked) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={`${themeColors.cardBg} backdrop-blur-xl rounded-2xl p-8 border ${themeColors.border} max-w-md w-full`}>
            <Lock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className={`text-2xl font-bold ${themeColors.text} text-center mb-6`}>Secret Vault</h2>
            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                placeholder="Enter password"
                value={vaultPassword}
                onChange={(e) => setVaultPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                autoFocus
              />
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all"
              >
                Unlock Vault
              </button>
            </form>
            <p className={`${themeColors.textSecondary} text-xs text-center mt-4`}>Hint: cosmic</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-3xl font-bold ${themeColors.text}`}>Secret Notes</h2>
          <button
            onClick={() => setShowModal('secret-note')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Note
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secretNotes.map(note => (
            <div key={note.id} className={`${themeColors.cardBg} backdrop-blur-xl rounded-xl p-6 border ${themeColors.border} hover:shadow-lg transition-all`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className={`text-xl font-bold ${themeColors.text}`}>{note.title}</h3>
                <button
                  onClick={() => deleteItem(note.id, 'secret')}
                  className={`${themeColors.textSecondary} hover:text-red-500 transition-colors`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className={`${themeColors.textSecondary} text-sm whitespace-pre-wrap`}>{note.content}</p>
              <p className={`${themeColors.textSecondary} text-xs mt-3`}>
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {secretNotes.length === 0 && (
            <div className="col-span-2">
              <div className={`${themeColors.cardBg} backdrop-blur-xl rounded-xl p-12 border ${themeColors.border} text-center`}>
                <Lock className={`w-16 h-16 ${themeColors.textSecondary} mx-auto mb-4`} />
                <p className={`${themeColors.text} text-lg mb-2`}>No secret notes yet</p>
                <p className={`${themeColors.textSecondary}`}>Your private thoughts are safe here!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Dashboard View
  const DashboardView = () => {
    const alignment = calculateGoalAlignment();
    const completedToday = dailyGoals.filter(g => g.completed).length;
    const totalToday = dailyGoals.length;
    
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}
            </h1>
          </div>
          <p className={`${themeColors.textSecondary} text-lg`}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className={`${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'} text-2xl font-semibold mt-2`}>
            {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* AI Insights Panel */}
        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40' : 'bg-gradient-to-br from-purple-200/60 to-pink-200/60'} rounded-2xl p-6 border ${themeColors.border} backdrop-blur-xl shadow-2xl`}>
          <div className="flex items-center gap-3 mb-4">
            <Brain className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`} />
            <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>AI Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${themeColors.cardBg} rounded-xl p-4 backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`${themeColors.textSecondary} text-sm`}>Goal Alignment</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>{alignment}%</div>
              <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-2 mt-2`}>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all" style={{ width: `${alignment}%` }}></div>
              </div>
            </div>
            
            <div className={`${themeColors.cardBg} rounded-xl p-4 backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`${themeColors.textSecondary} text-sm`}>Energy Level</span>
                <Zap className={`w-5 h-5 ${energyLevel === 'peak' ? 'text-yellow-400' : 'text-green-400'}`} />
              </div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'} capitalize`}>{energyLevel}</div>
              <div className={`text-xs ${themeColors.textSecondary} mt-1`}>
                {energyLevel === 'peak' ? 'Best time for complex tasks' : 'Good for moderate work'}
              </div>
            </div>
            
            <div className={`${themeColors.cardBg} rounded-xl p-4 backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`${themeColors.textSecondary} text-sm`}>Today's Progress</span>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                {completedToday}/{totalToday}
              </div>
              <div className={`text-xs ${themeColors.textSecondary} mt-1`}>
                {totalToday > 0 ? `${Math.round((completedToday/totalToday)*100)}% completed` : 'No goals set'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Capture */}
        <div className={`${themeColors.cardBg} backdrop-blur-xl rounded-2xl p-4 border ${themeColors.border} shadow-lg`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-900'} mb-3 flex items-center gap-2`}>
            <Sparkles className="w-5 h-5" /> Quick Capture
          </h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={startVoiceCapture}
              disabled={isRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isRecording 
                  ? 'bg-red-600 animate-pulse text-white' 
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg text-white'
              }`}
            >
              <Mic className="w-5 h-5" />
              {isRecording ? 'Recording...' : 'Voice Note'}
            </button>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg transition-all text-white"
            >
              <Upload className="w-5 h-5" />
              Upload File
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />
            
            <button 
              onClick={() => setShowModal('task')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition-all text-white"
            >
              <Edit2 className="w-5 h-5" />
              Quick Task
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40' : 'bg-gradient-to-br from-purple-200/60 to-pink-200/60'} rounded-2xl p-6 border ${themeColors.border} backdrop-blur-xl shadow-2xl hover:scale-105 transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'} flex items-center gap-2`}>
                <Target className="w-6 h-6" /> Daily Goals
              </h3>
              <span className={`${theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-300/50'} px-3 py-1 rounded-full text-sm`}>
                {completedToday}/{totalToday}
              </span>
            </div>
            <div className="space-y-2">
              {dailyGoals.slice(0, 3).map(goal => (
                <div key={goal.id} className={`flex items-center gap-2 ${themeColors.text}`}>
                  <Check className={`w-4 h-4 ${goal.completed ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className={goal.completed ? 'line-through text-gray-500' : ''}>{goal.title}</span>
                </div>
              ))}
              {dailyGoals.length === 0 && (
                <p className={`${themeColors.textSecondary} text-sm`}>No goals set for today</p>
              )}
            </div>
            <button 
              onClick={() => setActiveView('goals')} 
              className={`mt-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} text-sm hover:underline`}
            >
              View all →
            </button>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40' : 'bg-gradient-to-br from-blue-200/60 to-cyan-200/60'} rounded-2xl p-6 border ${themeColors.border} backdrop-blur-xl shadow-2xl hover:scale-105 transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'} flex items-center gap-2`}>
                <Clock className="w-6 h-6" /> Tasks
              </h3>
              <span className={`${theme === 'dark' ? 'bg-blue-500/30' : 'bg-blue-300/50'} px-3 py-1 rounded-full text-sm`}>
                {tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className={`flex items-center justify-between ${themeColors.text}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>{task.time}</span>
                    <span className="text-sm">{task.title}</span>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className={`${themeColors.textSecondary} text-sm`}>No tasks scheduled</p>
              )}
            </div>
            <button 
              onClick={() => setActiveView('tasks')} 
              className={`mt-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'} text-sm hover:underline`}
            >
              Manage tasks →
            </button>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40' : 'bg-gradient-to-br from-pink-200/60 to-purple-200/60'} rounded-2xl p-6 border ${themeColors.border} backdrop-blur-xl shadow-2xl hover:scale-105 transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-pink-200' : 'text-pink-900'} flex items-center gap-2`}>
                <Star className="w-6 h-6" /> Long-term Goals
              </h3>
              <span className={`${theme === 'dark' ? 'bg-pink-500/30' : 'bg-pink-300/50'} px-3 py-1 rounded-full text-sm`}>
                {longTermGoals.length}
              </span>
            </div>
            <div className="space-y-3">
              {longTermGoals.slice(0, 2).map(goal => (
                <div key={goal.id}>
                  <p className={`${themeColors.text} text-sm mb-1`}>{goal.title}</p>
                  <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-300/50'} rounded-full h-2`}>
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all" style={{ width: `${goal.progress}%` }}></div>
                  </div>
                </div>
              ))}
              {longTermGoals.length === 0 && (
                <p className={`${themeColors.textSecondary} text-sm`}>No long-term goals set</p>
              )}
            </div>
            <button 
              onClick={() => setActiveView('longterm')} 
              className={`mt-4 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-700'} text-sm hover:underline`}
            >
              Track progress →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Daily Goals View
  const DailyGoalsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-3xl font-bold ${themeColors.text}`}>Daily Goals</h2>
        <button
          onClick={() => setShowModal('daily-goal')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {dailyGoals.map(goal => (
          <div key={goal.id} className={`${themeColors.cardBg} backdrop-blur-xl rounded-xl p-4 border ${themeColors.border} hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => toggleTaskComplete(goal.id, 'daily')}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    goal.completed 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500' 
                      : `border-purple-500 ${themeColors.hoverBg}`
                  }`}
                >
                  {goal.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <h3 className={`font-semibold ${goal.completed ? 'line-through text-gray-500' : themeColors.text}`}>
                    {goal.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {goal.time && (
                      <span className={`text-xs ${themeColors.textSecondary} flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        {goal.time}
                      </span>
                    )}
                    {goal.linkedGoalId && (
                      <span className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} flex items-center gap-1`}>
                        <Link2 className="w-3 h-3" />
                        Linked
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteItem(goal.id, 'daily')}
                className={`${themeColors.textSecondary} hover:text-red-500 transition-colors`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {dailyGoals.length === 0 && (
          <div className={`${themeColors.cardBg} backdrop-blur-xl rounded-xl p-12 border ${themeColors.border} text-center`}>
            <Target className={`w-16 h-16 ${themeColors.textSecondary} mx-auto mb-4`} />
            <p className={`${themeColors.text} text-lg mb-2`}>No daily goals yet</p>
            <p className={`${themeColors.textSecondary}`}>Start by adding your first goal for today!</p>
          </div>
        )}
      </div>
    </div>
  );

  // Long-term Goals View
  const LongTermGoalsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-3xl font-bold ${themeColors.text}`}>Long-term Goals</h2>
        <button
          onClick={() => setShowModal('longterm-goal')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {longTermGoals.map(goal => (
          <div key={goal.id} className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40' : 'bg-gradient-to-br from-purple-200/60 to-pink-200/60'} backdrop-blur-xl rounded-2xl p-6 border ${themeColors.border} shadow-xl hover:scale-105 transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${themeColors.text} mb-2`}>{goal.title}</h3>
                {goal.description && (
                  <p className={`${themeColors.textSecondary} text-sm mb-3`}>{goal.description}</p>
                )}
                {goal.targetDate && (
                  <span className={`text-xs ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} flex items-center gap-1`}>
                    <Calendar className="w-3 h-3" />
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteItem(goal.id, 'longterm')}
                className={`${themeColors.textSecondary} hover:text-red-500 transition-colors`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${themeColors.textSecondary}`}>Progress</span>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                  {goal.progress}%
                </span>
              </div>
              <div className={`w-full ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-300/50'} rounded-full h-3`}>
                <div 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
        {longTermGoals.length === 0 && (
          <div className="col-span-2">
            <div className={`${themeColors.cardBg} backdrop-blur-xl rounded-xl p-12 border ${themeColors.border} text-center`}>
              <Star className={`w-16 h-16 ${themeColors.textSecondary} mx-auto mb-4`} />
              <p className={`${themeColors.text} text-lg mb-2`}>No long-term goals yet</p>
              <p className={`${themeColors.textSecondary}`}>Create your first long-term goal to track your progress!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Tasks View
  const TasksView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-3xl font-bold ${themeColors.text}`}>Smart Tasks</h2>
        <button
          onClick={() => setShowModal('task')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => (
          <div key={task.id} className={`${themeColors.cardBg} backdrop-blur-xl rounded-xl p-4 border ${themeColors.border} hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => toggleTaskComplete(task.id, 'task')}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500' 
                      : `border-blue-500 ${themeColors.hoverBg}`
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : themeColors.text}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {task.time && (
                      <span className={`text-xs ${themeColors.textSecondary} flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        {task.time}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                    {task.estimatedDuration && (
                      <span className={`text-xs ${themeColors.textSecondary}`}>
                        {task.estimatedDuration}min
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteItem(task.id, 'task')}
                className={`${themeColors.textSecondary} hover:text-red-500 transition-colors`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className={`${themeColors.cardBg} backdrop-blur-xl rounded-xl p-12 border ${themeColors.border} text-center`}>
            <Clock className={`w-16 h-16 ${themeColors.textSecondary} mx-auto mb-4`} />
            <p className={`${themeColors.text} text-lg mb-2`}>No tasks scheduled</p>
            <p className={`${themeColors.textSecondary}`}>Add your first task to get started!</p>
          </div>
        )}
      </div>
    </div>
  );

  // Main render
  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.bg} ${themeColors.text} relative overflow-hidden`}>
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Cosmic Assistant
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg ${themeColors.hoverBg} transition-colors relative`}
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 ${themeColors.cardBg} backdrop-blur-xl rounded-xl border ${themeColors.border} shadow-2xl p-4 max-h-96 overflow-y-auto`}>
                  <h3 className="font-bold mb-3">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className={`${themeColors.textSecondary} text-sm`}>No notifications</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.slice().reverse().map(notif => (
                        <div key={notif.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                          <p className="font-semibold text-sm">{notif.title}</p>
                          <p className={`text-xs ${themeColors.textSecondary}`}>{notif.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-lg ${themeColors.hoverBg} transition-colors`}
            >
              {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            {/* AI Chat toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              AI Chat
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'goals', icon: Target, label: 'Daily Goals' },
            { id: 'longterm', icon: Star, label: 'Long-term' },
                        { id: 'tasks', icon: Clock, label: 'Tasks' },
            { id: 'vault', icon: Lock, label: 'Vault' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${
                activeView === id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : `${themeColors.hoverBg} ${themeColors.textSecondary}`
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Main Content View */}
        <div className="animate-fade-in">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'goals' && <DailyGoalsView />}
          {activeView === 'longterm' && <LongTermGoalsView />}
          {activeView === 'tasks' && <TasksView />}
          {activeView === 'vault' && <VaultView />}
        </div>

        {/* Floating Modals */}
        {showModal === 'daily-goal' && <DailyGoalModal />}
        {showModal === 'longterm-goal' && <LongTermGoalModal />}
        {showModal === 'task' && <TaskModal />}
        {showModal === 'secret-note' && <SecretNoteModal />}

        {/* AI Chat Window */}
        {showChat && (
          <div
            className={`fixed bottom-4 right-4 w-96 h-[500px] ${themeColors.cardBg} border ${themeColors.border} rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col`}
          >
            <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
              <h3 className="font-semibold">Cosmic AI</h3>
              <button
                onClick={() => setShowChat(false)}
                className={`${themeColors.textSecondary} hover:text-red-500 transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : `${themeColors.cardBg} border ${themeColors.border}`
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            <form onSubmit={handleChatSubmit} className="p-3 border-t border-purple-500/30 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask something..."
                className={`flex-1 px-3 py-2 rounded-xl ${themeColors.inputBg} ${themeColors.text} border ${themeColors.border} focus:outline-none`}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center mt-10 text-sm opacity-60">
        Cosmic Assistant © {new Date().getFullYear()} — Designed for productivity 🌌
      </footer>
    </div>
  );
};

export default CosmicAssistant;
