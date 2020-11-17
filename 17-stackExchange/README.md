Link: https://stackstatus.net/post/96025967369/outage-post-mortem-august-25th-2014

# architecture

internal API endpoints connecting directly insted of traversing ASA firewalll

iptables managed by Puppet and stored in Git
load balancers

iptable - list of things that can go through firewall

# problems

outage of all sites caused by incorrect change to network firewall configuration

load balancers applied change

prevented HAPorxy systems from connecting to IIS web servers

- respnse traffic was blocked

as actice load balancer caused change in Data center outage began 25 minutes after

applied change to puppet matser

- first on inactive load balancer
- then active load balancer

# notes

api to database change

- api to web servers

something to intercept calls and throw requests

stage for HAPROXY - (highly available proxy)

- .accept new events

try to talk to webserves

stage for iptable

- block all inbound traffic

# expectations

performs normally until failure and we see failures go up. Then when problem resolves failures platuea.

- 'fail' runs normally until the iptables starts to blcok the traffic causing the fails to go up starting at 9000 ticks

- in the overview of event behaivor in stage we see how the iptables and Haproxy have the greatest number of failures.
