// Save System - Game progress and settings management
class SaveSystem {
    constructor() {
        this.saveKeys = GameConfig.saveKeys;
        this.isSupported = this.checkLocalStorageSupport();
        this.gameData = this.loadGameData();
    }
    
    // Check if localStorage is supported
    checkLocalStorageSupport() {
        try {
            const test = 'localStorage_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not supported:', e);
            return false;
        }
    }
    
    // Load all game data
    loadGameData() {
        if (!this.isSupported) {
            return this.getDefaultGameData();
        }
        
        try {
            const data = {
                highScore: this.loadHighScore(),
                settings: this.loadSettings(),
                progress: this.loadProgress(),
                currentLevel: this.loadCurrentLevel()
            };
            
            // Merge with defaults for missing properties
            return { ...this.getDefaultGameData(), ...data };
        } catch (e) {
            console.warn('Failed to load game data:', e);
            return this.getDefaultGameData();
        }
    }
    
    // Get default game data structure
    getDefaultGameData() {
        return {
            highScore: 0,
            settings: {
                masterVolume: GameConfig.audio.masterVolume,
                sfxVolume: GameConfig.audio.sfxVolume,
                musicVolume: GameConfig.audio.musicVolume,
                audioEnabled: GameConfig.audio.enabled,
                particleEffects: GameConfig.visual.particleEffects,
                shadows: GameConfig.visual.shadows,
                difficulty: 'normal'
            },
            progress: {
                levelsUnlocked: ['level1'],
                levelsCompleted: [],
                totalPlayTime: 0,
                enemiesKilled: 0,
                towersBuilt: 0,
                moneyEarned: 0
            },
            currentLevel: 'level1'
        };
    }
    
    // Save high score
    saveHighScore(score) {
        if (!this.isSupported) return false;
        
        try {
            if (score > this.gameData.highScore) {
                this.gameData.highScore = score;
                localStorage.setItem(this.saveKeys.highScore, score.toString());
                return true;
            }
            return false;
        } catch (e) {
            console.warn('Failed to save high score:', e);
            return false;
        }
    }
    
    // Load high score
    loadHighScore() {
        if (!this.isSupported) return 0;
        
        try {
            const score = localStorage.getItem(this.saveKeys.highScore);
            return score ? parseInt(score, 10) : 0;
        } catch (e) {
            console.warn('Failed to load high score:', e);
            return 0;
        }
    }
    
    // Save settings
    saveSettings(settings) {
        if (!this.isSupported) return false;
        
        try {
            this.gameData.settings = { ...this.gameData.settings, ...settings };
            localStorage.setItem(this.saveKeys.settings, JSON.stringify(this.gameData.settings));
            return true;
        } catch (e) {
            console.warn('Failed to save settings:', e);
            return false;
        }
    }
    
    // Load settings
    loadSettings() {
        if (!this.isSupported) return this.getDefaultGameData().settings;
        
        try {
            const settings = localStorage.getItem(this.saveKeys.settings);
            return settings ? JSON.parse(settings) : this.getDefaultGameData().settings;
        } catch (e) {
            console.warn('Failed to load settings:', e);
            return this.getDefaultGameData().settings;
        }
    }
    
    // Save progress
    saveProgress(progress) {
        if (!this.isSupported) return false;
        
        try {
            this.gameData.progress = { ...this.gameData.progress, ...progress };
            localStorage.setItem(this.saveKeys.progress, JSON.stringify(this.gameData.progress));
            return true;
        } catch (e) {
            console.warn('Failed to save progress:', e);
            return false;
        }
    }
    
    // Load progress
    loadProgress() {
        if (!this.isSupported) return this.getDefaultGameData().progress;
        
        try {
            const progress = localStorage.getItem(this.saveKeys.progress);
            return progress ? JSON.parse(progress) : this.getDefaultGameData().progress;
        } catch (e) {
            console.warn('Failed to load progress:', e);
            return this.getDefaultGameData().progress;
        }
    }
    
    // Save current level
    saveCurrentLevel(levelName) {
        if (!this.isSupported) return false;
        
        try {
            this.gameData.currentLevel = levelName;
            localStorage.setItem(this.saveKeys.currentLevel, levelName);
            return true;
        } catch (e) {
            console.warn('Failed to save current level:', e);
            return false;
        }
    }
    
    // Load current level
    loadCurrentLevel() {
        if (!this.isSupported) return 'level1';
        
        try {
            const level = localStorage.getItem(this.saveKeys.currentLevel);
            return level || 'level1';
        } catch (e) {
            console.warn('Failed to load current level:', e);
            return 'level1';
        }
    }
    
    // Complete a level
    completeLevel(levelName, score, stats) {
        if (!this.gameData.progress.levelsCompleted.includes(levelName)) {
            this.gameData.progress.levelsCompleted.push(levelName);
        }
        
        // Update statistics
        if (stats) {
            this.gameData.progress.enemiesKilled += stats.enemiesKilled || 0;
            this.gameData.progress.towersBuilt += stats.towersBuilt || 0;
            this.gameData.progress.moneyEarned += stats.moneyEarned || 0;
            this.gameData.progress.totalPlayTime += stats.playTime || 0;
        }
        
        // Save high score
        this.saveHighScore(score);
        
        // Save progress
        this.saveProgress(this.gameData.progress);
        
        // Unlock next level (if exists)
        this.unlockNextLevel(levelName);
    }
    
    // Unlock next level
    unlockNextLevel(currentLevel) {
        const levelMap = {
            'level1': 'level2',
            'level2': 'level3',
            'level3': 'level4'
            // Add more levels as needed
        };
        
        const nextLevel = levelMap[currentLevel];
        if (nextLevel && !this.gameData.progress.levelsUnlocked.includes(nextLevel)) {
            this.gameData.progress.levelsUnlocked.push(nextLevel);
            this.saveProgress(this.gameData.progress);
        }
    }
    
    // Check if level is unlocked
    isLevelUnlocked(levelName) {
        return this.gameData.progress.levelsUnlocked.includes(levelName);
    }
    
    // Get game statistics
    getStatistics() {
        return {
            highScore: this.gameData.highScore,
            levelsCompleted: this.gameData.progress.levelsCompleted.length,
            totalPlayTime: this.gameData.progress.totalPlayTime,
            enemiesKilled: this.gameData.progress.enemiesKilled,
            towersBuilt: this.gameData.progress.towersBuilt,
            moneyEarned: this.gameData.progress.moneyEarned
        };
    }
    
    // Export save data
    exportSaveData() {
        try {
            const saveData = {
                version: '1.0',
                timestamp: Date.now(),
                data: this.gameData
            };
            
            return JSON.stringify(saveData);
        } catch (e) {
            console.warn('Failed to export save data:', e);
            return null;
        }
    }
    
    // Import save data
    importSaveData(saveDataString) {
        try {
            const saveData = JSON.parse(saveDataString);
            
            if (saveData.version && saveData.data) {
                this.gameData = { ...this.getDefaultGameData(), ...saveData.data };
                
                // Save imported data
                this.saveSettings(this.gameData.settings);
                this.saveProgress(this.gameData.progress);
                this.saveCurrentLevel(this.gameData.currentLevel);
                this.saveHighScore(this.gameData.highScore);
                
                return true;
            }
            
            return false;
        } catch (e) {
            console.warn('Failed to import save data:', e);
            return false;
        }
    }
    
    // Reset all save data
    resetSaveData() {
        if (!this.isSupported) return false;
        
        try {
            // Clear localStorage
            Object.values(this.saveKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Reset game data
            this.gameData = this.getDefaultGameData();
            
            return true;
        } catch (e) {
            console.warn('Failed to reset save data:', e);
            return false;
        }
    }
    
    // Get current game data
    getGameData() {
        return { ...this.gameData };
    }
    
    // Check save system status
    getStatus() {
        return {
            supported: this.isSupported,
            dataLoaded: !!this.gameData,
            highScore: this.gameData.highScore,
            levelsUnlocked: this.gameData.progress.levelsUnlocked.length,
            levelsCompleted: this.gameData.progress.levelsCompleted.length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveSystem;
} else {
    window.SaveSystem = SaveSystem;
}