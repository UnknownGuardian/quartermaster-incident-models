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
    FIFOQueue
  } from "../../src";
  import { Redo } from "./redo";
  import { S3Server } from "./server";
  import { Filesystem } from "./filesystem";
  import { APIService } from "./api";

  const S3 = new S3Server();

  const timeout = new Timeout(S3);
  timeout.timeout = 300; // events time out after x ticks. x = 75% of mean cumulative distribution

  const redo = new Redo(timeout);
  redo.attempts = 2;

  const fs = new Filesystem(redo);

  const api = new APIService(fs);
  
  // scenario
  simulation.keyspaceMean = 1000;
  simulation.keyspaceStd = 200;
  simulation.eventsPer1000Ticks = 1000;
  
  // Initializes the flow of events.
  async function work() {
    const events = await simulation.run(api, 80000); // (destination, total events sent).
    console.log("done");
    eventSummary(events);
    stageSummary([api, fs, redo, timeout, S3]);
    stats.summary(true);
  }

  // Triggers the timeout failures
  function breakS3AndRedo() {
        S3.availability = 0.980; // "The overall S3 request failure rate did not significantly increase"
        //timeout.timeout = 3; // this increases the failure rate // TODO play with queue times or replace queue with changes to mean latency in incident.ts?
        redo.redoRate /= 100; // this increases the rate of retries
    }

  function calculateDereferenceLog() {
    /*
    fs.diskUsed -= fs.dereferenceLog; // remove old log from diskUsed
    if (fs.FSRunning)
        fs.dereferenceLog = fs.dereferenced;
    else
        fs.dereferenceLog += fs.dereferenced; // TODO flawed logic here. dereferenceLog should equal dereferenced unless this.FSRunning is false. Then this happens as written.
    fs.diskUsed += fs.dereferenceLog; // add new log to diskUsed
    */
    fs.diskUsed -= fs.dereferenceLog; // remove old log from diskUsed
    if (fs.cleanupDereferenced)
        fs.dereferenceLog = fs.dereferenced;
    else
        fs.dereferenceLog += fs.dereferenced;
    fs.diskUsed += fs.dereferenceLog; // add new log to diskUsed

    }

  // Simulates the background job aborting multiple times.
  function breakDereferenceLog() {
        fs.logRate = 100;
  }
  
  
  function breakFSCleanup() {
        fs.cleanupDereferenced = false;
  }

  function poll() {
    const now = metronome.now();
    const eventRate = simulation.getArrivalRate() / 2;
    const dereferenceLog = fs.dereferenceLog;
    const diskUsed = fs.diskUsed;
    const deletableEvents = fs.dereferenced;
    const isFSRunning = fs.FSRunning;
  
    stats.record("poll", {
      now, eventRate, isFSRunning, diskUsed, dereferenceLog, deletableEvents
    });
  }


  work();
  metronome.setInterval(poll, 500);
  metronome.setInterval(() => calculateDereferenceLog(), fs.logRate);
  metronome.setInterval(() => fs.cleanup(), fs.cleanupRate); 
  metronome.setTimeout(breakS3AndRedo, 5000);
  metronome.setTimeout(breakFSCleanup, 5000);
  metronome.setTimeout(breakDereferenceLog, 5000);

  // Unresolved promise, 