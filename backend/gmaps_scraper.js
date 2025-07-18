/**
 * 🚀 GOOGLE MAPS BUSINESS SCRAPER - RENDER OPTIMIZED VERSION
 * 
 * Features:
 * - Fixed Chrome detection for Render environment
 * - Uses Puppeteer's bundled Chromium by default
 * - Proven double-scroll method (6→12→18 results tested)
 * - Pro Mode with parallel processing (10x faster)
 * - Production-ready error handling
 * 
 * @version 1.0.0
 * @author LeadGen Copilot Team
 */

import { Cluster } from 'puppeteer-cluster';
import puppeteer from 'puppeteer';
import fs from 'fs';

class GoogleMapsBusinessScraper {
    constructor(options = {}) {
        this.options = {
            maxConcurrency: options.maxConcurrency ?? 2,
            useParallel: options.useParallel ?? false,
            headless: options.headless ?? true,
            maxResults: options.maxResults ?? 50,
            delay: options.delay ?? 3000,
            verbose: options.verbose ?? false,
            retryLimit: options.retryLimit ?? 2,
            timeout: options.timeout ?? 45000,
            outputFormat: options.outputFormat ?? 'json',
            maxScrollAttempts: options.maxScrollAttempts ?? 10,
            scrollDelay: options.scrollDelay ?? 2500,
            proMode: options.proMode ?? false,
            ...options
        };
        
        // Proven working selectors
        this.selectors = {
            feedContainer: '[role="feed"]',
            resultContainer: '.Nv2PK',
            resultLinks: 'a[href*="/place/"]',
            businessName: 'h1.DUwDvf.lfPIob',
            businessCategory: 'button.DkEaL',
            websiteLink: 'a[data-item-id="authority"]',
            phoneNumber: 'button[aria-label^="Phone:"]',
            address: 'button[data-item-id="address"]',
            rating: 'div.F7nice span[aria-hidden="true"]',
            reviewCount: 'button[aria-label*="reviews"]',
            hours: 'div[aria-label*="Hours"]',
            priceLevel: 'span[aria-label*="Price"]'
        };
        
        this.results = [];
        this.cluster = null;
        this.browser = null;
        this.page = null;
        this.stats = {
            total: 0,
            processed: 0,
            successful: 0,
            failed: 0,
            scrollAttempts: 0,
            startTime: null,
            endTime: null,
            mode: 'sequential'
        };
    }

    log(message, type = 'info') {
        if (!this.options.verbose && type === 'debug') return;
        
        const timestamp = new Date().toLocaleTimeString();
        const icons = {
            info: '📋', success: '✅', error: '❌', debug: '🔍',
            warn: '⚠️', cluster: '🚀', scroll: '📜'
        };
        
        console.log(`${icons[type]} [${timestamp}] ${message}`);
    }

