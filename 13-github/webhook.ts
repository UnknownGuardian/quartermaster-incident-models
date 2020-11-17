import { Stage, Event, metronome, normal } from "../../src";




export class Webhook extends Stage {


  constructor(protected wrapped: Stage) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // do some work
    //const latency = normal(8, 2);
    //await metronome.wait(latency);
    if (event.response) {
      throw "fail";
    }
    else {
      await this.wrapped.accept(event);
    }

  }
}