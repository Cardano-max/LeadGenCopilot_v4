import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleMapsBusinessScraper } from './gmaps_scraper_playwright.js';

// Load environment variables
dotenv.config();

// Create an instance of the scraper
const scraper = new GoogleMapsBusinessScraper({
    useParallel: process.env.USE_PARALLEL === 'true',
    maxConcurrency: parseInt(process.env.MAX_CONCURRENCY) || 2,
    maxResults: parseInt(process.env.MAX_RESULTS) || 50,
    delay: parseInt(process.env.DELAY) || 3000
});

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware - Fixed CORS for local development
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://192.168.1.3:3000', // Your network IP
    'https://your-frontend-app.onrender.com', // For production
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'LeadGen Copilot Backend API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Google Maps scraper endpoint
app.post('/api/scrape-gmaps', async (req, res) => {
  try {
    const { query, maxResults = 15 } = req.body;

    // Validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a non-empty string'
      });
    }

    if (maxResults > 500) {
      return res.status(400).json({
        success: false,
        error: 'Maximum results cannot exceed 500'
      });
    }

    const modeText = 'Playwright (Reliable)';
    console.log(`🔍 Starting ${modeText} scrape for query: "${query}" (max ${maxResults} results)`);

    // Initialize Playwright scraper
    const scraper = new GoogleMapsBusinessScraper({
      headless: true,
      maxResults: parseInt(maxResults),
      delay: 3000,
      verbose: true,
      retryLimit: 2,
      timeout: 45000,
      maxScrollAttempts: 10,
      scrollDelay: 2500
    });

    // Start scraping
    const startTime = Date.now();
    const results = await scraper.scrapeBusinesses(query, parseInt(maxResults));
    const endTime = Date.now();

    const processingTime = endTime - startTime;
    const avgSpeed = results.length > 0 ? processingTime / results.length : 0;

    console.log(`✅ ${modeText} scraping completed! Found ${results.length} businesses in ${processingTime}ms (${avgSpeed.toFixed(0)}ms per business)`);

    // Response
    res.json({
      success: true,
      query,
      totalResults: results.length,
      processingTime: processingTime,
      mode: 'playwright',
      results,
      stats: {
        ...scraper.stats,
        processingTimeMs: processingTime,
        avgTimePerResult: avgSpeed,
        mode: 'playwright-reliable'
      }
    });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: {
      'GET /': 'API status',
      'GET /health': 'Health check',
      'POST /api/scrape-gmaps': 'Google Maps scraper'
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 LeadGen Copilot Backend running on port ${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   • GET  http://localhost:${PORT}/ - API status`);
  console.log(`   • GET  http://localhost:${PORT}/health - Health check`);
  console.log(`   • POST http://localhost:${PORT}/api/scrape-gmaps - Google Maps scraper`);
  console.log(`🌍 CORS enabled for frontend connections`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});