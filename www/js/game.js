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

// Tutorial system
let tutorialState = {
    active: false,
    step: 0,
    completed: false,
    overlay: null
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

// FPS tracking variables
let fpsCounter = 0;
let fpsLastTime = Date.now();
let currentFPS = 60;

// Performance optimizer
let performanceOptimizer = null;

// Camera perspective variables
let currentViewIndex = 0;
let cameraViews = [];
let originalCameraPosition = null;
let originalCameraRotation = null;
let orbitControls; // OrbitControls for 3D perspective mode
let isOrbitControlsEnabled = false;

// Persistent camera positions for each perspective
let savedCameraStates = {};
let orbitControlsChangeListener = null;

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
    
    // Initialize tutorial ONLY if this is tutorial level AND selected from menu
    if (currentLevel.tutorial && menuSystem && menuSystem.selectedLevel === 'tutorial') {
        initializeTutorial();
    }
    
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
    
    // Initialize performance optimizer
    performanceOptimizer = new PerformanceOptimizer();

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
    
    // Initialize OrbitControls for 3D perspective mode
    if (typeof THREE.OrbitControls !== 'undefined') {
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControls.screenSpacePanning = false;
        orbitControls.minDistance = 10;
        orbitControls.maxDistance = 100;
        orbitControls.maxPolarAngle = Math.PI / 2;
        orbitControls.enabled = false; // Disabled by default
    }
    
    // Only create mobile UI if on mobile device
    if (GameConfig.utils.isMobile()) {
        // Mobile UI is already created in MobileControls constructor
    }
    
    updateUI();
    
    // Show tower recommendation for non-tutorial levels
    if (!currentLevel.tutorial) {
        setTimeout(() => {
            showTowerRecommendation();
        }, 1000);
    }
    
    showLevelEnemyPreview(); // Show enemy preview first, then start game
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
                    
                    // Check if this slot is in a restricted zone
                    const restrictionCheck = isInRestrictedZone(x, z);
                    let slotColor = 0x90EE90; // Default green
                    let slotOpacity = 1.0;
                    
                    if (restrictionCheck.restricted) {
                        slotColor = 0xFF6B6B; // Red for restricted areas
                        slotOpacity = 0.5; // Semi-transparent
                    }
                    
                    material = new THREE.MeshLambertMaterial({ 
                        color: slotColor,
                        transparent: slotOpacity < 1.0,
                        opacity: slotOpacity
                    });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.rotation.x = -Math.PI / 2;
                    mesh.position.set(x, 0, z);
                    mesh.receiveShadow = true;
                    mesh.userData = { x: x, z: z, type: 'towerSlot', restricted: restrictionCheck.restricted };
                    scene.add(mesh);
                    gameMap[z][x] = { 
                        type: 'towerSlot', 
                        mesh: mesh, 
                        hasTower: false, 
                        restricted: restrictionCheck.restricted,
                        restrictionReason: restrictionCheck.reason
                    };
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
    
    // Perspective control buttons
    const perspectiveTopBtn = document.getElementById('perspective-top');
    if (perspectiveTopBtn) {
        perspectiveTopBtn.addEventListener('click', () => setPerspective('top'));
    }
    
    const perspectiveSideBtn = document.getElementById('perspective-side');
    if (perspectiveSideBtn) {
        perspectiveSideBtn.addEventListener('click', () => setPerspective('side'));
    }
    
    const perspectiveIsoBtn = document.getElementById('perspective-iso');
    if (perspectiveIsoBtn) {
        perspectiveIsoBtn.addEventListener('click', () => setPerspective('isometric'));
    }
    
    const perspectiveFreeBtn = document.getElementById('perspective-free');
    if (perspectiveFreeBtn) {
        perspectiveFreeBtn.addEventListener('click', () => setPerspective('free'));
    }
    
    const perspectiveBirdsBtn = document.getElementById('perspective-birds');
    if (perspectiveBirdsBtn) {
        perspectiveBirdsBtn.addEventListener('click', () => setPerspective('birds'));
    }
    
    const perspectiveCloseupBtn = document.getElementById('perspective-closeup');
    if (perspectiveCloseupBtn) {
        perspectiveCloseupBtn.addEventListener('click', () => setPerspective('closeup'));
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
    // Don't interfere with OrbitControls when enabled
    if (isOrbitControlsEnabled) {
        return;
    }
    
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
    
    // Don't interfere with OrbitControls when enabled
    if (isOrbitControlsEnabled) {
        return;
    }
    
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
    if (cost !== null && tower.level < 3) {
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
        // Tower is at maximum level (3) - hide upgrade section
        if (upgradeSection) upgradeSection.style.display = 'none';
        if (upgradeBtn) upgradeBtn.style.display = 'none';
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
            z-index: 10000;
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
    
    // Add rotation button event listeners
    const rotateNorthBtn = document.getElementById('rotate-north-btn');
    const rotateEastBtn = document.getElementById('rotate-east-btn');
    const rotateSouthBtn = document.getElementById('rotate-south-btn');
    const rotateWestBtn = document.getElementById('rotate-west-btn');
    
    if (rotateNorthBtn && !rotateNorthBtn.hasAttribute('data-listener-added')) {
        rotateNorthBtn.addEventListener('click', () => rotateTower('north'));
        rotateNorthBtn.setAttribute('data-listener-added', 'true');
    }
    if (rotateEastBtn && !rotateEastBtn.hasAttribute('data-listener-added')) {
        rotateEastBtn.addEventListener('click', () => rotateTower('east'));
        rotateEastBtn.setAttribute('data-listener-added', 'true');
    }
    if (rotateSouthBtn && !rotateSouthBtn.hasAttribute('data-listener-added')) {
        rotateSouthBtn.addEventListener('click', () => rotateTower('south'));
        rotateSouthBtn.setAttribute('data-listener-added', 'true');
    }
    if (rotateWestBtn && !rotateWestBtn.hasAttribute('data-listener-added')) {
        rotateWestBtn.addEventListener('click', () => rotateTower('west'));
        rotateWestBtn.setAttribute('data-listener-added', 'true');
    }
    
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

// Helper function to get map bounds
function getMapBounds() {
    // Default bounds based on typical map size
    const defaultBounds = {
        minX: -20,
        maxX: 20,
        minZ: -20,
        maxZ: 20
    };
    
    // If we have a map loaded, calculate actual bounds
    if (window.mapData && window.mapData.path) {
        const pathBounds = calculatePathBounds(window.mapData.path);
        return {
            minX: pathBounds.minX - 10,
            maxX: pathBounds.maxX + 10,
            minZ: pathBounds.minZ - 10,
            maxZ: pathBounds.maxZ + 10
        };
    }
    
    return defaultBounds;
}

// Helper function to calculate path bounds
function calculatePathBounds(path) {
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    path.forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minZ = Math.min(minZ, point.z);
        maxZ = Math.max(maxZ, point.z);
    });
    
    return { minX, maxX, minZ, maxZ };
}

// Helper function to clamp camera target to map bounds
function clampCameraTarget(target, bounds) {
    target.x = Math.max(bounds.minX, Math.min(bounds.maxX, target.x));
    target.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, target.z));
}

