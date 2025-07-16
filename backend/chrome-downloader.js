/**
 * Runtime Chrome Downloader for Render
 * Downloads Chrome if not available, specifically for Render's free tier
 */

import { install, getInstalledBrowsers } from '@puppeteer/browsers';
import fs from 'fs';
import path from 'path';
import os from 'os';

class ChromeDownloader {
    constructor() {
        this.cacheDir = process.env.PUPPETEER_CACHE_DIR || path.join(process.cwd(), '.chrome-cache');
        this.platform = this.getPlatform();
        this.buildId = '124.0.6367.207'; // Stable Chrome version
    }

    getPlatform() {
        const platform = os.platform();
        const arch = os.arch();
        
        if (platform === 'linux') {
            return arch === 'arm64' ? 'linux-arm64' : 'linux';
        } else if (platform === 'darwin') {
            return arch === 'arm64' ? 'mac-arm64' : 'mac';
        } else if (platform === 'win32') {
            return arch === 'x64' ? 'win64' : 'win32';
        }
        
        throw new Error(`Unsupported platform: ${platform}-${arch}`);
    }

    async ensureChromeExists() {
        console.log(`🔍 [Chrome Downloader] Checking for Chrome in: ${this.cacheDir}`);
        
        try {
            // Create cache directory if it doesn't exist
            if (!fs.existsSync(this.cacheDir)) {
                fs.mkdirSync(this.cacheDir, { recursive: true });
                console.log(`📁 [Chrome Downloader] Created cache directory: ${this.cacheDir}`);
            }

            // Check if Chrome is already installed
            const installedBrowsers = await getInstalledBrowsers({ cacheDir: this.cacheDir });
            const chromeInstalled = installedBrowsers.find(
                browser => browser.browser === 'chrome' && browser.buildId === this.buildId
            );

            if (chromeInstalled) {
                console.log(`✅ [Chrome Downloader] Chrome ${this.buildId} already installed at: ${chromeInstalled.executablePath}`);
                return chromeInstalled.executablePath;
            }

            console.log(`📥 [Chrome Downloader] Downloading Chrome ${this.buildId} for ${this.platform}...`);
            
            // Download Chrome
            const result = await install({
                browser: 'chrome',
                buildId: this.buildId,
                platform: this.platform,
                cacheDir: this.cacheDir,
                unpack: true
            });

            console.log(`✅ [Chrome Downloader] Chrome downloaded successfully to: ${result.executablePath}`);
            
            // Verify the executable exists and is accessible
            if (fs.existsSync(result.executablePath)) {
                // Make sure it's executable (Linux/Mac)
                if (process.platform !== 'win32') {
                    fs.chmodSync(result.executablePath, '755');
                }
                
                console.log(`🎉 [Chrome Downloader] Chrome ready at: ${result.executablePath}`);
                return result.executablePath;
            } else {
                throw new Error(`Chrome executable not found at: ${result.executablePath}`);
            }

        } catch (error) {
            console.error(`❌ [Chrome Downloader] Failed to ensure Chrome: ${error.message}`);
            
            // Try to find system Chrome as fallback
            const systemPaths = [
                '/usr/bin/google-chrome-stable',
                '/usr/bin/google-chrome',
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium',
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
            ];

            for (const chromePath of systemPaths) {
                if (fs.existsSync(chromePath)) {
                    console.log(`🔄 [Chrome Downloader] Using system Chrome: ${chromePath}`);
                    return chromePath;
                }
            }

            throw error;
        }
    }

    async getChromePath() {
        try {
            return await this.ensureChromeExists();
        } catch (error) {
            console.error(`❌ [Chrome Downloader] Critical error: ${error.message}`);
            throw new Error(`Could not find or download Chrome: ${error.message}`);
        }
    }
}

export { ChromeDownloader };