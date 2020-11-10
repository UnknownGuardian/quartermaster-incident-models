import { Event, metronome, Stage } from "../../src";
// TODO change this class to a load balancer which sends events to one data center.
// TODO append ClusterManagementSoftware class to preceed the database class.
// TODO combine parts of the BGP class with the CMS class in order to give a 
// resiliency / load balancing functionality.
// TODO reconsider where to put timeout. Precede the load balancer?
export class ClusterManagementSoftware extends Stage {
  public queue1: number = 0;
  public queue2: number = 0;
  private queueLimit: number = 2500;
  constructor(protected wrapped: Stage[]) {
    super();
    metronome.setInterval(() => this.resetClusterManagementSoftware, 1000);
  }

  async workOn(event: Event): Promise<void> {
    // Transfer some work to a random server
    const r = Math.floor(Math.random() * this.wrapped.length);
    if (r == 0)
      this.queue1++;
    else if (r == 1)
      this.queue2++;
    await this.wrapped[r].accept(event);
  }

  //Resets ClusterManagementSoftware queue
  public resetClusterManagementSoftware() {
    this.queue1 = 0;
    this.queue2 = 0;
  }
  
}