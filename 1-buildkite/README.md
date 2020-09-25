Database CPU at 100%

Health checks hit 2 SQL database, Redis, Memcached. When
CPU at 100% health checks fail

ELB (the one for the one for servicing dashboard requests) goes hey, they are bad, lets rotate them out with new ones

The other 2 ELBs had a higher threshold and didn't cause their servers to pull out

New servers couldn't rotate in due to a misconfiguration from health checks that would fail on the new machines

Things to ignore:

- pager duty not notifying them (unless we care about automated only solutions)
- the newest code version couldn't be reached due to website going down
- the 90000 reasons why they couldn't bring new servers on, provision new images, etc

What we care about then is the:

- Inability to provision new machines
- CPU at 100%
- Health Check policies
- Increase in traffic (to a new peak, but not unexpected)
- Old (capable architecture)?

Questions We should want to consider:

- We are scaling down to reduce cost. Lets assume that as we scale down, the new machines can't keep up. (duh). How does our system react to failing machines.

## Expectations:

- `dashboardInstances` drops to 0 as `cpu` is high (greater than 90%)
