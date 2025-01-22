import * as THREE from 'three'
import { MyEntity } from './MyEntity.js';
import { MyTv } from './MyTv.js';

class MyTVStand extends MyEntity{
    /**
     * TV Stand constructor
     * @param {MyContents} contents
     * @param {string} name
     * @param {MyEntity} parent
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     */
    constructor(contents, name = "TV Stand", parent = null, width = 1, depth = 1, height = 1){
        super(contents, name, parent, width, depth, height);
        this.init();
    }

    /**
     * Initializes the TV Stand
     */
    init(){
        super.init(this);

        this.initTextures();
        this.initMaterials();

        this.build();
        
        this.initGui();
    }

    /**
     * Initializes the textures used by the TV Stand
     */
    initTextures(){
        this.legoTexture = this.contents.loadTexture('single_lego2').clone();
        
        this.remoteTexture = this.contents.loadTexture('remote');
        this.remoteTexture.wrapS = THREE.ClampToEdgeWrapping
        this.remoteTexture.wrapT = THREE.ClampToEdgeWrapping
        this.remoteTexture.rotate = Math.PI/2
    }

    /**
     * Initializes the materials used by the TV Stand
     */
    initMaterials(){
        // Define the lego material to be used by all lego components
        this.color = '#eac895';
        this.specular = '#ffffff';
        this.shininess = 15;

        this.legoMaterial = this.contents.materials.get('PhongDoubleSide').clone();
        this.legoMaterial.color = new THREE.Color(this.color);
        this.legoMaterial.specular = new THREE.Color(this.specular);
        this.legoMaterial.shininess = this.shininess;

        // Define remote material
        this.remoteMaterial = this.contents.materials.get('Phong').clone();
        this.remoteMaterial.color = new THREE.Color('#4f4f4f');
        this.remoteMaterial.map = this.remoteTexture;

        this.remoteMaterialUntextured = this.contents.materials.get('Phong').clone();
        this.remoteMaterialUntextured.color = new THREE.Color('#4f4f4f');
    }
    
    /**
     * Builds the TV Stand
     */
    build(){
        this.boxObj = this.contents.buildObject('Box');
        this.cylinderObj = this.contents.buildObject('Cylinder', 1, 1, 1, 32, 1, true);

        this.buildStand();
        this.buildDrawers();
        this.addShadows(true, false);
        this.addTv();
        this.addTvRemote();
    }

    /**
     * Builds the stand itself
     */
    buildStand(){
        // Define dimensions
        const standWidth = this.width;
        const standDepth = this.depth;
        const standHeight = 0.65*this.height;

        // Create stand and place it's bottom at 0,0,0
        if(this.stand === undefined){
            this.stand = new MyEntity(this.contents, "Stand", this, standWidth, standDepth, standHeight, this.boxObj, this.legoMaterial, this.legoTexture, true, false);
        }
        this.stand.scaleTo(standWidth, standHeight, standDepth);
        this.stand.moveTo(0, this.stand.mesh.scale.y/2, 0);

        // Build legos on top of it
        //this.contents.buildLego(stand, 0, standHeight, 0, standWidth, standDepth, 7, this.legoMaterial);
    }

