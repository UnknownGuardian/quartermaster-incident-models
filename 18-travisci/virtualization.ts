import { Stage, Event, metronome, normal, standardNormal, TimedDependency, FIFOQueue } from "../../src";

export class Virtualization extends Stage {
    public queAuthenticator: boolean;
    constructor(protected wrapped: Stage) {
      super();
      this.inQueue = new FIFOQueue(Infinity, 220); //queue length ( (Events a worker can run), (number of workers) )
      this.queAuthenticator = true;
    }

    async workOn(event: Event): Promise<void> {
      await this.build(event);
      await this.run(event);
      await this.cleanup(event);
    }

    async build(event: Event): Promise<void>  {
      const latency = normal(10, 2);
      console.log("BUILD");
      await metronome.wait(latency);
    }

    async run(event: Event): Promise<void>  {
      const latency = normal(10, 2);
      console.log("RUN");
      await metronome.wait(latency);
    }

    async cleanup(event: Event): Promise<void>  {
      const latency = normal(10, 2);
      console.log("CLEANUP " + this.queAuthenticator);
      //await metronome.wait(latency);
      
      if (this.queAuthenticator == true) {
        await metronome.wait(latency);
      }
      else {
        await metronome.wait(Infinity);
      }

      // sometimes don't return from this function. (You can probably do this by setting caling await.metronome.wait(Infinity)
    }
}


/*
export class VirtualStage extends TimedDependency {
    constructor(protected wrapped: Stage) {
        super();

    }

    async workOn(event: Event) {
        try {await this.build(event);}
        catch {console.log("Error in workOn");}
        await this.run(event);
        await this.cleanup(event);
        //await this.Build(this.Run((this.Cleanup(event))));
    }

    async build(event: Event) {
        console.log("BUILD");
        const latency = normal(8, 2); //latency between 6 and 10
        await metronome.wait(latency);
        this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
        await this.wrapped.accept(event);
    } // Build

    async run(event: Event) {
        console.log("RUN");
        const latency = normal(8, 2); //latency between 6 and 10
        await metronome.wait(latency);
        this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
        await this.wrapped.accept(event);
    } // Run

    async cleanup(event: Event) {
        console.log("CLEANUP");
        const latency = normal(8, 2); //latency between 6 and 10
        await metronome.wait(latency);
        this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
        await this.wrapped.accept(event);
    } // Cleanup

}
*/