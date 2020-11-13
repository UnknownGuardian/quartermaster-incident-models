3 different segments

1. normal operation
   - low-ish latency, low-ish failure rates
2. operation right after zookeeper terminated all the servers
   - ???? latency, very high failure rates
3. operation after they bring parts of the site back online and the caches are warming up
   - high-ish latency, ???? failure rates
