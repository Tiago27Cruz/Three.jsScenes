import * as THREE from 'three'
import { MyEntity } from './MyEntity.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

class MyCurtains extends MyEntity{
    /**
     * Constructor for the curtains
     * @param {MyContents} conte
     * @param {string} name
     * @param {MyEntity} parent
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     */
    constructor(contents, name = "Curtains", parent = null, width = 1, depth = 1, height = 1){
        super(contents, name, parent, width, depth, height);
        this.init();
    }

    /**
     * Initializes all the elements of the curtains
     */
    init(){
        super.init(this);
        this.builder = new MyNurbsBuilder();

        this.initTextures();
        this.initMaterials();
        this.initPrimitives();
        
        this.build();
        
        this.initGui();
    }

    /**
     * Initializes the textures used by the curtains and related components
     */
    initTextures(){
        this.legoTexture = this.contents.loadTexture('single_lego2');

        this.curtainTexture = this.contents.loadTexture('curtain');
    }

    /**
     * Initializes the materials used by the curtains and related components
     */
    initMaterials(){
        this.handleMaterial = this.contents.materials.get('PhongDoubleSide').clone();
        this.handleMaterial.color = new THREE.Color('#ffff00');
        this.handleMaterial.map = this.legoTexture;

        this.rodMaterial = this.contents.materials.get('Phong').clone();
        this.rodMaterial.color = new THREE.Color('#333333');

        this.curtainMaterial = this.contents.materials.get('PhongDoubleSide').clone();
        this.curtainMaterial.color = new THREE.Color('#ff0000');
        this.curtainMaterial.map = this.curtainTexture;
    }

    /**
     * Initializes the primitives used by the curtains and related components
     */
    initPrimitives(){
        this.boxObj = this.contents.buildObject('Box');
        this.cylinderObj = this.contents.buildObject('Cylinder', 1, 1, 1, 32);
    }

    /**
     * Builds the curtains, including the rod, handles and curtain itself
     */
    build() {
    
        // Rod handles
        this.leftRodHandle = this.buildRodHandle();
        this.leftRodHandle.move(-0.9 * this.width / 2, 0, 0);
    
        this.rightRodHandle = this.buildRodHandle();
        this.rightRodHandle.move(0.9 * this.width / 2, 0, 0);
    
        // Rod
        this.buildRod();

        let curtainMesh = this.buildCurtains();
    
        // Curtains
        this.leftCurtain = new MyEntity(this.contents, "Left Curtain", this, 1, 1, 1, null, null, null, true, true);
        this.assignMesh(this.leftCurtain, curtainMesh.clone());
        this.leftCurtain.move(-this.width / 2, -this.rod.width / 2, this.leftRodHandle.depth);
    
        this.rightCurtain = new MyEntity(this.contents, "Right Curtain", this, 1, 1, 1, null, null, null, true, true);
        this.assignMesh(this.rightCurtain, curtainMesh);
        // Rotate so it closes the other way around
        this.rightCurtain.rotate(0, Math.PI, 0);
        this.rightCurtain.move(this.width / 2, -this.rod.width / 2, this.rightRodHandle.depth);
    }

