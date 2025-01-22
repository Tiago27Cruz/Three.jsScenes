import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyParticle } from './MyParticle.js';

class MyFountainParticle extends MyParticle{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
       @param {string} name The name of the entity
    */
    constructor(particleEmitter){
        super(particleEmitter);
        this.points.material = this.particleEmitter.material.clone();
        this.minLife = 0.7;
        this.maxLife = 0.95;
        this.lifetime = 2;
        this.age = 0;
    }

    /**
       Sets a radial direction initial velocity, lifetime and age to the particle.
    */
    setVelocity(){
        const n = this.particleEmitter.i % 15;
        const angle = -(this.particleEmitter.startingAngle+20*n)*Math.PI/180;
        const magnitude = 1.5;
        this.velocity = new THREE.Vector3(magnitude*Math.cos(angle), 6, magnitude*Math.sin(angle));
        this.particleEmitter.i++;
        this.lifetime = this.minLife + (this.maxLife - this.minLife) * Math.random();
        this.age = 0;
    }
    /**
       Modifies the particle by aging it and varrying the color over the aging. If the particle dies remove it.
       @param {number} t The time in between frames.
       @param {number} index The particle index in the particles array.
    */
    modify(t, index){
        const progress = this.age / this.lifetime;
        if(progress < 0.5){
            this.points.material.color.lerpColors(
                new THREE.Color(0x87CEEB),
                new THREE.Color(0xffffff),
                progress * 2
            )
        }
        else{
            this.points.material.color.lerpColors(
                new THREE.Color(0xffffff),
                new THREE.Color(0x000000),
                (progress - 0.5) * 2
            )
        }
        this.age += t;
        if(this.age > this.lifetime) {
            this.particleEmitter.removeParticle(index);
        }
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

export { MyFountainParticle };