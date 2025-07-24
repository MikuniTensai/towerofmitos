// Tower of Mitos - 3D Tower Defense Game

// Game variables
let scene, camera, renderer, raycaster, mouse;
let gameMap, enemies, towers, projectiles;
let gameState = {
    health: 10,
    money: 100,
    score: 0,
    wave: 1,
    enemiesAlive: 0,
    gameRunning: true,
    waveActive: false,
    startPos: { x: 1, z: 1 },
    finishPos: { x: 38, z: 1 }
};

// Modular systems
let towerSystem;
let enemySystem;
let audioManager;
let visualManager;
let saveSystem;
let mobileControls;
let currentLevel;
let lastTime = 0;

// Camera perspective variables
let currentViewIndex = 0;
let cameraViews = [];
let originalCameraPosition = null;
let originalCameraRotation = null;

// Function to return to main menu
function returnToMainMenu() {
    if (typeof menuSystem !== 'undefined' && menuSystem) {
        // Stop the game loop
        gameState.gameRunning = false;
        
        // Hide the game container
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
        
        // Show the menu
        menuSystem.returnToMenu();
    }
}

// Initialize level after DOM is loaded
function initializeLevel() {
    // Initialize EnemySystem first to get enemy types
    if (typeof EnemySystem !== 'undefined') {
        enemySystem = new EnemySystem();
    }
    
    // Check if a specific level is selected from menu
    if (typeof menuSystem !== 'undefined' && menuSystem && menuSystem.selectedLevel) {
        const selectedLevel = menuSystem.selectedLevel;
        if (selectedLevel === 'tutorial' && typeof TutorialLevel !== 'undefined') {
            currentLevel = TutorialLevel;
            console.log('Tutorial level loaded successfully:', currentLevel);
        } else if (selectedLevel === 'level1' && typeof Level1 !== 'undefined') {
            currentLevel = Level1;
            console.log('Level1 loaded successfully:', currentLevel);
        } else if (selectedLevel === 'level2' && typeof Level2 !== 'undefined') {
            currentLevel = Level2;
            console.log('Level2 loaded successfully:', currentLevel);
        } else if (selectedLevel === 'level3' && typeof Level3 !== 'undefined') {
            currentLevel = Level3;
            console.log('Level3 loaded successfully:', currentLevel);
        } else {
            currentLevel = Level1; // Fallback to Level1
            console.log('Fallback to Level1:', currentLevel);
        }
    } else if (typeof Level1 !== 'undefined') {
        currentLevel = Level1;
        console.log('Level1 loaded successfully:', currentLevel);
    } else {
        // Integrate enemy types from EnemySystem if available
        const enemyTypes = enemySystem ? enemySystem.getEnemyTypes() : {
            tuyul: {
                health: 100,
                speed: 0.015,
                reward: 10,
                color: 0xFF4500,
                size: 0.3
            }
        };
        console.error('Level1 not found, using fallback');
        // Fallback level configuration
        currentLevel = {
            enemies: {
                types: {
                    tuyul: {
                        health: 100,
                        speed: 0.015,
                        reward: 10,
                        color: 0xFF4500,
                        size: 0.3
                    }
                }
            },
            waves: [
                {
                    waveNumber: 1,
                    totalEnemies: 5,
                    spawnInterval: 1000,
                    enemies: [{ type: 'tuyul', count: 5 }]
                }
            ],
            mapLayout: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                ['S',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'F',1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ],
            enemyPath: [
                {x: 0, z: 1}, {x: 1, z: 1}, {x: 2, z: 1}, {x: 3, z: 1}, {x: 4, z: 1},
                {x: 5, z: 1}, {x: 6, z: 1}, {x: 7, z: 1}, {x: 8, z: 1}, {x: 9, z: 1},
                {x: 10, z: 1}, {x: 11, z: 1}, {x: 12, z: 1}, {x: 13, z: 1}, {x: 14, z: 1},
                {x: 15, z: 1}, {x: 16, z: 1}, {x: 17, z: 1}, {x: 18, z: 1}, {x: 19, z: 1},
                {x: 20, z: 1}, {x: 21, z: 1}, {x: 22, z: 1}, {x: 23, z: 1}, {x: 24, z: 1},
                {x: 25, z: 1}, {x: 26, z: 1}, {x: 27, z: 1}, {x: 28, z: 1}, {x: 29, z: 1},
                {x: 30, z: 1}, {x: 31, z: 1}, {x: 32, z: 1}, {x: 33, z: 1}, {x: 34, z: 1},
                {x: 35, z: 1}, {x: 36, z: 1}, {x: 37, z: 1}, {x: 38, z: 1}
            ],
            visual: {
                skyColor: 0x87CEEB,
                fogColor: 0x87CEEB
            },
            availableTowers: ['basic'],
            name: 'Fallback Level'
        };
    }
    
    // Integrate EnemySystem with loaded level
    if (enemySystem && currentLevel) {
        // If level has availableEnemyTypes, populate enemies from EnemySystem
        if (currentLevel.availableEnemyTypes && currentLevel.difficultyMultiplier) {
            const enemyTypes = {};
            currentLevel.availableEnemyTypes.forEach(type => {
                const enemyStats = enemySystem.getEnemyStats(type, 1, currentLevel.difficultyMultiplier);
                if (enemyStats) {
                    enemyTypes[type] = enemyStats;
                }
            });
            
            // Create enemies object if it doesn't exist
            if (!currentLevel.enemies) {
                currentLevel.enemies = {};
            }
            currentLevel.enemies.types = enemyTypes;
            
            console.log('Enemy types populated from EnemySystem:', enemyTypes);
        }
    }
}

// Use level configuration (will be set after initialization)
let mapLayout, enemyPath;

// Initialize modular systems
function initializeSystems() {
    towerSystem = new TowerSystem();
    enemySystem = new EnemySystem();
    audioManager = new AudioManager();
    saveSystem = new SaveSystem();
    
    // Load audio pack
    audioManager.loadAudioPack(DefaultAudioPack).catch(e => {
        console.warn('Failed to load audio pack:', e);
    });
    
    // Apply saved settings
    const savedData = saveSystem.getGameData();
    if (savedData.settings) {
        audioManager.setMasterVolume(savedData.settings.masterVolume);
        audioManager.setSFXVolume(savedData.settings.sfxVolume);
        audioManager.setMusicVolume(savedData.settings.musicVolume);
        audioManager.setEnabled(savedData.settings.audioEnabled);
    }
}

// Initialize game
function init() {
    // Reset game state completely
    gameState = {
        health: 10,
        money: 100,
        score: 0,
        wave: 1,
        enemiesAlive: 0,
        gameRunning: true,
        waveActive: false,
        startPos: { x: 0, z: 7 },
        finishPos: { x: 38, z: 7 }
    };
    
    // Clear arrays
    if (typeof enemies !== 'undefined') enemies.length = 0;
    if (typeof towers !== 'undefined') towers.length = 0;
    if (typeof projectiles !== 'undefined') projectiles.length = 0;
    
    // Initialize level configuration first
    initializeLevel();
    
    // Set map layout and enemy path from level
    mapLayout = currentLevel.mapLayout;
    enemyPath = currentLevel.enemyPath;
    
    // Update game state based on level settings
    if (currentLevel.settings) {
        gameState.health = currentLevel.settings.startingHealth || 10;
        gameState.money = currentLevel.settings.startingMoney || 100;
    }
    
    // Set start and finish positions from enemy path
    if (currentLevel.enemyPath && currentLevel.enemyPath.length > 0) {
        gameState.startPos = currentLevel.enemyPath[0];
        gameState.finishPos = currentLevel.enemyPath[currentLevel.enemyPath.length - 1];
    }
    
    // Load quality settings
    GameConfig.utils.loadQuality();
    const qualitySettings = GameConfig.utils.getCurrentQuality();
    
    // Initialize modular systems
    initializeSystems();
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(currentLevel.visual.skyColor || 0x87CEEB);
    
    // Add fog for depth based on quality settings
    if (qualitySettings.fog) {
        scene.fog = new THREE.Fog(currentLevel.visual.fogColor || 0x87CEEB, 10, 50);
    }

    // Create top-down camera for full horizontal map view
    const mapWidth = 40;
    const mapHeight = 15;
    const scale = Math.max(mapWidth / (window.innerWidth / window.innerHeight), mapHeight) / 2;
    
    camera = new THREE.OrthographicCamera(
        -mapWidth / 2, mapWidth / 2,
        mapHeight / 2, -mapHeight / 2,
        0.1, 1000
    );
    camera.position.set(mapWidth / 2, 30, mapHeight / 2);
    camera.lookAt(mapWidth / 2, 0, mapHeight / 2);
    
    // Store original camera position and rotation for perspective toggle
    originalCameraPosition = camera.position.clone();
    originalCameraRotation = camera.rotation.clone();
    
    // Define multiple camera views
    cameraViews = [
        {
            name: "Top-Down",
            position: { x: mapWidth / 2, y: 30, z: mapHeight / 2 },
            lookAt: { x: mapWidth / 2, y: 0, z: mapHeight / 2 },
            icon: "📷"
        },
        {
            name: "3D Perspective",
            position: { x: mapWidth / 2 - 15, y: 20, z: mapHeight / 2 + 10 },
            lookAt: { x: mapWidth / 2, y: 0, z: mapHeight / 2 },
            icon: "🎮"
        },
        {
            name: "Isometric",
            position: { x: mapWidth / 2 + 20, y: 25, z: mapHeight / 2 + 20 },
            lookAt: { x: mapWidth / 2, y: 0, z: mapHeight / 2 },
            icon: "📐"
        },
        {
            name: "Side View",
            position: { x: mapWidth / 2, y: 15, z: mapHeight / 2 + 25 },
            lookAt: { x: mapWidth / 2, y: 0, z: mapHeight / 2 },
            icon: "👁️"
        },
        {
            name: "Bird's Eye",
            position: { x: mapWidth / 2, y: 40, z: mapHeight / 2 },
            lookAt: { x: mapWidth / 2, y: 0, z: mapHeight / 2 },
            icon: "🦅"
        },
        {
            name: "Close-up",
            position: { x: mapWidth / 2 - 8, y: 12, z: mapHeight / 2 + 5 },
            lookAt: { x: mapWidth / 2, y: 0, z: mapHeight / 2 },
            icon: "🔍"
        }
    ];

    // Create renderer with quality settings
    renderer = new THREE.WebGLRenderer({ antialias: qualitySettings.antialiasing });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(qualitySettings.pixelRatio);
    renderer.shadowMap.enabled = qualitySettings.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // Create raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Add lighting with quality settings
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4 * qualitySettings.lightIntensity);
    scene.add(ambientLight);

    // Position directional light at center of camera view
    const directionalLight = new THREE.DirectionalLight(0xffffff, qualitySettings.lightIntensity);
    directionalLight.position.set(mapWidth / 2, 20, mapHeight / 2 + 10);
    directionalLight.target.position.set(mapWidth / 2, 0, mapHeight / 2);
    directionalLight.castShadow = qualitySettings.shadows;
    directionalLight.shadow.mapSize.width = qualitySettings.shadowMapSize;
    directionalLight.shadow.mapSize.height = qualitySettings.shadowMapSize;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -mapWidth / 2;
    directionalLight.shadow.camera.right = mapWidth / 2;
    directionalLight.shadow.camera.top = mapHeight / 2;
    directionalLight.shadow.camera.bottom = -mapHeight / 2;
    scene.add(directionalLight);
    scene.add(directionalLight.target);
    
    // Add point light at center for more dynamic lighting (no shadow to avoid double shadows)
    const pointLight = new THREE.PointLight(0xffffff, 0.5 * qualitySettings.lightIntensity, 30);
    pointLight.position.set(mapWidth / 2, 15, mapHeight / 2);
    pointLight.castShadow = false; // Disable shadow to prevent double shadows
    scene.add(pointLight);

    // Initialize game objects
    gameMap = [];
    enemies = [];
    towers = [];
    projectiles = [];

    // Initialize visual manager after scene is created
    visualManager = new VisualManager(scene);

    createMap();
    setupEventListeners();
    
    // Initialize camera controls for all devices
    // Create game object with necessary functions for camera controls
    const gameObject = {
        placeTower: placeTower,
        setSelectedTowerType: setSelectedTowerType,
        scene: scene,
        mapLayout: mapLayout
    };
    mobileControls = new MobileControls(renderer, camera, gameObject);
    
    // Only create mobile UI if on mobile device
    if (GameConfig.utils.isMobile()) {
        // Mobile UI is already created in MobileControls constructor
    }
    
    updateUI();
    autoStartGame(); // Start first wave automatically
    animate();
}

