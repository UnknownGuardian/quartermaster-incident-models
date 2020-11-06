import { WrappedStage } from "../../src/stages/wrapped-stage";
import { Event, metronome, normal } from "../../src";


/**
 * Retry a wrapped stage more than once.
 * 
 * `stage.attempts` should be >=2 for at least one retry.
 */
export class Redo extends WrappedStage {
  public attempts: number = 2;
  public redoRate: number = 200;
  async workOn(event: Event): Promise<void> {
    let attempt: number = 1;
    while (attempt <= this.attempts) {
      try {
        const latency = normal(this.redoRate, 2); //latency between 6 and 10
        //await metronome.wait(latency);
        await this.wrapped.accept(event);
        return;
      }
      catch {
        attempt++;
      }
    }
    throw "fail"
  }
}