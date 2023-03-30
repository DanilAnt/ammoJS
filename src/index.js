import Three from "./Three";
import Ammo from './Ammo';
import * as THREE from 'three';
import './style.css'


class World {
    Three; Ammo;
    rigidBody_List = [];
    clocks;
    async init() {

        let initThreePromise = new Promise((resolve) => {
            this.Three = new Three(resolve);

        })
        await initThreePromise
        let initAmmoPromise = new Promise((resolve) => {
            this.Ammo = new Ammo(resolve, this.Three.scene, this.rigidBody_List);

        })

        await initAmmoPromise

        this.clocks = Date.now()
        console.log('ALL INITIALIZED');

        // document.body.onclick = () => { document.body.requestPointerLock() }


        this.blocksWallScene()

        this.render()
    }



    render() {
        try {
            let now = Date.now()

            let deltaTime = now - this.clocks
            this.clocks = now

            this.Ammo.updatePhysicsUniverse(deltaTime, this.rigidBody_List);

            this.Three.render(deltaTime);

            requestAnimationFrame(this.render.bind(this));
        } catch (e) {
            console.log({ e });
            requestAnimationFrame(this.render.bind(this));
        }

    }

    createCube(scale, position, mass, color, rot_quaternion) {

        let quaternion = undefined;
        if (rot_quaternion == null) {
            quaternion = { x: 0, y: 0, z: 0, w: 1 };
        }
        else {
            quaternion = rot_quaternion;
        }

        let newcube = this.Three.createCube({ scale, position, color, mass, quaternion });
        // this.rigidBody_List.push(newcube);
        this.Ammo.createCube({ scale, position, mass, quaternion, newcube });

        return newcube;
    }

    createBall(radius, position, mass, color, rot_quaternion, velocity = { x: 0, y: 0, z: 0 }) {

        let quaternion = undefined;
        if (rot_quaternion == null) {
            quaternion = { x: 0, y: 0, z: 0, w: 1 };
        }
        else {
            quaternion = rot_quaternion;
        }

        let newball = this.Three.createBall({ radius, position, color });
        // this.rigidBody_List.push(newball);
        this.Ammo.createBall({ radius, position, mass, quaternion, newball, velocity });

        return newball;
    }

    createJointObjects() {
        let pos1 = [15, 50, -1]
        let pos2 = [15, 45, -1]

        let radius = 2;
        let scale = [5, 2, 2];
        // let quat = {x: 0, y: 0, z: 0, w: 1};
        let mass1 = 1;
        let mass2 = 1;


        let body1 = this.createCube(scale, pos1, mass1, 0xc0392b, null)
        let body2 = this.createBall(radius, pos2, mass2, 0xc0392b, null)

        let blockPivot = [- scale[0] * 0.5, 1, 1]
        let spherePivot = [radius, 0, 0]
        this.Ammo.createJoin(body1.userData.physicsBody, body2.userData.physicsBody, blockPivot, spherePivot)



    }


    blocksWallScene() {

        // floor
        this.createCube([50, 2, 90], [15, -5, 30], 0, 0x2c3e50, null)

        //trampline

        this.createCube([8, 1, 15], [15, 0, 0], 0, 0xffffff, { x: 0.383, y: 0, z: 0, w: 0.924 });


        // wall of blocks

        for (let z = 30; z > 10; z -= 7) {
            for (let j = 0; j <= 22; j += 7.1) {
                for (let i = 6; i < 21 + 6; i += 7.1) {
                    this.createCube([7, 7, 7], [i, j, z], 100, '#' + ((1 << 24) * Math.random() | 0).toString(16), null);

                }
            }
        }

        // this.createJointObjects()

        document.addEventListener('dblclick', (e) => { this.troughBall(e) })
        let btn = document.getElementById('btnShoot')
        btn.addEventListener('click',  (e) => { this.troughBall(e)})
        // follenBall (to fall press space)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.createBall(1, [15, 100, 21], 100, 0xc0392b, null);
            }
        })
    }
    troughBall() {
        let scalarVelocity = 100;
        let velocity = (new THREE.Vector3(0, 0, -1))
        // .copy(this.Three.controls.camera.rotation)
        let pos = (new THREE.Vector3).copy(this.Three.controls.camera.position)
        let q = new THREE.Quaternion()

        q.copy(this.Three.controls.camera.quaternion)

        velocity.applyQuaternion(q)

        velocity.multiplyScalar(scalarVelocity)

        this.createBall(0.1, [pos.x, pos.y, pos.z], 100, 0xc0392b, null, velocity);

    }
    cubesFall() {
        this.createCube([600, 600, 600], [0, -300, 0], 0);
        setInterval(() => {
            let scale = Math.random() * 10
            this.createCube([scale, scale, scale], [Math.random() * 10, 200, Math.random() * 10], scale * scale * scale * 0.01)

        }, 1000)
    }
}

(new World()).init()