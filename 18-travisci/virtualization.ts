import { Stage, Event, metronome, normal, standardNormal, TimedDependency, FIFOQueue } from "../../src";

export class Virtualization extends Stage {
  private resourcesUsed: number = 0;
  private maxResources: number = 6000;
  public janitorProcessWorking: boolean;
  constructor() {
    super();
    this.inQueue = new FIFOQueue(Infinity, 220); //queue length ( (Events a worker can run), (number of workers) )
    this.janitorProcessWorking = true;
  }

  async workOn(event: Event): Promise<void> {
    await this.createVM(event);
    await this.run(event);
    await this.cleanup(event);
  }

  async createVM(event: Event): Promise<void> {
    // try to create a new VM if there is resources
    // otherwise fail immediately
    if (this.resourcesUsed > this.maxResources)
      throw "fail";

    this.resourcesUsed++;
  }

  async run(event: Event): Promise<void> {
    const latency = normal(10, 2);
    await metronome.wait(latency);
  }

  async cleanup(event: Event): Promise<void> {

    // if old configuration, always deallocate resources
    // if new configuration never deallocate resources
    if (this.janitorProcessWorking) {
      this.resourcesUsed--;
    }
  }
}

