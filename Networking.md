# Wireshark to capture for 30 seconds

````bash
sudo tshark -i eth0 -a duration:30 -w dump.ncap
````
