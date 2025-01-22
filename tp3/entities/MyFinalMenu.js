import * as THREE from 'three';
import { MyEntity } from './MyEntity.js';
import { MyControllablePlayer } from '../players/MyControllablePlayer.js';
import { State } from '../MyGameState.js';

class MyFinalMenu extends MyEntity{
    constructor(contents){
        super(contents);
        this.variableMeshes = [];
        this.buildDefault();
    }

    /**
     * Build the visual representation of the Final Menu. Done earlier to avoid having to build it every time upon reaching the final menu
     */
    buildDefault(){
        const geometry = new THREE.PlaneGeometry(7, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
        const infoPlayer = new THREE.Mesh(geometry, material);
        infoPlayer.position.set(-12, 18, 9);
        this.addMesh(infoPlayer);

        const infoOpponent = new THREE.Mesh(geometry, material);
        infoOpponent.position.set(12, 18, 9);
        this.addMesh(infoOpponent);

        const timeGeometry = new THREE.PlaneGeometry(10, 1);
        const timeMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
        const infoTime = new THREE.Mesh(timeGeometry, timeMaterial);
        infoTime.position.set(0, 20, 9);
        this.addMesh(infoTime);

        const playAgainGeometry = new THREE.PlaneGeometry(10, 3);
        const playAgainMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        playAgainMaterial.map = this.contents.loadTexture('playAgain.jpg');
        this.playAgainMesh = new THREE.Mesh(playAgainGeometry, playAgainMaterial);
        this.playAgainMesh.position.set(0, 16, 9);
        this.addMesh(this.playAgainMesh);
        this.playAgainMesh.name = "playAgain";

        const homeGeometry = new THREE.PlaneGeometry(10, 3);
        const homeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        homeMaterial.map = this.contents.loadTexture('home.jpg');
        this.homeMesh = new THREE.Mesh(homeGeometry, homeMaterial);
        this.homeMesh.position.set(0, 12, 9);
        this.addMesh(this.homeMesh);
        this.homeMesh.name = "home";
    }

    /**
     * Build the rest of the final menu
     */
    build(name, winner, time){
        this.variableMeshes = [];

        let winnerPosition, loserPosition;
        // Place the winner/loser plane under the correct player
        if (winner instanceof MyControllablePlayer){
            winnerPosition = new THREE.Vector3(-12, 10, 9);
            loserPosition = new THREE.Vector3(12, 10, 9);
        } else {
            winnerPosition = new THREE.Vector3(12, 10, 9);
            loserPosition = new THREE.Vector3(-12, 10, 9);
        }

        const winnerGeometry = new THREE.PlaneGeometry(7, 1);
        const winnerMaterial = new THREE.MeshBasicMaterial({ color: 0x00dd00 });
        const winnerMesh = new THREE.Mesh(winnerGeometry, winnerMaterial);
        winnerMesh.position.set(winnerPosition.x, winnerPosition.y, winnerPosition.z);
        this.addMesh(winnerMesh);
        this.variableMeshes.push(winnerMesh);

        const loserGeometry = new THREE.PlaneGeometry(7, 1);
        const loserMaterial = new THREE.MeshBasicMaterial({ color: 0xdd0000 });
        const loserMesh = new THREE.Mesh(loserGeometry, loserMaterial);
        loserMesh.position.set(loserPosition.x, loserPosition.y, loserPosition.z);
        this.addMesh(loserMesh);
        this.variableMeshes.push(loserMesh);

        this.addInfoText(name, winnerPosition, loserPosition, time);
    }

    /**
     * Function to add the text to the screen.
     */
    addInfoText(name, winnerPos, loserPos, time){
        time = "Time: " + time + "s";
        const winner = "1st Place";
        const loser = "2nd Place";
        const opponent = "Opponent";
        
        for (let i = 0; i < name.length; i++) {
            const letter = name[i];
            const mesh = this.contents.spritesheetLoader.getMesh(letter, 1);
            mesh.position.set(-14.9 + 0.6 * i, 18, 9.1);
            this.addMesh(mesh);
            this.variableMeshes.push(mesh);
        }

        for (let i = 0; i < opponent.length; i++) {
            const letter = opponent[i];
            const mesh = this.contents.spritesheetLoader.getMesh(letter, 1);
            mesh.position.set(9.5 + 0.6 * i, 18, 9.1);
            this.addMesh(mesh);
            this.variableMeshes.push(mesh);
        }

        for (let i = 0; i < time.length; i++) {
            const letter = time[i];
            const mesh = this.contents.spritesheetLoader.getMesh(letter, 1);
            mesh.position.set(-4.5 + 0.6 * i, 20, 9.1);
            this.addMesh(mesh);
            this.variableMeshes.push(mesh);
        }

        for (let i = 0; i < winner.length; i++) {
            const letter = winner[i];
            const mesh = this.contents.spritesheetLoader.getMesh(letter, 1);
            mesh.position.set(winnerPos.x - 2 + 0.6 * i, winnerPos.y, 9.1);
            this.addMesh(mesh);
            this.variableMeshes.push(mesh);
        }

        for (let i = 0; i < loser.length; i++) {
            const letter = loser[i];
            const mesh = this.contents.spritesheetLoader.getMesh(letter, 1);
            mesh.position.set(loserPos.x - 2 + 0.6 * i, loserPos.y, 9.1);
            this.addMesh(mesh);
            this.variableMeshes.push(mesh);
        }
    }

    /**
     * Removes all variable meshes from the scene (those that are not part of the default menu)
     * Used for resets and restarts
     * @returns if no variable meshes exist
     */
    removeMeshes(){
        if (this.variableMeshes.length === 0) return;
        for (let mesh of this.variableMeshes){
            this.entity.remove(mesh);
            this.meshes.splice(this.meshes.indexOf(mesh), 1);
            mesh.geometry.dispose();
        }
        this.variableMeshes = [];
    }

    /**
     * Tells the Final Menu how to act depending on the state of the game.
     * @param {State} state
     */
    updateState(state){
        switch(state){
            case State.SETUP_END_OF_RACE:
                this.build(this.contents.homeMenu.name, this.contents.game.getWinnerPlayer(), this.contents.game.raceTime.toFixed(2).toString());
                this.display(true);
                break;
            case State.RESET:
                this.removeMeshes();
                this.display(false);
                break;
            case State.RESTART:
                this.removeMeshes();
                this.display(false);
                break;
        }
    }
}

export { MyFinalMenu };