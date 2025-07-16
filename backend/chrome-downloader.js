/**
 * Runtime Chrome Downloader for Render
 * Uses system Chrome or provides fallback paths
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ChromeDownloader {
    constructor() {
        console.log(`🔍 [Chrome Downloader] Initializing Chrome detection for Render`);
    }

    async findSystemChrome() {
        console.log(`🔍 [Chrome Downloader] Searching for system Chrome...`);
        
        // Try to find system Chrome
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
                console.log(`✅ [Chrome Downloader] Found system Chrome: ${chromePath}`);
                return chromePath;
            }
        }

        // Try to install Chrome using system package manager (Linux only)
        if (process.platform === 'linux') {
            try {
                console.log(`📥 [Chrome Downloader] Attempting to install Chrome via system package manager...`);
                
                // Try apt-get first (Ubuntu/Debian)
                try {
                    await execAsync('which google-chrome-stable');
                    console.log(`✅ [Chrome Downloader] Chrome already available via PATH`);
                    return 'google-chrome-stable';
                } catch {
                    // Try to install Chrome
                    try {
                        console.log(`📦 [Chrome Downloader] Installing Chrome via apt...`);
                        await execAsync('apt-get update && apt-get install -y wget gnupg');
                        await execAsync('wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -');
                        await execAsync('echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list');
                        await execAsync('apt-get update && apt-get install -y google-chrome-stable');
                        
                        if (fs.existsSync('/usr/bin/google-chrome-stable')) {
                            console.log(`✅ [Chrome Downloader] Chrome installed successfully`);
                            return '/usr/bin/google-chrome-stable';
                        }
                    } catch (installError) {
                        console.log(`⚠️ [Chrome Downloader] Failed to install Chrome: ${installError.message}`);
                    }
                }
            } catch (error) {
                console.log(`⚠️ [Chrome Downloader] System package manager approach failed: ${error.message}`);
            }
        }

        return null;
    }

    async getChromePath() {
        try {
            const chromePath = await this.findSystemChrome();
            
            if (chromePath) {
                console.log(`✅ [Chrome Downloader] Chrome ready: ${chromePath}`);
                return chromePath;
            }
            
            throw new Error('No Chrome found and installation failed');
        } catch (error) {
            console.error(`❌ [Chrome Downloader] Critical error: ${error.message}`);
            throw new Error(`Could not find or install Chrome: ${error.message}`);
        }
    }
}

export { ChromeDownloader };