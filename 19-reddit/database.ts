import { dir } from "console";
import { Stage, FIFOQueue, Event, metronome, normal, exponential } from "../../src";
export class Database extends Stage {
 
public availability = 0.995;

public concurrent = 0;


  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 300);
  }

  async workOn(event: Event): Promise<void> {
    this.concurrent++;

    const extraLatency = normal(this.concurrent, this.concurrent/10);
    const latency = normal(8, 2);
    await metronome.wait(latency + extraLatency);
  
    if (Math.random() > 0.995){

      if (this.inQueue.getNumWorkers() < 21) {
        this.inQueue.setNumWorkers(10)
      } else {
        this.inQueue.setNumWorkers(this.inQueue.getNumWorkers() - 20);
        
      }

    }

    
    this.concurrent--;

    if (Math.random() > this.availability){
        throw "fail";
    }

  }
}