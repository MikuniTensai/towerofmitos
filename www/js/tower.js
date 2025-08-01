// Tower System - Modular Tower Management
class TowerSystem {
    constructor() {
        // DAMAGE TYPE SYSTEM:
        // light = efektif terhadap enemy dengan weakness 'light'
        // heavy = efektif terhadap enemy dengan weakness 'heavy' 
        // magical = efektif terhadap enemy dengan weakness 'magical'
        // aerial = efektif terhadap enemy dengan weakness 'aerial'
        // piercing = efektif terhadap enemy dengan weakness 'piercing'
        
        this.towerTypes = {
            basic: {
                name: 'Lilin Pemanggil Arwah',
                cost: 50,
                damage: 50,
                range: 3,
                fireRate: 1000, // ms
                color: 0x4169E1,
                projectileSpeed: 0.1,
                special: null,
                damageType: 'light', // Efektif vs basic, jalangkung enemies
                description: 'Standard tower with light damage'
            },
            slow: {
                name: 'Dupa Penenang Jiwa',
                cost: 75,
                damage: 15,
                range: 2.5,
                fireRate: 1500,
                color: 0x00BFFF,
                projectileSpeed: 0.08,
                special: 'slow',
                slowEffect: 2.0, // 200% speed reduction (super slow)
                slowDuration: 2000, // 2 seconds
                damageType: 'magical', // Efektif vs stealth, roh tanah bangkit enemies
                description: 'Magical tower that slows enemies significantly'
            },
            splash: {
                name: 'Meriam Sesajen',
                cost: 100,
                damage: 40,
                range: 2,
                fireRate: 2000,
                color: 0xFF4500,
                projectileSpeed: 0.12,
                special: 'splash',
                splashRadius: 1.5,
                damageType: 'heavy', // Efektif vs genderuwo, mbok dukun pikun enemies
                description: 'Heavy damage tower with splash effect'
            },
            
            // NEW TOWER TYPES FOR FUTURE LEVELS
            antiair: {
                name: 'Tombak Garuda',
                cost: 120,
                damage: 35,
                range: 4,
                fireRate: 800,
                color: 0x32CD32,
                projectileSpeed: 0.15,
                special: 'homing',
                damageType: 'aerial', // Efektif vs kuntilanak enemies
                description: 'Specialized tower for aerial targets'
            },
            piercing: {
                name: 'Keris Pusaka',
                cost: 150,
                damage: 60,
                range: 3.5,
                fireRate: 2500,
                color: 0x9932CC,
                projectileSpeed: 0.2,
                special: 'pierce',
                pierceCount: 3, // Menembus 3 enemy
                damageType: 'piercing', // Efektif vs lembusura, shielded enemies
                description: 'High damage tower that pierces armor'
            },
            freeze: {
                name: 'Kristal Es Kutub',
                cost: 90,
                damage: 20,
                range: 2.8,
                fireRate: 1800,
                color: 0x87CEEB,
                projectileSpeed: 0.09,
                special: 'freeze',
                freezeDuration: 1500, // 1.5 detik
                damageType: 'magical',
                description: 'Freezes enemies temporarily'
            },
            laser: {
                name: 'Sinar Dewata',
                cost: 200,
                damage: 80,
                range: 5,
                fireRate: 3000,
                color: 0xFF1493,
                projectileSpeed: 0.3,
                special: 'instant',
                damageType: 'piercing',
                description: 'Instant hit laser with long range'
            },
            poison: {
                name: 'Racun Upas',
                cost: 110,
                damage: 25,
                range: 2.2,
                fireRate: 1200,
                color: 0x9ACD32,
                projectileSpeed: 0.08,
                special: 'poison',
                poisonDamage: 5, // Damage per detik
                poisonDuration: 3000, // 3 detik
                damageType: 'magical',
                description: 'Applies poison damage over time'
            },
            
            // ADVANCED TOWER TYPES FOR SPECIAL ENEMIES
            detector: {
                name: 'Mata Batin',
                cost: 130,
                damage: 30,
                range: 4.5,
                fireRate: 1000,
                color: 0x00CED1,
                projectileSpeed: 0.12,
                special: 'detection',
                damageType: 'detection', // Efektif vs stealth enemies
                detectionRange: 5.0, // Range untuk mendeteksi stealth
                description: 'Reveals and damages stealth enemies'
            },
            emp: {
                name: 'Mantra Pelemah',
                cost: 180,
                damage: 45,
                range: 3.0,
                fireRate: 2500,
                color: 0x4B0082,
                projectileSpeed: 0.1,
                special: 'disable',
                damageType: 'electromagnetic',
                disableDuration: 2000, // 2 detik disable special abilities
                description: 'Disables enemy special abilities temporarily'
            },
            chain: {
                name: 'Petir Indra',
                cost: 160,
                damage: 35,
                range: 3.5,
                fireRate: 1800,
                color: 0xFFFF00,
                projectileSpeed: 0.2,
                special: 'chain',
                damageType: 'electrical',
                chainCount: 4, // Melompat ke 4 enemy
                chainRange: 2.0, // Range lompatan
                chainDamageReduction: 0.8, // 80% damage untuk target berikutnya
                description: 'Lightning jumps between enemies'
            },
            suppressor: {
                name: 'Jimat Penekan',
                cost: 140,
                damage: 20,
                range: 3.8,
                fireRate: 1500,
                color: 0x8B008B,
                projectileSpeed: 0.09,
                special: 'suppress',
                damageType: 'psychic',
                suppressRange: 4.0, // Range untuk suppress buff/heal
                description: 'Prevents enemy healing and buffing'
            },
            barrier: {
                name: 'Pagar Betawi',
                cost: 200,
                damage: 0, // Tidak ada damage
                range: 0, // Tidak menyerang
                fireRate: 0,
                color: 0x00FFFF,
                projectileSpeed: 0,
                special: 'barrier',
                damageType: 'support',
                barrierRange: 2.5, // Range barrier
                barrierStrength: 50, // HP barrier
                description: 'Creates protective barrier for nearby towers'
            },
            temporal: {
                name: 'Pusaran Waktu',
                cost: 250,
                damage: 40,
                range: 3.0,
                fireRate: 2000,
                color: 0x9400D3,
                projectileSpeed: 0.15,
                special: 'time_manipulation',
                damageType: 'temporal',
                slowField: 0.3, // 70% speed reduction dalam range
                timeFieldRange: 3.5, // Range time field
                description: 'Manipulates time to slow all enemies in area'
            },
            adaptive: {
                name: 'Pusaka Seribu Wajah',
                cost: 300,
                damage: 50,
                range: 3.2,
                fireRate: 1200,
                color: 0xFF1493,
                projectileSpeed: 0.13,
                special: 'adaptive',
                damageType: 'adaptive', // Berubah sesuai target
                adaptCooldown: 3000, // 3 detik untuk adapt
                description: 'Adapts damage type to enemy weakness'
            },
            orbital: {
                name: 'Halilintar Batara',
                cost: 400,
                damage: 150,
                range: 6.0,
                fireRate: 5000, // 5 detik cooldown
                color: 0xFF4500,
                projectileSpeed: 0.5,
                special: 'orbital_strike',
                damageType: 'explosive',
                strikeRadius: 2.0, // Radius ledakan
                chargeDuration: 2000, // 2 detik charging
                description: 'Calls devastating orbital strike'
            }
        };
        
        this.upgradeSystem = {
            basic: [
                { cost: 25, damageBonus: 10, rangeBonus: 0.5 },
                { cost: 50, damageBonus: 20, rangeBonus: 1 },
                { cost: 100, damageBonus: 40, rangeBonus: 1.5 }
            ],
            slow: [
                { cost: 35, damageBonus: 8, slowBonus: 0.1 },
                { cost: 70, damageBonus: 15, slowBonus: 0.2 },
                { cost: 140, damageBonus: 30, slowBonus: 0.3 }
            ],
            splash: [
                { cost: 50, damageBonus: 15, splashBonus: 0.3 },
                { cost: 100, damageBonus: 30, splashBonus: 0.6 },
                { cost: 200, damageBonus: 60, splashBonus: 1 }
            ],
            // NEW TOWER UPGRADES
            antiair: [
                { cost: 60, damageBonus: 15, rangeBonus: 0.5 },
                { cost: 120, damageBonus: 25, rangeBonus: 1 },
                { cost: 240, damageBonus: 40, rangeBonus: 1.5 }
            ],
            piercing: [
                { cost: 75, damageBonus: 20, pierceBonus: 1 },
                { cost: 150, damageBonus: 35, pierceBonus: 2 },
                { cost: 300, damageBonus: 60, pierceBonus: 3 }
            ],
            freeze: [
                { cost: 45, damageBonus: 8, freezeBonus: 500 },
                { cost: 90, damageBonus: 15, freezeBonus: 1000 },
                { cost: 180, damageBonus: 25, freezeBonus: 1500 }
            ],
            laser: [
                { cost: 100, damageBonus: 30, rangeBonus: 1 },
                { cost: 200, damageBonus: 50, rangeBonus: 1.5 },
                { cost: 400, damageBonus: 80, rangeBonus: 2 }
            ],
            poison: [
                { cost: 55, damageBonus: 10, poisonBonus: 2 },
                { cost: 110, damageBonus: 15, poisonBonus: 3 },
                { cost: 220, damageBonus: 25, poisonBonus: 5 }
            ],
            // ADVANCED TOWER UPGRADES
            detector: [
                { cost: 65, damageBonus: 12, detectionBonus: 1.0 },
                { cost: 130, damageBonus: 20, detectionBonus: 1.5 },
                { cost: 260, damageBonus: 35, detectionBonus: 2.0 }
            ],
            emp: [
                { cost: 90, damageBonus: 18, disableBonus: 500 },
                { cost: 180, damageBonus: 30, disableBonus: 1000 },
                { cost: 360, damageBonus: 50, disableBonus: 1500 }
            ],
            chain: [
                { cost: 80, damageBonus: 15, chainBonus: 1 },
                { cost: 160, damageBonus: 25, chainBonus: 2 },
                { cost: 320, damageBonus: 40, chainBonus: 3 }
            ],
            suppressor: [
                { cost: 70, damageBonus: 8, suppressBonus: 1.0 },
                { cost: 140, damageBonus: 15, suppressBonus: 1.5 },
                { cost: 280, damageBonus: 25, suppressBonus: 2.0 }
            ],
            barrier: [
                { cost: 100, barrierBonus: 25, rangeBonus: 0.5 },
                { cost: 200, barrierBonus: 50, rangeBonus: 1.0 },
                { cost: 400, barrierBonus: 100, rangeBonus: 1.5 }
            ],
            temporal: [
                { cost: 125, damageBonus: 20, slowBonus: 0.1 },
                { cost: 250, damageBonus: 35, slowBonus: 0.15 },
                { cost: 500, damageBonus: 60, slowBonus: 0.2 }
            ],
            adaptive: [
                { cost: 150, damageBonus: 25, adaptBonus: -500 },
                { cost: 300, damageBonus: 40, adaptBonus: -1000 },
                { cost: 600, damageBonus: 70, adaptBonus: -1500 }
            ],
            orbital: [
                { cost: 200, damageBonus: 50, radiusBonus: 0.5 },
                { cost: 400, damageBonus: 100, radiusBonus: 1.0 },
                { cost: 800, damageBonus: 200, radiusBonus: 1.5 }
            ]
        };
    }
    
