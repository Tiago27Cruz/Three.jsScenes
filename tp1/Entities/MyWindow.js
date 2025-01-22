import * as THREE from 'three';
import { MyEntity } from './MyEntity.js';

class MyWindow extends MyEntity {
    /**
     * Constructor for the window
     * @param {MyContents} contents 
     * @param {String} name 
     * @param {MyEntity} parent 
     * @param {Number} width 
     * @param {Number} depth 
     * @param {Number} height 
     */
    constructor(contents, name = "Window", parent = null, width = 1, depth = 1, height = 1){
        super(contents, name, parent, width, depth, height);
        this.init();
    }

    /**
     * Initializes the window
     */
    init(){
        super.init(this)

        // Initialize textures and materials
        this.initTextures();
        this.initMaterials();
        
        // Build window
        this.buildWindow();

        this.initGui();
    }

    /**
     * Initializes the textures used in the window
     */
    initTextures(){
        // Load glass texture
        this.glassTexture = this.contents.loadTexture("glass").clone();
        this.glassTexture.wrapS = THREE.RepeatWrapping;
        this.glassTexture.wrapT = THREE.RepeatWrapping;
        this.glassTexture.rotation = 0;
        this.glassTexture.offset = new THREE.Vector2(0,0);

        // Load landscape texture
        this.landscapeTexture = this.contents.loadTexture("windows_xp").clone();
        this.landscapeTexture.wrapS = THREE.MirroredRepeatWrapping;
        this.landscapeTexture.wrapT = THREE.MirroredRepeatWrapping;
        this.landscapeTexture.rotation = 0;
        this.landscapeTexture.offset = new THREE.Vector2(0,0);

        // Load frame texture
        this.frameTexture = this.contents.loadTexture("log").clone();
        this.frameTexture.wrapS = THREE.RepeatWrapping;
        this.frameTexture.wrapT = THREE.RepeatWrapping;
        this.frameTexture.rotation = 0;
        this.frameTexture.offset = new THREE.Vector2(0,0);
    }

    /**
     * Initializes the materials used in the window
     */
    initMaterials(){
        // Create glass material
        this.glassMaterial = this.contents.materials.get("PhongDoubleSide").clone();
        this.glassMaterial.color.set("#a8ffff");
        this.glassMaterial.transparent = true;
        this.glassMaterial.opacity = 0.5

        // Create landscape material
        this.landscapeMaterial = this.contents.materials.get("Basic").clone();
        this.landscapeMaterial.color.set("#ffffff");

        // Create frame material
        this.frameMaterial = this.contents.materials.get("Phong").clone();
        this.frameMaterial.color.set("#612014");
    }

    /**
     * Builds the window
     */
    buildWindow(){
        this.buildGlass();
        this.buildLandscape();
        this.buildFrame();
        this.buildLight();
    }

    /**
     * Builds the glass of the window
     */
    buildGlass(){
        const object = this.contents.buildObject('Plane');

        // Glass dimensions
        const glassWidth = this.width-2;
        const glassDepth = this.depth-2;
        const glassHeight = this.height-2;

        // Calculate glass texture UVs
        const UVRate = glassHeight / glassWidth
        const textureUVRate = 7000 / 4666;
        const textureRepeatU = 1;
        const textureRepeatV = textureRepeatU * UVRate * textureUVRate;

        this.glassTexture.repeat.set(textureRepeatU, textureRepeatV);

        this.glassMaterial.map = this.glassTexture

        // Create glass entity
        this.glass = new MyEntity(this.contents, 'Glass', this, glassWidth, glassDepth, glassHeight, object, this.glassMaterial, this.glassTexture, true, true, false);
    }

    /**
     * Builds the landscape outside the room
     */
    buildLandscape(){
        const object = this.contents.buildObject('Plane');

        // Landscape dimensions
        const landscapeWidth = this.width*2.5
        const landscapeDepth = this.depth
        const landscapeHeight = this.height*2.5

        // Calculate landscape texture UVs
        let UVRate = landscapeHeight / landscapeWidth;
        
        let textureUVRate = 728 / 455; // image dimensions
        let textureRepeatU = 1;
        let textureRepeatV = 1

        this.landscapeTexture.repeat.set(textureRepeatU, textureRepeatV);
        
        this.landscapeMaterial.map = this.landscapeTexture;

        // Create window object
        this.landscape = new MyEntity(this.contents, 'Landscape', this, landscapeWidth, landscapeDepth, landscapeHeight, object, this.landscapeMaterial, this.landscapeTexture, true, true, false);
        this.landscape.moveTo(0,0,-10)
    }

