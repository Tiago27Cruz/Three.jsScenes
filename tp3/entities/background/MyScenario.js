import * as THREE from 'three';
import { MyEntity } from "../MyEntity.js";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MyParticleEmitter } from '../../particles/MyParticleEmitter.js';
import { MyParticle } from '../../particles/MyParticle.js';

/**
 * Class that represents the scenario of the game
 * Imports/builds/animates the objects that compose the scenario
 */
class MyScenario extends MyEntity{
    constructor(contents){
        super(contents);

        this.objLoader = new OBJLoader();
        this.mtlLoader = new MTLLoader();   
        this.gltfLoader = new GLTFLoader();
        this.entity = new THREE.Group();

        this.build();
    }

    /**
     * Builds the scenario with the imported objects
     */
    build(){

        // Watchtowers
        this.mtlLoader.load('Imports/watchtower/watchtower.mtl', (materials) => {
            materials.preload();
            this.objLoader.setMaterials(materials);

            // Load the .obj file
            this.objLoader.load('Imports/watchtower/watchtower.obj', (object) => {
                // object.scale.set(2, 2, 2);
                object.position.set(20, -0.7, 30);
                const copy = object.clone();
                copy.position.set(-20, -0.7, 30);

                this.entity.add(object);
                this.entity.add(copy);
            });
        });

        // Parking lots
        this.gltfLoader.load('Imports/parking_lot/parking_lot.glb', (object) => {
            object.scene.scale.set(0.5, 1, 1);
            object.scene.rotateY(-Math.PI / 2);
            object.scene.position.set(-13, 0.1, -13);
            this.entity.add(object.scene);
            const copy = object.scene.clone();
            copy.position.set(13, 0.1, -13);
            this.entity.add(copy);
        });

        // Zeppelin
        this.gltfLoader.load('Imports/zeppelin/zeppelin.glb', (object) => {
            object.scene.scale.set(10, 10, 10);
            object.scene.position.set(40, 30, 40);
            this.entity.add(object.scene);
            this.animate(object.scene,60);
        });

        // Fountain
        this.gltfLoader.load('Imports/fountain/fountain.glb', (object) => {
            object.scene.scale.set(0.5, 0.5, 0.5);
            object.scene.position.set(0, 0.3, 6);
            this.entity.add(object.scene);
            //add fountain particles to the fountain
            const fountainColor = 0x0000FF;
            this.addParticleEmitter(new MyParticleEmitter(this.contents, 75, new THREE.Vector3(4, 3, 4), 60, 0.1, 1, fountainColor, MyParticle.Type.FOUNTAIN));
            this.addParticleEmitter(new MyParticleEmitter(this.contents, 75, new THREE.Vector3(4, 3, 4), 60, 0.1, 1, fountainColor, MyParticle.Type.FOUNTAIN));
            this.addParticleEmitter(new MyParticleEmitter(this.contents, 75, new THREE.Vector3(4, 3, 4), 60, 0.1, 1, fountainColor, MyParticle.Type.FOUNTAIN));
            for(let i = 0; i < this.particleEmitters.length; i++){
                this.particleEmitters[i].startingAngle = this.particleEmitters[0].startingAngle + i*100;
                this.particleEmitters[i].init(new THREE.Vector3(0, 2.5, 6));
            }
        });

        // medical tent
        this.gltfLoader.load('Imports/tent/tent.glb', (object) => {
            object.scene.scale.set(0.01, 0.01, 0.01);
            object.scene.position.set(0, 0, -30);
            this.entity.add(object.scene);
        });

        // pier
        this.gltfLoader.load('Imports/pier/pier.glb', (object) => {
            object.scene.scale.set(2, 0.7, 1);
            object.scene.position.set(75, 3*0.7, 3);
            this.entity.add(object.scene);
        });


        // bleachers
        this.gltfLoader.load('Imports/bleachers/bleachers.glb', (object) => {
            object.scene.scale.set(3, 1.5, 1);
            object.scene.position.set(-28, 0, 10);
            object.scene.rotateY(Math.PI / 2);
            this.entity.add(object.scene);

            const copy = object.scene.clone();
            copy.position.set(28, 0, 10);
            copy.rotateY(Math.PI);
            this.entity.add(copy);
        });

        // Palm trees
        // Since we need many, we use instanced mesh
        this.gltfLoader.load('Imports/palm_tree/palm_tree.glb', (object) => {
            const numInstances = 40;
            let randomPositions = []

            // Generate random positions first so that they are the same for all palm tree groups and the model form is not altered
            const minRadius = 40;
            const maxRadius = 63;

            for (let i = 0; i < numInstances; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const radius = minRadius + Math.random() * (maxRadius - minRadius);
                const x = radius * Math.cos(angle);
                const z = radius * Math.sin(angle);
                randomPositions.push(new THREE.Vector3(x, -1, z));
            }

            let randomRotations = []
            for (let i = 0; i < numInstances; i++) {
                const angle = Math.random() * 2 * Math.PI;
                randomRotations.push(angle);
            }

            const model = object.scene;
            // Create a dummy so that we can use it's matrix to set the instanced mesh matrices
            const dummy = new THREE.Object3D(); 
    
            // Since the model is a group of groups, we need to traverse it to find the meshes and then set them as instanced meshes
            model.traverse((child) => {
                if (child.isMesh) {
                    const geometry = child.geometry;
                    const material = child.material;
        
                    const instancedMesh = new THREE.InstancedMesh(geometry, material, numInstances);
        
                    for (let i = 0; i < numInstances; i++) {
                        dummy.position.set(
                            randomPositions[i].x,
                            randomPositions[i].y,
                            randomPositions[i].z
                        );
                        dummy.scale.set(1, 1, 1);
                        dummy.rotation.set(0, randomRotations[i], 0);
                        dummy.updateMatrix();
                        instancedMesh.setMatrixAt(i, dummy.matrix);
                    }
        
                    this.entity.add(instancedMesh);
                }
            });
        });
        
    }

    /**
     * Function to animate the zeppelin
     * @param {imported model.scene} entity 
     * @param {Number} duration 
     */
    animate(entity, duration) {
        const radius = 60;
        const numPoints = 100;
        const points = [];

        for (let i = 0; i <= numPoints; i++) {
            const angle = (i / numPoints) * 2 * Math.PI;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            points.push(new THREE.Vector3(x, 30, z));
        }

        const times = points.map((_, index) => index * (duration / points.length));
        const flatArray = points.flatMap(point => [point.x, point.y, point.z]);
    
        const positionKF = new THREE.VectorKeyframeTrack('.position', times, flatArray, THREE.InterpolateSmooth);

        const quaternions = [];
        
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
            const direction = new THREE.Vector3().subVectors(end, start).normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction);
            quaternions.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        }
        quaternions.push(quaternions[0], quaternions[1], quaternions[2], quaternions[3]);
    
        const quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', times, quaternions);
    
        const positionClip = new THREE.AnimationClip('positionAnimation', duration, [positionKF]);
        const rotationClip = new THREE.AnimationClip('rotationAnimation', duration, [quaternionKF]);
    
        this.mixer = new THREE.AnimationMixer(entity);

        const positionAction = this.mixer.clipAction(positionClip);
        const rotationAction = this.mixer.clipAction(rotationClip);

        positionAction.play();
        rotationAction.play();
    }

    /**
     * Updates the mixer for the zeppelin animation
     * @param {Number} t 
     */
    update(t){
        if (this.mixer !== undefined) {
            this.mixer.update(t);
        }
        this.updateParticles(t);
    }
}

export { MyScenario };