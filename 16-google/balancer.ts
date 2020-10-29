import { Event, TimedDependency, Timeout } from "../../src";

export class Balancer extends TimedDependency {
  public queueCapacity: number = 50;
  constructor(protected timeouts: Timeout[]) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // Transfer some work to a random server
    const r = Math.floor(Math.random() * this.timeouts.length)
    await this.timeouts[r].accept(event);
  }
}