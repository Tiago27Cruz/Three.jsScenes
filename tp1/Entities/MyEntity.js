import * as THREE from 'three';

class MyEntity{
    /**
     * Constructor
     * @param {MyContents} contents
     * @param {string} name
     * @param {MyEntity} parent
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     * @param {Object} primitive - Object with the primitive to be loaded (e.g. cylinder, box, etc. with the parameters ready)
     * @param {THREE.Material} material 
     * @param {THREE.Texture} texture 
     * @param {Boolean} isBase - If the entity is an object and part of a different entity (e.g platform is part of the fireplace)
     * @param {Boolean} addFolder - If a folder should be added to the GUI
     * @param {Boolean} canCastShadows - If the entity should be able to cast shadows
     * @param {Boolean} isDecoration - If the entity is a lego decoration (e.g. newspaper)
     */
    constructor(contents, name = "Entity", parent = null, width = 1, depth = 1, height = 1, primitive = null, material = null, texture = null, isBase = false, addFolder = true, canCastShadows = true, isDecoration = false){
        this.contents = contents;
        let entityNameQuery = name;
        
        let parentChildren;
        // If the entity has no entity as parent, we get it's siblings from the root of the scene
        if(parent === null) parentChildren = this.contents.app.gui.children;
        // Get siblings
        else parentChildren = parent.children;

        // If the name is already taken, we add a number to it
        let count = 1;
        while(parentChildren.has(entityNameQuery)){
            entityNameQuery = name + count;
            count += 1;
        }

        this.name = entityNameQuery;
        this.parent = parent;
        this.width = width;
        this.depth = depth;
        this.height = height;
        this.canCastShadows = canCastShadows;
        this.group = null;
        this.castShadow = false;
        this.receiveShadow = false;
        this.isDecoration = isDecoration;
        this.isNurbs = false;

        this.enabled = true;
        

        // If it's not a new entity, we create a group and create a map to store the children
        if(primitive === null) {
            this.group = new THREE.Group();
            this.children = new Map();
        
        }
        else if(primitive !== null && material !== null){ 
            this.primitive = this.contents.loadPrimitive(primitive);
            this.mesh = new THREE.Mesh(this.primitive, material);
            // Scale the mesh to the desired size
            this.mesh.scale.set(this.width, this.height, this.depth); 
        }

        this.material = material;
        this.texture = texture;
        if(this.material !== null && this.texture !== null) this.material.map = texture;

        if(isBase) {
            this.init(this, addFolder);
        }
        this.addToScene();


    }

    /**
     * Default initializer for all entities.
     * @param {MyEntity} entity 
     * @param {Boolean} addFolder 
     */
    init(entity, addFolder = true){
        // If the entity has no parent, we add it to the children of the GUI, otherwise we add it to the parent's children
        if(this.parent === null) this.contents.app.gui.children.set(this.name, entity);
        else this.parent.children.set(this.name, entity);

        // Adds a folder to the GUI with the name of the entity
        if(addFolder) {
            this.folder = this.contents.app.gui.addFolder(entity);
            this.folder.close()
        }

    }

    /**
     * Updates the texture of the entity
     * @param {Number} u 
     * @param {Number} v 
     * @param {Number} rotation 
     * @param {THREE.Wrapping} wrapS 
     * @param {THREE.Wrapping} wrapT 
     * @param {THREE.Vector2} offset 
     */
    updateTexture(u = 1, v = 1, rotation = 0, wrapS = THREE.RepeatWrapping, wrapT = THREE.RepeatWrapping, offset = new THREE.Vector2(0, 0)){
        if(this.material !== null){
            this.texture.needsUpdate = true;
            this.texture.wrapS = wrapS;
            this.texture.wrapT = wrapT;
            this.texture.repeat.set(u, v);
            this.texture.rotation = rotation;

        }
    }


