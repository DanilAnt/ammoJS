
// require('./ammo')
import * as AMMO from './assets/ammo';
import * as THREE from 'three';
import { ConvexObjectBreaker } from 'three/examples/jsm/misc/ConvexObjectBreaker';

export default class Ammo {
    Ammo;
    physicsUniverse;
    collisionConfiguration;
    dispatcher;
    overlappingPairCache;
    solver;
    tmpTransformation;

    threeScene
    rigidBody_List;
    convexBreaker = new ConvexObjectBreaker();
    numObjectsToRemove = 0;
    objectsToRemove = [];
    transformAux1;
    tempBtVec3_1;
    margin = 0.05
    impactPoint = new THREE.Vector3();
    impactNormal = new THREE.Vector3();

    constructor(initResolve, threeScene, rigidBody_List) {
        this.threeScene = threeScene;
        this.rigidBody_List = rigidBody_List
        this.init().then(() => { console.log('AMMO INITIALIZED'); initResolve() })
    }

    async init() {
        this.Ammo = await AMMO()

        this.initPhysicsUniverse()
        this.initGravityController()



        
    }

    initGravityController() {

        let input = document.getElementById('gravityInput')
        let span = document.getElementById('gravityValue')
        if (input && span) {
           
            input.addEventListener('change', (e) => {
                let value = +input.value;
                if (Number.isFinite(value)) {
                    console.log(value);
                    this.physicsUniverse.setGravity(new this.Ammo.btVector3(0, -value, 0));
                }
            })
        } else {

            setTimeout(() => { this.initGravityController }, 200)
        }


    }

    initPhysicsUniverse() {
        this.tmpTransformation = new this.Ammo.btTransform();

        this.collisionConfiguration = new this.Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new this.Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.overlappingPairCache = new this.Ammo.btDbvtBroadphase();
        this.solver = new this.Ammo.btSequentialImpulseConstraintSolver();
        this.physicsUniverse = new this.Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
        this.physicsUniverse.setGravity(new this.Ammo.btVector3(0, -1, 0));

        this.transformAux1 = new this.Ammo.btTransform();
        this.tempBtVec3_1 = new this.Ammo.btVector3(0, 0, 0);
        console.log({ physicsUniverse: this.physicsUniverse, collisionConfiguration: this.collisionConfiguration, dispatcher: this.dispatcher, overlappingPairCache: this.overlappingPairCache, solver: this.solver, tmpTransformation: this.tmpTransformation });
    }

    createCube({ scale, position, mass, quaternion, newcube }) {


        this.makeObjectBreakable(newcube, mass)






    }

    makeObjectBreakable(object, mass, velocity) {
        object.userData.mass = mass;
        object.userData.velocity = velocity

        this.convexBreaker.prepareBreakableObject(object, mass, new THREE.Vector3(), new THREE.Vector3(), true);

        this.createDebrisFromBreakableObject(object, velocity);
    }

    createDebrisFromBreakableObject(object, velocity) {

        const shape = this.createConvexHullPhysicsShape(object.geometry.attributes.position.array);
        // console.log(shape);
        shape.setMargin(this.margin);

        const body = this.createRigidBody(object, shape, object.userData.mass, null, null, velocity);

        // // Set pointer back to the three object only in the debris objects
        const btVecUserData = new this.Ammo.btVector3(0, 0, 0);
        btVecUserData.threeObject = object;
        body.setUserPointer(btVecUserData);

    }

    createConvexHullPhysicsShape(coords) {

        const shape = new this.Ammo.btConvexHullShape();

        for (let i = 0, il = coords.length; i < il; i += 3) {

            this.tempBtVec3_1.setValue(coords[i], coords[i + 1], coords[i + 2]);
            const lastOne = (i >= (il - 3));
            shape.addPoint(this.tempBtVec3_1, lastOne);

        }

        return shape;

    }

    createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
        // console.log({ object, physicsShape, mass, pos, quat, vel, angVel });


        if (pos) {

            object.position.copy(pos);

        } else {

            pos = object.position;

        }
        if (quat) {

            object.quaternion.copy(quat);

        } else {

            quat = object.quaternion;

        }

        const transform = new this.Ammo.btTransform();
        transform.setIdentity();

        transform.setOrigin(new this.Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        const motionState = new this.Ammo.btDefaultMotionState(transform);

        const localInertia = new this.Ammo.btVector3(0, 0, 0);
        physicsShape.calculateLocalInertia(mass, localInertia);

        const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        const body = new this.Ammo.btRigidBody(rbInfo);

        body.setFriction(0.5);
        body.activate()
        if (vel) {

            console.log({ vel });
            body.setLinearVelocity(new this.Ammo.btVector3(vel.x, vel.y, vel.z));

        }

        if (angVel) {

            body.setAngularVelocity(new this.Ammo.btVector3(angVel.x, angVel.y, angVel.z));

        }
        // console.log({ body }, object.userData.physicsBody);
        object.userData.physicsBody = body;

        object.userData.collided = false;

        this.threeScene.add(object);

        if (mass > 0) {

            this.rigidBody_List.push(object);

            // Disable deactivation
            body.setActivationState(4);

        }

        this.physicsUniverse.addRigidBody(body);

        return body;

    }



    createBall({ radius, position, mass, quaternion, newball, velocity }) {

        this.makeObjectBreakable(newball, mass, velocity)
    }

