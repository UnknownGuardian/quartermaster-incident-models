import {
  metronome,
  FIFOQueue,
  simulation,
  stats, Timeout, TimedDependency, eventSummary
} from "../../src";

import { Sessions } from "./sessions"


const presence = new TimedDependency();

const sessions = new Sessions(presence);
const timeOut = new Timeout(sessions);


presence.mean = presence.errorMean = 20;
presence.std = presence.errorStd = 5;

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 3000;

async function work() {
  const events = await simulation.run(timeOut, 200000);
  console.log("done");


  eventSummary(events);

  stats.summary(true);
}
work();

// stats
function poll() {
  const queue = sessions.inQueue as FIFOQueue;
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();
  const crash = sessions.hasCrashed;
  const resourceUtilization = sessions.getResourcesUsed() / sessions.maxResources;

  stats.record("poll", { now, eventRate, crash, resourceUtilization });


}
metronome.setInterval(poll, 1000);
