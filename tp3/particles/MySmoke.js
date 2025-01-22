import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyParticle } from './MyParticle.js';

class MySmoke extends MyParticle{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
       @param {string} name The name of the entity
    */
    constructor(particleEmitter){
        super(particleEmitter);
        this.points.material = this.particleEmitter.material.clone();
        this.points.material.size = this.particleEmitter.size + Math.random()*0.25;
        this.points.material.opacity = this.particleEmitter.alpha;
        this.particleEmitter.g = -0.5;
        this.minLife = 0.8;
        this.maxLife = 1.3;
        this.lifetime = 2;
        this.age = 0;
    }
    /**
       Sets a random direction initial velocity, lifetime and age to the particle.
    */
    setVelocity(){
        super.setVelocity();
        this.lifetime = this.minLife + (this.maxLife - this.minLife) * Math.random();
        this.age = 0;
    }

    /**
       Modifies the particle by aging it and increasing transparency and size over time. If the particle dies remove it.
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    modify(t, index){
        this.points.material.size += t*0.1;
        this.points.material.opacity += -t*0.1;
        this.age += t;
        if(this.age > this.lifetime){
            this.particleEmitter.removeParticle(index);
        }
    }
    /**
       Resets the particle, randomizing it's properties.
    */
    reset(){
        super.reset();
        this.points.material.size = this.particleEmitter.size + Math.random()*0.5;
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

export { MySmoke };