    createTower(type, x, z, scene) {
        const towerData = this.towerTypes[type];
        if (!towerData) return null;
        
        // Check if tower has FBX model available
        const fbxTowerTypes = ['basic', 'slow', 'splash', 'antiair', 'piercing', 'freeze', 'laser', 'poison'];
        if (fbxTowerTypes.includes(type)) {
            return this.createFBXTower(type, x, z, scene, 1); // Start at level 1
        }
        
        // Create tower base for other tower types
        const geometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8);
        const material = new THREE.MeshLambertMaterial({ color: towerData.color });
        const tower = new THREE.Mesh(geometry, material);
        tower.position.set(x, 0.4, z);
        tower.castShadow = true;
        
        // Add userData for identification
        tower.userData = {
            type: 'tower',
            x: x,
            z: z,
            towerType: type
        };
        
        // PLACEMENT ANIMATION - Start small and scale up
        tower.scale.set(0.1, 0.1, 0.1);
        scene.add(tower);
        
        // Create tower cannon
        const cannonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
        const cannonMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
        const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
        cannon.rotation.z = Math.PI / 2;
        cannon.position.set(x, 0.8, z);
        cannon.castShadow = true;
        cannon.scale.set(0.1, 0.1, 0.1);
        
        // Add userData for identification (same as tower)
        cannon.userData = {
            type: 'tower',
            x: x,
            z: z,
            towerType: type
        };
        
