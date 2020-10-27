/**
 * An exploration which demonstrates packet loss and network congestion
 * after clusters and their network control planes are de-scheduled 
 * and cluster management software are descheduled shortly afterward.
 * 
 * This exploration exists to prove the design of the Database and Balancer
 * appropriately mock the architecture and problems listed in the incident report.
 * 
 */

import {
  metronome,
  simulation,
  stats,
  eventSummary,
  stageSummary,
  Timeout,
  eventCompare
} from "../../src";
import { Cluster, Server } from "./database"
import { Balancer } from "./balancer";
import { Wire } from "./wire";

//database 1
//Server 1
//Server 2
//Server 3
const s1 = new Server();
const s2 = new Server();
const s3 = new Server();
const db1 = new Cluster([s1, s2, s3]);

//database 2
//Server 4
//Server 5
//Server 6
const s4 = new Server();
const s5 = new Server();
const s6 = new Server();
const db2 = new Cluster([s4, s5, s6]);

//balancer
const bal = new Balancer([db1, db2]);


const wire = new Wire(bal)

//timeout
const timeout = new Timeout(wire);
timeout.timeout = 172; // events time out after x ticks. x = 75% of mean cumulative distribution

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 5000;

//Initializes the flow of events.
async function work() {
  const events = await simulation.run(timeout, 100000); // (destination, total events sent).
  console.log("done");
  stats.summary();
  //eventSummary(events);
  const preIncidentEvents = events.slice(0, 1000 * 5)
  const postIncidentEvents = events.slice(1000 * 5);

  console.log("Pre")
  eventSummary(preIncidentEvents);
  console.log("Post")
  eventSummary(postIncidentEvents);
  console.log("Compare")
  eventCompare(preIncidentEvents, postIncidentEvents);
  stageSummary([timeout, bal, s1, s2, s3, s4, s5, s6]) //In output: "Overview of event time spent in stage" and "...behavior in stage", prints info of api, bal, s1, then failing server s2.
}

//After setting a server's availability to 0, the server cannot service events.
function breakServer() {
  wire.percentDropPackets = 0.1;
}

//Initiates network congestion in the load balancer, i.e. cluster management software.
function balancerCapacityChange() {
  bal.queueCapacity = 5;
}

//stats
function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", {
    now, eventRate,
    packetDrop: wire.percentDropPackets,
    networkInbound: wire.getIncomingTrafficRate(),
    networkOutbound: wire.getOutgoingTrafficRate(),
    isNetworkCongested: wire.getOutgoingTrafficRate() < wire.getIncomingTrafficRate() * 0.98
  });
}

work();
metronome.setInterval(poll, 1000);
metronome.setTimeout(breakServer, 5000); // represents logical cluster de-scheduling
metronome.setTimeout(balancerCapacityChange, 5000); // represents queue backup