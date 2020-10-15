import { Event, metronome, normal, Stage, WrappedStage } from "../../src"; //implement wrappedstage class from wrapped-stage.ts
import { Timeout } from "./timeout";

export class Retry extends WrappedStage {
    /*
  constructor(protected wrapped: WrappedStage) {
    super(Timeout);
  }
  */
  async workOn(event: Event): Promise<void> {
    // Do some work
    const latency = normal(8, 2); //latency between 6 and 10
    await metronome.wait(latency);
    await this.wrapped.accept(event);
  }
}