    /**
     * Builds the drawers in front of the stand
     */
    buildDrawers(){
        // Define dimensions for all drawers
        const drawerWidth = 0.30*this.width
        const drawerDepth = this.depth/10
        const drawerHeight = 0.8*this.stand.mesh.scale.y;

        const legoWidth = 0.1*drawerWidth;
        const legoDepth = legoWidth;
        const legoHeight = 0.5*drawerDepth;

        // Middle Drawer
        if(this.drawerMiddle === undefined){
            this.drawerMiddle = new MyEntity(this.contents, "DrawerMiddle", this, drawerWidth, drawerHeight, drawerDepth, this.boxObj, this.legoMaterial, this.legoTexture, true, false);
        }
        this.drawerMiddle.scaleTo(drawerWidth, drawerHeight, drawerDepth);
        this.drawerMiddle.moveTo(0, this.stand.mesh.scale.y/2, this.stand.mesh.scale.z/2 + drawerDepth/2);

        if(this.legoMiddle === undefined){
            this.legoMiddle = new MyEntity(this.contents, "LegoMiddle", this, legoWidth, legoDepth, legoHeight, this.cylinderObj, this.legoMaterial, this.legoTexture, true, false);
            this.legoMiddle.rotate(Math.PI/2, 0, 0);
        }
        
        this.legoMiddle.scaleTo(legoWidth, legoHeight, legoDepth);
        this.legoMiddle.moveTo(0, this.stand.mesh.scale.y/2, this.stand.mesh.scale.z/2 + drawerDepth+ legoHeight/2);
        

        // Left Drawer
        if (this.drawerLeft === undefined){
            this.drawerLeft = new MyEntity(this.contents, "DrawerLeft", this, drawerWidth, drawerDepth, drawerHeight, this.boxObj, this.legoMaterial, this.legoTexture, true, false);
        }
        this.drawerLeft.scaleTo(drawerWidth, drawerHeight, drawerDepth);
        this.drawerLeft.moveTo(-drawerWidth, this.stand.mesh.scale.y/2, this.stand.mesh.scale.z/2 + drawerDepth/2);

        if(this.legoLeft === undefined){
            this.legoLeft = new MyEntity(this.contents, "LegoLeft", this, legoWidth, legoDepth, legoHeight, this.cylinderObj, this.legoMaterial, this.legoTexture, true, false);
            this.legoLeft.rotate(Math.PI/2, 0, 0);
        }
        
        this.legoLeft.scaleTo(legoWidth, legoHeight, legoDepth);
        this.legoLeft.moveTo(-drawerWidth, this.stand.mesh.scale.y/2, this.stand.mesh.scale.z/2 + drawerDepth+ legoHeight/2);
        

        // Right Drawer
        if (this.drawerRight === undefined){
            this.drawerRight = new MyEntity(this.contents, "DrawerRight", this, drawerWidth, drawerDepth, drawerHeight, this.boxObj, this.legoMaterial, this.legoTexture, true, false);
        }

        this.drawerRight.scaleTo(drawerWidth, drawerHeight, drawerDepth);
        this.drawerRight.moveTo(drawerWidth, this.stand.mesh.scale.y/2, this.stand.mesh.scale.z/2 + drawerDepth/2);

        if(this.legoRight === undefined){
            this.legoRight = new MyEntity(this.contents, "LegoRight", this, legoWidth, legoDepth, legoHeight, this.cylinderObj, this.legoMaterial, this.legoTexture, true, false);
            this.legoRight.rotate(Math.PI/2, 0, 0);
        }
        
        this.legoRight.scaleTo(legoWidth, legoHeight, legoDepth);
        this.legoRight.moveTo(drawerWidth, this.stand.mesh.scale.y/2, this.stand.mesh.scale.z/2 + drawerDepth+ legoHeight/2);
        

    }

    /**
     * Adds a TV to the stand
     */
    addTv(){
        this.tv = new MyTv(this.contents, "TV", this, this.drawerMiddle.width, 0.5*this.depth, 0.35*this.height);
        this.tv.move(0, this.stand.height,0);
    }

    /**
     * Adds a remote to the stand
     */
    addTvRemote(){
        const remoteWidth = 0.05*this.width;
        const remoteDepth = 0.05*this.depth;
        const remoteHeight = 0.15*this.height;

        // List of materials as to the only textured material is the top of the remote
        const materials = [this.remoteMaterialUntextured, this.remoteMaterialUntextured, this.remoteMaterialUntextured, this.remoteMaterialUntextured, this.remoteMaterialUntextured, this.remoteMaterial];

        this.remote = new MyEntity(this.contents, "Remote", this, remoteWidth, remoteDepth, remoteHeight, this.boxObj, materials, null, true, true);
        this.remote.move(-this.drawerMiddle.width, this.stand.height + remoteDepth/2, this.stand.depth/4);
        this.remote.rotate(Math.PI/2, 0, 3*Math.PI/4);
    }

