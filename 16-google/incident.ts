/**
 * An exploration which demonstrates packet loss and network congestion
 * after clusters, their network control planes, and their cluster 
 * management software are de-scheduled.
 * 
 * This exploration exists to prove the design of the Database, Balancer,
 * and Cluster Management Software stages appropriately mock the 
 * architecture and problems listed in the incident report, particularly 
 * the failures described for Google's Cloud Interconnect service.
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
import { ClusterManagementSoftware } from "./cluster-management-software";

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

//cms
const cms = new ClusterManagementSoftware(bal);

//timeout
const timeout = new Timeout(cms);
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
  const preIncidentEvents = events.slice(0, 1000 * 5);
  const postIncidentEvents = events.slice(1000 * 5);

  console.log("Pre");
  eventSummary(preIncidentEvents);
  console.log("Post");
  eventSummary(postIncidentEvents);
  console.log("Compare");
  eventCompare(preIncidentEvents, postIncidentEvents);
  stageSummary([timeout, cms, bal, s1, s2, s3, s4, s5, s6]);
}

// sets rate of 50% packet loss in the cms stage
function breakcms() {
  cms.percentDropPackets = 0.5; 
}

//stats
function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", {
    now, eventRate,
    packetDrop: cms.percentDropPackets,
    networkInbound: cms.getIncomingTrafficRate(),
    networkOutbound: cms.getOutgoingTrafficRate(),
    isNetworkCongested: cms.getOutgoingTrafficRate() < cms.getIncomingTrafficRate() * 0.98
  });
}

work();
metronome.setInterval(poll, 1000);
metronome.setTimeout(breakcms, 5000); // represents logical cluster de-scheduling & causes event timeouts