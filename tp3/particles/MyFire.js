import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyParticle } from './MyParticle.js';

class MyFire extends MyParticle{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
       @param {string} name The name of the entity
    */
    constructor(particleEmitter){
        super(particleEmitter);
        this.points.material = this.particleEmitter.material.clone();
        this.points.material.size = this.particleEmitter.size + Math.random()*0.2;
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
       Modifies the particle by aging it, increasing transparency and size over time. If the particle dies it is removed.
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    modify(t, index){
        this.points.material.size += t*0.1;
        this.points.material.opacity += -t*0.1;
        this.points.material.color.g = Math.floor(100+Math.random()*150)/255;
        this.age += t;
        if(this.age > this.lifetime) {
            this.particleEmitter.removeParticle(index);
        }
    }

    reset(){
        super.reset();
        this.points.material.size = this.particleEmitter.size + Math.random()*0.2;
        this.points.material.opacity = this.particleEmitter.alpha;
        this.points.material.color.set(this.particleEmitter.color);
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

export { MyFire };