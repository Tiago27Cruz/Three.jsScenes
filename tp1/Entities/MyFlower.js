import * as THREE from 'three';

import { MyEntity } from './MyEntity.js';
import { MySinCurve } from '../MySinCurve.js';

class MyFlower extends MyEntity {
    /**
     * Constructor
     * @param {MyContents} contents
     * @param {string} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} num_petals 
     * @param {Number} radius 
     * @param {Number} height
     */
    constructor(contents, name = "Flower", parent = null, width = 1, depth = 1, num_petals = 10, radius = null, height = null){
        super(contents, name, parent, width, depth, height);
        this.radius = radius;
        this.num_petals = num_petals;

        // if the sizes are not defined, they are random
        if(radius === null) this.radius = this.contents.getRandom(0.5, 2);
        if(height === null) this.height = this.contents.getRandom(2, 5);

        this.init();
    }

    /**
     * Initializes the flower
     */
    init(){
        super.init(this);
        this.initTextures();
        this.initMaterials();
        this.build();
        this.initGui();
    }

    /**
     * Initializes the textures
     */
    initTextures(){
        // Stem
        this.stemTexture = this.contents.loadTexture("legos_stacked");
        // Receptacle
        this.receptacleTexture = this.contents.loadTexture("receptacle");
        // Petals
        this.petalsTexture = this.contents.loadTexture("single_lego2")
    }

    /**
     * Initializes the materials
     */
    initMaterials(){
        // Stem
        this.stemMaterial = this.contents.materials.get('Phong').clone();
        this.stemMaterial.color.set('#34cb3c');

        // Receptacle
        this.receptacleMaterial = this.contents.materials.get('PhongDoubleSide').clone();
        this.receptacleMaterial.color.set('#ffffff');

        // Petals
        this.petalsMaterial = this.contents.materials.get('PhongDoubleSide').clone();
        this.petalsMaterial.color.set('#fcf8e7');
    }

    /**
     * Builds the flower
     */
    build(){ 
        // Stem
        let stem_radius = this.radius;
        //creates the curve path of the stem which is a sin curve with some randomness
        const stem_path = new MySinCurve(this.contents.getRandom(-2, 2), this.contents.getRandom(-2, 2), this.height);

        //creates the tube object
        const stemObj = this.contents.buildObject('Tube', stem_path, 20, stem_radius, 8, false)
        
        this.stem = new MyEntity(this.contents, "Stem", this, 1, 1, 1, stemObj, this.stemMaterial, this.stemTexture, true, true);
        this.stem.updateTexture(10, 10, Math.PI/2);

        // Receptacle
        stem_radius = stem_radius * 5;

        //creates the sphere geometry of the receptacle
        const receptacleObj = this.contents.buildObject('Sphere', 1);

        this.receptacle = new MyEntity(this.contents, "Receptacle", this, stem_radius, stem_radius, stem_radius, receptacleObj, this.receptacleMaterial, this.receptacleTexture, true, true);
        //moves the sphere to the top of the stem
        this.receptacle.updateTexture(this.contents.getRandom(3, 15), this.contents.getRandom(3, 15));
        this.receptacle.moveTo(stem_path.tx, stem_path.ty, stem_path.tz);
        this.receptacle.mesh.updateMatrixWorld();

        // Lower Receptacle
        this.stem_direction = stem_path.stem_direction;
        this.up_direction = new THREE.Vector3(0, 1, 0);

        //get the angle of the direction of the stem to the up direction vector
        this.angle = this.stem_direction.angleTo(this.up_direction);

        this.rotation_axis = new THREE.Vector3();

        //obtain the perpendicular vector of the stem direction vector and the up vector so that it can be used as a rotation axis to rotate the petals
        this.rotation_axis.crossVectors(this.up_direction, this.stem_direction).normalize();

        this.upper_axis = new THREE.Vector3();
        //obtain the perpendicular vector to the stem_direction and the rotation axis vector so it can be used to rotate the flowers around the receptacle
        this.upper_axis.crossVectors(this.rotation_axis, this.stem_direction).normalize();

        //create a circle in order to position the petals on its vertices
        const lowerRecObj = this.contents.buildObject('Circle', stem_radius, this.num_petals);

        //create the circle entity and move it to the beggining of the receptacle near the stem
        const lower_receptacle_circle = new MyEntity(this.contents, "LowerCircle", this, 1, 1, 1, lowerRecObj, this.receptacleMaterial, null, true, false);
        lower_receptacle_circle.moveToEntity(this.receptacle);
        lower_receptacle_circle.mesh.rotateOnAxis(this.upper_axis, -Math.PI/2);
        lower_receptacle_circle.mesh.rotateOnAxis(this.rotation_axis, this.angle);

        // Petals
        this.petals = new MyEntity(this.contents, "Petals", this, stem_radius, stem_radius, stem_radius, null, this.petalsMaterial, this.petalsTexture, true, true);

        this.addPetals(lower_receptacle_circle, stem_radius/2);
    }

