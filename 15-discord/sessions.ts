import { Stage, Event, FIFOQueue, WrappedStage } from "../../src";

export class Sessions extends WrappedStage {
  // private resourcesUsed: number = 0;
  public maxResources: number = 1e9;
  private memoryNeededPerEvent = 1e4;

  public hasCrashed: boolean = false;

  constructor(protected wrapped: Stage) {
    super(wrapped);
    this.inQueue = new FIFOQueue(Infinity, 4);
  }


  async workOn(event: Event): Promise<void> {
    if (this.hasCrashed) {
      throw "fail";
    }

    // await metronome.wait(10);
    await this.wrapped.accept(event);

    if (this.hasCrashed) {
      throw "fail";
    }

  }

  public getResourcesUsed(): number {
    return this.hasCrashed ? 0 : (this.inQueue as any).length() * this.memoryNeededPerEvent;
  }



  protected async add(event: Event): Promise<void> {
    // if (this.resourcesUsed >= this.maxResources)
    const resourcesUsed = this.getResourcesUsed();

    if (resourcesUsed >= this.maxResources) {
      this.hasCrashed = true;
    }
  }

}