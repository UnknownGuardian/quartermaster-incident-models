/**
 * An exploration which demonstrates the queue growing and processing halting
 * after traffic exceeds 1900 events / 1000 ticks.
 * 
 * This exploration exists to prove the design of the Database and Build
 * Service appropriately mock the architecture and problems listed in the 
 * incident report.
 * 
 */

import {
    metronome,
    FIFOQueue,
    Retry,
    simulation,
    stats,
    eventSummary
  } from "../../src";
  import { Database, DbServer } from "./database"
  import { APIService } from "./api-service"
  import { Balancer } from "./balancer";

  /*  
     database 1
     Server 1 (Master) passes running status
     Server 2 fails running status
     Server 3 fails running status
  */  
  const s1 = new DbServer(false, true, true, undefined);
  const s2 = new DbServer(true, true, true, s1);
  const s3 = new DbServer(true, true, false, undefined);
  //r1.master = m1; //TODO redundant b/c declaration and instantiation of this.master in Replica constructor?
  //r2.master = m1; //Ask Matt
  const db1 = new Database(s1, s2, s3);
  /*  
     database 2
     Server 4 (Master) fails running status
     Server 5 fails running status
     Server 6 passes running status, becomes master by default
  */
  const s4 = new DbServer(true, true, true, undefined); // stage extensions should have 1 parameter, and those parameters should be stage objects, and that parameter can be an array. Reserve constructor for Stages to follow the decorator pattern.
  const s5 = new DbServer(false, true, true, s4);
  const s6 = new DbServer(false, true, true, undefined);
  //r3.master = m2; //TODO redundant? Ask Matt, see line 31.
  //r4.master = m2;
  const db2 = new Database(s4, s5, s6);
  //db2.master = m2;
  //db2.replicas = [r3, r4]
  //balancer
  const bal = new Balancer([db1, db2]);

  /*
  const db1 = new Database();
  const db2 = new Database();
  const db3 = new Database();
  const bal = new Balancer([db1,db2,db3]);
  */

 
  // scenario
  simulation.keyspaceMean = 1000;
  simulation.keyspaceStd = 200; // 68% - 1000 +/- 200    97% - 1000 +/- 400     99% 1000 +/- 600 
  simulation.eventsPer1000Ticks = 1500;
  
  async function work() {
    const events = await simulation.run(bal, 50000); //destionation, total events sent
    console.log("done");
    stats.summary();
    eventSummary(events);
  }
  work();
  /*
  // stats
  function poll() {
    const queue = service.inQueue as FIFOQueue; //TODO no queue in event, service origin?
    const now = metronome.now();
    const queueSize = queue.length(); //TODO no queue in event
    const eventRate = simulation.getArrivalRate();
  
    stats.record("poll", { now, queueSize, eventRate }); //TODO no queue in event
  
    simulation.eventsPer1000Ticks += 100;
  }
  metronome.setInterval(poll, 1000);
  */