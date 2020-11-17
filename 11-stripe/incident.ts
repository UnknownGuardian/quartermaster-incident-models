/**
 * An exploration which demonstrates a website losing capacity to serve
 * clients after one of the servers fail.
 * 
 * This exploration exists to prove the design of the DatabaseCluster and API
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
  simulation.keyspaceStd = 200;
  simulation.eventsPer1000Ticks = 1000;
  
  //Initializes the flow of events.
  async function work() {
    const events = await simulation.run(timeout, 50000); // (destination, total events sent).
    console.log("done");
    stats.summary();
    eventSummary(events);
    stageSummary([timeout, api, dbc, sh1, n1, n2, n3])
  }
  work();
  
  
  //After setting a server's availability to 0, the server cannot service events.
  function breakSomeNodes() {
    n1.nodeAvailability = false;
    n2.nodeAvailability = false;
  }

  function fixSomeNodes() {
    n1.nodeAvailability = true;
    n2.nodeAvailability = true;
  }

  function breakFailover() {
    sh1.nodeFailoverWorking = false;
    sh2.nodeFailoverWorking = false;
    sh3.nodeFailoverWorking = false;
  }

  function breakMostNodes() {
    n1.nodeAvailability = false;
    n2.nodeAvailability = false;
    //n3.nodeAvailability = false;
    n4.nodeAvailability = false;
    n5.nodeAvailability = false;
    //n6.nodeAvailability = false;
    n7.nodeAvailability = false;
    n8.nodeAvailability = false;
    //n9.nodeAvailability = false;
  }
  metronome.setTimeout(breakSomeNodes, 5000);
  //metronome.setTimeout(fixSomeNodes, 10000);
  //metronome.setTimeout(breakFailover, 15000);
  //metronome.setTimeout(breakMostNodes, 15000);
  
  //stats
  function poll() {
    const now = metronome.now();
    const eventRate = simulation.getArrivalRate();
    const failover1Working = sh1.nodeFailoverWorking;
    const failover2Working = sh2.nodeFailoverWorking;
    const failover3Working = sh3.nodeFailoverWorking;
  
    stats.record("poll", {
      now, eventRate, failover1Working, failover2Working, failover3Working
    });
  }
  metronome.setInterval(poll, 1000);