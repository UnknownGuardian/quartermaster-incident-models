import { Stage, Event, TimedDependency, FIFOQueue, } from "../../src";
import { Cluster } from "./database"

export class Balancer extends TimedDependency {
  constructor(protected databases: Cluster[]) {
    super();
    this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
  }

  async workOn(event: Event): Promise<void> {
    // Transfer some work to a random server
    const r = Math.floor(Math.random() * this.databases.length)
    await this.databases[r].accept(event);
  }
}