# 18-TravisCI

## Incident Report

https://www.traviscistatus.com/incidents/khzk8bg4p9sy

## Expectations

Events passed to the createVM process in the virtualization layer will fail upon arrival. The cleanup function in the virtual layer will fail to remove VMs from the server because it assumes capacity was never exceeded. Workers for the createVM function will be overloaded by the demand of continuously generated VMs, and will fail events. The service will attempt to requeue the failed events.

## Diagram

* version 1: https://lucid.app/invitations/accept/604925ca-ca7b-40ab-a211-13f4af93c5cd
* version 2: https://lucid.app/invitations/accept/fc2f4a28-b200-4c01-a5ca-e05e4422f132

## Notes

Only number of servers and events processed? No database or server info needed, so no database/server stage necessary. 
What are events? VM creations.
number of servers is not mentioned in incident.
Variable for tracking VMs. VM creation/cleanup is focus. 
Cleanup queue's inability to authenticate built VM's is the failure.
In incident, define cluster capacity with function. In incident, breakCleanup function sets cleanup queue capacity to 0 or otherwise breaks availability of something, preventing cleanup.

Can't break cleanup in virtual without a parameter change in the constructor. Since virtual inherits availability property from Stage, I can create a function in incident which breaks Cleanup by modifying availability, like in 20-dropbox incident. 

Virtualization class with three subprocesses. Functions? Async for call in Virtualization stage or public for call in incident?
Each function must be a fifo queue with latency to process events. Should number of workers be a variable that is reinitialized with each iteration of one of the functions? This would model an interdependency among the three functions because run cannot process its queue if capacity is exceeded.
This variable represents worker capacity, and would model the ability for a function like build or run to be serviced. If the load exceeds 200, which it will because cleanup will fail, then the capacity will be exceeded. What indicates that the capacity has been exceeded?

Should there be a separate event flow for events not related to VM creation/cleanup? These events could be serviced by the run function in virtualization if server capacity has not been exceeded, ie if there are available workers. If so, then rather than accepting events, the three queues would accept a VM object which has queue capacity property. With 200 objects drawing on a server capacity arbitrarily defined, then the system will show a failure to process events.

Cleanup, according to the incident report, is meant to update the indicated capacity. If it doesn't run, then capacity isn't updated. So build will service despite exceeded capacity, and run will not service after calling on exceeded capacity.

Current plan for Virtualization Class:
Constructor takes in events.
Variables to model:
Events succeeding or failing.
Variables to use in virtualization stage:
Events.
Current server capacity.
Define virtualization class with three async functions that form a large queue. Events will still enter the first function's queue while events are exiting the last function's queue. 
Function Build 1 will run if VM count is less than 200. Function 2 Run will throw a failure if server capacity is exhausted. Function 3 Cleanup will update the VM count number.
Question to answer: Should I create VM objects? Or should I leave VM's as events? Should VM exceeding 200 indicate a stop for built events or should exceeded capacity indicate a stop for built events?