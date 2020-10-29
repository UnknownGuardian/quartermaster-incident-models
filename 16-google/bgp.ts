import { Stage, metronome, normal } from "../../src";

export class BGP extends Stage {
  public BGPWorking: boolean;
  public BGPTotal: number = 0;
  constructor() {
    super();
    this.BGPWorking = true;
  }

  async workOn(): Promise<void> {
    const latency = normal(8, 2); //latency between 6 and 10
    this.BGPTotal++;
    await metronome.wait(latency);
  }
}