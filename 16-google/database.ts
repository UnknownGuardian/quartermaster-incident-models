import { Stage, Event, FIFOQueue, TimedDependency } from "../../src";

export class Cluster extends Stage {
  constructor(protected cluster: Server[]) {
    super();
  }

  // Serves the request
  async workOn(event: Event): Promise<void> {
    const instance = this.networkControl();
    await instance.accept(event);
  }

  // Choose a cluster to serve the request
  private networkControl(): Server {
    return this.cluster[Math.floor(Math.random() * this.cluster.length)];
  }
}

export class Server extends TimedDependency {
  constructor() {
    super();
    this.mean = this.errorMean = 20;
    this.std = this.errorStd = 5;
  }
}