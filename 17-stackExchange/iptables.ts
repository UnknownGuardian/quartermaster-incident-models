import { Stage, Event, metronome, normal } from "../../src";



export class Iptables extends Stage {

public allowInboudTraffic : boolean = true; 
public failCount = 0;

    constructor(protected wrapped: Stage) {
    super();
  }


  async workOn(event: Event): Promise<void> {
    // do some work
 
    if (this.allowInboudTraffic)
    {
       await this.wrapped.accept(event);
    }
    else
    {
        await this.wrapped.accept(event);
        this.failCount++;
        throw "fail";
        
    }


  }
}