    /**
     * Adds the entity to the scene
     */
    addToScene(){
        // If the entity has no parent, we add it to the scene, otherwise we add it to the parent's group
        if(this.parent === null){
            // If it's a single mesh, add it to the scene, otherwise add the group
            if(this.group === null)
                this.contents.app.scene.add(this.mesh);
            else{
                this.contents.app.scene.add(this.group);
            }
        }
        else{
            if(this.group === null)
                this.parent.group.add(this.mesh);
            else
                this.parent.group.add(this.group);
        }
    }

    /**
     * Removes the entity from the scene
     */
    removeFromScene(){
        this.enabled = false;
        // If the entity has no parent, we remove it from the scene, otherwise we remove it from the parent's group
        if(this.parent === null){
            if(this.group === null)
                this.contents.app.scene.remove(this.mesh);
            else{
                this.contents.app.scene.remove(this.group);
            }
        }
        else{
            if(this.group === null) this.parent.group.remove(this.mesh);
            else this.parent.group.remove(this.group);
        }
    }

    /**
     * Returns a lego from the parent legos entity
     * @param {Number} x 
     * @param {Number} z 
     * @returns {MyEntity} - Lego entity if found, null otherwise
     */
    getLego(x, z){
        if(this.name == "Legos" && this.info !== undefined && x < this.info[0] && z < this.info[1]){
            const lego_id = x * this.info[1] + z + 1;
            if(this.children.has("Lego" + lego_id)) return this.children.get("Lego" + lego_id);
        }
        return null;
    }

    /**
     * Removes a lego from the scene
     * @param {Number} x 
     * @param {Number} y 
     */
    removeLego(x, y){
        if(this.name == "Legos" && this.info !== undefined){
            const lego = this.getLego(x, y);
            if(lego !== null){
                lego.removeFromScene();
            }
        }
    }

    /**
     * Adds a lego to the scene
     * @param {Number} x 
     * @param {Number} y 
     */
    addLego(x, y){
        if(this.name == "Legos" && this.info !== undefined){
            const lego = this.getLego(x, y);
            if(lego !== null){
                lego.addToScene();
            }
        }
    }

    /**
     * Gets the middle lego of the parent legos entity
     * @returns {MyEntity} - Returns the middle lego of the parent legos entity
     */
    getMiddleLego(){
        return this.getLego(Math.floor((this.info[0]-1)/2), Math.floor((this.info[1]-1)/2));
    }

    /**
     * Adds shadows to the entity
     * @param {Boolean} receive - If the entity should receive shadows 
     * @param {Boolean} cast - If the entity should cast shadows
     */
    addShadows(receive=true, cast=true) {
        if(this.group === null){ // If it's a mesh, we can add shadows directly
            if (cast && this.canCastShadows){ // Since there are some entities that shouldn't cast shadows, we check if it's allowed
                this.mesh.castShadow = true;
                this.castShadow = true;
            } 
            if (receive && !this.isNurbs) {   // dont allow nurbs surfaces to receive shadows
                this.mesh.receiveShadow = true;
                this.receiveShadow = true;
            }
            
        }
        else{ // If it's a group, we need to add shadows to all children
            if(cast) this.castShadow = true;
            if(receive) this.receiveShadow = true;
            for (const child of this.children.values()) {
                child.addShadows(receive, cast);
            }
        }
    }

    /**
     * Removes shadows from the entity
     * @param {Boolean} receive - If the entity should stop receiving shadows
     * @param {Boolean} cast - If the entity should stop casting shadows
     */
    removeShadows(receive=true, cast=true) {
        if(this.group === null){  // If it's a mesh, we can remove the shadows directly
            if (cast){
                this.mesh.castShadow = false;
                this.castShadow = false;
            }
            if (receive) {
                this.mesh.receiveShadow = false;
                this.receiveShadow = false;
            }
        }
        else{
            if(cast) this.castShadow = false;
            if(receive) this.receiveShadow = false;
            for (const child of this.children.values()) {
                child.removeShadows(receive, cast);
            }
        }
    }


