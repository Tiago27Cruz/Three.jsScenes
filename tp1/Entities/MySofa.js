import {MyEntity} from './MyEntity.js';

class MySofa extends MyEntity {
    /**
     * Sofa constructor
     * @param {MyContents} contents
     * @param {String} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
     * @param {MyEntity} lego
     * @param {MyEntity} parent_legos
     */
    constructor(contents, name = "Sofa", parent = null, width = 1, depth= 1, height=1, lego = null, parent_legos = null) {
        super(contents, name, parent, width, depth, height);
        this.lego = lego;
        this.parent_legos = parent_legos;
        this.rotationCounter = 0;
        
        
        this.init();
    }

    /**
     * Initializes the sofa
     */
    init(){
        // Calls the parent init method for the default initialization
        super.init(this);
        
        //save positional variables
        this.leg_height = 4;
        this.back_depth = 6;
        this.offset = 3;

        this.initPrimitives();
        this.initTextures();
        this.initMaterials();

        this.initGui();

        this.build();
    }

    /**
     * Initializes the textures of the sofa
     */
    initTextures(){
        this.single_lego_texture = this.contents.loadTexture('single_lego2').clone();
    }

    /**
     * Initializes the materials of the sofa
     */
    initMaterials(){
        this.leg_material = this.contents.materials.get("Phong").clone();
        this.leg_material.color.set('#D3D3D3');

        this.sofa_material = this.contents.materials.get('Phong').clone();
        this.sofa_material.color.set('#eac895');
        this.sofa_material.specular.set('#ffffff');
        this.sofa_material.shininess = 15;
    }

