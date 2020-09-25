Resources for some service went up (RAM, CPU), cause jitter in responses

Due to memory leak

## Expectations:

- 2 segments: healthy, unhealthy
- `cpu` is hovering around 20% for first segment
- `memory` is around 6 million for first segment
- `memory` starts rapildy increasing at tick 4000
- `cpu` slowly starts increasing at tick 4000 to reach about 2 at end of simulation
- both flatten out at around tick 54000
