// Mobile Controls - Touch gestures and mobile-specific controls
class MobileControls {
    constructor(renderer, camera, gameInstance) {
        this.renderer = renderer;
        this.camera = camera;
        this.game = gameInstance;
        this.canvas = renderer.domElement;
        
        // Touch state
        this.touches = new Map();
        this.lastTouchDistance = 0;
        this.lastTouchCenter = { x: 0, y: 0 };
        this.isPanning = false;
        this.isZooming = false;
        
        // Tower selection
        this.selectedTowerType = 'basic';
        
        // Camera controls
        this.cameraTarget = new THREE.Vector3(20, 0, 7.5);
        this.cameraZoom = 1.0;
        this.minZoom = GameConfig.mobile.zoomMin;
        this.maxZoom = GameConfig.mobile.zoomMax;
        this.panSpeed = GameConfig.mobile.panSpeed;
        this.touchSensitivity = GameConfig.mobile.touchSensitivity;
        
        // Performance optimization
        this.lastCameraUpdate = 0;
        this.cameraUpdateThrottle = 16; // ~60fps
        this.pendingCameraUpdate = false;
        
        // UI elements
        this.uiElements = new Map();
        this.selectedTower = null;
        this.towerMenu = null;
        
        this.init();
    }
    
    init() {
        this.setupTouchEvents();
        // Initialize mobile UI only on mobile devices
        if (GameConfig.utils.isMobile()) {
            this.createMobileUI();
        }
        this.setupOrientationChange();
    }
    
    // Setup touch event listeners
    setupTouchEvents() {
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this.onTouchEnd.bind(this), { passive: false });
        
