import * as THREE from 'three'
import { MyEntity } from "./MyEntity.js";
import { MyNewspaper } from "./MyNewspaper.js";
import { MyJar } from "./MyJar.js";

class MyFireplace extends MyEntity{
    /**
     * Constructor for the fireplace
     * @param {MyContents} contents 
     * @param {Text} name 
     * @param {MyEntity} parent 
     * @param {Number} width 
     * @param {Number} depth 
     * @param {Number} height 
     */
    constructor(contents, name = "Fireplace", parent = null, width = 1, depth = 1, height = 1){
        super(contents, name, parent, width, depth, height);
        this.init();
    }

    /**
     * Initializes everything related to the whole fireplace
     */
    init(){
        super.init(this)

        this.initTextures();
        this.initMaterials();
        this.build();

        this.initGui();
    }

    /**
     * Initializes the textures used by the fireplace
     */
    initTextures(){
        this.glassTexture = this.contents.loadTexture("glass").clone();
        this.woodTexture = this.contents.loadTexture("wood").clone();
        this.woodCircleTexture = this.contents.loadTexture("woodCircle").clone();
        this.legoTexture = this.contents.loadTexture("single_lego2").clone();
        this.jar_texture = this.contents.loadTexture("face2").clone();
        this.jar_texture.rotation = -Math.PI/2;
    }

    /**
     * Initializes the materials used by the fireplace
     */
    initMaterials(){
        // Fireplace outside material
        this.material = this.contents.materials.get("Phong").clone();
        this.material.color = new THREE.Color(0x939799);
        this.material.map = this.legoTexture;

        // Glass material
        this.glassMaterial = this.contents.materials.get("Phong").clone();
        this.glassMaterial.color = new THREE.Color(0x23ACC4);
        this.glassMaterial.transparent = true;
        this.glassMaterial.opacity = 0.4;
        this.glassMaterial.map = this.glassTexture;


        // Logs material
        this.logMaterial = this.contents.materials.get("Phong").clone();
        this.logMaterial.color = new THREE.Color(0x8B4513);
        this.logMaterial.specular = new THREE.Color(0x000000);
        this.logMaterial.map = this.woodTexture;

        this.logCircleMaterial = this.contents.materials.get("Phong").clone();
        this.logCircleMaterial.color = new THREE.Color(0x8B4513);
        this.logCircleMaterial.map = this.woodCircleTexture;
    }

