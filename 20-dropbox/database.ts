import { Server } from "http";
import { Stage, Event, metronome, normal, exponential, FIFOQueue, TimedDependency, WrappedStage} from "../../src";

export class MySQLCluster extends Stage {
  constructor(protected cluster: MySQLServer[]) {
    super();
  }
  
  // Serves the request
  async workOn(event: Event): Promise<void> {
    const instance = this.sendTrafficTo(event);
    await instance.accept(event);
  }
  
  // Choose a cluster to serve the request
  private sendTrafficTo(event: Event): MySQLServer {
      return this.cluster[Math.floor(Math.random() * this.cluster.length)];
  }
}

export class MySQLServer extends TimedDependency { //could be master or replica; irrelevant.
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 10); //queue length; ( (Events a worker can run), (number of workers) )
  }
}