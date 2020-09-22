# ReadMe 20-DropBox 

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

## Diagrams

version 1: https://app.lucidchart.com/documents/edit/e9476a59-558c-49f6-9618-0bc8440e7754/0_0
version 2: https://app.lucidchart.com/documents/edit/fa0aa99e-1d27-47be-9bf7-c9c39c0cd75b/0_0#?folder_id=home&browser=icon

## Notes

Top titles correspond to quartermaster names.
Middle titles correspond to names/stages listed in the .yaml and .md files.

TODO Replicas don't fail when the master fails.
TODO Replica-master pairs fail, then the other replica gets promoted to master 
do we need to model a replica master pair resyncing when a replica gets promoted to master?
Replica extending database causes an infinite loop.
TODO Replica and Master must extend stage 
Model a failover during the incident.
TODO Define an arbitrary capacity for databases 
TODO Redis event has architecture for a good Stage extension as database model. 
TODO Timed Dependency provides latency for events rather than pass-fail throws. 