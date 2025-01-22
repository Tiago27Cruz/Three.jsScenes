import {MyEntity} from './MyEntity.js';
import * as THREE from 'three';
import { MyWindow } from './MyWindow.js';
import { MyPainting } from './MyPainting.js';
import { MyCurtains } from './MyCurtains.js';

class MyWalls extends MyEntity {
    /**
     * Constructor for the walls of the room
     * @param {MyContents} contents
     * @param {Text} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
     */
    constructor(contents, name = "Wall", parent = null, width = 10, depth= 10, height = 1) {
        super(contents, name, parent, width, depth, height);
        this.init();
    } 

    /**
     * Initializes the walls of the room
     */
    init(){
        super.init(this);

        this.initTextures();
        this.initMaterials();
        
        const primitiveObject = this.contents.buildObject('Plane');

        this.addWindow();
        this.buildWalls(primitiveObject);
        this.initGui();
        this.addToScene();
    } 

    /**
     * Initializes the textures used by the walls
     */
    initTextures(){
        this.texture = this.contents.loadTexture("lego_heads").clone();
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;

        let planeUVRate = this.height / this.width;

        this.planeTextureUVRate = 3840 / 2040; // image dimensions
        this.planeTextureRepeatU = 1
        let planeTextureRepeatV = this.planeTextureRepeatU * planeUVRate * this.planeTextureUVRate;

        this.texture.repeat.set(this.planeTextureRepeatU, planeTextureRepeatV);
        this.texture.rotation = 0;
        this.texture.offset = new THREE.Vector2(0,0);
    }

    initMaterials(){
        this.material = this.contents.materials.get("Phong").clone();
        this.material.color = new THREE.Color(0x59ffff);
        this.material.specular = new THREE.Color(0x000000);
        this.material.map = this.texture;
    }

    /**
     * Builds the walls of the room where the one we're looking through is transparent
     * @param {object} primitiveObject 
     */
    buildWalls(primitiveObject){
        const left = new MyEntity(this.contents, "left", this, this.depth, 1, this.height, primitiveObject, this.material, this.texture, true, false);
        left.mesh.rotation.y = Math.PI/2;
        left.moveTo(-this.width/2, this.height/2);
        
        const right = new MyEntity(this.contents, "right", this, this.depth, 1, this.height, primitiveObject, this.material, null, true, false);
        right.mesh.rotation.y = -Math.PI / 2;
        right.moveTo(this.width/2, this.height/2);

        const bottom = new MyEntity(this.contents, "bottom", this, this.width, 1, this.height, primitiveObject, this.material, null, true, false);
        bottom.mesh.rotation.y = Math.PI
        bottom.moveTo(null, this.height/2, this.depth/2);

        this.buildTopWall(primitiveObject, this.material);

        this.addPaintings(left, right, bottom);

        left.addShadows(true, true);
        right.addShadows(true, true);
        bottom.addShadows(true, true);
    }

