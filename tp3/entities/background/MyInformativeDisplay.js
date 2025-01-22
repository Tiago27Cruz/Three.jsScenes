import { MyDisplay } from './MyDisplay.js';
import { State } from '../../MyGameState.js';
import { MyContents } from '../../MyContents.js';
import * as THREE from 'three';

class MyInformativeDisplay extends MyDisplay{
    static Option = {
        ELAPSED_TIME: 0,
        LAPS_COMPLETED: 1,
        AIR_LAYER: 2,
        VOUCHERS: 3,
        GAME_STATUS: 4
    }

    /**
     * Constructs the informative Display.
     * @param {MyContents} contents - The contents of the game.
     */
    constructor(contents){
        super(contents);
        this.moveTo(0, 0, -10);

        this.values = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: []
        }
        this.addTextContent();
        
        this.add3dTextContent();
    }
    /**
     * Resets the display to it's beggining values.
     */
    reset(){
        this.update(MyInformativeDisplay.Option.ELAPSED_TIME, 0.00);
        this.update(MyInformativeDisplay.Option.LAPS_COMPLETED, 0);
        this.update(MyInformativeDisplay.Option.AIR_LAYER, 0);
        this.update(MyInformativeDisplay.Option.VOUCHERS, 0);
        this.update(MyInformativeDisplay.Option.GAME_STATUS, "Running");
    }

    /**
     * Adds the 3d labels to the display given a text.
     */
    add3dTextContent(){
        const planeGeometry = new THREE.PlaneGeometry(0.98*this.width, 0.53*this.height, 32);
        const planeMaterial = this.contents.materials.get('Phong').clone();
        planeMaterial.color.set('#000000');
        
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(0, 3*this.height/4-0.15, this.radius+0.05);
        this.addMesh(plane);


        const elapsedTime = "Elapsed Time: "
        const lapsCompleted = "Laps Completed: "
        const airLayer = "Air Layer: "
        const vouchers = "Vouchers: "
        const gameStatus = "Game Status: "

        this.texts = [elapsedTime, lapsCompleted, airLayer, vouchers, gameStatus]
        let i,j, textlength
        j = 0
        for (const text of this.texts){
            i = 0
            textlength = text.length
            for (let k=0; k<textlength; k++){
                const letter = text[k]
                const mesh = this.contents.spritesheetLoader.getMesh(letter, 0.5);
                mesh.position.set(-this.width/2+i+0.3, this.height-j-0.3, this.radius+0.1);
                i+= 0.35
                this.entity.add(mesh);
            }
            j += 0.65
        }
    }

    /**
     * Adds the 3d label values to the display given a text and the label row.
     * @param {number} min - Row where the label to which value is to be added.
     * @param {text} value - The text value to be added to the corresponding label.
     */
    add3dTextValue(row, value){
        if(this.values[row].length > 0){
            for (const mesh of this.values[row]){
                this.entity.remove(mesh);
                mesh.geometry.dispose();
            }
            this.values[row] = []
        }

        const text = this.texts[row]
        const offset_x = text.length*0.35
        const offset_y = 0.65*row
        let i = 0

        for (let k=0; k<value.length; k++){
            const letter = value[k]
            const mesh = this.contents.spritesheetLoader.getMesh(letter, 0.5);
            mesh.position.set(-this.width/2+i+offset_x+0.3, this.height-offset_y-0.3, this.radius+0.1);
            i+= 0.35
            this.entity.add(mesh);
            this.values[row].push(mesh);
        }    
    }

    /**
     * Adds content to the html so that the labels can be viewed.
     */
    addTextContent(){
        const infoPanel = document.createElement('div');
        infoPanel.id = 'infoPanel';
        infoPanel.style.position = 'absolute';
        infoPanel.style.top = '70px';
        infoPanel.style.left = '10px';
        infoPanel.style.color = 'white';
        infoPanel.style.background = 'rgba(0, 0, 0, 0.5)';
        infoPanel.style.padding = '10px';

        // Create and append child divs
        const elapsedTime = document.createElement('div');
        elapsedTime.id = 'elapsedTime';
        elapsedTime.innerText = 'Elapsed Time: ';
        infoPanel.appendChild(elapsedTime);

        const lapsCompleted = document.createElement('div');
        lapsCompleted.id = 'lapsCompleted';
        lapsCompleted.innerText = 'Laps Completed: ';
        infoPanel.appendChild(lapsCompleted);

        const airLayer = document.createElement('div');
        airLayer.id = 'airLayer';
        airLayer.innerText = 'Air Layer: ';
        infoPanel.appendChild(airLayer);

        const vouchers = document.createElement('div');
        vouchers.id = 'vouchers';
        vouchers.innerText = 'Available Vouchers: ';
        infoPanel.appendChild(vouchers);

        const gameStatus = document.createElement('div');
        gameStatus.id = 'gameStatus';
        gameStatus.innerText = 'Game Status: ';
        infoPanel.appendChild(gameStatus);

        // Append the infoPanel to the body
        document.body.appendChild(infoPanel);
    }

    /**
     * Updates the display state.
     * @param {number} id - Label id to update.
     * @param {number} value - The value to be added to the label.
     */
    update(id, value){
        switch(id){
            case MyInformativeDisplay.Option.ELAPSED_TIME:
                document.getElementById('elapsedTime').innerText = 'Elapsed Time: ' + value + ' s';
                const text = value.toString() + ' s';
                this.add3dTextValue(0, text);
                break;
            case MyInformativeDisplay.Option.LAPS_COMPLETED:
                document.getElementById('lapsCompleted').innerText = 'Laps Completed: ' + value + '/3';
                this.add3dTextValue(1, value.toString() + '/3');
                break;
            case MyInformativeDisplay.Option.AIR_LAYER:
                let airlayer
                switch(value){
                    case 0:
                        airlayer = '0 - Ground'
                        break;
                    case 1:
                        airlayer = '1 - North'
                        break;
                    case 2:
                        airlayer = '2 - South'
                        break;
                    case 3:
                        airlayer = '3 - East'
                        break;
                    case 4:
                        airlayer = '4 - West'
                        break;
                }
                document.getElementById('airLayer').innerText = 'Air Layer: ' + airlayer;
                this.add3dTextValue(2, airlayer);
                break;
            case MyInformativeDisplay.Option.VOUCHERS:
                document.getElementById('vouchers').innerText = 'Available Vouchers: ' + value;
                this.add3dTextValue(3, value.toString());
                break;
            case MyInformativeDisplay.Option.GAME_STATUS:
                document.getElementById('gameStatus').innerText = 'Game Status: ' + value;
                this.add3dTextValue(4, value);
                break;
            default:
                console.warn('Invalid id for update inside MyDisplay: ' + id);
                break;
        }
    }

    /**
     * Updates the state of the display according to the state of the game.
     * @param {State} state - The state of the game.
     */
    updateState(state){
        switch(state){
            case State.SETUP_HOME_MENU:{
                break;
            }
            case State.SETUP_RACE:{
                this.reset();
                break;
            }
            case State.RACE:{
                this.update(MyInformativeDisplay.Option.ELAPSED_TIME, (this.contents.game.raceTime).toFixed(2));
                break;
            }
            case State.SETUP_PAUSE:{
                this.update(MyInformativeDisplay.Option.GAME_STATUS, "Paused");
                break;
            }
            case State.SETUP_UNPAUSE:{
                this.update(MyInformativeDisplay.Option.GAME_STATUS, "Running");
                break;
            }
            case State.RESET:{
                this.reset();
                break;
            }
            case State.RESTART:{
                this.reset();
                break;
            }
        }
        super.updateState(state);
    }

}

export { MyInformativeDisplay };