    /**
     * initializes all the GUI elements for the TV Stand and its components
     */
    initGui(){
        super.initGui();
        this.initGuiColor();
        this.initGuiMove();
        this.initGuiScale();
        this.initGuiRotate();
        super.initGuiShadow();
        
        

        this.remote.initGui();
        this.remote.initGuiColorMaterials([this.remoteMaterial, this.remoteMaterialUntextured]);
        const remoteLimits = [[-10,0,-2], [10,0,3]];
        this.remote.initGuiMove(true, false, true, remoteLimits);
        this.remote.initGuiScale()
        this.remote.initGuiRotate(false, false, true);
        this.remote.initGuiTexture(this.remoteTexture);
        this.remote.initGuiShadow();
    }

    /**
     * Initializes the GUI elements for the color of the TV Stand, modified MyEntity version as to change the color of all components at once
     */
    initGuiColor(){
        const colorFolder = this.folder.addFolder('Color');

        colorFolder.addColor(this, 'color').name('Color').onChange((color) => {
            this.legoMaterial.color = new THREE.Color(color);
        });
        colorFolder.addColor(this, 'specular').name('Specular').onChange((color) => {
            this.legoMaterial.specular = new THREE.Color(color);
        });
        colorFolder.add(this, 'shininess', 0, 100).name('Shininess').onChange((shininess) => {
            this.legoMaterial.shininess = shininess;
        });

        colorFolder.close();

    }

    /**
     * Initializes the GUI elements for moving the TV Stand
     */
    initGuiMove(){
        const moveFolder = this.folder.addFolder('Move');
        moveFolder.close()
        const step = 7 // lego distance

        moveFolder.add(this.group.position, 'x', -step*6, step*6, step).name('X')
        moveFolder.add(this.group.position, 'z', -step*6, step*6, step).name('Z')
    }

    /**
     * Initializes the GUI elements for rotating the TV Stand
     */
    initGuiRotate(){
        const rotateFolder = this.folder.addFolder('Rotate');
        rotateFolder.close()
        rotateFolder.add(this.group.rotation, 'y', -Math.PI, Math.PI, Math.PI/2).name('Y')
    }

    /**
     * Initializes the GUI for scaling the TV Stand
     */
    initGuiScale(){
        const scaleFolder = this.folder.addFolder('Scale');
        scaleFolder.close();
        this.scaleToX = scaleFolder.add(this, 'width', this.width/3, this.width*3).name('width').step(14).onChange(()=>{
            this.buildStand();
            this.buildDrawers();
            this.tv.moveTo(0, this.stand.mesh.scale.y,0);
            this.remote.moveTo(-this.drawerMiddle.width, this.stand.mesh.scale.y + 0.05*this.depth/2, this.stand.depth/4);
        });
        this.scaleToY = scaleFolder.add(this, 'height', this.height/3, this.height*3).name('height').onChange(()=>{
            this.buildStand();
            this.buildDrawers();
            this.tv.moveTo(0, this.stand.mesh.scale.y,0);
            this.remote.moveTo(-this.drawerMiddle.width, this.stand.mesh.scale.y + 0.05*this.depth/2, this.stand.depth/4);
        });
        this.scaleToZ = scaleFolder.add(this, 'depth', this.depth/3, this.depth*3).name('depth').step(7).onChange(()=>{
            this.buildStand();
            this.buildDrawers();
            this.tv.moveTo(0, this.stand.mesh.scale.y,0);
            this.remote.moveTo(-this.drawerMiddle.width, this.stand.mesh.scale.y + 0.05*this.depth/2, this.stand.depth/4);
        });
    }
}

export { MyTVStand };
