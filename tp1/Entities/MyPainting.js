import * as THREE from 'three';
import { MyEntity } from './MyEntity.js';
import { MyCurvedLine } from './MyCurvedLine.js';

class MyPainting extends MyEntity {
    /**
     * 
     * @param {MyContents} contents
     * @param {Text} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
     * @param {Text} pictureName - Name of the texture jpeg file to be used as the painting or "beetle" for a beetle silhouette
     */
    constructor(contents, name = "Painting", parent = null, width = 1, depth = 1, height = 1, pictureName = "jomi"){
        super(contents, name, parent, width, depth, height);
        this.pictureName = pictureName;
        this.init();
    }

    /**
     * Initializes the painting
     */
    init(){
        super.init(this)
        
        this.initTextures();
        this.initMaterials();
        this.initPrimitives();

        this.build();

        this.initGui();
    }

    /**
     * Initializes the textures used by the painting
     */
    initTextures(){
        this.legoTexture = this.contents.loadTexture('single_lego2').clone();
        
        // Load the picture texture if needed
        this.pictureTexture = null;
        switch(this.pictureName){
            case "jomi":
                this.pictureTexture = this.contents.loadTexture('jomi');
                break;
            case "tiago":
                this.pictureTexture = this.contents.loadTexture('tiago');
                break;
            case "beetle":
                this.pictureTexture = this.contents.loadTexture('single_lego2').clone(); // So it has a white canvas behind
                break;
            default:
                break;
        }
    }

    /**
     * Initializes the materials used by the painting
     */
    initMaterials(){
        this.frameMaterial = this.contents.materials.get("Phong").clone();
        this.frameMaterial.color = new THREE.Color('#9e4f14');

        this.paintingMaterial = this.contents.materials.get("Phong").clone();
        this.paintingMaterial.color = new THREE.Color('#ffffff');
        this.paintingMaterial.transparent = true;
    }

    /**
     * Initializes the primitives used by the painting
     */
    initPrimitives(){
        this.boxObj = this.contents.buildObject('Box');
        this.planeObj = this.contents.buildObject('Plane');
    }

    /**
     * Builds the painting
     */
    build(){
        
        this.buildFrame();
        this.buildPainting();

    }

    /**
     * Builds the frame of the painting
     */
    buildFrame(){
        // Define dimensions
        const frameSidesWidth = 0.1 * this.width;
        const frameTopWidth = 0.8 * this.width; // 0.8 + 0.1 + 0.1 = 1 -> this.width
        const frameTopHeight = 0.1 * this.height; // In order to leave 0.8 x 0.8 (square) space for the painting

        // Parent Entity
        this.frameEntity = new MyEntity(this.contents, "Frames", this, frameSidesWidth*2, this.depth, frameTopHeight*2, null, this.frameMaterial, this.legoTexture, true);

        // Left frame
        const frameLeft = new MyEntity(this.contents, "FrameLeft", this.frameEntity, frameSidesWidth, this.depth, this.height, this.boxObj, this.frameMaterial, null, true, false);
        frameLeft.move(-this.width/2 + frameSidesWidth/2);

        // Bottom frame
        const frameBottom = new MyEntity(this.contents, "FrameBottom", this.frameEntity, frameTopWidth, this.depth, frameTopHeight, this.boxObj, this.frameMaterial, null, true, false);
        frameBottom.move(0, -this.height/2+frameBottom.height/2);

        // Top frame
        const frameTop = new MyEntity(this.contents, "FrameTop", this.frameEntity, frameTopWidth, this.depth, frameTopHeight, this.boxObj, this.frameMaterial, null, true, false);
        frameTop.move(0, this.height/2-frameTop.height/2);

        // Right frame
        const frameRight = new MyEntity(this.contents, "FrameRight", this.frameEntity, frameSidesWidth, this.depth, this.height, this.boxObj, this.frameMaterial, null, true, false);
        frameRight.move(this.width/2 - frameSidesWidth/2);
    }

    /**
     * Builds the painting, beetle or picture
     */
    buildPainting(){
        this.painting = null

        if (this.pictureName === "beetle"){
            this.drawBeetleSilhouette();
        }

       const pictureWidth = this.width - this.frameEntity.width;
       const pictureHeight = this.height - this.frameEntity.height;
       
       this.painting = new MyEntity(this.contents, 'Canvas', this, pictureWidth, this.depth, pictureHeight, this.planeObj, this.paintingMaterial, this.pictureTexture, true);
       this.painting.moveToEntity(this.frameEntity);
       this.painting.move(0, 0, this.depth/4)
    }


