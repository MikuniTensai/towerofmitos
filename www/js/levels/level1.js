// Level 1 Configuration
const Level1 = {
    // Level Info
    info: {
        name: 'Level 1 - Basic Defense',
        description: 'Learn the basics of tower defense',
        difficulty: 'Easy'
    },
    
    // Available Tower Types for this level
    availableTowers: ['basic', 'slow', 'splash'],
    
    // Enemy Types for this level (will be populated by EnemySystem)
    availableEnemyTypes: ['tuyul', 'jalangkung', 'genderuwo', 'lembusura', 'kuntilanak', 'mbok dukun pikun', 'ratu laut neraka', 'orang bunian', 'roh tanah bangkit'],
    
    // Level difficulty multiplier for enemy scaling
    difficultyMultiplier: 1.0,

    // Enemy Waves Configuration
    waves: [
        {
            waveNumber: 1,
            totalEnemies: 10,
            spawnInterval: 1000,
            enemies: [
                { type: 'tuyul', count: 5 },
                { type: 'jalangkung', count: 2 },
                { type: 'ratu laut neraka', count: 2 },
                { type: 'orang bunian', count: 1 },
            ]
        },
        {
            waveNumber: 2,
            totalEnemies: 24,
            spawnInterval: 800,
            enemies: [
                { type: 'tuyul', count: 15 },
                { type: 'jalangkung', count: 5 },
                { type: 'lembusura', count: 2 },
                { type: 'genderuwo', count: 1 },
                { type: 'roh tanah bangkit', count: 1 }
            ]
        },
        {
            waveNumber: 3,
            totalEnemies: 38,
            spawnInterval: 600,
            enemies: [
                { type: 'tuyul', count: 17 },
                { type: 'jalangkung', count: 8 },
                { type: 'lembusura', count: 3 },
                { type: 'genderuwo', count: 3 },
                { type: 'kuntilanak', count: 4 },
                { type: 'mbok dukun pikun', count: 1 },
                { type: 'ratu laut neraka', count: 2 }
            ]
        }
    ],
    
    // Map Layout (1=wall, 0=path, 2=tower slot, S=start, F=finish)
    mapLayout: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        ['S',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'F',1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    
    // Enemy Path (coordinates for enemy movement)
    enemyPath: [
        {x: 0, z: 7}, {x: 1, z: 7}, {x: 2, z: 7}, {x: 3, z: 7}, {x: 4, z: 7},
        {x: 5, z: 7}, {x: 6, z: 7}, {x: 7, z: 7}, {x: 8, z: 7}, {x: 9, z: 7},
        {x: 10, z: 7}, {x: 11, z: 7}, {x: 12, z: 7}, {x: 13, z: 7}, {x: 14, z: 7},
        {x: 15, z: 7}, {x: 16, z: 7}, {x: 17, z: 7}, {x: 18, z: 7}, {x: 19, z: 7},
        {x: 20, z: 7}, {x: 21, z: 7}, {x: 22, z: 7}, {x: 23, z: 7}, {x: 24, z: 7},
        {x: 25, z: 7}, {x: 26, z: 7}, {x: 27, z: 7}, {x: 28, z: 7}, {x: 29, z: 7},
        {x: 30, z: 7}, {x: 31, z: 7}, {x: 32, z: 7}, {x: 33, z: 7}, {x: 34, z: 7},
        {x: 35, z: 7}, {x: 36, z: 7}, {x: 37, z: 7}, {x: 38, z: 7}
    ],
    
    // Level specific settings
    settings: {
        startingMoney: 150,
        startingHealth: 15,
        waveDelay: 5000,
        enemySpawnDelay: 1000
    },
    
    // Victory conditions
    victory: {
        surviveAllWaves: true,
        minimumHealth: 1
    },
    
    // Rewards for completing level
    rewards: {
        money: 200,
        experience: 100,
        unlocks: ['level2'] // Unlocks next level
    },
    
    // Audio files for this level
    audio: {
        backgroundMusic: 'audio/level1_bg.mp3',
        ambientSound: 'audio/level1_ambient.mp3'
    },
    
    // Visual effects for this level
    visual: {
        skyColor: 0x87CEEB,
        fogColor: 0x87CEEB,
        lightingIntensity: 1.0,
        particleEffects: true
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level1;
} else {
    window.Level1 = Level1;
}