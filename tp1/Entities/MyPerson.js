import * as THREE from 'three';
import {MyEntity} from './MyEntity.js';
import { MyJar } from './MyJar.js';
import { MyLegoCurve } from '../MyLegoCurve.js';

class MyPerson extends MyEntity {
    /**
     * Person constructor
     * @param {MyContents} contents
     * @param {string} name
     * @param {MyEntity} parent
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     * @param {MyEntity} lego
     * @param {MyEntity} parent_legos
     */
    constructor(contents, name = "Person", parent = null, width = 1, depth= 1, height=1, lego = null, parent_legos = null) {
        super(contents, name, parent, width, depth, height);
        this.lego = lego;
        this.parent_legos = parent_legos;
        this.rotationCounter = 0;
        //define a type of person
        this.type = "Doctor";
        this.init();
    }

    /**
     * Initializes the person
     */
    init(){
        // Calls the parent init method for the default initialization
        super.init(this);
        this.initGui();

        //create all of the materials and define some positional variables
        this.shoes_material = this.contents.materials.get('Phong').clone();
        this.shoe_height = this.contents.lego_height*2;
        this.pants_material = this.contents.materials.get('Phong').clone();
        this.bulge_material = this.contents.materials.get('Phong').clone();
        this.waist_material = this.contents.materials.get('Phong').clone();
        this.torso_material = this.contents.materials.get('Phong').clone();
        this.front_torso_material = this.contents.materials.get('Phong').clone();
        this.cylinder_material = this.contents.materials.get('Phong').clone();
        this.arm_material = this.contents.materials.get('PhongDoubleSide').clone();
        this.hand_material = this.contents.materials.get('PhongDoubleSide').clone();

        //create the single lego texture as a default texture
        this.single_lego_texture = this.contents.loadTexture('single_lego2').clone();

        //create the arm paths for the tube geometry
        this.arm_path_right = new MyLegoCurve(3, 5, 10, true);
        this.arm_path_left = new MyLegoCurve(3, 5, 10, false);



        this.arm_radius = 1.25

        //create the primitives and 
        this.box_primitive = this.contents.buildObject('Box');
        this.half_cylinder_primitive = this.contents.buildObject('Cylinder', 1, 1, 1, 32, 1, false, -Math.PI/2, Math.PI);
        this.cylinder_primitive = this.contents.buildObject('Cylinder', 1, 1, 1, 32);
        this.hand_half_cylinder = this.contents.buildObject('Cylinder', 1, 1, 1, 32, 1, true, -Math.PI/2, Math.PI);
        this.circle_primitive = this.contents.buildObject('Circle', this.arm_radius, 35);
        this.arm_right_geo = this.contents.buildObject('Tube', this.arm_path_right, 5, this.arm_radius, 35, false);
        this.arm_left_geo = this.contents.buildObject('Tube', this.arm_path_left, 5, this.arm_radius, 35, false);





    


        this.build();

        this.changeType();
    }