        scene.add(cannon);
        
        // Create placement glow effect
        const glowGeometry = new THREE.RingGeometry(0.5, 0.8, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: towerData.color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
        glowRing.position.set(x, 0.05, z);
        glowRing.rotation.x = -Math.PI / 2;
        scene.add(glowRing);
        
        // Create construction particles
        const particles = [];
        for (let i = 0; i < 12; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.03, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: towerData.color,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            const angle = (i / 12) * Math.PI * 2;
            const radius = 0.6;
            particle.position.set(
                x + Math.cos(angle) * radius,
                0.1,
                z + Math.sin(angle) * radius
            );
            
            particle.userData = {
                targetX: x,
                targetY: 0.4,
                targetZ: z,
                speed: 0.05 + Math.random() * 0.03
            };
            
            scene.add(particle);
            particles.push(particle);
        }
        
        // Animate placement effect
        let animationProgress = 0;
        const animationDuration = 60; // frames
        
        const animatePlacement = () => {
            animationProgress++;
            const progress = animationProgress / animationDuration;
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            // Scale up tower and cannon
            const scale = easeProgress;
            tower.scale.set(scale, scale, scale);
            cannon.scale.set(scale, scale, scale);
            
            // Animate glow ring
            glowRing.scale.set(1 + Math.sin(animationProgress * 0.3) * 0.1, 1, 1 + Math.sin(animationProgress * 0.3) * 0.1);
            glowRing.material.opacity = 0.6 * (1 - progress);
            
            // Animate particles moving toward tower
            particles.forEach((particle, index) => {
                const particleProgress = Math.min(1, (animationProgress - index * 2) / 30);
                if (particleProgress > 0) {
                    const easeParticle = 1 - Math.pow(1 - particleProgress, 2);
                    
                    particle.position.x = particle.position.x + (particle.userData.targetX - particle.position.x) * particle.userData.speed;
                    particle.position.y = particle.position.y + (particle.userData.targetY - particle.position.y) * particle.userData.speed;
                    particle.position.z = particle.position.z + (particle.userData.targetZ - particle.position.z) * particle.userData.speed;
                    
                    particle.material.opacity = 0.8 * (1 - easeParticle);
                    
                    // Add slight rotation
                    particle.rotation.y += 0.1;
                }
            });
            
            // Continue animation
            if (animationProgress < animationDuration) {
                requestAnimationFrame(animatePlacement);
            } else {
                // Clean up animation objects
                scene.remove(glowRing);
                particles.forEach(particle => {
                    scene.remove(particle);
                });
                
                // Add final pop effect
                tower.scale.set(1.2, 1.2, 1.2);
                cannon.scale.set(1.2, 1.2, 1.2);
                
                // Scale back to normal
                setTimeout(() => {
                    const finalScale = () => {
                        const currentScale = tower.scale.x;
                        const newScale = currentScale + (1.0 - currentScale) * 0.2;
                        tower.scale.set(newScale, newScale, newScale);
                        cannon.scale.set(newScale, newScale, newScale);
                        
                        if (Math.abs(newScale - 1.0) > 0.01) {
                            requestAnimationFrame(finalScale);
                        } else {
                            tower.scale.set(1, 1, 1);
                            cannon.scale.set(1, 1, 1);
                        }
                    };
                    finalScale();
                }, 100);
            }
        };
        
        // Start animation
        requestAnimationFrame(animatePlacement);
        
        return {
            mesh: tower,
            cannon: cannon,
            type: type,
            x: x,
            z: z,
            damage: towerData.damage,
            range: towerData.range,
            fireRate: towerData.fireRate,
            lastFired: 0,
            level: 1,
            special: towerData.special,
            projectileSpeed: towerData.projectileSpeed,
            slowEffect: towerData.slowEffect || 0,
            slowDuration: towerData.slowDuration || 0,
            splashRadius: towerData.splashRadius || 0,
            // NEW TOWER PROPERTIES
            damageType: towerData.damageType || 'light',
            pierceCount: towerData.pierceCount || 0,
            freezeDuration: towerData.freezeDuration || 0,
            poisonDamage: towerData.poisonDamage || 0,
            poisonDuration: towerData.poisonDuration || 0,
            // ADVANCED TOWER PROPERTIES
            detectionRange: towerData.detectionRange || 0,
            disableDuration: towerData.disableDuration || 0,
            chainCount: towerData.chainCount || 0,
            chainRange: towerData.chainRange || 0,
            chainDamageReduction: towerData.chainDamageReduction || 1.0,
            suppressRange: towerData.suppressRange || 0,
            barrierRange: towerData.barrierRange || 0,
            barrierStrength: towerData.barrierStrength || 0,
            slowField: towerData.slowField || 0,
            timeFieldRange: towerData.timeFieldRange || 0,
            adaptCooldown: towerData.adaptCooldown || 0,
            strikeRadius: towerData.strikeRadius || 0,
            chargeDuration: towerData.chargeDuration || 0
        };
        
        return towerObject;
    }
    
