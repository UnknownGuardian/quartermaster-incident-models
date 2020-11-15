import { Stage, Event, FIFOQueue, TimedDependency } from "../../src";

export class DatabaseCluster extends Stage {
  constructor(protected databaseCluster: Shard[]) {
    super();
  }

  // Serves the request
  async workOn(event: Event): Promise<void> {
    const instance = this.sendTrafficTo();
    await instance.accept(event);
  }

  // Choose a shard to serve the request
  private sendTrafficTo(): Shard {
    return this.databaseCluster[Math.floor(Math.random() * this.databaseCluster.length)];
  }

}


export class Shard extends Stage {
  constructor(protected shard: Node[]) {
    super();
  }

  // Serves the request
  async workOn(event: Event): Promise<void> {
    const instance = this.sendTrafficTo();
    await instance.accept(event);
  }

  // Choose a node to serve the request
  private sendTrafficTo(): Node {
    return this.shard[Math.floor(Math.random() * this.shard.length)];
  }

}


export class Node extends TimedDependency {
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
  }

}