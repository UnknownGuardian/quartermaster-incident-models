# ReadMe 16-Google

## Incident Report

https://status.cloud.google.com/incident/cloud-networking/19009

## Summary

Sitewide outage due to failure of multiple databases, each with a master machine and two replica machines. This resulted from a defect in the upgrade script.

## Expectations

Expecting near-100% success rate of events being returned by MySQL servers. Instead, some servers (s2) fail and lose availability, resulting in a high rate of event failures.

- Availability for all servers is 0.9995 until tick 5000 when they drop to 0

## Diagrams
TODO change link to view only
version 1: https://lucid.app/invitations/accept/6b1c2caf-45cf-48be-9918-f7218a7547fb

## Notes

Stages:
    internet entry
    elb stage
        "Google's cluster management software plays a significant role in automating datacenter maintenance events, like power infrastructure changes or network augmentation. Google's scale means that maintenance events are globally common, although rare in any single location. Jobs run by the cluster management software are labelled with an indication of how they should behave in the face of such an event: typically jobs are either moved to a machine which is not under maintenance, or stopped and rescheduled after the event."
    "multiple instances of that cluster management software"
    Regional Datacenter Stage
        Clusters 
        Network control plane
            Servers
        BGP routing (packet transfer between datacenters)
    Application/Cloud Stage

Breaks:
    Customers experienced "increased latency, intermittent errors, and connectivity loss"
    Multiple software clusters were descheduled [redundant systems failed.]
    Network congestion (queue backup stems from databases (retry stage precedes databases)) 
        "Google engineers were alerted to the failure two minutes after it began, and rapidly engaged the incident management protocols used for the most significant of production incidents. Debugging the problem was significantly hampered by failure of tools competing over use of the now-congested network. The defense in depth philosophy means we have robust backup plans for handling failure of such tools, but use of these backup plans (including engineers travelling to secure facilities designed to withstand the most catastrophic failures, and a reduction in priority of less critical network traffic classes to reduce congestion) added to the time spent debugging. Furthermore, the scope and scale of the outage, and collateral damage to tooling as a result of network congestion, made it initially difficult to precisely identify impact and communicate accurately with customers."
    Package loss (event failure)

    Timeout stage needed before database stage.
        "App Engine applications hosted in us-east4, us-west2, northamerica-northeast1 and southamerica-east1 were unavailable for the duration of the disruption. The us-central region saw a 23.2% drop in requests per second (RPS). Requests that reached App Engine executed normally, while requests that did not returned client timeout errors."

    Failure rates for applications [IS THIS NEEDED? Too many stages to model?]:
        "Cloud Endpoints
        Requests to Endpoints services during the network incident experienced a spike in error rates up to 4.4% at the start of the incident, decreasing to 0.6% average error rate between 12:50 and 15:40, at 15:40 error rates decreased to less than 0.1%. A separate Endpoints incident was caused by this disruption and its impact extended beyond the resolution time above.

        From Sunday 2 June, 2019 12:00 until Tuesday 4 June, 2019 11:30, 50% of service configuration push workflows failed."

        [Maybe not needed. These applications failed as a result of the incident. The concern for modeling is the architecture surrounding the immediate failure, not the cascading effect on Google services supported by the failing infrastructure.]
    

Variables:
    var maintenance: boolean;
    
What is "descheduling"?