    createFBXTower(type, x, z, scene, level = 1) {
        const towerData = this.towerTypes[type];
        if (!towerData) return null;
        
        const loader = new THREE.FBXLoader();
        const textureLoader = new THREE.TextureLoader();
        
        // Map tower types to their folder names and file prefixes
        const towerFolderMap = {
            'basic': { folder: 'Lilin Pemanggil Arwah', prefix: 'lilin-pemanggil-arwah' },
            'slow': { folder: 'Dupa Penenang Jiwa', prefix: 'dupa-penenang-jiwa' },
            'splash': { folder: 'Meriam Sesajen', prefix: 'meriam-sesajen' },
            'antiair': { folder: 'Tombak Garuda', prefix: 'tombak-garuda' },
            'piercing': { folder: 'Keris Pusaka', prefix: 'keris-pusaka' },
            'freeze': { folder: 'Kristal Es Kutub', prefix: 'kristal-es-kutub' },
            'laser': { folder: 'Sinar Dewata', prefix: 'sinar-dewata' },
            'poison': { folder: 'Racun Upas', prefix: 'racun-upas' }
        };
        
        const towerInfo = towerFolderMap[type];
        if (!towerInfo) {
            console.error(`No FBX mapping found for tower type: ${type}`);
            return this.createBasicTower(type, x, z, scene);
        }
        
        // Determine model and texture paths based on level
        const modelPath = `js/tower/${towerInfo.folder}/${towerInfo.prefix}-lvl${level}.fbx`;
        const texturePath = `js/tower/${towerInfo.folder}/texture-lvl${level}.jpg`;
        
        // Load FBX model
        loader.load(modelPath, (fbxModel) => {
            // Load texture
            textureLoader.load(texturePath, (texture) => {
                // Set up the tower model
                const tower = fbxModel;
                tower.scale.setScalar(0.0099); // Adjust scale as needed
                // Raise position for larger towers to avoid being buried in ground
                const positionY = type === 'basic' ? 0.5 : 0.9;
                tower.position.set(x, positionY, z);
                tower.castShadow = true;
                tower.receiveShadow = true;
                
                // Add userData for identification
                tower.userData = {
                    type: 'tower',
                    x: x,
                    z: z,
                    towerType: type
                };
                
                // Add invisible collision box for better click detection
                const collisionGeometry = new THREE.BoxGeometry(1, 1, 1);
                const collisionMaterial = new THREE.MeshBasicMaterial({ 
                    transparent: true, 
                    opacity: 0,
                    visible: false
                });
                const collisionBox = new THREE.Mesh(collisionGeometry, collisionMaterial);
                collisionBox.position.set(x, 0.5, z);
                collisionBox.userData = {
                    type: 'tower',
                    x: x,
                    z: z,
                    towerType: type
                };
                scene.add(collisionBox);
                
                // Apply texture to all materials
                tower.traverse((child) => {
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
                
                // Update the tower data reference
                towerObject.mesh = tower;
                
                // PLACEMENT ANIMATION - Start small and scale up
                tower.scale.set(0.0006, 0.0006, 0.0006);
                scene.add(tower);
                
                // Create placement glow effect
                const glowGeometry = new THREE.RingGeometry(0.5, 0.8, 16);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: towerData.color,
                    transparent: true,
                    opacity: 0.6,
                    side: THREE.DoubleSide
                });
                const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
                glowRing.position.set(x, 0.05, z);
                glowRing.rotation.x = -Math.PI / 2;
                scene.add(glowRing);
                
                // Animate tower placement
                const animateScale = () => {
                    // Scale 12000% for all towers except basic (Lilin Pemanggil Arwah)
                    const targetScale = type === 'basic' ? 0.0099 : 1.188;
                    const currentScale = tower.scale.x;
                    const scaleIncrement = type === 'basic' ? 0.005 : 0.6;
                    if (currentScale < targetScale) {
                        tower.scale.addScalar(scaleIncrement);
                        requestAnimationFrame(animateScale);
                    } else {
                        tower.scale.setScalar(targetScale);
                        // Remove glow effect after animation
                        scene.remove(glowRing);
                    }
                };
                animateScale();
                
            }, (progress) => {
                console.log('Texture loading progress:', progress);
            }, (error) => {
                console.error('Error loading texture:', error);
                // Continue without texture
                setupTowerWithoutTexture();
            });
            
            function setupTowerWithoutTexture() {
                const tower = fbxModel;
                // Scale 12000% for all towers except basic (Lilin Pemanggil Arwah)
                const initialScale = type === 'basic' ? 0.0099 : 1.188;
                tower.scale.setScalar(initialScale);
                // Raise position for larger towers to avoid being buried in ground
                const yPosition = type === 'basic' ? 0.5 : 0.9;
                tower.position.set(x, yPosition, z);
                tower.castShadow = true;
                tower.receiveShadow = true;
                
                tower.userData = {
                    type: 'tower',
                    x: x,
                    z: z,
                    towerType: type
                };
                
                // Add invisible collision box for better click detection
                const collisionGeometry = new THREE.BoxGeometry(1, 1, 1);
                const collisionMaterial = new THREE.MeshBasicMaterial({ 
                    transparent: true, 
                    opacity: 0,
                    visible: false
                });
                const collisionBox = new THREE.Mesh(collisionGeometry, collisionMaterial);
                collisionBox.position.set(x, 0.5, z);
                collisionBox.userData = {
                    type: 'tower',
                    x: x,
                    z: z,
                    towerType: type
                };
                scene.add(collisionBox);
                
                tower.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Update the tower data reference
                towerObject.mesh = tower;
                
                tower.scale.set(0.0006, 0.0006, 0.0006);
                scene.add(tower);
                
                const animateScale = () => {
                    // Scale 12000% for all towers except basic (Lilin Pemanggil Arwah)
                    const targetScale = type === 'basic' ? 0.0099 : 1.188;
                    const currentScale = tower.scale.x;
                    const scaleIncrement = type === 'basic' ? 0.005 : 0.6;
                    if (currentScale < targetScale) {
                        tower.scale.addScalar(scaleIncrement);
                        requestAnimationFrame(animateScale);
                    } else {
                        tower.scale.setScalar(targetScale);
                    }
                };
                animateScale();
            }
            
        }, (progress) => {
            console.log('FBX model loading progress:', progress);
        }, (error) => {
            console.error('Error loading FBX model:', error);
            // Fallback to basic geometry tower
            return this.createBasicTower(type, x, z, scene);
        });
        
        // Return tower data immediately (model will be loaded asynchronously)
        const towerObject = {
            mesh: null, // Will be set when model loads
            cannon: null,
            type: type,
            x: x,
            z: z,
            damage: towerData.damage,
            range: towerData.range,
            fireRate: towerData.fireRate,
            lastFired: 0,
            level: level,
            special: towerData.special,
            projectileSpeed: towerData.projectileSpeed,
            slowEffect: towerData.slowEffect || 0,
            slowDuration: towerData.slowDuration || 0,
            splashRadius: towerData.splashRadius || 0,
            damageType: towerData.damageType || 'light',
            pierceCount: towerData.pierceCount || 0,
            freezeDuration: towerData.freezeDuration || 0,
            poisonDamage: towerData.poisonDamage || 0,
            poisonDuration: towerData.poisonDuration || 0,
            detectionRange: towerData.detectionRange || 0,
            disableDuration: towerData.disableDuration || 0,
            chainCount: towerData.chainCount || 0,
            chainRange: towerData.chainRange || 0,
            chainDamageReduction: towerData.chainDamageReduction || 1.0,
            suppressRange: towerData.suppressRange || 0,
            barrierRange: towerData.barrierRange || 0,
            barrierStrength: towerData.barrierStrength || 0,
            slowField: towerData.slowField || 0,
            timeFieldRange: towerData.timeFieldRange || 0,
            adaptCooldown: towerData.adaptCooldown || 0,
            strikeRadius: towerData.strikeRadius || 0,
            chargeDuration: towerData.chargeDuration || 0
        };
        
        return towerObject;
    }
    