    /**
     * Builds the top wall of the room with 4 walls around the window, forming a hole.
     * @param {THREE.PlaneGeometry} primitiveObject 
     */
    buildTopWall(primitiveObject){
        // Create a wall around the window
        const top = new MyEntity(this.contents, "top", this, this.width, 1, this.height, null, this.material, null, true, false);

        // Bottom part of the top wall
        this.material1 = this.material.clone();

        const top1Height = this.move_y - this.windowHeight/2;

        this.texture1 = this.material.map.clone();
        const UVRate1 = (top1Height) / this.width;
        const textureRepeatV1 = this.planeTextureRepeatU * UVRate1 * this.planeTextureUVRate;

        this.texture1.repeat.set(this.planeTextureRepeatU, textureRepeatV1);

        const top1 = new MyEntity(this.contents, "top1", top, this.width, 1, top1Height, primitiveObject, this.material1, this.texture1, true, false);
        top1.move(0, top1Height/2, 0);

        // Top part of the top wall
        const top2Height = this.height - this.windowHeight - top1Height;

        this.material2 = this.material.clone();
        this.texture2 = this.material.map.clone();
        const UVRate2 = top2Height / this.width;
        const textureRepeatV2 = this.planeTextureRepeatU * UVRate2 * this.planeTextureUVRate;

        this.texture2.repeat.set(this.planeTextureRepeatU, textureRepeatV2);

        const top2 = new MyEntity(this.contents, "top2", top, this.width, 1, top2Height, primitiveObject, this.material2, this.texture2, true, false);
        top2.move(0, this.height-(top2Height/2), 0);

        // Left part of the top wall
        const topWidth = this.width/2-this.windowWidth/2;
        this.material3 = this.material.clone();
        this.texture3 = this.material.map.clone();

        const UVRate3 = this.windowHeight / topWidth;
        const textureRepeatU3 = (topWidth*1)/this.width;
        const textureRepeatV3 = textureRepeatU3 * UVRate3 * this.planeTextureUVRate;
        this.texture3.offset = new THREE.Vector2(0, 0);

        this.texture3.repeat.set(textureRepeatU3, textureRepeatV3);

        const top3 = new MyEntity(this.contents, "top3", top, topWidth, 1, this.windowHeight, primitiveObject, this.material3, this.texture3, true, false);
        const moveLeft = -this.width/2 + topWidth/2;
        top3.move(moveLeft, this.move_y, 0);    

        // Right part of the top wall
        this.material4 = this.material.clone();
        this.texture4 = this.material.map.clone();
        this.texture4.offset = new THREE.Vector2(-0.0025, 0);

        this.texture4.repeat.set(textureRepeatU3, textureRepeatV3);

        const top4 = new MyEntity(this.contents, "top4", top, topWidth, 1, this.windowHeight, primitiveObject, this.material4, this.texture4, true, false);
        const moveRight = this.width/2 - topWidth/2;
        top4.move(moveRight, this.move_y, 0);

        top.moveTo(null, null, -this.depth/2);
        top.addShadows(true, true);
    }

    /**
     * Adds a window to the wall
     */
    addWindow(){
        this.move_x = 0;
        this.move_y = this.height/2 + this.height/8 + 0.5
        this.move_z = -this.depth/2+0.2;

        this.windowWidth = 77
        this.windowHeight = 29.4
        
        const window = new MyWindow(this.contents, 'Window', this, this.windowWidth, this.windowWidth, this.windowHeight);
        window.moveTo(this.move_x, this.move_y, this.move_z);

        this.addCurtains();
    }

    /**
     * Adds curtains
     */
    addCurtains(){
        const curtainsWidth = this.windowWidth + 2;
        const curtainsHeight = this.windowHeight + 3;

        const curtains = new MyCurtains(this.contents, "Curtains", this, curtainsWidth, 7, curtainsHeight);

        const curtainX = this.move_x
        const curtainY = this.move_y + this.windowHeight/2 + curtains.leftRodHandle.height/2
        const curtainZ = this.move_z
        curtains.moveTo(curtainX, curtainY, curtainZ);
    }

    /**
     * Adds paintings to a wall
     * @param {MyEntity} left wall
     * @param {MyEntity} right wall
     * @param {MyEntity} bottom wall
     */
    addPaintings(left, right, bottom){
        this.wallLego = 5.9

        const paintingJomi = new MyPainting(this.contents, "Painting", this, 2*this.wallLego, 1, 2*this.wallLego, "jomi");
        paintingJomi.moveToEntity(left);
        paintingJomi.rotate(0, Math.PI/2);
        paintingJomi.move(0, 12.15, -paintingJomi.width/2-8.9);

        const paintingTiago = new MyPainting(this.contents, "Painting", this, 2*this.wallLego, 1, 2*this.wallLego, "tiago");
        paintingTiago.moveToEntity(left);
        paintingTiago.rotate(0, Math.PI/2);
        paintingTiago.move(0, 12.15, paintingTiago.width/2+8.9);

        //const cross = new MyPainting(this.contents, "Cross", this, 0.5, 1, 0.5, null);
        //cross.moveToEntity(left);
        //cross.rotate(0, Math.PI/2);
        //cross.move(0, 0, cross.width/2+20);

        const beetle = new MyPainting(this.contents, "Beetle", this, 3*this.wallLego, 1, 2*this.wallLego, "beetle");
        beetle.moveToEntity(right);
        beetle.move(0,this.wallLego + 0.3,0)
        beetle.rotate(0, -Math.PI/2);


        this.initGuiMovePainting(paintingJomi);
        this.initGuiMovePainting(paintingTiago);
        this.initGuiMovePainting(beetle);
    }

