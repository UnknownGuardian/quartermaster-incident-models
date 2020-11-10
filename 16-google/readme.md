# ReadMe 16-Google

## Incident Report

https://status.cloud.google.com/incident/cloud-networking/19009

## Summary

Multiple clusters and supporting infrastructure being de-sechuled due to a defect in an upgrade script. This failure caused packet loss, client request timeouts, and increased latency. Models the Cloud Interconnect failures in the report.

## Expectations

Normally expecting near-100% success rate of events being returned by servers. Instead:
* The failed cluster management software begins showing 50% packet failures at 5000 ticks caused by timeouts in the Region.
* Greater event latency due to network congestion in the Region.