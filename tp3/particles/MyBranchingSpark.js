import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyParticle } from './MyParticle.js';
import { MyParticleEmitter } from './MyParticleEmitter.js';

class MyBranchingSpark extends MyParticle{
    /**
       constructs an entity
       @param {MyParticleEmitter} particleEmitter The particleEmitter that is emitting this particle
       @param {THREE.Vector3} pos The initial position to create this particle.
       @param {THREE.Color} color The Color of this particle.
    */
    constructor(particleEmitter, pos, color){
        super(particleEmitter);
        this.points.material = this.particleEmitter.material.clone();
        this.points.material.color.set(color);
        this.moveTo(pos.x, pos.y, pos.z);
        this.minLife = 1;
        this.maxLife = 3;
        this.lifetime = 2;
        this.duration = 3;
        this.age = 0;
        this.particleEmitter.g = 10;
        this.particleEmitter.k = 0.005;
    }
    /**
       Sets a random direction initial velocity, lifetime and age to the particle.
    */
    setVelocity(){
        this.velocity = new THREE.Vector3(this.particleEmitter.velocity.x*(Math.random()-0.5), this.particleEmitter.velocity.y*Math.random(), this.particleEmitter.velocity.z*(Math.random()-0.5));
        this.lifetime = this.minLife + (this.maxLife - this.minLife) * Math.random();
        this.age = 0;
    }

    /**
       Modifies the particle by aging it and increasing transparency over time. If the particle dies it explodes into more.
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    modify(t, index){
        this.points.material.opacity += -0.01;
        this.age += t
        if(this.age > this.lifetime) {
            if(this.particleEmitter.totalTime < this.duration) this.explode();

            this.particleEmitter.removeParticle(index);
        }
    }
    /**
       Explode the particles creating new ones in the same position with random colors.
    */
    explode(){
        const vertices = this.getVertices();
        const colors = [0xff0000, 0x00ff00, 0x0000ff];
        this.particleEmitter.createNewParticles(this.particleEmitter.maxParticles, new THREE.Vector3(vertices[0], vertices[1], vertices[2]), colors[Math.floor(Math.random()*colors.length)]);
    }

    /**
       Update the particle
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    update(t, index){
        this.modify(t, index);
        super.update(t);
    }

}

export { MyBranchingSpark };