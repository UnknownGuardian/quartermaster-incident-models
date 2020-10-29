import { Event, normal, metronome, TimedDependency, Timeout } from "../../src";
import { BGP } from "./bgp";

export class Balancer extends TimedDependency {
  public queue1: number = 0;
  public queue2: number = 0;
  private queueLimit: number = 2500;
  constructor(protected timeouts: Timeout[], protected bgp: BGP) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // Transfer some work to a random server
    const latency = normal(50, 5); //latency between 45 and 55
    const r = Math.floor(Math.random() * this.timeouts.length);
    if (r == 0 && this.queue1 < this.queueLimit) {
      this.queue1++;
      await this.timeouts[r].accept(event);
    }
    else if (r == 1 && this.queue2 < this.queueLimit) {
      this.queue2++;
      await this.timeouts[r].accept(event);
    }
    else if (this.bgp.BGPWorking) {
        await this.bgp.accept(event);
    }
    else {
      await this.timeouts[r].accept(event);
    }
  }
}