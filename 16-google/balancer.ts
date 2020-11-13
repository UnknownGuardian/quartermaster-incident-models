import { Stage, Event, metronome, normal } from "../../src";

export class Balancer extends Stage {
  constructor(protected wrapped: Stage[]) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // Do some work
    const latency = normal(8, 2); //latency between 6 and 10
    await metronome.wait(latency);
    // Transfer some work to a random region
    const r = Math.floor(Math.random() * this.wrapped.length)
    await this.wrapped[r].accept(event);
  }
}