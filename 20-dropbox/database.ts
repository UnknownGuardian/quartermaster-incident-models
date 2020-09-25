import { Server } from "http";
import { Stage, Event, metronome, normal, exponential, FIFOQueue, TimedDependency, WrappedStage} from "../../src";
 
/*  
    TODO'S:
    DONE set testConnection to fail master and replicas if master has failed.
    SKIP set workOn to receive a database, then forward work to a random server of database.
*/  

export class MySQLCluster extends Stage {
  constructor(protected cluster: MySQLServer[]) {
    super();
  }
  
    // Choose a cluster to Serve the Request
    async workOn(event: Event): Promise<void> {
      const instance = this.sendTrafficTo(event);
      await instance.accept(event);
    }
  
    private sendTrafficTo(event: Event): MySQLServer {
        return this.cluster[Math.floor(Math.random() * this.cluster.length)];
    }


}




export class MySQLServer extends TimedDependency { //could be master or replica, irrelevant
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 10); //queue length, number of workers each running 1 event at a time
  }
}