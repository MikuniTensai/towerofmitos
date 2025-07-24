// Level 2 Configuration - Forest Path
const Level2 = {
    // Level Info
    info: {
        name: 'Level 2 - Forest Path',
        description: 'Navigate through the winding forest path',
        difficulty: 'Medium'
    },
    
    // Available Tower Types for this level
    availableTowers: ['basic', 'slow', 'splash', 'sniper'],
    
    // Enemy Types for this level (will be populated by EnemySystem)
    availableEnemyTypes: ['tuyul', 'jalangkung', 'genderuwo', 'lembusura', 'mbok dukun pikun'],
    
    // Level difficulty multiplier for enemy scaling
    difficultyMultiplier: 1.2,

    // Enemy Waves Configuration
    waves: [
        {
            waveNumber: 1,
            totalEnemies: 15,
            spawnInterval: 900,
            enemies: [
                { type: 'tuyul', count: 12 },
                { type: 'jalangkung', count: 3 }
            ]
        },
        {
            waveNumber: 2,
            totalEnemies: 25,
            spawnInterval: 750,
            enemies: [
                { type: 'tuyul', count: 15 },
                { type: 'jalangkung', count: 6 },
                { type: 'lembusura', count: 3 },
                { type: 'genderuwo', count: 1 }
            ]
        },
        {
            waveNumber: 3,
            totalEnemies: 35,
            spawnInterval: 600,
            enemies: [
                { type: 'tuyul', count: 20 },
                { type: 'jalangkung', count: 8 },
                { type: 'lembusura', count: 4 },
                { type: 'genderuwo', count: 2 },
                { type: 'mbok dukun pikun', count: 1 }
            ]
        },
        {
            waveNumber: 4,
            totalEnemies: 45,
            spawnInterval: 500,
            enemies: [
                { type: 'tuyul', count: 25 },
                { type: 'jalangkung', count: 12 },
                { type: 'lembusura', count: 5 },
                { type: 'genderuwo', count: 2 },
                { type: 'mbok dukun pikun', count: 1 }
            ]
        }
    ],
    
    // Map Layout with winding path
    mapLayout: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        ['S',0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'F',1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    
    // Enemy Path (L-shaped path)
    enemyPath: [
        {x: 0, z: 4}, {x: 1, z: 4}, {x: 2, z: 4}, {x: 3, z: 4}, {x: 4, z: 4},
        {x: 5, z: 4}, {x: 6, z: 4}, {x: 7, z: 4}, {x: 8, z: 4}, {x: 9, z: 4},
        {x: 9, z: 5}, {x: 9, z: 6}, {x: 9, z: 7}, {x: 9, z: 8}, {x: 9, z: 9},
        {x: 10, z: 9}, {x: 11, z: 9}, {x: 12, z: 9}, {x: 13, z: 9}, {x: 14, z: 9},
        {x: 15, z: 9}, {x: 16, z: 9}, {x: 17, z: 9}, {x: 18, z: 9}, {x: 19, z: 9},
        {x: 20, z: 9}, {x: 21, z: 9}, {x: 22, z: 9}, {x: 23, z: 9}, {x: 24, z: 9},
        {x: 25, z: 9}, {x: 26, z: 9}, {x: 27, z: 9}, {x: 28, z: 9}, {x: 29, z: 9},
        {x: 30, z: 9}, {x: 31, z: 9}, {x: 32, z: 9}, {x: 33, z: 9}, {x: 34, z: 9},
        {x: 35, z: 9}, {x: 36, z: 9}, {x: 37, z: 9}, {x: 38, z: 9}
    ],
    
    // Level specific settings
    settings: {
        startingMoney: 200,
        startingHealth: 20,
        waveDelay: 6000,
        enemySpawnDelay: 800
    },
    
    // Victory conditions
    victory: {
        surviveAllWaves: true,
        minimumHealth: 1
    },
    
    // Rewards for completing level
    rewards: {
        money: 300,
        experience: 150,
        unlocks: ['level3'] // Unlocks next level
    },
    
    // Audio files for this level
    audio: {
        backgroundMusic: 'audio/level2_bg.mp3',
        ambientSound: 'audio/forest_ambient.mp3'
    },
    
    // Visual effects for this level
    visual: {
        skyColor: 0x228B22,
        fogColor: 0x228B22,
        lightingIntensity: 0.8,
        particleEffects: true
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level2;
} else {
    window.Level2 = Level2;
}