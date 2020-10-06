/**
 * An exploration which demonstrates a loss of capacity to produce more
 * virtual machines after the cleanup service fails and the resources
 * for build capacity are exhausted.
 * 
 * This exploration exists to prove the design of the Virtualization 
 * and Build Service appropriately mock the architecture and problems 
 * listed in the incident report.
 * 
 */


import { Stage, Event, metronome, normal } from "../../src";
import { BuildService } from "./build-service";
import { VirtualStage } from "./virtualization";



/*
// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200; // 68% - 1000 +/- 200    97% - 1000 +/- 400     99% 1000 +/- 600 
simulation.eventsPer1000Ticks = 1000;

//Initializes the flow of events.
async function work() {
  const events = await simulation.run(api, 50000); // (destination, total events sent).
  console.log("done");
  stats.summary();
  eventSummary(events);
  stageSummary([api,bal,s2,s4]) //In output: "Overview of event time spent in stage" and "...behavior in stage", prints info of api, bal, s1, then failing server s2.
}
work();

metronome.setTimeout(breakSQL, 5000);

//After setting a server's availability to 0, the server cannot service events.
function breakSQL() {
  s2.availability = 0;
}
*/