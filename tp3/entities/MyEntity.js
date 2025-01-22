import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyShader } from '../MyShader.js';
import { MyParticleEmitter } from '../particles/MyParticleEmitter.js';

class MyEntity{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the game
    */
    constructor(contents){
        this.contents = contents;
        this.id = this.contents.entityCount;
        this.contents.entityCount++;

        this.isInScene = false;
        this.entity = null
        this.meshes = [];
        this.particleEmitters = [];
        this.shader = null;
    }
    /**
     * Displays the entity on the scene or removes from the scene depending on the paramter display.
     * @param {boolean} display - Display or don't display the entity on the scene.
     */
    display(display = true){
        if(display && !this.isInScene){
            this.contents.app.scene.add(this.entity);
            this.isInScene = true;
        }
        else if(!display && this.isInScene){
            this.contents.app.scene.remove(this.entity);
            this.isInScene = false;
        }
    }
    /**
     * Adds a mesh to the current entity.
     * @param {THREE.Mesh} mesh - The mesh to add.
     */
    addMesh(mesh){
        this.addEntity(mesh);
        this.meshes.push(mesh);
    }
    /**
     * Adds a mesh, group, light, lod to the current entity.
     * @param {*} entity - the mesh, group, light or lod to add.
     */
    addEntity(entity){
        entity.name = this.id;
        if(this.entity == null) this.entity = entity;
        else if(this.entity instanceof THREE.Group){
            this.entity.add(entity);
        }
        else{
            const prev_entity = this.entity;
            this.entity = new THREE.Group();
            this.entity.add(prev_entity);
            this.entity.add(entity);
            
        }
    }
    /**
     * Adds a particle emitter to the entity.
     * @param {MyParticleEmitter} particleEmitter - The particleEmitter to add.
     */
    addParticleEmitter(particleEmitter){
        this.particleEmitters.push(particleEmitter);
    }
    /**
     * Removes a particle emitter from the entity and the scene.
     * @param {number} index - The index of the particle emitter to remove.
     */
    removeParticleEmitter(index){
        this.particleEmitters[index].display(false);
        this.particleEmitters.splice(index, 1);
    }
    /**
     * Clears and removes all the particles of the particle emitters of the entity.
     */
    clearParticles(){
        for(const particleEmitter of this.particleEmitters){
            particleEmitter.clear();
        }
    }


