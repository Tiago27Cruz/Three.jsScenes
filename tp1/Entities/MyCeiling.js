import * as THREE from "three";
import { MyEntity } from "./MyEntity.js";

class MyCeiling extends MyEntity{
    constructor(contents, name = "Roof", parent = null, width = 1, depth = 1, height = 1){
        super(contents, name, parent, width, depth, height);
        this.init();
    }

    /**
     * Initializes the ceiling components
     */
    init(){
        super.init(this);

        this.initMaterials();
        this.build()
        this.addShadows(true, false);

        this.initGui();
    }

    /**
     * Initializes the materials for the ceiling
     */
    initMaterials(){
        this.material = this.contents.materials.get("Phong").clone();
        this.material.color = new THREE.Color(0xfefefe);
    }

    /**
     *  Builds the ceiling
     */
    build(){
        const obj = this.contents.buildObject('Plane')
        this.roof = new MyEntity(this.contents, "Roof", this, this.width, this.height, this.depth, obj, this.material, null, true, false);
        this.roof.rotate(Math.PI/2, 0, 0);
    }

    /**
     * Initializes the GUI for the ceiling
     */
    initGui(){
        super.initGui();
        super.initGuiMoveTo(true, true, true, [[-30,this.contents.height-30,-30],[30,this.contents.height+30,30]]);
        super.initGuiColor(this.material.color);
        super.initGuiShadow();
    }
}

export { MyCeiling };