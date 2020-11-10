// TODO combine parts of the Region class with the CMS class in order to give a 
// resiliency / load balancing functionality.
// TODO reconsider where to put timeout. Precede the load balancer?
import { Stage, Event, metronome, normal } from "../../src";

export class Balancer extends Stage {
  constructor(protected wrapped: Stage[]) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // Do some work
    const latency = normal(8, 2); //latency between 6 and 10
    await metronome.wait(latency);
    // Transfer some work to a random server
    const r = Math.floor(Math.random() * this.wrapped.length)
    await this.wrapped[r].accept(event);
  }
}