    build(){
        /**
         * builds a shoe given its name as an id and if it is the right shoe or not
         * @param {Text} name
         * @param {Boolean} isRight
         * @returns {MyEntity}
         */
        const buildShoe = (name, isRight) => {
            let shoe;
            //fetch the shoe if it already exists, otherwise create a new one
            if(this.children.has(name)) shoe = this.children.get(name);
            else shoe = new MyEntity(this.contents, name, this, this.contents.lego_width*2+1, this.contents.lego_depth*2+1, this.shoe_height, this.box_primitive, this.shoes_material, null, true, false, true);
        

            //move it accordingly
            shoe.moveTo(0, 0, 0);
            shoe.move(0, shoe.mesh.scale.y/2-this.contents.lego_height/2);
            //if it is the left one move it more to the left
            if(!isRight) shoe.move(this.lego_distance);
            return shoe;
        }
        /**
         * builds a piece of the pants given its name as an id and the shoe entity as a positional reference
         * @param {Text} name
         * @param {MyEntity} shoe
         * @returns {MyEntity}
         */
        const buildPant = (name, shoe) => {
            let pant;
            //fetch the pant if it already exists, otherwise create a new one
            if(this.children.has(name)) pant = this.children.get(name);
            else pant = new MyEntity(this.contents, name, this, shoe.mesh.scale.x, shoe.mesh.scale.z/2, (this.height-shoe.mesh.scale.y-2)/3, this.box_primitive, this.pants_material, null, true, false, true);

            //scale and move it accordingly
            pant.scaleTo(null, (this.height-shoe.mesh.scale.y-2)/3);
            pant.moveToEntity(shoe);
            pant.move(0, pant.mesh.scale.y/2 + shoe.mesh.scale.y/2, -pant.mesh.scale.z/2);
            return pant;
        }
        /**
         * builds a piece of the bulge given its name as an id and the pant entity as a positional reference
         * @param {Text} name
         * @param {MyEntity} pant
         * @returns {MyEntity}
         */
        const buildBulge = (name, pant) => {
            let bulge;
            //fetch the bulge if it already exists, otherwise create a new one
            if(this.children.has(name)) bulge = this.children.get(name);
            else bulge = new MyEntity(this.contents, name, this, 1, pant.mesh.scale.z/2, pant.mesh.scale.x, this.half_cylinder_primitive, this.bulge_material, null, true, false, true);

            //rotate and move it accordingly
            bulge.rotateTo(null, null, Math.PI/2);
            bulge.moveToEntity(pant);
            bulge.move(0, pant.mesh.scale.y/2-bulge.mesh.scale.x, bulge.mesh.scale.z);
            return bulge;
        }
        /**
         * builds the waist given the bulge entity as a positional reference
         * @param {MyEntity} bulge
         * @returns {MyEntity}
         */
        const buildWaist = (bulge) => {
            let crouch;
            //fetch the crouch if it already exists, otherwise create a new one
            if(this.children.has("Crouch")) crouch = this.children.get("Crouch");
            else crouch = new MyEntity(this.contents, "Crouch", this, bulge.mesh.scale.x, bulge.mesh.scale.z, this.lego_distance-this.contents.lego_width*2-1, this.cylinder_primitive, this.bulge_material, null, true, false, true);

            //rotate the crouch and move it to the bulge
            crouch.rotateTo(null, null, Math.PI/2);
            crouch.moveToEntity(bulge);
            crouch.move(bulge.mesh.scale.y/2+crouch.mesh.scale.y/2, bulge.mesh.scale.x-crouch.mesh.scale.x, -bulge.mesh.scale.z/2);

            let waist;
            //fetch the waist if it already exists, otherwise create a new one
            if(this.children.has("Waist")) waist = this.children.get("Waist");
            else waist = new MyEntity(this.contents, "Waist", this, bulge.mesh.scale.y*2+crouch.mesh.scale.y, bulge.mesh.scale.z*4, 1, this.box_primitive, this.waist_material, null, true, false, true);

            //move the waist to the crouch
            waist.moveToEntity(crouch);
            waist.move(0, waist.mesh.scale.y/2+crouch.mesh.scale.x, -waist.mesh.scale.z/5);
            return waist;
        }
        /**
         * builds the Torso given the waist entity as a positional reference
         * @param {MyEntity} waist
         * @returns {MyEntity}
         */
        const buildTorso = (waist) => {
            let torso;
            //fetch the torso if it already exists, otherwise create a new one
            if(this.children.has("Torso")) torso = this.children.get("Torso");
            else torso = new MyEntity(this.contents, "Torso", this, waist.mesh.scale.x/2+1, waist.mesh.scale.z/2+1, this.height/3, this.contents.buildObject('Cylinder', 1, 1.25, 1, 4, 1, false, -Math.PI/4,Math.PI*2), this.torso_material, null, true, false, true);

            //scale and move the torso to the waist
            torso.scaleTo(null, this.height/3);
            torso.moveToEntity(waist);
            torso.move(0, torso.mesh.scale.y/2+waist.mesh.scale.y/2);

            let frontTorso;
            //fetch the front part of the torso if it already exists, otherwise create a new one
            if(this.children.has("FrontTorso")) frontTorso = this.children.get("FrontTorso");
            else {
                frontTorso = new MyEntity(this.contents, "FrontTorso", this, torso.mesh.scale.x*3/2-0.6, 0.3, this.height/3, this.box_primitive, this.front_torso_material, null, true, false, false);
            }

            
            //rotate, scale and move it to the front part of the torso
            frontTorso.rotateTo(-Math.PI/42)
            frontTorso.scaleTo(null, this.height/3);
            frontTorso.moveToEntity(waist);
            frontTorso.move(0, frontTorso.mesh.scale.y/2+waist.mesh.scale.y/2, waist.mesh.scale.z/2+frontTorso.mesh.scale.z/2-0.01);
            return torso;
        }
        /**
         * builds an arm given the torso entity as a positional reference, and a isRight boolean to know if it is the right arm or the left
         * @param {Boolean} isRight
         * @param {MyEntity} torso
         * @returns {MyEntity}
         */
        const buildArm = (isRight, torso) => {
            let name = "Left";
            if(isRight) name = "Right";

            const arm_name = name + "Arm";

            let arm;
            //fetch the arm if it already exists, otherwise create a new one
            if(this.children.has(arm_name)) arm = this.children.get(arm_name);
            else {
                let geom = this.arm_left_geo;
                if(isRight) {
                    geom = this.arm_right_geo;
                }
                arm = new MyEntity(this.contents, arm_name, this, 1, 1, 1, geom, this.arm_material, null, true, false, true);
                arm.isNurbs = true;
            }

            //move the arm to the torso and offset it depending if it is the right or the left arm
            arm.moveToEntity(torso);
            if(!isRight) {
                arm.move(torso.mesh.scale.x+arm.mesh.scale.x-2.5, torso.mesh.scale.y/2-arm.mesh.scale.y-0.5);
            }
            else arm.move(-torso.mesh.scale.x+arm.mesh.scale.x+0.1, torso.mesh.scale.y/2-arm.mesh.scale.y-0.5);

            return arm;
        }
        /**
         * builds a Hand given the arm entity as a positional reference, and a isRight boolean to know if it is the right arm or the left
         * @param {Boolean} isRight
         * @param {MyEntity} arm
         */
        const buildHand = (isRight, arm) => {
            let name = "Left";
            if(isRight) name = "Right";

            const pulse_name = name + "Pulse";

            let pulse;
            //fetch the pulse if it already exists, otherwise create a new one
            if(this.children.has(pulse_name)) pulse = this.children.get(pulse_name);
            else pulse = new MyEntity(this.contents, pulse_name, this, 0.75, 0.75, 3, this.cylinder_primitive, this.hand_material, null, true, false, true);

            //rotate and move the pulse to the arm
            pulse.rotateTo(Math.PI*2/5 + Math.PI/15);
            pulse.moveToEntity(arm);
            pulse.move(0, -5.5, 5);
            
            //offset it if it is the right or left pulse
            if(isRight) pulse.move(-1.75);
            else pulse.move(1.75);


            const palm_name = name + "Palm";
            let palm;
            //fetch the palm if it already exists, otherwise create a new one
            if(this.children.has(palm_name)) palm = this.children.get(palm_name);
            else palm = new MyEntity(this.contents, palm_name, this, 1.5, 1.5, 1.5, this.hand_half_cylinder, this.hand_material, null, true, false, true);

            //rotate and move the palm to the pulse
            palm.rotateTo(-Math.PI/30, Math.PI);
            palm.moveToEntity(pulse);
            palm.move(0, palm.mesh.scale.y/2-0.3, pulse.mesh.scale.y/2+palm.mesh.scale.z);



            const filler_name = name + "Filler";
            let filler;
            //fetch the arm to pulse sleeve filler if it already exists, otherwise create a new one
            if(this.children.has(filler_name)) filler = this.children.get(filler_name);
            else {
                filler = new MyEntity(this.contents, filler_name, this, 1, 1, 1, this.circle_primitive, this.arm_material, null, true, false, true);
            }


            //move and rotate the sleeve filler to the palm depending on if it is the right filler or left
            filler.moveToEntity(palm);
            filler.rotateTo(-Math.PI/13, null, Math.PI/9);
            if(isRight){
                filler.rotateTo(-Math.PI/10, Math.PI/30);
                filler.move(0.15, -0.35, -3.05);
            }
            else{
                filler.rotateTo(-Math.PI/10, -Math.PI/32);
                filler.move( -0.2, -0.35, -3.1);
            }
            
            


            

        }
        /**
         * builds the Head given the torso entity as a positional reference
         * @param {MyEntity} torso
         */
        const buildHead = (torso) => {
            let bottomHead;
            //fetch the bottom cylinder entity of the head if it already exists, otherwise create a new one
            if(this.children.has("BottomHead")) bottomHead = this.children.get("BottomHead");
            else bottomHead = new MyEntity(this.contents, "BottomHead", this, torso.mesh.scale.z/2, torso.mesh.scale.z/2, 1, this.cylinder_primitive, this.cylinder_material, null, true, false, true);

            //move the cylinder to the top of the torso.
            bottomHead.moveToEntity(torso);
            bottomHead.move(0, bottomHead.mesh.scale.y/2+torso.mesh.scale.y/2);

            let head;
            //fetch the head if it already exists, otherwise create a new one
            if(this.children.has("Head")) head = this.children.get("Head");
            else head = new MyJar(this.contents, "Head", this, 7*2.5, 7*2.5, 6, 0.001, 1.5, 0.5, 30, false, null, null, null, false);

            //move the head to the bottom cylinder and rotate it
            head.moveToEntity(bottomHead);
            head.rotateTo(null, Math.PI/2)
            head.move(-0.1, 0, 0.5);


            let topHead;
            //fetch the top cylinder entity of the head if it already exists, otherwise create a new one
            if(this.children.has("TopHead")) topHead = this.children.get("TopHead");
            else topHead = new MyEntity(this.contents, "TopHead", this, torso.mesh.scale.z/2, torso.mesh.scale.z/2, 1, this.cylinder_primitive, this.cylinder_material, null, true, false, true);

            //move the top cylinder to the top of the head
            topHead.moveToEntity(bottomHead);
            topHead.move(0, bottomHead.mesh.scale.y/2+topHead.mesh.scale.y/2+head.height*3/4+0.25);
        }



        this.lego_distance = this.parent_legos.info[3];

        


        //build the shoes
        const right_shoe = buildShoe("RightShoe", true);
        const left_shoe = buildShoe("LeftShoe", false);

        //build the pants
        const right_pant = buildPant("RightPant", right_shoe);
        const left_pant = buildPant("LeftPant", left_shoe)
        //build the pants bulges
        const right_bulge = buildBulge("RightBulge", right_pant);
        const left_bulge = buildBulge("LeftBulge", left_pant);
        //builds the waist
        const waist = buildWaist(right_bulge);
        //builds the torso
        const torso = buildTorso(waist);
        //builds the arms
        const right_arm = buildArm(true, torso);
        const left_arm = buildArm(false, torso);
        //builds the hands
        buildHand(true, right_arm);
        buildHand(false, left_arm);
        //builds the head
        buildHead(torso);
        //rotate and move the person to the appropriate position
        this.rotateTo(null, this.rotationCounter*Math.PI/2);
        this.moveToEntity(this.lego);
        //save the lego position of the person
        this.prev_x = this.lego.x;
        this.prev_z = this.lego.z;

        //update the GUI controllers of the person
        this.moveToX.min(0).max(this.parent_legos.info[0]-1);
        this.moveToZ.min(0).max(this.parent_legos.info[1]-1);

        this.moveToX.updateDisplay();
        this.moveToZ.updateDisplay();

    }
    /**
     * changes the type of person. For now only exists a doctor type.
     */
    changeType(){
        const head = this.children.get("Head");
        //update the textures and materials of the entities that make up the person so that it resembles a doctor
        if(this.type == "Doctor"){
            const shoe_texture = this.contents.loadTexture('doctor_shoe').clone();
            const yellow_texture = this.contents.loadTexture('single_lego').clone();
            const torso_texture = this.contents.loadTexture('doctor_torso').clone();
            const head_texture = this.contents.loadTexture('happy_face').clone();
            this.shoes_material.map = shoe_texture;
            this.shoes_material.color.set('#f9fdfd')
            this.pants_material.map = shoe_texture;
            this.pants_material.color.set('#f9fdfd')
            this.bulge_material.map = shoe_texture;
            this.bulge_material.color.set('#f9fdfd')
            this.waist_material.map = shoe_texture;
            this.waist_material.color.set('#f9fdfd')


            this.torso_material.map = shoe_texture;
            this.torso_material.color.set('#f9fdfd');
            
            this.front_torso_material.map = torso_texture;
            this.front_torso_material.color.set("#f9fdfd");

            this.arm_material.map = shoe_texture;
            this.arm_material.color.set('#f9fdfd');
            this.hand_material.map = this.single_lego_texture;
            this.hand_material.color.set("#fef801");
            this.cylinder_material.color.set("#fef801");

            head_texture.rotation = -Math.PI/2;
            head.material.map = head_texture;
            head.material.color.set('#fef801');
            //head.initGuiColor('#00ffff')
            head.material.color.set('#fef801')
            
        }
    }

