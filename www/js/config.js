// Game Configuration - Central configuration management
const GameConfig = {
    // Game Settings
    game: {
        startingHealth: 10,
        startingMoney: 100,
        baseScore: 10,
        autoStartDelay: 2000, // ms
        waveDelay: 3000 // ms between waves
    },
    
    // Performance Settings
    performance: {
        maxParticles: 50,
        shadowMapSize: 1024,
        antialiasing: true,
        pixelRatio: window.devicePixelRatio || 1
    },
    
    // Graphics Quality Settings
    quality: {
        current: 'high', // default quality
        presets: {
            low: {
                name: 'Low',
                shadows: false,
                antialiasing: false,
                particleEffects: false,
                shadowMapSize: 512,
                maxParticles: 20,
                pixelRatio: 1,
                fog: false,
                lightIntensity: 0.8
            },
            medium: {
                name: 'Medium',
                shadows: true,
                antialiasing: false,
                particleEffects: true,
                shadowMapSize: 1024,
                maxParticles: 35,
                pixelRatio: 1,
                fog: true,
                lightIntensity: 0.9
            },
            high: {
                name: 'High',
                shadows: true,
                antialiasing: true,
                particleEffects: true,
                shadowMapSize: 2048,
                maxParticles: 50,
                pixelRatio: window.devicePixelRatio || 1,
                fog: true,
                lightIntensity: 1.0
            }
        }
    },
    
    // Mobile Settings
    mobile: {
        touchSensitivity: 1.5,
        zoomMin: 0.5,
        zoomMax: 2.5,
        panSpeed: 0.8,
        tapThreshold: 20, // pixels
        tapDuration: 500, // milliseconds
        towerSlotTolerance: 1.5 // world units
    },
    
    // Audio Settings
    audio: {
        masterVolume: 0.7,
        sfxVolume: 0.8,
        musicVolume: 0.5,
        enabled: true
    },
    
    // Visual Settings
    visual: {
        particleEffects: true,
        shadows: true,
        fog: true,
        fogColor: 0x87CEEB,
        fogNear: 10,
        fogFar: 50
    },
    
    // Enemy Types Configuration
    enemyTypes: {
        tuyul: {
            name: 'Basic Enemy',
            health: 50,
            speed: 0.02,
            reward: 10,
            color: 0xFF0000,
            size: 0.3
        },
        jalangkung: {
            name: 'Jalangkung Enemy',
            health: 30,
            speed: 0.04,
            reward: 15,
            color: 0x00FF00,
            size: 0.25
        },
        genderuwo: {
             name: 'Genderuwo Enemy',
            health: 150,
            speed: 0.01,
            reward: 25,
            color: 0x0000FF,
            size: 0.4
        },
        boss: {
            name: 'Boss Enemy',
            health: 500,
            speed: 0.015,
            reward: 100,
            color: 0x800080,
            size: 0.6
        }
    },
    
    // Projectile Settings
    projectiles: {
        basic: {
            color: 0xFFFF00,
            size: 0.1,
            trail: false
        },
        slow: {
            color: 0x00BFFF,
            size: 0.08,
            trail: true
        },
        splash: {
            color: 0xFF4500,
            size: 0.12,
            trail: true
        }
    },
    
    // Save System Keys
    saveKeys: {
        highScore: 'towerofmitos_highscore',
        settings: 'towerofmitos_settings',
        progress: 'towerofmitos_progress',
        currentLevel: 'towerofmitos_current_level'
    },
    
    // Camera Settings
    camera: {
        defaultPosition: { x: 20, y: 30, z: 7.5 },
        defaultTarget: { x: 20, y: 0, z: 7.5 },
        mapWidth: 40,
        mapHeight: 15
    },
    
    // UI Settings
    ui: {
        towerButtonSize: 60,
        upgradeButtonSize: 40,
        fontSize: {
            small: '12px',
            medium: '16px',
            large: '20px'
        },
        colors: {
            primary: '#2196F3',
            secondary: '#4CAF50',
            danger: '#F44336',
            warning: '#FF9800',
            success: '#8BC34A'
        }
    }
};

// Utility functions for configuration
GameConfig.utils = {
    // Get enemy configuration by type
    getEnemyConfig: function(type) {
        return this.enemyTypes[type] || this.enemyTypes.tuyul;
    },
    
    // Get projectile configuration by type
    getProjectileConfig: function(type) {
        return this.projectiles[type] || this.projectiles.basic;
    },
    
    // Save settings to localStorage
    saveSettings: function(settings) {
        try {
            localStorage.setItem(this.saveKeys.settings, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.warn('Failed to save settings:', e);
            return false;
        }
    },
    
    // Load settings from localStorage
    loadSettings: function() {
        try {
            const saved = localStorage.getItem(this.saveKeys.settings);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('Failed to load settings:', e);
            return {};
        }
    },
    
    // Check if device is mobile
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Get optimal performance settings based on device
    getOptimalSettings: function() {
        const isMobile = this.isMobile();
        return {
            shadows: !isMobile,
            antialiasing: !isMobile,
            particleEffects: !isMobile,
            shadowMapSize: isMobile ? 512 : 1024,
            maxParticles: isMobile ? 25 : 50
        };
    },
    
    // Get current quality settings
    getCurrentQuality: function() {
        return GameConfig.quality.presets[GameConfig.quality.current] || GameConfig.quality.presets.high;
    },
    
    // Set quality level
    setQuality: function(qualityLevel) {
        if (GameConfig.quality.presets[qualityLevel]) {
            GameConfig.quality.current = qualityLevel;
            // Save to localStorage
            const settings = this.loadSettings();
            settings.quality = qualityLevel;
            this.saveSettings(settings);
            return true;
        }
        return false;
    },
    
    // Load quality from saved settings
    loadQuality: function() {
        const settings = this.loadSettings();
        if (settings.quality && GameConfig.quality.presets[settings.quality]) {
            GameConfig.quality.current = settings.quality;
        }
        return GameConfig.quality.current;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
} else {
    window.GameConfig = GameConfig;
}