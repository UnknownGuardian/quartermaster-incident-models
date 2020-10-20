import { metronome, Event, WrappedStage, normal } from "../../src";

export class HAProxy extends WrappedStage {

  async workOn(event: Event): Promise<void> {
    // do some work
    const latency = normal(8, 2);
    await metronome.wait(latency);
    await this.wrapped.accept(event);

  }
}