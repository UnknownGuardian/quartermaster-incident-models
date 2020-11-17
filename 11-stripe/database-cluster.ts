import { Stage, Event, normal, metronome, FIFOQueue, TimedDependency } from "../../src";

export class DatabaseCluster extends Stage {
  public primaryShard: number = 0;
  public shardFailoverWorking: boolean = true;
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
    /*if (this.failoverWorking) {
      if (this.databaseCluster[this.primaryShard].availability < 0.995) {
        this.primaryShard = Math.floor(Math.random() * this.databaseCluster.length);
        return this.sendTrafficTo();
      }
    }*/
    return this.databaseCluster[Math.floor(Math.random() * this.databaseCluster.length)];
  }

}


export class Shard extends Stage {
  public primaryNode: number = 0;
  public nodeFailoverWorking: boolean = true;
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
    if (this.nodeFailoverWorking) {
      if (this.shard[this.primaryNode].nodeAvailability == false) { // if unavailable, choose a new node
        this.primaryNode = Math.floor(Math.random() * this.shard.length);
        return this.sendTrafficTo();
      }
    }
    return this.shard[Math.floor(Math.random() * this.shard.length)];
  }

} // TODO figure out why events are failing. They shouldn't if sendTrafficTo rebalancing works.


export class Node extends TimedDependency {
  public nodeAvailability: boolean = true;
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 100); //queue length; ( (Events a worker can run), (number of workers) )
  }

  async workOn(): Promise<void> {
    const latency = normal(8,2); //latency between 6 and 10
    if (this.nodeAvailability == false) {
      console.log("FAILING");
      await metronome.wait(999999);
    }
    await metronome.wait(latency);
  }

}