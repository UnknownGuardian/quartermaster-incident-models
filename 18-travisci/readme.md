# 18-TravisCI

## Incident Report

https://www.traviscistatus.com/incidents/khzk8bg4p9sy

## Expectations

Events passed to the createVM process in the virtualization layer will fail upon arrival. The cleanup function in the virtual layer will fail to remove VMs from the server because it assumes capacity was never exceeded. Workers for the createVM function will be overloaded by the demand of continuously generated VMs, and will fail events. The service will attempt to requeue the failed events.

## Diagram

* version 1: https://lucid.app/invitations/accept/604925ca-ca7b-40ab-a211-13f4af93c5cd
* version 2: https://lucid.app/invitations/accept/fc2f4a28-b200-4c01-a5ca-e05e4422f132