    /**
     * Builds the frame of the window
     */
    buildFrame(){
        // Calculate frame texture UVs
        const UVRate = (this.height) / (this.width);
        const textureUVRate = 3840 / 2040; // image dimensions
        const textureRepeatU = 10;
        const textureRepeatV = textureRepeatU * UVRate * textureUVRate;

        this.frameTexture.repeat.set(textureRepeatU, textureRepeatV);

        // Frame entity that will be parent to all the frame parts
        this.framesEntity = new MyEntity(this.contents, "Frames", this, this.width, this.depth, this.height, null, this.frameMaterial, this.frameTexture, true);

        const frameObject = this.contents.buildObject('Box');

        // Left frame
        let frame1 = new MyEntity(this.contents, 'Frame', this.framesEntity, 1, 1, this.height, frameObject, this.frameMaterial, this.frameTexture, true, false);
        frame1.moveTo(-this.width/2 + 0.5, 0, 0);

        // Right frame
        let frame2 = new MyEntity(this.contents, 'Frame', this.framesEntity, 1, 1, this.height, frameObject, this.frameMaterial, this.frameTexture, true, false);
        frame2.moveTo(this.width/2 - 0.5, 0, 0);

        // Bottom frame
        let frame3 = new MyEntity(this.contents, 'Frame', this.framesEntity, this.width, 4, 1, frameObject, this.frameMaterial, this.frameTexture, true, false);
        frame3.moveTo(0, -this.height/2 + 0.5, 0);

        // Top frame
        let frame4 = new MyEntity(this.contents, 'Frame', this.framesEntity, this.width, 1, 1, frameObject, this.frameMaterial, this.frameTexture, true, false);
        frame4.moveTo(0, this.height/2 - 0.5, 0);
    }

    /**
     * Builds the light in the outside that is projected into the room
     */
    buildLight(){

        // Create spotlight
        this.spotLight = new THREE.SpotLight("#ffffff", 150, 200, Math.PI/3, 0.2, 0.9);
        this.spotLight.castShadow = true;
        this.mapSize = 1024
        this.spotLight.shadow.mapSize.width = this.mapSize;
        this.spotLight.shadow.mapSize.height = this.mapSize;
        this.spotLight.shadow.camera.near = 0.5;
        this.spotLight.shadow.camera.far = 500;
        this.spotLight.shadow.camera.left = -500;
        this.spotLight.shadow.camera.right = 500;
        this.spotLight.shadow.camera.bottom = -500;
        this.spotLight.shadow.camera.top = 500;
        // So the tv stand shadow won't be all bugged
        this.spotLight.shadow.bias = -0.00001;
        
        // Place the spotlight at the landscape and point it to the center of the window
        this.spotLight.position.set(0, 0, -30);
        this.spotLight.target.position.set(0, 0, 0);

        // Add spotlight helper
        //this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        //this.spotLight.add(this.spotLightHelper);

        // Add the spotlight to the scene
        this.contents.app.scene.add(this.spotLight);
        this.contents.app.scene.add(this.spotLight.target);

        this.group.add(this.spotLight)
        this.group.add(this.spotLight.target)
        
       // this.spotLightHelper.update();
    }

    /**
     * Initializes all the GUI elements for the window
     */
    initGui(){
        // Default GUI
        super.initGui();

        // Light GUI
        super.initGuiLight(this.spotLight, null, true);

        // Glass GUI
        this.glass.initGui();
        this.glass.initGuiColor();
        this.glass.initGuiTexture();

        // Landscape GUI
        this.landscape.initGui();
        this.initGuiColorLandscape();
        this.landscape.initGuiMove(true, true, true, [[-10, -10, -20], [10, 10, -3]]);
        this.landscape.initGuiScale(true, true, false)
        this.landscape.initGuiRotate()
        this.landscape.initGuiTexture();

        // Frame GUI
        this.framesEntity.initGuiColor("#612014");
        this.framesEntity.initGuiTexture();
        this.framesEntity.initGuiShadow();
        this.framesEntity.folder.close();
    }

    /**
     * Initializes the GUI elements for the landscape color. Differs from other entities because it uses a Basic material
     */
    initGuiColorLandscape(){
        let folder = this.landscape.folder.addFolder('Color');
        folder.close();
        folder.addColor(this.landscapeMaterial, 'color').name('Color')
    }
}

export { MyWindow };