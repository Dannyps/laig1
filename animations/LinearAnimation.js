'use strict';
class LinearAnimation extends Animation {
    constructor(parsedLinearAnim) {
        super();

        // the control points. Are relative positions
        this.ctrlPoints = parsedLinearAnim.ctrlPoints;
        // the current animation trajectory
        this.currentStage = 0;
        // the time to be spent on each trajectory
        this.timeForEachTrajectory = parsedLinearAnim.span/(parsedLinearAnim.ctrlPoints.length - 1);
        
        // Holds the current displacement from control point N to control point N+1, in direction x,y,z
        this.currentDisplacement = {
            x: this.ctrlPoints[1].xx - this.ctrlPoints[0].xx,
            y: this.ctrlPoints[1].yy - this.ctrlPoints[0].yy,
            z: this.ctrlPoints[1].zz - this.ctrlPoints[0].zz,
        };

        // Holds the current animation coordinates, incremented within every update
        this.currentPosition = {
            x: this.ctrlPoints[0].xx,
            y: this.ctrlPoints[0].yy,
            z: this.ctrlPoints[0].zz
        };

        /** @description Used to store last system time in milliseconds */
        // TODO this is common to CIRC and LINEAR
        this.lastSysTime;

        // TODO shared by CIRC and LINEAR
        this.animationEnded = false;
    }

    apply(scene) {
        // translate
        scene.translate(this.currentPosition.x, this.currentPosition.y, this.currentPosition.z);
        
        // rotation relate to self vertical axis
        let ang = Math.atan(this.currentDisplacement.z/this.currentDisplacement.x);
        if(!isNaN(ang)){
            console.log(ang);
            scene.rotate(ang, 0, 1, 0);
        }
    }

    update(currSysTime) {
        /**
         * Whether the animation reached the end or not
         */
        if(this.animationEnded)
            return;

        /**
         * If lastSysTime is undefined, then this is the first call which will be skipped. 
         * TODO perhaps there's a better way for initializing?
         */
        if(!this.lastSysTime) {
            this.lastSysTime = currSysTime;
            return;
        }

        /**
         * Compute the new coordinates considering the time diference between the last update call and current update call
         * 
         * timeForEachTrajectory <-> dx | dy | dz
         * (lastSysTime - currSysTime) <-> ?
         */
        let diff = (currSysTime - this.lastSysTime)*1e-3;

        ['x', 'y', 'z'].forEach(coord => {
            this.currentPosition[coord] += (diff * this.currentDisplacement[coord])/this.timeForEachTrajectory;
        });

        /**
         * If the currentPosition exceeds the end control point for the ongoin trajectory, 
         * set currentPosition as the starting point for the next trajectory, if any,
         * and update internal data
         */
        // not sure if this is the best criterium.. if at least in one direction the current position exceeds the control point that sets the end of the ongoing trajectory
        // then move to the next trajectory, if any
        for(let coord of ['x', 'y', 'z']) {
            let diff = this.ctrlPoints[this.currentStage + 1][coord + coord] -  this.ctrlPoints[this.currentStage][coord + coord];
            if(diff > 0 ) {
                if(this.currentPosition[coord] >= this.ctrlPoints[this.currentStage + 1][coord + coord]) {
                    this._nextStage();
                    break;
                }
            } else if(diff < 0) {
                if(this.currentPosition[coord] <= this.ctrlPoints[this.currentStage + 1][coord + coord]) {
                    this._nextStage();
                    break;
                }
            }
        }
        
        this.lastSysTime = currSysTime;
    }

    /**
     * Used to update internal data when the animation reaches a control point, i.e., the end of a trajectory
     * It checks if there are further trajectories and updates this.animationEnded accordingly
     * If a trajectory is available, it updates the internal properties such currentPosition and currentDisplacement
     */
    _nextStage() {
        // check if there are more trajectories
        if (this.currentStage === (this.ctrlPoints.length - 2)) {
            // no more trajectories, animation reached the end
            this.animationEnded = true;
            return;
        }

        let n = ++this.currentStage;

        // Holds the current displacement from control point N to control point N+1, in direction x,y,z
        this.currentDisplacement = {
            x: this.ctrlPoints[n+1].xx - this.ctrlPoints[n].xx,
            y: this.ctrlPoints[n+1].yy - this.ctrlPoints[n].yy,
            z: this.ctrlPoints[n+1].zz - this.ctrlPoints[n].zz,
        };
    }
}