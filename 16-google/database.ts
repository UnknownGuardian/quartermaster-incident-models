import { Stage, Event, metronome, TimedDependency } from "../../src";

export class Cluster extends Stage {
  public queue0: number = 0;
  public queue1: number = 0;
  public queue2: number = 0;
  public queueArray = [
    this.queue0,
    this.queue1,
    this.queue2
  ];
  private queueLimit: number = 2500;
  constructor(protected cluster: Server[]) {
    super();
    metronome.setInterval(() => this.resetClusterManagementSoftware, 1000);
  }

  // Serves the request
  // Transfer some work to a random server, or, if queueLimit is
  // reached, the server with the lowest queue.
  async workOn(event: Event): Promise<void> {
    let instance = this.networkControlSelectRandom();
    if (!instance) {
      instance = this.networkControlSelectLeastBusy();
    }
    await instance.accept(event);
  }

  // Choose a random server to serve the request
  private networkControlSelectRandom(): Server | null {
    const serverIndex = Math.floor(Math.random() * this.cluster.length);
    if (serverIndex == 0 && this.queue0 < this.queueLimit) {
      this.queue0++;
      return this.cluster[serverIndex];
    }
    else if (serverIndex == 1 && this.queue1 < this.queueLimit) {
      this.queue1++;
      return this.cluster[serverIndex];
    }
    else if (serverIndex == 2 && this.queue2 < this.queueLimit) {
      this.queue2++
      return this.cluster[serverIndex];
    }
    return null;
  }

  // Choose a server based on smallest queue to serve the request 
  private networkControlSelectLeastBusy(): Server {
    const leastBusyQueueLength = Math.min(...this.queueArray);
    if (this.queue0 == leastBusyQueueLength) {
      this.queue0++;
      return this.cluster[0];
    }
    else if (this.queue1 == leastBusyQueueLength) {
      this.queue1++;
      return this.cluster[1];
    }
    // else, always go to the last one.
    this.queue2++;
    return this.cluster[2];
  }

  //Resets ClusterManagementSoftware queue
  public resetClusterManagementSoftware() {
    this.queue0 = 0;
    this.queue1 = 0;
    this.queue2 = 0;
  }
}


export class Server extends TimedDependency {
  constructor() {
    super();
    this.mean = this.errorMean = 20;
    this.std = this.errorStd = 5;
  }
}