    /**
     * Builds the rod handle, with a lego hand serving as the handle
     * @returns {MyEntity} The rod handle
     */
    buildRodHandle(){
        const rodHandle = new MyEntity(this.contents, "Rod Handle", this, 1, 1, 1);

        // Lego connector

        const connectorWidth = 5.8
        const connectorHeight = connectorWidth
        const connectorDepth = 0.2*connectorWidth

        const leftConnector = new MyEntity(this.contents, "Left Connector", rodHandle, connectorWidth, connectorHeight, connectorDepth, this.boxObj, this.handleMaterial, null, true, false);
        leftConnector.rotate(-Math.PI/2, 0, 0);
        leftConnector.move(0, 0, connectorDepth/2);

        // Arm
        const armWidth = 0.1*connectorWidth
        const armHeight = armWidth
        const armDepth = 1.5

        const leftArm = new MyEntity(this.contents, "Left Arm", rodHandle, armWidth, armHeight, armDepth, this.cylinderObj, this.handleMaterial, null, true, false);
        leftArm.rotate(-Math.PI/2, 0, 0);
        leftArm.move(0, 0, connectorDepth+armDepth/2);

        // Wrist

        const wristWidth = 1.33*armWidth
        const wristHeight = wristWidth
        const wristDepth = armDepth*0.5

        const leftWrist = new MyEntity(this.contents, "Left Wrist", rodHandle, wristWidth, wristHeight, wristDepth, this.cylinderObj, this.handleMaterial, null, true, false);
        leftWrist.rotate(-Math.PI/2, 0, 0);
        leftWrist.move(0, 0, connectorDepth+armDepth + wristDepth/2);

        // Hand

        const handObj = this.contents.buildObject('Torus', 1, 0.4, 12, 100, Math.PI);
        
        const handWidth =  0.2* connectorWidth
        const handHeight = 1.6 * handWidth
        const handDepth =  0.3 * connectorWidth

        //const handWidth = 0.5 // Vai para cima
        //const handHeight = 1 // vai para os lados
        //const handDepth = 1 // vai para trás

        const hand = new MyEntity(this.contents, "Left Hand", rodHandle, handWidth, handHeight, handDepth, handObj, this.handleMaterial, null, true, false);
        hand.move(0, 0, connectorDepth+armDepth + handHeight + wristDepth/2 - wristDepth/5 + handDepth/2);
        hand.rotate(0,-Math.PI/2,Math.PI/2);

        // Add circles to close out the hand opening
        const circleObj = this.contents.buildObject('Circle', 1, 32);

        const circleWidth = 0.8*handHeight/2
        const circleHeight = 0.8* handWidth/2 // vai para cima

        const circleDepth =1  // vai para cima

        const topCircle = new MyEntity(this.contents, "Top Circle", rodHandle, circleWidth, circleDepth, circleHeight, circleObj, this.handleMaterial, null, true, false);
        
        const circleTopY=handWidth
        const circleTopZ=connectorDepth+armDepth + handHeight + wristDepth/2 - wristDepth/5 + handDepth/2

        topCircle.move(0, circleTopY, circleTopZ);

        const bottomCircle = new MyEntity(this.contents, "Bottom Circle", rodHandle, circleWidth, circleDepth, circleHeight, circleObj, this.handleMaterial, null, true, false);

        bottomCircle.move(0, -circleTopY, circleTopZ);

        rodHandle.depth = connectorDepth + armDepth + handHeight + wristDepth/2 - wristDepth/5;
        rodHandle.height = connectorHeight;
        rodHandle.armRadius = wristWidth;

        return rodHandle;
    }

    /**
     * Builds the rod and places it on the handles
     */
    buildRod(){
        const rodWidth = this.leftRodHandle.armRadius
        const rodHeight = rodWidth
        const rodDepth = this.width

        this.rod = new MyEntity(this.contents, "Rod", this, rodWidth, rodHeight, rodDepth, this.cylinderObj, this.rodMaterial, null, true, true);
        this.rod.rotate(Math.PI/2, 0, Math.PI/2);
        this.rod.move(0,0,this.leftRodHandle.depth);
    }