    /**
     * Initializes the primitives of the sofa
     */
    initPrimitives(){
        this.leg_primitive = this.contents.buildObject('Cylinder', 1, 1, 1, 32, 1, true);

        this.box_primitive = this.contents.buildObject('Box');
       
        this.corner_primitive = this.contents.buildObject('Cylinder', 1, 1, 1, 32, 1, false, -Math.PI/2, Math.PI/2);
    }
    /**
     * Builds the sofa
     */
    build(){
        /**
         * builds the leg given a leg identifier and the distance of the legos between the sofas legs
         * @param {Number} leg_num
         * @param {Number} x_distance
         * @param {Number} z_distance
         */
        const buildLeg = (leg_num, x_distance, z_distance) => {
            const name = "Leg" + leg_num;

            let leg;
            //fetch the leg of the sofa if it exists, otherwise create a new one
            if(this.children.has(name)) leg = this.children.get(name);
            else leg = new MyEntity(this.contents, name, this, this.contents.lego_width+0.5, this.contents.lego_depth+0.5, this.leg_height, this.leg_primitive, this.leg_material, this.single_lego_texture, true, false, false);

            //move the leg accordingly
            leg.moveTo(0, 0, 0);
            leg.move(x_distance, leg.mesh.scale.y/2, z_distance);
        }
        /**
         * builds the backRest of the sofa
         * @returns {MyEntity}
         */
        const buildBackRest = () => {
            let bottomBack;
            //fetch the bottomBack of the sofa if it exists, otherwise create a new one
            if(this.children.has("BottomBack")) bottomBack = this.children.get("BottomBack");
            else bottomBack = new MyEntity(this.contents, "BottomBack", this, this.width+this.offset, this.back_depth, (this.height-this.leg_height)*3/4, this.box_primitive, this.sofa_material, this.single_lego_texture, true, false, true);

            //scale and move it appropriately
            bottomBack.scaleTo(this.width+this.offset, (this.height-this.leg_height)*3/4);
            bottomBack.moveTo(0, 0, 0);
            bottomBack.move(bottomBack.mesh.scale.x/2-this.contents.lego_width-this.offset/2, bottomBack.mesh.scale.y/2+this.leg_height);


            let topBack;
            //fetch the top Back of the sofa if it exists, otherwise create a new one
            if(this.children.has("TopBack")) topBack = this.children.get("TopBack");
            else topBack = new MyEntity(this.contents, "TopBack", this, bottomBack.mesh.scale.x-this.back_depth*2, this.back_depth, (this.height-this.leg_height)/4, this.box_primitive, this.sofa_material, this.single_lego_texture, true, false, true);

            //scale and move it appropriately
            topBack.scaleTo(bottomBack.mesh.scale.x-this.back_depth*2, (this.height-this.leg_height)/4);
            topBack.moveTo(0, 0, 0);
            topBack.move(topBack.mesh.scale.x/2-this.contents.lego_width-this.offset/2+this.back_depth, topBack.mesh.scale.y/2+this.leg_height+bottomBack.mesh.scale.y);


            let leftCorner;
            //fetch the left Corner of the sofa if it exists, otherwise create a new one
            if(this.children.has("LeftCorner")) leftCorner = this.children.get("LeftCorner");
            else leftCorner = new MyEntity(this.contents, "LeftCorner", this, this.back_depth, topBack.mesh.scale.y, this.back_depth, this.corner_primitive, this.sofa_material, this.single_lego_texture, true, false, true);

            //rotate, scale and move it accordingly
            leftCorner.rotateTo(-Math.PI/2);
            leftCorner.scaleTo(null, null, topBack.mesh.scale.y);
            leftCorner.moveTo(0, 0, 0);
            leftCorner.move(leftCorner.mesh.scale.x -this.contents.lego_width - this.offset/2, this.leg_height+bottomBack.mesh.scale.y);


            let rightCorner;
            //fetch the right Corner of the sofa if it exists, otherwise create a new one
            if(this.children.has("RightCorner")) rightCorner = this.children.get("RightCorner");
            else rightCorner = new MyEntity(this.contents, "RightCorner", this, this.back_depth, topBack.mesh.scale.y, this.back_depth, this.corner_primitive, this.sofa_material, this.single_lego_texture, true, false, true);
            //rotate, scale and move it appropriately
            rightCorner.rotateTo(-Math.PI/2, null, Math.PI);
            rightCorner.scaleTo(null, null, topBack.mesh.scale.y);
            rightCorner.moveTo(0, 0, 0);
            rightCorner.move(rightCorner.mesh.scale.x -this.contents.lego_width - this.offset/2-rightCorner.mesh.scale.x*2+bottomBack.mesh.scale.x, this.leg_height+bottomBack.mesh.scale.y);

            return bottomBack;




        }
        /**
         * builds the ArmRests of the sofa give the bottom back as a positional reference
         * @param {MyEntity} bottomBack
         * @returns {MyEntity}
         */
        const buildArmRests = (bottomBack) => {
            let leftBottom;
            //fetch the left bottom part of the sofa if it exists, otherwise create a new one
            if(this.children.has("LeftBottom")) leftBottom = this.children.get("LeftBottom");
            else leftBottom = new MyEntity(this.contents, "LeftBottom", this, this.back_depth, this.depth-this.back_depth+this.offset, (this.height-this.leg_height)/2, this.box_primitive, this.sofa_material, this.single_lego_texture, true, false, true);
            //scale and move it appropriately
            leftBottom.scaleTo(null, (this.height-this.leg_height)/2, this.depth-this.back_depth+this.offset);
            leftBottom.moveTo(0, 0, 0);
            leftBottom.move(leftBottom.mesh.scale.x/2-this.contents.lego_width-this.offset/2, leftBottom.mesh.scale.y/2+this.leg_height, leftBottom.mesh.scale.z/2+bottomBack.mesh.scale.z/2);

            let rightBottom;
            //fetch the right bottom of the sofa if it exists, otherwise create a new one
            if(this.children.has("RightBottom")) rightBottom = this.children.get("RightBottom");
            else rightBottom = new MyEntity(this.contents, "RightBottom", this, this.back_depth, this.depth-this.back_depth+this.offset, (this.height-this.leg_height)/2, this.box_primitive, this.sofa_material, this.single_lego_texture, true, false, true);

            //scale and move it appropriately
            rightBottom.scaleTo(null, (this.height-this.leg_height)/2, this.depth-this.back_depth+this.offset);
            rightBottom.moveTo(0, 0, 0);
            rightBottom.move(-rightBottom.mesh.scale.x/2-this.contents.lego_width-this.offset/2+bottomBack.mesh.scale.x, rightBottom.mesh.scale.y/2+this.leg_height, rightBottom.mesh.scale.z/2+bottomBack.mesh.scale.z/2);


            const topArmRest_height = 1;

            let leftTop;
            //fetch the Left top part of the sofa if it exists, otherwise create a new one
            if(this.children.has("LeftTop")) leftTop = this.children.get("LeftTop");
            else leftTop = new MyEntity(this.contents, "LeftTop", this, this.back_depth, this.depth-this.back_depth+this.offset, topArmRest_height, this.box_primitive, this.sofa_material, this.single_lego_texture, true, false, true);

            //scale and move it appropriately
            leftTop.scaleTo(null, null, this.depth-this.back_depth+this.offset);
            leftTop.moveTo(0, 0, 0);
            leftTop.move(leftTop.mesh.scale.x/2-this.contents.lego_width-this.offset/2, leftTop.mesh.scale.y/2+this.leg_height+leftBottom.mesh.scale.y, leftTop.mesh.scale.z/2+bottomBack.mesh.scale.z/2);


            let rightTop;
            //fetch the Right top of the sofa if it exists, otherwise create a new one
            if(this.children.has("RightTop")) rightTop = this.children.get("RightTop");
            else rightTop = new MyEntity(this.contents, "RightTop", this, this.back_depth, this.depth-this.back_depth+this.offset, topArmRest_height, this.box_primitive, this.sofa_material, this.single_lego_texture, true, false, true);

            //scale and move it appropriately
            rightTop.scaleTo(null, null, this.depth-this.back_depth+this.offset);
            rightTop.moveTo(0, 0, 0);
            rightTop.move(-rightTop.mesh.scale.x/2-this.contents.lego_width-this.offset/2+bottomBack.mesh.scale.x, rightTop.mesh.scale.y/2+this.leg_height+leftBottom.mesh.scale.y, rightTop.mesh.scale.z/2+bottomBack.mesh.scale.z/2);

        }
        /**
         * builds the seating of the sofa give the bottom back as a positional reference
         * @param {MyEntity} bottomBack
         */
        const buildSeating = (bottomBack) => {
            let board;
            //fetch the seating board of the sofa if it exists, otherwise create a new one
            if(this.children.has("Board")) board = this.children.get("Board");
            else board = new MyEntity(this.contents, "Board", this, 1, 1, 1, null, this.sofa_material, this.single_lego_texture, true, false, false);



            let seat;
            //fetch the seat of the sofa if it exists, otherwise create a new one
            if(this.children.has("Seat")) seat = this.children.get("Seat");
            else seat = new MyEntity(this.contents, "Seat", this, this.width+this.offset-this.back_depth*2, this.depth-this.back_depth+this.offset, (this.height-this.leg_height)/4, this.box_primitive, board.material, null, true, false, true);

            //scale the seating and move it
            seat.scaleTo((this.width+this.offset-this.back_depth*2), (this.height-this.leg_height)/4, this.depth-this.back_depth+this.offset);
            seat.moveTo(0, 0, 0);
            seat.move(seat.mesh.scale.x/2-this.contents.lego_width-this.offset/2+this.back_depth, seat.mesh.scale.y/2+this.leg_height, seat.mesh.scale.z/2+bottomBack.mesh.scale.z/2);

            //build the legos on top of the seat
            this.contents.buildLego(board, seat.mesh.position.x, seat.mesh.position.y+seat.mesh.scale.y/2, seat.mesh.position.z, seat.mesh.scale.x, seat.mesh.scale.z, 7, this.sofa_material);

            
        }

        //get the lego distance betweeen the legs of the sofa
        const right_legs_x = Math.floor((this.width-3)/this.parent_legos.info[3]);
        const front_legs_z = Math.floor((this.depth-3)/this.parent_legos.info[3]);

        const lego_distance = this.parent_legos.info[3];

        //build the legs
        buildLeg(1, 0, 0);
        buildLeg(2, 0, front_legs_z*lego_distance);
        buildLeg(3, right_legs_x*lego_distance, 0);
        buildLeg(4, right_legs_x*lego_distance, front_legs_z*lego_distance);

        //build backrest
        const bottomBack = buildBackRest();

        //build arm rests
        buildArmRests(bottomBack);

        //build seating
        buildSeating(bottomBack);

        //rotate and move the sofa according to it's gui position
        this.rotateTo(null, this.rotationCounter*Math.PI/2);
        this.moveToEntity(this.lego);
        this.move(0, -this.contents.lego_height/2);

        //save the current lego position of the sofa
        this.prev_x = this.lego.x;
        this.prev_z = this.lego.z;

        //update the gui of the sofa
        this.moveToX.min(0).max(this.parent_legos.info[0]-right_legs_x-1);
        this.moveToZ.min(0).max(this.parent_legos.info[1]-front_legs_z-1);

        this.moveToX.updateDisplay();
        this.moveToZ.updateDisplay();

    }




    
    /**
     * Adds the GUI elements of the candle
     */
    initGui(){
        super.initGui();
        super.initGuiColorMaterials([this.sofa_material])
        this.initGuiLegColor();
        this.initGuiMoveTo();
        this.initGuiScale();
        this.initGuiRotate();
        super.initGuiShadow();
    }

