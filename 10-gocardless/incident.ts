/**
 * An exploration which demonstrates a website losing capacity to serve
 * clients after all the nodes fail.
 * 
 * This exploration exists to prove the design of the PostgreSQLCluster 
 * appropriately mocks the architecture and problems listed in the 
 * incident report.
 * 
 */

import {
  metronome,
  simulation,
  stats,
  eventSummary, stageSummary
} from "../../src";
import { PostgreSQLCluster, PostgreSQLNode } from "./cluster"
import { APIService } from "./api-service";

//Node 1
//Node 2
//Node 3
//Cluster 1
const n1 = new PostgreSQLNode();
const n2 = new PostgreSQLNode();
const n3 = new PostgreSQLNode();
const db = new PostgreSQLCluster([n1, n2, n3]);

//api service
const api = new APIService(db);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 1000;

//Initializes the flow of events.
async function work() {
  const events = await simulation.run(api, 10000); // (destination, total events sent).
  console.log("done");
  stats.summary();
  eventSummary(events);
  stageSummary([api, n1, n2, n3]) //In output: "Overview of event time spent in stage" and "...behavior in stage", prints info of api, pm, n1, then failing node n2.
}
work();


//After setting a node's availability to 0, the node cannot service events.
function breakSQL() {
  n1.availability = 0;
  n2.availability = 0;
  n3.availability = 0;
}
metronome.setTimeout(breakSQL, 5000);


//stats
function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", {
    now, eventRate,
    n1: n1.availability,
    n2: n2.availability,
    n3: n3.availability,
  });
}
metronome.setInterval(poll, 1000);