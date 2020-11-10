import { Stage, Event, metronome, TimedDependency, FIFOQueue } from "../../src";

export class Cluster extends Stage {
  public queue0: number = 0;
  public queue1: number = 0;
  public queue2: number = 0;
  public queueArray = {
    0: this.queue0, 
    1: this.queue1, 
    2: this.queue2
  };
  public sortedArray = [];
  public whichServer: number = 0;
  private queueLimit: number = 2500;
  constructor(protected cluster: Server[]) {
    super();
    metronome.setInterval(() => this.resetClusterManagementSoftware, 1000);
  }

  // Serves the request
  // Transfer some work to a random server
  async workOn(event: Event): Promise<void> {
    const instance = this.networkControlOne();
    if (this.whichServer == 0 && this.queue0 < this.queueLimit)
      this.queue0++;
    else if (this.whichServer == 1 && this.queue1 < this.queueLimit)
      this.queue1++;
    else if (this.whichServer == 2 && this.queue2 < this.queueLimit)
      this.queue2++
    else {
      this.networkControlTwo();
      //increase this.queueArray[,0]++
      //set instance = this.cluster[this.queueArray[0,]];
    }
    await instance.accept(event);
  }

  // Choose a cluster to serve the request
  private networkControlOne(): Server {
    this.whichServer = Math.floor(Math.random() * this.cluster.length);
    return this.cluster[this.whichServer];
  }

  //TODO test this to see if it sorts
  private networkControlTwo() {
    for (var array in this.queueArray) {
      this.sortedArray.push([array, this.queueArray[array]]);
    }
    this.sortedArray.sort(function(a,b) {
      return a[1] - b[1];
    });
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
    this.inQueue = new FIFOQueue(1, 50);
    this.mean = this.errorMean = 20;
    this.std = this.errorStd = 5;
  }
}