// Enemy System - Centralized enemy type definitions
class EnemySystem {
    constructor() {
        // WEAKNESS SYSTEM:
        // light = lemah terhadap basic tower
        // heavy = lemah terhadap splash tower  
        // magical = lemah terhadap slow tower
        // aerial = lemah terhadap anti-air tower
        // shielded = lemah terhadap piercing tower
        
        this.enemyTypes = {
            // Basic enemy types
            tuyul: {
                baseHealth: 100,
                baseSpeed: 0.0225,
                baseReward: 10,
                color: 0xFF4500,
                size: 0.3,
                description: 'Standard enemy unit',
                weakness: 'light', // Lemah terhadap basic tower
                resistance: null
            },
            jalangkung: {
                baseHealth: 60,
                baseSpeed: 0.0375,
                baseReward: 15,
                color: 0x00FF00,
                size: 0.25,
                description: 'Jalangkung - Hantu cepat yang mengerikan',
                weakness: 'light', // Lemah terhadap basic tower
                resistance: 'splash' // Tahan terhadap splash damage
            },
            genderuwo: {
                baseHealth: 200,
                baseSpeed: 0.012,
                baseReward: 25,
                color: 0x8B4513,
                size: 0.4,
                description: 'Genderuwo - Raksasa dengan armor tebal dan kesehatan tinggi',
                weakness: 'heavy', // Lemah terhadap splash tower
                resistance: 'light' // Tahan terhadap basic tower
            },
            lembusura: {
                baseHealth: 180,
                baseSpeed: 0.0225,
                baseReward: 25,
                color: 0x696969,
                size: 0.35,
                description: 'Lembusura enemy',
                weakness: 'piercing', // Lemah terhadap piercing tower
                resistance: 'light' // Tahan terhadap basic tower
            },
            kuntilanak: {
                baseHealth: 120,
                baseSpeed: 0.0375,
                baseReward: 28,
                color: 0x00BFFF,
                size: 0.3,
                description: 'Aerial enemy unit',
                weakness: 'aerial', // Lemah terhadap anti-air tower
                resistance: 'splash' // Tahan terhadap splash damage
            },
            'mbok dukun pikun': {
                baseHealth: 500,
                baseSpeed: 0.018,
                baseReward: 100,
                color: 0x800080,
                size: 0.6,
                description: 'Mbok Dukun Pikun - Powerful boss enemy',
                weakness: 'heavy', // Lemah terhadap splash tower
                resistance: 'light' // Tahan terhadap basic tower
            },
            'ratu laut neraka': {
                baseHealth: 2000,
                baseSpeed: 0.021,
                baseReward: 500,
                color: 0x8B0000,
                size: 1.5,
                description: 'Ultimate boss enemy',
                weakness: 'piercing', // Lemah terhadap piercing tower
                resistance: ['light', 'splash'] // Tahan terhadap basic dan splash
            },
            'orang bunian': {
                baseHealth: 80,
                baseSpeed: 0.03,
                baseReward: 35,
                color: 0x483D8B,
                size: 2,
                description: 'Stealthy enemy with invisibility',
                weakness: 'magical', // Lemah terhadap slow tower (magical detection)
                resistance: 'light' // Tahan terhadap basic tower
            },
            'roh tanah bangkit': {
                baseHealth: 150,
                baseSpeed: 0.018,
                baseReward: 40,
                color: 0x32CD32,
                size: 0.35,
                description: 'Enemy that regenerates health',
                weakness: 'magical', // Lemah terhadap slow tower (anti-regen)
                resistance: 'light' // Tahan terhadap basic tower
            },
            explosive: {
                baseHealth: 90,
                baseSpeed: 0.027,
                baseReward: 30,
                color: 0xFF6347,
                size: 0.32,
                description: 'Explodes when destroyed',
                weakness: 'piercing', // Lemah terhadap piercing tower
                resistance: 'splash' // Tahan terhadap splash damage
            },
            
            // NEW ENEMY TYPES FOR FUTURE LEVELS
            shielded: {
                baseHealth: 250,
                baseSpeed: 0.016,
                baseReward: 45,
                color: 0x4682B4,
                size: 0.38,
                description: 'Enemy with energy shield',
                weakness: 'piercing', // Lemah terhadap piercing tower
                resistance: ['light', 'magical'] // Tahan terhadap basic dan slow
            },
            swarm: {
                baseHealth: 40,
                baseSpeed: 0.032,
                baseReward: 8,
                color: 0xFFD700,
                size: 0.2,
                description: 'Small but numerous enemy',
                weakness: 'heavy', // Lemah terhadap splash tower
                resistance: 'piercing' // Tahan terhadap piercing
            },
            berserker: {
                baseHealth: 160,
                baseSpeed: 0.028,
                baseReward: 35,
                color: 0xDC143C,
                size: 0.33,
                description: 'Gets faster when damaged',
                weakness: 'magical', // Lemah terhadap slow tower
                resistance: 'light' // Tahan terhadap basic tower
            },
            phantom: {
                baseHealth: 100,
                baseSpeed: 0.024,
                baseReward: 50,
                color: 0x9370DB,
                size: 0.3,
                description: 'Phases through some attacks',
                weakness: 'magical', // Lemah terhadap slow tower
                resistance: ['light', 'heavy'] // Tahan terhadap basic dan splash
            },
            titan: {
                baseHealth: 800,
                baseSpeed: 0.012,
                baseReward: 150,
                color: 0x2F4F4F,
                size: 0.8,
                description: 'Massive enemy with high resistance',
                weakness: 'piercing', // Lemah terhadap piercing tower
                resistance: ['light', 'splash', 'magical'] // Tahan terhadap banyak tipe
            },
            
            // ADVANCED ENEMY TYPES WITH SPECIAL ABILITIES
            invisible: {
                baseHealth: 120,
                baseSpeed: 0.024,
                baseReward: 60,
                color: 0x708090,
                size: 0.3,
                description: 'Can become invisible periodically',
                weakness: 'detection', // Lemah terhadap detector tower
                resistance: 'light',
                special: 'stealth', // Kemampuan khusus stealth
                stealthDuration: 3000, // 3 detik invisible
                stealthCooldown: 5000, // 5 detik cooldown
                visibilityChance: 0.3 // 30% chance terlihat saat stealth
            },
            cloaked: {
                baseHealth: 90,
                baseSpeed: 0.028,
                baseReward: 45,
                color: 0x2F2F2F,
                size: 0.28,
                description: 'Permanently cloaked, needs detection',
                weakness: 'detection',
                resistance: ['light', 'heavy'],
                special: 'permanent_stealth', // Selalu invisible
                detectionRange: 2.5 // Range untuk bisa dideteksi
            },
            healer: {
                baseHealth: 140,
                baseSpeed: 0.016,
                baseReward: 55,
                color: 0x98FB98,
                size: 0.35,
                description: 'Heals nearby enemies',
                weakness: 'magical',
                resistance: 'light',
                special: 'heal',
                healRange: 2.0, // Range heal
                healAmount: 10, // HP yang di-heal per detik
                healCooldown: 2000 // Cooldown heal
            },
            buffer: {
                baseHealth: 110,
                baseSpeed: 0.02,
                baseReward: 50,
                color: 0xFFD700,
                size: 0.32,
                description: 'Buffs nearby enemies speed and damage',
                weakness: 'piercing',
                resistance: 'magical',
                special: 'buff',
                buffRange: 2.5, // Range buff
                speedBuff: 1.3, // 30% speed increase
                damageBuff: 1.2 // 20% damage increase (jika ada)
            },
            teleporter: {
                baseHealth: 100,
                baseSpeed: 0.024,
                baseReward: 65,
                color: 0x9370DB,
                size: 0.3,
                description: 'Can teleport short distances',
                weakness: 'magical',
                resistance: 'light',
                special: 'teleport',
                teleportRange: 3.0, // Jarak teleport
                teleportCooldown: 4000, // Cooldown teleport
                teleportChance: 0.25 // 25% chance teleport saat diserang
            },
            splitter: {
                baseHealth: 150,
                baseSpeed: 0.016,
                baseReward: 40,
                color: 0xFF69B4,
                size: 0.4,
                description: 'Splits into smaller enemies when killed',
                weakness: 'heavy',
                resistance: 'piercing',
                special: 'split',
                splitCount: 3, // Jumlah enemy kecil yang muncul
                splitHealth: 30, // HP enemy kecil
                splitSpeed: 0.032 // Speed enemy kecil
            },
            immune: {
                baseHealth: 200,
                baseSpeed: 0.016,
                baseReward: 80,
                color: 0x4169E1,
                size: 0.38,
                description: 'Immune to certain damage types temporarily',
                weakness: null, // Tidak ada weakness tetap
                resistance: null, // Resistance berubah-ubah
                special: 'immunity_cycle',
                immunityTypes: ['light', 'heavy', 'magical'], // Tipe yang bisa immune
                immunityDuration: 2000, // 2 detik immune
                immunityCooldown: 1000 // 1 detik normal
            }
        };
    }

