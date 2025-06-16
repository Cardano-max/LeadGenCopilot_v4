import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useSpring, useTransform, useInView, AnimatePresence, useAnimation } from 'framer-motion'
import { InView } from 'react-intersection-observer'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { 
  Menu, X, ChevronDown, ChevronRight, Play, Pause, Download, Upload, 
  MapPin, Mail, MessageSquare, Users, Zap, Target, BarChart3, 
  Globe, Smartphone, Laptop, Star, Check, ArrowRight, ExternalLink,
  Search, Filter, Database, Bot, Send, Phone, Linkedin, Instagram,
  Shield, Lock, Sparkles, Rocket, TrendingUp, DollarSign, Clock,
  Settings, User, LogIn, LogOut, Heart, Share2, Copy, Eye, EyeOff,
  FileText, PieChart, LineChart, Activity, Briefcase, Award,
  Monitor, Github, Twitter, Facebook, Youtube,
  Code, Terminal, Server, Cloud, Cpu, HardDrive, Wifi, Bluetooth
} from 'lucide-react'

// ===== API CONFIGURATION =====
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-app.onrender.com'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 900000, // 5 minutes timeout for scraping
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ===== UTILITY FUNCTIONS =====
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ===== CUSTOM HOOKS =====
const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = scrollPx / winHeightPx
      setScrollProgress(scrolled)
    }
    
    window.addEventListener('scroll', updateScrollProgress)
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])
  
  return scrollProgress
}

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })
  
  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }
  
  return [storedValue, setValue]
}

const useApiRequest = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const request = useCallback(async (config) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api(config)
      setLoading(false)
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || err.message)
      setLoading(false)
      throw err
    }
  }, [])
  
  return { request, loading, error }
}

// ===== SCROLL PROGRESS INDICATOR =====
const ScrollProgress = () => {
  const scrollProgress = useScrollProgress()
  
  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 z-50"
      style={{ scaleX: scrollProgress }}
    />
  )
}

// ===== FLOATING ELEMENTS =====
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-accent-pink/20 to-accent-coral/20 rounded-full blur-xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -15, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-accent-blue/20 to-accent-cyan/20 rounded-full blur-xl"
        animate={{
          y: [0, -25, 0],
          x: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute top-1/2 right-10 w-24 h-24 bg-gradient-to-br from-accent-green/20 to-accent-mint/20 rounded-full blur-xl"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  )
}

// ===== NAVIGATION COMPONENT =====
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'tools', label: 'Tools', href: '#tools' },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ]
  
  const scrollToSection = (href) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }
  
  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white/10 backdrop-blur-lg border-b border-white/20" : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <div className="font-bold text-xl">LeadGen</div>
                <div className="text-sm opacity-80">Copilot</div>
              </div>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    "relative text-white/80 hover:text-white transition-all duration-300 font-medium",
                    activeSection === item.id && "text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className="btn btn-ghost btn-md">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </button>
              <button className="btn btn-primary btn-md">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </motion.header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <motion.div
              className="absolute top-16 left-4 right-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left text-white hover:text-primary transition-colors py-2"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-white/20 space-y-3">
                  <button className="btn btn-ghost btn-md w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </button>
                  <button className="btn btn-primary btn-md w-full">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ===== HERO SECTION =====
