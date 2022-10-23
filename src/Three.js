import * as THREE from 'three';
import { OrbitControls, MapControls } from "three/examples/jsm/controls/OrbitControls";
// import { ConvexObjectBreaker } from 'three/examples/jsm/misc/ConvexObjectBreaker';
import FPVControls from './FPVControls'
export default class Three {
    scene;
    camera;
    renderer;
    clock;
    ambientLight;
    directionalLight;
    controls;
    FPVControls

    constructor(initResolve) {
        this.init();

        console.log('THREE INITIALIZED');
        initResolve()

    }

    init() {
        this.initGraphicsUniverse()
        this.initUiScene()


        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }


    onWindowResize() {
console.log(this.camera);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }


    fullScreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitrequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullscreen) {
            element.mozRequestFullScreen();
        }
    }
    initUiScene() {
        // let asp = window.innerWidth / window.innerHeight
        // this.uiScene = new THREE.Scene()
        // this.uiCamera= new THREE.OrthographicCamera(1,1,1*asp,-1*asp,1,1000)

        // let cross = (new THREE.TextureLoader()).load('./crosshair.png')
        // cross.anisotropy = 10000;
        // let sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: cross, color: 0x000000}))
        // sprite.position.set(0,0,-10)
        // this.uiScene.add(sprite)
    }
    initGraphicsUniverse() {
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(-25, 20, -25);
        this.camera.lookAt(new THREE.Vector3(0, 6, 0));

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight(0xfff, 0.8);
        this.scene.add(this.ambientLight);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(-1, 0.9, 0.4);
        this.scene.add(this.directionalLight);




        this.controls = new FPVControls(this.camera)


        //         var html = document.documentElement;s
        // this.fullScreen(html);

        // this.controls = this.FPVControls.createControls(this.camera, this.renderer.domElement);
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls = new MapControls(this.camera, this.renderer.domElement);

    }



    createCube({ scale, position, quaternion, color }) {

        // ------ Graphics Universe - Three.JS ------
        let vectorScale = new THREE.Vector3(scale[0], scale[1], scale[2])
        let vectorPosition = new THREE.Vector3(position[0], position[1], position[2])

        let newcube = new THREE.Mesh(new THREE.BoxBufferGeometry(vectorScale.x, vectorScale.y, vectorScale.z), new THREE.MeshPhongMaterial({ color: color }));
        newcube.position.copy(vectorPosition);
        newcube.quaternion.copy(quaternion);
        newcube.castShadow = false;
        this.scene.add(newcube);



        return newcube;
    }


    createBall({ radius, position, color }) {

        // ------ Graphics Universe - Three.JS ------

        let vectorPosition = new THREE.Vector3(position[0], position[1], position[2])
        let newball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({ color: color }));
        newball.position.copy(vectorPosition);
        newball.castShadow = false;
        this.scene.add(newball);
        return newball;
    }


    render(deltaTime) {
        this.controls.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

}