    /**
     * Builds a curtain and places the mesh created on the curtain entity
     * @returns {THREE.Mesh} The curtain mesh
     */
    buildCurtains(){

        this.samplesU = 64
        this.samplesV = 32
        let controlPoints = [];
        let surfaceData;
        let mesh;
        let orderU = 50
        let orderV = 3
        const spirals = 6

        //controlPoints = []
        let points = []
        let angle, x, y, z, rand1, rand2
        for (let i = 0; i <= orderU; i++) {
            points = []

            rand1 = Math.random() * this.rod.width - this.rod.width
            rand2 = Math.random() * this.rod.width - this.rod.width

            angle = Math.PI/2 * (i / orderU) * spirals
              
            x = this.width/2 * (i / orderU)
            z = this.rod.width * Math.cos(angle)
            y = this.height
            
            points.push([x, 0, z, 1])
            points.push([x, -y/4, z+rand2*z, 1])
            points.push([x, -3*y/4, z+rand1*z, 1])
            points.push([x, -y, z, 1])

            controlPoints.push(points)
        }

        surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.curtainMaterial)  
        mesh = new THREE.Mesh( surfaceData, this.curtainMaterial );
        //mesh.rotation.x = Math.PI/2
        mesh.rotation.y = 0
        mesh.rotation.z = 0
        mesh.scale.set(0.10,1,1)

        return mesh
    }

    /**
     * Assigns the mesh to the curtain entity and adds it to the group
     * @param {MyEntity} curtain 
     * @param {THREE.Mesh} mesh 
     */
    assignMesh(curtain, mesh){
        curtain.mesh = mesh;
        curtain.group = null;
        curtain.children = null;

        curtain.height = this.height
        curtain.width = this.width/2 * 0.10
        curtain.depth = this.rod.width

        this.group.add(mesh);
    }

    /**
     * Initializes the GUI elements for the curtains and related components
     */
    initGui(){
        this.initGuiHandle();

        super.initGui();
        this.initGuiColorCurtain();
        this.initGuiMove();
        super.initGuiTexture(this.curtainTexture);
        super.initGuiShadow();

        this.leftCurtain.initGui();
        this.rightCurtain.initGui();
        this.initGuiScaleCurtain();

        this.rod.initGuiColor();
        this.rod.folder.close();
    }
    
    /**
     * Initializes the GUI for the curtains scale
     */
    initGuiScaleCurtain(){
        const leftScale = this.leftCurtain.folder.addFolder("Scale");

        // Scale from 0.05% to 100%, where 100% it closes completely
        leftScale.add(this.leftCurtain.mesh.scale, 'x', 0.05, 1).name("Width")
        // Scale from 0% to 100%, where 100% it hides completely
        leftScale.add(this.leftCurtain.mesh.scale, 'y', 0, 1).name("Height")

        const rightScale = this.rightCurtain.folder.addFolder("Scale");

        rightScale.add(this.rightCurtain.mesh.scale, 'x', 0.05, 1).name("Width")
        rightScale.add(this.rightCurtain.mesh.scale, 'y', 0, 1).name("Height")

        leftScale.close();
        rightScale.close();
    }

    /**
     * Initializes the GUI for the curtains color
     */
    initGuiColorCurtain(){
        const color = this.folder.addFolder("Curtains Color");
        color.close()

        color.addColor(this.curtainMaterial, 'color').name("Color");
        color.addColor(this.curtainMaterial, 'specular').name("Specular");
        color.add(this.curtainMaterial, 'shininess', 0, 100).name("Shininess");
    }

    /**
     * Initializes the GUI for the handles and adds an option to change both their colors at once
     */
    initGuiHandle(){
        const handleFolder = this.folder.addFolder("Handles");
        handleFolder.close();

        const colorFolder = handleFolder.addFolder("Color");
        colorFolder.close()

        colorFolder.addColor(this.handleMaterial, 'color').name("Color");
        colorFolder.addColor(this.handleMaterial, 'specular').name("Specular");
        colorFolder.add(this.handleMaterial, 'shininess', 0, 100).name("Shininess");
    }

    /**
     * Initializes the GUI for the curtains movement
     */
    initGuiMove(){
        const moveFolder = this.folder.addFolder('Move');
        moveFolder.close()
        const step = 5.9 // lego distance

        moveFolder.add(this.group.position, 'x', -step*2, step*2, step).name('X')
    }
}

export { MyCurtains };