const HeroSection = () => {
  const [currentText, setCurrentText] = useState(0)
  const heroTexts = [
    "Top Lead Generation Platform",
    "Google Maps Business Scraper", 
    "Email Automation Engine",
    "LinkedIn Auto Apply Tool",
    "WhatsApp Number Checker"
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % heroTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <section id="home" className="min-h-screen flex flex-col items-center justify-center relative py-20 px-4">
      <FloatingElements />
      
      <div className="container-custom relative z-10 text-center max-w-7xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          className="inline-flex items-center px-6 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white/90 text-lg font-medium mb-12 hover:bg-white/20 transition-all cursor-pointer"
          >
          <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
            Generate Unlimited Business Leads
          <ArrowRight className="w-5 h-5 ml-2" />
          </motion.div>
          
          {/* Main Headline */}
        <div className="mb-8">
              <AnimatePresence mode="wait">
            <motion.h1
                  key={currentText}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                >
              <span className="gradient-text-primary block mb-4">
                  {heroTexts[currentText]}
            </span>
              <span className="block">in the Age of AI</span>
            </motion.h1>
          </AnimatePresence>
        </div>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          className="text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
          Generate unlimited business leads with our AI-powered platform.{" "}
          <span className="gradient-text-secondary font-semibold">
            Proven to boost conversion rates by 54.7%!
          </span>
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
          >
          <button 
            onClick={() => document.querySelector('#gmaps-scraper')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn btn-primary btn-xl group min-w-[240px]"
          >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Start Generating Leads
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          <button className="btn btn-secondary btn-xl group min-w-[180px]">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </button>
          </motion.div>
          
        {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto"
          >
            {[
            { icon: MapPin, title: 'Maps Scraper', stats: '10M+', label: 'Leads Generated', color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-400' },
            { icon: Mail, title: 'Email Finder', stats: '95%', label: 'Accuracy Rate', color: 'from-rose-500 to-pink-600', textColor: 'text-rose-400' },
            { icon: MessageSquare, title: 'Cold Outreach', stats: '54.7%', label: 'Conversion Boost', color: 'from-violet-500 to-purple-600', textColor: 'text-violet-400' },
            { icon: Phone, title: 'WhatsApp Check', stats: '50K+', label: 'Happy Users', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-400' },
            { icon: Linkedin, title: 'LinkedIn Auto', stats: '1000+', label: 'Daily Apps', color: 'from-orange-500 to-amber-600', textColor: 'text-orange-400' }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="card p-6 text-center group cursor-pointer hover:scale-105 transition-all duration-300"
              whileHover={{ y: -5 }}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br mx-auto mb-4 p-2.5 group-hover:scale-110 transition-all duration-300",
                item.color
              )}>
                <item.icon className="w-full h-full text-white" />
              </div>
              <div className="text-white text-sm font-medium mb-2">{item.title}</div>
              <div className={cn(
                "text-lg font-bold mb-1",
                item.textColor
              )}>{item.stats}</div>
              <div className="text-xs text-white/60">{item.label}</div>
              <div className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full mt-2">
                Live
              </div>
            </motion.div>
          ))}
      </motion.div>
      </div>
    </section>
  )
}

// ===== FEATURES SECTION =====
const FeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Google Maps Lead Scraper',
      description: 'Extract unlimited business data from Google Maps with our proven double-scroll technology. Get names, addresses, phones, websites, and more.',
      badge: 'Working',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/5',
      borderColor: 'border-emerald-500/10',
      textColor: 'text-emerald-900',
      stats: '10M+ businesses',
      link: '#gmaps-scraper'
    },
    {
      icon: Mail,
      title: 'Gmail Email Extractor',
      description: 'Automatically extract and verify email addresses from Gmail with advanced pattern recognition and validation.',
      badge: 'Coming Soon',
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-500/5',
      borderColor: 'border-rose-500/10',
      textColor: 'text-rose-900',
      stats: '95% accuracy',
      link: '#gmail-extractor'
    },
    {
      icon: Bot,
      title: 'AI Cold Outreach Generator',
      description: 'Generate personalized cold emails and messages using advanced AI. Boost response rates with human-like communication.',
      badge: 'AI Powered',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/5',
      borderColor: 'border-violet-500/10',
      textColor: 'text-violet-900',
      stats: '54.7% boost',
      link: '#cold-outreach'
    },
    {
      icon: Phone,
      title: 'WhatsApp Number Checker',
      description: 'Verify WhatsApp numbers in bulk and check if they\'re active. Perfect for WhatsApp marketing campaigns.',
      badge: 'New',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/5',
      borderColor: 'border-green-500/10',
      textColor: 'text-green-900',
      stats: '99% verification',
      link: '#whatsapp-checker'
    },
    {
      icon: Linkedin,
      title: 'LinkedIn Auto Apply',
      description: 'Automatically apply to LinkedIn jobs with personalized cover letters. Increase your job application efficiency by 10x.',
      badge: 'Beta',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/5',
      borderColor: 'border-blue-500/10',
      textColor: 'text-blue-900',
      stats: '1000+ applications/day',
      link: '#linkedin-auto'
    },
    {
      icon: Send,
      title: 'Mass Cold Email Sender',
      description: 'Send thousands of personalized cold emails with advanced scheduling, tracking, and analytics capabilities.',
      badge: 'Pro',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-500/5',
      borderColor: 'border-orange-500/10',
      textColor: 'text-orange-900',
      stats: '10K+ emails/day',
      link: '#email-sender'
    }
  ]
  
  return (
    <section id="features" className="section bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="container-custom">
        <InView threshold={0.1} triggerOnce>
          {({ inView, ref }) => (
            <>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-4">
            Complete Platform
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Generate Endless Possibilities with One Click
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Through seamlessly integrated AI capabilities, we empower businesses to significantly enhance 
            lead generation efficiency, creativity, and market competitiveness.
          </p>
        </motion.div>
        
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={cn(
                      "relative p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 border cursor-pointer group",
                      feature.bgColor,
                      feature.borderColor,
                      "hover:scale-105 shadow-lg hover:shadow-xl"
                    )}
            >
              {/* Badge */}
                    <div className={cn(
                      "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold",
                      `bg-gradient-to-r ${feature.color} text-white shadow-sm`
                    )}>
                      {feature.badge}
                    </div>
              
              {/* Icon */}
              <div className={cn(
                      "w-12 h-12 rounded-xl mb-4 p-2.5 transition-all duration-300 group-hover:scale-110",
                `bg-gradient-to-br ${feature.color}`
              )}>
                      <feature.icon className="w-full h-full text-white" />
              </div>
              
              {/* Content */}
                    <h3 className={cn("text-xl font-bold mb-3", feature.textColor)}>{feature.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{feature.description}</p>
              
                    {/* Stats & CTA */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className={cn(
                        "text-sm font-semibold",
                        `bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`
                      )}>
                        {feature.stats}
                      </div>
                <button 
                  onClick={() => document.querySelector(feature.link)?.scrollIntoView({ behavior: 'smooth' })}
                        className={cn(
                          "inline-flex items-center text-sm font-semibold transition-all hover:translate-x-1",
                          feature.textColor
                        )}
                >
                  Try Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
            </>
          )}
        </InView>
      </div>
    </section>
  )
}

// ===== GOOGLE MAPS SCRAPER SECTION =====
const GoogleMapsScraperSection = () => {
  const [query, setQuery] = useState('restaurants in Miami')
  const [maxResults, setMaxResults] = useState(10)
  const [customResults, setCustomResults] = useState('')
  const [useCustomResults, setUseCustomResults] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState([])
  const [stats, setStats] = useState({ processed: 0, successful: 0, failed: 0 })
  const [progress, setProgress] = useState(0)
  const [isProMode, setIsProMode] = useState(false)
  const { request, loading } = useApiRequest()
  
  const handleScrapeStart = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }
    
    const finalMaxResults = useCustomResults ? parseInt(customResults) : maxResults
    
    if (!finalMaxResults || finalMaxResults < 1) {
      toast.error('Please enter a valid number of results')
      return
    }
    
    if (finalMaxResults > 500) {
      toast.error('Maximum 500 results allowed')
      return
    }
    
    setIsRunning(true)
    setResults([])
    setStats({ processed: 0, successful: 0, failed: 0 })
    setProgress(0)
    
    try {
      const modeType = isProMode ? 'parallel' : 'sequential'
      toast.loading(`Starting ${isProMode ? 'Pro (10x Faster)' : 'Standard'} scraper...`, { id: 'scraper' })
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 5, 90))
      }, isProMode ? 500 : 1000) // Faster progress for Pro mode
      
      const data = await request({
        method: 'POST',
        url: '/api/scrape-gmaps',
        data: { 
          query: query.trim(), 
          maxResults: finalMaxResults, 
          mode: modeType,
          proMode: isProMode
        }
      })
      
      clearInterval(progressInterval)
      setProgress(100)
      
      if (data.success) {
        setResults(data.results || [])
        setStats(data.stats || { processed: data.totalResults, successful: data.totalResults, failed: 0 })
        toast.success(`Successfully scraped ${data.totalResults} businesses in ${(data.processingTime/1000).toFixed(1)}s!`, { id: 'scraper' })
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }
      
    } catch (error) {
      console.error('Scraping error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Scraping failed'
      toast.error(`Scraping failed: ${errorMessage}`, { id: 'scraper' })
      setProgress(0)
    } finally {
      setIsRunning(false)
    }
  }
  
  const downloadResults = (format) => {
    if (results.length === 0) {
      toast.error('No results to download')
      return
    }
    
    const filename = `gmaps_results_${Date.now()}.${format}`
    const data = format === 'json' ? JSON.stringify(results, null, 2) : convertToCSV(results)
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }
  
  const convertToCSV = (data) => {
    const headers = ['Name', 'Category', 'Phone', 'Website', 'Address', 'Rating', 'Reviews']
    const rows = data.map(item => [
      item.name || '', item.category || '', item.phone || '',
      item.website || '', item.address || '', item.rating || '', item.reviewCount || ''
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
  
  return (
    <section id="gmaps-scraper" className="section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 font-medium text-sm mb-4">
            🗺️ Working Backend
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Google Maps Business Scraper
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Extract unlimited business data with our proven double-scroll technology. 
            Get names, phones, websites, addresses, and more from Google Maps.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Scraper Controls */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              <MapPin className="w-6 h-6 inline mr-2" />
              Scraper Configuration
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white/80 mb-2">Search Query</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., restaurants in Miami"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  disabled={isRunning}
                />
              </div>

              {/* Pro Mode Toggle */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-white font-semibold">🚀 Pro Mode (10x Faster)</h4>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                      Free for Now
                    </span>
                  </div>
                  <button
                    onClick={() => setIsProMode(!isProMode)}
                    disabled={isRunning}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors duration-300",
                      isProMode ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                      isProMode ? "translate-x-7" : "translate-x-1"
                    )} />
                  </button>
                </div>
                <p className="text-white/60 text-sm">
                  {isProMode 
                    ? "🔥 Concurrent processing enabled - Up to 10x faster scraping!" 
                    : "⚡ Enable for lightning-fast parallel processing"
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-white/80 mb-2">Number of Results</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="preset"
                      name="resultType"
                      checked={!useCustomResults}
                      onChange={() => setUseCustomResults(false)}
                      className="text-primary focus:ring-primary"
                      disabled={isRunning}
                    />
                    <label htmlFor="preset" className="text-white/80">Preset Options</label>
                  </div>
                  
                  {!useCustomResults && (
                    <select
                      value={maxResults}
                      onChange={(e) => setMaxResults(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      disabled={isRunning}
                    >
                      <option value={5} className="bg-gray-800">5 Results</option>
                      <option value={10} className="bg-gray-800">10 Results</option>
                      <option value={15} className="bg-gray-800">15 Results</option>
                      <option value={20} className="bg-gray-800">20 Results</option>
                      <option value={30} className="bg-gray-800">30 Results</option>
                      <option value={40} className="bg-gray-800">40 Results</option>
                      <option value={50} className="bg-gray-800">50 Results</option>
                    </select>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="custom"
                      name="resultType"
                      checked={useCustomResults}
                      onChange={() => setUseCustomResults(true)}
                      className="text-primary focus:ring-primary"
                      disabled={isRunning}
                    />
                    <label htmlFor="custom" className="text-white/80">Custom Amount</label>
                  </div>
                  
                  {useCustomResults && (
                    <input
                      type="number"
                      value={customResults}
                      onChange={(e) => setCustomResults(e.target.value)}
                      placeholder="Enter custom number (1-500)"
                      min="1"
                      max="500"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      disabled={isRunning}
                    />
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>
                      {isProMode ? "🚀 Pro Mode Scraping" : "⚡ Standard Scraping"} Progress
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        isProMode 
                          ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                          : "bg-gradient-to-r from-primary to-secondary"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/60 text-center">
                    {isProMode 
                      ? "Using concurrent processing for maximum speed"
                      : "Using sequential processing for stability"
                    }
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={handleScrapeStart}
                  disabled={isRunning || loading}
                  className={cn(
                    "btn flex-1",
                    isProMode 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
                      : "btn-primary"
                  )}
                >
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isProMode ? "Pro Scraping..." : "Scraping..."}
                    </>
                  ) : (
                    <>
                      {isProMode ? (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Start Pro Scraping (10x)
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Start Standard Scraping
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
              
              {results.length > 0 && (
                <div className="flex gap-4">
                  <button
                    onClick={() => downloadResults('json')}
                    className="btn btn-secondary flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    JSON
                  </button>
                  <button
                    onClick={() => downloadResults('csv')}
                    className="btn btn-secondary flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats */}
            {(stats.processed > 0 || isRunning) && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Live Stats</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{stats.processed || 0}</div>
                    <div className="text-xs text-white/60">Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{stats.successful || 0}</div>
                    <div className="text-xs text-white/60">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{stats.failed || 0}</div>
                    <div className="text-xs text-white/60">Failed</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Results Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              <Database className="w-6 h-6 inline mr-2" />
              Results Preview
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No results yet. Start scraping to see business data here.</p>
                </div>
              ) : (
                results.slice(0, 5).map((business, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white truncate">{business.name}</h4>
                      <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-white/80">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{business.address}</span>
                      </div>
                      {business.phone && business.phone !== 'Not Found' && (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      {business.rating && business.rating !== 'Not Found' && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-2 text-yellow-400 flex-shrink-0" />
                          <span>{business.rating} stars</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              
              {results.length > 5 && (
                <div className="text-center py-4">
                  <div className="text-white/60">+ {results.length - 5} more results</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ===== OTHER TOOL SECTIONS =====
const ToolSection = ({ id, icon: Icon, title, description, badge, features, comingSoon = false }) => {
  return (
    <section id={id} className="section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className={cn(
            "inline-flex items-center px-4 py-2 rounded-full font-medium text-sm mb-4",
            comingSoon ? "bg-orange-500/10 border border-orange-500/20 text-orange-400" : "bg-primary/10 border border-primary/20 text-primary"
          )}>
            {badge}
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <Icon className="w-8 h-8 inline mr-3" />
            {title}
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">{description}</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
          
          {/* Interface Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 relative"
          >
            {comingSoon && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-white mx-auto mb-4" />
                  <div className="text-xl font-bold text-white mb-2">Coming Soon</div>
                  <div className="text-white/70">This feature is under development</div>
                </div>
              </div>
            )}
            
            <div className="text-center py-12">
              <Icon className="w-24 h-24 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Demo</h3>
              <p className="text-white/70 mb-6">
                {comingSoon ? 'Preview will be available soon' : 'Click to try the live demo'}
              </p>
              <button 
                className={cn(
                  "btn btn-primary",
                  comingSoon && "opacity-50 cursor-not-allowed"
                )}
                disabled={comingSoon}
              >
                {comingSoon ? 'Coming Soon' : 'Try Now'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ===== PRICING SECTION =====
const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')
  
  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        '100 Google Maps leads/month',
        '50 email verifications/month',
        'Basic cold outreach templates',
        'CSV/JSON export',
        'Email support'
      ],
      badge: null,
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 29, yearly: 290 },
      description: 'Best for growing businesses',
      features: [
        '10,000 Google Maps leads/month',
        '5,000 email verifications/month',
        'AI-powered cold outreach',
        'WhatsApp number checking',
        'LinkedIn auto apply (500/day)',
        'Priority support',
        'Advanced analytics'
      ],
      badge: 'Most Popular',
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      description: 'For teams and agencies',
      features: [
        'Unlimited Google Maps leads',
        'Unlimited email verifications',
        'Custom AI outreach models',
        'White-label solution',
        'Team collaboration',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ],
      badge: 'Coming Soon',
      cta: 'Contact Sales',
      popular: false
    }
  ]
  
  return (
    <section id="pricing" className="section bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-4">
            Simple Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Choose Your Lead Generation Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-2 rounded-md font-medium transition-all",
                billingCycle === 'monthly' ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-4 py-2 rounded-md font-medium transition-all",
                billingCycle === 'yearly' ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
              )}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "relative p-6 lg:p-8 bg-white rounded-2xl border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer",
                plan.popular && "ring-2 ring-primary transform scale-105"
              )}
            >
              {plan.badge && (
                <div className={cn(
                  "absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold shadow-lg",
                  plan.badge === 'Most Popular' ? "bg-gradient-to-r from-primary to-secondary text-white" : "bg-gradient-to-r from-orange-400 to-yellow-400 text-white"
                )}>
                  {plan.badge}
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price[billingCycle]}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    Save ${(plan.price.monthly * 12) - plan.price.yearly} per year
                  </div>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300",
                  plan.popular 
                    ? "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:scale-105" 
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                  plan.name === 'Enterprise' && "opacity-50 cursor-not-allowed"
                )}
                disabled={plan.name === 'Enterprise'}
              >
                {plan.cta}
                {plan.name !== 'Enterprise' && <ArrowRight className="w-4 h-4 ml-2 inline" />}
              </button>
            </motion.div>
          ))}
        </div>
        
        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                q: "Is there a free trial?",
                a: "Yes, our Free plan gives you access to core features. Pro plans come with a 7-day free trial."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and wire transfers for Enterprise plans."
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. Cancel anytime with no questions asked. No hidden fees or penalties."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ===== FOOTER =====
const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = {
    'Product': [
      { label: 'Google Maps Scraper', href: '#gmaps-scraper' },
      { label: 'Email Extractor', href: '#gmail-extractor' },
      { label: 'Cold Outreach', href: '#cold-outreach' },
      { label: 'WhatsApp Checker', href: '#whatsapp-checker' },
      { label: 'LinkedIn Auto Apply', href: '#linkedin-auto' },
      { label: 'Pricing', href: '#pricing' }
    ],
    'Company': [
      { label: 'About Us', href: '#about' },
      { label: 'Contact', href: '#contact' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' }
    ],
    'Resources': [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community' },
      { label: 'Status', href: '/status' }
    ],
    'Legal': [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' }
    ]
  }
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl">LeadGen Copilot</div>
                <div className="text-sm opacity-80">AI-Powered Lead Generation</div>
              </div>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              Generate unlimited business leads with our AI-powered platform. 
              Trusted by 50,000+ users worldwide.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: 'https://twitter.com' },
                { icon: Facebook, href: 'https://facebook.com' },
                { icon: Linkedin, href: 'https://linkedin.com' },
                { icon: Github, href: 'https://github.com' }
              ].map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white/70 mb-4 md:mb-0">
            © {currentYear} LeadGen Copilot. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-sm text-white/70">
            <span>Made with ❤️ for lead generation</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ===== MAIN APP COMPONENT =====
const App = () => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window !== 'undefined') {
    setMounted(true)
    
    // Set up smooth scrolling for anchor links
    const handleAnchorClick = (e) => {
      const href = e.target.getAttribute('href')
      if (href?.startsWith('#')) {
        e.preventDefault()
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
    
    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
    }
  }, [])
  
  // Show loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <ScrollProgress />
      <Navigation />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <GoogleMapsScraperSection />
        
        {/* Other Tool Sections */}
        <ToolSection
          id="gmail-extractor"
          icon={Mail}
          title="Gmail Email Extractor"
          description="Extract and verify email addresses from Gmail with advanced pattern recognition"
          badge="🔥 Coming Soon"
          comingSoon={true}
          features={[
            { title: 'Pattern Recognition', description: 'Advanced AI to find email patterns in Gmail' },
            { title: 'Bulk Verification', description: 'Verify thousands of emails in minutes' },
            { title: 'Export Options', description: 'CSV, JSON, and direct CRM integration' },
            { title: 'Privacy Compliant', description: 'GDPR and privacy regulation compliant' }
          ]}
        />
        
        <ToolSection
          id="cold-outreach"
          icon={Bot}
          title="AI Cold Outreach Generator"
          description="Generate personalized cold emails with AI to boost response rates"
          badge="🤖 AI Powered"
          comingSoon={true}
          features={[
            { title: 'AI Personalization', description: 'Generate unique messages for each prospect' },
            { title: 'A/B Testing', description: 'Test different approaches automatically' },
            { title: 'Response Tracking', description: 'Track opens, clicks, and responses' },
            { title: 'Template Library', description: '1000+ proven templates across industries' }
          ]}
        />
        
        <ToolSection
          id="whatsapp-checker"
          icon={Phone}
          title="WhatsApp Number Checker"
          description="Verify WhatsApp numbers in bulk for marketing campaigns"
          badge="📱 New Feature"
          comingSoon={true}
          features={[
            { title: 'Bulk Verification', description: 'Check thousands of numbers at once' },
            { title: 'Active Status', description: 'See if numbers are active on WhatsApp' },
            { title: 'Profile Info', description: 'Get profile pictures and status info' },
            { title: 'Export Results', description: 'Clean lists ready for marketing' }
          ]}
        />
        
        <ToolSection
          id="linkedin-auto"
          icon={Linkedin}
          title="LinkedIn Auto Apply"
          description="Automatically apply to LinkedIn jobs with personalized cover letters"
          badge="💼 Beta"
          comingSoon={true}
          features={[
            { title: 'Auto Application', description: 'Apply to jobs automatically 24/7' },
            { title: 'Custom Cover Letters', description: 'AI-generated personalized letters' },
            { title: 'Job Filtering', description: 'Advanced filters for relevant positions' },
            { title: 'Application Tracking', description: 'Track all applications and responses' }
          ]}
        />
        
        <ToolSection
          id="email-sender"
          icon={Send}
          title="Mass Cold Email Sender"
          description="Send thousands of personalized emails with advanced tracking"
          badge="📧 Pro Feature"
          comingSoon={true}
          features={[
            { title: 'Mass Sending', description: 'Send up to 10,000 emails per day' },
            { title: 'Smart Scheduling', description: 'Optimal timing for each recipient' },
            { title: 'Deliverability', description: 'High inbox rates with warm-up' },
            { title: 'Analytics', description: 'Detailed campaign performance metrics' }
          ]}
        />
        
        <PricingSection />
      </main>
      
      <Footer />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#1a1a1a',
            fontWeight: '500',
            padding: '16px',
            fontSize: '14px',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
            style: {
              border: '1px solid rgba(16, 185, 129, 0.2)',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.2)',
            },
          },
          loading: {
            iconTheme: {
              primary: '#667eea',
              secondary: '#FFFFFF',
            },
            style: {
              border: '1px solid rgba(102, 126, 234, 0.2)',
            },
          },
        }}
      />
    </div>
  )
}

export default App