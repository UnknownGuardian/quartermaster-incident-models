import { Event, FIFOQueue, Stage, WrappedStage } from "../../src";

export class Intake extends Stage {
  public queue = new IntakeQueue(this.wrapped);
  public build = new BuildService(this.queue);
  constructor(protected wrapped: WrappedStage) {
    super();
  }
  
  async workOn(event: Event): Promise<void> {
    // Do some work
    //const queue = new IntakeQueue(event);
    //await this.wrapped.accept(this.build);
    await this.build.accept(event);
  }
}

class IntakeQueue extends Stage {
  constructor(protected wrapped: Stage) {
    super();
    this.inQueue = new FIFOQueue(Infinity, 100); //queue length; ( (Events a worker can run), (number of workers) )
  }

  async workOn(event: Event): Promise<void> {
    // Do some work, latency is built in with queue.
    await this.wrapped.accept(event);
  }
}

class BuildService extends Stage {
  constructor(protected wrapped: Stage) {
  super();
  }

  async workOn(event: Event): Promise<void> {
    // Do some work
    //const latency = normal(8, 2); //latency between 6 and 10
    //await metronome.wait(latency);
    await this.wrapped.accept(event);
  }
}