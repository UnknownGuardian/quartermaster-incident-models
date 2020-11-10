/**
 * An exploration which demonstrates packet loss and network congestion
 * after clusters' cluster management software are de-scheduled.
 * 
 * This exploration exists to prove the design of the Database, Cluster 
 * Management Software, and BGP stages appropriately mock the architecture 
 * and problems listed in the incident report, particularly the failures 
 * described for Google's Cloud Interconnect service.
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
import { ClusterManagementSoftware } from "./cluster-management-software";
import { BGP } from "./bgp";

const s1 = new Server();
const s2 = new Server();
const s3 = new Server();
const db1 = new Cluster([s1, s2, s3]);

const s4 = new Server();
const s5 = new Server();
const s6 = new Server();
const db2 = new Cluster([s4, s5, s6]);

//BGP 1 and 2
const bgp1 = new BGP(db1);
const bgp2 = new BGP(db2);

const timeout1 = new Timeout(bgp1);
const timeout2 = new Timeout(bgp2);
timeout1.timeout = 172;
timeout2.timeout = 172;

const cms = new ClusterManagementSoftware([timeout1, timeout2]);

//Scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 5000;

//Initializes the flow of events.
async function work() {
  const events = await simulation.run(cms, 100000); // (destination, total events sent).
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
  stageSummary([cms, timeout1, timeout2, bgp1, bgp2, s1, s2, s3, s4, s5, s6]);
}

//Sets rate of 50% packet loss in the bgp stages
function breakbgp() {
  bgp1.percentDropPackets = 0.5; 
  bgp2.percentDropPackets = 0.5; 
}

//Stats
function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", {
    now, eventRate,
    bgp1PacketDrop: bgp1.percentDropPackets,
    bgp1Inbound: bgp1.getIncomingTrafficRate(),
    bgp1Outbound: bgp1.getOutgoingTrafficRate(),
    bgp1IsCongested: bgp1.getOutgoingTrafficRate() < bgp1.getIncomingTrafficRate() * 0.98,
    
    bgp2PacketDrop: bgp2.percentDropPackets,
    bgp2Inbound: bgp2.getIncomingTrafficRate(),
    bgp2Outbound: bgp2.getOutgoingTrafficRate(),
    bgp2IsCongested: bgp2.getOutgoingTrafficRate() < bgp2.getIncomingTrafficRate() * 0.98
  });
}

work();
metronome.setInterval(poll, 1000);
metronome.setTimeout(breakbgp, 5000); // represents logical cluster de-scheduling, leading to event timeouts