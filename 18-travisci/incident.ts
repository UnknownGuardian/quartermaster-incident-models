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
    stageSummary
} from "../../src";
import { BuildService } from "./build-service";
import { VirtualStage } from "./virtualization";

// initialize build-service

 const build = new BuildService();

// pass build-service as a parameter into virtualization
 const vir = new VirtualStage(build);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200; // 68% - 1000 +/- 200    97% - 1000 +/- 400     99% 1000 +/- 600 
simulation.eventsPer1000Ticks = 1000;

//Initializes the flow of events.
async function work() {
  const events = await simulation.run(vir, 100); // (destination, total events sent).
  console.log("done");
  stats.summary();
  eventSummary(events);
  stageSummary([vir]) //In output: "Overview of event time spent in stage" and "...behavior in stage", prints info of vir.
}
work();

//metronome.setTimeout(breakVir, 5000);

//After setting a server's availability to 0, the server cannot service events.
function breakVir() {
  vir.availability = 0;
}

function poll() {
    const now = metronome.now();
    const eventRate = simulation.getArrivalRate();
  
    stats.record("poll", {
      now, eventRate,
    });
  }
  metronome.setInterval(poll, 1000);