    /**
     * Adds the GUI elements of the leg color
     */
    initGuiLegColor(){
        let legColorFolder = this.folder.addFolder("Leg Color");

        legColorFolder.addColor(this.leg_material, 'color').name('Color')

        legColorFolder.close();
    }
    /**
     * Adds the GUI elements of the moving of the sofa
     */
    initGuiMoveTo(){


        let moveLegoFolder = this.folder.addFolder("Move to Lego");

        this.prev_x = this.lego.x;
        this.prev_z = this.lego.z;

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
     * Adds the GUI elements of the scaling of the sofa
     */
    initGuiScale(){
        let scaleFolder = this.folder.addFolder("Scale");

        scaleFolder.add(this, 'width', 0, this.width*3).name('width').onChange(()=>this.build());
        scaleFolder.add(this, 'height', 0, this.height*3).name('height').onChange(()=>this.build());
        scaleFolder.add(this, 'depth', 0, this.depth*3).name('depth').onChange(()=>this.build());


        scaleFolder.close();
    }

    /**
     * Adds the GUI elements of the rotation of the sofa
     */
    initGuiRotate(){
        this.folder.add({rotate: () => {
            const depth_save = this.depth;
            this.depth = this.width;
            this.width = depth_save;
            this.rotationCounter = (this.rotationCounter + 1) % 4;
            this.build();
        }}, 'rotate').name('rotate');
    }

}

export {MySofa};