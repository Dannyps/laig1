class LinearAnimation extends Animation {
    constructor(parsedLinearAnim) {
        super();

        this.ctrlPoints = parsedLinearAnim.ctrlPoints;
        this.currentStage = 0;
        this.timeForEachTrajectory = parsedLinearAnim.span/(parsedLinearAnim.ctrlPoints.size - 1);
        
        // Holds the current displacement from control point N to control point N+1, in direction x,y,z
        this.currentDisplacement = {
            dx: this.ctrlPoints[0].xx - this.ctrlPoints[1].xx,
            dy: this.ctrlPoints[0].yy - this.ctrlPoints[1].yy,
            dz: this.ctrlPoints[0].zz - this.ctrlPoints[1].zz,
        };

        // Holds the current animation coordinates, incremented within every update
        this.currentPosition = {
            x: this.ctrlPoints[0].xx,
            y: this.ctrlPoints[0].yy,
            z: this.ctrlPoints[0].zz
        };

        /** @description Use to store last system time in milliseconds */
        this.lastSysTime;
    }

    apply(scene) {
        scene.pushMatrix();
            scene.translate(this.currentPosition.x, this.currentPosition.y, this.currentPosition.z);
        scene.popMatrix();
    }

    update(currSysTime) {
        /**
         * timeForEachTrajectory <-> dx | dy | dz
         * (lastSysTime - currSysTime) <-> ?
         */

        let diff = currSysTime - this.lastSysTime;

        ['x', 'y', 'z'].forEach(coord => {
            this.currentPosition[coord] += (diff * this.currentDisplacement[coord])/this.timeForEachTrajectory;
        });
        
        // TODO
    }
}