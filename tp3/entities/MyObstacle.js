import * as THREE from 'three';
import { MyCollidingEntity } from './MyCollidingEntity.js';

class MyObstacle extends MyCollidingEntity{

    /**
        Construct the obstacle
        @param {MyContents} contents The contents of the application
        @param {number} initialX The initial x position of the powerup
        @param {number} initialY The initial y position of the powerup
        @param {number} initialZ The initial z position of the powerup
        @param {number} initialWidth The initial width of the powerup
        @param {number} initialHeight The initial height of the powerup
        @param {number} initialDepth The initial depth of the powerup
    */
    constructor(contents, initialX = 0, initialY = 0, initialZ = 0, initialWidth = 1, initialHeight = 1, initialDepth = 1){
        super(contents, 0, true);
         
        this.build(initialX, initialY, initialZ, initialWidth, initialHeight, initialDepth);
    }

    /**
     * Prepares the material for the Obstacle
     * @returns THREE.Material
     */
    buildMaterial(){
        let material = this.contents.materials.get('Phong').clone();
        material.color = new THREE.Color(0xffffff);

        let map = this.contents.loadTexture('obstacle/map.jpg');
        let normal = this.contents.loadTexture('obstacle/normal.jpg');
        let specular = this.contents.loadTexture('obstacle/specular.jpg');

        material.map = map;
        material.normalMap = normal;
        material.specularMap = specular;

        return material
    }

    /**
     * Builds the mesh based on the given parameters
     * @param {Number} initialX 
     * @param {Number} initialY 
     * @param {Number} initialZ 
     * @param {Number} initialWidth 
     * @param {Number} initialHeight 
     * @param {Number} initialDepth 
     */
    build(initialX, initialY, initialZ, initialWidth, initialHeight, initialDepth){


        const material = this.buildMaterial()

        let geometry = new THREE.BoxGeometry(initialWidth, initialHeight, initialDepth);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(initialX, initialY, initialZ);
        this.addMesh(this.mesh);

        this.buildShader();
    }

    /**
     * Builds the shader for the obstacle
     */
    buildShader(){
        let map = this.contents.loadTexture('obstacle/map.jpg');

        const uniforms = {
            timeFactor: { type: 'f', value: 0.0 },
            u_map: { type: 't', value: map },
            u_color: { type: 'v3', value: new THREE.Color(0xffffff) }
        };

        this.createShader('pulsating', 'obstacle', uniforms);
        this.waitForShader(0);
    }

    /**
     * Handle collisions with the obstacle
     * This will disable the collision, stop displaying the obstacle and add it to the timed out entities
     */
    handleCollision(){
        this.display(false)
        this.enableCollision(false)
        this.contents.game.addTimedOutEntity(this)
    }
}

export { MyObstacle };