    /**
     * Builds the fireplace
     */
    build(){
        const boxObj = this.contents.buildObject('Box');

        // Platform
        const platformWidth = this.width;
        const platformDepth = this.depth;
        const platformHeight = 0.05*this.height;

        if(this.platform === undefined){
            this.platform = new MyEntity(this.contents, "Platform", this, platformWidth, platformDepth, platformHeight, boxObj, this.material, null, true, false);
            
            
            
        }
        var currentY = this.platform.mesh.scale.y/2;
        this.platform.moveTo(-14, 0, -7);
        this.platform.scaleTo(platformWidth, null, platformDepth);
        this.platform.move(this.platform.mesh.scale.x/2, currentY, this.platform.mesh.scale.z/2);
        currentY += this.platform.mesh.scale.y/2;

        // Left fireplace wall
        const leftWallWidth = 0.3*this.width;
        const leftWallDepth = 0.7*this.depth;
        const leftWallHeight = 0.30*this.height;

        
        if(this.leftWall === undefined){
            this.leftWall = new MyEntity(this.contents, "LeftWall", this, leftWallWidth, leftWallDepth, leftWallHeight, boxObj, this.material, null, true, false);
            
        }
        
        this.leftWall.moveTo(-14, 0, -7);
        this.leftWall.scaleTo(null, leftWallHeight, leftWallDepth);
        currentY += this.leftWall.mesh.scale.y/2;
        this.leftWall.move(this.leftWall.mesh.scale.x/2, currentY, this.leftWall.mesh.scale.z/2);


        // Right fireplace wall
        if(this.rightWall === undefined){
            this.rightWall = new MyEntity(this.contents, "RightWall", this, leftWallWidth, leftWallDepth, leftWallHeight, boxObj, this.material, null, true, false);
            
        } 
        this.rightWall.moveTo(-14, 0, -7);
        this.rightWall.scaleTo(null, leftWallHeight, leftWallDepth);
        this.rightWall.move(this.width - this.leftWall.mesh.scale.x/2, currentY, this.leftWall.mesh.scale.z/2);



        // Back fireplace wall
        const backWallWidth = this.width - this.leftWall.mesh.scale.x*2;
        const backWallDepth = 0.1*this.depth;
        const backWallHeight = 0.30*this.height;

        if(this.backWall === undefined){
            this.backWall = new MyEntity(this.contents, "BackWall", this, backWallWidth, backWallDepth, backWallHeight, boxObj, this.material, null, true, false); 
        } 
        this.backWall.moveTo(-14, 0, -7);
        this.backWall.scaleTo(backWallWidth, backWallHeight);
        this.backWall.move(this.backWall.mesh.scale.x/2+this.leftWall.mesh.scale.x, currentY, this.backWall.mesh.scale.z/2);

        // Front glass
        if(this.glass === undefined){
            this.glass = new MyEntity(this.contents, "Glass", this, backWallWidth, backWallDepth, backWallHeight, boxObj, this.glassMaterial, null, true, false, false);
        } 
        this.glass.moveTo(-14, 0, -7)
        this.glass.scaleTo(backWallWidth, backWallHeight);
        this.glass.move(this.glass.mesh.scale.x/2+this.leftWall.mesh.scale.x, currentY, leftWallDepth -  this.backWall.mesh.scale.z);

        
        

        // Logs
        if(this.logObj === undefined) this.logObj = this.contents.buildObject('Cylinder', 1, 1, 1, 32);
        const logWidth = 0.02*this.width;
        const logDepth = logWidth
        const logHeight = 0.10*this.height;

        // Bottom Log
        if(this.log1 === undefined){
            this.log1 = new MyEntity(this.contents, "Log1", this, logWidth, logDepth, logHeight, this.logObj, [this.logMaterial, this.logCircleMaterial, this.logCircleMaterial], null, true, false);
            this.log1.mesh.rotateY(Math.PI/4);
            this.log1.mesh.rotateX(Math.PI/2);
        }
        this.log1.moveToEntity(this.platform);
        this.log1.move(0, this.platform.mesh.scale.y/2 + this.log1.mesh.scale.x, -this.log1.mesh.scale.y/3);

        // Top Log
        if(this.log2 === undefined) {
            this.log2 = new MyEntity(this.contents, "Log2", this, logWidth, logDepth, logHeight, this.logObj, [this.logMaterial, this.logCircleMaterial, this.logCircleMaterial], null, true, false);
            this.log2.mesh.rotateZ(0.4);
            this.log2.mesh.rotateY(-Math.PI/4);
            this.log2.mesh.rotateX(Math.PI/2);
        }
        this.log2.moveToEntity(this.platform);
        this.log2.move(0, this.platform.mesh.scale.y/2 + 3*this.log2.mesh.scale.x, -this.log2.mesh.scale.y/3);

        // Top
        const topWidth = this.width;
        const topDepth = this.depth;
        const topHeight = 0.05*this.height;

        if(this.top === undefined){
            this.top = new MyEntity(this.contents, "Top", this, topWidth, topDepth, topHeight, boxObj, this.material, null, true, false);
            

        } 
        this.top.moveTo(-14, 0, -7);
        this.top.scaleTo(topWidth, null, topDepth);
        currentY += this.rightWall.mesh.scale.y/2 + this.top.mesh.scale.y/2;
        this.top.move(this.top.mesh.scale.x/2, currentY, this.top.mesh.scale.z/2);
        // Top decoration
        this.addNewspaper(currentY+this.top.mesh.scale.y/2);
        this.addJar(currentY+this.top.mesh.scale.y/2, this.top.mesh.scale.x);




        // chimney
        const chimneyWidth = backWallWidth
        const chimneyDepth = leftWallDepth;
        const chimneyHeight = 0.60*this.height;
        if(this.chimney === undefined) {
            this.chimney = new MyEntity(this.contents, "Chimney", this, chimneyWidth, chimneyDepth, chimneyHeight, boxObj, this.material, null, true, false);
        }
        this.chimney.moveTo(-14, 0, -7);
        currentY += this.top.mesh.scale.y/2 + this.chimney.mesh.scale.y/2;
        this.chimney.scaleTo(chimneyWidth, chimneyHeight, chimneyDepth);
        this.chimney.move(this.chimney.mesh.scale.x/2+this.leftWall.mesh.scale.x, currentY, this.chimney.mesh.scale.z/2);

    }   
    
