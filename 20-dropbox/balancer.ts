import { Stage, Event, metronome, normal } from "../../src";
import { Database } from "./database"

export class Balancer extends Stage {
  constructor(protected databases: Database[]) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // do some work
    const r = Math.floor(Math.random() * this.databases.length) 
    await this.databases[r].accept(event);
  }
}