    exploreDirectory(dirPath, maxDepth, currentDepth = 0) {
        if (currentDepth >= maxDepth) return;
        
        try {
            const items = fs.readdirSync(dirPath);
            const indent = '  '.repeat(currentDepth);
            
            for (const item of items) {
                const itemPath = `${dirPath}/${item}`;
                try {
                    const stats = fs.statSync(itemPath);
                    if (stats.isDirectory()) {
                        this.log(`${indent}📁 ${item}/`, 'info');
                        if (item.includes('chrome') || item.includes('puppeteer')) {
                            this.exploreDirectory(itemPath, maxDepth, currentDepth + 1);
                        }
                    } else {
                        if (item.includes('chrome')) {
                            this.log(`${indent}📄 ${item} (${stats.size} bytes)`, 'info');
                        }
                    }
                } catch (itemError) {
                    this.log(`${indent}⚠️ Error checking ${item}: ${itemError.message}`, 'debug');
                }
            }
        } catch (error) {
            this.log(`⚠️ Error exploring ${dirPath}: ${error.message}`, 'warn');
        }
    }
    /**
     * Get browser launch options optimized for Render
     */
    async getBrowserOptions() {
        const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';
        
        if (isRender) {
            // Render environment - use build-time installed Chrome
            this.log('🌐 Running on Render - using build-time Chrome', 'info');
           
            const args = [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--disable-dev-tools',
                '--disable-software-rasterizer',
                '--disable-notifications',
                '--disable-extensions',
                '--disable-default-apps',
                '--disable-sync',
                '--no-default-browser-check',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ];
            
            // Debug: List actual directory contents
            this.log('🔍 Debugging directory structure...', 'info');
            try {
                const renderDir = '/opt/render';
                if (fs.existsSync(renderDir)) {
                    this.log(`📁 /opt/render exists`, 'info');
                    const renderContents = fs.readdirSync(renderDir);
                    this.log(`📁 /opt/render contents: ${renderContents.join(', ')}`, 'info');
                    
                    // Check project directory
                    const projectDir = '/opt/render/project';
                    if (fs.existsSync(projectDir)) {
                        this.log(`📁 /opt/render/project exists`, 'info');
                        const projectContents = fs.readdirSync(projectDir);
                        this.log(`📁 /opt/render/project contents: ${projectContents.join(', ')}`, 'info');
                    }
                }
                
                // Check the actual .cache directory structure
                const baseCacheDir = '/opt/render/.cache';
                if (fs.existsSync(baseCacheDir)) {
                    this.log(`📁 Base cache directory exists: ${baseCacheDir}`, 'info');
                    const baseCacheContents = fs.readdirSync(baseCacheDir);
                    this.log(`📁 Base cache contents: ${baseCacheContents.join(', ')}`, 'info');
                    
                    // Check if puppeteer subdirectory exists
                    const puppeteerCacheDir = '/opt/render/.cache/puppeteer';
                    if (fs.existsSync(puppeteerCacheDir)) {
                        this.log(`📁 Puppeteer cache directory exists: ${puppeteerCacheDir}`, 'info');
                        const puppeteerContents = fs.readdirSync(puppeteerCacheDir);
                        this.log(`📁 Puppeteer cache contents: ${puppeteerContents.join(', ')}`, 'info');
                        
                        // Check chrome subdirectory
                        const chromeDir = '/opt/render/.cache/puppeteer/chrome';
                        if (fs.existsSync(chromeDir)) {
                            this.log(`📁 Chrome directory exists: ${chromeDir}`, 'info');
                            const chromeContents = fs.readdirSync(chromeDir);
                            this.log(`📁 Chrome directory contents: ${chromeContents.join(', ')}`, 'info');
                        }
                    } else {
                        this.log(`❌ Puppeteer cache directory not found: ${puppeteerCacheDir}`, 'error');
                        this.log(`🔍 Let's see what's actually in the base cache...`, 'info');
                        
                        // Recursively explore .cache to find Chrome
                        this.exploreDirectory(baseCacheDir, 2); // Max depth 2
                    }
                } else {
                    this.log(`❌ Base cache directory not found: ${baseCacheDir}`, 'error');
                }
            } catch (debugError) {
                this.log(`⚠️ Debug error: ${debugError.message}`, 'warn');
            }
            
            // Try to find Chrome in various locations
            const possibleChromePaths = [
                '/opt/render/.cache/puppeteer/chrome/linux-124.0.6367.207/chrome-linux64/chrome',
                '/opt/render/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome',
                process.env.PUPPETEER_EXECUTABLE_PATH,
                // Try to find in project directory
                '/opt/render/project/src/backend/.cache/puppeteer/chrome/linux-124.0.6367.207/chrome-linux64/chrome',
                '/opt/render/project/src/backend/node_modules/puppeteer/.local-chromium/linux-*/chrome-linux/chrome'
            ].filter(Boolean);
            
            // Try each possible Chrome path
            for (const chromePath of possibleChromePaths) {
                try {
                    if (fs.existsSync(chromePath)) {
                        this.log(`✅ Found build-time Chrome: ${chromePath}`, 'success');
                        return {
                            headless: 'new',
                            defaultViewport: { width: 1366, height: 768 },
                            args,
                            executablePath: chromePath,
                            ignoreHTTPSErrors: true,
                            ignoreDefaultArgs: ['--disable-extensions'],
                            handleSIGINT: false,
                            handleSIGTERM: false,
                            handleSIGHUP: false
                        };
                    } else {
                        this.log(`❌ Chrome not found at: ${chromePath}`, 'debug');
                    }
                } catch (error) {
                    this.log(`⚠️ Error checking Chrome path ${chromePath}: ${error.message}`, 'debug');
                }
            }
            
            this.log('🔄 No Chrome found, using Puppeteer auto-detection', 'warn');
            
            // Final fallback to Puppeteer auto-detection
            return {
                headless: 'new',
                defaultViewport: { width: 1366, height: 768 },
                args,
                ignoreHTTPSErrors: true,
                ignoreDefaultArgs: ['--disable-extensions'],
                handleSIGINT: false,
                handleSIGTERM: false,
                handleSIGHUP: false
            };
        } else {
            // Local development - try to find Chrome
            const chromePath = this.getLocalChromePath();
            this.log(`💻 Local development - Chrome path: ${chromePath || 'auto-detect'}`, 'info');
            
            const options = {
                headless: 'new',
                defaultViewport: { width: 1366, height: 768 },
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-gpu'
                ]
            };
            
            if (chromePath) {
                options.executablePath = chromePath;
            }
            
            return options;
        }
    }
    /**
     * Find Chrome executable path in Render environment
     */
    getRenderChromePath() {
        const cacheDir = process.env.PUPPETEER_CACHE_DIR || '/opt/render/.cache/puppeteer';
        this.log(`🔍 Searching for Chrome in cache directory: ${cacheDir}`, 'info');
        
        // First, let's explore the actual directory structure
        try {
            if (fs.existsSync(cacheDir)) {
                this.log(`✅ Cache directory exists: ${cacheDir}`, 'info');
                const contents = fs.readdirSync(cacheDir);
                this.log(`📁 Cache directory contents: ${contents.join(', ')}`, 'info');
                
                // Check chrome subdirectory
                const chromeDir = `${cacheDir}/chrome`;
                if (fs.existsSync(chromeDir)) {
                    this.log(`✅ Chrome directory exists: ${chromeDir}`, 'info');
                    const chromeContents = fs.readdirSync(chromeDir);
                    this.log(`📁 Chrome directory contents: ${chromeContents.join(', ')}`, 'info');
                    
                    // Look for any linux version directory
                    for (const item of chromeContents) {
                        if (item.startsWith('linux-')) {
                            const versionDir = `${chromeDir}/${item}`;
                            this.log(`🔍 Checking version directory: ${versionDir}`, 'info');
                            
                            if (fs.existsSync(versionDir)) {
                                const versionContents = fs.readdirSync(versionDir);
                                this.log(`📁 Version directory contents: ${versionContents.join(', ')}`, 'info');
                                
                                // Check for chrome-linux64 directory
                                const chromeLinuxDir = `${versionDir}/chrome-linux64`;
                                if (fs.existsSync(chromeLinuxDir)) {
                                    this.log(`✅ Chrome-linux64 directory exists: ${chromeLinuxDir}`, 'info');
                                    const linuxContents = fs.readdirSync(chromeLinuxDir);
                                    this.log(`📁 Chrome-linux64 contents: ${linuxContents.join(', ')}`, 'info');
                                    
                                    // Check for chrome executable
                                    const chromePath = `${chromeLinuxDir}/chrome`;
                                    if (fs.existsSync(chromePath)) {
                                        this.log(`✅ Found Chrome executable: ${chromePath}`, 'success');
                                        
                                        // Check if it's executable
                                        try {
                                            const stats = fs.statSync(chromePath);
                                            this.log(`📊 Chrome file permissions: ${stats.mode.toString(8)}`, 'info');
                                            return chromePath;
                                        } catch (statError) {
                                            this.log(`⚠️ Error checking Chrome stats: ${statError.message}`, 'warn');
                                            return chromePath; // Still try to use it
                                        }
                                    } else {
                                        this.log(`❌ Chrome executable not found at: ${chromePath}`, 'error');
                                    }
                                } else {
                                    this.log(`❌ Chrome-linux64 directory not found: ${chromeLinuxDir}`, 'error');
                                }
                            }
                        }
                    }
                } else {
                    this.log(`❌ Chrome directory not found: ${chromeDir}`, 'error');
                }
            } else {
                this.log(`❌ Cache directory not found: ${cacheDir}`, 'error');
            }
        } catch (error) {
            this.log(`❌ Error exploring directory structure: ${error.message}`, 'error');
        }
        
        // Fallback: try known paths directly
        const fallbackPaths = [
            `${cacheDir}/chrome/linux-124.0.6367.207/chrome-linux64/chrome`,
            `${cacheDir}/chrome/linux-121.0.6167.85/chrome-linux64/chrome`,
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome'
        ];
        
        this.log(`🔄 Trying fallback paths...`, 'info');
        for (const path of fallbackPaths) {
            if (fs.existsSync(path)) {
                this.log(`✅ Found Chrome at fallback path: ${path}`, 'success');
                return path;
            } else {
                this.log(`❌ Fallback path not found: ${path}`, 'debug');
            }
        }
        
        this.log('❌ No Chrome executable found in any location', 'error');
        return null;
    }

    /**
     * Find Chrome executable path for local development
     */
    getLocalChromePath() {
        const platform = process.platform;
        
        if (platform === 'darwin') {
            // macOS - check multiple possible paths
            const macPaths = [
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                '/Applications/Chromium.app/Contents/MacOS/Chromium'
            ];
            
            for (const path of macPaths) {
                try {
                    if (fs.existsSync(path)) {
                        this.log(`✅ Found Chrome at: ${path}`, 'success');
                        return path;
                    }
                } catch (error) {
                    // Continue checking other paths
                }
            }
            
            this.log('⚠️ Chrome not found at expected paths, using auto-detect', 'warn');
            return undefined; // Let puppeteer auto-detect
            
        } else if (platform === 'win32') {
            // Windows
            const winPaths = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
            ];
            
            for (const path of winPaths) {
                try {
                    if (fs.existsSync(path)) {
                        this.log(`✅ Found Chrome at: ${path}`, 'success');
                        return path;
                    }
                } catch (error) {
                    // Continue checking other paths
                }
            }
        }
        
        return undefined; // Let puppeteer auto-detect
    }

    /**
     * PROVEN DOUBLE SCROLL METHOD - Optimized for Render
     */
    async performDoubleScroll(page) {
        return await page.evaluate(() => {
            const container = document.querySelector('[role="feed"]');
            if (!container) return { success: false, error: 'No feed container found' };
            
            const beforeScrollTop = container.scrollTop;
            const beforeHeight = container.scrollHeight;
            
            // FIRST SCROLL - Triggers loading
            container.scrollTop += 800;
            
            // SECOND SCROLL - Shows results (with delay)
            setTimeout(() => {
                container.scrollTop += 200;
            }, 500);
            
            return {
                success: true,
                beforeScrollTop,
                afterScrollTop: container.scrollTop + 200,
                beforeHeight,
                heightChanged: container.scrollHeight > beforeHeight
            };
        });
    }

    /**
     * INFINITE SCROLL HANDLER - Render Optimized
     */
    async handleInfiniteScroll(page, maxResults) {
        this.log(`📜 Starting proven double-scroll method for ${maxResults} results...`, 'scroll');
        
        let scrollAttempts = 0;
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = this.options.proMode ? 3 : 2;
        
        while (scrollAttempts < this.options.maxScrollAttempts) {
            try {
                const currentResults = await page.$$eval(this.selectors.resultContainer, els => els.length);
                
                this.log(`📊 Attempt ${scrollAttempts + 1}: ${currentResults}/${maxResults} results`, 'debug');

                if (currentResults >= maxResults) {
                    this.log(`�� Target reached: ${currentResults}/${maxResults} results`, 'scroll');
                    break;
                }

                const scrollResult = await this.performDoubleScroll(page);
                
                if (!scrollResult.success) {
                    consecutiveFailures++;
                    this.log(`❌ Scroll failed: ${scrollResult.error}`, 'error');
                    
                    if (consecutiveFailures >= maxConsecutiveFailures) {
                        this.log(`🛑 Too many scroll failures (${consecutiveFailures})`, 'error');
                        break;
                    }
                    continue;
                }

                this.log(`✅ Double scroll: ${scrollResult.beforeScrollTop} → ${scrollResult.afterScrollTop}`, 'debug');
                consecutiveFailures = 0;

                await new Promise(resolve => setTimeout(resolve, this.options.scrollDelay));

                const newResultCount = await page.$$eval(this.selectors.resultContainer, els => els.length);
                const newResults = newResultCount - currentResults;
                
                if (newResults > 0) {
                    this.log(`🎉 Loaded ${newResults} new results! Total: ${newResultCount}`, 'success');
                } else {
                    this.log(`⏸️ No new results this round`, 'debug');
                }
                
                scrollAttempts++;
                this.stats.scrollAttempts = scrollAttempts;
                
                const isAtBottom = await page.evaluate(() => {
                    const container = document.querySelector('[role="feed"]');
                    return container ? container.scrollTop + container.clientHeight >= container.scrollHeight - 100 : false;
                });

                if (isAtBottom && newResults === 0) {
                    this.log(`🏁 Reached bottom of results`, 'scroll');
                    break;
                }
                
            } catch (error) {
                this.log(`❌ Scroll error: ${error.message}`, 'error');
                scrollAttempts++;
                consecutiveFailures++;
            }
        }
        
        const finalCount = await page.$$eval(this.selectors.resultContainer, els => els.length);
        this.log(`🎯 Scroll complete: ${finalCount} results after ${scrollAttempts} attempts`, 'scroll');
        
        return {
            totalResults: finalCount,
            scrollAttempts,
            success: finalCount > 0
        };
    }

    /**
     * Extract business data with comprehensive details
     */
    async extractBusinessData(page, query, resultIndex) {
        return await page.evaluate((selectors, query, resultIndex) => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.textContent.trim() : 'Not Found';
            };

            const getHref = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.href : 'Not Found';
            };

            const getPhoneFromAria = (selector) => {
                const el = document.querySelector(selector);
                if (el) {
                    const ariaLabel = el.getAttribute('aria-label');
                    return ariaLabel ? ariaLabel.replace('Phone: ', '').trim() : 'Not Found';
                }
                return 'Not Found';
            };

            const getCoordinates = () => {
                const urlMatch = window.location.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (urlMatch) {
                    return {
                        lat: parseFloat(urlMatch[1]),
                        lng: parseFloat(urlMatch[2])
                    };
                }
                return null;
            };

            return {
                name: getText(selectors.businessName),
                category: getText(selectors.businessCategory),
                website: getHref(selectors.websiteLink),
                phone: getPhoneFromAria(selectors.phoneNumber),
                address: getText(selectors.address),
                rating: getText(selectors.rating),
                reviewCount: getText(selectors.reviewCount),
                hours: getText(selectors.hours),
                priceLevel: getText(selectors.priceLevel),
                coordinates: getCoordinates(),
                searchQuery: query,
                resultIndex: resultIndex,
                googleMapsUrl: window.location.href,
                extractedAt: new Date().toISOString()
            };
        }, this.selectors, query, resultIndex);
    }

    /**
     * Sequential scraper optimized for Render
     */
    async scrapeSequential(query, maxResults) {
        this.log('🔄 Using sequential scraping mode (Render optimized)', 'info');
        this.stats.mode = 'sequential';
        
        try {
            // Browser configuration optimized for Render
            const browserOptions = await this.getBrowserOptions();
            this.browser = await puppeteer.launch(browserOptions);

            this.page = await this.browser.newPage();
            
            // Set user agent
            await this.page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            );

            // Navigate to Google Maps
            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `https://www.google.com/maps/search/${encodedQuery}`;
            
            this.log(`🌐 Navigating to: ${searchUrl}`);
            await this.page.goto(searchUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for initial results
            await this.page.waitForSelector(this.selectors.resultContainer, { timeout: 20000 });
            await new Promise(resolve => setTimeout(resolve, this.options.delay));
            
            const initialResults = await this.page.$$eval(this.selectors.resultContainer, els => els.length);
            this.log(`📊 Initial results loaded: ${initialResults}`);
            
            // Perform proven infinite scroll
            const scrollResult = await this.handleInfiniteScroll(this.page, maxResults);
            
            if (!scrollResult || !scrollResult.success) {
                const currentCount = await this.page.$$eval(this.selectors.resultContainer, els => els.length);
                if (currentCount === 0) {
                    throw new Error('Failed to load any results during scrolling');
                }
                this.log(`✅ Fallback: Found ${currentCount} results despite scroll error`, 'success');
            }
            
            // Get all business URLs
            const businessUrls = await this.page.$$eval(this.selectors.resultLinks, links => 
                Array.from(links, (link, index) => ({
                    url: link.href,
                    index: index + 1
                }))
            );
            
            this.log(`🔗 Found ${businessUrls.length} business URLs to process`);
            
            const resultsToProcess = Math.min(maxResults, businessUrls.length);
            
            // Process each business with progress logging
            for (let i = 0; i < resultsToProcess; i++) {
                const business = businessUrls[i];
                
                this.log(`🏢 Processing Business ${i + 1}/${resultsToProcess}: ${business.url.slice(0, 80)}...`);

                try {
                    await this.page.goto(business.url, {
                        waitUntil: 'networkidle2',
                        timeout: this.options.timeout
                    });
                    
                    await this.page.waitForSelector(this.selectors.businessName, { timeout: 10000 });
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    const businessDetails = await this.extractBusinessData(this.page, query, i + 1);
                    
                    if (businessDetails && businessDetails.name !== 'Not Found') {
                        this.results.push(businessDetails);
                        this.stats.successful++;
                        this.log(`✅ Successfully extracted: ${businessDetails.name}`, 'success');
                    } else {
                        this.stats.failed++;
                        this.log(`❌ Failed to extract valid business data`, 'error');
                    }

                    if (i < resultsToProcess - 1) {
                        const delay = this.options.delay + Math.random() * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }

                } catch (error) {
                    this.stats.failed++;
                    this.log(`❌ Error processing business ${i + 1}: ${error.message}`, 'error');
                    continue;
                }
                
                this.stats.processed++;
            }

            return this.results;

        } catch (error) {
            this.log(`❌ Sequential scraping failed: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Parallel scraper for Pro Mode - 10x faster (Render optimized)
     */
    async scrapeParallel(query, maxResults) {
        this.log('🚀 Using PRO parallel scraping mode (10x faster)', 'cluster');
        this.stats.mode = 'parallel-pro';
        
        try {
            // Get optimized browser options for Render
            const browserOptions = await this.getBrowserOptions();
            
            // Initialize cluster with optimized settings for speed
            this.cluster = await Cluster.launch({
                concurrency: Cluster.CONCURRENCY_CONTEXT,
                maxConcurrency: this.options.maxConcurrency,
                retryLimit: this.options.retryLimit,
                timeout: this.options.timeout,
                monitor: this.options.verbose,
                puppeteerOptions: browserOptions
            });

            this.log(`✅ Pro cluster initialized with ${this.options.maxConcurrency} workers`, 'success');

            // First, get business URLs using sequential method
            const businessUrls = await this.getBusinessUrlsSequential(query, maxResults);
            
            if (businessUrls.length === 0) {
                throw new Error('No business URLs found');
            }

            this.log(`🔗 Found ${businessUrls.length} business URLs for parallel processing`, 'success');

            // Setup cluster task for processing businesses in parallel
            await this.cluster.task(async ({ page, data }) => {
                const { url, resultIndex, query } = data;
                
                await page.setUserAgent(
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                );

                await page.goto(url, { waitUntil: 'networkidle2', timeout: this.options.timeout });
                await page.waitForSelector(this.selectors.businessName, { timeout: 15000 });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced delay for Pro mode

                return await this.extractBusinessData(page, query, resultIndex);
            });

            // Process all URLs in parallel with batching for efficiency
            const batchSize = this.options.maxConcurrency;
            const results = [];
            
            for (let i = 0; i < businessUrls.length; i += batchSize) {
                const batch = businessUrls.slice(i, i + batchSize);
                const batchPromises = batch.map(async (businessUrl, batchIndex) => {
                    try {
                        const result = await this.cluster.execute({
                            url: businessUrl,
                            resultIndex: i + batchIndex + 1,
                            query
                        });

                        if (result && result.name !== 'Not Found') {
                            this.stats.successful++;
                            this.log(`✅ Pro processed: ${result.name}`, 'success');
                            return result;
                        }
                        return null;
                    } catch (error) {
                        this.stats.failed++;
                        this.log(`❌ Pro failed Business ${i + batchIndex + 1}: ${error.message}`, 'error');
                        return null;
                    }
                });

                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults.filter(result => result !== null));
                
                this.stats.processed += batch.length;
                this.log(`🚀 Pro batch completed: ${results.length} total results`, 'cluster');
            }

            this.results = results;
            return results;

        } catch (error) {
            this.log(`❌ Pro parallel scraping failed: ${error.message}`, 'error');
            throw error;
        } finally {
            if (this.cluster) {
                await this.cluster.close();
                this.cluster = null;
            }
        }
    }

    /**
     * Helper method to get business URLs sequentially (used by parallel scraper)
     */
    async getBusinessUrlsSequential(query, maxResults) {
        const browserOptions = await this.getBrowserOptions();
        const browser = await puppeteer.launch(browserOptions);

        try {
            const page = await browser.newPage();
            
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            );

            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `https://www.google.com/maps/search/${encodedQuery}`;
            
            this.log(`🌐 Pro mode: Getting URLs from ${searchUrl}`, 'cluster');
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            await page.waitForSelector(this.selectors.resultContainer, { timeout: 20000 });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced delay
            
            // Use faster scroll for Pro mode
            const scrollResult = await this.handleInfiniteScroll(page, maxResults);
            
            if (!scrollResult.success && scrollResult.totalResults === 0) {
                throw new Error('Failed to load any results during scrolling');
            }
            
            const businessUrls = await page.$$eval(this.selectors.resultLinks, links => 
                Array.from(links, link => link.href).filter(href => href.includes('/place/'))
            );
            
            return businessUrls.slice(0, maxResults);

        } finally {
            await browser.close();
        }
    }

    /**
     * Main scraping method
     */
    async scrapeBusinesses(query, maxResults = 50) {
        this.stats.startTime = Date.now();
        this.stats.total = maxResults;
        
        const modeText = this.options.proMode ? 'Pro (10x Faster)' : 'Standard';
        this.log(`🚀 Starting ${modeText} Google Maps business scraping...`, 'info');
        this.log(`Query: "${query}", Max Results: ${maxResults}`);

        try {
            let results = [];

            if (this.options.proMode && this.options.useParallel) {
                this.log('🚀 Using PRO MODE with parallel processing', 'cluster');
                try {
                    results = await this.scrapeParallel(query, maxResults);
                } catch (proError) {
                    this.log(`⚠️ Pro mode failed: ${proError.message}`, 'warn');
                    this.log('🔄 Falling back to Standard mode...', 'info');
                    
                    // Reset options for fallback
                    this.options.proMode = false;
                    this.options.useParallel = false;
                    results = await this.scrapeSequential(query, maxResults);
                }
            } else {
                this.log('⚡ Using STANDARD MODE with sequential processing', 'info');
                results = await this.scrapeSequential(query, maxResults);
            }

            this.stats.endTime = Date.now();
            const processingTime = (this.stats.endTime - this.stats.startTime);
            const avgSpeed = results.length > 0 ? processingTime / results.length : 0;
            
            const actualMode = this.options.proMode ? 'Pro' : 'Standard';
            this.log(`🎉 ${actualMode} scraping completed! ${results.length} businesses extracted in ${(processingTime/1000).toFixed(1)}s (${avgSpeed.toFixed(0)}ms per business)`, 'success');

            return results;

        } catch (error) {
            this.stats.endTime = Date.now();
            this.log(`❌ Fatal error during ${modeText} scraping: ${error.message}`, 'error');
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            if (this.cluster) {
                await this.cluster.close();
                this.cluster = null;
            }
        }
    }
}

export { GoogleMapsBusinessScraper };