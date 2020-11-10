# ReadMe 16-Google

## Incident Report

https://status.cloud.google.com/incident/cloud-networking/19009

## Summary

Multiple clusters and supporting infrastructure being de-sechuled due to a defect in an upgrade script. This failure caused packet loss, client request timeouts, and increased latency.

## Expectations

Expecting near-100% success rate of events being returned by servers. Instead, some servers fail, creating a backlog of events. The failed cluster management software also begins showing packet failures, and eventually the events caught in the congested network timeout. Expect the output to display network congestion, higher latency, and event failures at multiple bottlenecks at different phases of the incident..

## Diagrams

version 1: https://lucid.app/invitations/accept/6b1c2caf-45cf-48be-9918-f7218a7547fb

## Notes

The servers didn't fail. The network control plane instances inside databases are used for resilience and control whether to send events to servers, and they had failed. They stopped working when they received the upgrade script, and the servers which accepted the upgrade script and were updating were then being protected by the BGP, which rerouted packets to other servers. This continued until the BGP failed, resulting in events stuck failing in systems.

I model the cluster management software from the incident as controlling both the load balancer and the network control plane for resilience inside the servers, and I fail both to model the incident failure. Should the only system failures be the balancer queue backlog, the servers failing due to the severed network control plane, and the timeout?

Do I really need the IP tables stage to show event failure? I'm not sure how this relates to event failures in the flow of the scenario. 

The report also describes a BGP routing service that transfers packets or events between physical locations, or databases, which fails during the upgrade. Should I model this with multiple databases which contain clusters which contain servers?

The upgrade is described as a global upgrade. Would it be a rolling upgrade or should all failures be stimultaneous, such as the servers and the BGP routing system breaking?