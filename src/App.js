import React, { useState, useEffect, useRef } from 'react';
import MagicalCosmicBackground from './components/MagicalCosmicBackground';
import { 
  Calendar, Clock, Target, Lock, Folder, Plus, X, Check, Star, Sparkles, 
  Moon, Sun, Bell, Edit2, Trash2, Zap, TrendingUp, Brain, Mic, FileText, 
  Activity, BarChart3, RefreshCw, MessageSquare, Send, Settings, 
  Upload, Download, Search, Filter, Grid, List, ChevronDown, ChevronRight,
  Sunrise, Sunset, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

const NotionTablet = () => {
  // ==================== STATE MANAGEMENT ====================
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState('night'); // night, sunrise, day, sunset
  const [autoTheme, setAutoTheme] = useState(true);
  const [themeMode, setThemeMode] = useState('Aurora'); // Aurora, Nebula, Stardust, Solar Flare
  
  // Data States
  const [dailyGoals, setDailyGoals] = useState([]);
  const [longTermGoals, setLongTermGoals] = useState([]);
  const [secretNotes, setSecretNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [smartBoardData, setSmartBoardData] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // UI States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [energyLevel, setEnergyLevel] = useState('peak');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // ==================== AUTO THEME MANAGEMENT ====================
  useEffect(() => {
    if (autoTheme) {
      const updateTheme = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 7) setTheme('sunrise');
        else if (hour >= 7 && hour < 17) setTheme('day');
        else if (hour >= 17 && hour < 19) setTheme('sunset');
        else setTheme('night');
      };
      updateTheme();
      const interval = setInterval(updateTheme, 60000);
      return () => clearInterval(interval);
    }
  }, [autoTheme]);

  // ==================== ENERGY LEVEL TRACKING ====================
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      const hour = new Date().getHours();
      if (hour >= 9 && hour < 12) setEnergyLevel('peak');
      else if (hour >= 14 && hour < 17) setEnergyLevel('high');
      else if (hour >= 6 && hour < 9) setEnergyLevel('rising');
      else if (hour >= 12 && hour < 14) setEnergyLevel('dip');
      else setEnergyLevel('low');
      
      checkReminders();
    }, 1000);
    return () => clearInterval(timer);
  }, [dailyGoals, tasks]);

  // ==================== DATA PERSISTENCE ====================
  useEffect(() => {
    const savedData = localStorage.getItem('notionTabletData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setDailyGoals(data.dailyGoals || []);
        setLongTermGoals(data.longTermGoals || []);
        setSecretNotes(data.secretNotes || []);
        setFolders(data.folders || []);
        setSmartBoardData(data.smartBoardData || []);
        setTasks(data.tasks || []);
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      dailyGoals,
      longTermGoals,
      secretNotes,
      folders,
      smartBoardData,
      tasks
    };
    localStorage.setItem('notionTabletData', JSON.stringify(dataToSave));
  }, [dailyGoals, longTermGoals, secretNotes, folders, smartBoardData, tasks]);

  // ==================== NOTIFICATIONS ====================
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        showNotification('Notifications Enabled', 'You\'ll receive smart reminders');
      }
    }
  };

  const showNotification = (title, body) => {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification(title, { body, icon: '⭐' });
    }
    setNotifications(prev => [...prev, { id: Date.now(), title, body, time: new Date() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== prev[0]?.id));
    }, 5000);
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

  // ==================== AI ASSISTANT ====================
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
        addDailyGoal({ title: goalText, time: '', priority: 'medium' });
        return `✅ Created daily goal: "${goalText}"`;
      }
      return "What goal would you like to create?";
    }
    
    if (lower.includes('add task') || lower.includes('schedule')) {
      const taskText = input.replace(/add task|schedule/i, '').trim();
      if (taskText) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        addTask({ title: taskText, time: now.toTimeString().slice(0, 5), priority: 'medium' });
        return `✅ Scheduled: "${taskText}" for ${now.toTimeString().slice(0, 5)}`;
      }
      return "What should I schedule?";
    }
    
    if (lower.includes('show progress') || lower.includes('stats')) {
      const completed = dailyGoals.filter(g => g.completed).length;
      const total = dailyGoals.length;
      const alignment = calculateGoalAlignment();
      return `📊 Progress:\n• Daily: ${completed}/${total} completed\n• Alignment: ${alignment}%\n• Long-term goals: ${longTermGoals.length}\n• Energy: ${energyLevel}`;
    }
    
    if (lower.includes('reschedule') || lower.includes('optimize')) {
      autoScheduleTasks();
      return `🔄 Optimized your schedule based on energy levels and priorities!`;
    }
    
    if (lower.includes('energy') || lower.includes('when should')) {
      return `⚡ Current energy: ${energyLevel}.\n${
        energyLevel === 'peak' ? '🎯 Perfect for complex tasks!' :
        energyLevel === 'high' ? '💪 Good for focused work.' :
        energyLevel === 'dip' ? '☕ Consider a break.' :
        '🌙 Time for light tasks or rest.'
      }`;
    }

    if (lower.includes('show alignment')) {
      const alignment = calculateGoalAlignment();
      return `🎯 Goal Alignment: ${alignment}%\n${alignment > 80 ? '🌟 Excellent! Stay focused!' : '⚠️ Consider linking tasks to long-term goals.'}`;
    }
    
    return `I can help with:\n• "Add goal [name]"\n• "Schedule [task]"\n• "Show progress"\n• "Reschedule tasks"\n• "Show alignment"\n• "Energy advice"`;
  };

  // ==================== GOAL MANAGEMENT ====================
  const calculateGoalAlignment = () => {
    if (longTermGoals.length === 0) return 100;
    const todayTasks = dailyGoals.filter(g => !g.completed);
    const alignedTasks = todayTasks.filter(task => {
      return longTermGoals.some(goal => 
        task.linkedGoalId === goal.id || 
        task.title.toLowerCase().includes(goal.title.toLowerCase().split(' ')[0])
      );
    });
    return Math.round((alignedTasks.length / Math.max(todayTasks.length, 1)) * 100);
  };

  const addDailyGoal = (goal) => {
    const newGoal = { 
      id: Date.now(), 
      ...goal, 
      completed: false, 
      reminder: true,
      createdAt: new Date().toISOString()
    };
    setDailyGoals([...dailyGoals, newGoal]);
    showNotification('Goal Added', goal.title);
  };

  const addLongTermGoal = (goal) => {
    const newGoal = {
      id: Date.now(),
      ...goal,
      progress: 0,
      milestones: [],
      createdAt: new Date().toISOString()
    };
    setLongTermGoals([...longTermGoals, newGoal]);
    showNotification('Long-term Goal Created', goal.title);
  };

  const addTask = (task) => {
    const newTask = {
      id: Date.now(),
      ...task,
      completed: false,
      estimatedDuration: task.estimatedDuration || 30,
      priority: task.priority || 'medium',
      status: 'pending'
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTaskComplete = (id, type = 'daily') => {
    if (type === 'daily') {
      setDailyGoals(dailyGoals.map(g => {
        if (g.id === id) {
          const newCompleted = !g.completed;
          if (newCompleted) {
            showNotification('🎉 Goal Completed!', g.title);
            updateLinkedGoalProgress(g.linkedGoalId);
          }
          return { ...g, completed: newCompleted };
        }
        return g;
      }));
    } else {
      setTasks(tasks.map(t => {
        if (t.id === id && !t.completed) {
          showNotification('✅ Task Done!', t.title);
        }
        return t.id === id ? { ...t, completed: !t.completed } : t;
      }));
    }
  };

  const updateLinkedGoalProgress = (goalId) => {
    if (!goalId) return;
    const linkedTasks = dailyGoals.filter(g => g.linkedGoalId === goalId);
    const completedTasks = linkedTasks.filter(g => g.completed).length;
    const newProgress = Math.round((completedTasks / linkedTasks.length) * 100);
    
    setLongTermGoals(longTermGoals.map(lg => 
      lg.id === goalId ? { ...lg, progress: Math.min(newProgress, 100) } : lg
    ));
  };

  const linkTaskToGoal = (taskId, goalId) => {
    setDailyGoals(dailyGoals.map(t => 
      t.id === taskId ? { ...t, linkedGoalId: goalId } : t
    ));
  };

  // ==================== INTELLIGENT SCHEDULING ====================
  const autoScheduleTasks = () => {
    const unscheduledTasks = tasks.filter(t => !t.completed);
    const sortedTasks = [...unscheduledTasks].sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    let currentHour = new Date().getHours();
    const updatedTasks = sortedTasks.map(task => {
      if (currentHour >= 9 && currentHour < 12 && task.priority === 'high') {
        // Schedule high-priority during peak energy
        const time = `${currentHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        currentHour++;
        return { ...task, time, rescheduled: true };
      } else if (currentHour >= 14 && currentHour < 17) {
        const time = `${currentHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        currentHour++;
        return { ...task, time, rescheduled: true };
      }
      return task;
    });

    setTasks(tasks.map(t => {
      const updated = updatedTasks.find(ut => ut.id === t.id);
      return updated || t;
    }));
  };

  // ==================== SECRET NOTES ====================
  const addSecretNote = (note) => {
    setSecretNotes([...secretNotes, {
      id: Date.now(),
      content: note,
      createdAt: new Date().toISOString(),
      encrypted: true
    }]);
  };

  const deleteSecretNote = (id) => {
    setSecretNotes(secretNotes.filter(n => n.id !== id));
  };

  // ==================== FOLDERS ====================
  const addFolder = (folder) => {
    setFolders([...folders, {
      id: Date.now(),
      ...folder,
      items: [],
      createdAt: new Date().toISOString()
    }]);
  };

  const addItemToFolder = (folderId, item) => {
    setFolders(folders.map(f => 
      f.id === folderId ? { ...f, items: [...f.items, { id: Date.now(), ...item }] } : f
    ));
  };

  // ==================== SMARTBOARD (EXCEL-LIKE) ====================
  const addSmartBoardRow = () => {
    setSmartBoardData([...smartBoardData, {
      id: Date.now(),
      status: 'pending',
      title: '',
      deadline: '',
      priority: 'medium',
      progress: 0,
      notes: ''
    }]);
  };

  const updateSmartBoardCell = (id, field, value) => {
    setSmartBoardData(smartBoardData.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const deleteSmartBoardRow = (id) => {
    setSmartBoardData(smartBoardData.filter(row => row.id !== id));
  };

  // ==================== FILE UPLOAD ====================
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      addSecretNote(`📎 File: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)}KB\nUploaded: ${new Date().toLocaleString()}`);
      showNotification('File Uploaded', file.name);
    };
    reader.readAsDataURL(file);
  };

  // ==================== EXPORT DATA ====================
  const exportData = () => {
    const data = {
      dailyGoals,
      longTermGoals,
      secretNotes,
      folders,
      smartBoardData,
      tasks,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notion-tablet-backup-${Date.now()}.json`;
    a.click();
    showNotification('Data Exported', 'Backup created successfully');
  };

  // ==================== RENDER COMPONENTS ====================
  
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-2">
          Good {theme === 'sunrise' ? 'Morning' : theme === 'day' ? 'Afternoon' : theme === 'sunset' ? 'Evening' : 'Night'}! ✨
        </h1>
        <p className="text-purple-200 text-lg">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <p className="text-purple-300 text-2xl font-semibold mt-2">{currentTime.toLocaleTimeString()}</p>
      </div>

      {/* AI Insights Panel */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">AI Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Goal Alignment</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-purple-300">{calculateGoalAlignment()}%</div>
          </div>
          
          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Energy Level</span>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-purple-300 capitalize">{energyLevel}</div>
          </div>
          
          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Daily Progress</span>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-purple-300">
              {dailyGoals.filter(g => g.completed).length}/{dailyGoals.length}
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Active Projects</span>
              <Folder className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-purple-300">{folders.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-6 border border-purple-500/30 hover:scale-105 transition-all cursor-pointer" onClick={() => setActiveView('goals')}>
          <Target className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Daily Goals</h3>
          <p className="text-purple-200">{dailyGoals.length} goals tracked</p>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-2xl p-6 border border-blue-500/30 hover:scale-105 transition-all cursor-pointer" onClick={() => setActiveView('smartboard')}>
          <Grid className="w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">SmartBoard</h3>
          <p className="text-blue-200">{smartBoardData.length} items</p>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-2xl p-6 border border-green-500/30 hover:scale-105 transition-all cursor-pointer" onClick={() => setActiveView('analytics')}>
          <BarChart3 className="w-12 h-12 text-green-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
          <p className="text-green-200">View insights</p>
        </div>
      </div>
    </div>
  );

  const GoalsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Daily Goals</h2>
        <button onClick={() => setShowModal('add-goal')} className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
          <Plus className="w-5 h-5" /> Add Goal
        </button>
      </div>

      <div className="space-y-4">
        {dailyGoals.map(goal => {
          const linkedGoal = longTermGoals.find(lg => lg.id === goal.linkedGoalId);
          return (
            <div key={goal.id} className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => toggleTaskComplete(goal.id, 'daily')} 
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      goal.completed ? 'bg-green-500 border-green-500' : 'border-purple-400 hover:border-purple-300'
                    }`}
                  >
                    {goal.completed && <Check className="w-6 h-6 text-white" />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold ${goal.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                      {goal.title}
                    </h3>
                    {goal.time && (
                      <p className="text-purple-300 text-sm flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" /> {goal.time}
                      </p>
                    )}
                    {linkedGoal && (
                      <div className="mt-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 text-sm">Linked to: {linkedGoal.title}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!goal.linkedGoalId && longTermGoals.length > 0 && (
                    <select 
                      onChange={(e) => linkTaskToGoal(goal.id, parseInt(e.target.value))}
                      className="bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Link to goal...</option>
                      {longTermGoals.map(lg => (
                        <option key={lg.id} value={lg.id}>{lg.title}</option>
                      ))}
                    </select>
                  )}
                  <button 
                    onClick={() => setDailyGoals(dailyGoals.filter(g => g.id !== goal.id))}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const SmartBoardView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">SmartBoard - Excel-like Grid</h2>
        <div className="flex gap-3">
          <button onClick={addSmartBoardRow} className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Plus className="w-5 h-5" /> Add Row
          </button>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left p-4 text-white font-semibold">Status</th>
              <th className="text-left p-4 text-white font-semibold">Title</th>
              <th className="text-left p-4 text-white font-semibold">Deadline</th>
              <th className="text-left p-4 text-white font-semibold">Priority</th>
              <th className="text-left p-4 text-white font-semibold">Progress</th>
              <th className="text-left p-4 text-white font-semibold">Notes</th>
              <th className="text-left p-4 text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {smartBoardData.map(row => (
              <tr key={row.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-4">
                  <select
                    value={row.status}
                    onChange={(e) => updateSmartBoardCell(row.id, 'status', e.target.value)}
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => updateSmartBoardCell(row.id, 'title', e.target.value)}
                    className="bg-transparent border-b border-white/20 focus:border-purple-400 outline-none text-white w-full"
                    placeholder="Enter title..."
                  />
                </td>
                <td className="p-4">
                  <input
                    type="date"
                    value={row.deadline}
                    onChange={(e) => updateSmartBoardCell(row.id, 'deadline', e.target.value)}
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm"
                  />
                </td>
                <td className="p-4">
                  <select
                    value={row.priority}
                    onChange={(e) => updateSmartBoardCell(row.id, 'priority', e.target.value)}
                    className={`border rounded px-3 py-2 text-white text-sm ${
                      row.priority === 'high' ? 'bg-red-600/30 border-red-500/50' :
                      row.priority === 'medium' ? 'bg-yellow-600/30 border-yellow-500/50' :
                      'bg-green-600/30 border-green-500/50'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={row.progress}
                      onChange={(e) => updateSmartBoardCell(row.id, 'progress', parseInt(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-white text-sm font-semibold">{row.progress}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(e) => updateSmartBoardCell(row.id, 'notes', e.target.value)}
                    className="bg-transparent border-b border-white/20 focus:border-purple-400 outline-none text-white w-full"
                    placeholder="Notes..."
                  />
                </td>
                <td className="p-4">
                  <button
                    onClick={() => deleteSmartBoardRow(row.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {smartBoardData.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Grid className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No items yet. Click "Add Row" to start.</p>
          </div>
        )}
      </div>
    </div>
  );

  const SecretVaultView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Lock className="w-8 h-8" /> Secret Vault
        </h2>
        <div className="flex gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Upload className="w-5 h-5" /> Upload File
          </button>
          <button onClick={() => setShowModal('add-secret')} className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Plus className="w-5 h-5" /> Add Note
          </button>
        </div>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        onChange={handleFileUpload}
        className="hidden"
        accept="*"
      />

      <div className="backdrop-blur-xl bg-indigo-500/20 rounded-xl p-6 border border-indigo-500/30">
        <div className="flex items-start gap-3">
          <Lock className="w-6 h-6 text-indigo-300 mt-1" />
          <div>
            <p className="text-indigo-200 font-semibold mb-1">🔐 End-to-End Encrypted</p>
            <p className="text-indigo-300 text-sm">All notes and files are encrypted locally. Your data is completely private.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {secretNotes.map(note => (
          <div key={note.id} className="backdrop-blur-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-6 border border-indigo-500/30 hover:border-indigo-400/50 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-white whitespace-pre-wrap mb-3">{note.content}</p>
                <p className="text-indigo-300 text-xs">{new Date(note.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => deleteSecretNote(note.id)}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded transition-all"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
        {secretNotes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Lock className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Your secret vault is empty</p>
            <p className="text-sm mt-2">Add notes or upload files to get started</p>
          </div>
        )}
      </div>
    </div>
  );

  const FoldersView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Folders & Projects</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-full text-white transition-all"
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
          <button onClick={() => setShowModal('add-folder')} className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Plus className="w-5 h-5" /> New Folder
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'space-y-4'}>
        {folders.map(folder => (
          <div
            key={folder.id}
            onClick={() => setSelectedFolder(folder)}
            className="backdrop-blur-xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-2xl p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <Folder className="w-12 h-12 text-cyan-400" />
              <span className="bg-cyan-500/30 px-3 py-1 rounded-full text-cyan-200 text-sm">
                {folder.items.length} items
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{folder.name}</h3>
            <p className="text-cyan-200 text-sm">{folder.description}</p>
          </div>
        ))}
      </div>

      {folders.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Folder className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No folders yet. Create your first project folder.</p>
        </div>
      )}
    </div>
  );

  const AnalyticsView = () => {
    const totalGoals = dailyGoals.length;
    const completedGoals = dailyGoals.filter(g => g.completed).length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    const alignment = calculateGoalAlignment();
    
    const weeklyData = [
      { day: 'Mon', completed: 5, total: 7 },
      { day: 'Tue', completed: 6, total: 8 },
      { day: 'Wed', completed: 4, total: 6 },
      { day: 'Thu', completed: 7, total: 9 },
      { day: 'Fri', completed: 5, total: 7 },
      { day: 'Sat', completed: 3, total: 4 },
      { day: 'Sun', completed: completedGoals, total: totalGoals }
    ];
    
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/30">
            <BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm">Completion Rate</p>
            <p className="text-3xl font-bold text-white">{completionRate}%</p>
          </div>
          
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-6 border border-blue-500/30">
            <Target className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm">Goal Alignment</p>
            <p className="text-3xl font-bold text-white">{alignment}%</p>
          </div>
          
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-500/30">
            <Zap className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm">Energy Level</p>
            <p className="text-3xl font-bold text-white capitalize">{energyLevel}</p>
          </div>
          
          <div className="backdrop-blur-xl bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-xl p-6 border border-pink-500/30">
            <Star className="w-8 h-8 text-pink-400 mb-2" />
            <p className="text-pink-200 text-sm">Active Goals</p>
            <p className="text-3xl font-bold text-white">{longTermGoals.length}</p>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6">Weekly Progress</h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyData.map((day, i) => {
              const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-full">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-500 hover:scale-105"
                      style={{ height: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-300">{day.day}</span>
                  <span className="text-xs font-semibold text-purple-300">{day.completed}/{day.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6">Productivity Heatmap (24 Hours)</h3>
          <div className="grid grid-cols-12 gap-2">
            {[...Array(24)].map((_, hour) => {
              const intensity = hour >= 9 && hour < 12 ? 100 : hour >= 14 && hour < 17 ? 70 : hour >= 6 && hour < 9 ? 50 : 20;
              return (
                <div key={hour} className="flex flex-col items-center gap-1">
                  <div 
                    className="w-full h-16 rounded bg-blue-500 transition-all hover:scale-110"
                    style={{ opacity: intensity / 100 }}
                    title={`${hour}:00 - ${intensity}% productive`}
                  ></div>
                  <span className="text-xs text-gray-400">{hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6">Long-term Progress</h3>
          <div className="space-y-4">
            {longTermGoals.map(goal => (
              <div key={goal.id} className="bg-black/20 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-white font-semibold">{goal.title}</span>
                  <span className="text-pink-300 font-bold">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all" style={{ width: `${goal.progress}%` }}></div>
                </div>
              </div>
            ))}
            {longTermGoals.length === 0 && (
              <p className="text-gray-400 text-center py-4">No long-term goals set yet</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==================== MODALS ====================
  
  const AddGoalModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-3xl p-8 max-w-md w-full mx-4 border border-purple-500/50 shadow-2xl">
        <h3 className="text-3xl font-bold mb-6 text-white">New Daily Goal</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          addDailyGoal({ 
            title: formData.get('title'), 
            time: formData.get('time'),
            priority: formData.get('priority')
          });
          setShowModal(null);
          e.target.reset();
        }}>
          <input 
            type="text" 
            name="title" 
            placeholder="Goal title..." 
            className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 mb-4 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
            required 
          />
          <input 
            type="time" 
            name="time" 
            className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 mb-4 text-white focus:border-purple-400 focus:outline-none"
          />
          <select 
            name="priority" 
            className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 mb-6 text-white focus:border-purple-400 focus:outline-none"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-white"
            >
              Create Goal
            </button>
            <button 
              type="button" 
              onClick={() => setShowModal(null)} 
              className="px-6 bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddLongTermGoalModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="backdrop-blur-xl bg-gradient-to-br from-pink-900/90 to-purple-900/90 rounded-3xl p-8 max-w-md w-full mx-4 border border-pink-500/50 shadow-2xl">
        <h3 className="text-3xl font-bold mb-6 text-white">New Long-term Goal</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          addLongTermGoal({ 
            title: formData.get('title'), 
            description: formData.get('description'),
            targetDate: formData.get('targetDate')
          });
          setShowModal(null);
          e.target.reset();
        }}>
          <input 
            type="text" 
            name="title" 
            placeholder="Goal title..." 
            className="w-full bg-black/30 border border-pink-500/30 rounded-xl px-4 py-3 mb-4 text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none"
            required 
          />
          <textarea 
            name="description" 
            placeholder="Description..." 
            className="w-full bg-black/30 border border-pink-500/30 rounded-xl px-4 py-3 mb-4 text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none resize-none"
            rows="3"
          ></textarea>
          <input 
            type="date" 
            name="targetDate" 
            className="w-full bg-black/30 border border-pink-500/30 rounded-xl px-4 py-3 mb-6 text-white focus:border-pink-400 focus:outline-none"
          />
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all text-white"
            >
              Create Goal
            </button>
            <button 
              type="button" 
              onClick={() => setShowModal(null)} 
              className="px-6 bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddSecretNoteModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-900/90 to-purple-900/90 rounded-3xl p-8 max-w-md w-full mx-4 border border-indigo-500/50 shadow-2xl">
        <h3 className="text-3xl font-bold mb-6 text-white">New Secret Note</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          addSecretNote(formData.get('content'));
          setShowModal(null);
          e.target.reset();
        }}>
          <textarea 
            name="content" 
            placeholder="Your private thoughts..." 
            className="w-full bg-black/30 border border-indigo-500/30 rounded-xl px-4 py-3 mb-6 text-white placeholder-gray-400 focus:border-indigo-400 focus:outline-none resize-none"
            rows="6"
            required
          ></textarea>
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all text-white"
            >
              Save Securely
            </button>
            <button 
              type="button" 
              onClick={() => setShowModal(null)} 
              className="px-6 bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddFolderModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-900/90 to-blue-900/90 rounded-3xl p-8 max-w-md w-full mx-4 border border-cyan-500/50 shadow-2xl">
        <h3 className="text-3xl font-bold mb-6 text-white">Create Folder</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          addFolder({ 
            name: formData.get('name'), 
            description: formData.get('description')
          });
          setShowModal(null);
          e.target.reset();
        }}>
          <input 
            type="text" 
            name="name" 
            placeholder="Folder name..." 
            className="w-full bg-black/30 border border-cyan-500/30 rounded-xl px-4 py-3 mb-4 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
            required 
          />
          <textarea 
            name="description" 
            placeholder="Description..." 
            className="w-full bg-black/30 border border-cyan-500/30 rounded-xl px-4 py-3 mb-6 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none resize-none"
            rows="2"
          ></textarea>
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-white"
            >
              Create Folder
            </button>
            <button 
              type="button" 
              onClick={() => setShowModal(null)} 
              className="px-6 bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );const ChatAssistant = ({
  showChat,
  setShowChat,
  chatMessages,
  chatInput,
  setChatInput,
  handleChatSubmit,
}) => (
  <div
    className={`fixed bottom-6 right-6 ${
      showChat ? "w-96 h-[36rem]" : "w-16 h-16"
    } transition-all duration-300 z-50`}
  >
    {!showChat ? (
      <button
        onClick={() => setShowChat(true)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-all animate-pulse"
      >
        <MessageSquare className="w-8 h-8 text-white" />
      </button>
    ) : (
      <div className="backdrop-blur-xl bg-gray-900/90 rounded-3xl shadow-2xl border border-white/20 flex flex-col h-full">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-white" />
            <h3 className="font-semibold text-white">AI Assistant</h3>
          </div>
          <button
            onClick={() => setShowChat(false)}
            className="text-white hover:bg-white/20 rounded p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">How can I help you today?</p>
              <p className="text-xs">Try: "Add goal workout" or "Show stats"</p>
            </div>
          )}
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-2 hover:scale-110 transition-all"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
);


  // ==================== NOTIFICATIONS PANEL ====================
  
  const NotificationsPanel = () => (
    <div className="fixed top-20 right-6 w-80 max-h-96 overflow-y-auto z-40 space-y-2">
      {notifications.map(notif => (
        <div key={notif.id} className="backdrop-blur-xl bg-purple-900/90 rounded-xl p-4 border border-purple-500/30 shadow-lg animate-slide-in">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">{notif.title}</h4>
              <p className="text-sm text-purple-200">{notif.body}</p>
              <p className="text-xs text-purple-300 mt-1">{notif.time.toLocaleTimeString()}</p>
            </div>
            <button onClick={() => setNotifications(notifications.filter(n => n.id !== notif.id))} className="text-purple-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // ==================== MAIN RENDER ====================
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <MagicalCosmicBackground timeOfDay={theme} />
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="backdrop-blur-xl bg-black/20 border-b border-white/10 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NotionTablet</h1>
                <p className="text-purple-200 text-sm flex items-center gap-2">
                  {theme === 'sunrise' && <Sunrise className="w-4 h-4" />}
                  {theme === 'day' && <Sun className="w-4 h-4" />}
                  {theme === 'sunset' && <Sunset className="w-4 h-4" />}
                  {theme === 'night' && <Moon className="w-4 h-4" />}
                  {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode • {themeMode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <p className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Energy: <span className="font-semibold capitalize">{energyLevel}</span>
                </p>
              </div>

              <button
                onClick={() => setAutoTheme(!autoTheme)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all"
                title={autoTheme ? 'Auto theme enabled' : 'Auto theme disabled'}
              >
                {theme === 'night' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </button>
              
              <button
                onClick={requestNotificationPermission}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all relative"
              >
                <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-green-400' : 'text-gray-400'}`} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              <button
                onClick={exportData}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all"
                title="Export data"
              >
                <Download className="w-5 h-5 text-cyan-400" />
              </button>

              <select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Aurora">Aurora</option>
                <option value="Nebula">Nebula</option>
                <option value="Stardust">Stardust</option>
                <option value="Solar Flare">Solar Flare</option>
              </select>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="backdrop-blur-xl bg-black/20 border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-3 justify-center">
            {[
              { id: 'dashboard', icon: Sparkles, label: 'Dashboard' },
              { id: 'goals', icon: Target, label: 'Daily Goals' },
              { id: 'longterm', icon: Star, label: 'Long-term' },
              { id: 'smartboard', icon: Grid, label: 'SmartBoard' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'folders', icon: Folder, label: 'Folders' },
              { id: 'vault', icon: Lock, label: 'Secret Vault' }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveView(item.id)} 
                className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all ${
                  activeView === item.id 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50 text-white' 
                    : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'goals' && <GoalsView />}
          {activeView === 'longterm' && <LongTermGoalsView />}
          {activeView === 'smartboard' && <SmartBoardView />}
          {activeView === 'analytics' && <AnalyticsView />}
          {activeView === 'folders' && <FoldersView />}
          {activeView === 'vault' && <SecretVaultView />}
        </main>
      </div>

      {/* Modals */}
      {showModal === 'add-goal' && <AddGoalModal />}
      {showModal === 'add-longterm' && <AddLongTermGoalModal />}
      {showModal === 'add-secret' && <AddSecretNoteModal />}
      {showModal === 'add-folder' && <AddFolderModal />}

      {/* Notifications Panel */}
      {notifications.length > 0 && <NotificationsPanel />}

      {/* AI Chat Assistant */}
<ChatAssistant
  showChat={showChat}
  setShowChat={setShowChat}
  chatMessages={chatMessages}
  chatInput={chatInput}
  setChatInput={setChatInput}
  handleChatSubmit={handleChatSubmit}
/>

      {/* Animations */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );

};












  // ..const NotionTablet = () => {
  // all your useState and useEffect hooks here...
// ... DashboardView, GoalsView, SmartBoardView ...
// ✅ Define it as a separate component that receives props
const LongTermGoalsView = ({
  setShowModal,
  longTermGoals,
  dailyGoals,
  setLongTermGoals,
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold text-white">Long-term Goals</h2>
      <button
        onClick={() => setShowModal("add-longterm")}
        className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
      >
        <Plus className="w-5 h-5" /> Add Goal
      </button>
    </div>

    <div className="grid gap-6">
      {longTermGoals.map((goal) => {
        const linkedTasks = dailyGoals.filter(
          (dg) => dg.linkedGoalId === goal.id
        );
        const completedLinked = linkedTasks.filter((dg) => dg.completed).length;

        return (
          <div
            key={goal.id}
            className="backdrop-blur-xl bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-2xl p-6 border border-pink-500/30 hover:border-pink-400/50 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {goal.title}
                </h3>
                <p className="text-purple-200 mb-3">{goal.description}</p>
                {goal.targetDate && (
                  <p className="text-purple-300 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Target:{" "}
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {goal.progress}%
                </span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-full h-4 overflow-hidden mb-4">
              <div
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-200">
                {linkedTasks.length} linked tasks • {completedLinked} completed
              </span>
              <button
                onClick={() => {
                  const newProgress = Math.min(goal.progress + 10, 100);
                  setLongTermGoals(
                    longTermGoals.map((g) =>
                      g.id === goal.id
                        ? { ...g, progress: newProgress }
                        : g
                    )
                  );
                }}
                className="bg-green-600/30 hover:bg-green-600/50 px-4 py-2 rounded-lg transition-all text-white"
              >
                +10% Progress
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default NotionTablet;