    /**
     * Moves the entity to the specified position in coordinates x, y and z
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    moveTo(x = null, y = null, z = null){
        if(this.group === null) {
            if(x !== null) this.mesh.position.x = x;
            if(y !== null) this.mesh.position.y = y;
            if(z !== null) this.mesh.position.z = z;
        }
        else {
            if(x !== null) this.group.position.x = x;
            if(y !== null) this.group.position.y = y;
            if(z !== null) this.group.position.z = z;
        }
    }

    /**
     * Moves an entity to the position of another entity
     * @param {MyEntity} entity 
     */
    moveToEntity(entity){
        if(this.group === null){
            if(entity.group === null) {
                // Moving a mesh to another mesh
                this.mesh.position.x = entity.mesh.position.x;
                this.mesh.position.y = entity.mesh.position.y;
                this.mesh.position.z = entity.mesh.position.z;
            }
            else {
                // Moving a mesh to a group
                this.mesh.position.x = entity.group.position.x;
                this.mesh.position.y = entity.group.position.y;
                this.mesh.position.z = entity.group.position.z;
            }
        }
        else{
            if(entity.group === null) {
                // Moving a group to a mesh
                this.group.position.x = entity.mesh.position.x
                this.group.position.y = entity.mesh.position.y;
                this.group.position.z = entity.mesh.position.z;
            }
            else {
                // Moving a group to another group
                this.group.position.x = entity.group.position.x
                this.group.position.y = entity.group.position.y;
                this.group.position.z = entity.group.position.z;
                /*for (const child of this.children.values()) {
                    child.move(x, y, z);
                }*/
            }
        }
    }

