import * as THREE from "three";
import { MyEntity } from "../MyEntity.js";
import { MyNurbsBuilder } from "../../MyNurbsBuilder.js";

/**
 * Class that represents the ground of the island
 * Has a sand circle around everything and a grassy area in the middle built using NURBS
 */
class MyFloor extends MyEntity {
    constructor(contents) {
        super(contents);
        this.builder = new MyNurbsBuilder();
        this.build();
        this.createSurface();
        
    }

    /**
     * Builds the material for the floor. Uses different textures to give a more realistic look
     * @returns {THREE.MeshPhongMaterial}
     */
    buildMaterial() {
        const material = this.contents.materials.get('Phong').clone();
        material.color = new THREE.Color(0xffffff);

        const color = this.contents.loadTexture("basicFloor/color.jpg");
        const normal = this.contents.loadTexture("basicFloor/normal.png");
        const ao = this.contents.loadTexture("basicFloor/ao.jpg");
        const height = this.contents.loadTexture("basicFloor/height.png");
        const rough = this.contents.loadTexture("basicFloor/rough.jpg");

        material.map = color;
        material.normalMap = normal;
        material.aoMap = ao;
        material.bumpMap = height;
        material.roughnessMap = rough;

        const repeat = 10;

        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set(repeat, repeat);
        material.normalMap.wrapS = THREE.RepeatWrapping;
        material.normalMap.wrapT = THREE.RepeatWrapping;
        material.normalMap.repeat.set(repeat, repeat);
        material.aoMap.wrapS = THREE.RepeatWrapping;
        material.aoMap.wrapT = THREE.RepeatWrapping;
        material.aoMap.repeat.set(repeat, repeat);
        material.bumpMap.wrapS = THREE.RepeatWrapping;
        material.bumpMap.wrapT = THREE.RepeatWrapping;
        material.bumpMap.repeat.set(repeat, repeat);
        material.roughnessMap.wrapS = THREE.RepeatWrapping;
        material.roughnessMap.wrapT = THREE.RepeatWrapping;
        material.roughnessMap.repeat.set(repeat, repeat);


        return material;
    }

    /**
     * Builds the material for the sand. Uses different textures to give a more realistic look
     * @returns {THREE.MeshPhongMaterial}
     */
    buildSandMaterial(){
        const material = this.contents.materials.get('Phong').clone();
        material.color = new THREE.Color(0xffffff);

        const color = this.contents.loadTexture("sand/color.jpg");
        const normal = this.contents.loadTexture("sand/normal.png");
        const ao = this.contents.loadTexture("sand/ao.jpg");
        const height = this.contents.loadTexture("sand/height.png");
        const rough = this.contents.loadTexture("sand/rough.jpg");

        material.map = color;
        material.normalMap = normal;
        material.aoMap = ao;
        material.bumpMap = height;
        material.roughnessMap = rough;

        const repeat = 20;

        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set(repeat, repeat);
        material.normalMap.wrapS = THREE.RepeatWrapping;
        material.normalMap.wrapT = THREE.RepeatWrapping;
        material.normalMap.repeat.set(repeat, repeat);
        material.aoMap.wrapS = THREE.RepeatWrapping;
        material.aoMap.wrapT = THREE.RepeatWrapping;
        material.aoMap.repeat.set(repeat, repeat);
        material.bumpMap.wrapS = THREE.RepeatWrapping;
        material.bumpMap.wrapT = THREE.RepeatWrapping;
        material.bumpMap.repeat.set(repeat, repeat);
        material.roughnessMap.wrapS = THREE.RepeatWrapping;
        material.roughnessMap.wrapT = THREE.RepeatWrapping;
        material.roughnessMap.repeat.set(repeat, repeat);


        return material;
    }

    /**
     * Create the sand
     */
    build() {
        const sand = new THREE.CircleGeometry(70, 32)
        const sandMaterial = this.buildSandMaterial();
        sandMaterial.color = new THREE.Color(0xffffff);
        const sandPlane = new THREE.Mesh(sand, sandMaterial);
        sandPlane.rotateX(-Math.PI / 2);
        sandPlane.position.set(0, -1, 0);
        this.addMesh(sandPlane);
    }

    /**
     * Creates the island surface
     */
    createSurface(){
        const sandHeight = 1;
        const material = this.buildMaterial();
        const x = 50
        const y = 60
        const topHeight = -10
        let controlPoints = []
        let middlePoints = []

        const x_dif = 10

        for (let i = -y; i <= y; i += x_dif) {

            middlePoints = []
            // All corners must be at sandHeight so that the sand is connected to the ground
            if (i == -y) {
                middlePoints.push([ -x/2, i, sandHeight, 1])
                middlePoints.push([-x/2 + x/4, i+x_dif/3 , sandHeight, 1])
                middlePoints.push([0, i+2*x_dif/3, sandHeight, 1])
                middlePoints.push([x/2 - x/4, i+x_dif/3, sandHeight, 1])
                middlePoints.push([x/2, i, sandHeight, 1])
                controlPoints.push(middlePoints)
                continue
            } else if (i == y) {
                middlePoints.push([-x/2, i, sandHeight, 1])
                middlePoints.push([-x/2 + x/4, i, sandHeight, 1])
                middlePoints.push([0, i, sandHeight, 1])
                middlePoints.push([x/2 - x/4, i, sandHeight, 1])
                middlePoints.push([x/2, i, sandHeight, 1])
                controlPoints.push(middlePoints)
                continue
            }

            if (i <= 60 && i >= -40) {
                if (i < 0) {
                    middlePoints.push([-x + x/4, i, sandHeight, 1])
                    middlePoints.push([-x + 2*x/4, i, 0, 10])
                    middlePoints.push([0, i, 0, 10])
                    middlePoints.push([x - 2*x/4, i, 0, 10])
                    middlePoints.push([x - x/4, i, sandHeight, 1 ])
                } 
                else {
                    middlePoints.push([-x, i, sandHeight, 1])
                    middlePoints.push([-x + x/4, i, 0, 10])
                    middlePoints.push([0, i, 0, 10])
                    middlePoints.push([x - x/4, i, 0, 10])
                    middlePoints.push([x, i, sandHeight, 1])
                }
                controlPoints.push(middlePoints)
                continue
            }

            

            if (i < 0) {
                middlePoints.push([-x-i/4, i, sandHeight, 1])
                middlePoints.push([-x+x/4-i/4, i, topHeight, 1])
                middlePoints.push([0, i, topHeight, 1])
                middlePoints.push([x-x/4-i/4, i, topHeight, 1])
                middlePoints.push([x+i/4, i, sandHeight, 1 ])
            } 
            else {
                middlePoints.push([-x+i/4, i, sandHeight, 1])
                middlePoints.push([-x+x/4+i/4, i, topHeight, 1])
                middlePoints.push([0, i, topHeight, 1])
                middlePoints.push([x-x/4+i/4, i, topHeight, 1])
                middlePoints.push([x-i/3, i, sandHeight, 1])
            }
            controlPoints.push(middlePoints)
        }


        const orderU = y*2/x_dif
        const orderV = 4

        const samplesU = 100
        const samplesV = 100

        const surfaceData = this.builder.build(controlPoints, orderU, orderV, samplesU, samplesV, material)
        const mesh = new THREE.Mesh(surfaceData, material);
        mesh.rotation.x = Math.PI / 2   

        this.addMesh(mesh)
    }
}

export { MyFloor };