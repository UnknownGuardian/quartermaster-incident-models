import { FIFOQueue, TimedDependency } from "../../src";

export class S3Server extends TimedDependency {
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) ) // This adds unnecessary latency
  }
}