    /**
     * Moves the entity in the x, y and z axis by adding the values provided instead of replacing
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    move(x = null, y = null, z = null){
        // Moves either the group or the single mesh
        if(this.group === null) {
            if(x !== null)this.mesh.position.x += x;
            if(y !== null)this.mesh.position.y += y;
            if(z !== null)this.mesh.position.z += z;
        }
        else{
            if(x !== null)this.group.position.x += x;
            if(y !== null)this.group.position.y += y;
            if(z !== null)this.group.position.z += z;
            /*for (const child of this.children.values()) {
                child.move(x, y, z);
            }*/
        }
    }

    /**
     * Scales the entity to the specified values in the x, y and z axis by scaling the meshes or the group itself
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     * @param {Boolean} scaleGroup - If the group should be scaled at once instead of the single mesh
     */
    scaleTo(x = null, y = null, z = null, scaleGroup = false){
        if(this.group === null){
            if(x !== null)this.mesh.scale.x = x;
            if(y !== null)this.mesh.scale.y = y;
            if(z !== null)this.mesh.scale.z = z;
        }
        else{
            if(scaleGroup){
                if(x !== null)this.group.scale.x = x;
                if(y !== null)this.group.scale.y = y;
                if(z !== null)this.group.scale.z = z;
            } else {
                for (const child of this.children.values()) {
                    child.scaleTo(x, y, z);
                }
            }
            
        }
    }

    /**
     * Rotates the entity to the specified values in the x, y and z axis
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    rotateTo(x = null, y = null, z = null){
        if(this.group === null){
            if(x != null)this.mesh.rotation.x = x;
            if(y != null)this.mesh.rotation.y = y;
            if(z != null)this.mesh.rotation.z = z;
        }
        else{
            if(x != null)this.group.rotation.x = x;
            if(y != null)this.group.rotation.y = y;
            if(z != null)this.group.rotation.z = z;
        }
    }

    /**
     * Adds rotation to the entity in the x, y and z axis
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    rotate(x = null, y = null, z = null){
        if(this.group === null){
            if(x != null)this.mesh.rotation.x += x;
            if(y != null)this.mesh.rotation.y += y;
            if(z != null)this.mesh.rotation.z += z;
        }
        else{
            if(x != null)this.group.rotation.x += x;
            if(y != null)this.group.rotation.y += y;
            if(z != null)this.group.rotation.z += z;
        }
    }

    /**
     * Updates the color of a mesh or of a group of meshes
     * @param {String} color 
     * @param {String} specular 
     * @param {Number} shininess 
     * @param {String} emissive
     * @param {Number} emissiveIntensity
     */
    updateColor(color = null, specular = null, shininess = null, emissive = null, emissiveIntensity = null){
        if(this.material !== null){
            if(color !== null)this.material.color.set(color);
            if(specular !== null)this.material.specular.set(specular);
            if(shininess !== null)this.material.shininess = shininess;
            if(emissive !== null)this.material.emissive.set(emissive);
            if(emissiveIntensity !== null)this.material.emissiveIntensity = emissiveIntensity;
            return
        }

        
    }


    /**
     * Default GUI for all entities. Adds an option to enable/disable the entity to their folder and closes it.
     */
    initGui(){
        this.folder.add(this, 'enabled').name("enabled").onChange((value) => {
            if(value) this.addToScene();
            else this.removeFromScene();
        });

        this.folder.close();
    }

    /**
     * Adds to the folder an option for changing the color of the entity. Uses the default constructor values if not provided.
     * @param {String} initialColor 
     * @param {String} initialSpecular 
     * @param {Number} initialShininess 
     */
    initGuiColor(initialColor = '#00ffff', initialSpecular = '#777777', initialShininess = 30){
        let colorFolder = this.folder.addFolder("Color");

        //this.updateColor(initialColor, initialSpecular, initialShininess);
        if(this.material !== null){
            initialColor = this.material.color.getHex();
            initialSpecular = this.material.specular.getHex();
            initialShininess = this.material.shininess;
        }


        colorFolder.addColor({'color':initialColor}, 'color').onChange((value)=>{
            this.updateColor(value, null, null);
        });
        colorFolder.addColor({'specular':initialSpecular}, 'specular').onChange((value)=>{
            this.updateColor(null, value, null);
        });
        colorFolder.add({'shininess':initialShininess}, 'shininess', 0, 100).onChange((value)=>{
            this.updateColor(null, null, value);
        });

        colorFolder.close();
    }

    /**
     * Initializes the gui for changing the color of n different materials - Assumes the materials have the same colors initially
     * @param {THREE.Material[]} materials 
     */
    initGuiColorMaterials(materials){
        let colorFolder = this.folder.addFolder("Color");
        colorFolder.close();
        
        colorFolder.addColor({'color':materials[0].color.getHex()}, 'color').onChange((value)=>{
            for(const material of materials){
                material.color.set(value);
            }
        });
        colorFolder.addColor({'specular':materials[0].specular.getHex()}, 'specular').onChange((value)=>{
            for(const material of materials){
                material.specular.set(value);
            }
        });
        colorFolder.add({'shininess':materials[0].shininess}, 'shininess', 0, 100).onChange((value)=>{
            for(const material of materials){
                material.shininess = value;
            }
        });
    }

    /**
     * Adds to the folder an option for moving the entity in the x, y and/or z axis. By default all axis are enabled.
     * @param {Boolean} enableX 
     * @param {Boolean} enableY 
     * @param {Boolean} enableZ 
     * @param {Number[][]} limit - Array with the minimum and maximum values for the x, y and z axis
     */
    initGuiMoveTo(enableX = true, enableY = true, enableZ = true, limit=[[-10,-10,-10],[10,10,10]]){
        let moveFolder = this.folder.addFolder("Move To");

        // If it's a single mesh, move only the itself, otherwise move the group at once
        if(this.group === null){
            if(enableX)moveFolder.add(this.mesh.position, 'x', limit[0][0], limit[1][0]);
            if(enableY)moveFolder.add(this.mesh.position, 'y', limit[0][1], limit[1][1]);
            if(enableZ)moveFolder.add(this.mesh.position, 'z', limit[0][2], limit[1][2]);
        }
        else{
            if(enableX)moveFolder.add(this.group.position, 'x', limit[0][0], limit[1][0]);
            if(enableY)moveFolder.add(this.group.position, 'y', limit[0][1], limit[1][1]);
            if(enableZ)moveFolder.add(this.group.position, 'z', limit[0][2], limit[1][2]);
        }

        moveFolder.close();
    }

    /**
     * Adds to the folder an option for moving the entity in the x, y and/or z axis, but by adding to it's value instead of changing. By default all axis are enabled.
     * @param {Boolean} enableX 
     * @param {Boolean} enableY 
     * @param {Boolean} enableZ 
     * @param {Number[][]} limit - Array with the minimum and maximum values for the x, y and z axis
     */
    initGuiMove(enableX = true, enableY = true, enableZ = true, limit=[[-10,-10,-10],[10,10,10]]){
        let moveFolder = this.folder.addFolder("Move");

        // If it's a single mesh, move only the itself, otherwise move the group at once
        if(this.group === null){
            if(enableX) moveFolder.add(this.mesh.position, 'x', limit[0][0], limit[1][0]).onChange((value)=>{
                this.move(value, null, null);
            });
            if(enableY) moveFolder.add(this.mesh.position, 'y', limit[0][1], limit[1][1]).onChange((value)=>{
                this.move(null, value, null);
            });
            if(enableZ) moveFolder.add(this.mesh.position, 'z', limit[0][2], limit[1][2]).onChange((value)=>{
                this.move(null, null, value);
            });
        }
        else{
            if(enableX) moveFolder.add(this.group.position, 'x', limit[0][0], limit[1][0]).onChange((value)=>{
                this.move(value, null, null);
            });
            if(enableY) moveFolder.add(this.group.position, 'y', limit[0][1], limit[1][1]).onChange((value)=>{
                this.move(null, value, null);
            });
            if(enableZ) moveFolder.add(this.group.position, 'z', limit[0][2], limit[1][2]).onChange((value)=>{
                this.move(null, null, value);
            });
        }
        
        moveFolder.close();
    }

    /**
     * Initializes the GUI elements related to moving an entity to a specific lego
     */
    initGuiMoveToLego(){
        let moveLegoFolder = this.folder.addFolder("Move to Lego");

        const floor_width = this.parent_legos.info[0];
        const floor_depth = this.parent_legos.info[1];


        this.prev_x = this.lego.x;
        this.prev_z = this.lego.z;


        this.moveToXLegoController = moveLegoFolder.add(this, 'prev_x', 0, floor_width-1).name('x').step(1).onChange((value)=>{
            if(!this.isDecoration)this.lego.addToScene();
            this.lego = this.parent_legos.getLego(value, this.lego.z);
            this.moveToEntity(this.lego);
            if(!this.isDecoration){
                this.move(0, -this.contents.lego_height/2);
                this.lego.removeFromScene();
            }
        })

        this.moveToZLegoController = moveLegoFolder.add(this, 'prev_z', 0, floor_depth-1).name('z').step(1).onChange((value)=>{
            if(!this.isDecoration)this.lego.addToScene();
            this.lego = this.parent_legos.getLego(this.lego.x, value);
            this.moveToEntity(this.lego);
            if(!this.isDecoration){
                this.move(0, -this.contents.lego_height/2);
                this.lego.removeFromScene();
            }
        })

        moveLegoFolder.close();
    }

    /**
     * Updates the GUI controller so that the results are displayed in real time
     * @param {object} controller
     * @param {Number} min
     * @param {Number} max
     */
    updateControllerRange(controller, min, max){
        controller.min(min).max(max);
        controller.updateDisplay();
    }

    /**
     * Adds to the folder an option for scaling the entity in the x, y and/or z axis. By default all axis are enabled.
     * @param {Boolean} enableX 
     * @param {Boolean} enableY 
     * @param {Boolean} enableZ 
     * @param {Boolean} scaleSize - If the entity should be scaled uniformly
     * @param {Boolean} circle - If the entity should be scaled as a circle
     */
    initGuiScale(enableX = true, enableY = true, enableZ = true, scaleSize = false, circle = false){
        let scaleFolder = this.folder.addFolder("Scale");
        scaleFolder.close();

        if(scaleSize){
            if(this.group === null){
                const scaleX = this.mesh.scale.x;
                scaleFolder.add(this.mesh.scale, 'x', 0.1, scaleX*3).name("size").onChange((value) => {
                    if(enableX) this.mesh.scale.x = value;
                    if(enableY) this.mesh.scale.y = value;
                    if(enableZ) this.mesh.scale.z = value;
                });
            } else {
                const scaleX = this.group.scale.x;
                scaleFolder.add(this.group.scale, 'x', 0.1, scaleX*3).name("size").onChange((value) => {
                    if(enableX) this.group.scale.x = value;
                    if(enableY) this.group.scale.y = value;
                    if(enableZ) this.group.scale.z = value;
                });
            }
        }
        else{
            if(this.group === null){
                const scaleX = this.mesh.scale.x;
                if(enableX) scaleFolder.add(this.mesh.scale, 'x', 0.1, scaleX*3).name("width")
                const scaleY = this.mesh.scale.y;
                if(enableY) scaleFolder.add(this.mesh.scale, 'y', 0.1, scaleY*3).name("height")
                const scaleZ = this.mesh.scale.z;
                if(enableZ) scaleFolder.add(this.mesh.scale, 'z', 0.1, scaleZ*3).name("depth")
                if(circle) scaleFolder.add(this.mesh.scale, 'x', 0.1, scaleX*3).name("radius").onChange((value) => {
                    this.mesh.scale.x = value;
                    this.mesh.scale.z = value;
                });
            } else {
                const scaleX = this.group.scale.x;
                if(enableX) scaleFolder.add(this.group.scale, 'x', 0.1, scaleX*3).name("width")
                const scaleY = this.group.scale.y;
                if(enableY) scaleFolder.add(this.group.scale, 'y', 0.1, scaleY*3).name("height")
                const scaleZ = this.group.scale.z;
                if(enableZ) scaleFolder.add(this.group.scale, 'z', 0.1, scaleZ*3).name("depth")
                if(circle) scaleFolder.add(this.group.scale, 'x', 0.1, scaleX*3).name("radius").onChange((value) => {
                    this.group.scale.x = value;
                    this.group.scale.z = value;
                });
            }

        }
    }

    /**
     * Adds to the folder an option for changing different texture properties.
     */
    initGuiTexture(texture = null){
        if (texture === null) texture = this.texture;

        let textureFolder = this.folder.addFolder("Texture");

        textureFolder.add(texture, 'wrapS', {
            Repeat: THREE.RepeatWrapping,
            Clamp: THREE.ClampToEdgeWrapping,
            'Mirror Repeat': THREE.MirroredRepeatWrapping
        }).name('Wrapping mode S').onChange(() => {
            texture.needsUpdate = true;
        });
        textureFolder.add(texture, 'wrapT', {
            Repeat: THREE.RepeatWrapping,
            Clamp: THREE.ClampToEdgeWrapping,
            'Mirror Repeat': THREE.MirroredRepeatWrapping
        }).name('Wrapping mode V').onChange(() => {
            texture.needsUpdate = true;
        });
        textureFolder.add(texture.repeat, 'x', 0, 50).name('Repeat U')
        textureFolder.add(texture.repeat, 'y', 0, 50).name('Repeat V')
        textureFolder.add(texture.offset, 'x', 0, 1).name('Offset U')
        textureFolder.add(texture.offset, 'y', 0, 1).name('Offset V')
        textureFolder.add(texture, 'rotation', 0, Math.PI * 2).name('Rotation')

        textureFolder.close();
    }

    /**
     * Initializes the GUI elements related to a light
     * @param {THREE.Light} light - Light to be controlled by the GUI
     * @param {MyEntity} bulb - Lightbulb associated with the light
     * @param {Boolean} canChangePosition - Flag to enable the position change of the light
     */
    initGuiLight(light, bulbMaterial = null, canChangePosition = false){
        let lightFolder = this.folder.addFolder("Light");
        const intensity = light.intensity;
        
        const proxy = { enabled: light.intensity > 0 };
        lightFolder.add(proxy, 'enabled').name("Enabled").onChange((value) => {
            if(value){
                light.intensity = intensity;
                if(bulbMaterial !== null) {
                    bulbMaterial.color.set(light.color);
                    bulbMaterial.emissiveIntensity = 1;
                    bulbMaterial.opacity = 1;
                }
            }
            else{
                light.intensity = 0;
                if(bulbMaterial !== null) {
                    bulbMaterial.color.set(0xffffff);
                    bulbMaterial.emissiveIntensity = 0;
                    bulbMaterial.opacity = 0.5;
                }
            }
        });
        lightFolder.addColor({'color':light.color.getHex()}, 'color').onChange((value)=>{
            light.color.set(value);
            // If there's a lightbulb material associated with the light, update it's color so it matches the light
            if(bulbMaterial !== null) bulbMaterial.color.set(value);
        });
        lightFolder.add(light, 'intensity', 0, 1000);
        lightFolder.add(light, 'distance', 0.1, 1000);
        lightFolder.add(light, 'castShadow').name('Cast Shadow').onChange(() => {
            if(this.mapSize === undefined) {
                this.mapSize = 4096;
                lightFolder.add(this, 'mapSize', [512, 1024, 2048, 4096]).name('Shadow Map Size').onChange((size) => {
                    light.shadow.mapSize.width = size
                    light.shadow.mapSize.height = size
                    // Restart the shadow map so it updates to the new values
                    light.shadow.map.dispose(); 
                    light.shadow.map = null;
                });
            }
        });

        // Only add the option to change mapsize if it exists
        if(this.mapSize !== undefined){
            lightFolder.add(this, 'mapSize', [512, 1024, 2048, 4096]).name('Shadow Map Size').onChange((size) => {
                light.shadow.mapSize.width = size
                light.shadow.mapSize.height = size
                // Restart the shadow map so it updates to the new values
                light.shadow.map.dispose(); 
                light.shadow.map = null;
            });
        }
        

        if(canChangePosition){
            lightFolder.add(light.position, 'x', -100, 100).name("Position x").step(0.1);
            lightFolder.add(light.position, 'y', -100, 100).name("Position y").step(0.1);
            lightFolder.add(light.position, 'z', -100, 100).name("Position z").step(0.1);
        }

        lightFolder.close();
    }

    /**
     * Initializes the GUI elements related to a shadow
     */
    initGuiShadow(){
        let shadowFolder = this.folder.addFolder("Shadow");

        shadowFolder.add(this, 'castShadow').name("Cast Shadow").onChange((value) => {
            if(value) this.addShadows(false, true);
            else this.removeShadows(false, true);
        });
        shadowFolder.add(this, 'receiveShadow').name("Receive Shadow").onChange((value) => {
            if(value) this.addShadows(true, false);
            else this.removeShadows(true, false);
        });

        shadowFolder.close();
    }

    /**
     * Initializes the GUI elements related to the rotation of an entity
     * @param {Boolean} enableX - If the entity can rotate in the x axis
     * @param {Boolean} enableY - If the entity can rotate in the y axis
     * @param {Boolean} enableZ - If the entity can rotate in the z axis
     */
    initGuiRotate(enableX = true, enableY = true, enableZ = true){
        let rotateFolder = this.folder.addFolder("Rotation");

        if(this.group === null){
            if(enableX) rotateFolder.add(this.mesh.rotation, 'x', -Math.PI*2, Math.PI*2).name("Rotate x").step(0.1);
            if(enableY)rotateFolder.add(this.mesh.rotation, 'y', -Math.PI*2, Math.PI*2).name("Rotate y").step(0.1);
            if(enableZ)rotateFolder.add(this.mesh.rotation, 'z', -Math.PI*2, Math.PI*2).name("Rotate z").step(0.1);
        } else {
            if(enableX)rotateFolder.add(this.group.rotation, 'x', -Math.PI*2, Math.PI*2).name("Rotate x").step(0.1);
            if(enableY)rotateFolder.add(this.group.rotation, 'y', -Math.PI*2, Math.PI*2).name("Rotate y").step(0.1);
            if(enableZ)rotateFolder.add(this.group.rotation, 'z', -Math.PI*2, Math.PI*2).name("Rotate z").step(0.1);
        }
        

        rotateFolder.close();
    }
}

export {MyEntity};
