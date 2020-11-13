import { TimedDependency, FIFOQueue } from "../../src";

export class ContentDeliveryNetwork extends TimedDependency {
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
  }
}