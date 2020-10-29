# ReadMe 16-Google

## Incident Report

https://status.cloud.google.com/incident/cloud-networking/19009

## Summary

Multiple clusters and supporting infrastructure being de-sechuled due to a defect in an upgrade script. This failure caused packet loss, client request timeouts, and increased latency.

## Expectations

Expecting near-100% success rate of events being returned by servers. Instead, the failed cluster management software begins showing packet failures, and eventually the events caught in the congested network timeout. Expect the output to display network congestion, higher latency, and event failures.

## Diagrams

version 1: https://lucid.app/invitations/accept/6b1c2caf-45cf-48be-9918-f7218a7547fb