// Create 3D map
function createMap() {
    for (let z = 0; z < mapLayout.length; z++) {
        gameMap[z] = [];
        for (let x = 0; x < mapLayout[z].length; x++) {
            const cell = mapLayout[z][x];
            let geometry, material, mesh;

            switch (cell) {
                case 1: // Wall (low like floor)
                    geometry = new THREE.BoxGeometry(1, 0.2, 1);
                    material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(x, 0.1, z);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);
                    gameMap[z][x] = { type: 'wall', mesh: mesh };
                    break;

                case 0: // Path
                    geometry = new THREE.PlaneGeometry(1, 1);
                    material = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.rotation.x = -Math.PI / 2;
                    mesh.position.set(x, 0, z);
                    mesh.receiveShadow = true;
                    scene.add(mesh);
                    gameMap[z][x] = { type: 'path', mesh: mesh };
                    break;

                case 2: // Tower placement
                    geometry = new THREE.PlaneGeometry(1, 1);
                    material = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.rotation.x = -Math.PI / 2;
                    mesh.position.set(x, 0, z);
                    mesh.receiveShadow = true;
                    mesh.userData = { x: x, z: z, type: 'towerSlot' };
                    scene.add(mesh);
                    gameMap[z][x] = { type: 'towerSlot', mesh: mesh, hasTower: false };
                    break;

                case 'S': // Start
                    geometry = new THREE.BoxGeometry(1, 0.1, 1);
                    material = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(x, 0.05, z);
                    mesh.receiveShadow = true;
                    scene.add(mesh);
                    gameMap[z][x] = { type: 'start', mesh: mesh };
                    // Store start position
                    gameState.startPos = { x: x, z: z };
                    break;

                case 'F': // Finish
                    geometry = new THREE.BoxGeometry(1, 0.1, 1);
                    material = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(x, 0.05, z);
                    mesh.receiveShadow = true;
                    scene.add(mesh);
                    gameMap[z][x] = { type: 'finish', mesh: mesh };
                    // Store finish position
                    gameState.finishPos = { x: x, z: z };
                    break;
            }
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    
    // Mouse wheel for desktop zoom
    renderer.domElement.addEventListener('wheel', onMouseWheel, { passive: false });
    
    // Keyboard controls for desktop
    window.addEventListener('keydown', onKeyDown);
    
    // Start wave button
    const startWaveBtn = document.getElementById('start-wave');
    if (startWaveBtn) {
        startWaveBtn.addEventListener('click', startWave);
    }
    
    // Add close modal event listener
    const closeModalBtn = document.getElementById('close-tower-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideTowerSelectionModal);
    }
    
    // Add tower upgrade modal event listeners
    const upgradeBtn = document.getElementById('upgrade-tower-btn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', upgradeTower);
    }
    
    const destroyBtn = document.getElementById('destroy-tower-btn');
    if (destroyBtn) {
        destroyBtn.addEventListener('click', destroyTower);
    }
    
    const closeUpgradeModalBtn = document.getElementById('close-upgrade-modal');
    if (closeUpgradeModalBtn) {
        closeUpgradeModalBtn.addEventListener('click', hideTowerUpgradeModal);
    }
    
    // Mobile controls
    if (GameConfig.utils.isMobile()) {
        setupMobileEventListeners();
    }
}

// Setup mobile event listeners
function setupMobileEventListeners() {
    // Touch events for mobile
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: false });
}

// Touch event handlers
function onTouchStart(event) {
    event.preventDefault();
    if (mobileControls) {
        mobileControls.onTouchStart(event);
    }
}

function onTouchMove(event) {
    event.preventDefault();
    if (mobileControls) {
        mobileControls.onTouchMove(event);
    }
}

function onTouchEnd(event) {
    event.preventDefault();
    if (mobileControls) {
        mobileControls.onTouchEnd(event);
    }
}

// Handle window resize
function onWindowResize() {
    // Update orthographic camera to maintain map visibility
    const mapWidth = 40;
    const mapHeight = 15;
    const aspect = window.innerWidth / window.innerHeight;
    
    if (aspect > mapWidth / mapHeight) {
        // Screen is wider than map ratio
        const width = mapHeight * aspect;
        camera.left = -width / 2;
        camera.right = width / 2;
        camera.top = mapHeight / 2;
        camera.bottom = -mapHeight / 2;
    } else {
        // Screen is taller than map ratio
        const height = mapWidth / aspect;
        camera.left = -mapWidth / 2;
        camera.right = mapWidth / 2;
        camera.top = height / 2;
        camera.bottom = -height / 2;
    }
    
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    
    // Ensure canvas fills entire screen
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
}

// Handle mouse clicks
function onMouseClick(event) {
    if (!gameState.gameRunning) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData && object.userData.type === 'towerSlot') {
            // Show tower selection modal instead of placing tower directly
            showTowerSelectionModal(object.userData.x, object.userData.z);
        } else if (object.userData && object.userData.type === 'tower') {
            // Show tower upgrade modal for existing tower
            showTowerUpgradeModal(object.userData.x, object.userData.z);
        }
    }
}

// Handle mouse wheel for desktop zoom
function onMouseWheel(event) {
    event.preventDefault();
    
    if (mobileControls) {
        // Use mobile controls zoom functionality
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        mobileControls.zoomCamera(zoomFactor);
    }
}

// Handle keyboard input for desktop camera controls
function onKeyDown(event) {
    if (!gameState.gameRunning) return;
    
    if (mobileControls) {
        const panAmount = 2; // Adjust pan sensitivity
        
        switch(event.code) {
            case 'ArrowUp':
            case 'KeyW':
                mobileControls.panCamera(0, panAmount);
                break;
            case 'ArrowDown':
            case 'KeyS':
                mobileControls.panCamera(0, -panAmount);
                break;
            case 'ArrowLeft':
            case 'KeyA':
                mobileControls.panCamera(panAmount, 0);
                break;
            case 'ArrowRight':
            case 'KeyD':
                mobileControls.panCamera(-panAmount, 0);
                break;
        }
    }
}

// Show tower selection modal
function showTowerSelectionModal(x, z) {
    const modal = document.getElementById('tower-selection-modal');
    if (modal) {
        // Store the position for later use
        modal.dataset.x = x;
        modal.dataset.z = z;
        modal.style.display = 'block';
        
        // Play UI sound
        if (audioManager) {
            audioManager.playSound('uiClick');
        }
    }
}

