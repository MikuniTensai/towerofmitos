// Performance Optimizer - Optimasi FPS untuk perangkat mobile
class PerformanceOptimizer {
    constructor() {
        this.isOptimized = false;
        this.originalSettings = {};
        this.frameCount = 0;
        this.lastFPSCheck = Date.now();
        this.averageFPS = 60;
        this.fpsHistory = [];
        this.adaptiveQuality = true;
        
        // Thresholds untuk adaptive quality
        this.fpsThresholds = {
            low: 25,    // Jika FPS < 25, turun ke low quality
            medium: 35, // Jika FPS < 35, turun ke medium quality
            high: 45    // Jika FPS >= 45, bisa naik ke high quality
        };
        
        // Object pooling untuk reuse objects
        this.objectPools = {
            projectiles: [],
            particles: [],
            healthBars: []
        };
        
        this.init();
    }
    
    init() {
        // Deteksi device capabilities
        this.detectDeviceCapabilities();
        
        // Setup adaptive quality monitoring
        if (this.adaptiveQuality) {
            this.startFPSMonitoring();
        }
        
        console.log('Performance Optimizer initialized');
    }
    
    detectDeviceCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        this.deviceInfo = {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048,
            maxRenderbufferSize: gl ? gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) : 2048,
            cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4
        };
        
        console.log('Device capabilities:', this.deviceInfo);
    }
    
    startFPSMonitoring() {
        setInterval(() => {
            this.checkAndAdaptQuality();
        }, 3000); // Check every 3 seconds
    }
    
    updateFPS(currentFPS) {
        this.fpsHistory.push(currentFPS);
        if (this.fpsHistory.length > 10) {
            this.fpsHistory.shift();
        }
        
        // Calculate average FPS
        this.averageFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    }
    
    checkAndAdaptQuality() {
        if (!this.adaptiveQuality || this.fpsHistory.length < 5) return;
        
        const currentQuality = GameConfig.quality.current;
        let newQuality = currentQuality;
        
        if (this.averageFPS < this.fpsThresholds.low && currentQuality !== 'low') {
            newQuality = 'low';
        } else if (this.averageFPS < this.fpsThresholds.medium && currentQuality === 'high') {
            newQuality = 'medium';
        } else if (this.averageFPS >= this.fpsThresholds.high && currentQuality === 'low') {
            newQuality = 'medium';
        } else if (this.averageFPS >= this.fpsThresholds.high + 10 && currentQuality === 'medium') {
            newQuality = 'high';
        }
        
        if (newQuality !== currentQuality) {
            console.log(`Adaptive quality: ${currentQuality} -> ${newQuality} (FPS: ${this.averageFPS.toFixed(1)})`);
            this.changeQuality(newQuality);
        }
    }
    
    changeQuality(quality) {
        GameConfig.quality.current = quality;
        
        // Update visual manager
        if (window.visualManager) {
            window.visualManager.updateQualitySettings();
        }
        
        // Update renderer settings
        if (window.renderer) {
            const qualitySettings = GameConfig.utils.getCurrentQuality();
            window.renderer.shadowMap.enabled = qualitySettings.shadows;
            window.renderer.setPixelRatio(qualitySettings.pixelRatio);
        }
        
        // Update lighting
        this.updateLighting();
    }
    
    updateLighting() {
        if (!window.scene) return;
        
        const qualitySettings = GameConfig.utils.getCurrentQuality();
        
        window.scene.traverse((object) => {
            if (object.isLight) {
                if (object.type === 'AmbientLight') {
                    object.intensity = 0.4 * qualitySettings.lightIntensity;
                } else if (object.type === 'DirectionalLight') {
                    object.intensity = qualitySettings.lightIntensity;
                    object.castShadow = qualitySettings.shadows;
                    if (object.shadow) {
                        object.shadow.mapSize.width = qualitySettings.shadowMapSize;
                        object.shadow.mapSize.height = qualitySettings.shadowMapSize;
                    }
                } else if (object.type === 'PointLight') {
                    object.intensity = 0.5 * qualitySettings.lightIntensity;
                }
            }
        });
    }
    
    // Optimasi untuk enemy updates
    optimizeEnemyUpdates() {
        if (!window.enemies) return;
        
        // Tidak skip frame untuk animasi yang smooth
        // const frameSkip = this.averageFPS < 30 ? 2 : 1;
        // if (this.frameCount % frameSkip !== 0) return;
        
        // Update semua enemies untuk animasi yang smooth
        const camera = window.camera;
        if (!camera) return;
        
        window.enemies.forEach((enemy, index) => {
            // Update semua enemy tanpa alternating untuk animasi smooth
            this.updateEnemyOptimized(enemy);
        });
    }
    
    updateEnemyOptimized(enemy) {
        if (!enemy.alive) return;
        
        // Health bar update dengan frekuensi yang lebih sering untuk smooth
        if (this.frameCount % 3 === 0) {
            enemy.healthBar.lookAt(window.camera.position);
        }
        
        // Optimized animation mixer update (frame-rate independent)
        if (enemy.mixer) {
            // Use actual deltaTime for consistent animation
            const actualDelta = window.globalDeltaTime || 0.016;
            // Cap deltaTime lebih ketat untuk animasi yang lebih smooth
            const cappedDelta = Math.min(actualDelta, 0.025); // Max 40 FPS equivalent untuk smooth
            enemy.mixer.update(cappedDelta);
        }
    }
    
    // Object pooling untuk projectiles
    getPooledProjectile() {
        if (this.objectPools.projectiles.length > 0) {
            return this.objectPools.projectiles.pop();
        }
        
        // Create new if pool is empty
        const geometry = new THREE.SphereGeometry(0.1, 6, 4);
        const material = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        return new THREE.Mesh(geometry, material);
    }
    
    returnProjectileToPool(projectile) {
        if (this.objectPools.projectiles.length < 20) {
            projectile.position.set(0, 0, 0);
            projectile.visible = false;
            this.objectPools.projectiles.push(projectile);
        } else {
            // Dispose if pool is full
            if (projectile.geometry) projectile.geometry.dispose();
            if (projectile.material) projectile.material.dispose();
        }
    }
    
    // Optimasi rendering
    optimizeRendering() {
        if (!window.renderer) return;
        
        const qualitySettings = GameConfig.utils.getCurrentQuality();
        
        // Adaptive pixel ratio
        const targetFPS = 45;
        let pixelRatio = qualitySettings.pixelRatio;
        
        if (this.averageFPS < targetFPS - 10) {
            pixelRatio = Math.max(0.5, pixelRatio - 0.1);
        } else if (this.averageFPS > targetFPS + 5) {
            pixelRatio = Math.min(window.devicePixelRatio || 1, pixelRatio + 0.1);
        }
        
        window.renderer.setPixelRatio(pixelRatio);
    }
    
    // Optimasi memory management
    optimizeMemory() {
        // Cleanup unused textures and geometries
        if (this.frameCount % 300 === 0) { // Every 5 seconds at 60fps
            this.cleanupUnusedResources();
        }
    }
    
    cleanupUnusedResources() {
        if (!window.scene) return;
        
        let disposedCount = 0;
        
        window.scene.traverse((object) => {
            if (object.isMesh && !object.visible) {
                if (object.geometry && object.geometry.dispose) {
                    object.geometry.dispose();
                    disposedCount++;
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(mat => {
                            if (mat.dispose) mat.dispose();
                        });
                    } else if (object.material.dispose) {
                        object.material.dispose();
                    }
                }
            }
        });
        
        if (disposedCount > 0) {
            console.log(`Cleaned up ${disposedCount} unused resources`);
        }
    }
    
    // Optimasi untuk tower updates
    optimizeTowerUpdates() {
        if (!window.towers) return;
        
        // Update towers dengan interval yang berbeda berdasarkan FPS
        const updateInterval = this.averageFPS < 30 ? 3 : 2;
        
        window.towers.forEach((tower, index) => {
            if (index % updateInterval === this.frameCount % updateInterval) {
                this.updateTowerOptimized(tower);
            }
        });
    }
    
    updateTowerOptimized(tower) {
        // Tower rotation removed - now controlled manually via popup
        
        // Optimized enemy detection (less frequent)
        if (this.frameCount % 10 === 0) {
            this.findNearestEnemyOptimized(tower);
        }
    }
    
    findNearestEnemyOptimized(tower) {
        let nearestEnemy = null;
        let nearestDistance = tower.range * tower.range; // Use squared distance
        
        for (let i = 0; i < window.enemies.length; i++) {
            const enemy = window.enemies[i];
            if (!enemy.alive) continue;
            
            // Squared distance calculation (faster)
            const dx = enemy.mesh.position.x - tower.x;
            const dz = enemy.mesh.position.z - tower.z;
            const distanceSquared = dx * dx + dz * dz;
            
            if (distanceSquared < nearestDistance) {
                nearestDistance = distanceSquared;
                nearestEnemy = enemy;
            }
        }
        
        tower.target = nearestEnemy;
    }
    
    // Main optimization update function
    update() {
        this.frameCount++;
        
        // Update FPS tracking
        if (window.currentFPS !== undefined) {
            this.updateFPS(window.currentFPS);
        }
        
        // Apply optimizations based on performance
        this.optimizeEnemyUpdates();
        this.optimizeTowerUpdates();
        this.optimizeRendering();
        this.optimizeMemory();
    }
    
    // Enable/disable adaptive quality
    setAdaptiveQuality(enabled) {
        this.adaptiveQuality = enabled;
        console.log('Adaptive quality:', enabled ? 'enabled' : 'disabled');
    }
    
    // Get performance stats
    getStats() {
        return {
            averageFPS: this.averageFPS.toFixed(1),
            currentQuality: GameConfig.quality.current,
            adaptiveQuality: this.adaptiveQuality,
            deviceInfo: this.deviceInfo,
            poolSizes: {
                projectiles: this.objectPools.projectiles.length,
                particles: this.objectPools.particles.length,
                healthBars: this.objectPools.healthBars.length
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
} else {
    window.PerformanceOptimizer = PerformanceOptimizer;
}