import {
  metronome,
  FIFOQueue,
  simulation,
  stats, Timeout, TimedDependency, stageSummary, eventSummary
} from "../../src";

import { Database } from "./database"
import { Webhook } from "./webhook";


const data = new Database();

const webhook = new Webhook(data);
const timeOut = new Timeout(webhook);

// const service = new ResourceStage(presence)
// service.maxResoursces = max amount;
/// service.resources = 0;
//presence.mean = presence.errorMean = 20;
//presence.std = presence.errorStd = 5;

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 3000;

async function work() {
  const events = await simulation.run(timeOut, 20000);
  console.log("done");


  eventSummary(events);

  //stats.summary(true);
}
work();

// stats
function poll() {
  //const queue = data.inQueue as FIFOQueue;
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  // crashed?
  // how long queue?


  stats.record("poll", { now, eventRate, });


}
metronome.setInterval(poll, 1000);
