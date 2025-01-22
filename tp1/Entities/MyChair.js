import {MyEntity} from './MyEntity.js';

/**
 * Constructor
 * @param {MyContents} contents
 * @param {Text} name
 * @param {MyEntity} parent
 * @param {Number} width
 * @param {Number} depth
 * @param {Number} height
 * @param {MyEntity} lego
 * @param {MyEntity} parent_legos 
 * @param {Number} rotationCounter
 */
class MyChair extends MyEntity {
    constructor(contents, name = "Chair", parent = null, width = 1, depth= 1, height=1, lego = null, parent_legos = null, rotationCounter = 0) {
        super(contents, name, parent, width, depth, height, null, contents.materials.get('PhongDoubleSide').clone(), contents.loadTexture('log'));
        this.lego = lego;
        this.parent_legos = parent_legos;
        this.rotationCounter = rotationCounter;
        
        
        this.init();
    }

    /**
     * Initializes the Chair
     */
    init(){
        // Calls the parent init method for the default initialization
        super.init(this);
        this.material.color.set("#8c5d3b");
        this.initGui();

        

        this.board = new MyEntity(this.contents, "Board", this, this.width+3, this.depth+3, 1+ this.contents.lego_height, null, this.material, null, true, false);

        this.build();
    }

    /**
     * Builds the Chair
     */
    build(){
        /**
         * creating of a leg given its lego and it's id
         * @param {MyEntity} lego
         * @param {Number} num_leg
         */
        const buildLeg = (lego, num_leg) => {
            const name = "Leg" + num_leg;
            let leg;
            //if leg has already been created then fetch it, otherwise create a new one
            if(this.children.has(name)) {
                leg = this.children.get(name);
                //if lego has moved position then add the lego it was on back to the scene
                leg.lego.addToScene();
            }
            else leg = new MyEntity(this.contents, name, this, this.contents.lego_width, this.contents.lego_depth, this.height/2, this.contents.buildObject('Cylinder', 1, 1, 1, 32, 1, true), this.material, null, true, false);

            //remove the lego the leg is on
            lego.removeFromScene();
            leg.lego = lego;
            //position the leg accordingly
            leg.moveToEntity(lego);
            leg.scaleTo(null, this.height/2);
            leg.move(0, leg.mesh.scale.y/2);
        }

        /**
         * builds the board of the chair including the legos on top, given the distance of the legos in between the legs of the chair as arguments
         * @param {Number} right_legs_x
         * @param {Number} front_legs_z
         */
        const buildPlank = (right_legs_x, front_legs_z) => {
            let plank;
            //if plank has already been created then fetch it, otherwise create a new one
            if(this.board.children.has("Plank")) plank = this.board.children.get("Plank");
            else plank = new MyEntity(this.contents, "Plank", this.board, this.width+3, this.depth+3, 1, this.contents.buildObject('Box'), this.board.material, null, true, false);
           
            //position the plank accordingly
            plank.moveToEntity(this.lego);
            plank.move(0, plank.height/2);
            plank.move(right_legs_x*this.parent_legos.info[3]/2, this.height/2, front_legs_z*this.parent_legos.info[3]/2);
            //scale it accordingly
            plank.scaleTo(right_legs_x*this.parent_legos.info[3]+ this.parent_legos.info[3], null, front_legs_z*this.parent_legos.info[3]+this.parent_legos.info[3]);

            //build the legos on top of the plank
            this.contents.buildLego(this.board, plank.mesh.position.x, plank.mesh.position.y+plank.mesh.scale.y/2, plank.mesh.position.z, plank.mesh.scale.x, plank.mesh.scale.z, 7, this.board.material);
            return plank;
        }

        /**
         * build the backrest of the chair given the distance of the legos in between the legs of the chair as arguments and the plank of the chair
         * @param {Number} right_legs_x
         * @param {Number} front_legs_z
         * @param {MyEntity} plank
         */
        const buildBackRest = (right_legs_x, front_legs_z, plank) => {
            let backRest;
            //if the backrest has already been created then fetch it, otherwise create a new one
            if(this.children.has("BackRest")) backRest = this.children.get("BackRest");
            else backRest = new MyEntity(this.contents, "BackRest", this, this.width+3, 1, this.height/2, this.contents.buildObject('Box'), this.material, null, true, false);
            backRest.moveToEntity(this.lego);
            backRest.move(0, this.height/2+backRest.height/2+plank.height);
            //rotates, scales and moves the backrest accordingly
            if(this.rotationCounter % 2 == 0){
                backRest.move(right_legs_x*this.parent_legos.info[3]/2);
                backRest.scaleTo(plank.mesh.scale.x, null, 1);
                if(this.rotationCounter == 0) backRest.move(0, 0, -this.parent_legos.info[3]/2+backRest.mesh.scale.z/2);
                else if(this.rotationCounter == 2) backRest.move(0, 0, front_legs_z*this.parent_legos.info[3] + this.parent_legos.info[3]/2 -backRest.mesh.scale.z/2);
            
            }
            else{
                backRest.move(0, 0, front_legs_z*this.parent_legos.info[3]/2);
                backRest.scaleTo(1, null, plank.mesh.scale.z);
                if(this.rotationCounter == 1) backRest.move(right_legs_x*this.parent_legos.info[3] + this.parent_legos.info[3]/2 -backRest.mesh.scale.x/2);
                if(this.rotationCounter == 3) backRest.move(-this.parent_legos.info[3]/2+backRest.mesh.scale.x/2);
            }
            
        }

        //obtain the distance in legos between the legs of the chair
        const right_legs_x = Math.floor(this.width/this.parent_legos.info[3]);
        const front_legs_z = Math.floor(this.depth/this.parent_legos.info[3]);


        //build the legs
        buildLeg(this.lego, 1);
        buildLeg(this.parent_legos.getLego(this.lego.x, Math.min(this.lego.z+front_legs_z, this.parent_legos.info[1]-1)), 2);
        buildLeg(this.parent_legos.getLego(Math.min(this.lego.x+right_legs_x, this.parent_legos.info[0]-1), Math.min(this.lego.z+front_legs_z, this.parent_legos.info[1]-1)), 3);
        buildLeg(this.parent_legos.getLego(Math.min(this.lego.x+right_legs_x, this.parent_legos.info[0]-1), this.lego.z), 4);


        //build plank
        const plank = buildPlank(right_legs_x, front_legs_z);

        //build backrest
        buildBackRest(right_legs_x, front_legs_z, plank);


        //keep track of the current lego position
        this.prev_x = this.lego.x;
        this.prev_z = this.lego.z;


        //update gui controllers due to chair updates
        this.moveToX.min(0).max(this.parent_legos.info[0]-right_legs_x-1);
        this.moveToZ.min(0).max(this.parent_legos.info[1]-front_legs_z-1);

        this.moveToX.updateDisplay();
        this.moveToZ.updateDisplay();


    }

    
    /**
     * Adds the GUI elements of the chair
     */
    initGui(){
        super.initGui();
        this.initGuiColor();
        this.initGuiMoveTo();
        this.initGuiScale();
        this.initGuiRotate();
        super.initGuiTexture();
        super.initGuiShadow();
    }

