/**
 * Models some of the architecture of Discord during the incident
 * described in an October 2017 incident report.
 * 
 * https://discordstatus.com/incidents/qk9cdgnqnhcn
 * 
 */

import {
  simulation,
  stageSummary,
  eventSummary,
  metronome,
  stats,
  Event, WrappedStage
} from "../../src";
import { EmailOfuscationService } from "./email-obfuscation-service";
import { ParserService } from "./parser-service";


const parser = new ParserService();
const emailObfuscationService = new EmailOfuscationService(parser);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 200;

async function work() {
  const events = await simulation.run(emailObfuscationService, 100000);
  console.log("done");
  eventSummary(events, [
    {
      name: "ParseError",
      func: (events: Event[]) => events.filter(e => (e as any)["parseError"]).length
    }
  ]);
}
work();

