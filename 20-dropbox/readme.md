# ReadMe 20-DropBox 

## Incident Report

https://dropbox.tech/infrastructure/outage-post-mortem

## Summary

Sitewide outage due to failure of multiple databases, each with a master machine and two replica machines. This resulted from a defect in the upgrade script. 

## Expectations

Expecting near-100% success rate of events being returned by MySQL servers. Instead, some servers (s2) fail and lose availability, resulting in a high rate of event failures.

## Diagrams

version 1: https://app.lucidchart.com/invitations/accept/320ab037-aca9-4718-93fd-afa543adf205
version 2: https://app.lucidchart.com/invitations/accept/07dbe4a2-5294-469b-ad89-7c89c35ba2c6

## Architecture

Users on the internet send requests.
Timeout stage to receive events from the internet.
API Layer sends traffic to Elastic Load Balancer.
Elastic Load Balancer randomely sends traffic to one of six servers.
One database consists of one master server and two replica servers. 
Script prevents data coming in or out for a specified machine within one of the sets during the upgrade process.

The bug in the upgrade caused the upgrade to pass to servers regardless of whether they were servicing traffic. The upgrade then caused servers to fail while servicing traffic. 
Model in database:
    Master server
    Replica server
    Boolean state in servers indicating traffic service, indicated by 'availability'.
    Servers process events or throw failure if a server is unavailable.

## Stages

Timeout to show time taken to receive requests.
Website/API stage receives requests from internet, forwards to Elastic Load Balancer.
ELB for distributing web requests to multiple servers.
The server processes events. Failing server returns error to ELB.
Output the events' success and failure rates.

## Practical Applications

How do we prevent this?
What happens if all the database machines shut down?
How can we shorten our downtime?
How can we prevent this from happening in the future?

Possible mitigations to model:
* Properties indicating database size.
* Properties supporting a recovery function which restores the server.
* Property of production state in a server, which indicates to a function whether or not to pass an update to the server.

## Notes

9/28/2020

Will the quartermaster be visualizing the results from the programs, not just in a chart but in a graph?
Do you see this team ever adding models of the mitigation to the programs? For now we are learning to model the actual incidents, but later with a breadth of examples to work with, would we go back over and add depictions of mitigation to the models, perhaps as commented out code in incident.ts or in additional .ts files?

Given that the impact of this wiki is to both prevent and mitigate incidents, engineers would want to observe behavior that can be mitigated. Is the code's aim then to be open to experimentation by engineers? My four questions focus on whether the model should be static, allowing quick customization from engineers viewing the model, or have randomized variables. The incident report states, "In this case, a bug in the script caused the upgrade to run on a handful of machines serving production traffic."

1. A mitigation that engineers in the incident performed was to verify production state of server before passing update that triggers breakSQL. Should the incident model this state for engineers to utilize?
    * This would be easily done from adding a boolean variable productionState to each server class declaration in Database. This value would be instantiated with 'false', then assigend to true by calling Database member function sendTrafficTo.
* Our models will probably not include any mitigations performed. For now we are interested exclusively in modeling the system with its faults. It is possible at some point we'll return and code up a couple of mitigations, which may look as you've described.

2. The incident report states that the larger databases took longer to restore.
    * Should the incident files include multiple sizes of servers? How would a larger process events differently in this context? Would it have a shorter latency period, or more workers to process events in the queue?
* That is an interesting point you raise. Since recovery time is a property of the databases and not any mitigation, it is possible we are interested in this. However, since we aren't performing mitigations, we would never be calling any recovery function on the databases. So I'm thinking a no (for recovery functions and any properties of database size) for now as well. It might be a good property to put in the README for later if we want to return to this.

3. Currently the incident models a single server failing at an arbitrary value. This lacks variability. 
    * Would it be useful to randomize which servers fail for varying results in the output? Or should the capacity to set certain servers remain for optimal customization by engineers?
    * Would there ever be machines not serving production traffic outside the case of preparing for an update? If so, server availability should be restored after the update passes through this server.
* I'm don't think lack of variability is a problem. Our past simulators versions (we've done 2 iterations before arriving at Quartermaster) have been deterministic (executing it twice produces the exact same results). I actually think deterministic is more useful than any randomization since we can reproduce results given a specific seed. Variability is only useful to prove it fails in a variety of scenarios rather than just a single one, but it doesn't guarantee that other scenarios will occur.
* I think a fixed failing server is most useful. It is immediately clear that we are saying "a server failed" not "server 3 failed". That is just slightly less clear when randomizing a server to fail, though they both do the same thing. For the second part about spare machines not serving production traffic, I think there are not any in this case. There are other incidents where companies uses additional redundant servers with copies that don't receive live traffic and are ready to jump in quickly on failure. I'm not sure if that is what this question was asking though.

4. An update is an event that workers would process. If we are modeling behavior of events passed through servers by latency, that would include the update. The server would first attempt to process the event which triggers default latency, then cause increased latency from other workers as they fail, before failing outright. Should there be multiple types of events passed to servers so that different behavior can occur? Should the failure of the database occur in stages, or decreasing numbers of events being processed?
    * This event could feasibly be generated in incident, appended to function work and added among the events.
    * Receiving this update would trigger calling function breakSQL which sets availability of the server to 0.
* I think this failure would only occur in stages if you consider each server going down as a stage. I would expect their script to terminate instances immediately and not in any particular graceful or slow manner. So since we are only failing a single node, its going to look immediate in your program. If you want to scale up to a bunch of clusters and fail many nodes, then it might be spread out over some time as the script terminates them individually. I expect the script to run in sequence so it doesn't take more than some percent of the severs down at the same time.