    /**
     * Adds the petals to the receptacle
     * @param {MyEntity} circle 
     * @param {Number} stem_radius 
     */
    addPetals(circle, stem_radius){
        //get the vertice positions of the circle inside the receptacle
        const positions = circle.mesh.geometry.getAttribute('position');
        circle.mesh.updateMatrixWorld();

        //loop throught the positions of the vertices of the circle
        for (let i = 1; i < positions.count; i++) {
            const position = new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));

            position.applyMatrix4(circle.mesh.matrixWorld);
            //get the vector pointing out of the sphere so that it can be used to translate the petals outside the center of the sphere
            const sphere_circle_direction = new THREE.Vector3(position.x-this.receptacle.mesh.position.x, position.y-this.receptacle.mesh.position.y, position.z-this.receptacle.mesh.position.z).normalize();

            const sphere_circle_rotation_axis = new THREE.Vector3();

            //get the vector that will be used to rotate the petals around the sphere
            sphere_circle_rotation_axis.crossVectors(this.up_direction, sphere_circle_direction).normalize();
            const sphere_circle_rotation_angle = sphere_circle_direction.angleTo(this.up_direction);

            //create the petal entity
            const petal = new MyEntity(this.contents, "Petal", this.petals, 1, 1, 1, null, this.petals.material, this.petals.texture, true, false);
            
            //build the bottom part of the petal entity
            const petalBottomObj = this.contents.buildObject('Box', stem_radius, stem_radius, stem_radius)
            const petal_bottom = new MyEntity(this.contents, "Bottom", petal, 1, 1, 1, petalBottomObj, petal.material, petal.texture, true, false);

            //get the culinder primitive to use for the top of the petal
            const petalTopObj = this.contents.buildObject('Cylinder', 1, 1, 1, 32)

            //build the top part of the petal and move it above the bottom part
            const petal_top = new MyEntity(this.contents, "Top", petal, stem_radius/4, stem_radius/4, stem_radius/2, petalTopObj, petal.material, petal.texture, true, false);
            petal_top.moveTo(petal_bottom.mesh.position.x, petal_bottom.mesh.position.y+stem_radius/2+petal_top.height/2, petal_bottom.mesh.position.z);
            
            //move the whole petal to vertice on the circle
            petal.moveTo(position.x, position.y, position.z);
            //rotate the petal along the sphere so that the petals can be around the sphere
            petal.group.rotateOnAxis(sphere_circle_rotation_axis, sphere_circle_rotation_angle);
            //translate the petal so that it move outward from the sphere and so that it is not stuck inside it
            petal.group.position.add(sphere_circle_direction.clone().multiplyScalar(stem_radius/2));
        }
    }

    /**
     * Initialize the GUI for the Flower and it's components
     */
    initGui(){
        // General
        super.initGui();
        super.initGuiScale();
        super.initGuiRotate();
        super.initGuiShadow();
        // Stem
        this.stem.initGui();
        this.stem.initGuiColor('#34cb3c');
        this.stem.initGuiTexture();
        // Receptacle
        this.receptacle.initGui();
        this.receptacle.initGuiColor('#ffffff');
        this.receptacle.initGuiTexture();
        // Petals
        this.petals.initGui();
        this.petals.initGuiColor('#fcf8e7');
        this.petals.initGuiTexture();
    }

}

export {MyFlower};