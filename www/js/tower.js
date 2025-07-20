// Tower System - Modular Tower Management
class TowerSystem {
    constructor() {
        this.towerTypes = {
            basic: {
                name: 'Basic Tower',
                cost: 50,
                damage: 25,
                range: 3,
                fireRate: 1000, // ms
                color: 0x4169E1,
                projectileSpeed: 0.1,
                special: null
            },
            slow: {
                name: 'Slow Tower',
                cost: 75,
                damage: 15,
                range: 2.5,
                fireRate: 1500,
                color: 0x00BFFF,
                projectileSpeed: 0.08,
                special: 'slow',
                slowEffect: 0.5, // 50% speed reduction
                slowDuration: 2000 // 2 seconds
            },
            splash: {
                name: 'Splash Tower',
                cost: 100,
                damage: 40,
                range: 2,
                fireRate: 2000,
                color: 0xFF4500,
                projectileSpeed: 0.12,
                special: 'splash',
                splashRadius: 1.5
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
            ]
        };
    }
    
    createTower(type, x, z, scene) {
        const towerData = this.towerTypes[type];
        if (!towerData) return null;
        
        // Create tower base
        const geometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8);
        const material = new THREE.MeshLambertMaterial({ color: towerData.color });
        const tower = new THREE.Mesh(geometry, material);
        tower.position.set(x, 0.4, z);
        tower.castShadow = true;
        scene.add(tower);
        
        // Create tower cannon
        const cannonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
        const cannonMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
        const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
        cannon.rotation.z = Math.PI / 2;
        cannon.position.set(x, 0.8, z);
        cannon.castShadow = true;
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
            splashRadius: towerData.splashRadius || 0
        };
    }
    
    upgradeTower(tower) {
        const upgradeData = this.upgradeSystem[tower.type];
        if (!upgradeData || tower.level > upgradeData.length) return false;
        
        const upgrade = upgradeData[tower.level - 1];
        
        // Apply upgrade
        tower.damage += upgrade.damageBonus;
        if (upgrade.rangeBonus) tower.range += upgrade.rangeBonus;
        if (upgrade.slowBonus) tower.slowEffect += upgrade.slowBonus;
        if (upgrade.splashBonus) tower.splashRadius += upgrade.splashBonus;
        
        tower.level++;
        
        // Visual upgrade indicator
        const scale = 1 + (tower.level - 1) * 0.1;
        tower.mesh.scale.set(scale, scale, scale);
        
        return upgrade.cost;
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
            }
        }
        
        return info;
    }
    
    getUpgradeCost(tower) {
        const upgradeData = this.upgradeSystem[tower.type];
        if (!upgradeData || tower.level > upgradeData.length) return null;
        
        return upgradeData[tower.level - 1].cost;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TowerSystem;
} else {
    window.TowerSystem = TowerSystem;
}