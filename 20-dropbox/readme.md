# ReadMe 20-DropBox 

https://dropbox.tech/infrastructure/outage-post-mortem

## Summary
Sitewide outage due to failure of multiple databases, each with a master machine and two replica machines. This resulted from a defect in the upgrade script. One computer severed the connection between a master machine and its replica machines through a defect in the sent upgrade script.

## Architecture

3 sets of {1 master, 2 replicas}. 
Before those, we have the elastic load balancer layer, preceeded by API layer.
When the master fails, the replicas replicate the failed master. When the replica fails, they lose redundancy and must resync.
Script prevents data coming in or out for a specified machine within one of the sets during the upgrade process.

In other words, a series of requests pass to the database set. When replicas fail, they resync with the master. However, if the connection fails, they cannot resync. If the master fails, then the replicas both fail. If all three fail, then the requests cannot be serviced, and returns failure to the balancer.

The bug in the upgrade caused the upgrade to pass to servers regardless of whether they were servicing traffic. The upgrade then caused replicas to fail while servicing traffic. 
Model in database:
    Master server
    Replica server
    Boolean state in servers indicating traffic service.
    Servers process traffic and return

### Diagrams

version 1: https://app.lucidchart.com/documents/edit/e9476a59-558c-49f6-9618-0bc8440e7754/0_0
version 2: https://app.lucidchart.com/documents/edit/fa0aa99e-1d27-47be-9bf7-c9c39c0cd75b/0_0#?folder_id=home&browser=icon

## Practical Applications

What engineers want to ask the system? Questions?
How do we prevent this? What are we interested in looking at?
What happens if all the database machines shut down?
How can we improve our downtime?
How can we prevent this from happening in the future?

## Stages

Timeout
ELB for distributing web requests to multiple databases
Website/API stage receives requests from internet and makes calls to databases.
failing database returns error if severed.
Which stages come in which order?

## Notes

Top titles correspond to quartermaster names.
Middle titles correspond to names/stages listed in the .yaml and .md files.

TODO Replicas don't fail when the master fails.
TODO Replica-master pairs fail, then the other replica gets promoted to master 
do we need to model a replica master pair resyncing when a replica gets promoted to master?
Model a failover during the incident.

9/28/2020

Will the quartermaster be visualizing the results from the programs, not just in a chart but in a graph?
Do you see this team ever adding models of the mitigation to the programs? For now we are learning to model the actual incidents, but later with a breadth of examples to work with, would we go back over and add depictions of mitigation to the models, perhaps as commented out code in incident.ts or in additional .ts files?

Given that the impact of this wiki is to both prevent and mitigate incidents, engineers would want to observe behavior that can be mitigated. Is the code's aim then to be open to experimentation by engineers? My four questions focus on whether the model should be static, allowing quick customization from engineers viewing the model, or have randomized variables. The incident report states, "In this case, a bug in the script caused the upgrade to run on a handful of machines serving production traffic."

1. A mitigation that engineers in the incident performed was to verify production state of server before passing update that triggers breakSQL. Should the incident model this state for engineers to utilize?
* This would be easily done from adding a boolean variable productionState to each server class declaration in Database. This value would be instantiated with 'false', then assigend to true by calling Database member function sendTrafficTo.

2. The incident report states that the larger databases took longer to restore.
    * Should the incident files include multiple sizes of servers? How would a larger process events differently in this context? Would it have a shorter latency period, or more workers to process events in the queue?

3. Currently the incident models a single server failing at an arbitrary value. This lacks variability. 
    * Would it be useful to randomize which servers fail for varying results in the output? Or should the capacity to set certain servers remain for optimal customization by engineers?
        * Would there ever be machines not serving production traffic outside the case of preparing for an update? If so, server availability should be restored after the update passes through this server.

4. An update is an event that workers would process. If we are modeling behavior of events passed through servers by latency, that would include the update. The server would first attempt to process the event which triggers default latency, then cause increased latency from other workers as they fail, before failing outright. Should there be multiple types of events passed to servers so that different behavior can occur? Should the failure of the database occur in stages, or decreasing numbers of events being processed?
    * This event could feasibly be generated in incident, appended to function work and added among the events.
    * Receiving this update would trigger calling function breakSQL which sets availability of the server to 0.