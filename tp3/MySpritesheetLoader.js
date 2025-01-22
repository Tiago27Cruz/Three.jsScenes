import * as THREE from 'three';

/**
 * Class that will handle the loading of the spritesheet and the mapping of the letters to the corresponding UV coordinates.
 * Can be called from other classes to get the correct mesh for a given letter.
 */
class MySpritesheetLoader{
    /**
     * Loads the texture and maps the spritesheet.
     * @param {*} contents 
     */
    constructor(contents){
        this.contents = contents;

        this.texture = this.contents.loadTexture('spritesheet.png');
        this.texture.transparent = true;
        this.mapSpritesheet();
    }

    /**
     * Maps the spritesheet to the corresponding coordinates based on the position of the letter in the spritesheet.
     */
    mapSpritesheet(){
    
        this.spritesheet = {}
    
        this.spritesheet["a"] = [6, 1];
        this.spritesheet["b"] = [6, 2];
        this.spritesheet["c"] = [6, 3];
        this.spritesheet["d"] = [6, 4];
        this.spritesheet["e"] = [6, 5];
        this.spritesheet["f"] = [6, 6];
        this.spritesheet["g"] = [6, 7];
        this.spritesheet["h"] = [6, 8];
        this.spritesheet["i"] = [6, 9];
        this.spritesheet["j"] = [6, 10];
        this.spritesheet["k"] = [6, 11];
        this.spritesheet["l"] = [6, 12];
        this.spritesheet["m"] = [6, 13];
        this.spritesheet["n"] = [6, 14];
        this.spritesheet["o"] = [6, 15];
        this.spritesheet["p"] = [7, 0];
        this.spritesheet["q"] = [7, 1];
        this.spritesheet["r"] = [7, 2];
        this.spritesheet["s"] = [7, 3];
        this.spritesheet["t"] = [7, 4];
        this.spritesheet["u"] = [7, 5];
        this.spritesheet["v"] = [7, 6];
        this.spritesheet["w"] = [7, 7];
        this.spritesheet["x"] = [7, 8];
        this.spritesheet["y"] = [7, 9];
        this.spritesheet["z"] = [7, 10];
    
        this.spritesheet["A"] = [4, 1];
        this.spritesheet["B"] = [4, 2];
        this.spritesheet["C"] = [4, 3];
        this.spritesheet["D"] = [4, 4];
        this.spritesheet["E"] = [4, 5];
        this.spritesheet["F"] = [4, 6];
        this.spritesheet["G"] = [4, 7];
        this.spritesheet["H"] = [4, 8];
        this.spritesheet["I"] = [4, 9];
        this.spritesheet["J"] = [4, 10];
        this.spritesheet["K"] = [4, 11];
        this.spritesheet["L"] = [4, 12];
        this.spritesheet["M"] = [4, 13];
        this.spritesheet["N"] = [4, 14];
        this.spritesheet["O"] = [4, 15];
        this.spritesheet["P"] = [5, 0];
        this.spritesheet["Q"] = [5, 1];
        this.spritesheet["R"] = [5, 2];
        this.spritesheet["S"] = [5, 3];
        this.spritesheet["T"] = [5, 4];
        this.spritesheet["U"] = [5, 5];
        this.spritesheet["V"] = [5, 6];
        this.spritesheet["W"] = [5, 7];
        this.spritesheet["X"] = [5, 8];
        this.spritesheet["Y"] = [5, 9];
        this.spritesheet["Z"] = [5, 10];
    
        this.spritesheet[" "] = [2,0]
        this.spritesheet[":"] = [3, 10]
        this.spritesheet["."] = [2,14]
        this.spritesheet["/"] = [2, 15]
        this.spritesheet["-"] = [9, 6]
    
        this.spritesheet["0"] = [3, 0];
        this.spritesheet["1"] = [3, 1];
        this.spritesheet["2"] = [3, 2];
        this.spritesheet["3"] = [3, 3];
        this.spritesheet["4"] = [3, 4];
        this.spritesheet["5"] = [3, 5];
        this.spritesheet["6"] = [3, 6];
        this.spritesheet["7"] = [3, 7];
        this.spritesheet["8"] = [3, 8];
        this.spritesheet["9"] = [3, 9];
    }

    /**
     * Returns the UV coordinates of a given letter in the spritesheet in the format needed for a BufferAttribute.
     * @param {String} letter 
     * @returns 
     */
    getUVcoords(letter){
        const columns = 16
        const rows = 16

        const rowIndex = this.spritesheet[letter][0]
        const columnIndex = this.spritesheet[letter][1]

        const spriteWidth = 1/columns
        const spriteHeight = 1/rows

        const uStart = columnIndex * spriteWidth
        const vStart = 1 - (rowIndex + 1) * spriteHeight; 

        const uEnd = uStart + spriteWidth
        const vEnd = vStart + spriteHeight

        const coords = new Float32Array([
                        uStart, vEnd,
                        uEnd, vEnd,
                        uStart, vStart,
                        uEnd, vStart
                    ])

        return new THREE.BufferAttribute(coords, 2);
    }

    /**
     * GET function for the texture of the spritesheet
     * @returns Clone of the texture of the spritesheet.
     */
    getTexture(){
        return this.texture.clone();
    }
    
    /**
     * Prepares the material and geometry for a given letter and size, sets the UV coordinates and returns a mesh.
     * @param {String} letter 
     * @param {Number} size 
     * @returns THREE.Mesh
     */
    getMesh(letter, size){
        const material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(size, size);
        geometry.setAttribute('uv', this.getUVcoords(letter));
        return new THREE.Mesh(geometry, material);
    }
    
}

export { MySpritesheetLoader };