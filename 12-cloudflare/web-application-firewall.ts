import { Stage, Event, metronome, normal, FIFOQueue, TimedDependency } from "../../src";

export class WebApplicationFirewall extends TimedDependency {
  private resourcesUsed: number = 0;
  private maxResources: number = 5000;
  public protectionWorking: boolean;
  public inQueue = new FIFOQueue(1, 300);
  constructor(protected wrapped: Stage) {
    super();
    //this.inQueue = new FIFOQueue(Infinity, 220); //queue length ( (Events a worker can run), (number of workers) )
    this.protectionWorking = true;
  }

  //TODO decide whether to rename cloudflare-edge to web-application-firewall
  //TODO decide whether to cause failures from failed resources counter
  // or from arbitrarily set availability.
  async workOn(event: Event): Promise<void> {
    //Do some work
    const latency = normal(8, 2); //latency between 6 and 10
    await metronome.wait(latency);
    // Check for available cpu memory
    //await this.ProtectCPUUsage(event);
    //await this.runOnCPU();
    //await this.RegularExpression();
    await this.wrapped.accept(event);
    //this.resourcesUsed--
  }
  
  //TODO get events to pass through this queue via a function call rather than
  // through the constructor
  /*async ProtectCPUUsage(event: Event): Promise<void> {
    if ((this.resourcesUsed >= this.maxResources) && this.protectionWorking)
        this.inQueue;
  }*/

  async runOnCPU(): Promise<void> {
    if (this.resourcesUsed >= this.maxResources)
      throw "fail";
    else
        this.resourcesUsed++;
  }

  async RegularExpression(): Promise<void> {
      if (!this.protectionWorking && !(this.resourcesUsed >= this.maxResources))
        this.resourcesUsed+=1;
  }

  public getResourceUtilization() {
    return this.maxResources - this.resourcesUsed;
  }
}
