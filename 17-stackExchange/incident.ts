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
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();
  const inboundTrafficAllowed: Boolean = ip.allowInboudTraffic;
  const blockedTrafficCount = ip.blockedTrafficCount;

  stats.record("poll", { now, eventRate, blockedTrafficCount, ipTablesAllowingInboundTraffic: inboundTrafficAllowed });
}
metronome.setInterval(poll, 1000);


function puppetConfigChange() {
  ip.allowInboudTraffic = false;
}
metronome.setTimeout(puppetConfigChange, 8000);


function revertPuppetConfigChange() {
  ip.allowInboudTraffic = true;
}
metronome.setTimeout(revertPuppetConfigChange, 17000);