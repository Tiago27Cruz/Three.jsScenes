import { MyEntity } from './MyEntity.js';
import { MyCompleteCake } from './MyCompleteCake.js';
import { MySpiralSpring } from './MySpiralSpring.js';
import { MyJar } from './MyJar.js';
import { MyNewspaper } from './MyNewspaper.js';
import {MyTv} from './MyTv.js';

class MyDesk extends MyEntity{
    /**
     * 
     * @param {MyContents} contents
     * @param {string} name
     * @param {MyEntity} parent
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     * @param {Number} lego_distance - Distance between the legos
     * @param {MyEntity} lego - Lego entity associated with the desk
     * @param {MyEntity} parent_legos - All legos of the parent entity (as a single entity)
     * @param {Number} leg_space - Number of legos between 2 legs
     */
    constructor(contents, name = "Desk", parent = null, width = 1,  depth = 1, height = 1, lego_distance = 7, lego = null, parent_legos = null, leg_space = 2){
        super(contents, name, parent, width, depth, height);
        this.lego_distance = lego_distance;
        this.parent_legos = parent_legos;
        this.lego = lego;
        this.itemSelection = "Cake";
        this.leg_space = leg_space;
        this.init();
    }

    /**
     * Initializes the desk and its components
     */
    init(){
        super.init(this)

        this.board = new MyEntity(this.contents, 'Board', this, this.width + this.width/2, this.depth + this.depth/2, 1, null, this.contents.materials.get("Phong").clone(), this.contents.loadTexture("log").clone(), true);
        this.board.material.color.set("#8c5d3b");

        // Creates the board object
        this.plank = new MyEntity(this.contents, 'Plank', this.board, 1, 1, 1, this.contents.buildObject('Box'), this.board.material, this.board.texture, true, false);
        this.plank.move(0, this.height/2, 0);

        // Create the legs object
        this.legs = new MyEntity(this.contents, "Legs", this, this.width, this.depth, this.height, null, this.contents.materials.get("Phong").clone(), this.contents.loadTexture("legos_stacked").clone(), true);
        this.legs.updateTexture(8, 5);
        this.legs.updateColor("#777777", "#ffffff", 30);

        // Create the "items" parent entity
        this.items = new MyEntity(this.contents, "Items", this, 1, 1, 1, null, null, null, true);


        //initialize the jar texture and rotate it
        this.jar_texture = this.contents.loadTexture("face2").clone();
        this.jar_texture.rotation = -Math.PI/2;

        
        this.build();
        this.addShadows(true, false);


        // Create the center cake
        const board_legos = this.board.children.get("Legos");

        const middle_lego = board_legos.getMiddleLego();
        this.centerCake = new MyCompleteCake(this.contents, "CompleteCake", this.items, 4, 4, 3, false, middle_lego, board_legos, true);
        this.centerCake.moveToEntity(middle_lego);
        // Place it in the center of the 4 center legos
        this.centerCake.move(this.lego_distance/2,-this.contents.lego_height/2,this.lego_distance/2);
        this.centerCake.lego.removeFromScene();
        board_legos.removeLego(this.centerCake.lego.x+1, this.centerCake.lego.z);
        board_legos.removeLego(this.centerCake.lego.x+1, this.centerCake.lego.z+1);
        board_legos.removeLego(this.centerCake.lego.x, this.centerCake.lego.z+1);

        // Add a spring to the table
        this.addItem(board_legos.getLego(3,3), "Spring");

        this.initGui();
    } 

    /**
     * Adds a given item to the table
     * @param {MyEntity} lego 
     * @param {Text} name 
     */
    addItem(lego, name = "Plate"){
        const board_legos = this.board.children.get("Legos");
        let item;
        switch(name){
            case "Cake":
                item = new MyCompleteCake(this.contents, "CompleteCake", this.items, 2, 2, 1.5, true, lego, board_legos, false);
                break;
            case "Spring":
                item = new MySpiralSpring(this.contents, name, this.items, 1, 1, 5, 10, 1, lego, board_legos);
                break;
            case "Jar":{
                item = new MyJar(this.contents, name, this.items, 12, 16, 5, 0.3, 0.75, 0.75, 10, true, this.jar_texture, lego, board_legos);
                break
            }
            case "Newspaper":
                item = new MyNewspaper(this.contents, name, this.items, 4, 4, 6, lego, board_legos);
                break;
            case "Tv":
                item = new MyTv(this.contents, name, this.items, 4, 6, 5, lego, board_legos);
                break;
        }

        item.moveToEntity(lego);
        lego.hasItem = true;

        // Decorations are placed on top of the lego, while the others replace the lego
        if(!item.isDecoration){
            lego.removeFromScene();
            item.move(0, -this.contents.lego_height/2);
        } else {
            item.move(0, this.contents.lego_height/2);
        }
    }