    // Get enemy stats for a specific level with scaling
    getEnemyStats(enemyType, level = 1, difficultyMultiplier = 1.0) {
        const baseStats = this.enemyTypes[enemyType];
        if (!baseStats) {
            console.warn(`Enemy type '${enemyType}' not found`);
            return this.enemyTypes.tuyul;
        }

        // Scale stats based on level and difficulty
        const levelScaling = 1 + (level - 1) * 0.2; // 20% increase per level
        const healthScaling = levelScaling * difficultyMultiplier;
        const speedScaling = Math.min(1 + (level - 1) * 0.1, 2.0); // Max 2x speed
        const rewardScaling = levelScaling;

        return {
            health: Math.floor(baseStats.baseHealth * healthScaling),
            speed: baseStats.baseSpeed * speedScaling,
            reward: Math.floor(baseStats.baseReward * rewardScaling),
            color: baseStats.color,
            size: baseStats.size,
            description: baseStats.description,
            // WEAKNESS SYSTEM PROPERTIES
            weakness: baseStats.weakness,
            resistance: baseStats.resistance
        };
    }

    // Get all available enemy types
    getAvailableEnemyTypes() {
        return Object.keys(this.enemyTypes);
    }

    // Get enemy type info
    getEnemyTypeInfo(enemyType) {
        return this.enemyTypes[enemyType] || null;
    }

