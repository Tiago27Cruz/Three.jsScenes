import { MyEntity } from './MyEntity.js';
import * as THREE from 'three';
import { MyCandle } from './MyCandle.js';

class MyCake extends MyEntity {
    /**
     * Constructor
     * @param {MyContents} contents
     * @param {Text} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
     */
    constructor(contents, name = "Cake", parent = null, width = 3, depth = 3, height = 3) {
        super(contents, name, parent, width, depth, height);
        this.radius = width/2;
        this.init();
    }

    init(){
        super.init(this);
        
        
        // Create the cylinder geometry with a small slice
        const cylinder = this.contents.buildObject('Cylinder', this.radius, this.radius, this.height, 32, 1, false, 0, 3 * Math.PI / 2 + Math.PI / 4);
        // Create the plane geometry to fill in the gaps of the slice
        const plane = this.contents.buildObject('Plane');

        this.initTextures();
        this.initMaterials();

        this.createCake(cylinder, plane);

        this.initGui();
    }

    /**
     * Initializes the materials of the cake
     */
    initMaterials(){
        // Creates the material for the outside of the cake
        this.outerMaterial = this.contents.materials.get("Phong").clone();
        this.outerMaterial.color.set("#fef801");
        this.outerMaterial.specular.set("#000000");
        this.outerMaterial.shininess = 0;

        // Creates the material for the inside of the cake
        this.innerMaterial = this.contents.materials.get("Phong").clone();

        // Creates the material for the face of the cake
        this.faceMaterial = this.outerMaterial.clone();
        this.faceMaterial.color.set("#fef801");
        this.faceMaterial.specular.set("#000000");
        this.faceMaterial.shininess = 0;
        this.faceMaterial.map = this.faceTexture;
    }

    /**
     * Initializes the textures of the cake
     */
    initTextures(){
        // Face texture
        this.faceTexture= this.contents.loadTexture("face").clone();
        this.faceTexture.wrapS = THREE.ClampToEdgeWrapping
        this.faceTexture.wrapT = THREE.ClampToEdgeWrapping
        this.faceTexture.repeat.set(1, 1);

        // Inner cake texture
        this.innerTexture = this.contents.loadTexture("cake").clone();
        this.innerTexture.wrapS = THREE.RepeatWrapping;
        this.innerTexture.wrapT = THREE.RepeatWrapping;
        this.innerTexture.repeat.set(1, 1);
    }

    /**
     * Creates the cake using a common 'sliced' CylinderGeometry and PlaneGeometry to fill in the gaps of the slice
     * @param {object} cylinder
     * @param {object} plane
     */
    createCake(cylinder, plane){
        // Parent entity for the outer cake
        this.outerPart = new MyEntity(this.contents, "Outer Cake", this, 1, 1, 1+1/3, null, this.outerMaterial, null, true);
        this.outerPart.updateColor("#fef801", "#000000", 0);

        // Create the bottom of the cake
        const bottom = new MyEntity(this.contents, "Bottom", this.outerPart, 1, 1, 1, cylinder, [this.faceMaterial,this.outerMaterial, this.outerMaterial], null, true, false);
        bottom.move(0, this.height/2, 0);

        // Create the top of the cake
        const top = new MyEntity(this.contents, "Top", this.outerPart, 2/5, 2/5, 1/3, cylinder, this.outerMaterial, null, true, false);
        top.moveTo(null, this.height + (this.height/3)/2);

        this.innerPart = new MyEntity(this.contents, "Inner Cake", this, this.width, 1, this.height, null, this.innerMaterial, this.innerTexture, true);
        this.innerPart.updateColor("#f7d9a1", "#000000", 0);

        // Create the inner part of the bottom cake 
        const planeBottom1 = new MyEntity(this.contents, "planeBottom1", this.innerPart, this.width, 1, this.height, plane, this.innerMaterial, null, true, false);
        planeBottom1.rotateTo(null, Math.PI/4);
        planeBottom1.moveTo(null, bottom.mesh.position.y);

        const planeBottom2 = new MyEntity(this.contents, "planeBottom2", this.innerPart, this.width, 1, this.height, plane, this.innerMaterial, null, true, false);
        planeBottom2.rotateTo(null, -Math.PI/2);
        planeBottom2.moveTo(null, bottom.mesh.position.y);

        // Create the inner part of the top cake
        const planeTop1 = new MyEntity(this.contents, "planeTop1", this.innerPart, this.width*2/5, 1, this.height/3, plane, this.innerMaterial, null, true, false);
        planeTop1.rotateTo(null, Math.PI/4);
        planeTop1.moveTo(null, top.mesh.position.y);

        const planeTop2 = new MyEntity(this.contents, "planeTop2", this.innerPart, this.width*2/5, 1, this.height/3, plane, this.innerMaterial, null, true, false);
        planeTop2.rotateTo(null, -Math.PI/2);
        planeTop2.moveTo(null, top.mesh.position.y);

        // Add the candle to the top of the cake
        const candle = new MyCandle(this.contents, "Candle", this, 0.05*this.radius, 0.05*this.radius, this.height*0.2);
        candle.moveToEntity(top);
        candle.move(0, (this.height/3)/2,0 )
    }

    /**
     * Initializes the GUI elements of the cake
     */
    initGui(){
        super.initGui();
        super.initGuiScale(false, true, false, false, true);
        super.initGuiRotate(false, true, false);
        super.initGuiShadow();

        this.innerPart.folder.close();
        this.innerPart.initGuiColor();
        this.innerPart.initGuiTexture();

        this.outerPart.folder.close();
        this.outerPart.initGuiColorMaterials([this.faceMaterial, this.outerMaterial]);
        this.outerPart.initGuiTexture(this.faceTexture);
    }


}

export {MyCake};