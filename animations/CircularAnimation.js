'use strict';
class CircularAnimation extends Animation {
    /**
     * 
     * @param {circularAnimation} parsedCircAnim 
     */
    constructor(parsedCircAnim) {
        super();

        this.angleCurr = 0; // holds the current angle (without initial angle)
        this.angleStart = (parsedCircAnim.startang*Math.PI)/180; // inicial angle relative to positive XX axis (radians) 
        this.angleRot = (parsedCircAnim.rotang*Math.PI)/180; // amount of rotation

        this.center = parsedCircAnim.center; // the center of rotation

        this.animationDuration = parsedCircAnim.span; // how much time the animation takes (in seconds)
        this.radius = parsedCircAnim.radius;
        this.span = parsedCircAnim.span;

        this.animationEnded = false;

        /** @description Use to store last system time in milliseconds */
        this.lastSysTime;
    }

    apply(scene) {
        // the center of rotation
        scene.translate(this.center.x, this.center.y, this.center.z);

        // translate to the circular path
        let ang = this.angleStart + this.angleCurr;
        scene.translate(this.radius*Math.cos(ang), 0, this.radius*Math.sin(ang));
        
        // update horizontal orientation
        scene.rotate(ang, 0, 1, 0);
    }

    update(currSysTime) {
        if(!this.lastSysTime) {
            this.lastSysTime = currSysTime;
            return;
        }

        if(this.animationEnded)
            return;

        if(this.angleCurr > this.angleRot) {
            // animation ended
            this.angleCurr = this.angleRot;
            this.animationEnded = true;

        } else {
            /**
             * angleRot <--> span
             *    ?     <--> timeDiff
             */
            let timeDiff = (currSysTime - this.lastSysTime)*1e-3;
            this.angleCurr += timeDiff*this.angleRot/this.span;
            this.lastSysTime = currSysTime;
        }      
    }
}