    /**
     * Initializes the GUI for the walls of the room
     */
    initGui(){
        super.initGui();
        this.initGuiColor();
        this.initGuiTexture();
        super.initGuiShadow();
    }

    /**
     * Initializes the GUI for the color of the walls
     */
    initGuiColor(){
        const colorFolder = this.folder.addFolder('Color');

        colorFolder.addColor(this.material, 'color').name('Color').onChange((value) => {
            // Change the color of the material of the 3 walls and the all the materials of the top wall
            this.material.color = new THREE.Color(value);
            this.material1.color = new THREE.Color(value);
            this.material2.color = new THREE.Color(value);
            this.material3.color = new THREE.Color(value);
            this.material4.color = new THREE.Color(value);
        });
        colorFolder.addColor(this.material, 'specular').name('Specular').onChange((value) => {
            this.material.specular = new THREE.Color(value);
            this.material1.specular = new THREE.Color(value);
            this.material2.specular = new THREE.Color(value);
            this.material3.specular = new THREE.Color(value);
            this.material4.specular = new THREE.Color(value);
        });
        colorFolder.add(this.material, 'shininess', 0, 100).name('Shininess').onChange((value) => {
            this.material.shininess = value;
            this.material1.shininess = value;
            this.material2.shininess = value;
            this.material3.shininess = value;
            this.material4.shininess = value;
        });

        colorFolder.close();
        
    }

