
Link: https://discordstatus.com/incidents/dj3l6lw926kl

## arcitecture

servor for internal services tracks real time state and presence information for all conndected users

API patches

session cluster



## problems

server for internal services disconnected from cluster members

preseence server experiences more soft-lock issues

fully reboot discord

after reboot same server agin experiences soft locks

attempt a second reboot of discord and recover of server but mor problems

isolate soft locks to one server. reboot that server
- force the VM to land on another physical host 
- problem resolved

reboot discord 

## notes


resources down -> uses memory -> down problem



## expectations