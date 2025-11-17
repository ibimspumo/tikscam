"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/**
 * Preload script for TikScam Electron
 *
 * This script runs in the renderer process before the web content loads.
 * It's used to safely expose limited APIs to the renderer process.
 *
 * Security: We use contextBridge to securely expose APIs without
 * compromising Node.js integration security.
 */
// Expose app version and environment info
electron_1.contextBridge.exposeInMainWorld('electron', {
    isElectron: true,
    version: process.versions.electron,
    platform: process.platform,
});
console.log('✅ TikScam Electron preload script loaded');
