/**
 * An exploration which demonstrates a website losing capacity to serve
 * clients after one of the servers fail.
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
    Timeout,
    eventSummary, stageSummary
  } from "../../src";
  import { DatabaseCluster, Shard, Node } from "./database-cluster"
  import { APIService } from "./api-service";
  

  const n1 = new Node();
  const n2 = new Node();
  const n3 = new Node();
  const sh1 = new Shard([n1, n2, n3]);
  
  const n4 = new Node();
  const n5 = new Node();
  const n6 = new Node();
  const sh2 = new Shard([n4, n5, n6]);

  const n7 = new Node();
  const n8 = new Node();
  const n9 = new Node();
  const sh3 = new Shard([n7, n8, n9]);

  const dbc = new DatabaseCluster([sh1, sh2, sh3]);

  const api = new APIService(dbc);

  const timeout = new Timeout(api);
  
  // scenario
  simulation.keyspaceMean = 1000;
  simulation.keyspaceStd = 200; // 68% - 1000 +/- 200    97% - 1000 +/- 400     99% 1000 +/- 600 
  simulation.eventsPer1000Ticks = 1000;
  
  //Initializes the flow of events.
  async function work() {
    const events = await simulation.run(timeout, 50000); // (destination, total events sent).
    console.log("done");
    stats.summary();
    eventSummary(events);
    stageSummary([timeout, api, dbc, sh1, n1, n2, n3]) //In output: "Overview of event time spent in stage" and "...behavior in stage", prints info of api, bal, n1, then failing server n2.
  }
  work();
  
  
  //After setting a server's availability to 0, the server cannot service events.
  function breakNodes() {
    n1.availability = 0;
    n2.availability = 0;
  }
  metronome.setTimeout(breakNodes, 5000);
  
  
  //stats
  function poll() {
    const now = metronome.now();
    const eventRate = simulation.getArrivalRate();
  
    stats.record("poll", {
      now, eventRate,
      n1: n1.availability,
      n2: n2.availability,
      n3: n3.availability,
      n4: n4.availability,
      n5: n5.availability,
      n6: n6.availability,
    });
  }
  metronome.setInterval(poll, 1000);