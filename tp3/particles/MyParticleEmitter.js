import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyParticle } from './MyParticle.js';
import { MyFountainParticle } from './MyFountainParticle.js';
import { MySmoke } from './MySmoke.js';
import { MyFire } from './MyFire.js';
import { MySpark } from './MySpark.js';
import { MyBranchingSpark } from './MyBranchingSpark.js';
import { MyFirework } from './MyFirework.js';
import { State } from '../MyGameState.js';
import { MyEntity } from '../entities/MyEntity.js';

class MyParticleEmitter{
    /**
       constructs a particle emitter
       @param {MyContents} contents The contents of the game
       @param {number} maxParticles The max number of particles that can be emitted.
       @param {THREE.Vector3} velocity The initial velocity of the particles.
       @param {number} creationRate The creationRate of the particles.
       @param {number} size The size of the particles.
       @param {number} alpha The opacity of the particles.
       @param {THREE.Color} color The color of the particles. If null then a set of 3 random colors will be chosen for each particle
       @param {MyParticle.Type} type The type of the particle
       @param {MyParticleEmitter} explodingParticleEmitter The particle emitter to emit when the particle explodes.
    */
    constructor(contents, maxParticles, velocity, creationRate, size, alpha, color, type, explodingParticleEmitter = null){
        this.contents = contents;
        this.type = type;
        this.creationRate = creationRate;
        this.totalTime = 0;
        this.particles = [];
        this.maxParticles = maxParticles;
        this.velocity = velocity;
        this.parentEntity = null;
        this.offset = null;
        this.posEmitter = null;
        this.size = size;
        this.alpha = alpha;
        this.color = color;
        this.i = 0;
        this.m = 1;
        this.g = 20;
        this.k = 0.003;
        this.startingAngle = 60;
        this.delta_t = null;
        this.isInScene = false;
        this.explodingParticleEmitter = explodingParticleEmitter;
        this.explodingParticleEmitters = [];
        this.group = new THREE.Group();
        this.isInParentsGroup = false;
    }
    /**
       Builds the particle emitter.
    */
    build(){
        if(this.isInScene)this.display(false);

        this.explodingParticleEmitters = [];
        this.totalTime = 0;
        this.particles = [];
        this.group = new THREE.Group();
        this.i = 0;
        if(this.color == null){
            const colors = [0xff0000, 0x00ff00, 0x0000ff];
            this.color = colors[Math.floor(Math.random()*colors.length)];
        }
        this.material = new THREE.PointsMaterial({
            size: this.size,
            color: this.color,
            opacity: this.alpha,
            transparent: true,
        })
    }
    /**
       Begins the emitting of particles
       @param {THREE.Vector3} posEmitter The position to start emitting particles.
    */
    init(posEmitter){
        this.build();

        this.posEmitter = posEmitter;

        this.display(true);

        if(this.type == MyParticle.Type.BRANCHING_SPARK || this.type == MyParticle.Type.SPARK){
            this.createNewParticles(this.maxParticles, this.posEmitter, this.color);
        }
    }
    /**
       Begins the emitting of particles following an entity
       @param {MyEntity} parentEntity The entity to follow
       @param {THREE.Vector3} offset The offset in the entity to position the particle Emitter
       @param {boolean} isInParentsGroup If true than it moves alongside the entity, if false it just creates particles following the entity.
    */
    initFollowingEntity(parentEntity, offset, isInParentsGroup = false){
        this.isInParentsGroup = isInParentsGroup;
        this.parentEntity = parentEntity;
        this.offset = offset;
        this.build();
        if(this.isInParentsGroup) this.posEmitter = this.group.position.clone().add(this.offset);
        else this.posEmitter = this.parentEntity.entity.position.clone().add(this.offset);

        this.display(true);

        if(this.type == MyParticle.Type.BRANCHING_SPARK || this.type == MyParticle.Type.SPARK){
            this.createNewParticles(this.maxParticles, this.posEmitter, this.color);
        }
    }
    /**
       Clears the particles.
    */
    clear(){
        const wasInScene = this.isInScene;
        this.display(false);
        this.group = new THREE.Group();
        this.particles = [];
        if(wasInScene)this.display(true);
    }

    display(display = true){
        if(!this.isInScene && display){
            if(this.isInParentsGroup) this.parentEntity.entity.add(this.group);
            else this.contents.app.scene.add(this.group);
            this.isInScene = true;
        }
        else if(this.isInScene && !display){
            if(this.isInParentsGroup) this.parentEntity.entity.remove(this.group);
            else this.contents.app.scene.remove(this.group);
            for (const explodingParticleEmitter of this.explodingParticleEmitters){
                explodingParticleEmitter.display(false);
            }
            this.isInScene = false;
        }
    }



