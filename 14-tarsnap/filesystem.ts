import { Stage, metronome, Event, normal, FIFOQueue } from "../../src";



// Allow passage to lower level stuff normally
// when failed (no resources) then it, starts rejecting all events
export class Filesystem extends Stage {

  public diskIsFull: boolean = false;

  constructor(protected wrapped: Stage) {
    super();
    this.inQueue = new FIFOQueue(Infinity, 100); //queue length ( (Events a worker can run), (number of workers) )
  }

  async workOn(event: Event): Promise<void> {
    if (this.diskIsFull) {
      throw "fail";
    }
    await this.wrapped.accept(event);
  }
}