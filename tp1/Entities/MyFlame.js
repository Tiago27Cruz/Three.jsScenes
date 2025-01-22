import * as THREE from 'three';
import {MyEntity} from './MyEntity.js';

class MyFlame extends MyEntity {
    /**
     * Constructor for the flame
     * @param {MyContents} contents
     * @param {string} name
     * @param {MyEntity} parent
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     */
    constructor(contents, name = "Flame", parent = null, width, depth, height) {
        super(contents, name, parent, width, depth, height);
        this.init();
    }

    /**
     * Initializes the flame and builds it
     */
    init(){
        super.init(this);
        const material = this.contents.materials.get('Phong');

        const cylinder1 = new MyEntity(this.contents, "cylinder1", this, this.width, this.depth, this.height, this.contents.buildObject('Cylinder', 0.5, 0.0005, 1, 32, 1, true), material.clone(), null, true, false);
        cylinder1.updateColor("#e25822", "#e25822", 50);

        
        const cylinder2 = new MyEntity(this.contents, "cylinder2", this, this.width, this.depth, this.height, this.contents.buildObject('Cylinder', 0.75, 0.5, 1, 32, 1, true), material.clone(),  null, true, false);
        cylinder2.move(0, cylinder2.mesh.scale.y/2+cylinder1.mesh.scale.y/2, 0);
        cylinder2.updateColor("#e56939", "#e56939", 50);
        
        const cylinder3 = new MyEntity(this.contents, "cylinder3", this, this.width, this.depth, this.height, this.contents.buildObject('Cylinder', 0.5, 0.75, 1, 32, 1, true), material.clone(), null, true, false);
        cylinder3.moveToEntity(cylinder2);
        cylinder3.move(0, cylinder3.mesh.scale.y/2+cylinder2.mesh.scale.y/2, 0);
        cylinder3.updateColor("#ff9a00", "#ff9a00", 50);

        const cylinder4 = new MyEntity(this.contents, "cylinder4", this, this.width, this.depth, this.height, this.contents.buildObject('Cylinder', 0.2, 0.5, 1, 32, 1, true), material.clone(), null, true, false);
        cylinder4.moveToEntity(cylinder3);
        cylinder4.move(0, cylinder4.mesh.scale.y/2+cylinder3.mesh.scale.y/2, 0);
        cylinder4.updateColor("#ffce00", "#ffce00", 50);


        const cylinder5 = new MyEntity(this.contents, "cylinder5", this, this.width, this.depth, this.height, this.contents.buildObject('Cylinder', 0.0005, 0.2, 1, 32, 1, true), material.clone(), null, true, false);
        cylinder5.moveToEntity(cylinder4);
        cylinder5.move(0, cylinder5.mesh.scale.y/2+cylinder4.mesh.scale.y/2, 0);
        cylinder5.updateColor("#ffe808", "#ffe808", 50);

        // Place the light at the flames
        this.addLight(0, cylinder3.mesh.scale.y/2+cylinder2.mesh.scale.y/2, 0);

        this.initGui();
    }

    /**
     * Adds a PointLight to the given position
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    addLight(x,y,z){
        this.light = new THREE.PointLight(0xe56939, 1, 50);
        this.light.position.set(x,y,z)
        this.group.add(this.light);
    }


    /**
     * Creates the GUI elements of the flame
     */
    initGui(){
        super.initGui();
        super.initGuiLight(this.light);
    }
}

export {MyFlame};