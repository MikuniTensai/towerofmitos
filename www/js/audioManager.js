// Audio Manager - Centralized audio management
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.masterVolume = GameConfig.audio.masterVolume;
        this.sfxVolume = GameConfig.audio.sfxVolume;
        this.musicVolume = GameConfig.audio.musicVolume;
        this.enabled = GameConfig.audio.enabled;
        this.currentMusic = null;
        
        // Initialize Web Audio API context
        this.audioContext = null;
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }
    
    // Load audio file
    loadAudio(name, url, isMusic = false) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            
            audio.addEventListener('canplaythrough', () => {
                if (isMusic) {
                    audio.loop = true;
                    audio.volume = this.musicVolume * this.masterVolume;
                    this.music[name] = audio;
                } else {
                    audio.volume = this.sfxVolume * this.masterVolume;
                    this.sounds[name] = audio;
                }
                resolve(audio);
            });
            
            audio.addEventListener('error', (e) => {
                console.warn(`Failed to load audio: ${url}`, e);
                reject(e);
            });
            
            audio.src = url;
        });
    }
    
    // Load multiple audio files
    async loadAudioPack(audioPack) {
        const promises = [];
        
        // Load sound effects
        if (audioPack.sounds) {
            for (const [name, url] of Object.entries(audioPack.sounds)) {
                promises.push(this.loadAudio(name, url, false));
            }
        }
        
        // Load music
        if (audioPack.music) {
            for (const [name, url] of Object.entries(audioPack.music)) {
                promises.push(this.loadAudio(name, url, true));
            }
        }
        
        try {
            await Promise.all(promises);
            console.log('Audio pack loaded successfully');
        } catch (e) {
            console.warn('Some audio files failed to load:', e);
        }
    }
    
    // Play sound effect
    playSound(name, volume = 1.0) {
        if (!this.enabled || !this.sounds[name]) return;
        
        try {
            const sound = this.sounds[name].cloneNode();
            sound.volume = Math.min(1.0, volume * this.sfxVolume * this.masterVolume);
            sound.play().catch(e => console.warn('Failed to play sound:', e));
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }
    
    // Alias for playSFX (for compatibility)
    playSFX(name, volume = 1.0) {
        this.playSound(name, volume);
    }
    
    // Play music
    playMusic(name, fadeIn = false) {
        if (!this.enabled || !this.music[name]) return;
        
        // Stop current music
        this.stopMusic();
        
        try {
            this.currentMusic = this.music[name];
            this.currentMusic.currentTime = 0;
            
            if (fadeIn) {
                this.currentMusic.volume = 0;
                this.currentMusic.play();
                this.fadeIn(this.currentMusic, this.musicVolume * this.masterVolume, 2000);
            } else {
                this.currentMusic.volume = this.musicVolume * this.masterVolume;
                this.currentMusic.play();
            }
        } catch (e) {
            console.warn('Error playing music:', e);
        }
    }
    
    // Stop music
    stopMusic(fadeOut = false) {
        if (!this.currentMusic) return;
        
        if (fadeOut) {
            this.fadeOut(this.currentMusic, 1000, () => {
                this.currentMusic.pause();
                this.currentMusic = null;
            });
        } else {
            this.currentMusic.pause();
            this.currentMusic = null;
        }
    }
    
    // Fade in audio
    fadeIn(audio, targetVolume, duration) {
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = targetVolume / steps;
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.min(targetVolume, volumeStep * currentStep);
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
            }
        }, stepTime);
    }
    
    // Fade out audio
    fadeOut(audio, duration, callback) {
        const steps = 20;
        const stepTime = duration / steps;
        const startVolume = audio.volume;
        const volumeStep = startVolume / steps;
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(0, startVolume - (volumeStep * currentStep));
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                if (callback) callback();
            }
        }, stepTime);
    }
    
    // Set master volume
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }
    
    // Set SFX volume
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateSoundVolumes();
    }
    
    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateMusicVolumes();
    }
    
    // Update all volumes
    updateAllVolumes() {
        this.updateSoundVolumes();
        this.updateMusicVolumes();
    }
    
    // Update sound volumes
    updateSoundVolumes() {
        for (const sound of Object.values(this.sounds)) {
            sound.volume = this.sfxVolume * this.masterVolume;
        }
    }
    
    // Update music volumes
    updateMusicVolumes() {
        for (const music of Object.values(this.music)) {
            music.volume = this.musicVolume * this.masterVolume;
        }
    }
    
    // Enable/disable audio
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled && this.currentMusic) {
            this.stopMusic();
        }
    }
    
    // Get audio status
    getStatus() {
        return {
            enabled: this.enabled,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            soundsLoaded: Object.keys(this.sounds).length,
            musicLoaded: Object.keys(this.music).length,
            currentMusic: this.currentMusic ? 'playing' : 'none'
        };
    }
}

// Default audio pack for the game
const DefaultAudioPack = {
    sounds: {
        // Tower sounds
        towerPlace: 'audio/sfx/tower_place.mp3',
        towerUpgrade: 'audio/sfx/tower_upgrade.mp3',
        towerShoot: 'audio/sfx/tower_shoot.mp3',
        towerShootSlow: 'audio/sfx/tower_shoot_slow.mp3',
        towerShootSplash: 'audio/sfx/tower_shoot_splash.mp3',
        
        // Enemy sounds
        enemyHit: 'audio/sfx/enemy_hit.mp3',
        enemyDeath: 'audio/sfx/enemy_death.mp3',
        bossSpawn: 'audio/sfx/boss_spawn.mp3',
        bossDeath: 'audio/sfx/boss_death.mp3',
        
        // Game sounds
        waveStart: 'audio/sfx/wave_start.mp3',
        waveComplete: 'audio/sfx/wave_complete.mp3',
        gameOver: 'audio/sfx/game_over.mp3',
        victory: 'audio/sfx/victory.mp3',
        
        // UI sounds
        buttonClick: 'audio/sfx/button_click.mp3',
        buttonHover: 'audio/sfx/button_hover.mp3',
        moneyEarn: 'audio/sfx/money_earn.mp3'
    },
    
    music: {
        mainMenu: 'audio/music/main_menu.mp3',
        level1: 'audio/music/level1.mp3',
        boss: 'audio/music/boss_theme.mp3',
        victory: 'audio/music/victory.mp3'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager, DefaultAudioPack };
} else {
    window.AudioManager = AudioManager;
    window.DefaultAudioPack = DefaultAudioPack;
}