    /**
     * Builds the desk, adding the legos, board, legs and items to the scene
     */
    build(){
        /**
         * adds the center cake legos back into the scene after it is moved
         */
        const addLegos = () => {
            if(this.centerCake !== undefined){
                this.centerCake.lego.addToScene();
                this.centerCake.parent_legos.addLego(this.centerCake.lego.x+1, this.centerCake.lego.z);
                this.centerCake.parent_legos.addLego(this.centerCake.lego.x+1, this.centerCake.lego.z+1);
                this.centerCake.parent_legos.addLego(this.centerCake.lego.x, this.centerCake.lego.z+1);
            }
        }
        /**
         * Builds a leg given the lego that it is on and it's id
         * @param {MyEntity} lego
         * @param {Number} leg_num
         */
        const buildLeg = (lego, leg_num) => {
            const name = "Leg"+leg_num;
            let leg;
            //if leg has already been created then fetch it, otherwise create a new one
            if(this.legs.children.has(name)) {
                leg = this.legs.children.get(name);
                //add lego to the scene after the leg has been moved
                leg.lego.addToScene();
            }
            else leg = new MyEntity(this.contents, name, this.legs, 2.5, 2.5, this.height, this.contents.buildObject('Cylinder', 1, 1, 1, 32, 1, true), this.legs.material, this.legs.texture, true, false);
    
            //remove the lego the leg was on from the scene
            leg.lego = lego;
            leg.lego.removeFromScene();
            
            //move the lego to the lego and adjust the y position accordingly
            leg.moveToEntity(lego);
            leg.mesh.position.y = leg.mesh.position.y - this.plank.width
        }

        /**
         * Builds the board of the desk, given the number of legs that are in it and the distance between legos of the floor
         * @param {Number} x_leg_nums
         * @param {Number} z_leg_nums
         * @param {Number} parent_legos_distance
         */
        const buildBoard = (x_leg_nums, z_leg_nums, parent_legos_distance) => {
            //save the board y position
            const board_original_y = this.plank.mesh.position.y;

            //get the width and depth of the board
            const board_width = (1+(x_leg_nums-1)*(this.leg_space+1)) * parent_legos_distance; 
            const board_depth = (1+(z_leg_nums-1)*(this.leg_space+1)) * parent_legos_distance; 
    
    
            //move the board to the lego
            this.plank.moveToEntity(this.lego);
    
            //put it on the center of the table and to its original height
            this.plank.move((x_leg_nums-1)*parent_legos_distance*(this.leg_space+1)/2, 0, (z_leg_nums-1)*parent_legos_distance*(this.leg_space+1)/2);
            this.plank.moveTo(null, board_original_y);
    
            //scale the board by its width and depth
            this.plank.scaleTo(board_width, null, board_depth);
    
            //build the legos on top of the board
            this.contents.buildLego(this.board, this.plank.mesh.position.x, this.plank.mesh.position.y + this.plank.mesh.scale.y/2, this.plank.mesh.position.z, this.plank.mesh.scale.x, this.plank.mesh.scale.z,
                this.lego_distance, this.board.material);
        }
        /**
         * Builds the items on the desk given the legos of the board of the desk
         * @param {MyEntity} board_legos
         */
        const buildItems = (board_legos) => {
            //loop throught the items
            for(const item of this.items.children.values()){
                //dont change the centered cake
                if(item.name.startsWith("CompleteCake") && item.buildSpotlight) continue;
                //update the item's parent legos
                item.parent_legos = board_legos;
                //if the item's lego is currently present in the table then add it to the scene because movement on the item might be made. decoration items don't need this precaution
                if(item.prev_x < board_legos.info[0] && item.prev_z < board_legos.info[1] && !item.isDecoration) item.lego.addToScene();
                //move the item to it's lego
                item.lego = board_legos.getLego(Math.min(item.prev_x, board_legos.info[0]-1), Math.min(item.prev_z, board_legos.info[1]-1));
                item.moveToEntity(item.lego);
                //update the item's height
                if(!item.isDecoration)item.move(0, -this.contents.lego_height/2);
                else item.move(0, this.contents.lego_height/2);

                //save the item's lego position and update it's gui.
                item.prev_x = item.lego.x;
                item.prev_z = item.lego.z;
                item.updateControllerRange(item.moveToXLegoController, 0, board_legos.info[0]-1);
                item.updateControllerRange(item.moveToZLegoController, 0, board_legos.info[1]-1);
                //remove the lego it is currently on
                if(!item.isDecoration)item.lego.removeFromScene();
            }
        }
        /**
         * Removes additional legs that might still remain on the table
         * @param {Number} leg_num
         */
        const removeLegs = (leg_num) => {
            let name = "Leg" + leg_num;
            //loop through the additional legs
            while(this.legs.children.has(name)){
                const leg = this.legs.children.get(name);
                //add the leg lego to the scene and remove the leg from the scene
                leg.lego.addToScene();
                leg.removeFromScene();
                this.legs.children.delete(name);
                leg_num++;
                name = "Leg" + leg_num;
            }
        }

        let leg_num = 1;

        const parent_legos_distance = this.parent_legos.info[3];

        //obtain the number of legs on the table
        const x_leg_nums = Math.floor(Math.max((this.width - parent_legos_distance)/(parent_legos_distance*this.leg_space), 1));
        const z_leg_nums = Math.floor(Math.max((this.depth - parent_legos_distance)/(parent_legos_distance*this.leg_space), 1));

    

        //add the legs in a grid format
        let current_lego_x = this.lego.x;
        for(let i = 0; i < x_leg_nums; i++){
            let current_lego_z = this.lego.z
            for(let j = 0; j < z_leg_nums; j++){
                const current_lego = this.parent_legos.getLego(current_lego_x, current_lego_z);
                buildLeg(current_lego, leg_num);
                leg_num++;
                current_lego_z += this.leg_space+1;
                if(current_lego_z >= this.parent_legos.info[1]) break;
            }
            current_lego_x += this.leg_space+1;
            if(current_lego_x >= this.parent_legos.info[0])break;
        }
        //remove additional legs
        removeLegs(leg_num);

        //adds center cake legos, due to the fact that the center cake always moves when the table changes size
        addLegos();

        //build the board of the table
        buildBoard(x_leg_nums, z_leg_nums, parent_legos_distance);

        const board_legos = this.board.children.get("Legos");

        //build the items of the table
        buildItems(board_legos);

        // Move the center cake to the center of the board
        if(this.centerCake !== undefined){

            // Place it in the center of the 4 center legos
            const middle_lego = board_legos.getMiddleLego();
            this.centerCake.moveToEntity(middle_lego);
            this.centerCake.move(0, -this.contents.lego_height/2);  
            this.centerCake.move(this.lego_distance/2,0,this.lego_distance/2);

            this.centerCake.lego = middle_lego;
            this.centerCake.parent_legos = board_legos;

            // Remove the legos that the cake is on
            this.centerCake.lego.removeFromScene();
            board_legos.removeLego(this.centerCake.lego.x+1, this.centerCake.lego.z);
            board_legos.removeLego(this.centerCake.lego.x+1, this.centerCake.lego.z+1);
            board_legos.removeLego(this.centerCake.lego.x, this.centerCake.lego.z+1);
            
        }
    }

