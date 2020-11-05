import { Stage, metronome, Event, normal, FIFOQueue } from "../../src";

export class Filesystem extends Stage {

  private diskCapacity: number = 10000;
  public diskUsed: number = 0;
  public dereferenced: number = 0;
  public dereferenceLog: number = 0;
  public cleanupRate: number = 4500;
  public logRate: number = 4000;
  public cleanupDereferenced: boolean = true;
  public FSRunning: boolean = true;

  constructor(protected wrapped: Stage) {
    super();
    this.inQueue = new FIFOQueue(Infinity, 100); //queue length ( (Events a worker can run), (number of workers) )
  }

  async workOn(event: Event): Promise<void> {
    await this.write(event);
    //const latency = normal(200, 10); // time the event spends "stored" on the server.
    //await metronome.wait(latency); 
    this.dereferenced++; // TODO have this.dereferenced++ happen after this await function happens.
  }

  async write(event: Event): Promise<void> {
    if (this.diskUsed >= this.diskCapacity) {
        this.FSRunning = false;
        throw "fail"; // unhanlded promise rejection warning = warning, event handling not handling a thrown "fail".
    }
    this.FSRunning = true;
    await this.wrapped.accept(event);
    this.diskUsed++;
  }

  public cleanup(): void {
    this.diskUsed -= this.dereferenced;
    this.dereferenced = 0;
    if (this.cleanupDereferenced) {
        this.diskUsed -= this.dereferenceLog;
        this.dereferenceLog = 0;
    }
  }
}