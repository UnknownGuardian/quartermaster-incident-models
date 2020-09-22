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
    FIFOQueue,
    Retry,
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



function clearCache(){
  cache.clear();
}
metronome.setTimeout(clearCache, 8000);