    /**
     * Adds the moving GUI of the chair
     */
    initGuiMoveTo(){

        //create new folder to use for moving
        let moveLegoFolder = this.folder.addFolder("Move to Lego");


        //save the current lego position of the chair
        this.prev_x = this.lego.x;
        this.prev_z = this.lego.z;

        //add sliders to control the movement
        this.moveToX = moveLegoFolder.add(this, 'prev_x', 0, 10000).name('x').step(1).onChange((value)=>{
            this.lego = this.parent_legos.getLego(value, this.lego.z);
            this.build();
        });

        this.moveToZ = moveLegoFolder.add(this, 'prev_z', 0, 100000).name('z').step(1).onChange((value)=>{
            this.lego = this.parent_legos.getLego(this.lego.x, value);
            this.build();
        });

        moveLegoFolder.close();
    }

    /**
     * Adds the scaling GUI of the chair
     */
    initGuiScale(){

        //create new folder to use for scaling
        let scaleFolder = this.folder.addFolder("Scale");

        //add sliders to control the scaling
        this.widthController = scaleFolder.add(this, 'width', 0, 200).name('width').onChange(()=>{
            this.build();
        });
        this.depthController = scaleFolder.add(this, 'depth', 0, 200).name('depth').onChange(()=>{
            this.build();
        });
        scaleFolder.add(this, 'height', 0, 200).name('height').onChange(()=>{
            this.build();
        });

        scaleFolder.close();
    }

    /**
     * Adds the rotate GUI of the chair
     */
    initGuiRotate(){
        //add the rotate button
        this.folder.add({rotate: ()=>{
            const width = this.width;
            this.width = this.depth;
            this.depth = width;
            this.rotationCounter = (this.rotationCounter + 1) % 4;
            this.build();
            this.widthController.updateDisplay();
            this.depthController.updateDisplay();
        }}, 'rotate').name('Rotate');
    }
}

export {MyChair};