    createJoin(body1, body2, pivot1, pivot2) {

        let pivotVector1 = new this.Ammo.btVector3(pivot1[0], pivot1[1], pivot1[2]);
        let pivotVector2 = new this.Ammo.btVector3(pivot2[0], pivot2[1], pivot2[2]);
        let p2p = new this.Ammo.btPoint2PointConstraint(body1, body2, pivotVector1, pivotVector2);
        this.physicsUniverse.addConstraint(p2p, false);
    }

    updatePhysicsUniverse(deltaTime, rigidBody_List) {
        this.physicsUniverse.stepSimulation(deltaTime, 10);

        // for (let i = 0; i < rigidBody_List.length; i++) {
        //     let Graphics_Obj = rigidBody_List[i];
        //     let Physics_Obj = Graphics_Obj.userData.physicsBody;

        //     let motionState = Physics_Obj.getMotionState();
        //     if (motionState) {
        //         motionState.getWorldTransform(this.tmpTransformation);
        //         let new_pos = this.tmpTransformation.getOrigin();
        //         let new_qua = this.tmpTransformation.getRotation();
        //         Graphics_Obj.position.set(new_pos.x(), new_pos.y(), new_pos.z());
        //         Graphics_Obj.quaternion.set(new_qua.x(), new_qua.y(), new_qua.z(), new_qua.w());
        //     }
        // }


        for (let i = 0, il = rigidBody_List.length; i < il; i++) {

            const objThree = rigidBody_List[i];
            const objPhys = objThree.userData.physicsBody;
            const ms = objPhys.getMotionState();

            if (ms) {

                ms.getWorldTransform(this.transformAux1);
                const p = this.transformAux1.getOrigin();
                const q = this.transformAux1.getRotation();
                objThree.position.set(p.x(), p.y(), p.z());
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

                objThree.userData.collided = false;

            }

        }


        for (let i = 0, il = this.dispatcher.getNumManifolds(); i < il; i++) {

            const contactManifold = this.dispatcher.getManifoldByIndexInternal(i);

            const rb0 = this.Ammo.castObject(contactManifold.getBody0(), this.Ammo.btRigidBody);
            const rb1 = this.Ammo.castObject(contactManifold.getBody1(), this.Ammo.btRigidBody);

            const threeObject0 = this.Ammo.castObject(rb0.getUserPointer(), this.Ammo.btVector3).threeObject;
            const threeObject1 = this.Ammo.castObject(rb1.getUserPointer(), this.Ammo.btVector3).threeObject;

            // console.log({ threeObject0, threeObject1 });
            if (!threeObject0 && !threeObject1) {

                continue;

            }

            const userData0 = threeObject0 ? threeObject0.userData : null;
            const userData1 = threeObject1 ? threeObject1.userData : null;
            // console.log({userData0, userData1});
            const breakable0 = userData0 ? userData0.breakable : false;
            const breakable1 = userData1 ? userData1.breakable : false;

            const collided0 = userData0 ? userData0.collided : false;
            const collided1 = userData1 ? userData1.collided : false;

            if ((!breakable0 && !breakable1) || (collided0 && collided1)) {

                continue;

            }

            let contact = false;
            let maxImpulse = 0;

            for (let j = 0, jl = contactManifold.getNumContacts(); j < jl; j++) {

                const contactPoint = contactManifold.getContactPoint(j);

                if (contactPoint.getDistance() < 0) {

                    contact = true;
                    const impulse = contactPoint.getAppliedImpulse();

                    if (impulse > maxImpulse) {

                        maxImpulse = impulse;
                        const pos = contactPoint.get_m_positionWorldOnB();
                        const normal = contactPoint.get_m_normalWorldOnB();
                        this.impactPoint.set(pos.x(), pos.y(), pos.z());
                        this.impactNormal.set(normal.x(), normal.y(), normal.z());

                    }

                    break;

                }

            }

            // If no point has contact, abort
            // console.log({ contact });
            if (!contact) continue;

            // Subdivision

            const fractureImpulse = 50;


            if (breakable0 && !collided0 && maxImpulse > fractureImpulse) {

                const debris = this.convexBreaker.subdivideByImpact(threeObject0, this.impactPoint, this.impactNormal, 1, 2, 1.5);

                const numObjects = debris.length;
                for (let j = 0; j < numObjects; j++) {

                    const vel = rb0.getLinearVelocity();
                    const angVel = rb0.getAngularVelocity();
                    const fragment = debris[j];
                    fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
                    fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z());

                    this.createDebrisFromBreakableObject(fragment);

                }

                this.objectsToRemove[this.numObjectsToRemove++] = threeObject0;
                userData0.collided = true;

            }

            if (breakable1 && !collided1 && maxImpulse > fractureImpulse) {

                const debris = this.convexBreaker.subdivideByImpact(threeObject1, this.impactPoint, this.impactNormal, 1, 2, 1.5);

                const numObjects = debris.length;
                for (let j = 0; j < numObjects; j++) {

                    const vel = rb1.getLinearVelocity();
                    const angVel = rb1.getAngularVelocity();
                    const fragment = debris[j];
                    fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
                    fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z());

                    this.createDebrisFromBreakableObject(fragment);

                }

                this.objectsToRemove[this.numObjectsToRemove++] = threeObject1;
                userData1.collided = true;

            }

        }

        for (let i = 0; i < this.numObjectsToRemove; i++) {

            this.removeDebris(this.objectsToRemove[i]);

        }

        this.numObjectsToRemove = 0;
    }


    removeDebris(object) {

        this.threeScene.remove(object);

        this.physicsUniverse.removeRigidBody(object.userData.physicsBody);

    }
}