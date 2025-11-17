"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const net_1 = __importDefault(require("net"));
const fs_1 = __importDefault(require("fs"));
const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;
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
            console.log('📄 Loading .env.local from:', envPath);
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
                        console.log(`✅ Loaded env variable: ${key.trim()}`);
                    }
                }
                console.log('✅ Environment variables loaded successfully');
                return;
            }
            catch (error) {
                console.error('❌ Error loading .env.local:', error);
            }
        }
    }
    console.log('ℹ️  No .env.local file found - app will run without API key (limited to ~10-20 streams/day)');
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
 * Wait for the Next.js server to be ready
 */
async function waitForServer(port, maxRetries = 60) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const available = await isPortAvailable(port);
            if (!available) {
                console.log('✅ Next.js server is ready!');
                return;
            }
            console.log(`⏳ Waiting for server... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        catch (error) {
            console.error('Error checking port:', error);
        }
    }
    throw new Error('❌ Server failed to start within timeout period');
}
/**
 * Start the Next.js standalone server
 */
function startNextServer() {
    if (isDev) {
        console.log('🔧 Development mode: using external next dev server');
        return;
    }
    const serverPath = path_1.default.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js');
    console.log('🚀 Starting Next.js server from:', serverPath);
    console.log('📂 Resources path:', process.resourcesPath);
    serverProcess = (0, child_process_1.spawn)('node', [serverPath], {
        env: {
            ...process.env,
            PORT: String(PORT),
            HOSTNAME: '0.0.0.0',
            NODE_ENV: 'production',
        },
        stdio: 'inherit',
        cwd: path_1.default.join(process.resourcesPath, 'app', '.next', 'standalone'),
    });
    serverProcess.on('error', (err) => {
        console.error('❌ Failed to start Next.js server:', err);
    });
    serverProcess.on('exit', (code, signal) => {
        console.log(`⚠️ Next.js server process exited with code ${code} and signal ${signal}`);
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
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        if (isDev) {
            mainWindow?.webContents.openDevTools();
        }
    });
    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            electron_1.shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
    // Load the Next.js app
    const url = `http://localhost:${PORT}`;
    console.log('🌐 Loading URL:', url);
    try {
        await mainWindow.loadURL(url);
        console.log('✅ Window loaded successfully');
    }
    catch (error) {
        console.error('❌ Failed to load window:', error);
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
        console.log('🎬 TikScam Electron starting...');
        console.log('📍 Mode:', isDev ? 'Development' : 'Production');
        console.log('🔌 Port:', PORT);
        // Load environment variables from .env.local (if exists)
        loadEnvFile();
        // Start Next.js server (production only)
        if (!isDev) {
            startNextServer();
            console.log('⏳ Waiting for Next.js server to be ready...');
            await waitForServer(Number(PORT));
        }
        else {
            // In dev mode, wait a bit for the external dev server
            console.log('⏳ Waiting for external dev server...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        // Create window
        await createWindow();
        console.log('🎉 TikScam Electron ready!');
    }
    catch (error) {
        console.error('❌ Failed to start application:', error);
        electron_1.app.quit();
    }
});
/**
 * Quit when all windows are closed (except on macOS)
 */
electron_1.app.on('window-all-closed', () => {
    if (serverProcess) {
        console.log('🛑 Stopping Next.js server...');
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
        console.log('🛑 Cleaning up server process...');
        serverProcess.kill();
        serverProcess = null;
    }
});
/**
 * Handle uncaught errors
 */
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
});
process.on('unhandledRejection', (error) => {
    console.error('💥 Unhandled rejection:', error);
});
