import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyShadow } from './MyShadow.js';
import { MyEntity } from './MyEntity.js';

class MyTrack extends MyEntity{
    /**
       constructs a track
       @param {MyContents} contents The contents of the game
       @param {text} textureName The name of the texture that the track will have
       @param {number} segments Number of segments of the track
       @param {number} width Width of the track
       @param {number} repeatU How many times it repeats the U of the texture.
       @param {number} repeatV How many times it repeats the V of the texture.
    */
    constructor(contents, textureName, points, segments, width, repeatU, repeatV){
        super(contents);
        this.textureName = textureName;
        this.points = points;
        this.width = width;
        this.segments = segments;
        this.SPInScene = false;
        this.allPoints = [];
        this.build(repeatU, repeatV);
    }
    /**
     * Calculates the estimate of the distance between points in the track.
     */
    calculatePointDistance(){
        const pointA = this.allPoints[0];
        const pointB = this.allPoints[1];

        this.pointDistance = Math.sqrt(
            Math.pow(pointA.x-pointB.x,2) +
            Math.pow(pointA.y-pointB.y,2) +
            Math.pow(pointA.z-pointB.z,2)
        );
        this.pathLength = this.path.getLength();
    }
    /**
     * Builds the track
     * @param {number} repeatU - Number of times to repeat the texture in the U axis.
     * @param {number} repeatV - Number of times to repeat the texture in the V axis.
     */
    build(repeatU, repeatV){
        /**
         * Builds the curve of the track
         * @param {number} repeatU - Number of times to repeat the texture in the U axis.
         * @param {number} repeatV - Number of times to repeat the texture in the V axis.
         */
        const buildCurve = (repeatU, repeatV) => {
            /*for(const point of this.points){
                point.x = -point.x;
            }*/
            this.path = new THREE.CatmullRomCurve3(this.points);
            const geometry = new THREE.TubeGeometry(
                this.path,
                this.segments,
                this.width,
                3 ,
                false
            );


            this.allPoints = this.path.getPoints(this.segments);
            
            this.calculatePointDistance();

    
            const material = this.contents.materials.get('Phong').clone();
            material.color.set('#ffffff');

            const map = this.contents.loadTexture(this.textureName + "/color.jpg");
            const ao = this.contents.loadTexture(this.textureName + "/ao.jpg");
            const normal = this.contents.loadTexture(this.textureName + "/normal.png");
            //const roughness = this.contents.loadTexture(this.textureName + "/rough.jpg");
            const height = this.contents.loadTexture(this.textureName + "/height.png");

            material.map = map;
            material.aoMap = ao;
            material.normalMap = normal;
            //material.roughnessMap = roughness;
            material.bumpMap = height;
            material.map.repeat.set(repeatU, repeatV);
            material.map.wrapS = THREE.RepeatWrapping;
            material.map.wrapT = THREE.RepeatWrapping;
    
            const mesh = new THREE.Mesh(geometry, material);
    
            //const linePoints = path.getPoints(segments);
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(this.allPoints);
            const lineMaterial = new THREE.LineDashedMaterial({color: 0xffffff, dashSize: 0.1, gapSize: 0.2});
            const line = new THREE.Line(lineGeometry, lineMaterial);
            line.computeLineDistances();
    
    
            this.addMesh(mesh);
            this.addMesh(line);

            this.rotateTo(null, null, Math.PI);
            this.entity.scale.set(1, 0.2, 1);
            line.position.y = this.points[0].y-this.width/2;
        }
        /**
         * Builds the starting point shadows.
         */
        const buildSP = () => {
            this.spA = new MyShadow(this.contents, this.width, 0, this.entity.position.y+this.width/9.5, -this.width/2);
            this.spB = new MyShadow(this.contents, this.width, 0, this.entity.position.y+this.width/9.5, this.width/2);
        }


        buildCurve(repeatU, repeatV);
        buildSP();
    }
    /**
     * Obtains the coordinates of the points of the center of the track given an array of indices of the points.
     * @param {Array<number>} segmentIndices - Array containing the point indices to obtain the coordinates of.
     * @returns {Array<THREE.Vector3>} array of positions of points obtained by the track given their indices.
     */
    getPoints(segmentIndices){
        const points = [];
        for(const segmentIndex of segmentIndices){
            points.push(this.getPoint(segmentIndex));
        }
        return points;
    }
    /**
     * Obtains the coordinates of the a point given the track point index.
     * @param {number} segmentIndex - Track point index.
     * @returns {THREE.Vector3} coordinates of the point of the track corresponding to the index given by parameter.
     */
    getPoint(segmentIndex){
        if(segmentIndex < 0){
            segmentIndex = Math.abs(segmentIndex);
            segmentIndex = segmentIndex % this.segments;
            segmentIndex = this.segments - segmentIndex;
        }
        segmentIndex = segmentIndex % this.segments;
        return this.path.getPoint(segmentIndex/this.segments)
    }
    /**
     * Obtains the coordinates of a point given the distance that has passed in the track.
     * @param {number} u - Distance that has been made in the track.
     * @returns {THREE.Vector3} The coordinates of the point of the track at that distance.
     */
    getPointAt(u){
        let t = u % this.pathLength;
        if(t < 0){
            t = this.pathLength + t;
        }

        return this.path.getPointAt(t/this.pathLength);
    }


    /**
     * Adds or removes the starting points to the entity.
     * @param {boolean} display - If true then they are added, if false they are removed.
     */
    displayStartingPoints(display = true){
        this.spA.display(display);
        this.spB.display(display);
    }
    /**
     * Resets the shadows by moving them to the starting points.
     */
    resetSPs(){
        this.spA.reset();
        this.spB.reset();
    }
    /**
     * Restarts the shadows by resetting and eliminating their textures.
     */
    restartSPs(){
        this.spA.restart();
        this.spB.restart();
    }



}

export { MyTrack };