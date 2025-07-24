// Visual Effects Manager - Centralized visual effects management
class VisualManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.explosions = [];
        this.trails = [];
        
        // Get quality settings
        const qualitySettings = GameConfig.utils.getCurrentQuality();
        this.maxParticles = qualitySettings.maxParticles;
        this.enabled = qualitySettings.particleEffects;
        
        // Particle geometries (reused for performance)
        this.particleGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        this.trailGeometry = new THREE.SphereGeometry(0.03, 4, 4);
        
        // Materials for different effects
        this.materials = {
            explosion: new THREE.MeshBasicMaterial({ color: 0xFF4500, transparent: true }),
            hit: new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true }),
            trail: new THREE.MeshBasicMaterial({ color: 0xFFFF00, transparent: true }),
            slow: new THREE.MeshBasicMaterial({ color: 0x00BFFF, transparent: true }),
            splash: new THREE.MeshBasicMaterial({ color: 0xFF4500, transparent: true })
        };
    }
    
    // Create explosion effect
    createExplosion(position, type = 'basic', intensity = 1.0) {
        if (!this.enabled) return;
        
        // Adjust particle count based on quality settings
        const qualitySettings = GameConfig.utils.getCurrentQuality();
        const baseParticleCount = qualitySettings.maxParticles <= 20 ? 5 : (qualitySettings.maxParticles <= 35 ? 8 : 10);
        const particleCount = Math.min(baseParticleCount * intensity, qualitySettings.maxParticles / 2);
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                this.particleGeometry,
                this.materials.explosion.clone()
            );
            
            particle.position.copy(position);
            particle.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.5
            ));
            
            // Particle properties
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    Math.random() * 0.05 + 0.02,
                    (Math.random() - 0.5) * 0.1
                ),
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                type: type
            };
            
            this.scene.add(particle);
            particles.push(particle);
        }
        
        this.particles.push(...particles);
        this.cleanupParticles();
    }
    
    // Create hit effect
    createHitEffect(position, damage) {
        if (!this.enabled) return;
        
        const particle = new THREE.Mesh(
            this.particleGeometry,
            this.materials.hit.clone()
        );
        
        particle.position.copy(position);
        particle.position.y += 0.5;
        
        particle.userData = {
            velocity: new THREE.Vector3(0, 0.03, 0),
            life: 1.0,
            decay: 0.03,
            type: 'hit',
            damage: damage
        };
        
        this.scene.add(particle);
        this.particles.push(particle);
        
        // Create damage text (placeholder for now)
        this.createDamageText(position, damage);
    }
    
    // Create projectile trail
    createTrail(position, color = 0xFFFF00) {
        if (!this.enabled) return null;
        
        const trail = new THREE.Mesh(
            this.trailGeometry,
            this.materials.trail.clone()
        );
        
        trail.material.color.setHex(color);
        trail.position.copy(position);
        
        trail.userData = {
            life: 0.5,
            decay: 0.05,
            type: 'trail'
        };
        
        this.scene.add(trail);
        this.trails.push(trail);
        
        return trail;
    }
    
    // Create splash damage effect
    createSplashEffect(position, radius) {
        if (!this.enabled) return;
        
        // Create ring effect
        const ringGeometry = new THREE.RingGeometry(0, radius, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF4500,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.position.y = 0.1;
        ring.rotation.x = -Math.PI / 2;
        
        ring.userData = {
            life: 1.0,
            decay: 0.05,
            type: 'splash',
            maxScale: radius
        };
        
        this.scene.add(ring);
        this.particles.push(ring);
        
        // Create splash particles
        this.createExplosion(position, 'splash', radius);
    }
    
    // Create slow effect
    createSlowEffect(position) {
        if (!this.enabled) return;
        
        const particle = new THREE.Mesh(
            this.particleGeometry,
            this.materials.slow.clone()
        );
        
        particle.position.copy(position);
        particle.position.y += 0.3;
        
        particle.userData = {
            velocity: new THREE.Vector3(0, 0.01, 0),
            life: 1.0,
            decay: 0.02,
            type: 'slow'
        };
        
        this.scene.add(particle);
        this.particles.push(particle);
    }
    
    // Create damage text effect (placeholder)
    createDamageText(position, damage) {
        // This would create floating damage numbers
        // For now, we'll just log it
        console.log(`Damage: ${damage} at position:`, position);
    }
    
    // Create muzzle flash for towers
    createMuzzleFlash(position, direction) {
        if (!this.enabled) return;
        
        const flash = new THREE.Mesh(
            this.particleGeometry,
            this.materials.explosion.clone()
        );
        
        flash.position.copy(position);
        flash.position.add(direction.clone().multiplyScalar(0.3));
        
        flash.userData = {
            life: 0.3,
            decay: 0.1,
            type: 'muzzle'
        };
        
        this.scene.add(flash);
        this.particles.push(flash);
    }
    
    // Update all particles
    update(deltaTime) {
        if (!this.enabled) return;
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const userData = particle.userData;
            
            if (!userData) continue;
            
            // Update life
            userData.life -= userData.decay * deltaTime * 60;
            
            if (userData.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update opacity
            if (particle.material.transparent) {
                particle.material.opacity = userData.life;
            }
            
            // Update position based on velocity
            if (userData.velocity) {
                particle.position.add(
                    userData.velocity.clone().multiplyScalar(deltaTime * 60)
                );
                
                // Apply gravity to explosion particles
                if (userData.type === 'explosion' || userData.type === 'hit') {
                    userData.velocity.y -= 0.002 * deltaTime * 60;
                }
            }
            
            // Special effects for different types
            switch (userData.type) {
                case 'splash':
                    const scale = 1 + (1 - userData.life) * userData.maxScale;
                    particle.scale.set(scale, 1, scale);
                    break;
                    
                case 'slow':
                    particle.rotation.y += 0.1 * deltaTime * 60;
                    break;
            }
        }
        
        // Update trails
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            const userData = trail.userData;
            
            userData.life -= userData.decay * deltaTime * 60;
            
            if (userData.life <= 0) {
                this.scene.remove(trail);
                this.trails.splice(i, 1);
            } else {
                trail.material.opacity = userData.life;
            }
        }
    }
    
    // Clean up excess particles for performance
    cleanupParticles() {
        while (this.particles.length > this.maxParticles) {
            const particle = this.particles.shift();
            this.scene.remove(particle);
        }
    }
    
    // Clear all effects
    clearAll() {
        // Remove all particles
        this.particles.forEach(particle => this.scene.remove(particle));
        this.particles = [];
        
        // Remove all trails
        this.trails.forEach(trail => this.scene.remove(trail));
        this.trails = [];
    }
    
    // Enable/disable effects
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.clearAll();
        }
    }
    
    // Set maximum particles
    setMaxParticles(max) {
        this.maxParticles = max;
        this.cleanupParticles();
    }
    
    // Update quality settings
    updateQualitySettings() {
        const qualitySettings = GameConfig.utils.getCurrentQuality();
        this.maxParticles = qualitySettings.maxParticles;
        this.enabled = qualitySettings.particleEffects;
        this.cleanupParticles();
    }
    
    // Get status
    getStatus() {
        return {
            enabled: this.enabled,
            particleCount: this.particles.length,
            trailCount: this.trails.length,
            maxParticles: this.maxParticles
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualManager;
} else {
    window.VisualManager = VisualManager;
}