// Helper function to check if area is accessible
function isAreaAccessible(x, z) {
    // Check if coordinates are within map bounds
    if (!gameMap || !gameMap[z] || !gameMap[z][x]) {
        return false;
    }
    
    const cell = gameMap[z][x];
    
    // Only allow access to tower slots
    if (cell.type === 'towerSlot') {
        return true;
    }
    
    // Restrict access to walls, start, and finish areas
    return false;
}

// Helper function to get restricted zones based on level progression
function getRestrictedZones() {
    const restrictedZones = [];
    
    // Add level-specific restrictions
    if (currentLevel && currentLevel.restrictedAreas) {
        restrictedZones.push(...currentLevel.restrictedAreas);
    }
    
    // Add dynamic restrictions based on game state
    if (gameState.currentWave < 2) {
        // Restrict certain areas until wave 2
        restrictedZones.push({
            minX: 30, maxX: 39,
            minZ: 0, maxZ: 14,
            reason: 'Area unlocked after Wave 2'
        });
    }
    
    return restrictedZones;
}

// Helper function to check if position is in restricted zone
function isInRestrictedZone(x, z) {
    const restrictedZones = getRestrictedZones();
    
    for (const zone of restrictedZones) {
        if (x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ) {
            return { restricted: true, reason: zone.reason || 'Area is restricted' };
        }
    }
    
    return { restricted: false };
}

// Function to update restricted area visuals
function updateRestrictedAreaVisuals() {
    if (!gameMap) return;
    
    for (let z = 0; z < gameMap.length; z++) {
        for (let x = 0; x < gameMap[z].length; x++) {
            const cell = gameMap[z][x];
            
            if (cell && cell.type === 'towerSlot' && cell.mesh) {
                const restrictionCheck = isInRestrictedZone(x, z);
                
                // Update material based on current restriction status
                let slotColor = 0x90EE90; // Default green
                let slotOpacity = 1.0;
                
                if (restrictionCheck.restricted) {
                    slotColor = 0xFF6B6B; // Red for restricted areas
                    slotOpacity = 0.5; // Semi-transparent
                }
                
                // Update material properties
                cell.mesh.material.color.setHex(slotColor);
                cell.mesh.material.transparent = slotOpacity < 1.0;
                cell.mesh.material.opacity = slotOpacity;
                cell.mesh.material.needsUpdate = true;
                
                // Update cell data
                cell.restricted = restrictionCheck.restricted;
                cell.restrictionReason = restrictionCheck.reason;
                cell.mesh.userData.restricted = restrictionCheck.restricted;
            }
        }
    }
}

