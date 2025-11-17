"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const net_1 = __importDefault(require("net"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const isDev = process.env.NODE_ENV !== 'production';
let PORT = parseInt(process.env.PORT || '3000', 10);
// Setup logging to file for debugging
const logFile = path_1.default.join(electron_1.app.getPath('userData'), 'tikscam-debug.log');
const logStream = fs_1.default.createWriteStream(logFile, { flags: 'a' });
function log(...args) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    // Use original console methods to avoid infinite recursion
    process.stdout.write(logMessage);
    logStream.write(logMessage);
}
log('=== TikScam Electron Starting ===');
log('Log file location:', logFile);
log('App path:', electron_1.app.getAppPath());
log('Resources path:', process.resourcesPath);
log('User data path:', electron_1.app.getPath('userData'));
/**
 * Load .env.local file if it exists
 * In production, users can place .env.local in the app directory
 */
function loadEnvFile() {
    const envPaths = [
        // Development: project root
        path_1.default.join(process.cwd(), '.env.local'),
        // Production: app directory
        path_1.default.join(electron_1.app.getPath('userData'), '.env.local'),
        // Production: executable directory
        path_1.default.join(path_1.default.dirname(electron_1.app.getPath('exe')), '.env.local'),
        // Production: resources directory
        path_1.default.join(process.resourcesPath, '.env.local'),
    ];
    for (const envPath of envPaths) {
        if (fs_1.default.existsSync(envPath)) {
            log('📄 Loading .env.local from:', envPath);
            try {
                const envContent = fs_1.default.readFileSync(envPath, 'utf-8');
                const lines = envContent.split('\n');
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    // Skip comments and empty lines
                    if (!trimmedLine || trimmedLine.startsWith('#')) {
                        continue;
                    }
                    // Parse KEY=VALUE
                    const [key, ...valueParts] = trimmedLine.split('=');
                    const value = valueParts.join('=').trim();
                    if (key && value) {
                        process.env[key.trim()] = value;
                        log(`✅ Loaded env variable: ${key.trim()}`);
                    }
                }
                log('✅ Environment variables loaded successfully');
                return;
            }
            catch (error) {
                log('❌ Error loading .env.local:', error);
            }
        }
    }
    log('ℹ️  No .env.local file found - app will run without API key (limited to ~10-20 streams/day)');
}
let mainWindow = null;
let serverProcess = null;
/**
 * Check if a port is available
 */
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net_1.default.createServer();
        server.once('error', () => {
            resolve(false);
        });
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
}
/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        const testPort = startPort + i;
        const available = await isPortAvailable(testPort);
        if (available) {
            log(`✅ Found available port: ${testPort}`);
            return testPort;
        }
        log(`⚠️  Port ${testPort} is already in use, trying next...`);
    }
    throw new Error(`No available port found between ${startPort} and ${startPort + maxAttempts - 1}`);
}
/**
 * Wait for the Next.js server to be ready by checking if it responds to HTTP requests
 */
