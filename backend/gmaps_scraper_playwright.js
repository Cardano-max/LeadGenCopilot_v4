/**
 * 🚀 GOOGLE MAPS BUSINESS SCRAPER - PLAYWRIGHT VERSION
 * 
 * Features:
 * - Uses Playwright for better cloud deployment support
 * - No Chrome detection issues
 * - Built-in browser management
 * - Production-ready error handling
 * 
 * @version 2.0.0
 * @author LeadGen Copilot Team
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

class GoogleMapsBusinessScraper {
    constructor(options = {}) {
        this.options = {
            maxConcurrency: options.maxConcurrency ?? 2,
            headless: options.headless ?? true,
            maxResults: options.maxResults ?? 50,
            delay: options.delay ?? 3000,
            verbose: options.verbose ?? false,
            retryLimit: options.retryLimit ?? 2,
            timeout: options.timeout ?? 45000,
            maxScrollAttempts: options.maxScrollAttempts ?? 10,
            scrollDelay: options.scrollDelay ?? 2500,
            ...options
        };
        
        // Proven working selectors from successful Puppeteer version
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
        this.browser = null;
        this.context = null;
        this.page = null;
        this.stats = {
            total: 0,
            processed: 0,
            successful: 0,
            failed: 0,
            scrollAttempts: 0,
            startTime: null,
            endTime: null,
            mode: 'playwright'
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

    /**
     * Find Chromium executable path on Render
     */
    findChromiumExecutable() {
        const possiblePaths = [
            // Standard Playwright installation paths
            '/opt/render/.cache/ms-playwright/chromium-1091/chrome-linux/chrome',
            '/opt/render/.cache/ms-playwright/chromium-*/chrome-linux/chrome',
            // Alternative Playwright paths
            path.join(process.cwd(), 'node_modules/playwright/.local-browsers/chromium-*/chrome-linux/chrome'),
            path.join(process.cwd(), 'node_modules/playwright-core/.local-browsers/chromium-*/chrome-linux/chrome'),
            // System Chrome paths
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium'
        ];

        this.log(`🔍 Searching for Chromium executable...`, 'info');
        
        for (const execPath of possiblePaths) {
            if (execPath.includes('*')) {
                // Handle wildcard paths
                const dir = path.dirname(execPath);
                const filename = path.basename(execPath);
                
                try {
                    if (fs.existsSync(dir)) {
                        const items = fs.readdirSync(dir);
                        for (const item of items) {
                            if (item.startsWith('chromium-')) {
                                const fullPath = path.join(dir, item, filename.replace('*', ''));
                                if (fs.existsSync(fullPath)) {
                                    this.log(`✅ Found Chromium at: ${fullPath}`, 'success');
                                    return fullPath;
                                }
                            }
                        }
                    }
                } catch (error) {
                    this.log(`⚠️ Error checking wildcard path ${execPath}: ${error.message}`, 'debug');
                }
            } else {
                // Direct path check
                if (fs.existsSync(execPath)) {
                    this.log(`✅ Found Chromium at: ${execPath}`, 'success');
                    return execPath;
                }
            }
        }

        // Try to find via playwright package
        try {
            const playwrightPath = require.resolve('playwright');
            const playwrightDir = path.dirname(playwrightPath);
            const browsersPath = path.join(playwrightDir, '.local-browsers');
            
            if (fs.existsSync(browsersPath)) {
                this.log(`📁 Checking Playwright browsers directory: ${browsersPath}`, 'info');
                const browserDirs = fs.readdirSync(browsersPath);
                
                for (const browserDir of browserDirs) {
                    if (browserDir.startsWith('chromium-')) {
                        const chromePath = path.join(browsersPath, browserDir, 'chrome-linux', 'chrome');
                        if (fs.existsSync(chromePath)) {
                            this.log(`✅ Found Playwright Chromium: ${chromePath}`, 'success');
                            return chromePath;
                        }
                    }
                }
            }
        } catch (error) {
            this.log(`⚠️ Error finding Playwright installation: ${error.message}`, 'debug');
        }

        this.log(`❌ No Chromium executable found`, 'error');
        return null;
    }

    /**
     * Get browser launch options for Playwright
     */
    getBrowserOptions() {
        const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
        
        if (isProduction) {
            this.log('🌐 Running in production - using Playwright optimized settings', 'info');
            
            // Try to find Chromium executable
            const executablePath = this.findChromiumExecutable();
            
            const options = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding'
                ]
            };

            if (executablePath) {
                options.executablePath = executablePath;
                this.log(`🎯 Using executable path: ${executablePath}`, 'info');
            } else {
                this.log(`🔄 Using Playwright auto-detection`, 'info');
            }
            
            return options;
        } else {
            this.log('💻 Running in development mode', 'info');
            return {
                headless: this.options.headless,
                slowMo: 100,
                devtools: false
            };
        }
    }

    /**
     * Double scroll method for loading more results
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
     * Handle infinite scrolling to load more results
     */
    async handleInfiniteScroll(page, maxResults) {
        this.log(`📜 Starting scroll method for ${maxResults} results...`, 'scroll');
        
        let scrollAttempts = 0;
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 3;
        
        while (scrollAttempts < this.options.maxScrollAttempts) {
            try {
                const currentResults = await page.locator(this.selectors.resultContainer).count();
                
                this.log(`📊 Attempt ${scrollAttempts + 1}: ${currentResults}/${maxResults} results`, 'debug');

                if (currentResults >= maxResults) {
                    this.log(`🎯 Target reached: ${currentResults}/${maxResults} results`, 'scroll');
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

                await page.waitForTimeout(this.options.scrollDelay);

                const newResultCount = await page.locator(this.selectors.resultContainer).count();
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
        
        const finalCount = await page.locator(this.selectors.resultContainer).count();
        this.log(`🎯 Scroll complete: ${finalCount} results after ${scrollAttempts} attempts`, 'scroll');
        
        return {
            totalResults: finalCount,
            scrollAttempts,
            success: finalCount > 0
        };
    }

    /**
     * Extract business data from a business page
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
     * Main scraping method using Playwright
     */
    async scrapeBusinesses(query, maxResults = 50) {
        this.stats.startTime = Date.now();
        this.stats.total = maxResults;
        
        this.log(`🚀 Starting Playwright Google Maps scraping...`, 'info');
        this.log(`Query: "${query}", Max Results: ${maxResults}`);

        try {
            // Set Playwright browsers path for Render - but let Playwright auto-detect
            if (process.env.RENDER || process.env.NODE_ENV === 'production') {
                // Don't override if already set by environment
                if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
                    process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/render/.cache/ms-playwright';
                }
                this.log(`📁 PLAYWRIGHT_BROWSERS_PATH: ${process.env.PLAYWRIGHT_BROWSERS_PATH}`, 'info');
            }
            
            // Launch browser with optimized settings
            const browserOptions = this.getBrowserOptions();
            this.log(`🔧 Browser options: ${JSON.stringify(browserOptions, null, 2)}`, 'debug');
            
            try {
                this.browser = await chromium.launch(browserOptions);
                this.log(`✅ Browser launched successfully`, 'success');
            } catch (launchError) {
                this.log(`❌ Browser launch failed: ${launchError.message}`, 'error');
                
                // If running in production and browser launch fails, try installing browsers
                if (process.env.RENDER || process.env.NODE_ENV === 'production') {
                    this.log(`🔄 Attempting runtime browser installation...`, 'info');
                    
                    try {
                        const { exec } = await import('child_process');
                        const { promisify } = await import('util');
                        const execAsync = promisify(exec);
                        
                        this.log(`📥 Installing Chromium browser...`, 'info');
                        const { stdout, stderr } = await execAsync('npx playwright install chromium', {
                            timeout: 120000 // 2 minutes timeout
                        });
                        
                        this.log(`📥 Installation output: ${stdout}`, 'info');
                        if (stderr) {
                            this.log(`⚠️ Installation warnings: ${stderr}`, 'warn');
                        }
                        
                        // Try launching again after installation
                        this.log(`🔄 Retrying browser launch after installation...`, 'info');
                        this.browser = await chromium.launch(browserOptions);
                        this.log(`✅ Browser launched successfully after runtime installation`, 'success');
                        
                    } catch (installError) {
                        this.log(`❌ Runtime browser installation failed: ${installError.message}`, 'error');
                        throw new Error(`Browser launch failed and runtime installation failed: ${launchError.message} | Install error: ${installError.message}`);
                    }
                } else {
                    throw launchError;
                }
            }
            this.context = await this.browser.newContext({
                viewport: { width: 1366, height: 768 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            });
            
            this.page = await this.context.newPage();

            // Navigate to Google Maps
            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `https://www.google.com/maps/search/${encodedQuery}`;
            
            this.log(`🌐 Navigating to: ${searchUrl}`);
            await this.page.goto(searchUrl, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            // Wait for initial results
            await this.page.waitForSelector(this.selectors.resultContainer, { timeout: 20000 });
            await this.page.waitForTimeout(this.options.delay);
            
            const initialResults = await this.page.locator(this.selectors.resultContainer).count();
            this.log(`📊 Initial results loaded: ${initialResults}`);
            
            // Perform infinite scroll
            const scrollResult = await this.handleInfiniteScroll(this.page, maxResults);
            
            if (!scrollResult || !scrollResult.success) {
                const currentCount = await this.page.locator(this.selectors.resultContainer).count();
                if (currentCount === 0) {
                    throw new Error('Failed to load any results during scrolling');
                }
                this.log(`✅ Fallback: Found ${currentCount} results despite scroll error`, 'success');
            }
            
            // Get all business URLs
            const businessUrls = await this.page.locator(this.selectors.resultLinks).evaluateAll(links => 
                links.map((link, index) => ({
                    url: link.href,
                    index: index + 1
                }))
            );
            
            this.log(`🔗 Found ${businessUrls.length} business URLs to process`);
            
            const resultsToProcess = Math.min(maxResults, businessUrls.length);
            
            // Process each business
            for (let i = 0; i < resultsToProcess; i++) {
                const business = businessUrls[i];
                
                this.log(`🏢 Processing Business ${i + 1}/${resultsToProcess}: ${business.url.slice(0, 80)}...`);

                try {
                    await this.page.goto(business.url, {
                        waitUntil: 'networkidle',
                        timeout: this.options.timeout
                    });
                    
                    // Wait for page to load and try multiple selectors
                    await this.page.waitForTimeout(2000);
                    
                    // Try to wait for any of the business name selectors
                    try {
                        await this.page.waitForSelector(this.selectors.businessName, { timeout: 15000 });
                    } catch (selectorError) {
                        this.log(`⚠️ Business name selector timeout, continuing with extraction`, 'warn');
                        // Continue anyway - we might still extract some data
                    }
                    
                    await this.page.waitForTimeout(1000);

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
                        await this.page.waitForTimeout(delay);
                    }

                } catch (error) {
                    this.stats.failed++;
                    this.log(`❌ Error processing business ${i + 1}: ${error.message}`, 'error');
                    continue;
                }
                
                this.stats.processed++;
            }

            this.stats.endTime = Date.now();
            const processingTime = (this.stats.endTime - this.stats.startTime);
            const avgSpeed = this.results.length > 0 ? processingTime / this.results.length : 0;
            
            this.log(`🎉 Playwright scraping completed! ${this.results.length} businesses extracted in ${(processingTime/1000).toFixed(1)}s (${avgSpeed.toFixed(0)}ms per business)`, 'success');

            return this.results;

        } catch (error) {
            this.stats.endTime = Date.now();
            this.log(`❌ Fatal error during Playwright scraping: ${error.message}`, 'error');
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        }
    }
}

export { GoogleMapsBusinessScraper };