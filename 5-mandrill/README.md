# MailChimp Mandrill Failure

Failure involved a postgres shard that went into safety shutdown when the autovacuum process fell behind/failed. This was likely triggered due to overload of the system (or some outright failure). The XID hitting the upper limit caused the process to finally fail

## Expectations:

- `postgresStatus` is running until tick `eventRate` approaches 1000, then it moves to safety-shutdown for the end of the simulation
