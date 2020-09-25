import { Event, metronome, normal, WrappedStage } from "../../src";

export class EmailOfuscationService extends WrappedStage {
  async workOn(event: Event): Promise<void> {
    await metronome.wait(normal(10, 2));
    await this.wrapped.accept(event);
  }

}