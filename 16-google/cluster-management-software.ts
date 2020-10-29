import { Stage, Event, metronome, WrappedStage } from "../../src";

export class ClusterManagementSoftware extends WrappedStage {
  public percentDropPackets = 0;

  private lastInboundSampled: number = 0;
  private lastOutboundSampled: number = 0;

  private inboundCounter: number = 0;
  private outboundCounter: number = 0;

  private interval = 100;

  constructor(protected wrapped: Stage) {
    super(wrapped);
    metronome.setInterval(() => this.resetCounts(), this.interval);
  }

  async workOn(event: Event): Promise<void> {
    this.inboundCounter++;
    await this.wrapped.accept(event);

    if (Math.random() < this.percentDropPackets) {
      // never return here
      await metronome.wait(999999);
    }

    this.outboundCounter++;
  }

  public resetCounts() {
    this.lastInboundSampled = this.inboundCounter;
    this.lastOutboundSampled = this.outboundCounter;
    this.inboundCounter = 0;
    this.outboundCounter = 0;
  }

  // events cms received / 1000 ticks
  public getIncomingTrafficRate(): number {
    return this.lastInboundSampled * 1000 / this.interval;
  }

  // events that finished / 1000 ticks
  public getOutgoingTrafficRate(): number {
    return this.lastOutboundSampled * 1000 / this.interval;
  }
} 