const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Use Render's cache directory if available, otherwise local cache
    cacheDirectory: process.env.PUPPETEER_CACHE_DIR || join(__dirname, '.cache', 'puppeteer'),
    
    // Don't skip downloading Chrome
    skipDownload: false,
    
    // Use Chrome (not Chromium) for better compatibility
    defaultProduct: 'chrome'
}; 