async function waitForServer(port, maxRetries = 60) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await new Promise((resolve, reject) => {
                const req = http_1.default.get(`http://localhost:${port}`, (res) => {
                    // Server responded, it's ready!
                    log('✅ Next.js server is ready! Status:', res.statusCode);
                    resolve();
                });
                req.on('error', () => {
                    // Server not ready yet
                    reject();
                });
                req.setTimeout(1000, () => {
                    req.destroy();
                    reject();
                });
            });
            // If we get here, server is ready
            return;
        }
        catch (error) {
            log(`⏳ Waiting for server... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    throw new Error('❌ Server failed to start within timeout period');
}
/**
 * Start the Next.js standalone server
 */
function startNextServer() {
    if (isDev) {
        log('🔧 Development mode: using external next dev server');
        return;
    }
    // Try multiple possible paths for the server
    const possiblePaths = [
        path_1.default.join(process.resourcesPath, 'app', 'server.js'),
        path_1.default.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js'),
        path_1.default.join(electron_1.app.getAppPath(), '.next', 'standalone', 'server.js'),
        path_1.default.join(path_1.default.dirname(electron_1.app.getPath('exe')), 'resources', 'app', 'server.js'),
    ];
    let serverPath = null;
    for (const testPath of possiblePaths) {
        log('🔍 Checking path:', testPath);
        if (fs_1.default.existsSync(testPath)) {
            serverPath = testPath;
            log('✅ Found server at:', serverPath);
            break;
        }
    }
    if (!serverPath) {
        log('❌ Could not find server.js in any of these locations:');
        possiblePaths.forEach(p => log('  -', p));
        throw new Error('server.js not found');
    }
    const serverDir = path_1.default.dirname(serverPath);
    log('🚀 Starting Next.js server from:', serverPath);
    log('📂 Working directory:', serverDir);
    log('📂 Resources path:', process.resourcesPath);
    serverProcess = (0, child_process_1.spawn)('node', [serverPath], {
        env: {
            ...process.env,
            PORT: String(PORT),
            HOSTNAME: '0.0.0.0',
            NODE_ENV: 'production',
        },
        stdio: 'pipe', // Changed from 'inherit' to capture logs
        cwd: serverDir,
    });
    // Log server output
    serverProcess.stdout?.on('data', (data) => {
        log('[Next.js]:', data.toString().trim());
    });
    serverProcess.stderr?.on('data', (data) => {
        log('[Next.js Error]:', data.toString().trim());
    });
    serverProcess.on('error', (err) => {
        log('❌ Failed to start Next.js server:', err);
    });
    serverProcess.on('exit', (code, signal) => {
        log(`⚠️ Next.js server process exited with code ${code} and signal ${signal}`);
        serverProcess = null;
    });
}
/**
 * Create the main application window
 */
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#000000',
        title: 'TikScam - TikTok Live Stream Analytics',
        show: false,
        icon: path_1.default.join(__dirname, '..', 'resources', 'icon.png'),
    });
    // Always open DevTools for debugging
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow?.webContents.openDevTools();
    });
    // Log all navigation events
    mainWindow.webContents.on('did-start-loading', () => {
        log('🔄 Started loading...');
    });
    mainWindow.webContents.on('did-stop-loading', () => {
        log('✅ Stopped loading');
    });
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        log('❌ Failed to load:', errorCode, errorDescription, validatedURL);
    });
    mainWindow.webContents.on('did-finish-load', () => {
        log('✅ Finished loading page');
    });
    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            electron_1.shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
    // Show loading screen first
    const loadingHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #000;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid #333;
          border-top: 3px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h1 { margin: 20px 0 10px 0; font-size: 24px; }
        p { margin: 0; color: #888; font-size: 14px; }
        #status { margin-top: 20px; font-size: 12px; color: #666; }
      </style>
      <script>
        let dots = 0;
        setInterval(() => {
          dots = (dots + 1) % 4;
          document.getElementById('status').textContent =
            'Waiting for server' + '.'.repeat(dots);
        }, 500);

        // Log to console
        log('Loading screen rendered');
        log('Waiting for Next.js server on port ${PORT}');
      </script>
    </head>
    <body>
      <div class="spinner"></div>
      <h1>TikScam</h1>
      <p>Starting application...</p>
      <p id="status">Waiting for server</p>
    </body>
    </html>
  `;
    // Load loading screen
    await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);
    mainWindow.show();
    log('✅ Loading screen shown');
    log('📍 Window should be visible now with loading spinner');
    // Now load the actual Next.js app
    const url = `http://localhost:${PORT}`;
    log('🌐 Loading URL:', url);
    try {
        await mainWindow.loadURL(url);
        log('✅ Window loaded successfully');
    }
    catch (error) {
        log('❌ Failed to load window:', error);
        // Show error in window
        const errorHTML = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><style>
        body { margin: 0; padding: 40px; background: #000; color: #fff;
               font-family: monospace; font-size: 14px; }
        h1 { color: #f00; }
        pre { background: #111; padding: 20px; border-radius: 5px;
              overflow: auto; color: #ff6b6b; }
        .log-path { background: #1a1a1a; padding: 15px; margin: 20px 0;
                    border-left: 3px solid #4a9eff; }
        .tip { color: #888; margin-top: 20px; }
      </style></head>
      <body>
        <h1>❌ Failed to start TikScam</h1>
        <p>Error loading application:</p>
        <pre>${error}</pre>

        <div class="log-path">
          <strong>📄 Debug log file:</strong><br>
          <code>${logFile.replace(/\\/g, '\\\\')}</code>
        </div>

        <div class="tip">
          <strong>💡 How to fix:</strong>
          <ul>
            <li>Make sure port ${PORT} is not in use</li>
            <li>Check the log file above for detailed error messages</li>
            <li>Try restarting the application</li>
          </ul>
        </div>
      </body>
      </html>
    `;
        await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`);
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
/**
 * App ready handler
 */
electron_1.app.on('ready', async () => {
    try {
        log('🎬 TikScam Electron starting...');
        log('📍 Mode:', isDev ? 'Development' : 'Production');
        // Load environment variables from .env.local (if exists)
        loadEnvFile();
        // Start Next.js server (production only)
        if (!isDev) {
            // Find available port before starting server
            log('🔍 Looking for available port...');
            PORT = await findAvailablePort(PORT);
            log('🔌 Using port:', PORT);
            startNextServer();
            log('⏳ Waiting for Next.js server to be ready...');
            await waitForServer(PORT);
        }
        else {
            // In dev mode, use port 3000 (assumes external dev server is running)
            PORT = 3000;
            log('🔌 Port:', PORT);
            log('⏳ Waiting for external dev server...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        // Create window
        await createWindow();
        log('🎉 TikScam Electron ready!');
    }
    catch (error) {
        log('❌ Failed to start application:', error);
        electron_1.app.quit();
    }
});
/**
 * Quit when all windows are closed (except on macOS)
 */
electron_1.app.on('window-all-closed', () => {
    if (serverProcess) {
        log('🛑 Stopping Next.js server...');
        serverProcess.kill();
        serverProcess = null;
    }
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
/**
 * Re-create window when dock icon is clicked (macOS)
 */
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
/**
 * Clean up before quit
 */
electron_1.app.on('before-quit', () => {
    if (serverProcess) {
        log('🛑 Cleaning up server process...');
        serverProcess.kill();
        serverProcess = null;
    }
});
/**
 * Handle uncaught errors
 */
process.on('uncaughtException', (error) => {
    log('💥 Uncaught exception:', error);
});
process.on('unhandledRejection', (error) => {
    log('💥 Unhandled rejection:', error);
});