        // Prevent context menu on long press
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent zoom on double tap
        this.canvas.addEventListener('gesturestart', (e) => e.preventDefault());
        this.canvas.addEventListener('gesturechange', (e) => e.preventDefault());
        this.canvas.addEventListener('gestureend', (e) => e.preventDefault());
    }
    
    // Handle touch start
    onTouchStart(event) {
        event.preventDefault();
        
        const touches = event.touches;
        
        // Store touch information
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now()
            });
        }
        
        if (touches.length === 1) {
            // Single touch - potential tap or pan start
            this.isPanning = false;
        } else if (touches.length === 2) {
            // Two finger touch - zoom start
            this.isZooming = true;
            this.isPanning = true;
            
            const touch1 = touches[0];
            const touch2 = touches[1];
            
            this.lastTouchDistance = this.getTouchDistance(touch1, touch2);
            this.lastTouchCenter = this.getTouchCenter(touch1, touch2);
        }
    }
    
    // Handle touch move
    onTouchMove(event) {
        event.preventDefault();
        
        const touches = event.touches;
        
        if (touches.length === 1 && !this.isZooming) {
            // Single finger pan
            const touch = touches[0];
            const storedTouch = this.touches.get(touch.identifier);
            
            if (storedTouch) {
                const deltaX = touch.clientX - storedTouch.x;
                const deltaY = touch.clientY - storedTouch.y;
                
                // Check if movement is significant enough to be a pan
                if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                    this.isPanning = true;
                    this.panCamera(deltaX, deltaY);
                }
                
                // Update stored position
                storedTouch.x = touch.clientX;
                storedTouch.y = touch.clientY;
            }
        } else if (touches.length === 2) {
            // Two finger zoom and pan
            const touch1 = touches[0];
            const touch2 = touches[1];
            
            const currentDistance = this.getTouchDistance(touch1, touch2);
            const currentCenter = this.getTouchCenter(touch1, touch2);
            
            // Zoom
            if (this.lastTouchDistance > 0) {
                const zoomFactor = currentDistance / this.lastTouchDistance;
                this.zoomCamera(zoomFactor);
            }
            
            // Pan
            const deltaX = currentCenter.x - this.lastTouchCenter.x;
            const deltaY = currentCenter.y - this.lastTouchCenter.y;
            this.panCamera(deltaX, deltaY);
            
            this.lastTouchDistance = currentDistance;
            this.lastTouchCenter = currentCenter;
        }
    }
    
    // Handle touch end
    onTouchEnd(event) {
        event.preventDefault();
        
        const changedTouches = event.changedTouches;
        
        // Remove ended touches
        for (let i = 0; i < changedTouches.length; i++) {
            const touch = changedTouches[i];
            const storedTouch = this.touches.get(touch.identifier);
            
            if (storedTouch && !this.isPanning) {
                // Check if this was a tap - more lenient for mobile
                const duration = Date.now() - storedTouch.startTime;
                const distance = Math.sqrt(
                    Math.pow(touch.clientX - storedTouch.startX, 2) +
                    Math.pow(touch.clientY - storedTouch.startY, 2)
                );
                
                // Use config values for mobile tolerance
                const tapThreshold = GameConfig.mobile.tapThreshold || 20;
                const tapDuration = GameConfig.mobile.tapDuration || 500;
                
                if (duration < tapDuration && distance < tapThreshold) {
                    this.handleTap(touch.clientX, touch.clientY);
                }
            }
            
            this.touches.delete(touch.identifier);
        }
        
        // Reset states if no touches remain
        if (event.touches.length === 0) {
            this.isPanning = false;
            this.isZooming = false;
            this.lastTouchDistance = 0;
        }
    }
    
    // Handle tap events
    handleTap(x, y) {
        // Get canvas bounds for accurate coordinate conversion
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;
        
        // Convert screen coordinates to normalized device coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (canvasX / rect.width) * 2 - 1;
        mouse.y = -(canvasY / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Increase raycaster precision for mobile
        raycaster.params.Points.threshold = 0.5;
        raycaster.params.Line.threshold = 0.5;
        
        // Check for game object intersections
        if (this.game && this.game.scene) {
            const intersects = raycaster.intersectObjects(this.game.scene.children, true);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                
                // Handle tower placement or selection
                if (object.userData && object.userData.type === 'towerSlot') {
                    this.handleTowerSlotTap(object.userData.x, object.userData.z);
                } else if (object.userData && object.userData.type === 'tower') {
                    this.handleTowerTap(object.userData);
                } else {
                    // If no specific object hit, try to find nearest tower slot
                    this.findNearestTowerSlot(intersects[0].point);
                }
            }
        }
    }
    
    // Handle tower slot tap
    handleTowerSlotTap(x, z) {
        // Add visual feedback for successful tap
        this.showTapFeedback(x, z);
        
        // Show tower selection modal
        if (window.showTowerSelectionModal) {
            window.showTowerSelectionModal(x, z);
        }
    }
    
    // Show visual feedback for tap
    showTapFeedback(x, z) {
        if (!this.game || !this.game.scene) return;
        
        // Create a temporary highlight circle
        const geometry = new THREE.RingGeometry(0.3, 0.5, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00FF00,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const highlight = new THREE.Mesh(geometry, material);
        highlight.position.set(x, 0.1, z);
        highlight.rotation.x = -Math.PI / 2;
        
        this.game.scene.add(highlight);
        
        // Animate and remove after short time
        let opacity = 0.8;
        const fadeOut = setInterval(() => {
            opacity -= 0.1;
            highlight.material.opacity = opacity;
            
            if (opacity <= 0) {
                this.game.scene.remove(highlight);
                clearInterval(fadeOut);
            }
        }, 50);
    }
    
    // Handle tower tap
    handleTowerTap(towerData) {
        this.selectedTower = towerData;
        this.showTowerUpgradeMenu(towerData);
    }
    
    // Find nearest tower slot when touch doesn't hit exact object
    findNearestTowerSlot(worldPoint) {
        if (!this.game || !this.game.mapLayout) return;
        
        const mapLayout = this.game.mapLayout;
        let nearestSlot = null;
        let minDistance = Infinity;
        const maxDistance = GameConfig.mobile.towerSlotTolerance || 1.5; // Maximum distance to consider a valid slot
        
        // Check all possible tower slots in the map
        for (let z = 0; z < mapLayout.length; z++) {
            for (let x = 0; x < mapLayout[z].length; x++) {
                // Check if this is a valid tower placement spot (tower slot)
                if (mapLayout[z][x] === 2) {
                    const slotWorldPos = new THREE.Vector3(x, 0, z);
                    const distance = worldPoint.distanceTo(slotWorldPos);
                    
                    if (distance < minDistance && distance < maxDistance) {
                        minDistance = distance;
                        nearestSlot = { x, z };
                    }
                }
            }
        }
        
        // If we found a nearby slot, treat it as a tower slot tap
        if (nearestSlot) {
            this.handleTowerSlotTap(nearestSlot.x, nearestSlot.z);
        }
    }
    
    // Pan camera
    panCamera(deltaX, deltaY) {
        // Don't pan if OrbitControls is enabled
        if (window.isOrbitControlsEnabled) return;
        
        const panFactor = this.panSpeed * this.cameraZoom;
        
        // Convert screen movement to world movement
        // Invert deltaY to fix inverted vertical scrolling
        const worldDeltaX = -deltaX * panFactor * 0.01;
        const worldDeltaZ = -deltaY * panFactor * 0.01;
        
        this.cameraTarget.x += worldDeltaX;
        this.cameraTarget.z += worldDeltaZ;
        
        // Clamp camera position to map bounds with buffer
        const mapWidth = GameConfig.camera.mapWidth;
        const mapHeight = GameConfig.camera.mapHeight;
        const buffer = 5; // Allow some movement outside strict bounds
        
        this.cameraTarget.x = Math.max(-mapWidth/4 - buffer, Math.min(mapWidth + mapWidth/4 + buffer, this.cameraTarget.x));
        this.cameraTarget.z = Math.max(-mapHeight/4 - buffer, Math.min(mapHeight + mapHeight/4 + buffer, this.cameraTarget.z));
        
        // Update camera
        this.updateCamera();
    }
    
    // Zoom camera
    zoomCamera(factor) {
        this.cameraZoom *= factor;
        this.cameraZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.cameraZoom));
        
        this.updateCamera();
    }
    
    // Update camera position and zoom (optimized with throttling)
    updateCamera() {
        const now = performance.now();
        
        // Throttle camera updates for better performance
        if (now - this.lastCameraUpdate < this.cameraUpdateThrottle) {
            if (!this.pendingCameraUpdate) {
                this.pendingCameraUpdate = true;
                requestAnimationFrame(() => {
                    this.pendingCameraUpdate = false;
                    this.performCameraUpdate();
                });
            }
            return;
        }
        
        this.performCameraUpdate();
        this.lastCameraUpdate = now;
    }
    
    // Perform actual camera update
    performCameraUpdate() {
        if (this.camera.isOrthographicCamera) {
            const aspect = window.innerWidth / window.innerHeight;
            const mapWidth = GameConfig.camera.mapWidth;
            const mapHeight = GameConfig.camera.mapHeight;
            
            const zoom = this.cameraZoom;
            
            if (aspect > mapWidth / mapHeight) {
                const width = (mapHeight * aspect) / zoom;
                this.camera.left = -width / 2;
                this.camera.right = width / 2;
                this.camera.top = mapHeight / (2 * zoom);
                this.camera.bottom = -mapHeight / (2 * zoom);
            } else {
                const height = (mapWidth / aspect) / zoom;
                this.camera.left = -mapWidth / (2 * zoom);
                this.camera.right = mapWidth / (2 * zoom);
                this.camera.top = height / 2;
                this.camera.bottom = -height / 2;
            }
            
            this.camera.updateProjectionMatrix();
        }
        
        // Update camera position
        this.camera.position.x = this.cameraTarget.x;
        this.camera.position.z = this.cameraTarget.z;
        this.camera.lookAt(this.cameraTarget);
    }
    
    // Get distance between two touches
    getTouchDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }
    
    // Get center point between two touches
    getTouchCenter(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }
    
    // Create mobile-specific UI
    createMobileUI() {
        // Add responsive CSS
        this.addResponsiveCSS();
        
        // Note: Zoom controls removed - now handled by OrbitControls
        // Note: Tower selection is now handled by modal in HTML
        // Game controls (start wave, pause, restart) are now in HTML on the right side
        
        // Ensure UI is visible and properly positioned
        setTimeout(() => {
            this.adjustUIForOrientation();
            this.ensureUIVisibility();
        }, 100);
    }
    
    // Add responsive CSS for mobile UI
    addResponsiveCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile responsive adjustments */
            @media screen and (max-width: 768px) {
                #game-stats {
                    padding: 8px 15px !important;
                    font-size: 12px !important;
                }
                
                .stat-item {
                    padding: 3px 8px !important;
                    min-width: 70px !important;
                    font-size: 11px !important;
                }
                
                /* Zoom panel styles removed - zoom now handled by OrbitControls */
                
                #game-controls-right {
                    right: 15px !important;
                    gap: 10px !important;
                }
                
                #game-controls-right button {
                    padding: 10px 12px !important;
                    font-size: 12px !important;
                    min-width: 80px !important;
                }
            }
            
            @media screen and (max-width: 480px) {
                #game-stats {
                    padding: 5px 10px !important;
                    font-size: 10px !important;
                    flex-wrap: wrap !important;
                }
                
                .stat-item {
                    padding: 2px 6px !important;
                    min-width: 60px !important;
                    font-size: 10px !important;
                }
                
                /* Zoom panel button styles removed */
                
                #game-controls-right button {
                    padding: 8px 10px !important;
                    font-size: 11px !important;
                    min-width: 70px !important;
                }
            }
            
            @media screen and (orientation: landscape) and (max-height: 500px) {
                #game-stats {
                    padding: 5px 15px !important;
                    font-size: 11px !important;
                }
                
                .stat-item {
                    padding: 2px 5px !important;
                    min-width: 55px !important;
                    font-size: 9px !important;
                }
                
                /* Zoom panel landscape styles removed */
                
                #game-controls-right {
                    gap: 8px !important;
                }
                
                #game-controls-right button {
                    padding: 6px 8px !important;
                    font-size: 10px !important;
                    min-width: 60px !important;
                }
            }
            
            /* Safe area support for notched devices */
            @supports (padding: max(0px)) {
                #game-stats {
                    padding-top: max(10px, env(safe-area-inset-top)) !important;
                    padding-left: max(20px, env(safe-area-inset-left)) !important;
                    padding-right: max(20px, env(safe-area-inset-right)) !important;
                }
                
                /* Zoom panel safe area styles removed */
                
                #game-controls-right {
                    right: max(20px, env(safe-area-inset-right)) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    

    
    // Zoom controls removed - now handled by OrbitControls in 3D Perspective mode
    

    
    // Show tower menu
    showTowerMenu(x, z) {
        // Implementation for tower selection menu
        console.log(`Show tower menu at ${x}, ${z}`);
    }
    
    // Show tower placement indicators for mobile
    showTowerPlacementIndicators() {
        if (!this.game || !this.game.scene || !this.game.mapLayout) return;
        
        const mapLayout = this.game.mapLayout;
        const indicators = [];
        
        // Create indicators for all valid tower placement spots
        for (let z = 0; z < mapLayout.length; z++) {
            for (let x = 0; x < mapLayout[z].length; x++) {
                if (mapLayout[z][x] === 2) { // Tower slot
                    const geometry = new THREE.RingGeometry(0.2, 0.4, 12);
                    const material = new THREE.MeshBasicMaterial({
                        color: 0x00FF00,
                        transparent: true,
                        opacity: 0.3,
                        side: THREE.DoubleSide
                    });
                    
                    const indicator = new THREE.Mesh(geometry, material);
                    indicator.position.set(x, 0.05, z);
                    indicator.rotation.x = -Math.PI / 2;
                    indicator.userData = { type: 'towerIndicator' };
                    
                    this.game.scene.add(indicator);
                    indicators.push(indicator);
                }
            }
        }
        
        // Store indicators for later removal
        this.towerIndicators = indicators;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideTowerPlacementIndicators();
        }, 3000);
    }
    
    // Hide tower placement indicators
    hideTowerPlacementIndicators() {
        if (this.towerIndicators && this.game && this.game.scene) {
            this.towerIndicators.forEach(indicator => {
                this.game.scene.remove(indicator);
            });
            this.towerIndicators = [];
        }
    }
    
    // Show tower upgrade menu
    showTowerUpgradeMenu(towerData) {
        // Implementation for tower upgrade menu
        console.log('Show tower upgrade menu for:', towerData);
        
        // Call the actual showTowerUpgradeModal function from game.js
        if (window.showTowerUpgradeModal && towerData.x !== undefined && towerData.z !== undefined) {
            window.showTowerUpgradeModal(towerData.x, towerData.z);
        } else {
            console.error('showTowerUpgradeModal function not found or invalid tower data:', towerData);
        }
    }
    
    // Select tower type
    selectTowerType(type) {
        // Store selected tower type
        this.selectedTowerType = type;
        console.log('Selected tower type:', type);
        
        // Show tower placement indicators when selecting a tower type
        this.showTowerPlacementIndicators();
        
        // Update selected tower type in game
        if (this.game && this.game.setSelectedTowerType) {
            this.game.setSelectedTowerType(type);
        }
        
        // Update button visual feedback
        this.updateTowerButtonSelection(type);
    }
    
    // Update tower button visual feedback
    updateTowerButtonSelection(selectedType) {
        const towerPanel = this.uiElements.get('towerPanel');
        if (!towerPanel) return;
        
        const buttons = towerPanel.querySelectorAll('button');
        buttons.forEach(button => {
            const buttonType = button.textContent.toLowerCase();
            if (buttonType === selectedType) {
                button.style.background = 'rgba(33, 150, 243, 1.0)';
                button.style.transform = 'scale(1.1)';
            } else {
                button.style.background = 'rgba(33, 150, 243, 0.8)';
                button.style.transform = 'scale(1.0)';
            }
        });
    }
    
    // Toggle pause
    togglePause() {
        if (this.game && this.game.togglePause) {
            this.game.togglePause();
        }
    }
    
    // Setup orientation change handling
    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateCamera();
                this.adjustUIForOrientation();
                if (this.game && this.game.onWindowResize) {
                    this.game.onWindowResize();
                }
            }, 100);
        });
        
        window.addEventListener('resize', () => {
            this.updateCamera();
            this.adjustUIForOrientation();
        });
    }
    
    // Adjust UI elements based on screen orientation and size
    adjustUIForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const isSmallScreen = window.innerWidth < 480 || window.innerHeight < 480;
        
        // Get UI elements
        const gameStats = document.getElementById('game-stats');
        const zoomPanel = document.getElementById('zoomPanel');
        const gameControls = document.getElementById('game-controls-right');
        
        if (isLandscape && isSmallScreen) {
            // Compact layout for small landscape screens
            if (gameStats) {
                gameStats.style.padding = '5px 15px';
                gameStats.style.fontSize = '11px';
            }
            
            if (zoomPanel) {
                zoomPanel.style.gap = '5px';
            }
            
            if (gameControls) {
                gameControls.style.gap = '8px';
            }
        } else {
            // Standard layout
            if (gameStats) {
                gameStats.style.padding = '10px 20px';
                gameStats.style.fontSize = '14px';
            }
            
            if (zoomPanel) {
                zoomPanel.style.gap = '10px';
            }
            
            if (gameControls) {
                gameControls.style.gap = '15px';
            }
        }
        
        // Ensure UI elements are visible
        this.ensureUIVisibility();
    }
    
    // Ensure UI elements are visible and properly positioned
    ensureUIVisibility() {
        const uiElements = [
            { id: 'game-stats', name: 'Game Stats' },
            { id: 'zoomPanel', name: 'Zoom Panel' },
            { id: 'game-controls-right', name: 'Game Controls' }
        ];
        
        uiElements.forEach(element => {
            const el = document.getElementById(element.id);
            if (el) {
                el.style.display = 'flex';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
                console.log(`${element.name} is now visible`);
            } else {
                console.warn(`${element.name} element not found`);
            }
        });
    }
    
    // Cleanup
    destroy() {
        // Remove event listeners
        this.canvas.removeEventListener('touchstart', this.onTouchStart);
        this.canvas.removeEventListener('touchmove', this.onTouchMove);
        this.canvas.removeEventListener('touchend', this.onTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
        
        // Remove UI elements
        this.uiElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        this.uiElements.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileControls;
} else {
    window.MobileControls = MobileControls;
}