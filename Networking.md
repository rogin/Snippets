# Networking

## Wireshark

### Capture for 30 seconds

````bash
sudo tshark -i eth0 -a duration:30 -w dump.ncap
````

### Capture only port 9443, treat the traffic as http, and filter the source host

````bash
tshark -i eth0 -d tcp.port==9443,http -f "src host x.x.x.x" -w dump.ncap
````

### Capture only this host (on either end, as sender or receiver)

````bash
tshark -i eth0 -f "host x.x.x.x" -w dump.ncap
````
