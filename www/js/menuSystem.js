// Menu System for Tower of Mitos
class MenuSystem {
    constructor() {
        this.currentMenu = 'main';
        this.gameStarted = false;
        this.selectedLevel = null;
        this.unlockedLevels = ['tutorial', 'level1']; // Default unlocked levels
        this.settings = {
            masterVolume: 1.0,
            sfxVolume: 1.0,
            musicVolume: 1.0,
            audioEnabled: true
        };
        this.init();
    }

    init() {
        this.createMenuContainer();
        this.loadSettings();
        this.showMainMenu();
    }

    createMenuContainer() {
        // Remove existing menu container if it exists
        const existingMenu = document.getElementById('menu-container');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create main menu container
        const menuContainer = document.createElement('div');
        menuContainer.id = 'menu-container';
        menuContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Arial', sans-serif;
            color: white;
        `;
        
        // Hide game container when showing menu
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
        
        document.body.appendChild(menuContainer);

        // Add background pattern
        const bgPattern = document.createElement('div');
        bgPattern.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px);
            background-size: 50px 50px;
            opacity: 0.3;
        `;
        menuContainer.appendChild(bgPattern);
    }

    showMainMenu() {
        this.currentMenu = 'main';
        const container = document.getElementById('menu-container');
        container.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px); background-size: 50px 50px; opacity: 0.3;"></div>
            <div style="text-align: center; z-index: 1; position: relative;">
                <h1 style="font-size: 4rem; margin-bottom: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); background: linear-gradient(45deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Tower of Mitos</h1>
                <p style="font-size: 1.2rem; margin-bottom: 3rem; opacity: 0.9;">3D Tower Defense Adventure</p>
                <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                    <button class="menu-btn" onclick="menuSystem.showLevelSelect()">🎮 Play</button>
                    <button class="menu-btn" onclick="menuSystem.showSettings()">⚙️ Settings</button>
                    <button class="menu-btn" onclick="menuSystem.showCredits()">👥 Credits</button>
                </div>
            </div>
        `;
        this.addMenuStyles();
    }

    showLevelSelect(page = 1) {
        this.currentMenu = 'levelSelect';
        this.currentPage = page;
        const container = document.getElementById('menu-container');
        
        // Generate levels dynamically (supporting 100+ levels)
        const totalLevels = 120; // Support up to 120 levels
        const levelsPerPage = 12; // Show 12 levels per page
        const totalPages = Math.ceil((totalLevels + 1) / levelsPerPage); // +1 for tutorial
        const startIndex = (page - 1) * levelsPerPage;
        const endIndex = Math.min(startIndex + levelsPerPage, totalLevels + 1);
        
        const levels = [];
        
        // Add tutorial as first level (index 0)
        if (page === 1) {
            levels.push({
                id: 'tutorial',
                name: 'Tutorial',
                description: 'Learn the basics of tower defense',
                difficulty: 'Beginner',
                unlocked: true // Tutorial always unlocked
            });
        }
        
        // Generate regular levels starting from level 1
        for (let i = startIndex; i < endIndex; i++) {
            if (i === 0 && page === 1) continue; // Skip first slot on page 1 (tutorial)
            
            const levelNum = i; // Level number starts from 1
            const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert', 'Nightmare'];
            const difficultyIndex = Math.floor((i - 1) / 20); // Change difficulty every 20 levels
            const difficulty = difficultyNames[Math.min(difficultyIndex, difficultyNames.length - 1)];
            
            // Define specific themes for first few levels
            let theme, description;
            if (levelNum === 1) {
                theme = 'Basic Defense';
                description = 'Learn the basics of tower defense';
            } else if (levelNum === 2) {
                theme = 'Forest Path';
                description = 'Navigate through the winding forest path';
            } else if (levelNum === 3) {
                theme = 'Mountain Pass';
                description = 'Defend the treacherous mountain passage';
            } else {
                const themes = [
                    'Desert Oasis', 'Frozen Tundra', 'Volcanic Crater',
                    'Ancient Ruins', 'Crystal Caves', 'Sky Fortress', 'Underground Maze', 'Mystic Garden',
                    'Shadow Realm', 'Golden Temple', 'Storm Valley', 'Ice Palace', 'Fire Dungeon'
                ];
                theme = themes[(levelNum - 4) % themes.length];
                description = `Challenge level ${levelNum} with ${difficulty.toLowerCase()} difficulty`;
            }
            
            levels.push({
                id: `level${levelNum}`,
                name: `Level ${levelNum} - ${theme}`,
                description: description,
                difficulty: difficulty,
                unlocked: this.unlockedLevels.includes(`level${levelNum}`) || levelNum <= 3 // First 3 levels unlocked by default
            });
        }

        let levelButtons = '';
        levels.forEach(level => {
            const isLocked = !level.unlocked;
            const lockIcon = isLocked ? '🔒 ' : '';
            const disabledClass = isLocked ? 'disabled' : '';
            const onclick = isLocked ? '' : `onclick="menuSystem.startLevel('${level.id}')"`;
            
            levelButtons += `
                <div class="level-card ${disabledClass}" ${onclick}>
                    <h3>${lockIcon}${level.name}</h3>
                    <p>${level.description}</p>
                    <span class="difficulty difficulty-${level.difficulty.toLowerCase()}">${level.difficulty}</span>
                </div>
            `;
        });
        
        // Pagination controls
        let paginationControls = '';
        if (totalPages > 1) {
            paginationControls = `
                <div class="pagination-controls">
                    ${page > 1 ? `<button class="menu-btn pagination" onclick="menuSystem.showLevelSelect(${page - 1})">← Previous</button>` : ''}
                    <span class="page-info">Page ${page} of ${totalPages}</span>
                    ${page < totalPages ? `<button class="menu-btn pagination" onclick="menuSystem.showLevelSelect(${page + 1})">Next →</button>` : ''}
                </div>
            `;
        }

        container.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px); background-size: 50px 50px; opacity: 0.3;"></div>
            <div class="level-select-container">
                <h2 style="font-size: 2.5rem; margin-bottom: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Select Level</h2>
                <div class="levels-grid">
                    ${levelButtons}
                </div>
                ${paginationControls}
                <button class="menu-btn secondary" onclick="menuSystem.showMainMenu()">← Back to Main Menu</button>
            </div>
        `;
        this.addMenuStyles();
    }

    showSettings() {
        this.currentMenu = 'settings';
        const container = document.getElementById('menu-container');
        
        // Get current quality setting
        const currentQuality = GameConfig.utils.loadQuality();
        
        container.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px); background-size: 50px 50px; opacity: 0.3;"></div>
            <div style="text-align: center; z-index: 1; position: relative; width: 90%; max-width: 600px;">
                <h2 style="font-size: 2.5rem; margin-bottom: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Settings</h2>
                <div style="background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 15px; margin-bottom: 2rem;">
                    <h3 style="color: #FFD700; margin-bottom: 1rem; text-align: left;">🎮 Graphics Quality</h3>
                    <div class="setting-item">
                        <label>Quality Level</label>
                        <select id="qualitySelect" onchange="menuSystem.updateQuality(this.value)" style="padding: 8px; border-radius: 5px; background: rgba(255,255,255,0.9); color: #333; border: none; font-size: 1rem;">
                            <option value="low" ${currentQuality === 'low' ? 'selected' : ''}>Low - Better Performance</option>
                            <option value="medium" ${currentQuality === 'medium' ? 'selected' : ''}>Medium - Balanced</option>
                            <option value="high" ${currentQuality === 'high' ? 'selected' : ''}>High - Best Quality</option>
                        </select>
                    </div>
                    <div style="margin: 1rem 0; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: left; font-size: 0.9rem;">
                        <div id="qualityDescription"></div>
                    </div>
                    
                    <h3 style="color: #FFD700; margin: 2rem 0 1rem 0; text-align: left;">🔊 Audio Settings</h3>
                    <div class="setting-item">
                        <label>Master Volume</label>
                        <input type="range" id="masterVolume" min="0" max="1" step="0.1" value="${this.settings.masterVolume}" onchange="menuSystem.updateSetting('masterVolume', this.value)">
                        <span id="masterVolumeValue">${Math.round(this.settings.masterVolume * 100)}%</span>
                    </div>
                    <div class="setting-item">
                        <label>SFX Volume</label>
                        <input type="range" id="sfxVolume" min="0" max="1" step="0.1" value="${this.settings.sfxVolume}" onchange="menuSystem.updateSetting('sfxVolume', this.value)">
                        <span id="sfxVolumeValue">${Math.round(this.settings.sfxVolume * 100)}%</span>
                    </div>
                    <div class="setting-item">
                        <label>Music Volume</label>
                        <input type="range" id="musicVolume" min="0" max="1" step="0.1" value="${this.settings.musicVolume}" onchange="menuSystem.updateSetting('musicVolume', this.value)">
                        <span id="musicVolumeValue">${Math.round(this.settings.musicVolume * 100)}%</span>
                    </div>
                    <div class="setting-item">
                        <label>Audio Enabled</label>
                        <input type="checkbox" id="audioEnabled" ${this.settings.audioEnabled ? 'checked' : ''} onchange="menuSystem.updateSetting('audioEnabled', this.checked)">
                    </div>
                </div>
                <button class="menu-btn secondary" onclick="menuSystem.showMainMenu()">← Back to Main Menu</button>
            </div>
        `;
        this.addMenuStyles();
        this.updateQualityDescription(currentQuality);
    }

    showCredits() {
        this.currentMenu = 'credits';
        const container = document.getElementById('menu-container');
        container.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px); background-size: 50px 50px; opacity: 0.3;"></div>
            <div style="text-align: center; z-index: 1; position: relative; width: 90%; max-width: 600px;">
                <h2 style="font-size: 2.5rem; margin-bottom: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Credits</h2>
                <div style="background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 15px; margin-bottom: 2rem; text-align: left;">
                    <h3 style="color: #FFD700; margin-bottom: 1rem;">Game Development</h3>
                    <p style="margin-bottom: 0.5rem;">• Game Design & Programming</p>
                    <p style="margin-bottom: 1.5rem; opacity: 0.8;">• 3D Graphics & Animation</p>
                    
                    <h3 style="color: #FFD700; margin-bottom: 1rem;">Technologies Used</h3>
                    <p style="margin-bottom: 0.5rem;">• Three.js - 3D Graphics Library</p>
                    <p style="margin-bottom: 0.5rem;">• JavaScript ES6+ - Game Logic</p>
                    <p style="margin-bottom: 0.5rem;">• HTML5 Canvas - Rendering</p>
                    <p style="margin-bottom: 1.5rem; opacity: 0.8;">• CSS3 - User Interface</p>
                    
                    <h3 style="color: #FFD700; margin-bottom: 1rem;">Special Thanks</h3>
                    <p style="margin-bottom: 0.5rem;">• Tower Defense Community</p>
                    <p style="margin-bottom: 0.5rem;">• Open Source Contributors</p>
                    <p style="opacity: 0.8;">• Beta Testers & Players</p>
                </div>
                <button class="menu-btn secondary" onclick="menuSystem.showMainMenu()">← Back to Main Menu</button>
            </div>
        `;
        this.addMenuStyles();
    }

    addMenuStyles() {
        // Remove existing styles
        const existingStyles = document.getElementById('menu-styles');
        if (existingStyles) {
            existingStyles.remove();
        }

        // Add new styles
        const styles = document.createElement('style');
        styles.id = 'menu-styles';
        styles.textContent = `
            .menu-btn {
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 1.2rem;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                min-width: 200px;
                font-weight: bold;
            }
            .menu-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.4);
                background: linear-gradient(45deg, #5CBF60, #4CAF50);
            }
            .menu-btn.secondary {
                background: linear-gradient(45deg, #666, #555);
                font-size: 1rem;
                padding: 12px 24px;
                min-width: 150px;
            }
            .menu-btn.secondary:hover {
                background: linear-gradient(45deg, #777, #666);
            }
            .level-card {
                background: rgba(255,255,255,0.1);
                border: 2px solid rgba(255,255,255,0.2);
                border-radius: 15px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .level-card:hover {
                background: rgba(255,255,255,0.2);
                border-color: rgba(255,255,255,0.4);
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            }
            .level-card.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .level-card.disabled:hover {
                transform: none;
                background: rgba(255,255,255,0.1);
                border-color: rgba(255,255,255,0.2);
                box-shadow: none;
            }
            .level-card h3 {
                margin: 0 0 0.5rem 0;
                color: #FFD700;
                font-size: 1.3rem;
            }
            .level-card p {
                margin: 0 0 1rem 0;
                opacity: 0.9;
                line-height: 1.4;
            }
            .difficulty {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            .difficulty-beginner {
                background: #4CAF50;
                color: white;
            }
            .difficulty-easy {
                background: #8BC34A;
                color: white;
            }
            .difficulty-medium {
                background: #FF9800;
                color: white;
            }
            .difficulty-hard {
                background: #F44336;
                color: white;
            }
            .difficulty-expert {
                background: #9C27B0;
                color: white;
            }
            .difficulty-nightmare {
                background: #000000;
                color: #FF0000;
                border: 1px solid #FF0000;
            }
            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding: 0.5rem 0;
            }
            .setting-item label {
                font-weight: bold;
                flex: 1;
                text-align: left;
            }
            .setting-item input[type="range"] {
                flex: 2;
                margin: 0 1rem;
            }
            .setting-item input[type="checkbox"] {
                transform: scale(1.5);
            }
            .setting-item span {
                min-width: 50px;
                text-align: right;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .level-select-container {
                text-align: center;
                z-index: 1;
                position: relative;
                width: 95%;
                max-width: 1200px;
                padding: 20px;
                max-height: 90vh;
                overflow-y: auto;
                overflow-x: hidden;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 215, 0, 0.5) rgba(255, 255, 255, 0.1);
            }
            
            .level-select-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .level-select-container::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            
            .level-select-container::-webkit-scrollbar-thumb {
                background: rgba(255, 215, 0, 0.5);
                border-radius: 4px;
            }
            
            .level-select-container::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 215, 0, 0.7);
            }
            
            .levels-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .pagination-controls {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 2rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }
            
            .menu-btn.pagination {
                background: linear-gradient(45deg, #2196F3, #1976D2);
                padding: 10px 20px;
                font-size: 1rem;
                min-width: 120px;
            }
            
            .menu-btn.pagination:hover {
                background: linear-gradient(45deg, #42A5F5, #2196F3);
            }
            
            .page-info {
                font-size: 1.1rem;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                min-width: 120px;
            }
            
            /* Responsive design for landscape orientation */
            @media screen and (orientation: landscape) {
                #menu-container {
                    padding: 15px;
                }
                
                #menu-container h1 {
                    font-size: 3rem !important;
                    margin-bottom: 1.5rem !important;
                }
                
                #menu-container h2 {
                    font-size: 2.2rem !important;
                    margin-bottom: 1.5rem !important;
                }
                
                #menu-container p {
                    font-size: 1rem !important;
                    margin-bottom: 2rem !important;
                }
                
                .menu-btn {
                    padding: 12px 25px !important;
                    font-size: 1.1rem !important;
                    min-width: 180px !important;
                }
                
                /* Settings responsive */
                #menu-container > div {
                    max-height: 85vh !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
                
                .setting-item {
                    margin-bottom: 0.8rem !important;
                    padding: 0.3rem 0 !important;
                }
                
                .setting-item label {
                    font-size: 0.9rem !important;
                }
                
                .setting-item input[type="range"] {
                    margin: 0 0.5rem !important;
                }
                
                .setting-item span {
                    font-size: 0.9rem !important;
                }
                
                .level-select-container {
                    padding: 15px;
                    max-height: 85vh !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
                
                .level-select-container h2 {
                    font-size: 2.2rem !important;
                    margin-bottom: 1.5rem !important;
                }
                
                .levels-grid {
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
                    gap: 0.8rem !important;
                }
                
                .level-card {
                    padding: 1.2rem !important;
                }
                
                .level-card h3 {
                    font-size: 1.2rem !important;
                }
                
                .pagination-controls {
                    gap: 1.5rem !important;
                    margin-bottom: 1.5rem !important;
                }
                
                .menu-btn.pagination {
                    padding: 8px 16px !important;
                    font-size: 0.9rem !important;
                    min-width: 100px !important;
                }
                
                .page-info {
                    font-size: 1rem !important;
                }
            }
            
            @media screen and (orientation: landscape) and (max-height: 600px) {
                #menu-container {
                    padding: 10px;
                }
                
                #menu-container h1 {
                    font-size: 2.5rem !important;
                    margin-bottom: 1rem !important;
                }
                
                #menu-container p {
                    font-size: 0.9rem !important;
                    margin-bottom: 1.5rem !important;
                }
                
                .menu-btn {
                    padding: 10px 20px !important;
                    font-size: 1rem !important;
                    min-width: 160px !important;
                }
                
                .level-select-container {
                    padding: 10px;
                    max-height: 80vh !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
                
                .level-select-container h2 {
                    font-size: 2rem !important;
                    margin-bottom: 1rem !important;
                }
                
                .levels-grid {
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
                    gap: 0.6rem !important;
                    margin-bottom: 1.5rem !important;
                }
                
                .level-card {
                    padding: 1rem !important;
                }
                
                .level-card h3 {
                    font-size: 1.1rem !important;
                    margin-bottom: 0.3rem !important;
                }
                
                .level-card p {
                    font-size: 0.9rem !important;
                    margin-bottom: 0.5rem !important;
                }
                
                .pagination-controls {
                    gap: 1rem !important;
                    margin-bottom: 1rem !important;
                }
                
                .menu-btn.pagination {
                    padding: 6px 12px !important;
                    font-size: 0.8rem !important;
                    min-width: 80px !important;
                }
                
                .page-info {
                    font-size: 0.9rem !important;
                }
            }
            
            @media screen and (orientation: landscape) and (max-height: 480px) {
                #menu-container {
                    padding: 5px;
                }
                
                #menu-container h1 {
                    font-size: 2rem !important;
                    margin-bottom: 0.8rem !important;
                }
                
                #menu-container p {
                    font-size: 0.8rem !important;
                    margin-bottom: 1rem !important;
                }
                
                .menu-btn {
                    padding: 8px 16px !important;
                    font-size: 0.9rem !important;
                    min-width: 140px !important;
                    gap: 0.5rem !important;
                }
                
                .level-select-container {
                    padding: 5px;
                    max-height: 75vh !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
                
                .level-select-container h2 {
                    font-size: 1.8rem !important;
                    margin-bottom: 0.8rem !important;
                }
                
                .levels-grid {
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
                    gap: 0.5rem !important;
                    margin-bottom: 1rem !important;
                }
                
                .level-card {
                    padding: 0.8rem !important;
                }
                
                .level-card h3 {
                    font-size: 1rem !important;
                    margin-bottom: 0.2rem !important;
                }
                
                .level-card p {
                    font-size: 0.8rem !important;
                    margin-bottom: 0.3rem !important;
                }
                
                .difficulty {
                    font-size: 0.7rem !important;
                    padding: 2px 6px !important;
                }
                
                .pagination-controls {
                    gap: 0.8rem !important;
                    margin-bottom: 0.8rem !important;
                }
                
                .menu-btn.pagination {
                    padding: 5px 10px !important;
                    font-size: 0.7rem !important;
                    min-width: 70px !important;
                }
                
                .page-info {
                    font-size: 0.8rem !important;
                }
                
                .menu-btn.secondary {
                    padding: 6px 12px !important;
                    font-size: 0.8rem !important;
                }
            }
            
            /* Mobile and Android specific optimizations */
            @media screen and (max-width: 768px) {
                .level-select-container {
                    max-height: 85vh !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    -webkit-overflow-scrolling: touch !important;
                    scroll-behavior: smooth;
                }
                
                .levels-grid {
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
                    gap: 1rem !important;
                }
            }
            
            @media screen and (max-width: 480px) {
                .level-select-container {
                    max-height: 80vh !important;
                    padding: 10px !important;
                }
                
                .levels-grid {
                    grid-template-columns: 1fr !important;
                    gap: 0.8rem !important;
                }
                
                .level-card {
                    padding: 1rem !important;
                }
            }
            
            /* Android Chrome specific fixes */
            @media screen and (-webkit-min-device-pixel-ratio: 1) {
                .level-select-container {
                    -webkit-overflow-scrolling: touch !important;
                    transform: translateZ(0) !important;
                    will-change: scroll-position !important;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    updateSetting(setting, value) {
        if (setting === 'audioEnabled') {
            this.settings[setting] = value;
        } else {
            this.settings[setting] = parseFloat(value);
            document.getElementById(setting + 'Value').textContent = Math.round(value * 100) + '%';
        }
        this.saveSettings();
        
        // Apply settings to audio manager if available
        if (typeof audioManager !== 'undefined' && audioManager) {
            switch(setting) {
                case 'masterVolume':
                    audioManager.setMasterVolume(value);
                    break;
                case 'sfxVolume':
                    audioManager.setSFXVolume(value);
                    break;
                case 'musicVolume':
                    audioManager.setMusicVolume(value);
                    break;
                case 'audioEnabled':
                    audioManager.setEnabled(value);
                    break;
            }
        }
    }
    
    updateQuality(qualityLevel) {
        if (GameConfig.utils.setQuality(qualityLevel)) {
            this.updateQualityDescription(qualityLevel);
            
            // Show notification that game needs restart for full effect
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(76, 175, 80, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                font-size: 1rem;
                z-index: 20000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = 'Quality settings updated! Restart game for full effect.';
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
        }
    }
    
    updateQualityDescription(qualityLevel) {
        const descriptions = {
            low: {
                title: 'Low Quality Settings:',
                features: [
                    '• Shadows: Disabled',
                    '• Antialiasing: Disabled', 
                    '• Particle Effects: Disabled',
                    '• Fog Effects: Disabled',
                    '• Shadow Resolution: 512px',
                    '• Max Particles: 20',
                    '• Best for older devices or better performance'
                ]
            },
            medium: {
                title: 'Medium Quality Settings:',
                features: [
                    '• Shadows: Enabled',
                    '• Antialiasing: Disabled',
                    '• Particle Effects: Enabled',
                    '• Fog Effects: Enabled', 
                    '• Shadow Resolution: 1024px',
                    '• Max Particles: 35',
                    '• Balanced performance and visual quality'
                ]
            },
            high: {
                title: 'High Quality Settings:',
                features: [
                    '• Shadows: Enabled',
                    '• Antialiasing: Enabled',
                    '• Particle Effects: Enabled',
                    '• Fog Effects: Enabled',
                    '• Shadow Resolution: 2048px',
                    '• Max Particles: 50',
                    '• Best visual quality (recommended)'
                ]
            }
        };
        
        const descElement = document.getElementById('qualityDescription');
        if (descElement && descriptions[qualityLevel]) {
            const desc = descriptions[qualityLevel];
            descElement.innerHTML = `
                <strong style="color: #FFD700;">${desc.title}</strong><br>
                ${desc.features.join('<br>')}
            `;
        }
    }

    startLevel(levelId) {
        // Clean up tutorial overlay if starting non-tutorial level
        if (levelId !== 'tutorial' && typeof window.closeTutorial === 'function') {
            window.closeTutorial();
        }
        
        this.selectedLevel = levelId;
        this.hideMenu();
        
        // Load the appropriate level
        if (levelId === 'tutorial') {
            this.loadTutorialLevel();
        } else if (levelId === 'level1') {
            this.loadLevel('js/levels/level1.js');
        } else if (levelId === 'level2') {
            this.loadLevel('js/levels/level2.js');
        } else if (levelId === 'level3') {
            this.loadLevel('js/levels/level3.js');
        } else {
            // For other levels, use existing level system
            this.startGame();
        }
    }
    
    loadLevel(levelPath) {
        // Load level script dynamically
        const script = document.createElement('script');
        script.src = levelPath;
        script.onload = () => {
            this.startGame();
        };
        script.onerror = () => {
            console.error(`Failed to load level: ${levelPath}`);
            alert(`Level file not found: ${levelPath}`);
        };
        document.head.appendChild(script);
    }

    loadTutorialLevel() {
        // Create tutorial level configuration
        window.TutorialLevel = {
            info: {
                name: 'Tutorial - Learn the Basics',
                description: 'Learn how to play Tower of Mitos',
                difficulty: 'Beginner'
            },
            availableTowers: ['basic'],
            enemies: {
                types: {
                    tuyul: {
                        health: 50,
                        speed: 0.01,
                        reward: 15,
                        color: 0xFF4500,
                        size: 0.3
                    }
                }
            },
            waves: [
                {
                    waveNumber: 1,
                    totalEnemies: 3,
                    spawnInterval: 2000,
                    enemies: [{ type: 'tuyul', count: 3 }],
                    autoStart: false
                }
            ],
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
            settings: {
                startingMoney: 300,
                startingHealth: 30,
                waveDelay: 5000,
                enemySpawnDelay: 3000
            },
            tutorial: true,
            visual: {
                skyColor: 0x87CEEB,
                fogColor: 0x87CEEB,
                lightingIntensity: 1.0,
                particleEffects: true
            }
        };
        
        // Override Level1 with tutorial for this session
        window.Level1 = window.TutorialLevel;
        this.startGame();
    }

    startGame() {
        try {
            // Show game container and hide menu
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.style.display = 'block';
            }
            
            // Hide game status if visible
            const gameStatus = document.getElementById('gameStatus');
            if (gameStatus) {
                gameStatus.style.display = 'none';
            }
            
            // Hide menu
            this.hideMenu();
            this.gameStarted = true;
            
            // Initialize game if functions exist
            if (typeof window.init === 'function') {
                window.init();
            } else {
                console.error('Game init function not found');
                return;
            }
            
            if (typeof window.animate === 'function') {
                window.animate(performance.now());
            } else {
                console.error('Game animate function not found');
            }
            
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }

    hideMenu() {
        const container = document.getElementById('menu-container');
        if (container) {
            container.style.display = 'none';
        }
        
        // Show game container when hiding menu
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
    }

    showMenu() {
        // Hide game container when showing menu
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
        
        const container = document.getElementById('menu-container');
        if (container) {
            container.style.display = 'flex';
            this.showMainMenu();
        } else {
            // Recreate menu if it doesn't exist
            this.createMenuContainer();
            this.showMainMenu();
        }
    }

    saveSettings() {
        localStorage.setItem('towerOfMitosSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('towerOfMitosSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        
        // Load unlocked levels
        const unlockedLevels = localStorage.getItem('towerOfMitosUnlockedLevels');
        if (unlockedLevels) {
            this.unlockedLevels = JSON.parse(unlockedLevels);
        }
    }

    unlockLevel(levelId) {
        if (!this.unlockedLevels.includes(levelId)) {
            this.unlockedLevels.push(levelId);
            localStorage.setItem('towerOfMitosUnlockedLevels', JSON.stringify(this.unlockedLevels));
        }
    }

    // Add method to return to menu from game
    returnToMenu() {
        // Clean up tutorial overlay if it exists
        if (typeof window.closeTutorial === 'function') {
            window.closeTutorial();
        }
        
        // Stop game if running
        if (this.gameStarted) {
            this.gameStarted = false;
            
            // Stop the game loop properly
            if (typeof window.gameState !== 'undefined') {
                window.gameState.gameRunning = false;
            }
            
            // Dispose of Three.js resources properly
            if (typeof window.renderer !== 'undefined' && window.renderer) {
                // Remove renderer from DOM
                const gameContainer = document.getElementById('gameContainer');
                if (gameContainer && window.renderer.domElement && gameContainer.contains(window.renderer.domElement)) {
                    gameContainer.removeChild(window.renderer.domElement);
                }
                
                // Dispose renderer
                window.renderer.dispose();
                window.renderer = null;
            }
            
            // Clear scene objects
            if (typeof window.scene !== 'undefined' && window.scene) {
                // Dispose of all geometries and materials
                window.scene.traverse((object) => {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
                
                // Clear scene
                while(window.scene.children.length > 0) {
                    window.scene.remove(window.scene.children[0]);
                }
                window.scene = null;
            }
            
            // Reset game variables
            window.camera = null;
            window.gameMap = null;
            window.enemies = [];
            window.towers = [];
            window.projectiles = [];
            
            // Clear any intervals or timeouts
            if (typeof window.waveInterval !== 'undefined') {
                clearInterval(window.waveInterval);
                window.waveInterval = null;
            }
        }
        this.showMenu();
    }
}

// Initialize menu system when DOM is loaded
let menuSystem;

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        menuSystem = new MenuSystem();
        console.log('Menu system initialized on DOMContentLoaded');
    });
} else {
    // DOM is already loaded
    menuSystem = new MenuSystem();
    console.log('Menu system initialized immediately');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuSystem;
} else {
    window.MenuSystem = MenuSystem;
}