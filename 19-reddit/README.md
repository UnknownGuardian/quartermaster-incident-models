
Link: https://www.reddit.com/r/announcements/comments/4y0m56/why_reddit_was_down_on_aug_11/


# Architecture

do not need ? Zookeeper
- configuration problem


auto-scaling
- read Zookeeper data 



servers
- application -> API services
- caching -> database
- database


# Problems

- auto-scaler read new configuration data and terminated many application and caching servers in 16s

- cache was empty causing load on database

- database underprovisioned

smaller queue (smaller number on queue) or too many concurrent requests (more requests than queue can hold)

# expectations

add expectations section