    /**
     * Draws the silhouette of a beetle
     */
    drawBeetleSilhouette(){
        this.beetle = new MyEntity(this.contents, "Beetle", this, 1, 1, 1, null, null, null, true, true);

        // Default values for all curves
        const depth = 0.3
        const samples = 200;
        this.lineMaterial = new THREE.LineBasicMaterial({color: 0x000000});

        // Wheels
        this.drawWheels(samples);

        // Right Body
        this.drawRightBeetleBody(samples);

        // Left Body
        const leftRadius = 0.8*2
        const pointsLeftBody = [
            new THREE.Vector3(-leftRadius, 0, 0),
            new THREE.Vector3(-leftRadius, leftRadius, 0),
            new THREE.Vector3(0, leftRadius, 0), 
        ];
        let curveLeftBody = new THREE.QuadraticBezierCurve3(pointsLeftBody[0], pointsLeftBody[1], pointsLeftBody[2]);
        let positionLeftBody = new THREE.Vector3(0,-0.4*2,0);
        this.LeftBody = new MyCurvedLine(this.contents, curveLeftBody, positionLeftBody, samples, this.lineMaterial, this.beetle);
        //this.LeftBody.drawHull(positionLeftBody, pointsLeftBody);

        this.beetle.move(0,0,depth)
        this.beetle.group.scale.x = 3
        this.beetle.group.scale.y = 3
    }

    /**
     * Draws the right part of the beetle's body
     * @param {Number} samples 
     */
    drawRightBeetleBody(samples){
        // Top
        const radius = 0.4*2
        const pointsRightBody = [
            new THREE.Vector3(0, radius, 0),
            new THREE.Vector3(radius, radius, 0),
            new THREE.Vector3(radius, 0, 0),
        ];
        let curveRightBody = new THREE.QuadraticBezierCurve3(pointsRightBody[0], pointsRightBody[1], pointsRightBody[2]);
        let positionRightBody = new THREE.Vector3(0,0,0);
        this.RightBody = new MyCurvedLine(this.contents, curveRightBody, positionRightBody, samples, this.lineMaterial, this.beetle);
        //this.RightBody.drawHull(positionRightBody, pointsRightBody);

        // Bottom
        let positionBottomRight = new THREE.Vector3(0.4*2,-0.4*2,0);
        this.BottomRight = new MyCurvedLine(this.contents, curveRightBody, positionBottomRight, samples, this.lineMaterial, this.beetle);
        //this.BottomRight.drawHull(positionBottomRight, pointsRightBody);
    }

    /**
     * Draws the wheels of the beetle
     * @param {Number} samples 
     */
    drawWheels(samples){
        // Left Wheel
        const wheelRadius = 0.3*2;
        const pointsLeftWheel = [
            new THREE.Vector3(-wheelRadius, 0, 0),
            new THREE.Vector3(-wheelRadius, wheelRadius* (4/3), 0),
            new THREE.Vector3(wheelRadius, wheelRadius* (4/3), 0),
            new THREE.Vector3(wheelRadius, 0, 0)
        ];
        let curveLeftWheel = new THREE.CubicBezierCurve3(pointsLeftWheel[0], pointsLeftWheel[1], pointsLeftWheel[2], pointsLeftWheel[3]);
        let positionLeftWheel = new THREE.Vector3(-0.5*2,-0.4*2,0);
        this.LeftWheel = new MyCurvedLine(this.contents, curveLeftWheel, positionLeftWheel, samples, this.lineMaterial, this.beetle);
        //this.LeftWheel.drawHull(positionLeftWheel, pointsLeftWheel);

        // Right Wheel
        let positionRightWheel = new THREE.Vector3(0.5*2,-0.4*2,0);
        this.RightWheel = new MyCurvedLine(this.contents, curveLeftWheel, positionRightWheel, samples, this.lineMaterial, this.beetle);
        //this.RightWheel.drawHull(positionRightWheel, pointsLeftWheel);
    }

    /**
     * Initializes the GUI for the painting
     */
    initGui(){
        super.initGui();
        this.initGuiShadow();

        this.frameEntity.initGui()
        this.frameEntity.initGuiColor("#9e4f14");
        this.frameEntity.initGuiTexture()
        this.frameEntity.initGuiShadow();

        this.painting.initGui();
        this.painting.initGuiColor("#ffffff");
        this.painting.initGuiTexture();
        

        if(this.pictureName == "beetle"){
            this.beetle.initGui();
            this.initBeetleColor();
            this.beetle.initGuiMoveTo(true, true, false, [[-3.54, -3.54, 0], [3.54, 3.54, 0]]);
            this.beetle.initGuiScale(true, true, false, true);
            this.initBeetleRotate();
        } 
    }

    /**
     * Custom function for the beetle rotation GUI option
     */
    initBeetleRotate(){
        let rotateFolder = this.beetle.folder.addFolder("Rotation");
        rotateFolder.close()

        rotateFolder.add(this.beetle.group.rotation, 'x', 0, Math.PI).name("X").step(Math.PI)
        rotateFolder.add(this.beetle.group.rotation, 'y', 0, Math.PI).name("Y").step(Math.PI)
        rotateFolder.add(this.beetle.group.rotation, 'z', -Math.PI, Math.PI).name("Z")
    }

    /**
     * Initializes the GUI for the beetle color
     */
    initBeetleColor(){
        let colorFolder = this.beetle.folder.addFolder("Color");
        colorFolder.close()

        colorFolder.addColor(this.lineMaterial, 'color').name("Color")  
    }
}

export { MyPainting };