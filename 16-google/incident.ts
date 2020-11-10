/**
 * An exploration which demonstrates packet loss and network congestion
 * after clusters' cluster management software are de-scheduled.
 * 
 * This exploration exists to prove the design of the Database, Cluster 
 * Management Software, and Region stages appropriately mock the architecture 
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
import { Balancer } from "./balancer";
import { Region } from "./region";

const s1 = new Server();
const s2 = new Server();
const s3 = new Server();
const db1 = new Cluster([s1, s2, s3]);

const s4 = new Server();
const s5 = new Server();
const s6 = new Server();
const db2 = new Cluster([s4, s5, s6]);

const region1 = new Region(db1);
const region2 = new Region(db2);

const bal = new Balancer([region1, region2]);

const timeout = new Timeout(bal);
timeout.timeout = 180; //changed from 172 to 180 to match latency added from balancer

//Scenario
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
  stageSummary([timeout, bal, region1, region2, db1, db2, s1, s2, s3, s4, s5, s6]);
}

//Sets rate of 50% packet loss in the region stages
function breakregion() {
  region1.percentDropPackets = 0.5; 
  region2.percentDropPackets = 0.5; 
}

//Stats
function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", {
    now, eventRate,
    region1PacketDrop: region1.percentDropPackets,
    region1Inbound: region1.getIncomingTrafficRate(),
    region1Outbound: region1.getOutgoingTrafficRate(),
    region1IsCongested: region1.getOutgoingTrafficRate() < region1.getIncomingTrafficRate() * 0.98,
    
    region2PacketDrop: region2.percentDropPackets,
    region2Inbound: region2.getIncomingTrafficRate(),
    region2Outbound: region2.getOutgoingTrafficRate(),
    region2IsCongested: region2.getOutgoingTrafficRate() < region2.getIncomingTrafficRate() * 0.98
  });
}

work();
metronome.setInterval(poll, 1000);
metronome.setTimeout(breakregion, 5000); // represents logical cluster de-scheduling, leading to event timeouts