/**
 * An exploration which demonstrates the queue growing and processing halting
 * after traffic exceeds 1900 events / 1000 ticks.
 * 
 * This exploration exists to prove the design of the Database and Build
 * Service appropriately mock the architecture and problems listed in the 
 * incident report.
 * 
 */

import {
    metronome,
    simulation,
    stats,
    LRUCache,
    Timeout,
    stageSummary,
    eventSummary
  } from "../../src";
import { Database } from "./database"
import { APIService } from "./api-service"

const db = new Database();
const cache = new LRUCache(db);
const apiService = new APIService(cache);
const timeOut = new Timeout(apiService);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 1500;

async function work() {
  const events = await simulation.run(timeOut, 50000);
  console.log("done");
  stageSummary([db,cache,apiService]);
  eventSummary(events);
  stats.summary();
}
work();



function poll() {
  const now = metronome.now();

  const eventRate = simulation.getArrivalRate();
  const obj: any = {
    now, eventRate, cacheSize : Object.keys(cache.getStore()).length
  }

  stats.record("poll", obj);
}
metronome.setInterval(poll, 1000);




//function clearCache(){
function zookeeperTerminated() {
  cache.clear();
}
//metronome.setTimeout(zookeeperTerminated , 15000)
metronome.setTimeout( zookeeperTerminated , 8000);