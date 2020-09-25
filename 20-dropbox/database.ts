import { Server } from "http";
import { Stage, Event, metronome, normal, exponential, FIFOQueue, TimedDependency, WrappedStage} from "../../src";
 
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
  constructor(server1: DbServer, server2: DbServer, server3: DbServer) {
    super();
    if (server1.running || server2.running || server3.running) {
      this.dbrunning = true;
    }
    else {
      this.dbrunning = false;
    }
    
    this.inQueue = new FIFOQueue(1, 10); 
  }


  async workOn(event:Event): Promise<void> {
    // do some work
    if (!this.dbrunning) {
        throw "fail";
    }
    else {
      super.workOn(event);
  
    }
  }

  function newMaster(db: Database): any {
    if (this.master == undefined) && this.connection && this.running) {
  
    }
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
function testServerStatus(u: boolean, p: boolean): boolean {
  if ( (u && p)) {
    return false; //Not running
  }
  else {
    return true; //Running
  }
}

/*
export class Master // extends Database { 
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

*/

export class DbServer extends WrappedStage {
  updating: boolean;            //arbitrary input
  productionState: boolean;     //arbitrary input
  running: boolean;             //Function testServerStatus determines value.
  connection: boolean;          //status of connection to master. Initially set arbitrarily at declaration, changes if servers fail. False if unconnected.
  master: any;                  //Arbitrary input. Stores reference to the replica's master.
  constructor(u: boolean, p: boolean, c: boolean, m: any, protected wrapped: Stage) {
    super(wrapped);
    this.updating = u;
    this.productionState = p;
    this.connection = c;
    this.running = testServerStatus(u,p);
    this.master = m;
  }
   /*
    if (m == undefined && this.connection && this.running): {
        async this.workOn(event:Event): Promise<void> {
          // do some work
          //super.workOn(event);
          //const instance = this.sendTrafficTo(event);
          //await instance.accept(event); 
    }
    

    }
    else {
      throw "fail";
    }
    */

    /* If server is not connected to master but is connected and is running, then it is a running master. 
    *  Events are only passed to the master, so only the master will pass and process the event.
    */
  async workOn(event:Event): Promise<void>  {
    // do some work
    //super.workOn(event);
    //const instance = this.sendTrafficTo(event);
    //await instance.accept(event); 
    /*
    const available = Math.random() < this.availability;
    if ((this.master == undefined) && this.connection && this.running) {
        const latency = normal(this.mean, this.std);
        await metronome.wait(latency);
        return;
      }
  
      const latency = normal(this.errorMean, this.errorStd);
      await metronome.wait(latency);
      return Promise.reject("fail");
    }
    */
    //const instance = this.sendTrafficTo(event);

    if ((this.master == undefined) && this.connection && this.running) { 
      super.workOn(event);  
      return;
    }
    else {
      throw "Fail";
    }

  }
}