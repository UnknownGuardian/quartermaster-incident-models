# 14-Tarsnap

## Incident Report

https://www.traviscistatus.com/incidents/khzk8bg4p9sy

## Expectations

Expecting near 100 percent success rate of events passing through filesystem and for the failure rates of retried events to remain minimal. Instead, the failure rate of retried events increases, then all events passing through filesystem fail. 

## Explanation

Events flow through the incident via an api, then to a filesystem, then to a redo stage wrapping a timeout, then to a server. Preceding the server is a timeout stage wrapped by a redo stage. This redo stage is a retry stage which has been modified to add latency between event retries, in other words it now has a retry rate. At some point the availability decreases, the retry rate increases, and the dereferenceLog job begins aborting and adding a new log to the disk space with each startup. Eventually, these logs and the events sent to S3 exceed the disk capacity and Tarsnap becomes unavailable.