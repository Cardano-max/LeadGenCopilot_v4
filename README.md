# 🚀 LeadGen Copilot - Complete Lead Generation Platform

A full-stack lead generation platform featuring Google Maps business scraper, email automation, and AI-powered outreach tools. Built with React.js frontend and Node.js backend, optimized for Render deployment.

![LeadGen Copilot](https://img.shields.io/badge/LeadGen-Copilot-blue?style=for-the-badge&logo=rocket)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18+-000000?style=for-the-badge&logo=express)
![Puppeteer](https://img.shields.io/badge/Puppeteer-21.6+-40B5A4?style=for-the-badge&logo=puppeteer)

## 📁 Project Structure

```
leadgen-copilot/
├── backend/                 # Node.js API Server
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Express server
│   ├── gmaps_scraper.js    # Google Maps scraper engine
│   ├── .env               # Backend environment variables
│   └── README.md          # Backend documentation
├── frontend/               # React.js Application
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── index.html         # HTML template
│   ├── tailwind.config.js # Tailwind configuration
│   ├── postcss.config.js  # PostCSS configuration
│   ├── .env              # Frontend environment variables
│   └── src/              # Source code
│       ├── App.jsx       # Main React component
│       ├── main.jsx      # React entry point
│       └── index.css     # Global styles
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## ✨ Features

### 🗺️ Google Maps Business Scraper
- **Proven Double-Scroll Technology** - Reliable extraction of unlimited business data
- **Comprehensive Data** - Names, phones, websites, addresses, ratings, coordinates
- **Multiple Formats** - JSON and CSV export options
- **Real-time Progress** - Live scraping progress and statistics
- **Render Optimized** - Memory efficient for cloud deployment

### 🔄 Additional Tools (Coming Soon)
- 📧 Gmail Email Extractor
- 🤖 AI Cold Outreach Generator
- 📱 WhatsApp Number Checker
- 💼 LinkedIn Auto Apply
- 📨 Mass Email Sender

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git

### 1. Clone Repository
```bash
git clone https://github.com/your-username/leadgen-copilot.git
cd leadgen-copilot
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:10000

## 🌐 Render Deployment

### Backend Deployment

1. **Create Render Web Service**
   - Connect your GitHub repository
   - Select "Web Service"
   - Set Root Directory: `backend`

2. **Configure Build Settings**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables**
   ```
   PORT=10000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-app.onrender.com
   ```

### Frontend Deployment

1. **Create Render Static Site**
   - Connect your GitHub repository
   - Select "Static Site"
   - Set Root Directory: `frontend`

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-app.onrender.com
   ```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm start           # Production start
npm test            # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 📊 API Endpoints

### Google Maps Scraper
```http
POST /api/scrape-gmaps
Content-Type: application/json

{
  "query": "restaurants in Miami",
  "maxResults": 50,
  "mode": "sequential"
}
```

### Health Check
```http
GET /health
```

## 🛠️ Configuration

### Backend Environment Variables
```bash
# Server Configuration
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.onrender.com

# Puppeteer Configuration
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
```

### Frontend Environment Variables
```bash
# API Configuration
VITE_API_URL=https://your-backend-app.onrender.com

# Feature Flags
VITE_ENABLE_GOOGLE_MAPS_SCRAPER=true
```

## 📈 Performance

| Mode | Speed | Memory | Success Rate | Best For |
|------|-------|--------|--------------|----------|
| Sequential | 1.5-2 sec/business | 50-100MB | 95-98% | Stability |
| Parallel | 0.4-0.6 sec/business | 150-250MB | 90-95% | Speed |

## 🔒 Security Features

- CORS protection
- Rate limiting ready
- Input validation
- Error handling
- Environment variable security

## 🐛 Troubleshooting

### Common Issues

**1. Build failures on Render**
```bash
# Ensure Node.js version in package.json engines
"engines": {
  "node": ">=18.0.0",
  "npm": ">=8.0.0"
}
```

**2. API connection issues**
```bash
# Check environment variables
echo $VITE_API_URL
echo $FRONTEND_URL
```

**3. Memory issues**
```bash
# Reduce concurrent workers in production
maxConcurrency: 1
```

## 📝 Scripts

### Backend Scripts
```bash
npm start           # Start production server
npm run dev         # Start with nodemon
npm test           # Run tests
```

### Frontend Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
```

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Coming Soon]
- **API Docs**: [Coming Soon]
- **Support**: support@leadgencopilot.com

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@leadgencopilot.com
- **Issues**: [GitHub Issues](https://github.com/your-username/leadgen-copilot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/leadgen-copilot/discussions)

## 🎯 Roadmap

- [x] Google Maps Business Scraper
- [x] React.js Frontend
- [x] Render Deployment
- [ ] Gmail Email Extractor
- [ ] AI Cold Outreach Generator
- [ ] WhatsApp Number Checker
- [ ] LinkedIn Auto Apply
- [ ] User Authentication
- [ ] Payment Integration
- [ ] Analytics Dashboard

---

**🚀 Built with ❤️ for lead generation professionals worldwide**