    /**
     * Updates the items positions that need to be updated
     * @param {Number} deskHeight - The height of the desk
     */
    updateItems(deskHeight){
        for(const item of this.items.children.values()){
            if(item.name.startsWith("CompleteCake") && item.buildSpotlight){
                item.updateSpotlight(deskHeight);
            }
        }
    }

    /**
     * Initializes the GUI for the complete table
     */
    initGui(){
        // Entire Table GUI
        super.initGui();
        super.initGuiShadow();
        //this.initGuiMoveToLego();
        this.initGuiMoveTo();
        this.initGuiScale();
        //this.folder.add(this, 'leg_space', 1, 4).name("Leg Space").step(1).onChange(()=>this.build());
        this.initGuiAddItemToTable();

        // Items GUI
        this.items.initGui();
        this.items.initGuiShadow();
        this.items.folder.close();
        
        // Board GUI
        this.board.initGui();
        this.board.initGuiColor("#8c5d3b");
        this.board.initGuiTexture();
        this.board.initGuiShadow();

        // Legs GUI
        this.legs.initGui();
        this.legs.initGuiColor("#777777", "#ffffff", 30);
        this.legs.initGuiTexture();
        this.legs.initGuiShadow();


    }

    /**
     * Initializes the GUI for moving the desk to a specific lego
     */
    initGuiMoveTo(){
        //get the parent_legos information
        const floor_width = this.parent_legos.info[0];
        const floor_depth = this.parent_legos.info[1];
        const parent_legos_distance = this.parent_legos.info[3];

        //obtain the number of legs on the table
        const x_leg_nums = Math.floor(Math.max((this.width - parent_legos_distance)/(parent_legos_distance*this.leg_space), 1));
        const z_leg_nums = Math.floor(Math.max((this.depth - parent_legos_distance)/(parent_legos_distance*this.leg_space), 1));

        //create variables that hold the current lego indices
        let lego_x = this.lego.x;
        let lego_z = this.lego.z;

        //create folder for movement of the desk and add it to the GUI
        let moveFolder = this.folder.addFolder("Move");

        //calculate the max value of the movement of the desk
        const max_x = floor_width-1-(this.leg_space+1)*(x_leg_nums-1)
        const max_z = floor_depth-1-(this.leg_space+1)*(z_leg_nums-1)

        //create folders to change the position of the desk
        moveFolder.add({lego_x: lego_x}, 'lego_x', 0, max_x).name('x').step(1).onChange((value)=>{
            this.lego = this.parent_legos.getLego(value, this.lego.z);
            this.build();
        })

        moveFolder.add({lego_z: lego_z}, 'lego_z', 0, max_z).name('z').step(1).onChange((value)=>{
            this.lego = this.parent_legos.getLego(this.lego.x, value);
            this.build();
        })

        moveFolder.close();
    }

