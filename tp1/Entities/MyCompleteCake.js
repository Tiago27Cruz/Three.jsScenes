import { MyEntity } from './MyEntity.js';
import { MyCake } from './MyCake.js';
import { MyPlate } from './MyPlate.js';
import { MySpotlight } from './MySpotlight.js';
import { MyCup } from './MyCup.js';

class MyCompleteCake extends MyEntity{
    /**
     * Constructor for the complete cake
     * @param {MyContents} contents
     * @param {Text} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
     * @param {Boolean} addCup - If a small cup should be added to the scene
     * @param {MyEntity} lego - Lego entity associated with the cake
     * @param {MyEntity} parent_legos - All legos of the parent entity (as a single entity)
     * @param {Boolean} buildSpotlight - If a spotlight should be added to the scene
     */
    constructor(contents, name = "CompleteCake", parent = null, width = 10,  depth= 10, height=10, addCup = false, lego = null, parent_legos = null, buildSpotlight = false){
        super(contents, name, parent, width, depth, height);
        this.lego = lego;
        this.parent_legos = parent_legos;
        this.buildSpotlight = buildSpotlight;
        this.init(addCup);
    }

    /**
     * Initializes the complete cake, including the cake, plate, cup and spotlight
     * @param {Boolean} addCup - If a small cup should be added to the scene
     */
    init(addCup){
        super.init(this)
        
        // Create the plate
        const plate = new MyPlate(this.contents, "Plate", this, this.width/2, this.depth/2, this.height/3);
        plate.move(0, plate.height/2+0.1);
        
        // Create the small cup if needed
        if(addCup){
            const cup = new MyCup(this.contents, 'Cup', this, 5, 5, 5);
            cup.moveToEntity(plate);
            cup.move(this.width+plate.width*3/4, 0.25, this.depth+plate.depth*3/4);
        }

        // Create the cake
        const cake = new MyCake(this.contents, "Cake", this, this.width*2, this.depth*2, this.height*2);

        // Move the cake slightly above the plate as to not glitch
        cake.moveToEntity(plate);

        // Add shadows to the entities before adding the spotlight, so the spotlight is not affected by the shadows
        this.addShadows();

        if(this.buildSpotlight){ // If the spotlight is needed, create it
            this.spotlight = new MySpotlight(this.contents, "Spotlight", this, this.width/2, this.depth/2, this.height/2);
            this.spotlight.moveToEntity(plate);
        }

        this.initGui();
    }

    /**
     * Updates the spotlight position to the ceiling related to the current desk height
     * @param {Number} deskHeight 
     */
    updateSpotlight(deskHeight){
        if(this.buildSpotlight) this.spotlight.placeOnCeiling(deskHeight);
    }

    /**
     * Gui initialization
     */
    initGui(){
        super.initGui();
        if(this.lego != null && this.buildSpotlight == false){ // If it has a lego associated and is not the central cake, add the move lego gui
            super.initGuiMoveToLego();
        }

        this.initGuiScale()
        this.initGuiRotate(false, true, false);
        this.initGuiShadow();
    }


}

export {MyCompleteCake};