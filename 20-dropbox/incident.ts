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
    simulation,
    stats,
    eventSummary
  } from "../../src";
  import { MySQLCluster, MySQLServer } from "./database"
  import { Balancer } from "./balancer";

  /*  
     database 1
     Server 1 (Master) passes running status
     Server 2 fails running status
     Server 3 fails running status
  */  
  const s1 = new MySQLServer();
  const s2 = new MySQLServer();
  const s3 = new MySQLServer();
  const db1 = new MySQLCluster([s1, s2, s3]);

  /*  
     database 2
     Server 4 (Master) fails running status
     Server 5 fails running status
     Server 6 passes running status, becomes master by default
  */
  const s4 = new MySQLServer();
  const s5 = new MySQLServer();
  const s6 = new MySQLServer();
  const db2 = new MySQLCluster([s4, s5, s6]);

  //balancer
  const bal = new Balancer([db1, db2]);
 
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

  metronome.setTimeout(breakSQL, 5000);

  function breakSQL() {
    s2.availability = 0;
  }


  
  // stats
  function poll() {
    const now = metronome.now();
    const eventRate = simulation.getArrivalRate();
  
    stats.record("poll", { now, eventRate, 
      s1: s1.availability,
      s2: s2.availability,
      s3: s3.availability,
      s4: s4.availability,
      s5: s5.availability,
      s6: s6.availability,  }); //TODO no queue in event
  
    simulation.eventsPer1000Ticks += 100;
  }
  metronome.setInterval(poll, 1000);
  