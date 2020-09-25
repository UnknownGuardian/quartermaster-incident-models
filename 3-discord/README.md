Failure:

Redis Instance is migrated to new machine, which causes a rebalance of the redis cluster.

The bad caching rules discovered by a known bug! Yikes! Bug might have been that it ignores some property of caching (like when it expires)
After that goes through, it triggers a lot of traffic to actual API endpoints because of bad caching rules (and probably because cache was cold). This causes a failure in the cassandra cluster (not critical).

How can a misconfigured edge caching rule cause the expensive route to be called when the cache reboots?

Why the flip do they have to restart API instances to resolve latency issues? Perhaps they connect to a non-optimal region as a backup.

Bad Behavior:

Bad Behavior node creates cascading failure in other services:

- Known Bug messes up caching rule
- API level spikes from usage (and increased memory and latency)
- Non-critical database crashes from overwhelming usage
- Lots of memory leaks cause nodes to crash

Interested in: when cache fails, what happens to systems that depends on cache above and below it.

## Interesting Observed Behavior From Simulation

### Failure Ripples

After a node has failed, traffic drastically increases to the wrapped dependency for some time until the new replacement cache has warmed up. This happens again after the cache expires, at the rate at which the cache was filled. The rate of traffic slows the shock up, so it isnt as drastic. This ripple continues for several iterations.

## Expectations:

- Redis instances warm up to have lots of objects in their cache (probably around 100)
- at tick 50,000, number of objects drops to 0 for first 5 nodes
- repeatedly afterwards, every 50,000 ticks until tick 200,000, you see a (possibly small) spike in concurrent database connections (cache refreshing)
- at tick 200,000, number of objects drops to 0 for first 5 nodes and `apiState` goes from up to down
- `redis-x` never fills for first 5 nodes, slowly decreases in size for last 5 nodes.
- at tick 300,000 `apiState` goes up, `redis-x` starts to increase up to around 100
