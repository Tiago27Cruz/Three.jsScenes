import * as THREE from 'three';
import { MyCollidingEntity } from './MyCollidingEntity.js';

class MyPowerup extends MyCollidingEntity {
    /**
        Construct the powerup
        @param {MyContents} contents The contents of the application
        @param {number} initialX The initial x position of the powerup
        @param {number} initialY The initial y position of the powerup
        @param {number} initialZ The initial z position of the powerup
        @param {number} initialWidth The initial width of the powerup
        @param {number} initialHeight The initial height of the powerup
        @param {number} initialDepth The initial depth of the powerup
    */
    constructor(contents, initialX = 0, initialY = 0, initialZ = 0, initialWidth = 1, initialHeight = 1, initialDepth = 1) {
        super(contents, 0, true)


        this.build(initialX, initialY, initialZ, initialWidth, initialHeight, initialDepth);
    }

    /**
     * Prepares the material for the Powerup
     * @returns THREE.Material
     */
    buildMaterial() {
        let material = this.contents.materials.get('Phong').clone();
        material.color = new THREE.Color(0xffffff);

        let map = this.contents.loadTexture('powerup/map.jpg');
        let normal = this.contents.loadTexture('powerup/normal.jpg');
        let alpha = this.contents.loadTexture('powerup/alpha.jpg');
        let emissive = this.contents.loadTexture('powerup/emissive.jpg');
        let specular = this.contents.loadTexture('powerup/texture.jpg');

        material.map = map;
        material.normalMap = normal;
        material.alphaMap = alpha;
        material.emissiveMap = emissive;
        material.specularMap = specular;

        material.transparent = true;

        return material
    }

    /**
     * Builds the mesh of the powerup based on the given parameters
     * @param {Number} initialX 
     * @param {Number} initialY 
     * @param {Number} initialZ 
     * @param {Number} initialWidth 
     * @param {Number} initialHeight 
     * @param {Number} initialDepth 
     */
    build(initialX, initialY, initialZ, initialWidth, initialHeight, initialDepth) {

        const material = this.buildMaterial()
        let geometry = new THREE.BoxGeometry(initialWidth, initialHeight, initialDepth);

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(initialX, initialY, initialZ);

        let pointlight = new THREE.PointLight(0xffffff, 1, 100);
        pointlight.position.set(initialX, initialY, initialZ);
        pointlight.intensity = 1
        pointlight.distance = 3

        this.addMesh(this.mesh);
        this.addEntity(pointlight);

        this.buildShader();

    }

    /**
     * Builds the shader for the powerup
     */
    buildShader() {
        const map = this.contents.loadTexture('powerup/map.jpg');
        const normal = this.contents.loadTexture('powerup/normal.jpg');
        const alpha = this.contents.loadTexture('powerup/alpha.jpg');
        const emissive = this.contents.loadTexture('powerup/emissive.jpg');
        const specular = this.contents.loadTexture('powerup/texture.jpg');

        // We send different textures to the shader, but right now only map and specular are being used and mixed to give a new, improved appearence
        const uniforms = {
            timeFactor: { type: 'f', value: 0.0 },
            u_map: { type: 't', value: map },
            u_normal: { type: 't', value: normal },
            u_alpha: { type: 't', value: alpha },
            u_emissive: { type: 't', value: emissive },
            u_specular: { type: 't', value: specular },
            u_color: { type: 'v3', value: new THREE.Color(0xffffff) }
        };

        // Creates a pulsating shader
        this.createShader('pulsating', 'powerup', uniforms, true);
        this.waitForShader(0);
    }

    /**
     * Adapted reAddObject function from parent, as MyPowerup needs to only add the mesh to entity
     */
    reAddObject() {
        if (!this.isInScene) {
            this.entity.add(this.mesh)
            this.isInScene = true;
        }
        this.enableCollision(true);
    }

    /**
     * Adapted handleCollision function from parent, as MyPowerup needs to remove the mesh from the scene without removing the pointlight to avoid lag
     */
    handleCollision() {
        if (this.isInScene) {
            this.entity.remove(this.mesh)
            this.isInScene = false;
        }
        this.enableCollision(false);
        this.contents.game.addTimedOutEntity(this)
    }
}

export { MyPowerup };