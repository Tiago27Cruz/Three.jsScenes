import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

class MyCurvedLine{
    /**
     * 
     * @param {MyContents} contents 
     * @param {THREE.Curve} curve 
     * @param {THREE.Vector3} position 
     * @param {Number} samples 
     * @param {THREE.Material} material 
     * @param {MyEntity} parent 
     * @param {Boolean} useLine2 - If Line2 should be used instead of Line in order to have a thicker line
     */
    constructor(contents, curve, position, samples = 64, material = null, parent = null, useLine2 = false){
        this.contents = contents;
        this.curve = curve;
        this.position = position;
        this.samples = samples;
        this.material = material;
        this.parent = parent;
        this.useLine2 = useLine2;
        
        this.init();
    }

    /**
     * Draws a convex hull around the given points
     * @param {THREE.Vector3} position 
     * @param {THREE.Vector3[]} points - Array of points to draw the hull around
     */
    drawHull(position, points) {
        this.hullMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, opacity: 0.5, transparent: true} );

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        let line = new THREE.Line( geometry, this.hullMaterial );

        this.addToScene(line);
        line.position.set(position.x,position.y,position.z)
    }

    /**
     * Initializes the curved line
     */
    init(){
        let sampledPoints = this.curve.getPoints(this.samples);
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints(sampledPoints);

        this.line = null;
        if(this.useLine2){ 
            const unindexed = this.curveGeometry.toNonIndexed();
            const geo = new LineGeometry().setPositions(unindexed.getAttribute('position').array);
            this.line = new Line2(geo, this.material);
            this.line.computeLineDistances();
        }
        else this.line = new THREE.Line(this.curveGeometry, this.material);

        this.addToScene(this.line);
        this.line.position.set(this.position.x, this.position.y, this.position.z);
    }   

    /**
     * Adds the entity to the scene
     * @param {MyEntity} entity 
     */
    addToScene(entity){
        if(this.parent != null && this.parent.group != null){
                this.parent.group.add(entity);
        } else {
            this.contents.app.scene.add(entity);
        }
    }
}

export {MyCurvedLine};