import { app, BrowserWindow, shell, dialog } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import net from 'net';
import http from 'http';
import fs from 'fs';

// Check if we're in development mode (running with npm run dev:electron)
// In production, app will be packaged and app.isPackaged will be true
const isDev = !app.isPackaged;
let PORT = parseInt(process.env.PORT || '3456', 10);

// Setup logging to file for debugging
const logFile = path.join(app.getPath('userData'), 'tikscam-debug.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Splash screen window (shown immediately on startup)
let splashWindow: BrowserWindow | null = null;

function log(...args: any[]) {
  const message = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  // Use original console methods to avoid infinite recursion
  process.stdout.write(logMessage);
  logStream.write(logMessage);
}

log('=== TikScam Electron Starting ===');
log('Log file location:', logFile);
log('App path:', app.getAppPath());
log('Resources path:', process.resourcesPath);
log('User data path:', app.getPath('userData'));

/**
 * Load .env.local file if it exists
 * In production, users can place .env.local in the app directory
 */
function loadEnvFile(): void {
  const envPaths = [
    // Development: project root
    path.join(process.cwd(), '.env.local'),
    // Production: app directory
    path.join(app.getPath('userData'), '.env.local'),
    // Production: executable directory
    path.join(path.dirname(app.getPath('exe')), '.env.local'),
    // Production: resources directory
    path.join(process.resourcesPath, '.env.local'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      log('📄 Loading .env.local from:', envPath);

      try {
        const envContent = fs.readFileSync(envPath, 'utf-8');
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
      } catch (error) {
        log('❌ Error loading .env.local:', error);
      }
    }
  }

  log('ℹ️  No .env.local file found - app will run without API key (limited to ~10-20 streams/day)');
}

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

/**
 * Create splash screen - shown IMMEDIATELY on app start
 */
function createSplashScreen(): void {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-app-region: drag;
        }
        .splash {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .logo {
          font-size: 72px;
          margin-bottom: 20px;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        h1 {
          color: white;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .version {
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          margin-bottom: 30px;
        }
        .loader {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .status {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
          margin-top: 20px;
          min-height: 20px;
        }
      </style>
    </head>
    <body>
      <div class="splash">
        <div class="logo">🎭</div>
        <h1>TikScam</h1>
        <div class="version">v0.5.0</div>
        <div class="loader"></div>
        <div class="status" id="status">Starting application...</div>
      </div>
      <script>
        const statuses = [
          'Initializing Electron...',
          'Loading components...',
          'Preparing server...',
          'Almost ready...'
        ];
        let index = 0;
        setInterval(() => {
          document.getElementById('status').textContent = statuses[index];
          index = (index + 1) % statuses.length;
        }, 1500);
      </script>
    </body>
    </html>
  `;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);
  splashWindow.center();
  log('✅ Splash screen created');
}

/**
 * Close splash screen and show main window
 */
function closeSplashScreen(): void {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
    log('✅ Splash screen closed');
  }
}

/**
 * Check if a port is available
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

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
async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
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
 * Wait for the Next.js server to be ready by making HTTP requests
 */
async function waitForServer(port: number, maxRetries = 30): Promise<void> {
  // Small initial delay to let the server start
  await new Promise(resolve => setTimeout(resolve, 1000));

  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Try to make an HTTP request to the server
      await new Promise<void>((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/`, {
          timeout: 2000,
        }, (res) => {
          // Any response means server is running
          log('✅ Next.js server is ready! Status:', res.statusCode);
          res.resume(); // Consume response
          resolve();
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });

      // Server responded successfully
      return;
    } catch (error) {
      lastError = error;
      log(`⏳ Waiting for server... (${i + 1}/${maxRetries})`, error instanceof Error ? error.message : '');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Server failed to start within ${maxRetries} seconds.\n\nLast error: ${errorMsg}\n\nPossible causes:\n- Port ${port} is blocked by firewall\n- Server process crashed immediately\n- System resources exhausted\n\nCheck the debug log at:\n${logFile}`);
}

/**
 * Start the Next.js standalone server
 */
function startNextServer(): void {
  if (isDev) {
    log('🔧 Development mode: using external next dev server');
    return;
  }

  // Try multiple possible paths for the server
  const possiblePaths = [
    path.join(process.resourcesPath, 'app', 'server.js'),
    path.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js'),
    path.join(app.getAppPath(), '.next', 'standalone', 'server.js'),
    path.join(path.dirname(app.getPath('exe')), 'resources', 'app', 'server.js'),
  ];

  let serverPath: string | null = null;
  for (const testPath of possiblePaths) {
    log('🔍 Checking path:', testPath);
    if (fs.existsSync(testPath)) {
      serverPath = testPath;
      log('✅ Found server at:', serverPath);
      break;
    }
  }

  if (!serverPath) {
    log('❌ Could not find server.js in any of these locations:');
    possiblePaths.forEach(p => log('  -', p));

    // List what files DO exist in resources path
    log('📂 Contents of resourcesPath:', process.resourcesPath);
    try {
      const files = fs.readdirSync(process.resourcesPath);
      files.forEach(f => log('  -', f));
    } catch (e) {
      log('❌ Could not read resourcesPath:', e);
    }

    throw new Error(`server.js not found in any of the expected locations. This may indicate a broken installation. Please re-download the application.`);
  }

  const serverDir = path.dirname(serverPath);
  log('🚀 Starting Next.js server from:', serverPath);
  log('📂 Working directory:', serverDir);
  log('📂 Resources path:', process.resourcesPath);

  serverProcess = spawn('node', [serverPath], {
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

    closeSplashScreen();

    showFatalError(
      'Server Startup Failed',
      'Failed to start the Next.js server process.',
      `Error: ${err.message}\n\nThis usually happens when:\n- Node.js is not properly installed in the package\n- The server.js file is corrupted\n- Antivirus is blocking the process\n\nPlease try:\n1. Re-downloading the application\n2. Adding an antivirus exception\n3. Running as administrator`
    );
  });

  serverProcess.on('exit', (code, signal) => {
    log(`⚠️ Next.js server process exited with code ${code} and signal ${signal}`);

    if (code !== 0 && code !== null) {
      log('❌ Server exited with error code:', code);

      closeSplashScreen();

      showFatalError(
        'Server Crashed',
        `The Next.js server stopped unexpectedly (exit code: ${code}).`,
        `This could be caused by:\n- Port ${PORT} already in use\n- Missing dependencies\n- System resources unavailable\n\nPlease check the debug log file for more details.`
      );
    }

    serverProcess = null;
  });
}

/**
 * Create the main application window
 */
async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#000000',
    title: 'TikScam - TikTok Live Stream Analytics',
    show: false,
  });

  // Open DevTools only in development mode
  if (isDev) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow?.webContents.openDevTools();
    });
  }

  // Log console errors from renderer to main process (for debugging)
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    // Only log errors and warnings to reduce noise
    if (level >= 1) { // 1 = warning, 2 = error
      log(`[Renderer] ${message}`);
    }
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
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Show progress screen
  const progressHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #000;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          width: 100%;
        }
        h1 {
          font-size: 32px;
          margin-bottom: 10px;
          text-align: center;
        }
        .subtitle {
          text-align: center;
          color: #888;
          margin-bottom: 40px;
          font-size: 14px;
        }
        .progress-list {
          list-style: none;
        }
        .progress-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #222;
        }
        .progress-item:last-child {
          border-bottom: none;
        }
        .icon {
          width: 24px;
          height: 24px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #333;
          border-top: 2px solid #4a9eff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .label {
          flex: 1;
          font-size: 15px;
        }
        .pending { color: #666; }
        .active { color: #4a9eff; }
        .complete { color: #4ade80; }
        .error { color: #f87171; }
        .port-info {
          text-align: center;
          margin-top: 30px;
          padding: 15px;
          background: #111;
          border-radius: 8px;
          border: 1px solid #222;
        }
        .port-info strong {
          color: #4a9eff;
          font-size: 18px;
        }
      </style>
      <script>
        window.addEventListener('message', (event) => {
          const { step, status, port } = event.data;

          if (step) {
            const item = document.getElementById('step-' + step);
            if (item) {
              item.className = 'progress-item ' + status;
              const icon = item.querySelector('.icon');

              if (status === 'active') {
                icon.innerHTML = '<div class="spinner"></div>';
              } else if (status === 'complete') {
                icon.innerHTML = '✓';
              } else if (status === 'error') {
                icon.innerHTML = '✗';
              }
            }
          }

          if (port) {
            document.getElementById('port-display').textContent = port;
          }
        });
      </script>
    </head>
    <body>
      <div class="container">
        <h1>🎭 TikScam</h1>
        <p class="subtitle">Starting desktop application...</p>

        <ul class="progress-list">
          <li id="step-1" class="progress-item pending">
            <span class="icon">○</span>
            <span class="label">Initializing Electron</span>
          </li>
          <li id="step-2" class="progress-item pending">
            <span class="icon">○</span>
            <span class="label">Finding available port</span>
          </li>
          <li id="step-3" class="progress-item pending">
            <span class="icon">○</span>
            <span class="label">Starting Next.js server</span>
          </li>
          <li id="step-4" class="progress-item pending">
            <span class="icon">○</span>
            <span class="label">Waiting for server ready</span>
          </li>
          <li id="step-5" class="progress-item pending">
            <span class="icon">○</span>
            <span class="label">Loading application</span>
          </li>
        </ul>

        <div class="port-info">
          Server running on port: <strong id="port-display">-</strong>
        </div>
      </div>
    </body>
    </html>
  `;

  // Load progress screen but DON'T show yet (splash is visible)
  await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(progressHTML)}`);
  log('✅ Progress screen loaded');

  // Helper function to update progress
  const updateProgress = (step: number, status: 'pending' | 'active' | 'complete' | 'error', port?: number) => {
    mainWindow?.webContents.send('message', { step, status, port });
    mainWindow?.webContents.executeJavaScript(`
      window.postMessage({ step: ${step}, status: '${status}'${port ? `, port: ${port}` : ''} }, '*');
    `);
  };

  // Step 1: Initialized (already done)
  updateProgress(1, 'complete');
  await new Promise(resolve => setTimeout(resolve, 200));

  // Store updateProgress function on mainWindow for use in app.on('ready')
  (mainWindow as any).updateProgress = updateProgress;
  (mainWindow as any).loadApp = async (port: number) => {
    const url = `http://localhost:${port}`;
    log('🌐 Loading URL:', url);

    try {
      // Close splash and show main window with progress
      closeSplashScreen();
      mainWindow!.show();

      await mainWindow!.loadURL(url);
      log('✅ Window loaded successfully');
      updateProgress(5, 'complete');
    } catch (error) {
      log('❌ Failed to load window:', error);
      updateProgress(5, 'error');
      closeSplashScreen();

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
              <li>Make sure port ${port} is not in use</li>
              <li>Check the log file above for detailed error messages</li>
              <li>Try restarting the application</li>
            </ul>
          </div>
        </body>
        </html>
      `;
      await mainWindow!.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`);
    }
  };

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Show fatal error dialog and quit
 */
function showFatalError(title: string, message: string, details: string): void {
  log('💥 FATAL ERROR:', title, message, details);

  dialog.showErrorBox(
    title,
    `${message}\n\n📄 Debug log file:\n${logFile}\n\n${details}`
  );

  app.quit();
}

/**
 * App ready handler
 */
app.on('ready', async () => {
  try {
    log('🎬 TikScam Electron starting...');
    log('📍 Mode:', isDev ? 'Development' : 'Production');
    log('📍 Electron version:', process.versions.electron);
    log('📍 Node version:', process.versions.node);
    log('📍 Chrome version:', process.versions.chrome);

    // Show splash screen IMMEDIATELY
    createSplashScreen();

    // Small delay to ensure splash is visible
    await new Promise(resolve => setTimeout(resolve, 500));

    // Load environment variables from .env.local (if exists)
    loadEnvFile();

    // Create window first to show progress
    await createWindow();

    // Start Next.js server (production only)
    if (!isDev) {
      // Step 2: Find available port
      const updateProgress = (mainWindow as any).updateProgress;
      updateProgress(2, 'active');
      log('🔍 Looking for available port...');
      PORT = await findAvailablePort(PORT);
      log('🔌 Using port:', PORT);
      updateProgress(2, 'complete', PORT);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Step 3: Start server
      updateProgress(3, 'active');
      startNextServer();
      updateProgress(3, 'complete');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Step 4: Wait for server
      updateProgress(4, 'active');
      await waitForServer(PORT);
      updateProgress(4, 'complete');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Step 5: Load app
      updateProgress(5, 'active');
      const loadApp = (mainWindow as any).loadApp;
      await loadApp(PORT);
    } else {
      // In dev mode, assume external dev server is running on port 3000
      log('🔌 Port:', PORT);
      log('⏳ Waiting for external dev server...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Load dev server
      const loadApp = (mainWindow as any).loadApp;
      await loadApp(PORT);
    }

    log('🎉 TikScam Electron ready!');
  } catch (error) {
    log('❌ Failed to start application:', error);

    closeSplashScreen();

    // Show detailed error dialog
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    showFatalError(
      'TikScam Startup Failed',
      'The application failed to start properly.',
      `Error: ${errorMessage}\n\nPlease check the debug log file for more details.\n\nStack trace:\n${errorStack}`
    );
  }
});

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  if (serverProcess) {
    log('🛑 Stopping Next.js server...');
    serverProcess.kill();
    serverProcess = null;
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Re-create window when dock icon is clicked (macOS)
 */
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Clean up before quit
 */
app.on('before-quit', () => {
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
