import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyParticleEmitter } from './MyParticleEmitter.js';

class MyParticle{
    static Type = {
        NORMAL: 0,
        FOUNTAIN: 1,
        SMOKE: 2,
        FIRE: 3,
        SPARK: 4,
        BRANCHING_SPARK: 5,
        FIREWORK: 6
    }
    /**
       constructs a particle
       @param {MyParticleEmitter} particleEmitter The particle Emitter of the particle.
    */
    constructor(particleEmitter){
        this.particleEmitter = particleEmitter;
        this.build();
    }
    /**
       Builds the particle.
    */
    build(){
        const vertices = [this.particleEmitter.posEmitter.x,this.particleEmitter.posEmitter.y,this.particleEmitter.posEmitter.z];
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.points = new THREE.Points(geometry, this.particleEmitter.material);

    }
    /**
       Sets a random direction initial velocity
    */
    setVelocity(){
        this.velocity = new THREE.Vector3(this.particleEmitter.velocity.x*Math.random(), this.particleEmitter.velocity.y*Math.random(), this.particleEmitter.velocity.z*Math.random());
    }
    /**
       Obtain the vertices of the particle.
       @returns {THREE.Vector3} the vertices coordinates.
    */
    getVertices(){
        return this.points.geometry.getAttribute('position').array;
    }
    /**
       Warns gpu that the particle needs updating.
    */
    needsUpdate(){
        this.points.geometry.getAttribute('position').needsUpdate = true;
    }
    /**
       Updates the particle.
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    update(t, index){
        this.move(this.velocity.x*t, this.velocity.y*t, this.velocity.z*t);
    }
    /**
       Calculates the resulting force (gravity and drag)
       @returns {THREE.Vector3} The resulting force.
    */
    calcForce(){
        const gravity = new THREE.Vector3(0, -this.particleEmitter.m * this.particleEmitter.g, 0);
        const drag = new THREE.Vector3(this.particleEmitter.k * Math.pow(this.velocity.x, 2), this.particleEmitter.k * Math.pow(this.velocity.y, 2), this.particleEmitter.k * Math.pow(this.velocity.z, 2));
        if(this.velocity.x < 0) drag.x *= -1;
        else if(this.velocity.x == 0) drag.x *= 0;
        if(this.velocity.y < 0) drag.y *= -1;
        else if(this.velocity.y == 0) drag.y *= 0;
        if(this.velocity.z < 0) drag.z *= -1;
        else if(this.velocity.z == 0) drag.z *= 0;

        return gravity.add(drag);
        
    }

    /**
       Updates the aceleration
       @param {THREE.Vector3} force - The resulting force of the particle.
       @returns {THREE.Vector3} The force divided by the particles mass.
    */
    updateAceleration(force){
        return force.multiplyScalar(1/this.particleEmitter.m);
    }
    /**
       Updates the velocity.
       @param {THREE.Vector3} aceleration - The aceleration of the particle.
       @param {number} t - The time in between frames.
    */
    updateVelocity(aceleration, t){
        aceleration.multiplyScalar(t);
        this.velocity.add(aceleration);
    }
    /**
       Resets the particle, moving it to the particle emitter initial position.
    */
    reset(){
        this.moveTo(this.particleEmitter.posEmitter.x, this.particleEmitter.posEmitter.y, this.particleEmitter.posEmitter.z);
    }


    moveTo(x=null,y=null,z=null){
        const vertices = this.getVertices();
        
        if(x == null) x = vertices[0];
        if(y == null) y = vertices[1];
        if(z == null) z = vertices[2];

        vertices[0] = x;
        vertices[1] = y;
        vertices[2] = z;
        this.needsUpdate();
    }

    move(x=0,y=0,z=0){
        const vertices = this.getVertices();
        this.moveTo(vertices[0]+x, vertices[1]+y, vertices[2]+z);
    }


}

export { MyParticle };