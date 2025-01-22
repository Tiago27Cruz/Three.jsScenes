import * as THREE from 'three';
import { MyEntity } from './MyEntity.js';
import { MyCurvedLine } from './MyCurvedLine.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

class MySpiralSpring extends MyEntity {
    /**
     * 
     * @param {MyContents} contents
     * @param {string} name
     * @param {MyEntity} parent
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     * @param {Number} spirals 
     * @param {Number} radius 
     * @param {MyEntity} lego 
     * @param {MyEntity} parent_legos 
     */
    constructor(contents, name = "SpiralSpring", parent = null, width = 1, depth = 1, height = 5, spirals = 10, radius = 1, lego = null, parent_legos = null){
        super(contents, name, parent, width, depth, height, null, null, null, false, false, true, true);
        this.spirals = spirals;
        this.radius = radius;
        this.lego = lego;
        this.parent_legos = parent_legos;
        this.init();
    }

    /**
     * Initializes the Spiral Spring
     */
    init(){
        super.init(this)
        
        
        this.buildSpiralSpring();

        
        this.initGui();
    }

    /**
     * Builds the spiral spring
     */
    buildSpiralSpring(){
        const points = [];
        const samples = 300;
        let x,y,z,angle;

        for (let i = 0; i <= samples; i++) {
            angle = 2*Math.PI * (i/samples) * this.spirals;
            x = this.radius * Math.cos(angle);
            y = this.height * (i/samples);
            z = this.radius * Math.sin(angle);
            points.push(new THREE.Vector3(x,y,z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        this.material = new LineMaterial({ color: 0x222222 });
        this.material.linewidth = 0.005 * this.width;


        this.spiral = new MyCurvedLine(this.contents, curve, new THREE.Vector3(0,0,0), samples, this.material, this, true, points);
        
    }

    /**
     * Initializes the GUI elements for the Spiral Spring
     */
    initGui(){
        super.initGui();
        this.initGuiColor();
        if(this.lego !== null) super.initGuiMoveToLego();
        this.initGuiScale(false, true, false, false, true);
        this.initGuiShadow();
    }

    initGuiColor(){
        let colorFolder = this.folder.addFolder("Color");
        colorFolder.close();
        colorFolder.addColor(this.material, 'color').name("Color");
    }
}

export {MySpiralSpring};