    /**
     * Initializes the GUI for the texture of the walls. Adapted to the 5 "different" textures used that are supose to be the same
     */
    initGuiTexture(){
        let textureFolder = this.folder.addFolder("Texture");

        textureFolder.add(this.texture, 'wrapS', {
            Repeat: THREE.RepeatWrapping,
            Clamp: THREE.ClampToEdgeWrapping,
            'Mirror Repeat': THREE.MirroredRepeatWrapping
        }).name('Wrapping mode S').onChange((value) => {
            this.texture.wrapS = value;
            this.texture1.wrapS = value;
            this.texture2.wrapS = value;
            this.texture3.wrapS = value;
            this.texture4.wrapS = value;

            this.texture.needsUpdate = true;
            this.texture1.needsUpdate = true;
            this.texture2.needsUpdate = true;
            this.texture3.needsUpdate = true;
            this.texture4.needsUpdate = true;

        });
        textureFolder.add(this.texture, 'wrapT', {
            Repeat: THREE.RepeatWrapping,
            Clamp: THREE.ClampToEdgeWrapping,
            'Mirror Repeat': THREE.MirroredRepeatWrapping
        }).name('Wrapping mode V').onChange((value) => {
            this.texture.wrapT = value;
            this.texture1.wrapT = value;
            this.texture2.wrapT = value;
            this.texture3.wrapT = value;
            this.texture4.wrapT = value;

            this.texture.needsUpdate = true;
            this.texture1.needsUpdate = true;
            this.texture2.needsUpdate = true;
            this.texture3.needsUpdate = true;
            this.texture4.needsUpdate = true;
        });
        textureFolder.add(this.texture.repeat, 'x', 0, 10).name('Repeat U').onChange((value) => {
            this.texture.repeat.x = value;
            this.texture1.repeat.x = value;
            this.texture2.repeat.x = value;
            this.texture3.repeat.x = value;
            this.texture4.repeat.x = value;

            this.texture.needsUpdate = true;
            this.texture1.needsUpdate = true;
            this.texture2.needsUpdate = true;
            this.texture3.needsUpdate = true;
            this.texture4.needsUpdate = true;
        });
        textureFolder.add(this.texture.repeat, 'y', 0, 10).name('Repeat V').onChange((value) => {
            this.texture.repeat.y = value;
            this.texture1.repeat.y = value;
            this.texture2.repeat.y = value;
            this.texture3.repeat.y = value;
            this.texture4.repeat.y = value;

            this.texture.needsUpdate = true;
            this.texture1.needsUpdate = true;
            this.texture2.needsUpdate = true;
            this.texture3.needsUpdate = true;
            this.texture4.needsUpdate = true;
        });
        textureFolder.add(this.texture.offset, 'x', 0, 1).name('Offset U').onChange((value) => {
            this.texture.offset.x = value;
            this.texture1.offset.x = value;
            this.texture2.offset.x = value;
            this.texture3.offset.x = value;
            this.texture4.offset.x = value;

            this.texture.needsUpdate = true;
            this.texture1.needsUpdate = true;
            this.texture2.needsUpdate = true;
            this.texture3.needsUpdate = true;
            this.texture4.needsUpdate = true;
        });
        textureFolder.add(this.texture.offset, 'y', 0, 1).name('Offset V').onChange((value) => {
            this.texture.offset.y = value;
            this.texture1.offset.y = value;
            this.texture2.offset.y = value;
            this.texture3.offset.y = value;
            this.texture4.offset.y = value;

            this.texture.needsUpdate = true;
            this.texture1.needsUpdate = true;
            this.texture2.needsUpdate = true;
            this.texture3.needsUpdate = true;
            this.texture4.needsUpdate = true;
        });
        textureFolder.add(this.texture, 'rotation', 0, Math.PI * 2).name('Rotation').onChange((value) => {
            this.texture.rotation = value;
            this.texture1.rotation = value;
            this.texture2.rotation = value;
            this.texture3.rotation = value;
            this.texture4.rotation = value;

            this.texture.needsUpdate = true;
            this.texture1.needsUpdate = true;
            this.texture2.needsUpdate = true;
            this.texture3.needsUpdate = true;
            this.texture4.needsUpdate = true;
        });

        textureFolder.close();
    }

    /**
     * Initializes a special gui for moving paintings along the wall
     * @param {MyEntity} painting
     */
    initGuiMovePainting(painting) {
        const folder = painting.folder.addFolder('Move');

        const totalHeight = 12 * this.wallLego;
        const totalWidth = 17 * this.wallLego;

        // Y axis
        const initialY = painting.group.position.y;
        const occupiedLegosY = Math.round(painting.height/this.wallLego)
        const initialYIndex = Math.round(initialY / this.wallLego);

        const minY = -initialYIndex + occupiedLegosY-Math.round(occupiedLegosY/2);
        const maxY = 12 -initialYIndex - occupiedLegosY + Math.round(occupiedLegosY/2);

        // Z axis
        const initialZ = painting.group.position.z;
        const occupiedLegosZ = Math.round(painting.width/this.wallLego)
        const initialZIndex = Math.round((initialZ + totalWidth/2) / this.wallLego);
        
        const minZ = Math.floor(-initialZIndex+ (occupiedLegosZ - Math.floor(occupiedLegosZ/2) ))
        const maxZ = Math.floor(17-initialZIndex-(occupiedLegosZ - Math.round(occupiedLegosZ/2)  ))

        // Add folders
        const proxy = { z: 0 , y: 0};
        folder.add(proxy, 'y', minY, maxY).name('y').listen().step(1).onChange((value) => {
            painting.group.position.y = initialY + value * this.wallLego;
        });
        folder.add(proxy, 'z', minZ, maxZ).name('z').listen().step(1).onChange((value) => {
            painting.group.position.z = initialZ + value * this.wallLego;

        });
    
        folder.close();
    }
}

export {MyWalls};