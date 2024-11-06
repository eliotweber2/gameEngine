const Bodies = require('matter-js').Bodies;
const physEngine = require('matter-js').Engine;
const Composite = require('matter-js').Composite;
const Constraint = require('matter-js').Constraint;

class Container {
    constructor(name,scene) {
        this.compLst = {};
        this.state = {};
        this.name = name;
        this.scene = scene;
        this.canParent = true;
    }
    addActor(name,data) {
        const newActor = new Actor(name,this.scene,data,this);
        this.compLst[name] = newActor;
    }
}

class Scene {
    constructor(name,game) {
        this.compLst = {};
        this.state = {};
        this.name = name;
        this.game = game;
        this.canParent = true;
        this.engine = physEngine.create();
    }

    addActor(name,data) {
        const newActor = new Actor(name,this,data,this);
        this.compLst[name] = newActor;
        newActor.name = name;
    }

    _addPhysObj(obj) {Composite.add(this.engine.world,obj)}
}

class Actor {
    constructor(name,scene,data,parent) {
        this.state = {};
        this.renderOps = data.renderOps;
        this.name = name;
        this.scene = scene;
        this.parent = parent;
        this.canParent = false;
        this.physObj = null;
        if (!data.physOps.noPhys) {
            this.createPhysObj(data.physOps);
        }
    }

    createPhysObj(physOps) {
        switch (physOps.type) {
            case 'polygon': this.physObj = Bodies.fromVertices(physOps.centerX,physOps.centerY,physOps.vertices,{
                isStatic: physOps.isStatic,
            }); break;
            case 'rectangle': this.physObj = Bodies.rectangle(physOps.x,physOps.y,physOps.w,physOps.h,{
                isStatic: physOps.isStatic,
            }); break;
            case 'circle': this.physObj = Bodies.circle(physOps.centerX,physOps.centerY,physOps.radius,{
                isStatic: physOps.isStatic,
            }); break;
            default: console.log('Invalid physics object type'); 
        }
        this.parent._addPhysObj(this.physObj);
    }
}

exports.Container = Container;
exports.Scene = Scene;
exports.Actor = Actor;

/*
PhysOps:
    Type: polygon, circle,rectangle
    Shape: Passed to create function
    Options: Passed to create function
*/