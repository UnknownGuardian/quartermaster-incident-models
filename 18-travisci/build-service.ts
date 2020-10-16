import { Stage, Event, metronome, normal } from "../../src";

export class BuildService extends Stage {
  constructor(/*protected wrapped: Stage*/) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // Do some work
    const latency = normal(8, 2); //latency between 6 and 10
    await metronome.wait(latency);
    await this.accept(event);
  }
}