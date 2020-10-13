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


import {
  Stage,
  Event,
  metronome,
  normal,
  simulation,
  stats,
  eventSummary,
  stageSummary,
  Timeout,
  TimeStats
} from "../../src";
import { BuildService } from "./build-service";
import { Virtualization } from "./virtualization";

// pass build-service as a parameter into virtualization
const vir = new Virtualization();

// Gives timeout to end simulation after a period of time.
const timeout = new Timeout(vir);
timeout.timeout = 20000; // times out after x ticks.

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200; // 68% - 1000 +/- 200    97% - 1000 +/- 400     99% 1000 +/- 600 
simulation.eventsPer1000Ticks = 1000;

//Initializes the flow of events.
async function work() {
  const events = await simulation.run(timeout, 50000); // (destination, total events sent).
  console.log("done");
  //stats.summary();
  eventSummary(events);
  stageSummary([timeout, vir]) //In output: "Overview of event time spent in stage" and "...behavior in stage", prints info of vir.
  stats.summary();
  const times = events.map(e => e.stageTimes);
  console.log(times[0]);

}
work();



metronome.setTimeout(breakVir, 3000); //breaks authenticator in Virtualization after 1000 ticks
//After setting virtual's que authentication to fail, the cleanup cannot service events.
function breakVir() {
  vir.janitorProcessWorking = false;
}

function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();
  //const eventTime = TimeStats.fromStage(vir); //prints string of TimeStats

  stats.record("poll", {
    now, eventRate, //eventTime
  });
}
metronome.setInterval(poll, 1000);