    /**
     * Updates the particles of the particle emitters of the entity.
     * @param {number} t - The time that passed in between frames.
     */
    updateParticles(t){
        for(const particleEmitter of this.particleEmitters){
            if(particleEmitter.isInScene){
                particleEmitter.update(t);
            }
        }
    }
    /**
     * Creates a lod to replace the current entity with.
     * @param {*} lod - Group, mesh, light, lod to add as the second level of the lod.
     * @param {number} distance - Distance from the camera on which the level of the lod transitions to the second level.
     */
    createLod(lod, distance){
        const originalEntity = this.entity;
        const lodEntity = new THREE.LOD();
        lodEntity.addLevel(originalEntity, 0);
        lodEntity.addLevel(lod, distance);
        this.entity = lodEntity;
    }
    /**
     * Adds a Group, mesh, lod or light to the lod of the entity.
     * @param {*} lod - Group, mesh, lod or light to add as a level in the entities lod.
     * @param {number} distance - The distance on which the lod of the entity passed to this level.
     */
    addLod(lod, distance){
        if (this.entity instanceof THREE.LOD){
            this.entity.addLevel(lod, distance);
        } else {
            throw new Error('Trying to add a level of detail to an entity that is not a LOD');
        }
    }
    /**
     * Creates a shader for an entity.
     * @param {text} vertFileName - The name of the file of the vertice shader (just the name, not the full path neither the extension appended)
     * @param {text} fragFileName - The name of the file of the frag shader (just the name, not the full path neither the extension appended)
     * @param {Object} uniforms - The uniforms of the files to be updated or initialized.
     * @param {boolean} isTransparent - If the entity is transparent or not.
     */
    createShader(vertFileName, fragFileName, uniforms, isTransparent = false){
        this.shader = new MyShader(this.contents, 'shaders/' + vertFileName + '.vert', 'shaders/' + fragFileName + '.frag', uniforms, isTransparent);
    }
    /**
     * Waits for the shader to be loaded onto a mesh of the entity.
     * @param {THREE.Mesh} meshIndex - the index of the mesh of the entity to wait for the shader to be loaded.
     */
    waitForShader(meshIndex) {
        if (this.shader.ready === false) {
            setTimeout(this.waitForShader.bind(this, meshIndex), 100)
            return;
        }
        this.contents.game.shaders.set(this.id, this.shader);
        this.material = this.shader.material;
        this.meshes[meshIndex].material = this.shader.material;
        this.meshes[meshIndex].material.needsUpdate = true;

    }
    /**
     * Rotates the entity to look at a position in the scene
     * @param {THREE.Vector3} position - The looking point position.
     */
    lookAt(position){
        this.entity.lookAt(position);
    }
    /**
     * Adds the entity to the cameras local space.
     * @param {number} x - The cameras local space normalized x coordinate to move the entity (0-1)
     * @param {number} y - The cameras local space normalized y coordinate to move the entity (0-1)
     */
    addToCamera(x, y){
        for(const camera of this.contents.cameras){
            const newEntity = this.entity.clone();
            newEntity.cameraID = this.id;
            camera.addEntity(newEntity, x, y);
        }
    }
    /**
     * Removes the entity from the cameras.
     */
    removeFromCamera(){
        for(const camera of this.contents.cameras){
            camera.removeEntity(this);
        }
    }
    /**
     * Moves the entity in the camera local space by updating it's local camera space coordinates.
     * @param {number} x - new local camera x coordinate to move the entity to (0-1)
     * @param {number} y - new local camera y coordinate to move the entity to (0-1)
     */
    moveInCamera(x, y){
        for(const camera of this.contents.cameras){
            camera.moveEntityInCamera(this, x, y);
        }
    }
    /**
     * Updates the entity to the camera local space without rotating it alongside the camera.
     * @param {number} x - Entity's local space x coordinate to update to.
     * @param {number} y - Entity's local space y coordinate to update to.
     */
    updateEntityInCameraNoRotation(x, y){
        const camera = this.contents.game.activeCamera;
        const cameraDirection = camera.direction;
        const cameraPosition = camera.entity.position;
        const offset = camera.getCameraViewOffset(x, y);

        this.moveToEntity(cameraPosition.clone().add(cameraDirection.clone().multiplyScalar(Math.abs(camera.distanceFromCamera))));


        const up = new THREE.Vector3(0, 1, 0);
        const leftVector = new THREE.Vector3(0, 0, 0);
        leftVector.crossVectors(cameraDirection, up).normalize();

        this.entity.position.addScaledVector(leftVector, offset.x);

        
        const upVector = new THREE.Vector3();

        upVector.crossVectors(leftVector, cameraDirection);
        this.entity.position.addScaledVector(upVector, offset.y);
    }
    /**
     * Moves to another entity's position in the scene.
     * @param {THREE.Vector3} position - The entity's position to move towards to.
     */
    moveToEntity(position){
        this.entity.position.set(position.x, position.y, position.z);
    }
    /**
     * Move to a point in the scene.
     * @param {number} x - The x coordinate of the new point
     * @param {number} y - The y coordinate of the new point
     * @param {number} z - The z coordinate of the new point
     */
    moveTo(x=null, y=null, z=null){
        if(x === null) x = this.entity.position.x;
        if(y === null) y = this.entity.position.y;
        if(z === null) z = this.entity.position.z;

        this.entity.position.set(x, y, z);
    }
    /**
     * Increments or decrements the position of the entity.
     * @param {number} x - X increment to be made.
     * @param {number} y - Y increment to be made.
     * @param {number} z - Z increment to be made.
     */
    move(x=0, y=0, z=0){
        this.entity.position.x += x;
        this.entity.position.y += y;
        this.entity.position.z += z;
    }
    /**
     * Rotates an entity to angles given as parameters.
     * @param {number} x - The angle in radians to x rotate.
     * @param {number} y - The angle in radians to y rotate.
     * @param {number} z - The angle in radians to z rotate.
     */
    rotateTo(x=null,y=null,z=null){
        if(x === null) x = this.entity.rotation.x;
        if(y === null) y = this.entity.rotation.y;
        if(z === null) z = this.entity.rotation.z;

        this.entity.rotation.set(x, y, z);
    }
    /**
     * Obtain the distance of this entity to a current position in the scene.
     * @param {THREE.Vector3} position - Position of the point in the scene.
     * @returns {THREE.Vector3} The distance of this entity to the position.
     */
    distanceTo(position){
        return this.entity.position.distanceTo(position);
    }

}

export { MyEntity };