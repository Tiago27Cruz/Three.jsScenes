import { MyEntity } from './MyEntity.js';
import * as THREE from 'three';

class MySpotlight extends MyEntity{
    /**
     * Constructor
     * @param {MyContents} contents
     * @param {Text} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
     */
    constructor(contents, name = "Spotlight", parent = null, width = 1,  depth= 1, height=1){
        super(contents, name, parent, width, depth, height);
        this.init();
    }

    /**
     * Initializes the spotlight
     */
    init(){
        super.init(this)
        
        this.initTextures();
        this.initMaterials();
        this.buildSpotlight();
        this.addLight();

        this.initGui();
    }

    /**
     * Initializes the textures for the spotlight
     */
    initTextures(){
        this.legoTexture = this.contents.loadTexture('single_lego2').clone();
    }

    /**
     * Initializes the materials for the spotlight
     */
    initMaterials(){
        // Create the material for the outside of the spotlight
        this.outsideMaterial  = this.contents.materials.get("PhongDoubleSide").clone();
        this.outsideColor = "#454545";
        this.outsideMaterial.color.set(this.outsideColor);

        // Create the material for the lightbulb
        this.lightbulbMaterial = this.contents.materials.get("Phong").clone();
        this.lightbulbMaterial.transparent = true;
        this.lightbulbMaterial.opacity = 0.9
        this.lightbulb_color = "#ffff00";
        this.lightbulbMaterial.color.set(this.lightbulb_color);

    }

    /**
     * Builds the spotlight
     */
    buildSpotlight(){
        // Parent entity
        this.outerPart = new MyEntity(this.contents, "Outer Material", this, 1, 1, 1, null, this.outsideMaterial, this.legoTexture, true, true);

        // Create the top cylinder that attaches to the ceiling
        const topHeight = 2*this.height
        const topRadius = 3*this.width
        const topObj = this.contents.buildObject('Cylinder', 1,1,1,32)

        let top = new MyEntity(this.contents, "Top", this.outerPart, topRadius, topRadius, topHeight, topObj, this.outsideMaterial, null, true, false);
        top.move(0,-topHeight/2,0)

        // Create the connection between the top and the spotlight itself
        const connectionHeight = 4 * this.height
        const connectionRadius = 0.5 * this.width
        const connectionObj = this.contents.buildObject('Box')

        let connection = new MyEntity(this.contents, "Connection", this.outerPart, connectionRadius, connectionRadius, connectionHeight, connectionObj, this.outsideMaterial, null, true, false);
        connection.move(0, -topHeight - connectionHeight/2, 0)

        // Create the spotlight itself
        const spotlightHeight = 6*this.height
        const spotlightRadius = 2*this.width
        const spotlightObj = this.contents.buildObject('Cylinder', 1,1,1,32,1,true)

        let spotlight = new MyEntity(this.contents, "Spotlight", this.outerPart, spotlightRadius, spotlightRadius, spotlightHeight,spotlightObj , this.outsideMaterial, null, true, false);
        spotlight.move(0, -topHeight - connectionHeight - spotlightHeight/2, 0)

        // Create the spotlight top since the spotlight is open ended
        const spotlightTopObj = this.contents.buildObject('Circle',1,32)

        const spotlightTop = new MyEntity(this.contents, "Spotlight Top", this.outerPart, spotlightRadius, 1, spotlightRadius, spotlightTopObj, this.outsideMaterial, null, true, false);
        spotlightTop.mesh.rotation.x = -Math.PI/2;
        spotlightTop.move(0, -topHeight - connectionHeight, 0)

        // Create the lightbulb
        const lightbulbHeight = 1
        const lightbulbRadius = spotlightRadius * this.width/2
        const sphereObj = this.contents.buildObject('Sphere',1,32,16)

        this.lightbulb = new MyEntity(this.contents, "Lightbulb", this, lightbulbRadius, lightbulbRadius, lightbulbHeight, sphereObj, this.lightbulbMaterial, null, true, false, false);
        this.lightbulb_y = -topHeight - connectionHeight - 2*spotlightHeight/3
        this.lightbulb.move(0, this.lightbulb_y , 0) 
    }

    /**
     * Adds the light to the spotlight
     */
    addLight(){
        // Create the light
        this.light = new THREE.SpotLight(this.lightbulb_color, 200, 50, this.width*Math.PI/30, 0.2, 0.9);
        // Position it in the lightbulb and aim it at the floor
        this.light.position.set(0, this.lightbulb_y , 0);
        this.light.target.position.set(0, this.lightbulb_y - 10, 0);

        // Add shadows to the light
        this.mapSize = 1024
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = this.mapSize;
        this.light.shadow.mapSize.height = this.mapSize;
        this.light.shadow.camera.near = 0.5;
        this.light.shadow.camera.far = 500;
        this.light.shadow.camera.left = -100;
        this.light.shadow.camera.right = 100;
        this.light.shadow.camera.bottom = -100;
        this.light.shadow.camera.top = 100;

        // Add the light to the scene
        this.contents.app.scene.add(this.light);
        this.contents.app.scene.add(this.light.target);
        this.group.add(this.light);
        this.group.add(this.light.target);
    }

    /**
     * Places the spotlight on the ceiling
     * @param {Number} deskHeight - The height of the desk
     */
    placeOnCeiling(deskHeight){
        // Move the spotlight to the ceiling
        const yPos = this.contents.height - deskHeight - this.contents.lego_height
        this.moveTo(null, yPos, null);
    }

    /**
     * Initializes the GUI for the spotlight
     */
    initGui(){
        super.initGui();
        this.initGuiMove(true, false, true);
        this.initGuiScale();
        this.initGuiLight(this.light, this.lightbulbMaterial);
        this.initGuiShadow();
        this.outerPart.initGuiColor(this.outsideColor);
        this.outerPart.initGuiTexture();
        this.outerPart.folder.close();
    }
}

export {MySpotlight};