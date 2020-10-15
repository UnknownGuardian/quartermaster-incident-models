import { Event, metronome, normal, WrappedStage, } from "../../src";
/*
export class BuildService extends Stage {
  constructor(protected wrapped: Stage) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // Do some work
    const latency = normal(8, 2); //latency between 6 and 10
    await metronome.wait(latency);
    await this.wrapped.accept(event);
  }
}
*/

export class Timeout extends WrappedStage {
    async workOn(event: Event): Promise<void> {
      const tookTooLong = metronome.wait(100);
      await Promise.race([tookTooLong, this.wrapped.accept(event)]); // compares times of promise1 with promise2 in the parameters. First one to return executes.
    }
}