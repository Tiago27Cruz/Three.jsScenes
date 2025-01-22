import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyParticle } from './MyParticle.js';

class MySpark extends MyParticle{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
       @param {string} name The name of the entity
    */
    constructor(particleEmitter){
        super(particleEmitter);
        this.points.material = this.particleEmitter.material.clone();
        this.minLife = 0.3;
        this.maxLife = 0.7;
        this.lifetime = 2;
        this.age = 0;
        this.particleEmitter.g = 10;
        this.particleEmitter.k = 0.005;
    }
    /**
       Sets a random direction initial velocity, lifetime and age to the particle.
    */
    setVelocity(){
        this.velocity = new THREE.Vector3(this.particleEmitter.velocity.x*(Math.random()-0.5), this.particleEmitter.velocity.y*(Math.random()-0.5), this.particleEmitter.velocity.z*(Math.random()-0.5));
        this.lifetime = this.minLife + (this.maxLife - this.minLife) * Math.random();
        this.age = 0;
    }

    /**
       Modifies the particle by aging it and increasing transparency over time. If the particle dies remove it.
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    modify(t, index){
        this.points.material.opacity += -t*0.01;
        this.age += t
        if(this.age > this.lifetime) this.particleEmitter.removeParticle(index);
    }
    /**
       Resets the particle, resetting the alpha property.
    */
    reset(){
        super.reset();
        this.points.material.opacity = this.particleEmitter.alpha;
    }
    /**
       Updates the particle.
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    update(t, index){
        this.modify(t, index);
        super.update(t);
    }

}

export { MySpark };