    // Create enemy configuration for a level
    createEnemyConfig(level, difficultyMultiplier = 1.0, availableTypes = null) {
        const types = availableTypes || this.getAvailableEnemyTypes();
        const config = { types: {} };

        types.forEach(type => {
            config.types[type] = this.getEnemyStats(type, level, difficultyMultiplier);
        });

        return config;
    }

    // Predefined enemy sets for different level difficulties
    getEnemySetForDifficulty(difficulty) {
        const sets = {
        easy: ['tuyul', 'jalangkung', 'genderuwo', 'kuntilanak', 'mbok dukun pikun'],
        medium: ['tuyul', 'jalangkung', 'genderuwo', 'lembusura', 'mbok dukun pikun'],
        hard: ['tuyul', 'jalangkung', 'genderuwo', 'lembusura', 'kuntilanak', 'mbok dukun pikun', 'ratu laut neraka'],
        expert: ['tuyul', 'jalangkung', 'genderuwo', 'lembusura', 'kuntilanak', 'orang bunian', 'mbok dukun pikun', 'ratu laut neraka'],
        nightmare: Object.keys(this.enemyTypes)
        };

        return sets[difficulty] || sets.easy;
    }
    
    // WEAKNESS SYSTEM METHODS
    // Mendapatkan weakness dari enemy type
    getEnemyWeakness(enemyType) {
        const enemyData = this.enemyTypes[enemyType];
        return enemyData ? enemyData.weakness : null;
    }
    