// Rotate tower to specific direction
function rotateTower(direction) {
    const modal = document.getElementById('tower-upgrade-modal');
    if (!modal || !modal.dataset.towerIndex) return;
    
    const towerIndex = parseInt(modal.dataset.towerIndex);
    const tower = towers[towerIndex];
    if (!tower || !tower.mesh) return;
    
    let targetRotation = 0;
    switch(direction) {
        case 'north': targetRotation = 0; break;
        case 'east': targetRotation = Math.PI / 2; break;
        case 'south': targetRotation = Math.PI; break;
        case 'west': targetRotation = -Math.PI / 2; break;
    }
    
    // Animate rotation smoothly
    const startRotation = tower.mesh.rotation.y;
    const rotationDiff = targetRotation - startRotation;
    let animationProgress = 0;
    const animationDuration = 30; // frames
    
    const animateRotation = () => {
        animationProgress++;
        const progress = animationProgress / animationDuration;
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        tower.mesh.rotation.y = startRotation + (rotationDiff * easeProgress);
        
        if (animationProgress < animationDuration) {
            requestAnimationFrame(animateRotation);
        } else {
            tower.mesh.rotation.y = targetRotation;
        }
    };
    
    animateRotation();
    
    // Play UI sound
    if (audioManager) {
        audioManager.playSound('uiClick');
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
    if (cost === null || gameState.money < cost || tower.level >= 3) return;
    
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
    
    // Check if area is accessible
    if (!isAreaAccessible(x, z)) {
        console.warn('Cannot place tower: Area is not accessible');
        return;
    }
    
    // Check if area is in restricted zone
    const restrictionCheck = isInRestrictedZone(x, z);
    if (restrictionCheck.restricted) {
        console.warn('Cannot place tower:', restrictionCheck.reason);
        // Show user-friendly message
        if (audioManager) {
            audioManager.playSound('uiError');
        }
        return;
    }
    
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
    
    // Tutorial logic: Enable Start Wave button when first tower is placed
    if (tutorialState.active && tutorialState.step === 2) {
        // Enable start wave button
        const startButton = document.getElementById('start-wave');
        if (startButton) {
            startButton.disabled = false;
            startButton.style.opacity = '1';
            startButton.style.background = '#228B22';
            startButton.textContent = 'Start Wave';
        }
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
            effects: {},
            // Add weakness/resistance from EnemySystem
            weakness: enemySystem ? enemySystem.getEnemyWeakness(enemyType) : 'light',
            resistance: enemySystem ? enemySystem.getEnemyResistance(enemyType) : null
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('tuyul') : 'light',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('tuyul') : null
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('tuyul') : 'light',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('tuyul') : null
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
        effects: {},
        // Add weakness/resistance from EnemySystem
        weakness: enemySystem ? enemySystem.getEnemyWeakness('tuyul') : 'light',
        resistance: enemySystem ? enemySystem.getEnemyResistance('tuyul') : null
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('jalangkung') : 'light',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('jalangkung') : null
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('jalangkung') : 'light',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('jalangkung') : null
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
        effects: {},
        // Add weakness/resistance from EnemySystem
        weakness: enemySystem ? enemySystem.getEnemyWeakness('jalangkung') : 'light',
        resistance: enemySystem ? enemySystem.getEnemyResistance('jalangkung') : null
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('genderuwo') : 'heavy',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('genderuwo') : 'light'
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
        effects: {},
        // Add weakness/resistance from EnemySystem
        weakness: enemySystem ? enemySystem.getEnemyWeakness('genderuwo') : 'heavy',
        resistance: enemySystem ? enemySystem.getEnemyResistance('genderuwo') : 'light'
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('lembusura') : 'piercing',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('lembusura') : 'light'
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
        effects: {},
        // Add weakness/resistance from EnemySystem
        weakness: enemySystem ? enemySystem.getEnemyWeakness('lembusura') : 'piercing',
        resistance: enemySystem ? enemySystem.getEnemyResistance('lembusura') : 'light'
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('kuntilanak') : 'aerial',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('kuntilanak') : 'splash'
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('kuntilanak') : 'aerial',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('kuntilanak') : 'splash'
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
        effects: {},
        // Add weakness/resistance from EnemySystem
        weakness: enemySystem ? enemySystem.getEnemyWeakness('kuntilanak') : 'aerial',
        resistance: enemySystem ? enemySystem.getEnemyResistance('kuntilanak') : 'splash'
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
                    mixer: mixer,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('ratu laut neraka') : 'piercing',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('ratu laut neraka') : ['light', 'splash']
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
                    mixer: null,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('ratu laut neraka') : 'piercing',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('ratu laut neraka') : ['light', 'splash']
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
                mixer: null,
                // Add weakness/resistance from EnemySystem
                weakness: enemySystem ? enemySystem.getEnemyWeakness('ratu laut neraka') : 'piercing',
                resistance: enemySystem ? enemySystem.getEnemyResistance('ratu laut neraka') : ['light', 'splash']
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
        effects: {},
        // Add weakness/resistance from EnemySystem
        weakness: enemySystem ? enemySystem.getEnemyWeakness('ratu laut neraka') : 'piercing',
        resistance: enemySystem ? enemySystem.getEnemyResistance('ratu laut neraka') : ['light', 'splash']
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('orang bunian') : 'magical',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('orang bunian') : 'light'
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('orang bunian') : 'magical',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('orang bunian') : 'light'
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
        effects: {},
        // Add weakness/resistance from EnemySystem
        weakness: enemySystem ? enemySystem.getEnemyWeakness('orang bunian') : 'magical',
        resistance: enemySystem ? enemySystem.getEnemyResistance('orang bunian') : 'light'
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('mbok dukun pikun') : 'piercing',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('mbok dukun pikun') : ['magical', 'light']
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
        effects: {},
        // Add weakness/resistance from EnemySystem
        weakness: enemySystem ? enemySystem.getEnemyWeakness('mbok dukun pikun') : 'piercing',
        resistance: enemySystem ? enemySystem.getEnemyResistance('mbok dukun pikun') : ['magical', 'light']
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
                    walkAction: walkAction,
                    // Add weakness/resistance from EnemySystem
                    weakness: enemySystem ? enemySystem.getEnemyWeakness('roh tanah bangkit') : 'light',
                    resistance: enemySystem ? enemySystem.getEnemyResistance('roh tanah bangkit') : 'physical'
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
        effects: {},
        // Add weakness/resistance from EnemySystem
        weakness: enemySystem ? enemySystem.getEnemyWeakness('roh tanah bangkit') : 'light',
        resistance: enemySystem ? enemySystem.getEnemyResistance('roh tanah bangkit') : 'physical'
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

        // Update health bar to face camera (smooth update)
        if (!performanceOptimizer || (performanceOptimizer.frameCount % 2 === 0)) {
            enemy.healthBar.lookAt(camera.position);
        }
        
        // Update animation mixer for FBX models (frame-rate independent)
        if (enemy.mixer) {
            // Use actual deltaTime for consistent animation across all devices
            const actualDelta = window.globalDeltaTime || 0.016;
            // Cap deltaTime lebih ketat untuk animasi yang lebih smooth
            const cappedDelta = Math.min(actualDelta, 0.025); // Max 40 FPS equivalent untuk smooth
            enemy.mixer.update(cappedDelta);
        }

        // Calculate current speed (apply slow effect)
        let currentSpeed = enemy.speed;
        if (enemy.effects.slow && Date.now() < enemy.effects.slow.endTime) {
            currentSpeed *= enemy.effects.slow.factor;
        } else {
            // Remove expired slow effect
            delete enemy.effects.slow;
        }

        // Move enemy along path (frame-rate independent)
        if (enemy.pathIndex < enemyPath.length - 1) {
            const currentPos = enemyPath[enemy.pathIndex];
            const nextPos = enemyPath[enemy.pathIndex + 1];
            
            // Use deltaTime for consistent movement speed across all devices
            const actualDelta = window.globalDeltaTime || 0.016;
            const frameRateMultiplier = actualDelta / 0.016; // Normalize to 60 FPS
            enemy.progress += currentSpeed * frameRateMultiplier;
            
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
            // Tower rotation removed - now controlled manually via popup
            
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

// Fire projectile (optimized with object pooling)
function fireProjectile(tower, target) {
    let projectile;
    
    // Use object pooling if performance optimizer is available
    if (performanceOptimizer) {
        projectile = performanceOptimizer.getPooledProjectile();
        projectile.visible = true;
    } else {
        const geometry = new THREE.SphereGeometry(0.1, 6, 4);
        const material = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        projectile = new THREE.Mesh(geometry, material);
    }
    
    projectile.position.set(tower.x, 0.8, tower.z);
    scene.add(projectile);
    
    const projectileData = {
        mesh: projectile,
        target: target,
        speed: 0.3,
        damage: tower.damage,
        towerType: tower.type || 'basic',
        damageType: tower.damageType || (towerSystem ? towerSystem.towerTypes[tower.type || 'basic']?.damageType : 'light'),
        effects: tower.effects || {},
        pooled: !!performanceOptimizer // Track if this projectile uses pooling
    };
    
    projectiles.push(projectileData);
    
    // Create projectile trail effect (reduced frequency for performance)
    if (visualManager && (!performanceOptimizer || performanceOptimizer.averageFPS > 30)) {
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
            
            // Return to pool if using object pooling
            if (projectile.pooled && performanceOptimizer) {
                performanceOptimizer.returnProjectileToPool(projectile.mesh);
            }
            
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
            
            // Apply damage with weakness/resistance calculation
            let finalDamage = projectile.damage;
            if (towerSystem && target.type) {
                // Create tower object for damage calculation
                const towerData = {
                    damage: projectile.damage,
                    damageType: projectile.damageType || 'light'
                };
                
                // Create enemy object for damage calculation
                const enemyData = {
                    weakness: target.weakness,
                    resistance: target.resistance
                };
                
                finalDamage = towerSystem.calculateFinalDamage(towerData, enemyData);
            }
            
            target.health -= finalDamage;
            
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
                            // Apply splash damage with weakness/resistance calculation
                            let finalSplashDamage = splashDamage;
                            if (towerSystem && enemy.type) {
                                const towerData = {
                                    damage: splashDamage,
                                    damageType: projectile.damageType || 'heavy'
                                };
                                
                                const enemyData = {
                                    weakness: enemy.weakness,
                                    resistance: enemy.resistance
                                };
                                
                                finalSplashDamage = towerSystem.calculateFinalDamage(towerData, enemyData);
                            }
                            
                            enemy.health -= finalSplashDamage;
                            
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
            
            // Return to pool if using object pooling
            if (projectile.pooled && performanceOptimizer) {
                performanceOptimizer.returnProjectileToPool(projectile.mesh);
            }
            
            projectiles.splice(i, 1);
            updateUI();
        }
    }
}

// Start wave
function startWave() {
    if (gameState.waveActive || !gameState.gameRunning) return;
    
    gameState.waveActive = true;
    
    // Update restricted area visuals based on current wave
    updateRestrictedAreaVisuals();
    
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
    

    
    const spawnInterval = setInterval(() => {
        if (spawnedEnemies < enemyQueue.length) {
            const enemyType = enemyQueue[spawnedEnemies];
            createEnemy(enemyType);
            spawnedEnemies++;
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
            
            // Tutorial logic: Complete tutorial if all enemies defeated
            if (currentLevel && currentLevel.tutorial && tutorialState.active) {
                setTimeout(() => {
                    completeTutorialSuccess();
                }, 1000);
                return;
            }
            
            // Auto start next wave after 2 seconds (only if not tutorial)
            setTimeout(() => {
                if (gameState.gameRunning && gameState.wave <= 10) {
                    // Don't auto start next wave in tutorial mode
                    if (!currentLevel || !currentLevel.tutorial) {
                        startWave(); // Auto start next wave
                    }
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

// Auto start first wave (check autoStart property)
function autoStartGame() {
    // Check if first wave has autoStart disabled
    if (currentLevel && currentLevel.waves && currentLevel.waves[0] && currentLevel.waves[0].autoStart === false) {
        console.log('Wave auto-start disabled: waves will not auto-start');
        return;
    }
    
    // Don't auto start if this is tutorial level (legacy check)
    if (currentLevel && currentLevel.tutorial) {
        console.log('Tutorial mode: waves will not auto-start');
        return;
    }
    
    setTimeout(() => {
        if (gameState.gameRunning && !gameState.waveActive) {
            startWave();
        }
    }, 1000); // Start first wave after 1 second
}

// Show enemy preview at level start
function showLevelEnemyPreview() {
    // Don't show preview for tutorial level
    if (currentLevel && currentLevel.tutorial) {
        autoStartGame();
        return;
    }
    
    // Show enemy preview modal
    setTimeout(() => {
        if (typeof showEnemyPreview === 'function') {
            showEnemyPreview();
        } else {
            // Fallback to auto start if function not available
            autoStartGame();
        }
    }, 1500); // Show preview after 1.5 seconds
}

// Game over
function gameOver() {
    gameState.gameRunning = false;
    
    // Check if this is tutorial mode
    if (currentLevel && currentLevel.tutorial) {
        // Tutorial failed - show restart option
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-failed-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #2c3e50;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
        
        content.innerHTML = `
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Tutorial Gagal!</h2>
            <p style="margin-bottom: 30px; line-height: 1.5;">Benteng Anda telah dihancurkan! Jangan khawatir, mari coba lagi dari awal.</p>
            <button id="restart-tutorial-btn" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-right: 10px;
            ">Coba Lagi</button>
            <button id="exit-tutorial-btn" style="
                background: #95a5a6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            ">Kembali ke Menu</button>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // Add event listeners
        document.getElementById('restart-tutorial-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            restartTutorial();
        });
        
        document.getElementById('exit-tutorial-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            if (typeof menuSystem !== 'undefined' && menuSystem.returnToMenu) {
                menuSystem.returnToMenu();
            }
        });
    } else {
        // Normal game over
        document.getElementById('statusText').textContent = 'Game Over! Your base was destroyed!';
        document.getElementById('gameStatus').style.display = 'block';
    }
    
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
    
    // Make deltaTime available globally for consistent animation
    window.globalDeltaTime = deltaTime;
    
    // Calculate FPS
    fpsCounter++;
    if (currentTime - fpsLastTime >= 1000) { // Update FPS every second
        currentFPS = Math.round((fpsCounter * 1000) / (currentTime - fpsLastTime));
        fpsCounter = 0;
        fpsLastTime = currentTime;
        
        // Update FPS display
        const fpsElement = document.getElementById('fps');
        if (fpsElement) {
            fpsElement.textContent = currentFPS;
        }
        
        // Update quality display
        const qualityElement = document.getElementById('current-quality');
        if (qualityElement) {
            qualityElement.textContent = GameConfig.quality.current.charAt(0).toUpperCase() + GameConfig.quality.current.slice(1);
        }
        
        // Update global currentFPS for performance optimizer
        window.currentFPS = currentFPS;
    }
    
    // Update performance optimizer
    if (performanceOptimizer) {
        performanceOptimizer.update();
    }
    
    if (gameState.gameRunning) {
        // Use optimized updates for low FPS scenarios
        if (performanceOptimizer && performanceOptimizer.averageFPS < 35) {
            // Performance optimizer handles enemy and tower updates
            performanceOptimizer.optimizeEnemyUpdates();
            performanceOptimizer.optimizeTowerUpdates();
        } else {
            // Use normal updates for good FPS
            updateEnemies();
            updateTowers();
        }
        
        updateProjectiles();
        
        // Update visual effects with adaptive delta time
        if (visualManager) {
            const adaptiveDelta = performanceOptimizer && performanceOptimizer.averageFPS < 30 ? deltaTime * 2 : deltaTime;
            visualManager.update(adaptiveDelta);
        }
    }
    
    // Update OrbitControls if enabled (optimized based on FPS)
    if (orbitControls && isOrbitControlsEnabled) {
        // Reduce OrbitControls update frequency on low FPS
        const shouldUpdateControls = !performanceOptimizer || 
                                   performanceOptimizer.averageFPS > 30 || 
                                   performanceOptimizer.frameCount % 2 === 0;
        
        if (shouldUpdateControls) {
            orbitControls.update();
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

// Toggle adaptive quality
function toggleAdaptiveQuality() {
    if (performanceOptimizer) {
        const isEnabled = !performanceOptimizer.adaptiveQuality;
        performanceOptimizer.setAdaptiveQuality(isEnabled);
        
        const btn = document.getElementById('adaptive-quality');
        if (btn) {
            btn.title = `Auto Quality: ${isEnabled ? 'ON' : 'OFF'}`;
            btn.style.opacity = isEnabled ? '1' : '0.6';
        }
        
        // Play UI sound
        if (audioManager) {
            audioManager.playSound('uiClick');
        }
        
        console.log('Adaptive quality:', isEnabled ? 'enabled' : 'disabled');
    }
}

// Performance debugging functions (accessible from console)
window.getPerformanceStats = function() {
    if (performanceOptimizer) {
        const stats = performanceOptimizer.getStats();
        console.log('Performance Stats:', stats);
        return stats;
    }
    return null;
};

window.setQuality = function(quality) {
    if (['low', 'medium', 'high'].includes(quality)) {
        if (performanceOptimizer) {
            performanceOptimizer.changeQuality(quality);
            console.log('Quality changed to:', quality);
        }
    } else {
        console.log('Valid qualities: low, medium, high');
    }
};

window.toggleAdaptive = function() {
    toggleAdaptiveQuality();
};



// Set specific camera perspective
function setPerspective(viewType) {
    if (!camera || !cameraViews || cameraViews.length === 0) {
        console.warn('Camera or views not initialized properly for perspective setting');
        return;
    }
    
    // Find the view by type
    let targetView = null;
    let targetIndex = -1;
    
    // Map view types to camera view names
    const viewMapping = {
        'top': 'Top-Down',
        'side': 'Side View', 
        'isometric': 'Isometric',
        'free': '3D Perspective',
        'birds': 'Bird\'s Eye',
        'closeup': 'Close-up'
    };
    
    const targetViewName = viewMapping[viewType];
    if (!targetViewName) {
        console.warn('Unknown view type:', viewType);
        return;
    }
    
    // Find the matching view
    for (let i = 0; i < cameraViews.length; i++) {
        if (cameraViews[i].name === targetViewName) {
            targetView = cameraViews[i];
            targetIndex = i;
            break;
        }
    }
    
    if (!targetView) {
        console.warn('View not found:', targetViewName);
        return;
    }
    
    // Store current camera state for the current perspective if OrbitControls was active
    const wasOrbitControlsActive = isOrbitControlsEnabled;
    
    if (wasOrbitControlsActive && orbitControls && currentViewIndex >= 0) {
        const currentPerspectiveName = cameraViews[currentViewIndex].name;
        savedCameraStates[currentPerspectiveName] = {
            position: camera.position.clone(),
            target: orbitControls.target.clone()
        };
        console.log('Saved camera state for', currentPerspectiveName);
    }
    
    // Set the view
    currentViewIndex = targetIndex;
    const currentView = targetView;
    
    // Check if this is 3D Perspective mode
    const is3DPerspective = currentView.name === "3D Perspective";
    
    // Enable OrbitControls for all perspectives
    if (orbitControls) {
        orbitControls.enabled = true;
        isOrbitControlsEnabled = true;
        
        // Set camera movement boundaries based on map size
        const mapBounds = getMapBounds();
        orbitControls.minDistance = 5;
        orbitControls.maxDistance = 50;
        orbitControls.maxPolarAngle = Math.PI / 2.2; // Prevent camera from going too low
        orbitControls.minPolarAngle = Math.PI / 6;   // Prevent camera from going too high
        
        // Enable damping for smoother movement
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.1;
        
        // Remove previous event listener if exists
        if (orbitControlsChangeListener) {
            orbitControls.removeEventListener('change', orbitControlsChangeListener);
        }
        
        // Create and add new event listener to constrain camera movement
        orbitControlsChangeListener = () => {
            const bounds = getMapBounds();
            // Only clamp if camera target is significantly outside bounds
            const buffer = 5; // Allow some movement outside strict bounds
            const expandedBounds = {
                minX: bounds.minX - buffer,
                maxX: bounds.maxX + buffer,
                minZ: bounds.minZ - buffer,
                maxZ: bounds.maxZ + buffer
            };
            
            // Only clamp if really outside expanded bounds
            if (orbitControls.target.x < expandedBounds.minX || 
                orbitControls.target.x > expandedBounds.maxX ||
                orbitControls.target.z < expandedBounds.minZ || 
                orbitControls.target.z > expandedBounds.maxZ) {
                clampCameraTarget(orbitControls.target, bounds);
            }
        };
        orbitControls.addEventListener('change', orbitControlsChangeListener);
        
        // Check if we have saved camera state for this perspective
        const savedState = savedCameraStates[currentView.name];
        
        if (savedState) {
            // Restore saved camera state for this perspective
            camera.position.copy(savedState.position);
            orbitControls.target.copy(savedState.target);
            console.log('Restored saved camera state for', currentView.name);
        } else {
            // No saved state, use current camera position to preserve position
            savedCameraStates[currentView.name] = {
                position: camera.position.clone(),
                target: orbitControls.target.clone()
            };
            console.log('Preserved current camera position for', currentView.name);
        }
        
        orbitControls.update();
        console.log('OrbitControls enabled for', currentView.name, 'mode');
    } else {
        // No OrbitControls available, use standard camera positioning
        camera.position.set(currentView.position.x, currentView.position.y, currentView.position.z);
        camera.lookAt(currentView.lookAt.x, currentView.lookAt.y, currentView.lookAt.z);
    }
    
    // Update perspective button states
    updatePerspectiveButtonStates(viewType);
    
    // Play UI sound
    if (audioManager) {
        audioManager.playSound('uiClick');
    }
    
    console.log(`Switched to ${currentView.name} view`);
}

// Update perspective button visual states
function updatePerspectiveButtonStates(activeView) {
    const buttons = ['perspective-top', 'perspective-side', 'perspective-iso', 'perspective-free', 'perspective-birds', 'perspective-closeup'];
    const viewTypes = ['top', 'side', 'isometric', 'free', 'birds', 'closeup'];
    
    buttons.forEach((buttonId, index) => {
        const button = document.getElementById(buttonId);
        if (button) {
            if (viewTypes[index] === activeView) {
                button.style.opacity = '1';
                button.style.transform = 'scale(1.1)';
            } else {
                button.style.opacity = '0.7';
                button.style.transform = 'scale(1)';
            }
        }
    });
}

// Toggle camera perspective through multiple views
function togglePerspective() {
    if (!camera || !cameraViews || cameraViews.length === 0) {
        console.warn('Camera or views not initialized properly for perspective toggle');
        return;
    }
    
    // Store current camera state for the current perspective if OrbitControls was active
    const wasOrbitControlsActive = isOrbitControlsEnabled;
    
    if (wasOrbitControlsActive && orbitControls && currentViewIndex >= 0) {
        const currentPerspectiveName = cameraViews[currentViewIndex].name;
        savedCameraStates[currentPerspectiveName] = {
            position: camera.position.clone(),
            target: orbitControls.target.clone()
        };
        console.log('Saved camera state for', currentPerspectiveName);
    }
    
    // Cycle to next view
    currentViewIndex = (currentViewIndex + 1) % cameraViews.length;
    const currentView = cameraViews[currentViewIndex];
    
    // Check if this is 3D Perspective mode
    const is3DPerspective = currentView.name === "3D Perspective";
    
    // Enable OrbitControls for all perspectives
    if (orbitControls) {
        orbitControls.enabled = true;
        isOrbitControlsEnabled = true;
        
        // Set camera movement boundaries based on map size
        const mapBounds = getMapBounds();
        orbitControls.minDistance = 5;
        orbitControls.maxDistance = 50;
        orbitControls.maxPolarAngle = Math.PI / 2.2; // Prevent camera from going too low
        orbitControls.minPolarAngle = Math.PI / 6;   // Prevent camera from going too high
        
        // Enable damping for smoother movement
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.1;
        
        // Remove previous event listener if exists
        if (orbitControlsChangeListener) {
            orbitControls.removeEventListener('change', orbitControlsChangeListener);
        }
        
        // Create and add new event listener to constrain camera movement
        orbitControlsChangeListener = () => {
            const bounds = getMapBounds();
            // Only clamp if camera target is significantly outside bounds
            const buffer = 5; // Allow some movement outside strict bounds
            const expandedBounds = {
                minX: bounds.minX - buffer,
                maxX: bounds.maxX + buffer,
                minZ: bounds.minZ - buffer,
                maxZ: bounds.maxZ + buffer
            };
            
            // Only clamp if really outside expanded bounds
            if (orbitControls.target.x < expandedBounds.minX || 
                orbitControls.target.x > expandedBounds.maxX ||
                orbitControls.target.z < expandedBounds.minZ || 
                orbitControls.target.z > expandedBounds.maxZ) {
                clampCameraTarget(orbitControls.target, bounds);
            }
        };
        orbitControls.addEventListener('change', orbitControlsChangeListener);
        
        // Check if we have saved camera state for this perspective
        const savedState = savedCameraStates[currentView.name];
        
        if (savedState) {
            // Restore saved camera state for this perspective
            camera.position.copy(savedState.position);
            orbitControls.target.copy(savedState.target);
            console.log('Restored saved camera state for', currentView.name);
        } else {
            // No saved state, use current camera position to preserve position
            savedCameraStates[currentView.name] = {
                position: camera.position.clone(),
                target: orbitControls.target.clone()
            };
            console.log('Preserved current camera position for', currentView.name);
        }
        
        orbitControls.update();
        console.log('OrbitControls enabled for', currentView.name, 'mode');
    } else {
        // No OrbitControls available, use standard camera positioning
        camera.position.set(currentView.position.x, currentView.position.y, currentView.position.z);
        camera.lookAt(currentView.lookAt.x, currentView.lookAt.y, currentView.lookAt.z);
    }
    
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

// Tower Recommendation System
function showTowerRecommendation() {
    if (!currentLevel || !currentLevel.waves || !enemySystem || !towerSystem) return;
    
    const modal = document.getElementById('tower-recommendation-modal');
    const content = document.getElementById('tower-recommendation-content');
    
    if (!modal || !content) return;
    
    // Collect all unique enemies from current wave and next 2 waves
    const currentWave = gameState.wave - 1;
    const wavesToAnalyze = currentLevel.waves.slice(currentWave, currentWave + 3);
    const enemyTypes = new Set();
    
    wavesToAnalyze.forEach(wave => {
        if (wave && wave.enemies) {
            wave.enemies.forEach(enemy => {
                enemyTypes.add(enemy.type);
            });
        }
    });
    
    // Get tower recommendations based on enemy weaknesses
    const recommendations = getTowerRecommendations(Array.from(enemyTypes));
    
    // Generate recommendation content
    let html = '<div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%); border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid rgba(255, 255, 255, 0.15);">';
    html += '<h3 style="margin: 0 0 12px 0; color: #FFD700; font-size: 16px; font-weight: 600;">📊 Analisis Musuh:</h3>';
    
    // Show enemy types and their weaknesses
    const enemyEmojis = {
        'tuyul': '👺', 'jalangkung': '👻', 'genderuwo': '🧌', 'lembusura': '🐉',
        'kuntilanak': '👤', 'mbok dukun pikun': '🧙‍♀️', 'ratu laut neraka': '🧜‍♀️',
        'orang bunian': '🧚‍♂️', 'roh tanah bangkit': '💀'
    };
    
    enemyTypes.forEach(enemyType => {
        const weakness = enemySystem.getEnemyWeakness(enemyType);
        const resistance = enemySystem.getEnemyResistance(enemyType);
        const emoji = enemyEmojis[enemyType] || '👹';
        
        html += `<div style="margin: 8px 0; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; font-size: 12px;">`;
        html += `<strong>${emoji} ${enemyType.charAt(0).toUpperCase() + enemyType.slice(1)}</strong><br>`;
        html += `<span style="color: #ef4444;">Lemah: ${weakness || 'Tidak ada'}</span> | `;
        html += `<span style="color: #10b981;">Tahan: ${resistance || 'Tidak ada'}</span>`;
        html += `</div>`;
    });
    
    html += '</div>';
    
    // Show tower recommendations
    html += '<div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%); border-radius: 16px; padding: 16px; border: 1px solid rgba(16, 185, 129, 0.3);">';
    html += '<h3 style="margin: 0 0 12px 0; color: #10B981; font-size: 16px; font-weight: 600;">🏗️ Tower yang Disarankan:</h3>';
    
    recommendations.forEach((rec, index) => {
        const priority = index === 0 ? '🔥 PRIORITAS TINGGI' : index === 1 ? '⭐ DIREKOMENDASIKAN' : '💡 OPSIONAL';
        const priorityColor = index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#6b7280';
        
        html += `<div style="margin: 12px 0; padding: 12px; background: rgba(0,0,0,0.4); border-radius: 12px; border-left: 4px solid ${priorityColor};">`;
        html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">`;
        html += `<strong style="color: white; font-size: 14px;">${rec.icon} ${rec.name}</strong>`;
        html += `<span style="color: ${priorityColor}; font-size: 10px; font-weight: 600;">${priority}</span>`;
        html += `</div>`;
        html += `<div style="font-size: 11px; color: rgba(255,255,255,0.8); margin-bottom: 6px;">${rec.description}</div>`;
        html += `<div style="font-size: 10px; color: #10b981;">💰 Harga: $${rec.cost} | ⚡ ${rec.reason}</div>`;
        html += `</div>`;
    });
    
    html += '</div>';
    
    content.innerHTML = html;
    modal.style.display = 'block';
}

function getTowerRecommendations(enemyTypes) {
    const recommendations = [];
    const damageTypeCount = {};
    
    // Count required damage types based on enemy weaknesses
    enemyTypes.forEach(enemyType => {
        const weakness = enemySystem.getEnemyWeakness(enemyType);
        if (weakness && weakness !== 'none') {
            damageTypeCount[weakness] = (damageTypeCount[weakness] || 0) + 1;
        }
    });
    
    // Sort damage types by frequency
    const sortedDamageTypes = Object.entries(damageTypeCount)
        .sort(([,a], [,b]) => b - a)
        .map(([type]) => type);
    
    // Tower mapping with icons and descriptions
    const towerMapping = {
        'physical': {
            towers: ['basic', 'piercing'],
            primary: { name: 'Basic Tower', icon: '🏹', cost: 50, description: 'Tower dasar dengan damage physical yang stabil' },
            secondary: { name: 'Piercing Tower', icon: '🎯', cost: 80, description: 'Menembus armor dan mengenai multiple target' }
        },
        'fire': {
            towers: ['splash'],
            primary: { name: 'Splash Tower', icon: '💥', cost: 100, description: 'Damage area dengan efek fire yang kuat' }
        },
        'ice': {
            towers: ['freeze', 'slow'],
            primary: { name: 'Freeze Tower', icon: '❄️', cost: 120, description: 'Membekukan musuh dan memperlambat gerakan' },
            secondary: { name: 'Slow Tower', icon: '🧊', cost: 75, description: 'Memperlambat musuh secara konsisten' }
        },
        'poison': {
            towers: ['poison'],
            primary: { name: 'Poison Tower', icon: '☠️', cost: 90, description: 'Damage poison yang berkelanjutan' }
        },
        'energy': {
            towers: ['laser'],
            primary: { name: 'Laser Tower', icon: '⚡', cost: 150, description: 'Damage energy dengan precision tinggi' }
        },
        'air': {
            towers: ['antiair'],
            primary: { name: 'Anti-Air Tower', icon: '🚀', cost: 110, description: 'Khusus untuk musuh terbang dan air-type' }
        }
    };
    
    // Add primary recommendations based on enemy weaknesses
    sortedDamageTypes.forEach((damageType, index) => {
        const mapping = towerMapping[damageType];
        if (mapping && mapping.primary) {
            const count = damageTypeCount[damageType];
            recommendations.push({
                ...mapping.primary,
                reason: `Efektif melawan ${count} jenis musuh`,
                priority: index
            });
        }
    });
    
    // Add basic tower if no specific weaknesses found
    if (recommendations.length === 0) {
        recommendations.push({
            name: 'Basic Tower',
            icon: '🏹',
            cost: 50,
            description: 'Tower serbaguna untuk semua situasi',
            reason: 'Pilihan aman untuk memulai defense'
        });
    }
    
    // Add secondary recommendations
    if (recommendations.length < 3) {
        // Add slow tower for crowd control
        if (!recommendations.some(r => r.name.includes('Slow'))) {
            recommendations.push({
                name: 'Slow Tower',
                icon: '🧊',
                cost: 75,
                description: 'Crowd control untuk memperlambat musuh',
                reason: 'Memberikan waktu lebih untuk damage'
            });
        }
        
        // Add splash for area damage
        if (!recommendations.some(r => r.name.includes('Splash'))) {
            recommendations.push({
                name: 'Splash Tower',
                icon: '💥',
                cost: 100,
                description: 'Area damage untuk grup musuh',
                reason: 'Efisien melawan banyak musuh sekaligus'
            });
        }
    }
    
    return recommendations.slice(0, 3); // Return top 3 recommendations
}

function closeTowerRecommendation() {
    const modal = document.getElementById('tower-recommendation-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Tutorial System Functions
function initializeTutorial() {
    tutorialState.active = true;
    tutorialState.step = 0;
    tutorialState.completed = false;
    
    // Disable start wave button initially in tutorial
    const startButton = document.getElementById('start-wave');
    if (startButton) {
        startButton.disabled = true;
        startButton.style.opacity = '0.5';
        startButton.style.background = '#666';
        startButton.textContent = 'Tempatkan Tower Dulu';
    }
    
    // Create tutorial overlay
    createTutorialOverlay();
    
    // Start first tutorial step
    setTimeout(() => {
        showTutorialStep(0);
    }, 1000);
}

function createTutorialOverlay() {
    // Remove existing overlay if any
    if (tutorialState.overlay) {
        document.body.removeChild(tutorialState.overlay);
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 12px;
        border-radius: 8px;
        max-width: 280px;
        width: 280px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 13px;
        line-height: 1.4;
        border: 1px solid #FFD700;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(5px);
    `;
    
    document.body.appendChild(overlay);
    tutorialState.overlay = overlay;
}

function showTutorialStep(step) {
    if (!tutorialState.overlay) return;
    
    const steps = [
        {
            title: "Selamat Datang di Tutorial!",
            content: "Selamat datang di Tower of Mitos! Game tower defense dengan tema mistis Indonesia. Di sini Anda akan belajar cara mempertahankan wilayah dari serangan makhluk mistis.",
            action: "Klik 'Lanjut' untuk memulai pembelajaran.",
            canNext: true
        },
        {
            title: "Cara Bermain",
            content: "Tujuan Anda adalah mencegah musuh mencapai ujung jalur merah. Anda memiliki 30 HP (nyawa). Setiap musuh yang lolos akan mengurangi HP Anda. Jika HP habis, permainan berakhir.",
            action: "Perhatikan bar HP dan uang di pojok kanan atas layar.",
            canNext: true
        },
        {
            title: "Menempatkan Tower",
            content: "Sekarang saatnya menempatkan tower pertama! Klik pada area hijau di samping jalur untuk menempatkan Lilin Pemanggil Arwah. Tower ini akan menyerang musuh yang lewat.",
            action: "Klik area hijau untuk menempatkan tower. Anda harus menempatkan tower sebelum bisa melanjutkan!",
            canNext: false,
            requireTower: true
        },
        {
            title: "Memulai Gelombang Musuh",
            content: "Bagus! Anda telah menempatkan tower pertama. Sekarang klik tombol 'Start Wave' untuk memulai gelombang musuh. Musuh akan muncul dan berjalan menuju ujung jalur.",
            action: "Klik tombol 'Start Wave' untuk memulai pertarungan!",
            canNext: true,
            startWave: true
        }
    ];
    
    if (step >= steps.length) {
        completeTutorial();
        return;
    }
    
    const currentStep = steps[step];
    tutorialState.overlay.innerHTML = `
        <h3 style="margin: 0 0 8px 0; color: #FFD700; font-size: 14px;">${currentStep.title}</h3>
        <p style="margin: 0 0 10px 0; font-size: 12px;">${currentStep.content}</p>
        <p style="margin: 0 0 12px 0; font-style: italic; color: #87CEEB; font-size: 11px;">${currentStep.action}</p>
        <button onclick="nextTutorialStep()" style="
            background: #4169E1;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            margin-right: 5px;
        ">Lanjut</button>
        ${step > 0 ? '<button onclick="prevTutorialStep()" style="background: #666; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">Kembali</button>' : ''}
    `;
}

function nextTutorialStep() {
    const currentStep = tutorialState.step;
    
    // Check if current step has requirements
    if (currentStep === 2) { // Step 2 requires tower placement
        // Check if player has placed at least one tower
        const hasTower = towers && towers.length > 0;
        if (!hasTower) {
            // Show message that tower is required
            const overlay = tutorialState.overlay;
            if (overlay) {
                const actionText = overlay.querySelector('p:nth-child(3)');
                if (actionText) {
                    actionText.style.color = '#ff6b6b';
                    actionText.textContent = 'Anda harus menempatkan tower terlebih dahulu!';
                    setTimeout(() => {
                        actionText.style.color = '#87CEEB';
                        actionText.textContent = 'Klik area hijau untuk menempatkan tower. Anda harus menempatkan tower sebelum bisa melanjutkan!';
                    }, 2000);
                }
            }
            return;
        }
    }
    
    tutorialState.step++;
    showTutorialStep(tutorialState.step);
    
    // If we just moved to step 3 (start wave step), enable the start wave button
    if (tutorialState.step === 3) {
        // Enable start wave functionality
        const startButton = document.getElementById('start-wave');
        if (startButton) {
            startButton.disabled = false;
            startButton.style.opacity = '1';
            startButton.style.background = '#228B22';
            startButton.textContent = 'Start Wave';
        }
    }
}

function prevTutorialStep() {
    if (tutorialState.step > 0) {
        tutorialState.step--;
        showTutorialStep(tutorialState.step);
    }
}

function completeTutorial() {
    tutorialState.completed = true;
    tutorialState.active = false;
    
    if (tutorialState.overlay) {
        tutorialState.overlay.innerHTML = `
            <h3 style="margin: 0 0 8px 0; color: #FFD700; font-size: 14px;">Tutorial Selesai!</h3>
            <p style="margin: 0 0 12px 0; font-size: 12px;">Anda telah menyelesaikan tutorial. Selamat bermain!</p>
            <button onclick="closeTutorial()" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            ">Tutup</button>
        `;
    }
}

function completeTutorialSuccess() {
    tutorialState.completed = true;
    tutorialState.active = false;
    
    if (tutorialState.overlay) {
        tutorialState.overlay.innerHTML = `
            <h3 style="margin: 0 0 8px 0; color: #FFD700; font-size: 14px;">Selamat! Tutorial Berhasil!</h3>
            <p style="margin: 0 0 10px 0; font-size: 12px;">Anda berhasil mengalahkan semua musuh! Tutorial telah selesai.</p>
            <p style="margin: 0 0 12px 0; color: #90EE90; font-size: 11px;">Sekarang Anda siap bermain level yang sesungguhnya!</p>
            <button onclick="returnToMenu()" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                margin-right: 5px;
            ">Kembali ke Menu</button>
            <button onclick="closeTutorial()" style="
                background: #2196F3;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            ">Lanjut Bermain</button>
        `;
    }
}

function restartTutorial() {
    // Reset game state
    gameState.health = currentLevel.settings.startingHealth || 30;
    gameState.money = currentLevel.settings.startingMoney || 300;
    gameState.wave = 1;
    gameState.waveActive = false;
    gameState.enemiesAlive = 0;
    
    // Clear all enemies
    enemies.forEach(enemy => {
        if (enemy.mesh) scene.remove(enemy.mesh);
    });
    enemies.length = 0;
    
    // Clear all towers
    towers.forEach(tower => {
        if (tower.mesh) scene.remove(tower.mesh);
        if (tower.cannon) scene.remove(tower.cannon);
        if (gameMap && gameMap[tower.z] && gameMap[tower.z][tower.x]) {
            gameMap[tower.z][tower.x].hasTower = false;
        }
    });
    towers.length = 0;
    
    // Clear all projectiles
    projectiles.forEach(projectile => {
        if (projectile.mesh) scene.remove(projectile.mesh);
    });
    projectiles.length = 0;
    
    // Restart tutorial
    initializeTutorial();
    
    updateUI();
}

function closeTutorial() {
    if (tutorialState.overlay) {
        document.body.removeChild(tutorialState.overlay);
        tutorialState.overlay = null;
    }
}

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
window.nextTutorialStep = nextTutorialStep;
window.prevTutorialStep = prevTutorialStep;
window.closeTutorial = closeTutorial;