// Hide tower selection modal
function hideTowerSelectionModal() {
    const modal = document.getElementById('tower-selection-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show tower upgrade modal
function showTowerUpgradeModal(x, z) {
    // Find the tower at this position
    const tower = towers.find(t => t.x === x && t.z === z);
    if (!tower) return;
    
    const modal = document.getElementById('tower-upgrade-modal');
    if (!modal) return;
    
    // Store tower reference for later use
    modal.dataset.towerIndex = towers.indexOf(tower);
    
    // Update modal content
    const title = document.getElementById('tower-upgrade-title');
    const currentStats = document.getElementById('tower-current-stats');
    const upgradeSection = document.getElementById('upgrade-section');
    const upgradeStats = document.getElementById('upgrade-stats');
    const upgradeCost = document.getElementById('upgrade-cost');
    const upgradeBtn = document.getElementById('upgrade-tower-btn');
    
    if (title) {
        title.textContent = `${towerSystem.towerTypes[tower.type].name} (Level ${tower.level})`;
    }
    
    if (currentStats) {
        currentStats.innerHTML = `
            <strong>Current Stats:</strong><br>
            Damage: ${tower.damage}<br>
            Range: ${tower.range.toFixed(1)}<br>
            Fire Rate: ${tower.fireRate}ms
        `;
    }
    
    // Check if tower can be upgraded
    const cost = towerSystem.getUpgradeCost(tower);
    if (cost !== null && tower.level <= 3) {
        const upgradeData = towerSystem.upgradeSystem[tower.type][tower.level - 1];
        if (upgradeSection) upgradeSection.style.display = 'block';
        if (upgradeStats) {
            upgradeStats.innerHTML = `
                <strong>After Upgrade:</strong><br>
                Damage: ${tower.damage + upgradeData.damageBonus}<br>
                ${upgradeData.rangeBonus ? `Range: ${(tower.range + upgradeData.rangeBonus).toFixed(1)}<br>` : ''}
                ${upgradeData.slowBonus ? `Slow Effect: ${((tower.slowEffect + upgradeData.slowBonus) * 100).toFixed(0)}%<br>` : ''}
                ${upgradeData.splashBonus ? `Splash Radius: ${(tower.splashRadius + upgradeData.splashBonus).toFixed(1)}<br>` : ''}
            `;
        }
        if (upgradeCost) upgradeCost.textContent = cost;
        if (upgradeBtn) {
            upgradeBtn.style.display = 'inline-block';
            upgradeBtn.disabled = gameState.money < cost;
            upgradeBtn.style.background = gameState.money < cost ? '#666' : '#4169E1';
        }
    } else {
        if (upgradeSection) upgradeSection.style.display = 'none';
    }
    
    // Create backdrop if it doesn't exist
    let backdrop = document.getElementById('modal-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'modal-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
            display: none;
            pointer-events: none;
        `;
        document.body.appendChild(backdrop);
        
        // Add click handler to close modal when clicking backdrop
        backdrop.addEventListener('click', hideTowerUpgradeModal);
    }
    
    backdrop.style.display = 'block';
    modal.style.display = 'block';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    
    console.log('Tower upgrade modal should be visible now:', modal.style.display);
    console.log('Modal element:', modal);
    console.log('Modal computed style:', window.getComputedStyle(modal));
    
    // Play UI sound
    if (audioManager) {
        audioManager.playSound('uiClick');
    }
}

// Hide tower upgrade modal
function hideTowerUpgradeModal() {
    const modal = document.getElementById('tower-upgrade-modal');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (backdrop) {
        backdrop.style.display = 'none';
    }
}

// Upgrade tower
function upgradeTower() {
    const modal = document.getElementById('tower-upgrade-modal');
    if (!modal || !modal.dataset.towerIndex) return;
    
    const towerIndex = parseInt(modal.dataset.towerIndex);
    const tower = towers[towerIndex];
    if (!tower) return;
    
    const cost = towerSystem.getUpgradeCost(tower);
    if (cost === null || gameState.money < cost || tower.level > 3) return;
    
    // Deduct money and upgrade tower
    gameState.money -= cost;
    const actualCost = towerSystem.upgradeTower(tower, scene);
    
    // Play upgrade sound
    if (audioManager) {
        audioManager.playSound('towerPlace'); // Reuse tower place sound
    }
    
    // Update statistics
    if (saveSystem) {
        const progress = saveSystem.getGameData().progress;
        progress.towersUpgraded = (progress.towersUpgraded || 0) + 1;
        saveSystem.saveProgress(progress);
    }
    
    updateUI();
    hideTowerUpgradeModal();
}

// Destroy tower
function destroyTower() {
    const modal = document.getElementById('tower-upgrade-modal');
    if (!modal || !modal.dataset.towerIndex) return;
    
    const towerIndex = parseInt(modal.dataset.towerIndex);
    const tower = towers[towerIndex];
    if (!tower) return;
    
    // Remove tower from scene
    scene.remove(tower.mesh);
    scene.remove(tower.cannon);
    
    // Remove tower from arrays and map
    towers.splice(towerIndex, 1);
    gameMap[tower.z][tower.x].hasTower = false;
    
    // Refund 50% of tower cost
    const towerInfo = towerSystem.getTowerInfo(tower.type);
    const refund = Math.floor(towerInfo.cost * 0.5);
    gameState.money += refund;
    
    // Play destroy sound
    if (audioManager) {
        audioManager.playSound('enemyDeath'); // Reuse enemy death sound
    }
    
    updateUI();
    hideTowerUpgradeModal();
}

// Place tower from modal selection
function placeTowerFromModal(towerType) {
    const modal = document.getElementById('tower-selection-modal');
    if (modal && modal.dataset.x && modal.dataset.z) {
        const x = parseInt(modal.dataset.x);
        const z = parseInt(modal.dataset.z);
        
        // Check if tower type is available in current level
        const availableTowers = currentLevel.availableTowers || ['basic'];
        if (availableTowers.includes(towerType)) {
            placeTower(x, z, towerType);
        } else {
            console.warn('Tower type not available in this level:', towerType);
            placeTower(x, z, 'basic'); // Fallback to basic tower
        }
        
        // Hide modal after placing tower
        hideTowerSelectionModal();
    }
}

// Place tower
function placeTower(x, z, towerType = 'basic') {
    if (gameMap[z][x].hasTower) return;
    
    // Check if player has enough money
    const towerInfo = towerSystem.getTowerInfo(towerType);
    if (!towerInfo || gameState.money < towerInfo.cost) return;

    // Create tower using tower system
    const tower = towerSystem.createTower(towerType, x, z, scene);
    if (!tower) return;

    towers.push(tower);
    gameMap[z][x].hasTower = true;

    // Deduct money
    gameState.money -= towerInfo.cost;
    
    // Play sound effect
    if (audioManager) {
        audioManager.playSound('towerPlace');
    }
    
    // Update statistics
    if (saveSystem) {
        const progress = saveSystem.getGameData().progress;
        progress.towersBuilt = (progress.towersBuilt || 0) + 1;
        saveSystem.saveProgress(progress);
    }
    
    updateUI();
}

// Create enemy
function createEnemy(enemyType = 'tuyul') {
    // Ensure currentLevel is defined and has enemy types
    if (!currentLevel || !currentLevel.enemies || !currentLevel.enemies.types) {
        console.error('Level configuration not loaded properly:', {
            currentLevel: !!currentLevel,
            enemies: currentLevel ? !!currentLevel.enemies : false,
            types: currentLevel && currentLevel.enemies ? !!currentLevel.enemies.types : false
        });
        return;
    }
    
    console.log('Creating enemy:', enemyType, 'Available types:', Object.keys(currentLevel.enemies.types));
    const enemyConfig = currentLevel.enemies.types[enemyType] || currentLevel.enemies.types.tuyul;
    
    if (!enemyConfig) {
        console.error('Enemy config not found for type:', enemyType);
        return;
    }
    
    // Create enemy based on type
    if (enemyType === 'tuyul') {
        createTuyulEnemy(enemyConfig);
    } else if (enemyType === 'jalangkung') {
        return createJalangkungEnemy(enemyConfig);
    } else if (enemyType === 'genderuwo') {
        return createGenderuwoEnemy(enemyConfig);
    } else if (enemyType === 'lembusura') {
        return createLembusuraEnemy(enemyConfig);
    } else if (enemyType === 'kuntilanak') {
        return createKuntilanakEnemy(enemyConfig);
    } else if (enemyType === 'ratu laut neraka') {
        return createRatuLautNerakaEnemy(enemyConfig);
    } else if (enemyType === 'mbok dukun pikun') {
        return createMbokDukunPikunEnemy(enemyConfig);
    } else if (enemyType === 'orang bunian') {
        return createOrangBunianEnemy(enemyConfig);
    } else if (enemyType === 'roh tanah bangkit') {
        return createRohTanahBangkitEnemy(enemyConfig);
    } else {
        // Fallback to sphere geometry for other enemy types
        const geometry = new THREE.SphereGeometry(enemyConfig.size || 0.3, 8, 6);
        const material = new THREE.MeshLambertMaterial({ color: enemyConfig.color || 0xFF4500 });
        const enemy = new THREE.Mesh(geometry, material);
        enemy.position.set(gameState.startPos.x, enemyConfig.size || 0.3, gameState.startPos.z);
        enemy.castShadow = true;
        scene.add(enemy);

        // Add health bar
        const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
        const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
        healthBar.position.set(0, 0.8, 0);
        healthBar.lookAt(camera.position);
        enemy.add(healthBar);

        const enemyData = {
            mesh: enemy,
            healthBar: healthBar,
            health: enemyConfig.health,
            maxHealth: enemyConfig.health,
            speed: enemyConfig.speed,
            pathIndex: 0,
            progress: 0,
            alive: true,
            type: enemyType,
            reward: enemyConfig.reward,
            effects: {}
        };

        enemies.push(enemyData);
        gameState.enemiesAlive++;
        
        // Play spawn sound
        if (audioManager) {
            audioManager.playSound('enemySpawn');
        }
        
        updateUI();
    }
}

// Create Tuyul enemy with FBX models
function createTuyulEnemy(enemyConfig) {
    const loader = new THREE.FBXLoader();
    
    // Load T-Pose model first (with skin)
    loader.load('js/enemy/tuyul/T-Pose.fbx', function(tPoseModel) {
        // Load Walk animation model (without skin)
        loader.load('js/enemy/tuyul/Walk.fbx', function(walkModel) {
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('js/enemy/tuyul/texture.jpg', function(texture) {
                // Set up the main model (T-Pose with skin)
                const enemy = tPoseModel;
                enemy.scale.setScalar(1); // Set scale to 1 as requested
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                // Apply texture to all materials
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.map = texture;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Set up animation mixer
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                // Extract walk animation from walk model
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                scene.add(enemy);
                
                // Add health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0); // Position above the model
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'tuyul',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer, // Store animation mixer
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully
                
                // Play spawn sound
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
                
            }, function(progress) {
                console.log('Texture loading progress:', progress);
            }, function(error) {
                console.error('Error loading texture:', error);
                // Continue without texture
                setupEnemyWithoutTexture();
            });
            
            function setupEnemyWithoutTexture() {
                 const enemy = tPoseModel;
                 enemy.scale.setScalar(1);
                 enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                 enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                 enemy.castShadow = true;
                 enemy.receiveShadow = true;
                
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                scene.add(enemy);
                
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0);
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'tuyul',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully (no texture)
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            }
            
        }, function(progress) {
            console.log('Walk model loading progress:', progress);
        }, function(error) {
            console.error('Error loading walk model:', error);
            // Fallback to basic sphere if FBX loading fails
            createBasicTuyulEnemy(enemyConfig);
        });
        
    }, function(progress) {
        console.log('T-Pose model loading progress:', progress);
    }, function(error) {
        console.error('Error loading T-Pose model:', error);
        // Fallback to basic sphere if FBX loading fails
        createBasicTuyulEnemy(enemyConfig);
    });
}

// Fallback function for tuyul enemy if FBX loading fails
function createBasicTuyulEnemy(enemyConfig) {
    const geometry = new THREE.SphereGeometry(enemyConfig.size || 0.3, 8, 6);
    const material = new THREE.MeshLambertMaterial({ color: enemyConfig.color || 0xFF4500 });
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(gameState.startPos.x, enemyConfig.size || 0.3, gameState.startPos.z);
    enemy.castShadow = true;
    scene.add(enemy);

    const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(0, 0.8, 0);
    healthBar.lookAt(camera.position);
    enemy.add(healthBar);

    const enemyData = {
        mesh: enemy,
        healthBar: healthBar,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        speed: enemyConfig.speed,
        pathIndex: 0,
        progress: 0,
        alive: true,
        type: 'tuyul',
        reward: enemyConfig.reward,
        effects: {}
    };

    enemies.push(enemyData);
    gameState.enemiesAlive++;
    
    // Basic enemy created successfully
    
    if (audioManager) {
        audioManager.playSound('enemySpawn');
    }
    
    updateUI();
}

// Create Jalangkung enemy with FBX models
function createJalangkungEnemy(enemyConfig) {
    const loader = new THREE.FBXLoader();
    
    // Load T-Pose model first (with skin)
    loader.load('js/enemy/jalangkung/T-Pose.fbx', function(tPoseModel) {
        // Load Walk animation model (without skin)
        loader.load('js/enemy/jalangkung/Walk.fbx', function(walkModel) {
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('js/enemy/jalangkung/texture.jpg', function(texture) {
                // Set up the main model (T-Pose with skin)
                const enemy = tPoseModel;
                enemy.scale.setScalar(1); // Set scale to 1 as requested
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                // Apply texture to all materials
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.map = texture;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Set up animation
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                scene.add(enemy);
                
                // Add health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0); // Position above the enemy
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                // Create enemy data object
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'jalangkung',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer, // Store animation mixer
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully
                
                // Play spawn sound
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
                
            }, function(progress) {
                console.log('Texture loading progress:', progress);
            }, function(error) {
                console.error('Error loading texture:', error);
                // Continue without texture
                setupJalangkungWithoutTexture();
            });
            
            function setupJalangkungWithoutTexture() {
                const enemy = tPoseModel;
                enemy.scale.setScalar(1);
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                scene.add(enemy);
                
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0);
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'jalangkung',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully (no texture)
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            }
            
        }, function(progress) {
            console.log('Walk model loading progress:', progress);
        }, function(error) {
            console.error('Error loading walk model:', error);
            // Fallback to basic sphere if FBX loading fails
            createBasicJalangkungEnemy(enemyConfig);
        });
        
    }, function(progress) {
        console.log('T-Pose model loading progress:', progress);
    }, function(error) {
        console.error('Error loading T-Pose model:', error);
        // Fallback to basic sphere if FBX loading fails
        createBasicJalangkungEnemy(enemyConfig);
    });
}

// Fallback function for jalangkung enemy if FBX loading fails
function createBasicJalangkungEnemy(enemyConfig) {
    const geometry = new THREE.SphereGeometry(enemyConfig.size || 0.25, 8, 6);
    const material = new THREE.MeshLambertMaterial({ color: enemyConfig.color || 0x00FF00 });
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(gameState.startPos.x, enemyConfig.size || 0.25, gameState.startPos.z);
    enemy.castShadow = true;
    scene.add(enemy);

    const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(0, 0.8, 0);
    healthBar.lookAt(camera.position);
    enemy.add(healthBar);

    const enemyData = {
        mesh: enemy,
        healthBar: healthBar,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        speed: enemyConfig.speed,
        pathIndex: 0,
        progress: 0,
        alive: true,
        type: 'jalangkung',
        reward: enemyConfig.reward,
        effects: {}
    };

    enemies.push(enemyData);
    gameState.enemiesAlive++;
    
    // Basic enemy created successfully
    
    if (audioManager) {
        audioManager.playSound('enemySpawn');
    }
    
    updateUI();
}

// Create Genderuwo enemy with FBX models
function createGenderuwoEnemy(enemyConfig) {
    const loader = new THREE.FBXLoader();
    
    // Load T-Pose model first (with skin)
    loader.load('js/enemy/genderuwo/T-Pose.fbx', function(tPoseModel) {
        // Load Walk animation model (without skin)
        loader.load('js/enemy/genderuwo/Walk.fbx', function(walkModel) {
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('js/enemy/genderuwo/texture.jpg', function(texture) {
                // Set up the main model (T-Pose with skin)
                const enemy = tPoseModel;
                enemy.scale.setScalar(1); // Set scale to 1 as requested
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                // Apply texture to all materials
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.map = texture;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Set up animation
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                scene.add(enemy);
                
                // Add health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0); // Position above the enemy
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                // Create enemy data object
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'genderuwo',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer, // Store animation mixer
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully
                
                // Play spawn sound
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
                
            }, function(progress) {
                console.log('Texture loading progress:', progress);
            }, function(error) {
                console.error('Error loading texture:', error);
                // Continue without texture
                setupGenderuwoWithoutTexture();
            });
            
            function setupGenderuwoWithoutTexture() {
                const enemy = tPoseModel;
                enemy.scale.setScalar(1);
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                scene.add(enemy);
                
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0);
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'genderuwo',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully (no texture)
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            }
            
        }, function(progress) {
            console.log('Walk model loading progress:', progress);
        }, function(error) {
            console.error('Error loading walk model:', error);
            // Fallback to basic sphere if FBX loading fails
            createBasicGenderuwoEnemy(enemyConfig);
        });
        
    }, function(progress) {
        console.log('T-Pose model loading progress:', progress);
    }, function(error) {
        console.error('Error loading T-Pose model:', error);
        // Fallback to basic sphere if FBX loading fails
        createBasicGenderuwoEnemy(enemyConfig);
    });
}

// Fallback function for genderuwo enemy if FBX loading fails
function createBasicGenderuwoEnemy(enemyConfig) {
    const geometry = new THREE.SphereGeometry(enemyConfig.size || 0.4, 8, 6);
    const material = new THREE.MeshLambertMaterial({ color: enemyConfig.color || 0x8B4513 });
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(gameState.startPos.x, enemyConfig.size || 0.4, gameState.startPos.z);
    enemy.castShadow = true;
    scene.add(enemy);

    const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(0, 0.8, 0);
    healthBar.lookAt(camera.position);
    enemy.add(healthBar);

    const enemyData = {
        mesh: enemy,
        healthBar: healthBar,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        speed: enemyConfig.speed,
        pathIndex: 0,
        progress: 0,
        alive: true,
        type: 'genderuwo',
        reward: enemyConfig.reward,
        effects: {}
    };

    enemies.push(enemyData);
    gameState.enemiesAlive++;
    
    // Basic enemy created successfully
    
    if (audioManager) {
        audioManager.playSound('enemySpawn');
    }
    
    updateUI();
}

// Create Lembusura enemy with FBX models
function createLembusuraEnemy(enemyConfig) {
    const loader = new THREE.FBXLoader();
    
    // Load T-Pose model first (with skin)
    loader.load('js/enemy/lembusura/T-Pose.fbx', function(tPoseModel) {
        // Load Walk animation model (without skin)
        loader.load('js/enemy/lembusura/Walk.fbx', function(walkModel) {
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('js/enemy/lembusura/texture.jpg', function(texture) {
                // Set up the main model (T-Pose with skin)
                const enemy = tPoseModel;
                enemy.scale.setScalar(1); // Set scale to 1 as requested
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                // Apply texture to all materials
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.map = texture;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Set up animation
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                scene.add(enemy);
                
                // Add health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0); // Position above the enemy
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                // Create enemy data object
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'lembusura',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer, // Store animation mixer
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully
                
                // Play spawn sound
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
                
            }, function(progress) {
                console.log('Texture loading progress:', progress);
            }, function(error) {
                console.error('Error loading texture:', error);
                // Continue without texture
                setupLembusuraWithoutTexture();
            });
            
            function setupLembusuraWithoutTexture() {
                const enemy = tPoseModel;
                enemy.scale.setScalar(1);
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                scene.add(enemy);
                
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0);
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'lembusura',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully (no texture)
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            }
            
        }, function(progress) {
            console.log('Walk model loading progress:', progress);
        }, function(error) {
            console.error('Error loading walk model:', error);
            // Fallback to basic sphere if FBX loading fails
            createBasicLembusuraEnemy(enemyConfig);
        });
        
    }, function(progress) {
        console.log('T-Pose model loading progress:', progress);
    }, function(error) {
        console.error('Error loading T-Pose model:', error);
        // Fallback to basic sphere if FBX loading fails
        createBasicLembusuraEnemy(enemyConfig);
    });
}

// Fallback function for lembusura enemy if FBX loading fails
function createBasicLembusuraEnemy(enemyConfig) {
    const geometry = new THREE.SphereGeometry(enemyConfig.size || 0.35, 8, 6);
    const material = new THREE.MeshLambertMaterial({ color: enemyConfig.color || 0x696969 });
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(gameState.startPos.x, enemyConfig.size || 0.35, gameState.startPos.z);
    enemy.castShadow = true;
    scene.add(enemy);

    const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(0, 0.8, 0);
    healthBar.lookAt(camera.position);
    enemy.add(healthBar);

    const enemyData = {
        mesh: enemy,
        healthBar: healthBar,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        speed: enemyConfig.speed,
        pathIndex: 0,
        progress: 0,
        alive: true,
        type: 'lembusura',
        reward: enemyConfig.reward,
        effects: {}
    };

    enemies.push(enemyData);
    gameState.enemiesAlive++;
    
    // Basic enemy created successfully
    
    if (audioManager) {
        audioManager.playSound('enemySpawn');
    }
    
    updateUI();
}

// Create Kuntilanak enemy with FBX models
function createKuntilanakEnemy(enemyConfig) {
    const loader = new THREE.FBXLoader();
    
    // Load T-Pose model first (with skin)
    loader.load('js/enemy/kuntilanak/T-Pose.fbx', function(tPoseModel) {
        // Load Walk animation model (without skin)
        loader.load('js/enemy/kuntilanak/Walk.fbx', function(walkModel) {
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('js/enemy/kuntilanak/texture.jpg', function(texture) {
                // Set up the main model (T-Pose with skin)
                const enemy = tPoseModel;
                enemy.scale.setScalar(1); // Set scale to 1 as requested
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                // Apply texture to all materials
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.map = texture;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                scene.add(enemy);
                
                // Set up animation mixer and actions
                const mixer = new THREE.AnimationMixer(enemy);
                
                // Extract walk animation from the walk model
                let walkAction = null;
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0]; // Use first animation
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                // Create health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0); // Position above the enemy
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'kuntilanak',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully with texture
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            }, function(progress) {
                // Texture loading progress
            }, function(error) {
                console.error('Error loading kuntilanak texture:', error);
                
                // Set up the main model (T-Pose with skin) without texture
                const enemy = tPoseModel;
                enemy.scale.setScalar(1);
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2;
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                scene.add(enemy);
                
                // Set up animation mixer and actions
                const mixer = new THREE.AnimationMixer(enemy);
                
                // Extract walk animation from the walk model
                let walkAction = null;
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                // Create health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 2, 0);
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'kuntilanak',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully (no texture)
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            });
        }, function(progress) {
            // Walk model loading progress
        }, function(error) {
            console.error('Error loading kuntilanak walk model:', error);
            // Fallback to basic enemy if walk model fails
            createBasicKuntilanakEnemy(enemyConfig);
        });
    }, function(progress) {
        // T-Pose model loading progress
    }, function(error) {
        console.error('Error loading kuntilanak T-Pose model:', error);
        // Fallback to basic enemy if T-Pose model fails
        createBasicKuntilanakEnemy(enemyConfig);
    });
}

// Fallback function for kuntilanak enemy if FBX loading fails
function createBasicKuntilanakEnemy(enemyConfig) {
    const geometry = new THREE.SphereGeometry(enemyConfig.size || 0.3, 8, 6);
    const material = new THREE.MeshLambertMaterial({ color: enemyConfig.color || 0x800080 });
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(gameState.startPos.x, enemyConfig.size || 0.3, gameState.startPos.z);
    enemy.castShadow = true;
    scene.add(enemy);

    const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(0, 0.8, 0);
    healthBar.lookAt(camera.position);
    enemy.add(healthBar);

    const enemyData = {
        mesh: enemy,
        healthBar: healthBar,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        speed: enemyConfig.speed,
        pathIndex: 0,
        progress: 0,
        alive: true,
        type: 'kuntilanak',
        reward: enemyConfig.reward,
        effects: {}
    };

    enemies.push(enemyData);
    gameState.enemiesAlive++;
    
    // Basic enemy created successfully
    
    if (audioManager) {
        audioManager.playSound('enemySpawn');
    }
    
    updateUI();
}

// Create Ratu Laut Neraka enemy with FBX model
function createRatuLautNerakaEnemy(enemyConfig) {
    const loader = new THREE.FBXLoader();
    
    // Load T-Pose model
    loader.load('js/enemy/ratu laut neraka/T-Pose.fbx', function(object) {
        // Load texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('js/enemy/ratu laut neraka/texture.jpg', function(texture) {
            // Apply texture to all materials
            object.traverse(function(child) {
                if (child.isMesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Scale and position the model
            object.scale.setScalar((enemyConfig.size || 1)); // Use enemyConfig.size and make it 2x bigger
            object.position.set(gameState.startPos.x, 0, gameState.startPos.z);
            object.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
            
            // Enable shadows
            object.castShadow = true;
            object.receiveShadow = true;
            
            scene.add(object);
            
            // Load Walk animation
            loader.load('js/enemy/ratu laut neraka/Walk.fbx', function(walkObject) {
                const mixer = new THREE.AnimationMixer(object);
                
                if (walkObject.animations && walkObject.animations.length > 0) {
                    const walkAction = mixer.clipAction(walkObject.animations[0]);
                    walkAction.play();
                }
                
                // Create health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 1.5, 0);
                healthBar.lookAt(camera.position);
                object.add(healthBar);
                
                // Create enemy data
                const enemyData = {
                    mesh: object,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'ratu laut neraka',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Play spawn sound
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            }, undefined, function(error) {
                console.error('Error loading Ratu Laut Neraka Walk animation:', error);
                // Create health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 1.5, 0);
                healthBar.lookAt(camera.position);
                object.add(healthBar);
                
                // Create enemy data without animation
                const enemyData = {
                    mesh: object,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'ratu laut neraka',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: null
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Play spawn sound
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            });
            
        }, undefined, function(error) {
            console.error('Error loading Ratu Laut Neraka texture:', error);
            // Continue without texture
            object.scale.setScalar((enemyConfig.size || 0.5) * 2);
            object.position.set(gameState.startPos.x, 0, gameState.startPos.z);
            object.rotation.y = Math.PI / 2;
            object.castShadow = true;
            object.receiveShadow = true;
            scene.add(object);
            
            // Create health bar
            const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
            const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
            const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
            healthBar.position.set(0, 1.5, 0);
            healthBar.lookAt(camera.position);
            object.add(healthBar);
            
            const enemyData = {
                mesh: object,
                healthBar: healthBar,
                health: enemyConfig.health,
                maxHealth: enemyConfig.health,
                speed: enemyConfig.speed,
                pathIndex: 0,
                progress: 0,
                alive: true,
                type: 'ratu laut neraka',
                reward: enemyConfig.reward,
                effects: {},
                mixer: null
            };
            
            enemies.push(enemyData);
            gameState.enemiesAlive++;
            
            // Play spawn sound
            if (audioManager) {
                audioManager.playSound('enemySpawn');
            }
            
            updateUI();
        });
        
    }, undefined, function(error) {
        console.error('Error loading Ratu Laut Neraka FBX model:', error);
        // Fallback to basic enemy
        createBasicRatuLautNerakaEnemy(enemyConfig);
    });
}

// Fallback function for Ratu Laut Neraka enemy
function createBasicRatuLautNerakaEnemy(enemyConfig) {
    const geometry = new THREE.SphereGeometry(enemyConfig.size || 0.5, 8, 6);
    const material = new THREE.MeshLambertMaterial({ color: enemyConfig.color || 0x8B0000 }); // Dark red color
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(gameState.startPos.x, enemyConfig.size || 0.5, gameState.startPos.z);
    enemy.castShadow = true;
    scene.add(enemy);

    const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(0, 0.8, 0);
    healthBar.lookAt(camera.position);
    enemy.add(healthBar);

    const enemyData = {
        mesh: enemy,
        healthBar: healthBar,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        speed: enemyConfig.speed,
        pathIndex: 0,
        progress: 0,
        alive: true,
        type: 'ratu laut neraka',
        reward: enemyConfig.reward,
        effects: {}
    };

    enemies.push(enemyData);
    gameState.enemiesAlive++;
    
    // Basic enemy created successfully
    
    if (audioManager) {
        audioManager.playSound('enemySpawn');
    }
    
    updateUI();
}

// Create Orang Bunian enemy with FBX models
function createOrangBunianEnemy(enemyConfig) {
    const loader = new THREE.FBXLoader();
    
    // Load T-Pose model first (with skin)
    loader.load('js/enemy/orang bunian/T-Pose.fbx', function(tPoseModel) {
        // Load Walk animation model (without skin)
        loader.load('js/enemy/orang bunian/Walk.fbx', function(walkModel) {
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('js/enemy/orang bunian/texture.jpg', function(texture) {
                // Set up the main model (T-Pose with skin)
                const enemy = tPoseModel;
                enemy.scale.setScalar(1); // Set scale to 1 as requested
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                // Apply texture to all materials
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.map = texture;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                scene.add(enemy);
                
                // Load Walk animation
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                // Add health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 0.8, 0);
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'orang bunian',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
                
            }, undefined, function(error) {
                console.error('Error loading Orang Bunian texture:', error);
                // Continue without texture
                const enemy = tPoseModel;
                enemy.scale.setScalar(1);
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2;
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                scene.add(enemy);
                
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                // Add health bar
                const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(0, 0.8, 0);
                healthBar.lookAt(camera.position);
                enemy.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'orang bunian',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully (no texture)
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            });
            
        }, undefined, function(error) {
            console.error('Error loading Orang Bunian Walk animation:', error);
            // Fallback to basic enemy creation
            createBasicOrangBunianEnemy(enemyConfig);
        });
        
    }, undefined, function(error) {
        console.error('Error loading Orang Bunian T-Pose model:', error);
        // Fallback to basic enemy creation
        createBasicOrangBunianEnemy(enemyConfig);
    });
}

// Fallback function for Orang Bunian enemy
function createBasicOrangBunianEnemy(enemyConfig) {
    const geometry = new THREE.SphereGeometry(enemyConfig.size || 0.28, 8, 6);
    const material = new THREE.MeshLambertMaterial({ color: enemyConfig.color || 0x483D8B });
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(gameState.startPos.x, enemyConfig.size || 0.28, gameState.startPos.z);
    enemy.castShadow = true;
    scene.add(enemy);

    const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(0, 0.8, 0);
    healthBar.lookAt(camera.position);
    enemy.add(healthBar);

    const enemyData = {
        mesh: enemy,
        healthBar: healthBar,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        speed: enemyConfig.speed,
        pathIndex: 0,
        progress: 0,
        alive: true,
        type: 'orang bunian',
        reward: enemyConfig.reward,
        effects: {}
    };

    enemies.push(enemyData);
    gameState.enemiesAlive++;
    
    // Basic enemy created successfully
    
    if (audioManager) {
        audioManager.playSound('enemySpawn');
    }
    
    updateUI();
}

// Create Mbok Dukun Pikun enemy with FBX models
function createMbokDukunPikunEnemy(enemyConfig) {
    const loader = new THREE.FBXLoader();
    
    // Load T-Pose model first (with skin)
    loader.load('js/enemy/mbok dukun pikun/T-Pose.fbx', function(tPoseModel) {
        // Load Walk animation model (without skin)
        loader.load('js/enemy/mbok dukun pikun/Walk.fbx', function(walkModel) {
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('js/enemy/mbok dukun pikun/tripo_image_5e8fc9a1-0dbc-49c3-9806-1a8cfa30190f_0.jpg', function(texture) {
                // Set up the main model (T-Pose with skin)
                const enemy = tPoseModel;
                enemy.scale.setScalar(1); // Set scale to 1 as requested
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                // Apply texture to all materials
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.map = texture;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                scene.add(enemy);
                
                // Set up animation mixer
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                // Extract animation from walk model
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                // Create health bar
                const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(enemy.position.x, enemy.position.y + 2, enemy.position.z);
                scene.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'mbok dukun pikun',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
                
            }, undefined, function(error) {
                console.error('Error loading Mbok Dukun Pikun texture:', error);
                // Continue without texture
                const enemy = tPoseModel;
                enemy.scale.setScalar(1);
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2;
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                scene.add(enemy);
                
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(enemy.position.x, enemy.position.y + 2, enemy.position.z);
                scene.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'mbok dukun pikun',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully (no texture)
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            });
            
        }, undefined, function(error) {
            console.error('Error loading Mbok Dukun Pikun Walk animation:', error);
            // Fallback to basic enemy creation
            createBasicMbokDukunPikunEnemy(enemyConfig);
        });
        
    }, undefined, function(error) {
        console.error('Error loading Mbok Dukun Pikun T-Pose model:', error);
        // Fallback to basic enemy creation
        createBasicMbokDukunPikunEnemy(enemyConfig);
    });
}

// Fallback function for Mbok Dukun Pikun enemy
function createBasicMbokDukunPikunEnemy(enemyConfig) {
    const geometry = new THREE.SphereGeometry(0.5, 8, 6);
    const material = new THREE.MeshLambertMaterial({ color: 0x800080 }); // Purple color for boss
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.set(gameState.startPos.x, 0, gameState.startPos.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    scene.add(mesh);
    
    // Create health bar
    const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(mesh.position.x, mesh.position.y + 1, mesh.position.z);
    scene.add(healthBar);
    
    const enemyData = {
        mesh: mesh,
        healthBar: healthBar,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        speed: enemyConfig.speed,
        pathIndex: 0,
        progress: 0,
        alive: true,
        type: 'mbok dukun pikun',
        reward: enemyConfig.reward,
        effects: {}
    };
    
    enemies.push(enemyData);
    gameState.enemiesAlive++;
    
    // Basic enemy created successfully
    
    if (audioManager) {
        audioManager.playSound('enemySpawn');
    }
    
    updateUI();
}

// Create Roh Tanah Bangkit enemy with FBX models
function createRohTanahBangkitEnemy(enemyConfig) {
    const loader = new THREE.FBXLoader();
    
    // Load T-Pose model first (with skin)
    loader.load('js/enemy/roh tanah bangkit/T-Pose.fbx', function(tPoseModel) {
        // Load Walk animation model (without skin)
        loader.load('js/enemy/roh tanah bangkit/Walk.fbx', function(walkModel) {
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('js/enemy/roh tanah bangkit/texture.jpg', function(texture) {
                // Set up the main model (T-Pose with skin)
                const enemy = tPoseModel;
                enemy.scale.setScalar(1); // Set scale to 1 as requested
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                // Apply texture to all materials
                enemy.traverse(function(child) {
                    if (child.isMesh) {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.map = texture;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                scene.add(enemy);
                
                // Set up animation mixer
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                // Extract animation from walk model
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                // Create health bar
                const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(enemy.position.x, enemy.position.y + 2, enemy.position.z);
                scene.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'roh tanah bangkit',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
                
            }, undefined, function(error) {
                console.error('Error loading Roh Tanah Bangkit texture:', error);
                // Continue without texture
                const enemy = tPoseModel;
                enemy.scale.setScalar(1);
                enemy.position.set(gameState.startPos.x, 0, gameState.startPos.z);
                enemy.rotation.y = Math.PI / 2;
                enemy.castShadow = true;
                enemy.receiveShadow = true;
                
                scene.add(enemy);
                
                const mixer = new THREE.AnimationMixer(enemy);
                let walkAction = null;
                
                if (walkModel.animations && walkModel.animations.length > 0) {
                    const walkClip = walkModel.animations[0];
                    walkAction = mixer.clipAction(walkClip);
                    walkAction.play();
                }
                
                const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
                const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
                healthBar.position.set(enemy.position.x, enemy.position.y + 2, enemy.position.z);
                scene.add(healthBar);
                
                const enemyData = {
                    mesh: enemy,
                    healthBar: healthBar,
                    health: enemyConfig.health,
                    maxHealth: enemyConfig.health,
                    speed: enemyConfig.speed,
                    pathIndex: 0,
                    progress: 0,
                    alive: true,
                    type: 'roh tanah bangkit',
                    reward: enemyConfig.reward,
                    effects: {},
                    mixer: mixer,
                    walkAction: walkAction
                };
                
                enemies.push(enemyData);
                gameState.enemiesAlive++;
                
                // Enemy created successfully (no texture)
                
                if (audioManager) {
                    audioManager.playSound('enemySpawn');
                }
                
                updateUI();
            });
            
        }, undefined, function(error) {
            console.error('Error loading Roh Tanah Bangkit Walk animation:', error);
            // Fallback to basic enemy creation
            createBasicRohTanahBangkitEnemy(enemyConfig);
        });
        
    }, undefined, function(error) {
        console.error('Error loading Roh Tanah Bangkit T-Pose model:', error);
        // Fallback to basic enemy creation
        createBasicRohTanahBangkitEnemy(enemyConfig);
    });
}

// Fallback function for Roh Tanah Bangkit enemy
function createBasicRohTanahBangkitEnemy(enemyConfig) {
    const geometry = new THREE.SphereGeometry(enemyConfig.size || 0.35, 8, 6);
    const material = new THREE.MeshLambertMaterial({ color: enemyConfig.color || 0x32CD32 });
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(gameState.startPos.x, enemyConfig.size || 0.35, gameState.startPos.z);
    enemy.castShadow = true;
    scene.add(enemy);

    const healthBarGeometry = new THREE.PlaneGeometry(0.6, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(0, 0.8, 0);
    healthBar.lookAt(camera.position);
    enemy.add(healthBar);

    const enemyData = {
        mesh: enemy,
        healthBar: healthBar,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        speed: enemyConfig.speed,
        pathIndex: 0,
        progress: 0,
        alive: true,
        type: 'roh tanah bangkit',
        reward: enemyConfig.reward,
        effects: {}
    };

    enemies.push(enemyData);
    gameState.enemiesAlive++;
    
    // Basic enemy created successfully
    
    if (audioManager) {
        audioManager.playSound('enemySpawn');
    }
    
    updateUI();
}

// Create explosion effect
function createExplosion(position) {
    // Use quality settings for particle count
    const currentQuality = GameConfig.utils.getCurrentQuality();
    if (!currentQuality.particleEffects) return;
    
    const baseParticleCount = currentQuality.maxParticles <= 20 ? 4 : (currentQuality.maxParticles <= 35 ? 6 : 8);
    const particleCount = Math.min(baseParticleCount, currentQuality.maxParticles / 6);
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 4, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0xFFAA00 });
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.1 + 0.05,
            (Math.random() - 0.5) * 0.2
        );
        particle.life = 30;
        
        scene.add(particle);
        particles.push(particle);
    }
    
    // Animate particles
    const animateParticles = () => {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.position.add(particle.velocity);
            particle.velocity.y -= 0.005; // gravity
            particle.life--;
            
            if (particle.life <= 0) {
                scene.remove(particle);
                particles.splice(i, 1);
            }
        }
        
        if (particles.length > 0) {
            requestAnimationFrame(animateParticles);
        }
    };
    
    animateParticles();
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!enemy.alive) continue;

        // Update health bar to face camera
        enemy.healthBar.lookAt(camera.position);
        
        // Update animation mixer for FBX models
        if (enemy.mixer) {
            enemy.mixer.update(0.016); // Assuming 60fps (1/60 = 0.016)
        }

        // Calculate current speed (apply slow effect)
        let currentSpeed = enemy.speed;
        if (enemy.effects.slow && Date.now() < enemy.effects.slow.endTime) {
            currentSpeed *= enemy.effects.slow.factor;
        } else {
            // Remove expired slow effect
            delete enemy.effects.slow;
        }

        // Move enemy along path
        if (enemy.pathIndex < enemyPath.length - 1) {
            const currentPos = enemyPath[enemy.pathIndex];
            const nextPos = enemyPath[enemy.pathIndex + 1];
            
            enemy.progress += currentSpeed;
            
            if (enemy.progress >= 1) {
                enemy.progress = 0;
                enemy.pathIndex++;
            }
            
            if (enemy.pathIndex < enemyPath.length) {
                const currentTarget = enemy.pathIndex < enemyPath.length - 1 ? enemyPath[enemy.pathIndex + 1] : enemyPath[enemy.pathIndex];
                const currentStart = enemyPath[enemy.pathIndex];
                
                enemy.mesh.position.x = currentStart.x + (currentTarget.x - currentStart.x) * enemy.progress;
                enemy.mesh.position.z = currentStart.z + (currentTarget.z - currentStart.z) * enemy.progress;
            }
        } else {
            // Enemy reached finish
            // Properly dispose of FBX model and animation mixer
            if (enemy.mixer) {
                enemy.mixer.stopAllAction();
                enemy.mixer.uncacheRoot(enemy.mesh);
            }
            
            // Dispose of geometry and materials
            if (enemy.mesh) {
                enemy.mesh.traverse((child) => {
                    if (child.isMesh) {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    if (mat.map) mat.map.dispose();
                                    mat.dispose();
                                });
                            } else {
                                if (child.material.map) child.material.map.dispose();
                                child.material.dispose();
                            }
                        }
                    }
                });
                scene.remove(enemy.mesh);
            }
            
            enemies.splice(i, 1);
            gameState.health--;
            gameState.enemiesAlive--;
            
            // Play damage sound
            if (audioManager) {
                audioManager.playSound('playerDamage');
            }
            
            // Update statistics
            if (saveSystem) {
                const progress = saveSystem.getGameData().progress;
                progress.enemiesEscaped = (progress.enemiesEscaped || 0) + 1;
                saveSystem.saveProgress(progress);
            }
            
            if (gameState.health <= 0) {
                gameOver();
            }
            updateUI();
        }
    }
}

// Update towers
function updateTowers() {
    const currentTime = Date.now();
    
    towers.forEach(tower => {
        // Use tower system for updates if available
        if (towerSystem && towerSystem.updateTower) {
            towerSystem.updateTower(tower, enemies, currentTime);
        } else {
            // Fallback to original tower update logic
            // Rotate tower base slowly (check if mesh exists for FBX towers)
            if (tower.mesh && tower.mesh.rotation) {
                tower.mesh.rotation.y += 0.005;
            }
            
            // Find nearest enemy in range
            let nearestEnemy = null;
            let nearestDistance = Infinity;
            
            enemies.forEach(enemy => {
                if (!enemy.alive) return;
                
                const distance = Math.sqrt(
                    Math.pow(enemy.mesh.position.x - tower.x, 2) +
                    Math.pow(enemy.mesh.position.z - tower.z, 2)
                );
                
                if (distance <= tower.range && distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestEnemy = enemy;
                }
            });
            
            tower.target = nearestEnemy;
            
            // Fire at target if found
            if (tower.target) {
                // Rotate cannon towards target (only if cannon exists)
                if (tower.cannon && tower.cannon.rotation) {
                    const angle = Math.atan2(
                        tower.target.mesh.position.z - tower.z,
                        tower.target.mesh.position.x - tower.x
                    );
                    tower.cannon.rotation.y = angle;
                }
                
                // Fire at target (works for both FBX and basic towers)
                if (currentTime - tower.lastFired > tower.fireRate) {
                    console.log('Tower firing! Type:', tower.type);
                    fireProjectile(tower, tower.target);
                    tower.lastFired = currentTime;
                    
                    // Play tower fire sound
                    if (audioManager) {
                        audioManager.playSound('towerFire');
                    }
                    
                    // Create muzzle flash effect (only if cannon exists)
                    if (visualManager && tower.cannon && tower.cannon.position) {
                        const direction = new THREE.Vector3(
                            tower.target.mesh.position.x - tower.cannon.position.x,
                            tower.target.mesh.position.y - tower.cannon.position.y,
                            tower.target.mesh.position.z - tower.cannon.position.z
                        ).normalize();
                        visualManager.createMuzzleFlash(tower.cannon.position, direction);
                    }
                }
            }
        }
    });
}

// Fire projectile
function fireProjectile(tower, target) {
    const geometry = new THREE.SphereGeometry(0.1, 6, 4);
    const material = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const projectile = new THREE.Mesh(geometry, material);
    projectile.position.set(tower.x, 0.8, tower.z);
    scene.add(projectile);
    
    const projectileData = {
        mesh: projectile,
        target: target,
        speed: 0.3,
        damage: tower.damage,
        towerType: tower.type || 'basic',
        effects: tower.effects || {}
    };
    
    projectiles.push(projectileData);
    
    // Create projectile trail effect
    if (visualManager) {
        visualManager.createTrail(projectile.position);
    }
}

// Update projectiles
function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const target = projectile.target;
        
        if (!target || !target.mesh.parent || !target.alive) {
            // Target destroyed, remove projectile
            scene.remove(projectile.mesh);
            projectiles.splice(i, 1);
            continue;
        }
        
        // Move towards target
        const direction = new THREE.Vector3(
            target.mesh.position.x - projectile.mesh.position.x,
            target.mesh.position.y - projectile.mesh.position.y,
            target.mesh.position.z - projectile.mesh.position.z
        ).normalize();
        
        projectile.mesh.position.add(direction.multiplyScalar(projectile.speed));
        
        // Check collision
        const distance = projectile.mesh.position.distanceTo(target.mesh.position);
        if (distance < 0.3) {
            // Hit target
            const hitPosition = target.mesh.position.clone();
            
            // Apply damage
            target.health -= projectile.damage;
            
            // Apply special effects
            if (projectile.effects.slow) {
                target.effects.slow = {
                    duration: projectile.effects.slow.duration,
                    factor: projectile.effects.slow.factor,
                    endTime: Date.now() + projectile.effects.slow.duration
                };
                
                if (visualManager) {
                    visualManager.createSlowEffect(hitPosition);
                }
            }
            
            // Splash damage
            if (projectile.effects.splash) {
                const splashRadius = projectile.effects.splash.radius;
                const splashDamage = projectile.effects.splash.damage;
                
                enemies.forEach(enemy => {
                    if (enemy !== target && enemy.alive) {
                        const dist = enemy.mesh.position.distanceTo(hitPosition);
                        if (dist <= splashRadius) {
                            enemy.health -= splashDamage;
                            
                            if (visualManager) {
                                visualManager.createHitEffect(enemy.mesh.position);
                            }
                        }
                    }
                });
                
                if (visualManager) {
                    visualManager.createExplosion(hitPosition, splashRadius);
                }
            } else {
                // Regular hit effect
                if (visualManager) {
                    visualManager.createHitEffect(hitPosition);
                }
            }
            
            // Play hit sound
            if (audioManager) {
                audioManager.playSound('enemyHit');
            }
            
            if (target.health <= 0) {
                // Enemy destroyed
                target.alive = false;
                
                // Properly dispose of FBX model and animation mixer
                if (target.mixer) {
                    target.mixer.stopAllAction();
                    target.mixer.uncacheRoot(target.mesh);
                }
                
                // Dispose of geometry and materials
                if (target.mesh) {
                    target.mesh.traverse((child) => {
                        if (child.isMesh) {
                            if (child.geometry) child.geometry.dispose();
                            if (child.material) {
                                if (Array.isArray(child.material)) {
                                    child.material.forEach(mat => {
                                        if (mat.map) mat.map.dispose();
                                        mat.dispose();
                                    });
                                } else {
                                    if (child.material.map) child.material.map.dispose();
                                    child.material.dispose();
                                }
                            }
                        }
                    });
                    scene.remove(target.mesh);
                }
                
                if (target.healthBar) scene.remove(target.healthBar);
                
                const enemyIndex = enemies.indexOf(target);
                if (enemyIndex > -1) {
                    enemies.splice(enemyIndex, 1);
                }
                
                gameState.score += target.reward || 20;
                gameState.money += target.reward || 10;
                gameState.enemiesAlive--;
                
                // Play enemy death sound
                if (audioManager) {
                    audioManager.playSound('enemyDeath');
                }
                
                // Create death effect
                if (visualManager) {
                    visualManager.createExplosion(hitPosition, 0.5);
                }
                
                // Update statistics
                if (saveSystem) {
                    const progress = saveSystem.getGameData().progress;
                    progress.enemiesKilled = (progress.enemiesKilled || 0) + 1;
                    saveSystem.saveProgress(progress);
                }
            } else {
                // Update health bar
                const healthPercent = target.health / target.maxHealth;
                target.healthBar.scale.x = healthPercent;
                target.healthBar.material.color.setHex(
                    healthPercent > 0.5 ? 0x00FF00 : healthPercent > 0.25 ? 0xFFFF00 : 0xFF0000
                );
            }
            
            scene.remove(projectile.mesh);
            projectiles.splice(i, 1);
            updateUI();
        }
    }
}

// Start wave
function startWave() {
    if (gameState.waveActive || !gameState.gameRunning) return;
    
    gameState.waveActive = true;
    
    // Get wave configuration from level
    const waveConfig = currentLevel.waves && currentLevel.waves[gameState.wave - 1] 
        ? currentLevel.waves[gameState.wave - 1] 
        : { totalEnemies: 5 + gameState.wave * 2, spawnInterval: 800, enemies: [{ type: 'tuyul', count: 5 + gameState.wave * 2 }] };
    
    const enemyCount = waveConfig.totalEnemies || (5 + gameState.wave * 2);
    let spawnedEnemies = 0;
    
    // Create enemy spawn queue based on wave configuration
    const enemyQueue = [];
    if (waveConfig.enemies) {
        waveConfig.enemies.forEach(enemyGroup => {
            for (let i = 0; i < enemyGroup.count; i++) {
                enemyQueue.push(enemyGroup.type);
            }
        });
    } else {
        // Fallback: spawn tuyul enemies
        for (let i = 0; i < enemyCount; i++) {
            enemyQueue.push('tuyul');
        }
    }
    
    // Shuffle the enemy queue for variety
    for (let i = enemyQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [enemyQueue[i], enemyQueue[j]] = [enemyQueue[j], enemyQueue[i]];
    }
    
    console.log(`Starting wave ${gameState.wave} with ${enemyQueue.length} enemies:`, enemyQueue);
    
    const spawnInterval = setInterval(() => {
        if (spawnedEnemies < enemyQueue.length) {
            const enemyType = enemyQueue[spawnedEnemies];
            createEnemy(enemyType);
            spawnedEnemies++;
            console.log(`Spawned enemy ${spawnedEnemies}/${enemyQueue.length}: ${enemyType}`);
        }
        
        if (spawnedEnemies >= enemyQueue.length) {
            clearInterval(spawnInterval);
        }
    }, waveConfig.spawnInterval || 800);
    
    // Play wave start sound
    if (audioManager) {
        audioManager.playSound('waveStart');
    }
    
    // Check for wave completion
    const checkWaveComplete = setInterval(() => {
        if (gameState.enemiesAlive === 0 && spawnedEnemies >= enemyQueue.length) {
            clearInterval(checkWaveComplete);
            gameState.waveActive = false;
            gameState.wave++;
            
            // Auto start next wave after 2 seconds
            setTimeout(() => {
                if (gameState.gameRunning && gameState.wave <= 10) {
                    startWave(); // Auto start next wave
                }
            }, 2000);
            
            // Check if all waves completed for victory
            if (currentLevel.waves && gameState.wave > currentLevel.waves.length) {
                victory();
            } else if (!currentLevel.waves && gameState.wave > 10) {
                victory();
            }
            updateUI();
        }
    }, 50);
}

// Auto start first wave
function autoStartGame() {
    setTimeout(() => {
        if (gameState.gameRunning && !gameState.waveActive) {
            startWave();
        }
    }, 1000); // Start first wave after 1 second
}

// Game over
function gameOver() {
    gameState.gameRunning = false;
    document.getElementById('statusText').textContent = 'Game Over! Your base was destroyed!';
    document.getElementById('gameStatus').style.display = 'block';
    
    // Play game over sound
    if (audioManager) {
        audioManager.playSFX('game_over');
    }
}

function levelComplete() {
    gameState.gameRunning = false;
    document.getElementById('statusText').textContent = 'Level Complete!';
    document.getElementById('gameStatus').style.display = 'block';
    
    // Play victory sound
    if (audioManager) {
        audioManager.playSFX('victory');
    }
    
    // Unlock next level if available
    if (typeof menuSystem !== 'undefined' && menuSystem && currentLevel.rewards && currentLevel.rewards.unlocks) {
        currentLevel.rewards.unlocks.forEach(levelId => {
            menuSystem.unlockLevel(levelId);
        });
    }
    
    // Add level completion rewards
    if (currentLevel.rewards) {
        if (currentLevel.rewards.money) {
            gameState.money += currentLevel.rewards.money;
        }
        updateUI();
    }
}

// Victory
function victory() {
    gameState.gameRunning = false;
    document.getElementById('statusText').textContent = 'Victory! You defended your base successfully!';
    document.getElementById('gameStatus').style.display = 'block';
    
    // Call level complete function to handle rewards and unlocks
    levelComplete();
}

// Restart game
function restartGame() {
    // Properly dispose of FBX models and animation mixers
    enemies.forEach(enemy => {
        if (enemy.mixer) {
            enemy.mixer.stopAllAction();
            enemy.mixer.uncacheRoot(enemy.mesh);
        }
        if (enemy.mesh) {
            // Dispose of geometry and materials
            enemy.mesh.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                if (mat.map) mat.map.dispose();
                                mat.dispose();
                            });
                        } else {
                            if (child.material.map) child.material.map.dispose();
                            child.material.dispose();
                        }
                    }
                }
            });
            scene.remove(enemy.mesh);
        }
    });
    
    // Clear scene objects but keep lights
    const objectsToRemove = [];
    scene.traverse((child) => {
        if (child.isMesh && child !== scene) {
            objectsToRemove.push(child);
        }
    });
    objectsToRemove.forEach(obj => {
        // Dispose of geometry and materials for remaining objects
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => {
                    if (mat.map) mat.map.dispose();
                    mat.dispose();
                });
            } else {
                if (obj.material.map) obj.material.map.dispose();
                obj.material.dispose();
            }
        }
        scene.remove(obj);
    });
    
    // Reset game state
    gameState = {
        health: 10,
        money: 100,
        score: 0,
        wave: 1,
        enemiesAlive: 0,
        gameRunning: true,
        waveActive: false,
        startPos: { x: 1, z: 1 },
        finishPos: { x: 38, z: 1 }
    };
    
    // Clear arrays
    enemies.length = 0;
    towers.length = 0;
    projectiles.length = 0;
    
    // Hide game status
    document.getElementById('gameStatus').style.display = 'none';
    
    // Force garbage collection hint
    if (window.gc) {
        window.gc();
    }
    
    // Recreate map and start game
    createMap();
    updateUI();
    autoStartGame(); // Start first wave automatically
}

// Update UI
function updateUI() {
    // Update health display if element exists
    const healthElement = document.getElementById('health');
    if (healthElement) {
        healthElement.textContent = gameState.health;
    }
    
    // Update score display if element exists
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = gameState.score;
    }
    
    // Update wave display if element exists
    const waveElement = document.getElementById('wave');
    if (waveElement) {
        waveElement.textContent = gameState.wave;
    }
    
    // Update enemies display if element exists
    const enemiesElement = document.getElementById('enemies');
    if (enemiesElement) {
        enemiesElement.textContent = gameState.enemiesAlive;
    }
    
    // Update money display if element exists
    const moneyElement = document.getElementById('money');
    if (moneyElement) {
        moneyElement.textContent = gameState.money;
    }
    
    // Update level info if element exists
    const levelElement = document.getElementById('level-info');
    if (levelElement) {
        levelElement.textContent = currentLevel ? (currentLevel.name || 'Level 1') : 'Level 1';
    }
    
    // Update tower info if element exists (for modal)
    const towerInfoElement = document.getElementById('tower-info');
    if (towerInfoElement && towerSystem && currentLevel) {
        const availableTowers = currentLevel.availableTowers || ['basic'];
        towerInfoElement.innerHTML = availableTowers.map(type => {
            const info = towerSystem.getTowerInfo(type);
            return `<button onclick="placeTowerFromModal('${type}')">${info.name} ($${info.cost})</button>`;
        }).join('');
    }
    
    // Add close button event listener if not already added
    const closeButton = document.getElementById('close-tower-modal');
    if (closeButton && !closeButton.hasAttribute('data-listener-added')) {
        closeButton.addEventListener('click', hideTowerSelectionModal);
        closeButton.setAttribute('data-listener-added', 'true');
    }
}

// Animation loop
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    if (gameState.gameRunning) {
        updateEnemies();
        updateTowers();
        updateProjectiles();
        
        // Update visual effects
        if (visualManager) {
            visualManager.update(deltaTime);
        }
    }
    
    renderer.render(scene, camera);
}

// Tower selection
let selectedTowerType = 'basic';

function selectTowerType(type) {
    selectedTowerType = type;
    
    // Update UI to show selected tower
    const buttons = document.querySelectorAll('#tower-info button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    
    // Play UI sound
    if (audioManager) {
        audioManager.playSound('uiClick');
    }
}

// Set selected tower type (for mobile controls)
function setSelectedTowerType(type) {
    selectedTowerType = type;
    console.log('Selected tower type set to:', type);
}



// Game control functions
function togglePause() {
    gameState.gameRunning = !gameState.gameRunning;
    
    const pauseBtn = document.getElementById('pause-game');
    if (pauseBtn) {
        pauseBtn.textContent = gameState.gameRunning ? 'Pause' : 'Resume';
    }
    
    // Play UI sound
    if (audioManager) {
        audioManager.playSound('uiClick');
    }
    
    // Pause/resume background music
    if (audioManager) {
        if (gameState.gameRunning) {
            audioManager.resumeMusic();
        } else {
            audioManager.pauseMusic();
        }
    }
}



// Toggle camera perspective through multiple views
function togglePerspective() {
    if (!camera || !cameraViews || cameraViews.length === 0) {
        console.warn('Camera or views not initialized properly for perspective toggle');
        return;
    }
    
    // Cycle to next view
    currentViewIndex = (currentViewIndex + 1) % cameraViews.length;
    const currentView = cameraViews[currentViewIndex];
    
    // Apply camera position and rotation
    camera.position.set(currentView.position.x, currentView.position.y, currentView.position.z);
    camera.lookAt(currentView.lookAt.x, currentView.lookAt.y, currentView.lookAt.z);
    
    // Update button text
    const button = document.getElementById('toggle-perspective');
    if (button) {
        const nextViewIndex = (currentViewIndex + 1) % cameraViews.length;
        const nextView = cameraViews[nextViewIndex];
        button.textContent = `${currentView.icon} ${nextView.name}`;
    }
    
    // Play UI sound
    if (audioManager) {
        audioManager.playSound('uiClick');
    }
    
    console.log(`Switched to ${currentView.name} view`);
}

// Game initialization is now handled by MenuSystem
// window.addEventListener('load', init); // Removed to prevent conflicts with menu system

// Make functions globally available
window.selectTowerType = selectTowerType;
window.togglePause = togglePause;
window.restartGame = restartGame;
window.togglePerspective = togglePerspective;
window.showTowerSelectionModal = showTowerSelectionModal;
window.hideTowerSelectionModal = hideTowerSelectionModal;
window.showTowerUpgradeModal = showTowerUpgradeModal;
window.hideTowerUpgradeModal = hideTowerUpgradeModal;
window.upgradeTower = upgradeTower;
window.destroyTower = destroyTower;
window.placeTowerFromModal = placeTowerFromModal;