    // Mendapatkan resistance dari enemy type
    getEnemyResistance(enemyType) {
        const enemyData = this.enemyTypes[enemyType];
        return enemyData ? enemyData.resistance : null;
    }
    
    // Mendapatkan semua enemy dengan weakness tertentu
    getEnemiesByWeakness(weakness) {
        return Object.keys(this.enemyTypes).filter(type => 
            this.enemyTypes[type].weakness === weakness
        );
    }
    
    // Mendapatkan semua enemy dengan resistance tertentu
    getEnemiesByResistance(resistance) {
        return Object.keys(this.enemyTypes).filter(type => {
            const enemyResistance = this.enemyTypes[type].resistance;
            if (Array.isArray(enemyResistance)) {
                return enemyResistance.includes(resistance);
            }
            return enemyResistance === resistance;
        });
    }
    
    // Mendapatkan rekomendasi tower untuk enemy tertentu
    getRecommendedTowers(enemyType) {
        const enemyData = this.enemyTypes[enemyType];
        if (!enemyData) return [];
        
        const recommendations = {
            light: ['basic'],
            heavy: ['splash'],
            magical: ['slow', 'freeze', 'poison'],
            aerial: ['antiair'],
            piercing: ['piercing', 'laser']
        };
        
        return recommendations[enemyData.weakness] || [];
    }
    
    // SPECIAL ABILITY METHODS
    // Cek apakah enemy sedang invisible/stealth
    isEnemyVisible(enemy, gameTime) {
        if (!enemy.special) return true;
        
        if (enemy.special === 'stealth') {
            // Invisible setiap 3 detik selama 1 detik
            const cycle = gameTime % (enemy.stealthCycle + enemy.stealthDuration);
            return cycle >= enemy.stealthDuration;
        }
        
        if (enemy.special === 'permanent_stealth') {
            return false; // Selalu invisible kecuali ada detector
        }
        
        return true;
    }
    
    // Cek apakah enemy bisa di-heal oleh healer
    canBeHealed(enemy, healer, distance) {
        if (healer.special !== 'heal') return false;
        if (enemy.health >= enemy.maxHealth) return false;
        return distance <= healer.healRange;
    }
    
    // Cek apakah enemy bisa di-buff oleh buffer
    canBeBuffed(enemy, buffer, distance) {
        if (buffer.special !== 'buff') return false;
        return distance <= buffer.buffRange;
    }
    
    // Hitung healing amount
    calculateHealing(healer, target) {
        if (healer.special !== 'heal') return 0;
        return Math.min(healer.healAmount, target.maxHealth - target.health);
    }
    
    // Hitung buff effect
    calculateBuffEffect(buffer, target) {
        if (buffer.special !== 'buff') return { speed: 1.0, damage: 1.0 };
        
        return {
            speed: buffer.speedBuff || 1.0,
            damage: buffer.damageBuff || 1.0
        };
    }
    
    // Cek apakah enemy bisa teleport
    canTeleport(enemy, gameTime) {
        if (enemy.special !== 'teleport') return false;
        
        const timeSinceLastTeleport = gameTime - (enemy.lastTeleport || 0);
        return timeSinceLastTeleport >= enemy.teleportCooldown;
    }
    
    // Hitung posisi teleport
    calculateTeleportPosition(enemy, currentPos, targetPos) {
        if (enemy.special !== 'teleport') return currentPos;
        
        const dx = targetPos.x - currentPos.x;
        const dy = targetPos.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= enemy.teleportRange) {
            return targetPos;
        }
        
