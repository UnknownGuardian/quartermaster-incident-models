import { Stage, Event, FIFOQueue, TimedDependency } from "../../src";

export class PostgreSQLCluster extends Stage {
  constructor(protected cluster: PostgreSQLNode[]) {
    super();
  }

  // Serves the request
  async workOn(event: Event): Promise<void> {
    const instance = this.pacemaker();
    await instance.accept(event);
  }

  // Choose a cluster to serve the request
  private pacemaker(): PostgreSQLNode {
    return this.cluster[Math.floor(Math.random() * this.cluster.length)];
  }
}

export class PostgreSQLNode extends TimedDependency { //could be master or replica; irrelevant.
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
  }
}