    /**
     * Initializes the GUI for scaling the desk
     */
    initGuiScale(){
        let scaleFolder = this.folder.addFolder("Scale");

        // The scale caps at 90, as the table can't be bigger than the floor. It also can't get any smaller, otherwise Central Cake will look weird
        scaleFolder.add(this, 'width', this.width, 90).name("width").onChange((value)=>{
            this.build();
        });

        // The height scale caps at 40, as to the center cake not hit the spotlight
        scaleFolder.add(this, 'height', 0, 40).name("height").onChange((value)=>{

            const leg1 = this.legs.children.get('Leg1');
            const y_diff = value - leg1.mesh.scale.y;
            this.legs.scaleTo(null, value, null);
            this.legs.move(0, y_diff/2,0);


            this.board.move(0, y_diff, 0);
            this.items.move(0, y_diff, 0);
            this.updateItems(value + this.board.height);


        });

        // The scale caps at 90, as the table can't be bigger than the floor. It also can't get any smaller, otherwise Central Cake will look weird
        scaleFolder.add(this, 'depth', this.depth, 90).name("depth").onChange((value)=>{
            this.build();
        });

        scaleFolder.close();
    }

    /**
     * Initializes the GUI for adding an item to the table
     */
    initGuiAddItemToTable(){
        //create a combo box for the types of elements to add to the table
        this.folder.add(this, 'itemSelection', {
            'Cake': 'Cake',
            'Spring': 'Spring',
            'Jar': 'Jar',
            'Newspaper': 'Newspaper',
            'Tv': 'Tv'
        }).name('Choose Item');

        //create a button so that on click it adds the entity to the scene
        this.folder.add({itemCount: ()=>{
            const board_legos = this.board.children.get("Legos");

            // Check if lego already has item on it
            for(let i = 0; i < board_legos.info[0]; i++){
                for(let j = 0; j < board_legos.info[1]; j++){
                    let lego = board_legos.getLego(i, j);
                    if(lego.enabled & !lego.hasItem){
                        this.addItem(board_legos.getLego(i, j), this.itemSelection);
                        return;
                    }
                }
            }

            
        }}, 'itemCount').name('Add Item');
    }
}
export {MyDesk};