    createBasicTower(type, x, z, scene) {
        const towerData = this.towerTypes[type];
        if (!towerData) return null;
        
        // Fallback to basic geometry tower
        const geometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8);
        const material = new THREE.MeshLambertMaterial({ color: towerData.color });
        const tower = new THREE.Mesh(geometry, material);
        tower.position.set(x, 0.4, z);
        tower.castShadow = true;
        
        tower.userData = {
            type: 'tower',
            x: x,
            z: z,
            towerType: type
        };
        
        tower.scale.set(0.1, 0.1, 0.1);
        scene.add(tower);
        
        const cannon = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8),
            new THREE.MeshLambertMaterial({ color: 0x2F4F4F })
        );
        cannon.rotation.z = Math.PI / 2;
        cannon.position.set(x, 0.8, z);
        cannon.castShadow = true;
        cannon.scale.set(0.1, 0.1, 0.1);
        cannon.userData = tower.userData;
        scene.add(cannon);
        
        return {
            mesh: tower,
            cannon: cannon,
            type: type,
            x: x,
            z: z,
            damage: towerData.damage,
            range: towerData.range,
            fireRate: towerData.fireRate,
            lastFired: 0,
            level: 1,
            special: towerData.special,
            projectileSpeed: towerData.projectileSpeed,
            slowEffect: towerData.slowEffect || 0,
            slowDuration: towerData.slowDuration || 0,
            splashRadius: towerData.splashRadius || 0,
            damageType: towerData.damageType || 'light',
            pierceCount: towerData.pierceCount || 0,
            freezeDuration: towerData.freezeDuration || 0,
            poisonDamage: towerData.poisonDamage || 0,
            poisonDuration: towerData.poisonDuration || 0,
            detectionRange: towerData.detectionRange || 0,
            disableDuration: towerData.disableDuration || 0,
            chainCount: towerData.chainCount || 0,
            chainRange: towerData.chainRange || 0,
            chainDamageReduction: towerData.chainDamageReduction || 1.0,
            suppressRange: towerData.suppressRange || 0,
            barrierRange: towerData.barrierRange || 0,
            barrierStrength: towerData.barrierStrength || 0,
            slowField: towerData.slowField || 0,
            timeFieldRange: towerData.timeFieldRange || 0,
            adaptCooldown: towerData.adaptCooldown || 0,
            strikeRadius: towerData.strikeRadius || 0,
            chargeDuration: towerData.chargeDuration || 0
        };
    }
    
    upgradeTower(tower, scene) {
        const upgradeData = this.upgradeSystem[tower.type];
        if (!upgradeData || tower.level > upgradeData.length) return false;
        
        const upgrade = upgradeData[tower.level - 1];
        
        // Apply upgrade
        tower.damage += upgrade.damageBonus;
        if (upgrade.rangeBonus) tower.range += upgrade.rangeBonus;
        if (upgrade.slowBonus) tower.slowEffect += upgrade.slowBonus;
        if (upgrade.splashBonus) tower.splashRadius += upgrade.splashBonus;
        // NEW UPGRADE BONUSES
        if (upgrade.pierceBonus) tower.pierceCount += upgrade.pierceBonus;
        if (upgrade.freezeBonus) tower.freezeDuration += upgrade.freezeBonus;
        if (upgrade.poisonBonus) tower.poisonDamage += upgrade.poisonBonus;
        // ADVANCED UPGRADE BONUSES
        if (upgrade.detectionBonus) tower.detectionRange += upgrade.detectionBonus;
        if (upgrade.disableBonus) tower.disableDuration += upgrade.disableBonus;
        if (upgrade.chainBonus) tower.chainCount += upgrade.chainBonus;
        if (upgrade.suppressBonus) tower.suppressRange += upgrade.suppressBonus;
        if (upgrade.barrierBonus) tower.barrierStrength += upgrade.barrierBonus;
        if (upgrade.slowBonus) tower.slowField += upgrade.slowBonus;
        if (upgrade.adaptBonus) tower.adaptCooldown += upgrade.adaptBonus; // Negative = faster
        if (upgrade.radiusBonus) tower.strikeRadius += upgrade.radiusBonus;
        
        tower.level++;
        
        // Check if tower has FBX model for upgrade
        const fbxTowerTypes = ['basic', 'slow', 'splash', 'antiair', 'piercing', 'freeze', 'laser', 'poison'];
        if (fbxTowerTypes.includes(tower.type) && tower.mesh) {
            this.upgradeFBXTower(tower, scene);
        } else if (tower.mesh) {
            // Visual upgrade indicator for other towers
            const scale = 1 + (tower.level - 1) * 0.1;
            tower.mesh.scale.set(scale, scale, scale);
        }
        
        return upgrade.cost;
    }
    
    upgradeFBXTower(tower, scene) {
        console.log(`[UPGRADE LOG] ===== STARTING UPGRADE FOR ${tower.type} TO LEVEL ${tower.level} =====`);
        const loader = new THREE.FBXLoader();
        const textureLoader = new THREE.TextureLoader();
        
        // Store old position and remove old model
        const x = tower.x;
        const z = tower.z;
        const oldMesh = tower.mesh;
        console.log(`[UPGRADE LOG] ${tower.type} - Position: (${x}, ${z}), Old mesh:`, oldMesh);
        
        if (oldMesh) {
            // Dispose of old model resources
            oldMesh.traverse((child) => {
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
            scene.remove(oldMesh);
        }
        
        // Map tower types to their folder names and file prefixes
        const towerFolderMap = {
            'basic': { folder: 'Lilin Pemanggil Arwah', prefix: 'lilin-pemanggil-arwah' },
            'slow': { folder: 'Dupa Penenang Jiwa', prefix: 'dupa-penenang-jiwa' },
            'splash': { folder: 'Meriam Sesajen', prefix: 'meriam-sesajen' },
            'antiair': { folder: 'Tombak Garuda', prefix: 'tombak-garuda' },
            'piercing': { folder: 'Keris Pusaka', prefix: 'keris-pusaka' },
            'freeze': { folder: 'Kristal Es Kutub', prefix: 'kristal-es-kutub' },
            'laser': { folder: 'Sinar Dewata', prefix: 'sinar-dewata' },
            'poison': { folder: 'Racun Upas', prefix: 'racun-upas' }
        };
        
        const towerInfo = towerFolderMap[tower.type];
        if (!towerInfo) {
            console.error(`No FBX mapping found for tower type: ${tower.type}`);
            return;
        }
        
        // Determine new model and texture paths based on level
        const modelPath = `js/tower/${towerInfo.folder}/${towerInfo.prefix}-lvl${tower.level}.fbx`;
        const texturePath = `js/tower/${towerInfo.folder}/texture-lvl${tower.level}.jpg`;
        
        // Load new FBX model
        loader.load(modelPath, (fbxModel) => {
            console.log(`[UPGRADE LOG] Loading FBX model for ${tower.type} level ${tower.level}`);
            console.log(`[UPGRADE LOG] Model path: ${modelPath}`);
            console.log(`[UPGRADE LOG] FBX model loaded:`, fbxModel);
            
            // Load new texture
            textureLoader.load(texturePath, (texture) => {
                console.log(`[UPGRADE LOG] Texture loaded for ${tower.type}:`, texture);
                
                // Set up the upgraded tower model
                const newTower = fbxModel;
                // Consistent scaling for all towers with level progression
                const baseScale = 0.0099;
                const levelMultiplier = 1 + (tower.level - 1) * 0.3; // 30% increase per level
                const upgradeScale = baseScale * levelMultiplier;
                console.log(`[UPGRADE LOG] ${tower.type} - baseScale: ${baseScale}, levelMultiplier: ${levelMultiplier}, upgradeScale: ${upgradeScale}`);
                
                newTower.scale.setScalar(upgradeScale);
                // Consistent position for all towers
                const positionY = 0.5;
                newTower.position.set(x, positionY, z);
                console.log(`[UPGRADE LOG] ${tower.type} - Position set to: (${x}, ${positionY}, ${z})`);
                console.log(`[UPGRADE LOG] ${tower.type} - Scale set to: ${upgradeScale}`);
                
                // Check model bounding box and visibility
                const box = new THREE.Box3().setFromObject(newTower);
                const size = box.getSize(new THREE.Vector3());
                console.log(`[UPGRADE LOG] ${tower.type} - Model bounding box size:`, size);
                console.log(`[UPGRADE LOG] ${tower.type} - Model visible:`, newTower.visible);
                console.log(`[UPGRADE LOG] ${tower.type} - Model children count:`, newTower.children.length);
                
                newTower.castShadow = true;
                newTower.receiveShadow = true;
                
                // Add userData for identification
                newTower.userData = {
                    type: 'tower',
                    x: x,
                    z: z,
                    towerType: tower.type
                };
                
                // Apply texture to all materials
                newTower.traverse((child) => {
                    if (child.isMesh) {
                        console.log(`[UPGRADE LOG] ${tower.type} - Mesh found:`, child.name, 'visible:', child.visible, 'scale:', child.scale, 'geometry vertices:', child.geometry?.attributes?.position?.count);
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
                
                // Add upgrade glow effect
                const glowGeometry = new THREE.RingGeometry(0.6, 1.0, 16);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xFFD700, // Gold color for upgrade
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                const upgradeGlow = new THREE.Mesh(glowGeometry, glowMaterial);
                upgradeGlow.position.set(x, 0.05, z);
                upgradeGlow.rotation.x = -Math.PI / 2;
                scene.add(upgradeGlow);
                
                // Start with small scale and animate
                const startScale = upgradeScale * 0.06; // Start at 6% of target scale
                console.log(`[UPGRADE LOG] ${tower.type} - Animation startScale: ${startScale}`);
                newTower.scale.set(startScale, startScale, startScale);
                scene.add(newTower);
                console.log(`[UPGRADE LOG] ${tower.type} - Tower added to scene with initial scale: ${startScale}`);
                
                // Update tower mesh reference
                tower.mesh = newTower;
                console.log(`[UPGRADE LOG] ${tower.type} - Tower mesh reference updated`);
                
                // Animate upgrade
                const animateUpgrade = () => {
                    const targetScale = upgradeScale;
                    const currentScale = newTower.scale.x;
                    const scaleIncrement = targetScale * 0.1; // 10% of target scale per frame
                    if (currentScale < targetScale) {
                        newTower.scale.addScalar(scaleIncrement);
                        upgradeGlow.scale.addScalar(0.02);
                        requestAnimationFrame(animateUpgrade);
                    } else {
                        newTower.scale.setScalar(targetScale);
                        console.log(`[UPGRADE LOG] ${tower.type} - Animation completed, final scale: ${targetScale}`);
                        // Remove upgrade glow effect after animation
                        scene.remove(upgradeGlow);
                        upgradeGlow.geometry.dispose();
                        upgradeGlow.material.dispose();
                    }
                };
                animateUpgrade();
                
            }, (progress) => {
            console.log(`[UPGRADE LOG] ${tower.type} - Texture loading progress:`, progress);
        }, (error) => {
            console.error(`[UPGRADE LOG] ${tower.type} - Error loading upgrade texture:`, error);
            console.log(`[UPGRADE LOG] ${tower.type} - Falling back to setup without texture`);
            // Continue without texture
            setupUpgradeWithoutTexture();
        });
            
            function setupUpgradeWithoutTexture() {
                console.log(`[UPGRADE LOG] ${tower.type} - Setting up upgrade WITHOUT texture`);
                const newTower = fbxModel;
                // Consistent scaling for all towers with level progression
                const baseScale = 0.0099;
                const levelMultiplier = 1 + (tower.level - 1) * 0.3; // 30% increase per level
                const upgradeScale = baseScale * levelMultiplier;
                console.log(`[UPGRADE LOG] ${tower.type} - WITHOUT TEXTURE - baseScale: ${baseScale}, levelMultiplier: ${levelMultiplier}, upgradeScale: ${upgradeScale}`);
                newTower.scale.setScalar(upgradeScale);
                // Consistent position for all towers
                const yPosition = 0.5;
                newTower.position.set(x, yPosition, z);
                console.log(`[UPGRADE LOG] ${tower.type} - WITHOUT TEXTURE - Position: (${x}, ${yPosition}, ${z}), Scale: ${upgradeScale}`);
                
                // Check model bounding box and visibility for non-texture setup
                const box = new THREE.Box3().setFromObject(newTower);
                const size = box.getSize(new THREE.Vector3());
                console.log(`[UPGRADE LOG] ${tower.type} - WITHOUT TEXTURE - Model bounding box size:`, size);
                console.log(`[UPGRADE LOG] ${tower.type} - WITHOUT TEXTURE - Model visible:`, newTower.visible);
                console.log(`[UPGRADE LOG] ${tower.type} - WITHOUT TEXTURE - Model children count:`, newTower.children.length);
                
                newTower.castShadow = true;
                newTower.receiveShadow = true;
                
                newTower.userData = {
                    type: 'tower',
                    x: x,
                    z: z,
                    towerType: tower.type
                };
                
                newTower.traverse((child) => {
                    if (child.isMesh) {
                        console.log(`[UPGRADE LOG] ${tower.type} - WITHOUT TEXTURE - Mesh found:`, child.name, 'visible:', child.visible, 'scale:', child.scale, 'geometry vertices:', child.geometry?.attributes?.position?.count);
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                newTower.scale.set(0.1, 0.1, 0.1);
                console.log(`[UPGRADE LOG] ${tower.type} - WITHOUT TEXTURE - Initial animation scale set to 0.1`);
                scene.add(newTower);
                tower.mesh = newTower;
                console.log(`[UPGRADE LOG] ${tower.type} - WITHOUT TEXTURE - Tower added to scene and mesh reference updated`);
                
                const animateUpgrade = () => {
                    // Consistent target scale for all towers
                    const targetScale = baseScale * levelMultiplier;
                    const currentScale = newTower.scale.x;
                    const scaleIncrement = targetScale * 0.1; // 10% of target scale per frame
                    if (currentScale < targetScale) {
                        newTower.scale.addScalar(scaleIncrement);
                        requestAnimationFrame(animateUpgrade);
                    } else {
                        newTower.scale.setScalar(targetScale);
                        console.log(`[UPGRADE LOG] ${tower.type} - WITHOUT TEXTURE - Animation completed, final scale: ${targetScale}`);
                    }
                };
                animateUpgrade();
            }
            
        }, (progress) => {
            console.log(`[UPGRADE LOG] ${tower.type} - FBX model loading progress:`, progress);
        }, (error) => {
            console.error(`[UPGRADE LOG] ${tower.type} - Error loading upgrade FBX model:`, error);
            console.log(`[UPGRADE LOG] ${tower.type} - Falling back to scaling existing model`);
            // Fallback to scaling existing model
            if (tower.mesh) {
                const scale = 1 + (tower.level - 1) * 0.1;
                tower.mesh.scale.set(scale, scale, scale);
                console.log(`[UPGRADE LOG] ${tower.type} - Fallback scale applied: ${scale}`);
            }
        });
    }
    
    getTowerInfo(type, level = 1) {
        const towerData = this.towerTypes[type];
        if (!towerData) return null;
        
        let info = { ...towerData };
        
        // Apply upgrades to info
        const upgrades = this.upgradeSystem[type];
        if (upgrades && level > 1) {
            for (let i = 0; i < Math.min(level - 1, upgrades.length); i++) {
                const upgrade = upgrades[i];
                info.damage += upgrade.damageBonus;
                if (upgrade.rangeBonus) info.range += upgrade.rangeBonus;
                if (upgrade.slowBonus) info.slowEffect += upgrade.slowBonus;
                if (upgrade.splashBonus) info.splashRadius += upgrade.splashBonus;
                // NEW UPGRADE BONUSES FOR INFO
                if (upgrade.pierceBonus) info.pierceCount += upgrade.pierceBonus;
                if (upgrade.freezeBonus) info.freezeDuration += upgrade.freezeBonus;
                if (upgrade.poisonBonus) info.poisonDamage += upgrade.poisonBonus;
                // ADVANCED UPGRADE BONUSES FOR INFO
                if (upgrade.detectionBonus) info.detectionRange += upgrade.detectionBonus;
                if (upgrade.disableBonus) info.disableDuration += upgrade.disableBonus;
                if (upgrade.chainBonus) info.chainCount += upgrade.chainBonus;
                if (upgrade.suppressBonus) info.suppressRange += upgrade.suppressBonus;
                if (upgrade.barrierBonus) info.barrierStrength += upgrade.barrierBonus;
                if (upgrade.slowBonus) info.slowField += upgrade.slowBonus;
                if (upgrade.adaptBonus) info.adaptCooldown += upgrade.adaptBonus;
                if (upgrade.radiusBonus) info.strikeRadius += upgrade.radiusBonus;
            }
        }
        
        return info;
    }
    
    getUpgradeCost(tower) {
        const upgradeData = this.upgradeSystem[tower.type];
        if (!upgradeData || tower.level > upgradeData.length) return null;
        
        return upgradeData[tower.level - 1].cost;
    }
    
    // WEAKNESS SYSTEM METHODS
    // Menghitung damage multiplier berdasarkan weakness/resistance
    getDamageMultiplier(towerDamageType, enemyWeakness, enemyResistance) {
        let multiplier = 1.0;
        
        // Cek weakness - damage 2x lipat jika tower efektif
        if (enemyWeakness === towerDamageType) {
            multiplier = 2.0; // Double damage untuk weakness
        }
        
        // Cek resistance - damage berkurang jika enemy tahan
        if (enemyResistance) {
            if (Array.isArray(enemyResistance)) {
                // Jika resistance adalah array
                if (enemyResistance.includes(towerDamageType)) {
                    multiplier *= 0.5; // Half damage untuk resistance
                }
            } else {
                // Jika resistance adalah string tunggal
                if (enemyResistance === towerDamageType) {
                    multiplier *= 0.5; // Half damage untuk resistance
                }
            }
        }
        
        return multiplier;
    }
    
    // Menghitung final damage setelah weakness/resistance
    calculateFinalDamage(tower, enemy) {
        const baseDamage = tower.damage;
        const multiplier = this.getDamageMultiplier(
            tower.damageType, 
            enemy.weakness, 
            enemy.resistance
        );
        
        return Math.floor(baseDamage * multiplier);
    }
    
    // Mendapatkan info efektivitas tower terhadap enemy
    getTowerEffectiveness(towerType, enemyWeakness, enemyResistance) {
        const towerData = this.towerTypes[towerType];
        if (!towerData) return 'normal';
        
        const multiplier = this.getDamageMultiplier(
            towerData.damageType, 
            enemyWeakness, 
            enemyResistance
        );
        
        if (multiplier > 1.0) return 'effective'; // Efektif
         if (multiplier < 1.0) return 'weak'; // Lemah
         return 'normal'; // Normal
     }
     
     // SPECIAL ABILITY METHODS
     // Cek apakah tower bisa mendeteksi stealth enemy
     canDetectStealth(tower, enemy, distance) {
         if (tower.special !== 'detection') return false;
         if (!enemy.special || (enemy.special !== 'stealth' && enemy.special !== 'permanent_stealth')) return true;
         
         return distance <= tower.detectionRange;
     }
     
     // Cek apakah enemy dalam range suppression
     isEnemySuppressed(tower, enemy, distance) {
         if (tower.special !== 'suppress') return false;
         return distance <= tower.suppressRange;
     }
     
     // Cek apakah tower dalam range barrier protection
     isTowerProtected(protectorTower, targetTower, distance) {
         if (protectorTower.special !== 'barrier') return false;
         return distance <= protectorTower.barrierRange;
     }
     
     // Hitung damage dengan special abilities
     calculateSpecialDamage(tower, enemy, distance) {
         let finalDamage = this.calculateFinalDamage(tower, enemy);
         
         // Adaptive tower - berubah damage type sesuai enemy weakness
         if (tower.special === 'adaptive' && enemy.weakness) {
             const adaptedMultiplier = this.getDamageMultiplier(
                 enemy.weakness, 
                 enemy.weakness, 
                 enemy.resistance
             );
             finalDamage = Math.floor(tower.damage * adaptedMultiplier);
         }
         
         // Chain lightning - damage berkurang untuk target sekunder
         if (tower.special === 'chain') {
             // Implementasi chain damage akan dilakukan di game logic
             return finalDamage;
         }
         
         // Temporal tower - bonus damage jika enemy dalam time field
         if (tower.special === 'time_manipulation' && distance <= tower.timeFieldRange) {
             finalDamage *= 1.2; // 20% bonus damage
         }
         
         return Math.floor(finalDamage);
     }
     
     // Mendapatkan efek area untuk tower
     getAreaEffects(tower) {
         const effects = [];
         
         if (tower.special === 'detection' && tower.detectionRange > 0) {
             effects.push({
                 type: 'detection',
                 range: tower.detectionRange,
                 description: 'Reveals stealth enemies'
             });
         }
         
         if (tower.special === 'suppress' && tower.suppressRange > 0) {
             effects.push({
                 type: 'suppression',
                 range: tower.suppressRange,
                 description: 'Prevents enemy healing and buffs'
             });
         }
         
         if (tower.special === 'barrier' && tower.barrierRange > 0) {
             effects.push({
                 type: 'barrier',
                 range: tower.barrierRange,
                 strength: tower.barrierStrength,
                 description: 'Protects nearby towers'
             });
         }
         
         if (tower.special === 'time_manipulation' && tower.timeFieldRange > 0) {
             effects.push({
                 type: 'time_field',
                 range: tower.timeFieldRange,
                 slowEffect: tower.slowField,
                 description: 'Slows all enemies in area'
             });
         }
         
         return effects;
     }
     
     // Mendapatkan rekomendasi tower untuk enemy dengan special ability
     getSpecialCounters(enemySpecial) {
         const counters = {
             'stealth': ['detector'],
             'permanent_stealth': ['detector'],
             'heal': ['suppressor', 'emp'],
             'buff': ['suppressor', 'emp'],
             'teleport': ['emp', 'temporal'],
             'split': ['splash', 'chain'],
             'immunity_cycle': ['adaptive', 'temporal']
         };
         
         return counters[enemySpecial] || [];
     }
 }

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TowerSystem;
} else {
    window.TowerSystem = TowerSystem;
}