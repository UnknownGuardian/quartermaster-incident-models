# MailChimp Mandrill Failure

Failure involved a postgres shard that went into safety shutdown when the autovacuum process fell behind/failed. This was likely triggered due to overload of the system (or some outright failure). The XID hitting the upper limit caused the process to finally fail
