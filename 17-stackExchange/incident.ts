import {
    metronome,
    FIFOQueue,
    simulation,
    stats, Timeout, TimedDependency, stageSummary, eventSummary
  } from "../../src";
  
  import { Iptables } from "./iptables"
  import { HAProxy } from "./HAProxy"

  const webServer = new TimedDependency();
  const ip = new Iptables(webServer);
  const hap = new HAProxy(ip);
  const timeOut = new Timeout(hap);
 
  
  // scenario
  simulation.keyspaceMean = 1000;
  simulation.keyspaceStd = 200;
  simulation.eventsPer1000Ticks = 1500;
  
  async function work() {
    const events = await simulation.run(timeOut, 50000);
    console.log("done");

    stageSummary([webServer, ip, hap]);
    eventSummary(events);

    stats.summary();
  }
  work();
  
  // stats
  function poll() {
    const queue = hap.inQueue as FIFOQueue;
    const now = metronome.now();
    const eventRate = simulation.getArrivalRate();
    //const b : Boolean = ip.allowInboudTraffic;
    const fails = ip.failCount;


    stats.record("poll", { now, eventRate, fails });
  
    simulation.eventsPer1000Ticks += 100;
  }
  metronome.setInterval(poll, 1000);




function failure() {
  ip.allowInboudTraffic = false;
}
metronome.setTimeout(failure, 8000);


function repair() {
  ip.allowInboudTraffic = true;
}
metronome.setTimeout(repair, 17000);