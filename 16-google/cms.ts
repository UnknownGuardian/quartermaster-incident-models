import { Event, normal, metronome, TimedDependency, Timeout } from "../../src";

export class ClusterManagementSoftware extends TimedDependency {
  public queue1: number = 0;
  public queue2: number = 0;
  private queueLimit: number = 2500;
  constructor(protected timeouts: Timeout[]) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // Transfer some work to a random server
    //const latency = normal(50, 5); //latency between 45 and 55
    const r = Math.floor(Math.random() * this.timeouts.length);
    if (r == 0 && this.queue1 < this.queueLimit)
      this.queue1++;
    else if (r == 1 && this.queue2 < this.queueLimit)
      this.queue2++;
    else  {
      //metronome.wait(latency);
      if (r == 0)
        this.queue1++;
      else if (r == 1)
        this.queue2++;
    }
    await this.timeouts[r].accept(event);
  }
}