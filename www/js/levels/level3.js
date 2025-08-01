// Level 3 Configuration - Mountain Pass
const Level3 = {
    // Level Info
    info: {
        name: 'Level 3 - Mountain Pass',
        description: 'Defend the treacherous mountain passage',
        difficulty: 'Hard'
    },
    
    // Available Tower Types for this level
    availableTowers: ['basic', 'slow', 'splash', 'sniper', 'cannon'],
    
    // Enemy Types for this level (will be populated by EnemySystem)
    availableEnemyTypes: ['tuyul', 'jalangkung', 'genderuwo', 'lembusura', 'kuntilanak', 'mbok dukun pikun', 'ratu laut neraka'],
    
    // Level difficulty multiplier for enemy scaling
    difficultyMultiplier: 1.5,

    // Enemy Waves Configuration
    waves: [
        {
            waveNumber: 1,
            totalEnemies: 20,
            spawnInterval: 800,
            enemies: [
                { type: 'tuyul', count: 15 },
                { type: 'jalangkung', count: 5 },
                { type: 'lembusura', count: 2 }
            ],
            autoStart: false
        },
        {
            waveNumber: 2,
            totalEnemies: 30,
            spawnInterval: 700,
            enemies: [
                { type: 'tuyul', count: 20 },
                { type: 'jalangkung', count: 8 },
                { type: 'lembusura', count: 4 },
                { type: 'kuntilanak', count: 3 }
            ],
            autoStart: false
        },
        {
            waveNumber: 3,
            totalEnemies: 40,
            spawnInterval: 600,
            enemies: [
                { type: 'tuyul', count: 20 },
                { type: 'jalangkung', count: 10 },
                { type: 'lembusura', count: 5 },
                { type: 'kuntilanak', count: 3 },
                { type: 'genderuwo', count: 2 }
            ],
            autoStart: false
        },
        {
            waveNumber: 4,
            totalEnemies: 50,
            spawnInterval: 500,
            enemies: [
                { type: 'tuyul', count: 25 },
                { type: 'jalangkung', count: 10 },
                { type: 'lembusura', count: 5 },
                { type: 'kuntilanak', count: 5 },
                { type: 'genderuwo', count: 3 },
                { type: 'mbok dukun pikun', count: 1 }
            ],
            autoStart: false
        },
        {
            waveNumber: 5,
            totalEnemies: 60,
            spawnInterval: 400,
            enemies: [
                { type: 'tuyul', count: 30 },
                { type: 'jalangkung', count: 15 },
                { type: 'lembusura', count: 8 },
                { type: 'kuntilanak', count: 8 },
                { type: 'genderuwo', count: 5 },
                { type: 'mbok dukun pikun', count: 2 },
                { type: 'ratu laut neraka', count: 1 }
            ],
            autoStart: false
         }
     ],
     
     // Map Layout with zigzag mountain path
    mapLayout: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        ['S',0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'F',1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    
    // Enemy Path (zigzag mountain path)
    enemyPath: [
        {x: 0, z: 3}, {x: 1, z: 3}, {x: 2, z: 3}, {x: 3, z: 3}, {x: 4, z: 3},
        {x: 5, z: 3}, {x: 6, z: 3}, {x: 7, z: 3},
        {x: 7, z: 4}, {x: 7, z: 5}, {x: 7, z: 6},
        {x: 8, z: 6}, {x: 9, z: 6}, {x: 10, z: 6}, {x: 11, z: 6}, {x: 12, z: 6},
        {x: 13, z: 6}, {x: 14, z: 6}, {x: 15, z: 6},
        {x: 15, z: 7}, {x: 15, z: 8}, {x: 15, z: 9},
        {x: 16, z: 9}, {x: 17, z: 9}, {x: 18, z: 9}, {x: 19, z: 9}, {x: 20, z: 9},
        {x: 21, z: 9}, {x: 22, z: 9}, {x: 23, z: 9}, {x: 24, z: 9}, {x: 25, z: 9},
        {x: 26, z: 9}, {x: 27, z: 9}, {x: 28, z: 9}, {x: 29, z: 9}, {x: 30, z: 9},
        {x: 31, z: 9}, {x: 32, z: 9}, {x: 33, z: 9}, {x: 34, z: 9}, {x: 35, z: 9},
        {x: 36, z: 9}, {x: 37, z: 9}, {x: 38, z: 9}
    ],
    
    // Level specific settings
    settings: {
        startingMoney: 250,
        startingHealth: 25,
        waveDelay: 8000,
        enemySpawnDelay: 600
    },
    
    // Victory conditions
    victory: {
        surviveAllWaves: true,
        minimumHealth: 1
    },
    
    // Rewards for completing level
    rewards: {
        money: 500,
        experience: 250,
        unlocks: ['level4'] // Unlocks next level
    },
    
    // Audio files for this level
    audio: {
        backgroundMusic: 'audio/level3_bg.mp3',
        ambientSound: 'audio/mountain_ambient.mp3'
    },
    
    // Visual effects for this level
    visual: {
        skyColor: 0x4682B4,
        fogColor: 0x708090,
        lightingIntensity: 1.2,
        particleEffects: true
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level3;
} else {
    window.Level3 = Level3;
}