        // Teleport sejauh mungkin menuju target
        const ratio = enemy.teleportRange / distance;
        return {
            x: currentPos.x + dx * ratio,
            y: currentPos.y + dy * ratio
        };
    }
    
    // Cek apakah enemy akan split saat mati
    willSplitOnDeath(enemy) {
        return enemy.special === 'split' && enemy.splitCount > 0;
    }
    
    // Buat enemy hasil split
    createSplitEnemies(enemy, position) {
        if (!this.willSplitOnDeath(enemy)) return [];
        
        const splitEnemies = [];
        const splitType = enemy.splitType || 'tuyul';
        
        for (let i = 0; i < enemy.splitCount; i++) {
            const angle = (Math.PI * 2 * i) / enemy.splitCount;
            const offset = 30; // Jarak spawn dari posisi asli
            
            const splitEnemy = this.createEnemyConfig(splitType, 1);
            splitEnemy.position = {
                x: position.x + Math.cos(angle) * offset,
                y: position.y + Math.sin(angle) * offset
            };
            splitEnemy.health = Math.floor(enemy.maxHealth * 0.3); // 30% health asli
            splitEnemy.maxHealth = splitEnemy.health;
            splitEnemy.speed = enemy.speed * 1.2; // 20% lebih cepat
            
            splitEnemies.push(splitEnemy);
        }
        
        return splitEnemies;
    }
    
    // Cek immunity cycle
    getCurrentImmunity(enemy, gameTime) {
        if (enemy.special !== 'immunity_cycle') return null;
        
        const cycleTime = gameTime % enemy.immunityCycleDuration;
        const phaseIndex = Math.floor(cycleTime / (enemy.immunityCycleDuration / enemy.immunityTypes.length));
        
        return enemy.immunityTypes[phaseIndex] || null;
    }
    
    // Mendapatkan semua enemy dengan special ability tertentu
    getEnemiesBySpecialAbility(specialAbility) {
        const enemies = [];
        
        for (const [type, data] of Object.entries(this.enemyTypes)) {
            if (data.special === specialAbility) {
                enemies.push({
                    type: type,
                    name: data.name || type,
                    description: data.description
                });
            }
        }
        
        return enemies;
    }
    
    // Mendapatkan counter strategy untuk special enemy
    getCounterStrategy(enemyType) {
        const enemy = this.enemyTypes[enemyType];
        if (!enemy || !enemy.special) return [];
        
        const strategies = {
            'stealth': [
                'Gunakan Detector Tower untuk mengungkap enemy',
                'Tempatkan tower di jalur sempit untuk damage area'
            ],
            'permanent_stealth': [
                'Wajib menggunakan Detector Tower',
                'Fokus pada area damage dan splash damage'
            ],
            'heal': [
                'Gunakan Suppressor Tower untuk mencegah healing',
                'Fokus kill healer terlebih dahulu',
                'Gunakan high damage tower untuk one-shot kill'
            ],
            'buff': [
                'Gunakan Suppressor Tower untuk mencegah buff',
                'Prioritas kill buffer enemy',
                'Gunakan EMP Tower untuk disable ability'
            ],
            'teleport': [
                'Gunakan EMP Tower untuk disable teleport',
                'Tempatkan tower di sepanjang jalur',
                'Gunakan Temporal Tower untuk slow effect'
            ],
            'split': [
                'Gunakan Splash Tower untuk damage area',
                'Gunakan Chain Lightning Tower',
                'Hindari overkill, gunakan damage tepat'
            ],
            'immunity_cycle': [
                'Gunakan Adaptive Tower yang bisa berubah damage type',
                'Kombinasi berbagai jenis tower',
                'Gunakan Temporal Tower untuk memperlambat'
            ]
        };
        
        return strategies[enemy.special] || [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnemySystem;
} else {
    window.EnemySystem = EnemySystem;
}