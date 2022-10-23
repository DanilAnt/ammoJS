// import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import * as THREE from 'three';
import JoyStick from './assets/JoyStick';

export default class FPVControls {
    controls
    velocity = 0.05
    _target = new THREE.Vector3();
    _lookDirection = new THREE.Vector3();
    _spherical = new THREE.Spherical();
    lat = 0;
    lon = 0;
    state = {
        front: false,
        back: false,
        left: false,
        right: false,

    }
    JoyStickMove
    JoyStickLook
    joyStickLookCoords = { x: 0, y: 0 }
    rotateAt = { x: 0, y: 0 };


    constructor(camera) {

        this.rotation = new THREE.Quaternion();
        this.translation = new THREE.Vector3(0, 1, 0);
        this.phi = 0;
        this.phiSpeed = 8;
        this.theta = 0;
        this.thetaSpeed_ = 5;

        this.camera = camera;
        // this.camera.lookAt = this.lookAt.bind(this)
        this.init()
        console.log({ camera });
    }

    init() {

        if (this.mobileCheck()) {
            alert('desktop')
            document.addEventListener('keydown', (e) => { this.keydownHandler(e) })
            document.addEventListener('keyup', (e) => { this.keyupHandler(e) })





            document.addEventListener('mousemove', (e) => { this.mousemoveHandler(e) })


            this.hideCursor()

        } else {
            alert('mobile')
            this.initJoysticks()
        }





        // setInterval(() => {this.camera.rotation.y += 0.1}, 10)
    }


    hideCursor() {
        document.addEventListener("click", () => {
            document.body.requestPointerLock();
        });

    }

    initJoysticks() {
        this.JoyStickMove = new JoyStick('joyDiv_move', {}, () => {
            let dir = this.JoyStickMove.GetDir()
            // N, NE, E, SE, S, SW, W, NW  C
            let dirArr = dir.split('')
            dirArr.forEach(i => {
                switch (i) {
                    case 'N':
                        this.state.back = false;
                        this.state.front = true;
                        break;
                    case 'S':
                        this.state.front = false;
                        this.state.back = true;
                        break;

                    case 'E':
                        this.state.left = false;
                        this.state.right = true;
                        break;
                    case 'W':
                        this.state.right = false;
                        this.state.left = true;
                        break;
                    case 'C':
                        this.state.right = false;
                        this.state.left = false;
                        this.state.back = false;
                        this.state.front = false;
                        break;
                }
            })

        })


        this.JoyStickLook = new JoyStick('joyDiv_look', {})
        setInterval(() => {

            let x = +this.JoyStickLook.GetX()
            let y = +this.JoyStickLook.GetY()
            // console.log(x, y)
            this.rotateAt.x += x / 20
            this.rotateAt.y += -y / 20
        })

    }

    mobileCheck() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        } else {
            return false;
        }
    }


    update(deltaTime) {




        if (this.state.front) {

            const idealOffset = new THREE.Vector3(0, 0, -this.velocity * deltaTime);

            idealOffset.applyEuler(this.camera.rotation);

            idealOffset.add(this.camera.position);

            this.camera.position.copy(idealOffset);
        }
        if (this.state.back) {
            const idealOffset = new THREE.Vector3(0, 0, this.velocity * deltaTime);

            idealOffset.applyEuler(this.camera.rotation);

            idealOffset.add(this.camera.position);

            this.camera.position.copy(idealOffset);
        }
        if (this.state.left) {
            const idealOffset = new THREE.Vector3(-this.velocity * deltaTime, 0, 0);

            idealOffset.applyEuler(this.camera.rotation);

            idealOffset.add(this.camera.position);

            this.camera.position.copy(idealOffset);
        }
        if (this.state.right) {
            const idealOffset = new THREE.Vector3(this.velocity * deltaTime, 0, 0);

            idealOffset.applyEuler(this.camera.rotation);

            idealOffset.add(this.camera.position);

            this.camera.position.copy(idealOffset);
        }


        const xh = this.rotateAt.x * 0.01
        const yh = this.rotateAt.y * 0.01

        this.phi += -xh
        this.theta = this.clamp(this.theta + -yh, -Math.PI / 2.2, Math.PI / 2.2);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this.rotation.copy(q);
        this.camera.quaternion.copy(this.rotation);





        this.rotateAt.x = 0;
        this.rotateAt.y = 0;

    }


    clamp(x, a, b) {
        return Math.min(Math.max(x, a), b);
    }

    keydownHandler(e) {

        switch (e.keyCode) {
            case 87:
                this.state.front = true;
                break;
            case 83:
                this.state.back = true;
                break;
            case 65: this.state.left = true;
                break;
            case 68: this.state.right = true;
                break;


        }

    }
    keyupHandler(e) {
        switch (e.keyCode) {
            case 87:
                this.state.front = false;
                break;
            case 83:
                this.state.back = false;
                break;
            case 65: this.state.left = false;
                break;
            case 68: this.state.right = false;
                break;


        }
    }
    mousemoveHandler(e) {

        this.rotateAt.x = e.movementX;
        this.rotateAt.y = e.movementY;
    }
}