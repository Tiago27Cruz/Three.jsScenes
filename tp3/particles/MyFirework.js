import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyParticle } from './MyParticle.js';

class MyFirework extends MyParticle{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
       @param {string} name The name of the entity
    */
    constructor(particleEmitter, pos, color){
        super(particleEmitter);
        this.points.material = this.particleEmitter.material.clone();
        this.points.material.color.set(color);
        this.pos = pos;
        this.minLife = 0.5;
        this.maxLife = 1.5;
        this.particleEmitter.g = 5;
        this.particleEmitter.k = 0.05;
        this.width = 5;
        this.depth = 2;
    }
    /**
       Sets a random rectangular position, random direction initial velocity, lifetime and age to the particle.
    */
    setVelocity(){
        this.velocity = new THREE.Vector3(this.particleEmitter.velocity.x*(Math.random()*2-1), this.particleEmitter.velocity.y + this.particleEmitter.velocity.y*Math.random(), this.particleEmitter.velocity.z*(Math.random()*2-1));
        this.lifetime = this.minLife + (this.maxLife - this.minLife) * Math.random();
        this.age = 0;
        this.points.material.size =  this.particleEmitter.size + this.particleEmitter.size * (Math.random()*2-1);
        this.moveTo(this.pos.x-this.width/2 + Math.random()*this.width, this.pos.y, this.pos.z-this.depth/2+Math.random()*this.depth);
    }

    /**
       Modifies the particle by aging it. If the particle dies, reset it and emit new exploding particles.
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    modify(t){
        this.age += t
        if(this.age > this.lifetime) {
            this.particleEmitter.emitNewParticles(this);
            this.reset();
            this.setVelocity();
        }
    }



    /**
       Updates the particle.
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    update(t, index){
        this.modify(t);
        super.update(t);
    }

}

export { MyFirework };