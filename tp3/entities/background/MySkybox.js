import * as THREE from 'three';
import { MyEntity } from "../MyEntity.js";

/**
 * Class that holds the skybox of the game
 */
class MySkybox extends MyEntity{
    constructor(contents){
        super(contents);

        this.build();
    }

    /**
     * Builds the skybox
     */
    build(){
        const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
        const material = this.contents.materials.get('Basic').clone();
        material.side = THREE.BackSide;
        const texture = this.contents.loadTexture('skybox/skybox1.jpg');
        material.map = texture;
        
        const textureTop = this.contents.loadTexture('skybox/skybox1top.jpg');
        const materialTop = this.contents.materials.get('Basic').clone();
        materialTop.side = THREE.BackSide;
        materialTop.map = textureTop;

        const textureBottom = this.contents.loadTexture('skybox/skybox1bottom.jpg');
        const materialBottom = this.contents.materials.get('Basic').clone();
        materialBottom.side = THREE.BackSide;
        materialBottom.map = textureBottom;
        
        this.entity = new THREE.Mesh(geometry, [material, material, materialTop, materialBottom, material, material]);
    }
}

export { MySkybox };