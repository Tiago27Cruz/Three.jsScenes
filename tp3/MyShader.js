import * as THREE from 'three';

class MyShader{
    constructor(contents, vert_url, frag_url, uniformValues = null, transparent = false) {
        this.contents = contents
        this.uniformValues = uniformValues
        this.material = null
        this.vert_url = vert_url;
        this.frag_url = frag_url;
        this.transparent = transparent
        this.read(vert_url, true)
        this.read(frag_url, false)
        this.ready = false
    }

    updateUniformsValue(key, value) {
        if (this.uniformValues[key]=== null || this.uniformValues[key] === undefined) {
            console.error("shader does not have uniform " + key)
            return;
        }
        this.uniformValues[key].value = value
        if (this.material !== null) {
            this.material.uniforms[key].value = value
            this.material.needsUpdate = true
        }
    }

    read(theUrl, isVertex) {
        let xmlhttp = null
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp=new XMLHttpRequest();
        }
        else {// code for IE6, IE5
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        let obj = this
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                
                if (isVertex) {  
                    obj.vertexShader = xmlhttp.responseText 
                }
                else { 
                    obj.fragmentShader = xmlhttp.responseText
                }
                obj.buildShader.bind(obj)()
            }
        }
        xmlhttp.open("GET", theUrl, true)
        xmlhttp.send()
    }

    buildShader() {
        // are both resources loaded? 
        if (this.vertexShader !== undefined && this.fragmentShader !== undefined) {
            // build the shader material
            this.material = new THREE.ShaderMaterial({
                // load uniforms, if any
                uniforms: (this.uniformValues !== null ? this.uniformValues : {}),
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader,
                transparent: this.transparent
            }) 
            // report built!
            this.ready = true
        }
    }

    hasUniform(key) {
        return this.uniformValues[key] !== undefined
    }

    update(){
        if (this.hasUniform("timeFactor")) {
            this.updateUniformsValue("timeFactor", this.contents.clock.getElapsedTime());
        }
        if(this.hasUniform("depthSample")){
            this.updateUniformsValue("depthSample", this.contents.app.renderTarget.depthTexture);
        }
        if(this.hasUniform("frameSample")){
            this.updateUniformsValue("frameSample", this.contents.app.renderTarget.texture);
        }
    }
}

export { MyShader };