import * as THREE from 'three';
import { MyEntity } from '../MyEntity.js';
import { State } from '../../MyGameState.js';
import { MyContents } from '../../MyContents.js';

/**
 * Default class for a display (billboard) in the game.
 * Can be used to display information or camera feeds.
 */
class MyDisplay extends MyEntity{

    static Type = {
        INFORMATIVE: 0,
        CAMERA: 1
    }
    /**
     * Constructs a Display.
     * @param {MyContents} contents - The contents of the game.
     */
    constructor(contents){
        super(contents);
        this.build();
    }

    /**
     * Builds the material of the display.
     */
    buildMaterial(){
        const ao = this.contents.loadTexture('display/ao.jpg');
        const color = this.contents.loadTexture('display/color.jpg');
        const normal = this.contents.loadTexture('display/normal.png');
        const rough= this.contents.loadTexture('display/rough.jpg');
        const bump = this.contents.loadTexture('display/height.png');

        const material = this.contents.materials.get('PhongDoubleSide').clone();
        material.color.set('#ffffff');

        material.map = color;
        material.aoMap = ao;
        material.normalMap = normal;
        material.roughnessMap = rough;
        material.bumpMap = bump;
    

        return material;
    }

    /**
     * Builds the display mesh.
     */
    build(){
        this.radius = 0.2
        this.height = 6
        this.width = 8

        const cylHeight = 0.45*this.height
        const cylPos = cylHeight/2

        const boxHeight = this.height - cylHeight
        const boxPos = cylHeight + boxHeight/2

        const cylGeometry = new THREE.CylinderGeometry(this.radius, this.radius, cylHeight, 32);
        const cylMaterial = this.buildMaterial();

        let cylmesh = new THREE.Mesh(cylGeometry, cylMaterial);
        cylmesh.position.y = cylPos;
        this.addMesh(cylmesh);

        const BoxGeometry = new THREE.BoxGeometry(this.width, boxHeight, this.radius*2);
        const boxMesh= new THREE.Mesh(BoxGeometry, cylMaterial);
        boxMesh.position.y = boxPos;
        this.addMesh(boxMesh); 
    }

    /**
     * Updates the state of the display
     * @param {State} state - State of the game.
     */
    updateState(state){
        switch(state){
            case State.SETUP_HOME_MENU:{
                this.display(true);
                break;
            }
        }
    }

    

}

export { MyDisplay };