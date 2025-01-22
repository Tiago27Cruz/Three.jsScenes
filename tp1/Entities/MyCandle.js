import * as THREE from 'three';
import {MyEntity} from './MyEntity.js';
import { MyFlame } from './MyFlame.js';

class MyCandle extends MyEntity {
    /**
     * Candle constructor
     * @param {MyContents} contents
     * @param {string} name
     * @param {MyEntity} parent
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     */
    constructor(contents, name = "Candle", parent = null, width = 1, depth= 1, height=4) {
        super(contents, name, parent, width, depth, height);
        this.radius = width/2;
        this.init();
    }

    /**
     * Initializes the candle
     */
    init(){
        // Calls the parent init method for the default initialization
        super.init(this);
        
        this.initMaterials();
        this.initPrimitives();

        this.buildCandle();

        this.initGui();
    }

    /**
     * Initializes the materials for the candle
     */
    initMaterials(){
        // Bottom of the candle (wax)
        this.waxMaterial = this.contents.materials.get('Phong').clone();
        this.waxMaterial.color = new THREE.Color('#ffffff');

        // Wick of the candle
        this.wickMaterial = this.contents.materials.get('Phong').clone();
        this.wickMaterial.color = new THREE.Color('#000000');
    }

    /**
     * Initializes the primitives used by the candle
     */
    initPrimitives(){
        this.cylinder = this.contents.buildObject('Cylinder', 1, 1, 1, 32);
    }

    /**
     * Builds the candle
     */
    buildCandle(){
        // Builds the wax part of the candle
        this.bottom = new MyEntity(this.contents, "Bottom", this, this.width, this.depth, this.height, this.cylinder, this.waxMaterial, null, true);
        this.bottom.move(0, this.height/2, 0);
        
        // Builds the wick part of the candle
        this.top = new MyEntity(this.contents, "Wick", this, this.width/3, this.depth/3, this.height/3, this.cylinder, this.wickMaterial, null, true, true);
        
        // Moves the wick to the top of the candle
        this.top.moveTo(null, this.height + this.height/6);

        // Adds the flame to the candle
        const flame = new MyFlame(this.contents, "Flame", this, 0.15, 0.1, 0.15);
        // Moves the flame to the top of the wick
        flame.moveToEntity(this.top);
        flame.move(0, flame.height/2+this.top.mesh.scale.y/2, 0);
    }
    
    /**
     * Adds the GUI elements of the candle
     */
    initGui(){
        super.initGui();
        super.initGuiScale(false, true, false, false, true);
        super.initGuiShadow();

        this.bottom.initGuiColor("#ffffff");
        this.bottom.folder.close();

        this.top.initGuiColor("#000000");
        this.top.folder.close();
    }
}

export {MyCandle};