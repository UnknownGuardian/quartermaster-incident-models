import { Stage, FIFOQueue, Event, metronome, normal, exponential } from "../../src";
export class Database extends Stage {
 
public availability = 0.995;

public concurrent = 0;


  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 5);
  }

  async workOn(event: Event): Promise<void> {
    this.concurrent++;

    const extraLatency = normal(this.concurrent, this.concurrent/10);
    const latency = normal(8, 2);
    await metronome.wait(latency + extraLatency);
  
    if (Math.random() > 0.995){
        this.inQueue.setNumWorkers(5);
    }


    
    this.concurrent--;

    if (Math.random() > this.availability){
        throw "fail";
    }

  }
}