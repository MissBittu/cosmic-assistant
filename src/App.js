import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Target, Lock, Folder, Plus, X, Check, Star, Sparkles, Moon, Sun, Bell, Edit2, Trash2, ChevronDown, ChevronRight, Zap, TrendingUp, AlertCircle, Brain, Mic, Image, FileText, Activity, BarChart3, RefreshCw, MessageSquare, Send, BellRing, Menu, Settings } from 'lucide-react';

const CosmicAssistant = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [dailyGoals, setDailyGoals] = useState([]);
  const [longTermGoals, setLongTermGoals] = useState([]);
  const [secretNotes, setSecretNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(null);
  const [aiInsights, setAiInsights] = useState({ alignment: 85, productivity: 'high', recommendation: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [energyLevel, setEnergyLevel] = useState('peak');
  const [theme, setTheme] = useState('dark'); // dark or light
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Mobile gesture detection
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe left - next view
      const views = ['dashboard', 'goals', 'longterm', 'tasks', 'analytics', 'folders', 'secret'];
      const currentIndex = views.indexOf(activeView);
      if (currentIndex < views.length - 1) {
        setActiveView(views[currentIndex + 1]);
      }
    }
    if (isRightSwipe) {
      // Swipe right - previous view
      const views = ['dashboard', 'goals', 'longterm', 'tasks', 'analytics', 'folders', 'secret'];
      const currentIndex = views.indexOf(activeView);
      if (currentIndex > 0) {
        setActiveView(views[currentIndex - 1]);
      }
    }
  };

  // Browser notifications
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        showNotification('Notifications Enabled', 'You\'ll receive reminders for your goals and tasks');
      }
    }
  };

  const showNotification = (title, body) => {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification(title, { body, icon: '⭐' });
    }
    // Also add to in-app notifications
    setNotifications(prev => [...prev, { id: Date.now(), title, body, time: new Date() }]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateEnergyLevel();
      checkReminders();
    }, 1000);
    return () => clearInterval(timer);
  }, [dailyGoals, tasks]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Check for reminders
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

  // AI Chat Assistant
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: chatInput, time: new Date() };
    setChatMessages(prev => [...prev, userMessage]);

    // AI processing
    setTimeout(() => {
      const response = processAICommand(chatInput);
      const aiMessage = { id: Date.now() + 1, sender: 'ai', text: response, time: new Date() };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 500);

    setChatInput('');
  };

  const processAICommand = (input) => {
    const lower = input.toLowerCase();
    
    // Add goal
    if (lower.includes('add goal') || lower.includes('create goal')) {
      const goalText = input.replace(/add goal|create goal/i, '').trim();
      if (goalText) {
        addDailyGoal({ title: goalText, time: '' });
        return `✅ Added daily goal: "${goalText}"`;
      }
      return "What goal would you like to add?";
    }
    
    // Add task
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
    
    // Show alignment
    if (lower.includes('alignment') || lower.includes('progress')) {
      const alignment = calculateGoalAlignment();
      return `📊 Your goal alignment is ${alignment}%. ${alignment > 80 ? 'Great job!' : 'Consider linking more tasks to your long-term goals.'}`;
    }
    
    // Reschedule
    if (lower.includes('reschedule') || lower.includes('reorganize')) {
      if (tasks.length > 0) {
        autoReschedule(tasks[0].id, 'ai-request');
        return `🔄 Rescheduled ${tasks.length} tasks to optimize your day!`;
      }
      return "No tasks to reschedule.";
    }
    
    // Energy advice
    if (lower.includes('energy') || lower.includes('when should i')) {
      return `⚡ Your energy level is ${energyLevel}. ${
        energyLevel === 'peak' ? 'Perfect time for your most important tasks!' :
        energyLevel === 'high' ? 'Good time for focused work.' :
        energyLevel === 'dip' ? 'Consider taking a break or doing lighter tasks.' :
        'Energy is low. Time to rest or do simple tasks.'
      }`;
    }
    
    // Stats
    if (lower.includes('stats') || lower.includes('summary')) {
      const completed = dailyGoals.filter(g => g.completed).length;
      const total = dailyGoals.length;
      return `📈 Today: ${completed}/${total} goals completed. ${longTermGoals.length} long-term goals tracked. ${tasks.length} tasks scheduled.`;
    }
    
    // Default helpful response
    return `I can help you with:
• "Add goal [title]" - Create a new goal
• "Add task [title]" - Schedule a new task
• "Show alignment" - Check goal alignment
• "Reschedule tasks" - Optimize your schedule
• "Energy advice" - Get productivity tips
• "Show stats" - See your progress`;
  };

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

  const updateEnergyLevel = () => {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 12) setEnergyLevel('peak');
    else if (hour >= 14 && hour < 17) setEnergyLevel('high');
    else if (hour >= 6 && hour < 9) setEnergyLevel('rising');
    else if (hour >= 12 && hour < 14) setEnergyLevel('dip');
    else setEnergyLevel('low');
  };

  const autoReschedule = (taskId, reason = 'conflict') => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    const remainingTasks = tasks.slice(taskIndex + 1);
    let newTime = new Date(`2000-01-01T${task.time}`);
    newTime.setMinutes(newTime.getMinutes() + (task.estimatedDuration || 30));
    
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...task, rescheduled: true, originalTime: task.time };
    
    remainingTasks.forEach((t, i) => {
      const actualIndex = taskIndex + 1 + i;
      updatedTasks[actualIndex] = {
        ...t,
        time: newTime.toTimeString().slice(0, 5),
        rescheduled: true
      };
      newTime.setMinutes(newTime.getMinutes() + (t.estimatedDuration || 30));
    });
    
    setTasks(updatedTasks);
    setAiInsights(prev => ({
      ...prev,
      recommendation: `🔄 Auto-rescheduled ${remainingTasks.length + 1} tasks due to ${reason}`
    }));
  };

  const startVoiceCapture = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const voiceTask = {
        id: Date.now(),
        title: "Meeting with Sarah about Q4 strategy",
        time: "14:30",
        completed: false,
        source: 'voice',
        estimatedDuration: 45,
        priority: 'high'
      };
      setTasks([...tasks, voiceTask]);
      setAiInsights(prev => ({
        ...prev,
        recommendation: '🎤 Voice note converted to task: "Meeting with Sarah"'
      }));
      showNotification('Voice Captured', 'Task added to your schedule');
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setTimeout(() => {
      const extractedTask = {
        id: Date.now(),
        title: `Review ${file.name}`,
        time: "16:00",
        completed: false,
        source: 'file',
        estimatedDuration: 30,
        priority: 'medium'
      };
      setTasks([...tasks, extractedTask]);
      setAiInsights(prev => ({
        ...prev,
        recommendation: `📄 Extracted task from ${file.name}`
      }));
      showNotification('File Processed', `Task created from ${file.name}`);
    }, 1000);
  };

  const linkTaskToGoal = (taskId, goalId) => {
    setDailyGoals(dailyGoals.map(t => 
      t.id === taskId ? { ...t, linkedGoalId: goalId } : t
    ));
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
    setLongTermGoals([...longTermGoals, { 
      id: Date.now(), 
      ...goal, 
      progress: 0, 
      milestones: [],
      createdAt: new Date().toISOString(),
      targetDate: goal.targetDate
    }]);
    showNotification('Long-term Goal Created', goal.title);
  };

  const addTask = (task) => {
    setTasks([...tasks, { 
      id: Date.now(), 
      ...task, 
      completed: false,
      estimatedDuration: 30,
      priority: task.priority || 'medium'
    }]);
  };

  const addFolder = (folder) => {
    setFolders([...folders, { 
      id: Date.now(), 
      ...folder, 
      items: [],
      encrypted: folder.encrypted || false
    }]);
  };

  const toggleTaskComplete = (id, type) => {
    if (type === 'daily') {
      setDailyGoals(dailyGoals.map(g => {
        if (g.id === id) {
          const newCompleted = !g.completed;
          if (newCompleted) {
            showNotification('Goal Completed! 🎉', g.title);
          }
          if (newCompleted && g.linkedGoalId) {
            const linkedGoal = longTermGoals.find(lg => lg.id === g.linkedGoalId);
            if (linkedGoal) {
              const dailyTasksForGoal = dailyGoals.filter(dg => dg.linkedGoalId === g.linkedGoalId);
              const completedTasksForGoal = dailyTasksForGoal.filter(dg => dg.completed || dg.id === id).length;
              const newProgress = Math.min(Math.round((completedTasksForGoal / dailyTasksForGoal.length) * 100), 100);
              
              setLongTermGoals(longTermGoals.map(lg => 
                lg.id === g.linkedGoalId ? { ...lg, progress: newProgress } : lg
              ));
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

  // Theme colors
  const themeColors = theme === 'dark' ? {
    bg: 'from-indigo-950 via-purple-950 to-pink-950',
    cardBg: 'bg-black/30',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    border: 'border-purple-500/30',
    starColor: 'bg-white'
  } : {
    bg: 'from-blue-100 via-purple-100 to-pink-100',
    cardBg: 'bg-white/80',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-purple-300/50',
    starColor: 'bg-purple-900'
  };

  const AIInsightsPanel = () => {
    const alignment = calculateGoalAlignment();
    const completedToday = dailyGoals.filter(g => g.completed).length;
    const totalToday = dailyGoals.length;
    
    return (
      <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40' : 'bg-gradient-to-br from-purple-200/60 to-pink-200/60'} rounded-2xl p-6 border ${themeColors.border} backdrop-blur-xl mb-6 shadow-xl`}>
        <div className="flex items-center gap-3 mb-4">
          <Brain className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`} />
          <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>AI Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={`${themeColors.cardBg} rounded-xl p-4 backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${themeColors.textSecondary} text-sm`}>Goal Alignment</span>
              <TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>{alignment}%</div>
            <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-2 mt-2`}>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all" style={{ width: `${alignment}%` }}></div>
            </div>
          </div>
          
          <div className={`${themeColors.cardBg} rounded-xl p-4 backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${themeColors.textSecondary} text-sm`}>Energy Level</span>
              <Zap className={`w-5 h-5 ${energyLevel === 'peak' ? 'text-yellow-400' : energyLevel === 'high' ? 'text-green-400' : 'text-blue-400'}`} />
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'} capitalize`}>{energyLevel}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
              {energyLevel === 'peak' ? 'Best time for complex tasks' : energyLevel === 'dip' ? 'Consider a break' : 'Good for moderate work'}
            </div>
          </div>
          
          <div className={`${themeColors.cardBg} rounded-xl p-4 backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${themeColors.textSecondary} text-sm`}>Today's Progress</span>
              <Activity className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>{completedToday}/{totalToday}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
              {totalToday > 0 ? `${Math.round((completedToday/totalToday)*100)}% completed` : 'No goals set'}
            </div>
          </div>
        </div>
        
        {aiInsights.recommendation && (
          <div className={`${theme === 'dark' ? 'bg-blue-500/20 border-blue-500/30 text-blue-200' : 'bg-blue-200/50 border-blue-400/50 text-blue-900'} border rounded-lg p-3 text-sm`}>
            {aiInsights.recommendation}
          </div>
        )}
      </div>
    );
  };

  const QuickCaptureBar = () => (
    <div className={`${themeColors.cardBg} backdrop-blur-xl rounded-2xl p-4 border ${theme === 'dark' ? 'border-cyan-500/30' : 'border-cyan-400/50'} mb-6 shadow-lg`}>
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-900'} mb-3 flex items-center gap-2`}>
        <Sparkles className="w-5 h-5" /> Quick Capture (Any Format)
      </h3>
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={startVoiceCapture}
          disabled={isRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isRecording 
              ? 'bg-red-600 animate-pulse text-white' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 text-white'
          }`}
        >
          <Mic className="w-5 h-5" />
          {isRecording ? 'Recording...' : 'Voice Note'}
        </button>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 transition-all text-white"
        >
          <FileText className="w-5 h-5" />
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
          onClick={() => setShowModal('quick-text')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 transition-all text-white"
        >
          <Edit2 className="w-5 h-5" />
          Quick Text
        </button>
      </div>
    </div>
  );

  const NotificationsPanel = () => (
    <div className="fixed top-20 right-6 w-80 max-h-96 overflow-y-auto z-40">
      {notifications.slice(-5).reverse().map(notif => (
        <div key={notif.id} className={`${theme === 'dark' ? 'bg-purple-900/90' : 'bg-white/90'} backdrop-blur-xl rounded-lg p-4 mb-2 border ${themeColors.border} shadow-lg animate-slide-in`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-semibold ${themeColors.text} mb-1`}>{notif.title}</h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>{notif.body}</p>
              <p className={`text-xs ${themeColors.textSecondary} mt-1`}>
                {notif.time.toLocaleTimeString()}
              </p>
            </div>
            <button onClick={() => setNotifications(notifications.filter(n => n.id !== notif.id))} className={themeColors.textSecondary}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const ChatAssistant = () => (
    <div className={`fixed bottom-6 right-6 ${showChat ? 'w-96 h-[32rem]' : 'w-16 h-16'} transition-all duration-300 z-50`}>
      {!showChat ? (
        <button 
          onClick={() => setShowChat(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110"
        >
          <MessageSquare className="w-8 h-8 text-white" />
        </button>
      ) : (
        <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl border ${themeColors.border} flex flex-col h-full`}>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-white" />
              <h3 className="font-semibold text-white">AI Assistant</h3>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white hover:bg-white/20 rounded p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className={`text-center ${themeColors.textSecondary} text-sm py-8`}>
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Ask me anything!</p>
                <p className="text-xs mt-2">Try: "Add goal workout" or "Show stats"</p>
              </div>
            )}
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <form onSubmit={handleChatSubmit} className="p-4 border-t ${themeColors.border}">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a command..."
                className={`flex-1 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-2 hover:shadow-lg transition-all">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className={`text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent`}>
            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}
          </h1>
          {theme === 'dark' ? <Moon className="w-8 h-8 text-purple-400" /> : <Sun className="w-8 h-8 text-yellow-500" />}
        </div>
        <p className={`${themeColors.textSecondary} text-lg`}>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <p className={`${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'} text-2xl font-semibold mt-2`}>{currentTime.toLocaleTimeString()}</p>
      </div>

      <AIInsightsPanel />
      <QuickCaptureBar />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40' : 'bg-gradient-to-br from-purple-200/60 to-pink-200/60'} rounded-2xl p-6 border ${themeColors.border} backdrop-blur-xl shadow-2xl hover:scale-105 transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'} flex items-center gap-2`}>
              <Target className="w-6 h-6" /> Daily Goals
            </h3>
            <span className={`${theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-300/50'} px-3 py-1 rounded-full text-sm`}>{dailyGoals.filter(g => g.completed).length}/{dailyGoals.length}</span>
          </div>
          <div className="space-y-2">
            {dailyGoals.slice(0, 3).map(goal => (
              <div key={goal.id} className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Check className={`w-4 h-4 ${goal.completed ? 'text-green-400' : theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <span className={goal.completed ? 'line-through text-gray-500' : ''}>
                  {goal.title}
                  {goal.linkedGoalId && <span className="ml-2 text-xs text-yellow-400">⭐</span>}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveView('goals')} className={`mt-4 ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-600'} text-sm`}>
            View all →
          </button>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40' : 'bg-gradient-to-br from-blue-200/60 to-cyan-200/60'} rounded-2xl p-6 border ${themeColors.border} backdrop-blur-xl shadow-2xl hover:scale-105 transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'} flex items-center gap-2`}>
              <Clock className="w-6 h-6" /> Smart Schedule
            </h3>
            <span className={`${theme === 'dark' ? 'bg-blue-500/30' : 'bg-blue-300/50'} px-3 py-1 rounded-full text-sm`}>{tasks.length}</span>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 3).map(task => (
              <div key={task.id} className={`flex items-center justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>{task.time}</span>
                  <span className="text-sm">{task.title}</span>
                </div>
                {task.rescheduled && <RefreshCw className="w-3 h-3 text-yellow-400" />}
              </div>
            ))}
          </div>
          <button onClick={() => setActiveView('tasks')} className={`mt-4 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-600'} text-sm`}>
            Manage tasks →
          </button>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40' : 'bg-gradient-to-br from-pink-200/60 to-purple-200/60'} rounded-2xl p-6 border ${themeColors.border} backdrop-blur-xl shadow-2xl hover:scale-105 transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-pink-200' : 'text-pink-900'} flex items-center gap-2`}>
              <Star className="w-6 h-6" /> Long-term Goals
            </h3>
            <span className={`${theme === 'dark' ? 'bg-pink-500/30' : 'bg-pink-300/50'} px-3 py-1 rounded-full text-sm`}>{longTermGoals.length}</span>
          </div>
          <div className="space-y-3">
            {longTermGoals.slice(0, 2).map(goal => (
              <div key={goal.id}>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm mb-1`}>{goal.title}</p>
                <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-300/50'} rounded-full h-2 overflow-hidden`}>
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveView('longterm')} className={`mt-4 ${theme === 'dark' ? 'text-pink-400 hover:text-pink-300' : 'text-pink-700 hover:text-pink-600'} text-sm`}>
            Track progress →
          </button>
        </div>
      </div>
    </div>
  );

  const AnalyticsView = () => {
    const totalGoals = dailyGoals.length;
    const completedGoals = dailyGoals.filter(g => g.completed).length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    const alignment = calculateGoalAlignment();
    
    // Weekly data simulation
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
        <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>Analytics & Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40' : 'bg-gradient-to-br from-purple-200/60 to-pink-200/60'} rounded-xl p-6 border ${themeColors.border} backdrop-blur-xl`}>
            <BarChart3 className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} mb-2`} />
            <p className={`${themeColors.textSecondary} text-sm`}>Completion Rate</p>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>{completionRate}%</p>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40' : 'bg-gradient-to-br from-blue-200/60 to-cyan-200/60'} rounded-xl p-6 border ${themeColors.border} backdrop-blur-xl`}>
            <Target className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'} mb-2`} />
            <p className={`${themeColors.textSecondary} text-sm`}>Alignment Score</p>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{alignment}%</p>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40' : 'bg-gradient-to-br from-green-200/60 to-emerald-200/60'} rounded-xl p-6 border ${themeColors.border} backdrop-blur-xl`}>
            <Zap className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'} mb-2`} />
            <p className={`${themeColors.textSecondary} text-sm`}>Energy Level</p>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-700'} capitalize`}>{energyLevel}</p>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40' : 'bg-gradient-to-br from-pink-200/60 to-purple-200/60'} rounded-xl p-6 border ${themeColors.border} backdrop-blur-xl`}>
            <Star className={`w-8 h-8 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-700'} mb-2`} />
            <p className={`${themeColors.textSecondary} text-sm`}>Active Goals</p>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-pink-300' : 'text-pink-700'}`}>{longTermGoals.length}</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40' : 'bg-gradient-to-br from-purple-200/60 to-pink-200/60'} rounded-xl p-6 border ${themeColors.border} backdrop-blur-xl`}>
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'} mb-6`}>Weekly Progress</h3>
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
                  <span className={`text-xs ${themeColors.textSecondary}`}>{day.day}</span>
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>{day.completed}/{day.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Long-term Progress */}
        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40' : 'bg-gradient-to-br from-pink-200/60 to-purple-200/60'} rounded-xl p-6 border ${themeColors.border} backdrop-blur-xl`}>
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-pink-200' : 'text-pink-900'} mb-4`}>Long-term Progress Overview</h3>
          <div className="space-y-4">
            {longTermGoals.map(goal => (
              <div key={goal.id} className={`${themeColors.cardBg} rounded-lg p-4 backdrop-blur-sm`}>
                <div className="flex justify-between mb-2">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{goal.title}</span>
                  <span className={`${theme === 'dark' ? 'text-pink-300' : 'text-pink-700'} font-semibold`}>{goal.progress}%</span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-2`}>
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all" style={{ width: `${goal.progress}%` }}></div>
                </div>
              </div>
            ))}
            {longTermGoals.length === 0 && (
              <p className={`${themeColors.textSecondary} text-center py-4`}>No long-term goals set yet</p>
            )}
          </div>
        </div>

        {/* Productivity Heatmap */}
        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40' : 'bg-gradient-to-br from-blue-200/60 to-cyan-200/60'} rounded-xl p-6 border ${themeColors.border} backdrop-blur-xl`}>
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'} mb-4`}>Productivity Heatmap (24 Hours)</h3>
          <div className="grid grid-cols-12 gap-2">
            {[...Array(24)].map((_, hour) => {
              const intensity = hour >= 9 && hour < 12 ? 100 : hour >= 14 && hour < 17 ? 70 : hour >= 6 && hour < 9 ? 50 : 20;
              return (
                <div key={hour} className="flex flex-col items-center gap-1">
                  <div 
                    className={`w-full h-16 rounded ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'} transition-all hover:scale-110`}
                    style={{ opacity: intensity / 100 }}
                    title={`${hour}:00 - ${intensity}% productive`}
                  ></div>
                  <span className={`text-xs ${themeColors.textSecondary}`}>{hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${themeColors.bg} ${themeColors.text} p-6 relative overflow-hidden transition-colors duration-500`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div key={i} className={`absolute w-1 h-1 ${themeColors.starColor} rounded-full animate-pulse`} style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            opacity: Math.random() * 0.7 + 0.3
          }}></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Bar with Theme Toggle and Notifications */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-3 rounded-full ${themeColors.cardBg} border ${themeColors.border} backdrop-blur-xl hover:scale-110 transition-all`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
            </button>
            
            <button
              onClick={requestNotificationPermission}
              className={`p-3 rounded-full ${themeColors.cardBg} border ${themeColors.border} backdrop-blur-xl hover:scale-110 transition-all relative`}
            >
              <BellRing className={`w-5 h-5 ${notificationsEnabled ? 'text-green-400' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`${themeColors.cardBg} backdrop-blur-xl rounded-2xl p-4 mb-8 border ${themeColors.border} shadow-2xl ${showMobileMenu ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { id: 'dashboard', icon: Sparkles, label: 'Dashboard' },
              { id: 'goals', icon: Target, label: 'Daily Goals' },
              { id: 'longterm', icon: Star, label: 'Long-term' },
              { id: 'tasks', icon: Clock, label: 'Smart Tasks' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'folders', icon: Folder, label: 'Folders' },
              { id: 'secret', icon: Lock, label: 'Vault' }
            ].map(item => (
              <button key={item.id} onClick={() => {
                setActiveView(item.id);
                setShowMobileMenu(false);
              }} className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                activeView === item.id 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50 text-white' 
                  : theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200/50 hover:bg-gray-300/50'
              }`}>
                <item.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <div className="relative">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'analytics' && <AnalyticsView />}
          {/* Other views would be similar conversions with theme support */}
        </div>
      </div>

      {/* Notifications Panel */}
      {notifications.length > 0 && <NotificationsPanel />}

      {/* AI Chat Assistant */}
      <ChatAssistant />

      <style jsx>{`
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

export default CosmicAssistant;