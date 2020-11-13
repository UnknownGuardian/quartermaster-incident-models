Multiple clusters and supporting infrastructure being de-sechuled due to a defect in an upgrade script. This failure caused packet loss, client request timeouts, and increased latency. Models the Cloud Interconnect failures in the report.

## Expectations

Normally expecting near-100% success rate of events being returned by servers. Instead:
- The failed cluster management software begins showing 50% packet failures at 5000 ticks caused by timeouts in the Region. At 5000 ticks per second, about 25,000 events will pass by 5000 ticks, then 50% of the remaining events will timeout. With 100,000 events passing into the simulation, about half of 75,000 events fail in the Timeout stage.
- Greater event latency due to network congestion in the Region.