/**
 * An exploration which demonstrates packet loss and network congestion
 * after clusters' cluster management software are de-scheduled.
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

//Cluster 1
//Server 1
//Server 2
//Server 3
const s1 = new Server();
const s2 = new Server();
const s3 = new Server();
const db1 = new Cluster([s1, s2, s3]);

//Cluster 2
//Server 4
//Server 5
//Server 6
const s4 = new Server();
const s5 = new Server();
const s6 = new Server();
const db2 = new Cluster([s4, s5, s6]);

//Cluster Management Software 1 and 2
const cms1 = new ClusterManagementSoftware(db1);
const cms2 = new ClusterManagementSoftware(db2);

//Timeout 1 and 2
const timeout1 = new Timeout(cms1);
const timeout2 = new Timeout(cms2);

//Bal
const bal = new Balancer ([timeout1, timeout2]);

timeout1.timeout = 172;
timeout2.timeout = 172;

//Scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 5000;

//Initializes the flow of events.
async function work() {
  const events = await simulation.run(bal, 100000); // (destination, total events sent).
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
  stageSummary([bal, timeout1, timeout2, cms1, cms2, s1, s2, s3, s4, s5, s6]);
}

//ets rate of 50% packet loss in the cms stages
function breakcms() {
  cms1.percentDropPackets = 0.5; 
  cms2.percentDropPackets = 0.5; 
}

//Stats
function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", {
    now, eventRate,
    cms1PacketDrop: cms1.percentDropPackets,
    cms1NetworkInbound: cms1.getIncomingTrafficRate(),
    cms1NetworkOutbound: cms1.getOutgoingTrafficRate(),
    cms1IsNetworkCongested: cms1.getOutgoingTrafficRate() < cms1.getIncomingTrafficRate() * 0.98,
    
    cms2PacketDrop: cms2.percentDropPackets,
    cms2NetworkInbound: cms2.getIncomingTrafficRate(),
    cms2NetworkOutbound: cms2.getOutgoingTrafficRate(),
    cms2IsNetworkCongested: cms2.getOutgoingTrafficRate() < cms2.getIncomingTrafficRate() * 0.98
  });
}

work();
metronome.setInterval(poll, 1000);
metronome.setTimeout(breakcms, 5000); // represents logical cluster de-scheduling, leading to event timeouts