    /**
     * Adds the GUI elements of the person
     */
    initGui(){
        super.initGui();
        this.initGuiMoveTo();
        this.initGuiShadow();
        this.initGuiRotate();

    }
    /**
     * adds the Moving GUI of the person
     */
    initGuiMoveTo(){
        //create folder to store the moving controllers of the person
        let moveLegoFolder = this.folder.addFolder("Move to Lego");

        //save the current lego position
        this.prev_x = this.lego.x;
        this.prev_z = this.lego.z;

        //create the controllers
        this.moveToX = moveLegoFolder.add(this, 'prev_x', 0, 10000).name('x').step(1).onChange((value)=>{
            this.lego = this.parent_legos.getLego(value, this.lego.z);
            this.build();
        })

        this.moveToZ = moveLegoFolder.add(this, 'prev_z', 0, 10000).name('z').step(1).onChange((value)=>{
            this.lego = this.parent_legos.getLego(this.lego.x, value);
            this.build();
        })

        moveLegoFolder.close();
    }
    /**
     * adds the Scaling GUI of the person
     */
    initGuiScale(){
        //create the scaling folder
        let scaleFolder = this.folder.addFolder("Scale");
        //add the height scaling controller
        scaleFolder.add(this, 'height', 0, 200).name('height').onChange(()=>this.build());

        scaleFolder.close();
    }
    /**
     * adds the rotate GUI of the person
     */
    initGuiRotate(){
        //creates the rotate button of the person
        this.folder.add({rotate: ()=>{
            this.rotationCounter = (this.rotationCounter + 1) % 4;
            this.build();
        }}, 'rotate').name('rotate');
    }
}

export {MyPerson};