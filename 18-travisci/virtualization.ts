import { Stage, Event, metronome, normal, TimedDependency, FIFOQueue } from "../../src";

export class VirtualStage extends TimedDependency {
    constructor(protected wrapped: Stage) {
        super();
        
    }

    async workOn(event: Event) {
        try {await this.Build(event);}
        catch {console.log("Error in Build");}
        await this.Run(event);
        await this.Cleanup(event);
    }

    async Build(event: Event) {
        const latency = normal(8, 2); //latency between 6 and 10
        await metronome.wait(latency);
        this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
        await this.wrapped.accept(event);
    } // Build

    async Run(event: Event) {
        const latency = normal(8, 2); //latency between 6 and 10
        await metronome.wait(latency);
        this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
        await this.wrapped.accept(event);
    } // Run

    async Cleanup(event: Event) {
        const latency = normal(8, 2); //latency between 6 and 10
        await metronome.wait(latency);
        this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
        await this.wrapped.accept(event);
    } // Cleanup

}