    /**
     * Places a newspaper on top of the fireplace
     * @param {Number} yPos 
     */
    addNewspaper(yPos){
        const leftPos = 1;
        if(this.newspaper === undefined) this.newspaper = new MyNewspaper(this.contents, "Newspaper", this, 5, 5, 10);
        this.newspaper.moveTo(-14, 0, -7);
        this.newspaper.move(leftPos+this.newspaper.width/2, yPos, this.depth/2);
    }

    /**
     * Places a jar on top of the fireplace
     * @param {Number} yPos 
     * @param {Number} topWidth 
     */
    addJar(yPos, topWidth){
        const leftPos = topWidth - 1;
        if(this.jar === undefined) this.jar = new MyJar(this.contents, "Jar", this, 12, 16, 5, 0.3, 0.75, 0.75, 10, true, this.jar_texture);
        this.jar.moveTo(-14, 0, -7);
        this.jar.move(leftPos-this.jar.width/4, yPos, this.depth/2);
    }

    /**
     * Initializes the GUI for the fireplace
     */
    initGui(){
        super.initGui();
        super.initGuiColor()
        this.initGuiMove();
        this.initGuiScale();
        this.initGuiRotate();
        super.initGuiShadow();
    }

    /**
     * Initializes the GUI for moving the fireplace
     */
    initGuiMove(){
        const moveFolder = this.folder.addFolder('Move');
        moveFolder.close()
        const step = 7 // lego distance

        moveFolder.add(this.group.position, 'x', -step*6, step*6, step).name('X')
        moveFolder.add(this.group.position, 'z', -step*6, step*6, step).name('Z')
    }

    /**
     * Initializes the GUI for rotating the fireplace
     */
    initGuiRotate(){
        const rotateFolder = this.folder.addFolder('Rotate');
        rotateFolder.close()
        rotateFolder.add(this.group.rotation, 'y', -Math.PI, Math.PI, Math.PI/2).name('Y').onChange(()=>{
            const depth_save = this.depth;
            this.depth = this.width;
            this.width = depth_save;
            this.scaleToX.updateDisplay();
            this.scaleToY.updateDisplay();
            this.scaleToZ.updateDisplay();

        })
    }

    /**
     * Initializes the GUI for scaling the fireplace
     */
    initGuiScale(){
        const scaleFolder = this.folder.addFolder('Scale');
        scaleFolder.close();
        this.scaleToX = scaleFolder.add(this, 'width', 0, this.width*3).name('width').step(7).onChange(()=>this.build());
        this.scaleToY = scaleFolder.add(this, 'height', 0, this.height*3).name('height').onChange(()=>this.build());
        this.scaleToZ = scaleFolder.add(this, 'depth', 0, this.depth*3).name('depth').step(7).onChange(()=>this.build());
    }
}

export {MyFireplace};