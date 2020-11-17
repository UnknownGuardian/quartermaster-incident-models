import { Stage, Event, metronome, normal } from "../../src";
import { PostgreSQLCluster } from "./cluster"

export class Pacemaker extends Stage {
  constructor(protected databases: PostgreSQLCluster[]) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // Transfer some work to a random server
    const r = Math.floor(Math.random() * this.databases.length)
    await this.databases[r].accept(event);
  }
}