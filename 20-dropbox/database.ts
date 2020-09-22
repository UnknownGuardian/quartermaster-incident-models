import { Server } from "http";
import { Stage, Event, metronome, normal, exponential, FIFOQueue, TimedDependency} from "../../src";
 
/*  
    TODO'S:
    DONE set testConnection to fail master and replicas if master has failed.
    SKIP set workOn to receive a database, then forward work to a random server of database.
*/  

export class Database extends TimedDependency {
  dbrunning: boolean;
  //mserver: Master;
  //rserver1: Replica;
  //rserver2: Replica;
  constructor(mserver: Master, rserver1: Replica, rserver2: Replica) {
    super();
    this.dbrunning = mserver.running;

    this.inQueue = new FIFOQueue(1, 10); 
//    mserver: Master;
//    rserver1: Replica;
//    rserver2: Replica;
//    this.mserver = new Master(this.updating, this.productionState);
//    this.rserver1 = new Replica(this.updating, this.productionState);
//    this.rserver2 = new Replica(this.updating, this.productionState);
  }


  async workOn(event:Event): Promise<void> {
    // do some work
    if (!this.dbrunning) {
        throw "fail";
    }
    super.workOn(event);
  }

  /*
  async  workOn(event:Event): Promise<void> {
    //connection: boolean = testConnection(Database);
    // do some work
    let r = Math.floor(Math.random())
    if (r > .5) {
        this.productionState = true;
    }
    if (this.productionState) {
        throw "fail";
    }
    else {
        this.updating = true;
    }
  }
  */
  
} // End of Database Class

/*
function testConnection(server: any): void {  
  if (server.updating && server.productionState) {
    server.connection = false;
  }
  else {
    server.connection = true;
  }
}
*/

//u = update, p = productionState, c = connection, returns status of running
function testReplicaStatus(u: boolean, p: boolean, c: boolean): boolean {
  if ( (u && p) || (!c) ) {
    return false; //Not running
  }
  else {
    return true; //Running
  }
}

//u = update, p = productionState, returns status of running
function testMasterStatus(u: boolean, p: boolean): boolean {
  if (u && p) {
    return false; //Not running
  }
  else {
    return true; //Running
  }
}

export class Master /*extends Database*/ { 
  updating: boolean;
  productionState: boolean;
  running: boolean;
  constructor(u: boolean, p: boolean) {
    //super();
    this.updating = u;
    this.productionState = p;
    this.running = testMasterStatus(u,p);
  }
}

export class Replica /*extends Database*/ {
  updating: boolean;
  productionState: boolean;
  running: boolean;
  connection: boolean;          //status of connection to master.
  master: any;                  //stores reference to the replica's master.
  constructor(u: boolean, p: boolean, c: boolean, m: any) {
    //super();
    this.updating = u;
    this.productionState = p;
    this.connection = c;
    this.running = testReplicaStatus(u,p,c);
    this.master = m;
   }
}