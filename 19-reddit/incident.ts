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
  eventSummary,
  WrappedStage,
  Event
} from "../../src";
import { Database } from "./database"
import { APIService } from "./api-service"


class AvailableStage extends WrappedStage {
  public availability = 1;
  async workOn(event: Event): Promise<void> {
    const available = Math.random() < this.availability;
    if (available) {
      await this.wrapped.accept(event);
      return;
    }
    return Promise.reject("fail");
  }
}

const db = new Database();
const cache = new LRUCache(db);
const availableCache = new AvailableStage(cache);
const apiService = new APIService(availableCache);
const timeOut = new Timeout(apiService);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 1500;

async function work() {
  const events = await simulation.run(timeOut, 50000);
  console.log("done");
  stageSummary([db, cache, apiService]);
  eventSummary(events);
  stats.summary();
}
work();



function poll() {
  const now = metronome.now();

  const eventRate = simulation.getArrivalRate();
  const obj: any = {
    now, eventRate, cacheSize: Object.keys(cache.getStore()).length
  }

  stats.record("poll", obj);
}
metronome.setInterval(poll, 1000);




// segment 2 (zookeeper shuts down servers)
const failureSegment2 = 8000;
function zookeeperTerminated() {
  cache.clear();
  availableCache.availability = 0;
}
metronome.setTimeout(zookeeperTerminated, failureSegment2);



// segment 3 (caches are empty, slow site
const rebootTime = 5000;
const segment3Time = failureSegment2 + rebootTime;
function recover() {
  availableCache.availability = 1;
}
metronome.setTimeout(recover, segment3Time)