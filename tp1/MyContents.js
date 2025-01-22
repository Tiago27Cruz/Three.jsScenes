import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyRoom } from './Entities/MyRoom.js';
import { MyEntity } from './Entities/MyEntity.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';



/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null
        //event variables
        this.keys = new Set();
        this.mouse_pos = new THREE.Vector2();
        this.speed = 1;

        
        this.nurbs_builder = new MyNurbsBuilder(this.app);

        //lego scalings
        this.lego_width = 2;
        this.lego_depth = 2;
        this.lego_height = 1;
    }

    /**
     * Creates the materials that will be used and saves them in the materials map
     */
    buildMaterials(){
        this.materials.set('Phong', new THREE.MeshPhongMaterial({ color: "#00ffff", 
            specular: "#777777", emissive: "#000000", shininess: 30 }));
        this.materials.set('PhongDoubleSide', new THREE.MeshPhongMaterial({ color: "#00ffff", 
            specular: "#777777", emissive: "#000000", shininess: 30, side: THREE.DoubleSide }));
        this.materials.set('Basic', new THREE.MeshBasicMaterial({ color: "#00ffff" }));
    }

    /**
     * Loads a texture when given it's name. If it's already loaded, returns, otherwise it loads it
     */
    loadTexture(name){
        //if texture is already present in the map then return it
        if(this.textures.has(name)){
            return this.textures.get(name);
        }
        let texture = new THREE.TextureLoader().load('Textures/' + name + '.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        // Add the texture to the map
        this.textures.set(name, texture)

        return texture;

    }

    /**
     * Loads a primitive when given it's name. If it's already loaded, returns, otherwise it creates a new Geometry
     * @param {Object} primitive 
     * @returns 
     */
    loadPrimitive(primitive){
        if(this.primitives.has(primitive)){ // If the primitive is already loaded, return it instead of creating it again
            return this.primitives.get(primitive);
        }
        let primitive_value = null;
        switch(primitive.name){ // Add the parameters to the geometry
            case 'Box':
                primitive_value = new THREE.BoxGeometry(primitive.width, primitive.height, primitive.depth, primitive.widthSegments, primitive.heightSegments, primitive.depthSegments);
                break;
            case 'Plane':
                primitive_value = new THREE.PlaneGeometry(primitive.width, primitive.height, primitive.widthSegments, primitive.heightSegments);
                break;
            case 'Cylinder':
                primitive_value = new THREE.CylinderGeometry(primitive.radiusTop, primitive.radiusBottom, primitive.height, primitive.radialSegments,primitive.heightSegments, primitive.openEnded, primitive.thetaStart, primitive.thetaLength);
                break;
            case 'Circle':
                primitive_value = new THREE.CircleGeometry(primitive.radius, primitive.radialSegments, primitive.thetaStart, primitive.thetaLength);
                break;
            case 'Sphere':
                primitive_value = new THREE.SphereGeometry(primitive.radius, primitive.widthSegments, primitive.heightSegments);
                break;
            case 'Tube':
                primitive_value = new THREE.TubeGeometry(primitive.path, primitive.tubularSegments, primitive.radius, primitive.radialSegments, primitive.closed);
                break;
            case 'Shape':
                primitive_value = new THREE.ShapeGeometry(primitive.shape);
                break;
            case 'Torus':
                primitive_value = new THREE.TorusGeometry(primitive.radius, primitive.tube, primitive.radialSegments, primitive.tubularSegments, primitive.arc);
                break;
            default:
                break;
        }
        // If the primitive was created, add it to the map
        if(primitive_value !== null){
            this.primitives.set(primitive, primitive_value);
        }
        return primitive_value;

    }

    /**
     * Builds an object that will later be used to create a new Geometry. If not enough parameters are given, default values are used
     * @param {Text} name 
     * @param  {...any} parameters 
     * @returns {Object} - The object that will be used to create the geometry
     */
    buildObject(name, ...parameters){
        let object = null;
        const values = [];

        switch(name){
            case 'Box':
                parameters.forEach(param => {
                    values.push(param);
                });
                while(values.length < 6){
                    values.push(1);
                }
                object = {name: name, width: values[0], height: values[1], depth: values[2], widthSegments: values[3], heightSegments: values[4], depthSegments: values[5]};
                break;
            case 'Plane':
                parameters.forEach(param => {
                    values.push(param);
                });
                while(values.length < 4){
                    values.push(1);
                }
                object = {name: name, width: values[0], height: values[1], widthSegments: values[2], heightSegments: values[3]};
                break;
            case 'Cylinder':
                parameters.forEach(param => {
                    values.push(param);
                });
                while(values.length < 8){
                    if(values.length == 3) values.push(8);
                    else if(values.length == 5) values.push(false);
                    else if(values.length == 6) values.push(0);
                    else if(values.length == 7)values.push(Math.PI * 2);
                    else values.push(1);
                }
                object = {name: name, radiusTop: values[0], radiusBottom: values[1], height: values[2], radialSegments: values[3], heightSegments: values[4], openEnded: values[5], thetaStart: values[6], thetaLength: values[7]};
                break;
            case 'Circle':
                parameters.forEach(param => {
                    values.push(param);
                });
                while(values.length < 4){
                    if(values.length == 1) values.push(8);
                    else if(values.length == 2) values.push(0);
                    else if(values.length == 3) values.push(Math.PI * 2);
                    else values.push(1);
                }
                object = {name: name, radius: values[0], radialSegments: values[1], thetaStart: values[2], thetaLength: values[3]};
                break;
            case 'Sphere':
                parameters.forEach(param => {
                    values.push(param);
                });
                while(values.length < 3){
                    if(values.length == 1) values.push(32);
                    else if(values.length == 2) values.push(16);
                    else values.push(1);
                }
                object = {name: name, radius: values[0], widthSegments: values[1], heightSegments: values[2]};
                break;
            case 'Tube':
                parameters.forEach(param => {
                    values.push(param);
                });
                while(values.length < 5){
                    if(values.length == 1) values.push(64);
                    else if(values.length == 2) values.push(1);
                    else if(values.lengh == 3)values.push(8);
                    else if(values.length == 4)values.push(false);
                }
                object = {name: name, path: values[0], tubularSegments: values[1], radius: values[2], radialSegments: values[3], closed: values[4]};
                break;
            case 'Shape':
                parameters.forEach(param => {
                    values.push(param);
                });
                object = {name: name, shape: values[0]};
                break;
            case 'Torus':
                parameters.forEach(param => {
                    values.push(param);
                });
                while(values.length < 4){
                    if(values.length === 0) values.push(1); // Radius
                    else if(values.length === 1) values.push(0.4); // Tube
                    else if(values.length === 2) values.push(12); // Radial Segments
                    else if(values.length === 3) values.push(48); // Tubular Segments
                    else values.push(2*Math.PI); // Arc
                }
                object = {name: name, radius: values[0], tube: values[1], radialSegments: values[2], tubularSegments: values[3], arc: values[4]};
                break;
            default:
                break;
        }
        return object;
    }

    /**
     * Deletes the scene from the app
     */
    deleteScene(){
        // Remove the room from the scene, since it's the last element, we can just remove it
        this.app.scene.children = this.app.scene.children.slice(0, -1);
        // Remove from the GUI
        this.room.folder.hide();
        this.app.gui.children.delete('Room');
    }

    /**
     * Builds the scene
     */
    buildScene(){
        this.buildMaterials();

        // Define the dimensions of the room
        this.width = 100;
        this.depth = 100;
        this.height = 70;

        // Create the room
        this.room = new MyRoom(this, "Room", null, this.width, this.depth, this.height);
    }

    /**
     * Builds the legos on top of an entity
     * @param {MyEntity} entity
     * @param {Number} center_x
     * @param {Number} y
     * @param {Number} center_z
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} lego_distance
     * @param {THREE.Material} material
     */
    buildLego(entity, center_x, y, center_z, width, depth, lego_distance = 5, material = null){

        //get the initial x and final x positions
        let init_x = center_x-width/2 + lego_distance/2;
        let final_x = center_x+width/2 - lego_distance/2;

        //get the initial z and final z positions
        let init_z = center_z-depth/2 + lego_distance/2;
        let final_z = center_z+depth/2 - lego_distance/2;

        //offset the x position so that the lego isnt glued to the sides of the entity. (give a little spacing between the entity edges)
        const x_offset = (final_x-init_x)%lego_distance;
        init_x += x_offset/2;
        final_x -= x_offset/2;
        
        //offset the z position so that the lego isnt glued to the sides of the entity. (give a little spacing between the entity edges)
        const z_offset = (final_z - init_z)%lego_distance;
        init_z  += z_offset/2;
        final_z -= z_offset/2;

        //initialize the x and z values
        let x = init_x;
        let z = init_z;

        //get the number of legos that are going to be created in each direction
        const x_lego_nums = Math.max(Math.round((final_x-init_x)/lego_distance)+1, 2);
        const z_lego_nums = Math.max(Math.round((final_z-init_z)/lego_distance)+1, 2);

        //get the total number of legos regardless of the direction
        const total_legos = x_lego_nums * z_lego_nums;

        let legos;
        //if the entity does not have a legos entity as their child then create one, otherwise just fetch it
        if(!entity.children.has("Legos")){
            legos = new MyEntity(this.contents, "Legos", entity, this.lego_width, this.lego_depth, this.lego_height, null, material, null, true, false);
            entity.legos = legos;
        }
        else legos = entity.children.get('Legos');

        let lego_num = 1;
        //iterate through all of the x and z positions of each lego and create or fetch them if they already exist and move them to that position as well
        for(let i = 0; i < x_lego_nums; i++){
            if(i == x_lego_nums - 1) x = final_x;
            for(let j = 0; j < z_lego_nums; j++){
                if(j == z_lego_nums-1)z = final_z;

                const name = "Lego"+lego_num;
                let lego;
                if(legos.children.has(name)) lego = legos.children.get(name);
                else {
                    lego = new MyEntity(this, name, legos, this.lego_width, this.lego_depth, this.lego_height, this.buildObject('Cylinder', 1, 1, 1, 32), material, null, true, false);
                    lego.hasItem = false;
                    //lego.updateColor('#ffffff');
                }

                lego.x = i;
                lego.z = j;
        
                lego.moveTo(x, y+this.lego_height/2, z);
                


                lego_num++;
                z += lego_distance;
            }
            z = init_z;
            x += lego_distance;
        }

        //fill a info variable in the entities class that describes the legos sizes and the number of legos that are present, as well as the distance between the legos
        legos.info = [x_lego_nums, z_lego_nums, total_legos, lego_distance];

        //legos.moveTo(null, y+this.lego_height/2);

        let lego_name = "Lego" + lego_num;
        //remove additional legos that might be present on the entity
        while(legos.children.has(lego_name)){
            const lego = legos.children.get(lego_name);
            lego.removeFromScene();
            legos.children.delete(lego_name);
            lego_num++;
            lego_name = "Lego" + lego_num;
        }
        
    }

    /**
     * Generates a random integer between the specified minimum and maximum values.
     * @param {number} min - The minimum value (inclusive).
     * @param {number} max - The maximum value (inclusive).
     * @returns {number} A random integer between min and max.
     */
    getRandom(min, max){
        return Math.ceil(Math.random() * (max-1-min)) + min;
    }



    /**
     * initializes the contents
     */
    init() {
        // Create maps to store the primitives, materials and textures so they can be accessed easily later and avoid the need to create them again
        this.primitives = new Map();
        this.materials = new Map();
        this.textures = new Map();
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add an ambient light
        this.ambientLight = new THREE.AmbientLight( 0x555555 );
        this.ambientLight.intensity = 1;
        this.app.scene.add(this.ambientLight );
    }
    
    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // Add some key controls to facilitate the movement of the camera
        if(this.keys.size > 0){

            for(const key of this.keys){
                if(key == 'w') {
                    const direction = new THREE.Vector3();
                    this.app.activeCamera.getWorldDirection(direction);
                    this.app.activeCamera.position.addScaledVector(direction, this.speed);
                    this.app.controls.target.copy(this.app.controls.target.addScaledVector(direction, this.speed));
                }
                else if(key == 's') {
                    const direction = new THREE.Vector3();
                    this.app.activeCamera.getWorldDirection(direction);
                    this.app.activeCamera.position.addScaledVector(direction, -this.speed);
                    this.app.controls.target.copy(this.app.controls.target.addScaledVector(direction, -this.speed));
                }
                else if(key == 'a') {
                    const direction = new THREE.Vector3();
                    this.app.activeCamera.getWorldDirection(direction);
                    direction.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
                    this.app.activeCamera.position.addScaledVector(direction, -this.speed);
                    this.app.controls.target.copy(this.app.controls.target.addScaledVector(direction, -this.speed));

                }
                else if(key == 'd') {
                    const direction = new THREE.Vector3();
                    this.app.activeCamera.getWorldDirection(direction);
                    direction.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
                    this.app.activeCamera.position.addScaledVector(direction, this.speed);
                    this.app.controls.target.copy(this.app.controls.target.addScaledVector(direction, this.speed));
                }
                else if(key == ' '){
                    const direction = new THREE.Vector3(0, 1, 0);
                    this.app.activeCamera.position.addScaledVector(direction, this.speed);
                    this.app.controls.target.copy(this.app.controls.target.addScaledVector(direction, this.speed));
                }
                else if(key == 'shift'){
                    const direction = new THREE.Vector3(0, 1, 0);
                    this.app.activeCamera.position.addScaledVector(direction, -this.speed);
                    this.app.controls.target.copy(this.app.controls.target.addScaledVector(direction, -this.speed));
                }
                else if(key == 'mouseMove'){
                }
                else if(key == 'arrowup') this.app.activeCamera.translateY(this.speed);
                else if(key == 'arrowdown') this.app.activeCamera.translateY(-this.speed);
                else if(key == 'arrowleft') this.app.activeCamera.translateX(-this.speed);
                else if(key == 'arrowright')this.app.activeCamera.translateX(this.speed);
            }

        }


        
    }

}

export { MyContents };