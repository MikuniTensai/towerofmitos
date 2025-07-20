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
let audioManager;
let visualManager;
let saveSystem;
let mobileControls;
let currentLevel;
let lastTime = 0;

// Initialize level after DOM is loaded
function initializeLevel() {
    if (typeof Level1 !== 'undefined') {
        currentLevel = Level1;
        console.log('Level1 loaded successfully:', currentLevel);
    } else {
        console.error('Level1 not found, using fallback');
        // Fallback level configuration
        currentLevel = {
            enemies: {
                types: {
                    basic: {
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
                    enemies: [{ type: 'basic', count: 5 }]
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
}

// Use level configuration (will be set after initialization)
let mapLayout, enemyPath;

// Initialize modular systems
function initializeSystems() {
    towerSystem = new TowerSystem();
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
    // Initialize level configuration first
    initializeLevel();
    
    // Set map layout and enemy path from level
    mapLayout = currentLevel.mapLayout;
    enemyPath = currentLevel.enemyPath;
    
    // Initialize modular systems
    initializeSystems();
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(currentLevel.visual.skyColor || 0x87CEEB);
    
    // Add fog for depth
    scene.fog = new THREE.Fog(currentLevel.visual.fogColor || 0x87CEEB, 10, 50);

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

    // Create renderer optimized for full screen mobile
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
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

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    scene.add(directionalLight);
    
    // Add point light for more dynamic lighting
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight.position.set(6, 8, 2);
    pointLight.castShadow = true;
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
    
    // Initialize mobile controls if on mobile device
    if (GameConfig.utils.isMobile()) {
        // Create game object with necessary functions for mobile controls
        const gameObject = {
            placeTower: placeTower,
            setSelectedTowerType: setSelectedTowerType,
            scene: scene,
            mapLayout: mapLayout
        };
        mobileControls = new MobileControls(renderer, camera, gameObject);
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
    
    // Start wave button
    const startWaveBtn = document.getElementById('start-wave');
    if (startWaveBtn) {
        startWaveBtn.addEventListener('click', startWave);
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
function createEnemy(enemyType = 'basic') {
    // Ensure currentLevel is defined and has enemy types
    if (!currentLevel || !currentLevel.enemies || !currentLevel.enemies.types) {
        console.error('Level configuration not loaded properly');
        return;
    }
    
    const enemyConfig = currentLevel.enemies.types[enemyType] || currentLevel.enemies.types.basic;
    
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

// Create explosion effect
function createExplosion(position) {
    const particleCount = 8;
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
            scene.remove(enemy.mesh);
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
            // Rotate tower base slowly
            tower.mesh.rotation.y += 0.005;
            
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
            
            // Rotate cannon towards target
            if (tower.target) {
                const angle = Math.atan2(
                    tower.target.mesh.position.z - tower.z,
                    tower.target.mesh.position.x - tower.x
                );
                tower.cannon.rotation.y = angle;
                
                // Fire at target
                if (currentTime - tower.lastFired > tower.fireRate) {
                    fireProjectile(tower, tower.target);
                    tower.lastFired = currentTime;
                    
                    // Play tower fire sound
                    if (audioManager) {
                        audioManager.playSound('towerFire');
                    }
                    
                    // Create muzzle flash effect
                    if (visualManager) {
                        visualManager.createMuzzleFlash(tower.cannon.position);
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
                scene.remove(target.mesh);
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
        : { totalEnemies: 5 + gameState.wave * 2, spawnInterval: 800, enemies: [{ type: 'basic', count: 5 + gameState.wave * 2 }] };
    
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
        // Fallback: spawn basic enemies
        for (let i = 0; i < enemyCount; i++) {
            enemyQueue.push('basic');
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
            
            if (gameState.wave > 10) {
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
}

// Victory
function victory() {
    gameState.gameRunning = false;
    document.getElementById('statusText').textContent = 'Victory! You defended your base successfully!';
    document.getElementById('gameStatus').style.display = 'block';
}

// Restart game
function restartGame() {
    // Clear scene objects but keep lights
    const objectsToRemove = [];
    scene.traverse((child) => {
        if (child.isMesh && child !== scene) {
            objectsToRemove.push(child);
        }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));
    
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
    
    // Recreate map and start game
    createMap();
    updateUI();
    autoStartGame(); // Start first wave automatically
}

// Update UI
function updateUI() {
    document.getElementById('health').textContent = gameState.health;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('wave').textContent = gameState.wave;
    document.getElementById('enemies').textContent = gameState.enemiesAlive;
    
    // Update money display if element exists
    const moneyElement = document.getElementById('money');
    if (moneyElement) {
        moneyElement.textContent = gameState.money;
    }
    
    // Update level info if element exists
    const levelElement = document.getElementById('level-info');
    if (levelElement) {
        levelElement.textContent = currentLevel.name || 'Level 1';
    }
    
    // Update tower info if element exists (for modal)
    const towerInfoElement = document.getElementById('tower-info');
    if (towerInfoElement && towerSystem) {
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

// Game over function
function gameOver() {
    gameState.gameRunning = false;
    
    // Play game over sound
    if (audioManager) {
        audioManager.playSound('gameOver');
        audioManager.stopMusic();
    }
    
    // Save high score and statistics
    if (saveSystem) {
        saveSystem.saveHighScore(gameState.score);
        
        const progress = saveSystem.getGameData().progress;
        progress.gamesPlayed = (progress.gamesPlayed || 0) + 1;
        progress.totalScore = (progress.totalScore || 0) + gameState.score;
        saveSystem.saveProgress(progress);
    }
    
    // Show game over screen
    const gameOverMessage = `Game Over!\nScore: ${gameState.score}\nWave: ${gameState.currentWave}`;
    
    setTimeout(() => {
        if (confirm(gameOverMessage + '\n\nPlay again?')) {
            location.reload();
        }
    }, 1000);
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

function restartGame() {
    // Play UI sound
    if (audioManager) {
        audioManager.playSound('uiClick');
    }
    
    // Confirm restart
    if (confirm('Are you sure you want to restart the game?')) {
        location.reload();
    }
}

// Initialize game when page loads
window.addEventListener('load', init);

// Make functions globally available
window.selectTowerType = selectTowerType;
window.togglePause = togglePause;
window.restartGame = restartGame;
window.showTowerSelectionModal = showTowerSelectionModal;
window.hideTowerSelectionModal = hideTowerSelectionModal;
window.placeTowerFromModal = placeTowerFromModal;