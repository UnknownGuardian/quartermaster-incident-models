/**
 * An exploration which demonstrates 
 * 
 * This exploration exists to prove the design of the appropriately mock the architecture and problems listed in the incident report.
 * 
 */

// TODO eliminate source of unnecessary latency that makes program run past poll times. DONE eliminate queue from server.ts
// TODO calculateDereferenceLog run 142 times over incident.
// TODO find out mismatch between isFSRunning and diskUsed during output


import {
  metronome,
  simulation,
  stats,
  eventSummary,
  stageSummary,
  Timeout,
  Retry,
} from "../../src";
import { S3Server } from "./server";
import { Filesystem } from "./filesystem";
import { APIService } from "./api";

const S3 = new S3Server();

//const timeout = new Timeout(S3);
//timeout.timeout = 300; // events time out after x ticks. x = 75% of mean cumulative distribution

//const redo = new Redo(timeout);
//redo.attempts = 2;
const retry = new Retry(S3);
retry.attempts = 5;

const fs = new Filesystem(retry);

const api = new APIService(fs);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 1000;

// Initializes the flow of events.
async function work() {
  const events = await simulation.run(api, 80000); // (destination, total events sent).
  const pre = events.slice(0, 5000 * simulation.eventsPer1000Ticks / 1000);
  const post = events.slice(5000 * simulation.eventsPer1000Ticks / 1000);


  console.log("Pre:");
  eventSummary(pre);
  console.log("Post:");
  eventSummary(post);


  console.log("done");
  eventSummary(events);
  stageSummary([api, fs, retry, S3]);
  stats.summary(true);
}


function fileSystemCleanupJobFailed() {
  fs.diskIsFull = true;

  //S3.availability = 0.980; // "The overall S3 request failure rate did not significantly increase"
  //timeout.timeout = 3; // this increases the failure rate // TODO play with queue times or replace queue with changes to mean latency in incident.ts?
  //redo.redoRate /= 100; // this increases the rate of retries
}

function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate() / 2;
  /*const dereferenceLog = fs.dereferenceLog;
  const diskUsed = fs.diskUsed;
  const deletableEvents = fs.dereferenced;
  const isFSRunning = fs.FSRunning;*/

  stats.record("poll", {
    now, eventRate, /*isFSRunning, diskUsed, dereferenceLog, deletableEvents*/
  });
}


work();
metronome.setInterval(poll, 500);
//metronome.setTimeout(fileSystemCleanupJobFailed, 5000);
