/**
 * An exploration which demonstrates 
 * 
 * This exploration exists to prove the design of the  appropriately mock the architecture and problems listed in the 
 * incident report.
 * 
 */

import {
    metronome,
    simulation,
    stats,
    FIFOQueue,
    eventSummary, 
    stageSummary
  } from "../../src";
  import { ContentDeliveryNetwork } from "./content-delivery-network"
  import { WebApplicationFirewall } from "./web-application-firewall";

  const cdn = new ContentDeliveryNetwork();

  const waf = new WebApplicationFirewall(cdn);

  // scenario
  simulation.keyspaceMean = 1000;
  simulation.keyspaceStd = 200;
  simulation.eventsPer1000Ticks = 1000;
  
  //Initializes the flow of events.
  async function work() {
    const events = await simulation.run(waf, 30000); // (destination, total events sent).
    console.log("done");
    stats.summary();
    eventSummary(events);
    stageSummary([waf, cdn]) //In output: "Overview of event time spent in stage" and "...behavior in stage", prints info of api, bal, s1, then failing server s2.
  }
  work();
  
  //After setting a server's availability to 0, the server cannot service events.
  function breakCPUProtection() {
    waf.protectionWorking = false;
    waf.availability = 0.20;
  }
  metronome.setTimeout(breakCPUProtection, 5000);
  
  //stats
  function poll() {
    const now = metronome.now();
    const eventRate = simulation.getArrivalRate();
    const queueLength = (waf.inQueue as FIFOQueue).length(); // TODO queuelength returns 0.
    const availableResources = waf.getResourceUtilization();
    const protectionOn = waf.protectionWorking;
  
    stats.record("poll", {
      now, eventRate, availableResources, queueLength, protectionOn

    });
  }
  metronome.setInterval(poll, 1000);