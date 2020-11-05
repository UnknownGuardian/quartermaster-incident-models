import { FIFOQueue, TimedDependency } from "../../src";

export class S3Server extends TimedDependency { // TODO replace queue with latency. Queue demonstrates network congestion which is not described in incident.
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
  }
}