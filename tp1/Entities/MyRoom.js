import * as THREE from 'three'
import { MyEntity } from './MyEntity.js';
import { MyWalls } from './MyWalls.js';
import {MyFloor} from './MyFloor.js';
import {MyDesk} from './MyDesk.js';
import {MyChair} from './MyChair.js';
import {MyLamp} from './MyLamp.js';
import { MyFireplace } from './MyFireplace.js';
import { MyCeiling } from './MyCeiling.js';
import { MySofa } from './MySofa.js';
import { MyTVStand } from './MyTVStand.js';
import { MyPerson } from './MyPerson.js';

class MyRoom extends MyEntity{
    /**
     * Constructor for the room
     * @param {MyContents} contents 
     * @param {Text} name 
     * @param {MyEntity} parent 
     * @param {Number} width 
     * @param {Number} depth 
     * @param {Number} height 
     */
    constructor(contents, name = "Room", parent = null, width = 1,  depth = 1, height = 1){
        super(contents, name, parent, width, depth, height);
        this.init();
    }

    /**
     * Initialize the room
     */
    init(){
        super.init(this)
        this.initGui();

        // Define distance between all legos
        const lego_distance = 7;

        // Create the floor
        this.floor = new MyFloor(this.contents, "Floor", this, this.width, this.depth, 1, lego_distance);

        // Create the desk
        const floor_legos = this.floor.children.get("Legos");
        this.desk = new MyDesk(this.contents, "Table", this, 45, 46, 10, lego_distance, floor_legos.getLego(5,5), floor_legos);
        this.desk.move(0, this.desk.height/2, 0);
        this.desk.updateItems(this.desk.height)

        // Create the chair
        this.chair = new MyChair(this.contents, "Chair", this, 9, lego_distance+this.contents.lego_depth, 20, floor_legos.getLego(11, 6), floor_legos, 1);

        // Create the ceiling
        this.ceiling = new MyCeiling(this.contents, "Ceiling", this, this.width, this.depth, 1);
        this.ceiling.move(0, this.height, 0);

        // Create the lamp
        this.lamp = new MyLamp(this.contents, "Lamp", this, 2*lego_distance, 2*lego_distance, 35);
        // move lamp to the corner of the room
        this.lamp.move(5*lego_distance, 0, -5*lego_distance);
        
        // Create the fireplace
        this.fireplace = new MyFireplace(this.contents, "Fireplace", this, 4*lego_distance, 2*lego_distance, this.contents.height);
        this.fireplace.rotate(0, Math.PI/2, 0);
        this.fireplace.move(-6*lego_distance, 0, 0*lego_distance);

        // Create the sofa
        this.sofa = new MySofa(this.contents, "Sofa", this, 50, 20, 20, floor_legos.getLego(3, 0), floor_legos);

        //Create the person
        this.person = new MyPerson(this.contents, "Person", this, lego_distance*2+this.contents.lego_width*4, this.contents.lego_depth*2, 25, floor_legos.getLego(11, 4), floor_legos);

        // Create a new desk as a study desk
        //const desk2 = new MyDesk(this.contents, "Study Desk", this, 20, 50, 20, lego_distance, floor_legos.getLego(0, 9), floor_legos, 3);
        //desk2.move(0, desk2.height/2, 0);

        //Create the tv stand
        this.tvStand = new MyTVStand(this.contents, "TV Stand", this, 6*lego_distance, 2*lego_distance, 30);
        this.tvStand.rotate(0, Math.PI, 0);
        this.tvStand.move(0, 0, 6*lego_distance);

        // Create the walls
        this.walls = new MyWalls(this.contents, "Walls", this, this.width, this.depth, this.height);
        
        // InitGuiSelector must be initialized after all entities are created
        this.initGuiSelector();

        this.addToScene();
    } 

    /**
     * Initialize the GUI for the room
     */
    initGui(){
        super.initGui();
        super.initGuiMoveTo();
        super.initGuiShadow();
        super.initGuiScale(true, true, true, false, false);
        super.initGuiRotate()
        
    }

    /**
     * Initialize the GUI for selecting the entity to be displayed
     */
    initGuiSelector(){
        const entities = {
            'None': null,
            'Floor': this.floor,
            'Walls': this.walls,
            'Table': this.desk,
            'Chair': this.chair,
            'Ceiling': this.ceiling,
            'Lamp': this.lamp,
            'Fireplace': this.fireplace,
            'Sofa': this.sofa,
            'Person': this.person,
            'TV Stand': this.tvStand,
        };

        const selector = { entity: 'None' };

        // Hide all entities
        for (const entity of Object.values(entities)) {
            if (entity && entity.folder) {
                entity.folder.hide();
            }
        }

        this.folder.add(selector, 'entity', Object.keys(entities)).name('Entity').onChange((value) => {
            // Hide all entities
            for (const entity of Object.values(entities)) {
                if (entity && entity.folder) {
                    entity.folder.hide();
                }
            }

            // Show the selected entity
            if (entities[value] && entities[value].folder) {
                entities[value].folder.show();
            }
        });
    }
}
export {MyRoom};