    createNewParticles(amount, pos, color){
        for(let i = 0; i < amount; i++){
            let newParticle = null;
            switch(this.type){
                case MyParticle.Type.NORMAL:{
                    newParticle = new MyParticle(this);
                    break;
                }
                case MyParticle.Type.FOUNTAIN:{
                    newParticle = new MyFountainParticle(this);
                    break;
                }
                case MyParticle.Type.SMOKE:{
                    newParticle = new MySmoke(this);
                    break;
                }
                case MyParticle.Type.FIRE:{
                    newParticle = new MyFire(this);
                    break;
                }
                case MyParticle.Type.SPARK:{
                    newParticle = new MySpark(this);
                    break;
                }
                case MyParticle.Type.BRANCHING_SPARK:{
                    newParticle = new MyBranchingSpark(this, pos, color);
                    break;
                }
                case MyParticle.Type.FIREWORK:{
                    newParticle = new MyFirework(this, pos, color);
                    break;
                }
            }
            newParticle.setVelocity();
            this.group.add(newParticle.points);
            this.particles.push(newParticle);
        }
    }

    recycleParticle(){
        const firstParticle = this.particles[0];
        if(this.explodingParticleEmitter != null){
            this.emitNewParticles(firstParticle);
        }
        firstParticle.reset();
        firstParticle.setVelocity();
        this.particles.shift();
        this.particles.push(firstParticle);
    }

    emitNewParticles(particle){
        const vertices = particle.getVertices();
        if(this.explodingParticleEmitters.length >= 5){
            const newParticleEmitter = this.explodingParticleEmitters.shift();
            newParticleEmitter.color = this.explodingParticleEmitter.color;
            newParticleEmitter.init(new THREE.Vector3(vertices[0], vertices[1], vertices[2]))
            this.explodingParticleEmitters.push(newParticleEmitter);
        }
        else{
            const newParticleEmitter = new MyParticleEmitter(this.contents, this.explodingParticleEmitter.maxParticles, this.explodingParticleEmitter.velocity, this.explodingParticleEmitter.creationRate, this.explodingParticleEmitter.size, this.explodingParticleEmitter.alpha, this.explodingParticleEmitter.color, this.explodingParticleEmitter.type, this.explodingParticleEmitter.explodingParticleEmitter);
            newParticleEmitter.init(new THREE.Vector3(vertices[0], vertices[1], vertices[2]));
            this.explodingParticleEmitters.push(newParticleEmitter);
        }
        
    }

    removeParticle(index){
        if(this.explodingParticleEmitter != null){
            this.emitNewParticles(this.particles[index]);
        }
        this.group.remove(this.particles[index].points);
        this.particles.splice(index, 1);
    }



    update(t){
        if(this.isInScene){
            this.totalTime += t;
            if(this.parentEntity != null) {
                if(this.isInParentsGroup) this.posEmitter = this.group.position.clone().add(this.offset);
                else this.posEmitter = this.parentEntity.entity.position.clone().add(this.offset);
            }
            if(this.type != MyParticle.Type.BRANCHING_SPARK && this.type != MyParticle.Type.SPARK){
                if(this.particles.length < this.maxParticles) this.createNewParticles(1, this.posEmitter, this.color);
                else if(this.type != MyParticle.Type.FIREWORK && this.type != MyParticle.Type.FIRE && this.type != MyParticle.Type.SMOKE && this.type != MyParticle.Type.FOUNTAIN)this.recycleParticle();
            }

            for(let index = 0; index < this.particles.length; index++){
                const particle = this.particles[index];
                particle.update(t, index);
                const force = particle.calcForce();
                const aceleration = particle.updateAceleration(force);
                particle.updateVelocity(aceleration, t);
            }
            if(this.particles.length == 0) this.display(false);
        }
        for(const explodingEmitters of this.explodingParticleEmitters){
            explodingEmitters.update(t);
        }
    }

    updateState(state){
        switch(state){
            case State.SETUP_END_OF_RACE:{
                const winnerPlayer = this.contents.game.getWinnerPlayer();
                this.init(new THREE.Vector3(winnerPlayer.balloon.entity.position.x, winnerPlayer.balloon.entity.position.y-1, winnerPlayer.balloon.entity.position.z-3));
                break;
            }
            case State.END_OF_RACE:{
                this.update(this.contents.game.delta_t);
                break;
            }
            case State.RESET:
                this.display(false);
                break;
            case State.RESTART:
                this.display(false);
                break;
        }
    }

}

export { MyParticleEmitter };