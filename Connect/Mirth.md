# NextGen Connect FAQs

## Others tracking FAQs

See [_jonb_'s useful gists](<https://gist.github.com/jonbartels>) which overlap here in some areas. His [SSL writeup](https://gist.github.com/jonbartels/8abd121901eb930f46245d9ef0f5710e) is excellent.

See [Michael Hobbs' gists](https://gist.github.com/MichaelLeeHobbs) which include an excellent [Mirth channel table resizer for PG](https://gist.github.com/MichaelLeeHobbs/67980d165fc68880eb2ab283c673244b).

NextGen manages a [repo](https://github.com/nextgenhealthcare/connect-examples) for various code templates.

## Past and planned Mirth updates

### Where can I view Mirth milestones, including planned tasks?

Look [here](https://github.com/nextgenhealthcare/connect/milestones).

### What was included in the MCAL v1.3.1 release?

_narupley_: new code signing cert that is baked into the launcher, that's it

## Other projects on github using Mirth?

See [my list](https://github.com/stars/rogin/lists/mirth-related) that others in [Mirth Slack](https://mirthconnect.slack.com) found useful.

## Where to start learning

* Read through the [Mirth User Guide](https://docs.nextgen.com/bundle/Mirth_User_Guide_42). It has a Best Practices section which can help your message throughput and minimize DB space.

## How do I

See our [new section](HowDoI.md).

## Where are those scripts by Alex Aitougan?

[_jonb_](https://github.com/nextgenhealthcare/connect/discussions/4918#discussioncomment-1823705): Alex Aitougan shared some snippets at [#3819](https://github.com/nextgenhealthcare/connect/issues/3819#issuecomment-692894231) that may help you
My team and I have used these in a limited capacity for lower-volume workloads. We did have to modify them but I don't recall exactly how. These are a good baseline.

## What does the 'pause' button actually do?

If I have a large queue and I pause the channel, does the queue continue to process?

“pause” just stops your source connector. the destinations continue to execute.

## Latin-ish char showing up in my received messages

_pacmano_ seeing a "Ã" being received in a raw HL7 coming into a HTTP Listener.

_chris_
Mirth doesn't let you sent the connector's charset for inbound.
So it will follow HTTP spec which is that the default charset for text/* without a charset parameter is ISO-8859-1.
Try setting "binary mime types" to "anything".
Then you'll just get bytes, and you can convert to string yourself and force UTF-8 encoding.
But I think your config may be the problem, here.
You could ask the sender to use text/plain; charset-UTF-8 and see if that improves things.

_pacmano_
That fixed it. No code changes on my side needed.

## What is the indication when red numbers display in the Dashboard's Connection column?

That you're using all of the Max Connections defined in your TCP Listener.

## Properly use destinationSet filtering

Richard
This design can handle being fed a junk input message so that the junk message doesn't get sent to all destinations. It also ERRORs properly so investigations can occur.

### Example 1

This can be a code template:

````javascript
//allows us to consistently check the return value
function removeAllExcept(values) {
  var removed = destinationSet.removeAllExcept(values);

  if (!removed) {
    throw "Failed to remove destination(s), developer typo? Values=" + values;
  }
}
````

Then in your source transformer:

````javascript
//default to treating input as faulty
var filterReason = "Invalid input";
// this destination acts as a default fail-safe and throws an
//error on that destination so someone gets a notice it fell through
var valuesToKeep = [3];

//Allergy
if (msg['MSH']['MSH.9']['MSH.9.1'].toString() == "ADT" && msg['MSH']['MSH.9']['MSH.9.2'].toString() == "A31") {
  filterReason = "Allergy";
  valuesToKeep = [1];
}
//Medication
else if (msg['MSH']['MSH.9']['MSH.9.1'].toString() == "RDS" && msg['MSH']['MSH.9']['MSH.9.2'].toString() == "O01") {
  filterReason = "Medication";
  valuesToKeep = [2];
}

removeAllExcept(valuesToKeep);

connectorMap.put('filterReason', filterReason);
````

### Example 2 using a contextPath

You could also filter based on a contextPath as _germano_ wanted when using a HTTP Listener:
"My thought was to name the destinations after the context path, so that I could do a simple `destinationSet.removeAllExcept([contextPath])` (as the function accepts both destination names AND IDs) to have it route the message to the correct destination. If a destination doesn't exist for the context path, then it would remove all destinations leaving nothing to do, and it could return a default response.
I'll just set the responseMap variable in the source transformer as if it failed, and it won't get overwritten by any of the destinations"

_pacmano_
as a “safety” measure I still add a filter to the destination to catch the oops.

_hermano_
default destination as mentioned above, or pre-populate a channel/response map variables with default values if sender is expecting a response.
add a filter for the supported/expected HTTP Methods in the Source Filter.
the Http Listener status codes if you choose to send anything other than 200, accepts a string.
dont forget to set the response content-type, you might have to populate those headers in the response map and set them per destination/response transformer.
http listener should respect gzip content-type headers, never tested this though.

## Clarity regarding `Max Processing Threads` and `Max Connections`

_Richard_
if `Max Processing Threads=2` and `Max Connections=10`, this means i can have up to `2 * 10` incoming messages at once?

_pacmano_
Kinda sure that is a no.  It allows the remote side to open 10 TCP connections, but you are still limited to 2 threads.

_Richard_
interesting. with this config it receives ~5700/min. do the more experienced keep to a 1-to-1 or 1-to-2 ratio on those values?

_pacmano_
source threads > 1 do not guarantee message order. so I would guess most people do one thread. e.g. your current setup could result in bad stuff depending on your use cases.

_Richard_
understood. thankfully MO isn't necessary for that client.

_agermano_
One client can open multiple connections or multiple clients can all connect to the same channel. Your number of threads says how many messages mirth will process concurrently, so they aren't really related. connection threads will block if there is not a source thread available to receive a message when the client attempts to send one. unless you have the source queue enabled, in which case it will accept the message immediately to the queue, and then process when the source thread becomes available. connections are typically managed by the OS TCP stack, where source threads are managed by mirth and the JVM.

## Options for HTTP Listener with increased volume

_Genarro_
I have a REST API mirth channel with an HTTP listener as a source connector and it routes to multiple HTTP Sender endpoints got GET requests. Currently, the response from the endpoints are sent back as a response map variable back to the requesting system. It has worked fine until now with low volume, but now it needs to support at least 5 incoming messages a second. Turning on Source Queue seemed like the best option, but I lose the ability to send a response back via a response map. Is there a different approach where I can handle the higher number of incoming messages but also still be able to send back an endpoint response? Is this possible, even if that means introducing more channels?

_jonb_
Source queue OFF
Destination queues OFF
Increase source threads. You’ll get one source thread handling one request and waiting on your one or more destinations for the response.
If your response is generated from the completion of all destinations then you’re stuck with a synchronous process. If your response only needs the response from one or some destinations then enable queueing for the destinations that do not contribute to the response.
Firing all 5 destinations in parallel and waiting for the response is possible but its tricky to wire up. Is that relevant to your use case? Are the destinations in parallel or sequential?

_Genarro_
All the destinations are separate and there is no daisy chaining, but some endpoints call other endpoints via Javscript using `router.routeMessage()`
It’s a bit of a mess that needs a restructuring. It’s all happening in one channel. I’d like to break that out, but can’t see how I could send a response back across channels to the original request.
@jonb If I can clean things up and have each destination independent of all the others, is there anything else I need to consider for that parallel approach that you mentioned above?

_jonb_
If the destinations are independent and you can asynchronously send meessages, that is ideal.
Sending parallel, synchronous messages in Mirth is possible. You have to manually create a Thread object and then have it do the router.route calls then start n-threads, then wait for those threads to complete.
Its ehh 6 or 7 out of 10 in terms of complexity. Its tricky to make it right and do the logging to make it work well.
@hermano did some work with this but I do not remember if it was open source and he’s out of the Mirth game these days.

_pacmano_
Different URIs? Load balancer in front splitting to X channels via path as needed. Can even clone current channels.

_Genarro_
Different URIs is a great approach I hadn’t thought about. So having nginx load balance to multiple clones of that channel sounds very easy to scale. Just clone more channels as needed. That’s assuming the Mirth server has the hardware to keep up.
I would hope I could still use Jon’s approach of parallelization with no source or destination queues to be as efficient on the server and channel level.
Thank you both. I was having a hard time finding my specific use case in the forums and GitHub discussions.

_hermano_
What Jon said above, there was another recent thread re: http calls/multiple endpoints on one channel
If you can, make sure you are determining what context path the request is coming from and filter out the destination set as soon as possible, remove unwanted copies of messages that go nowhere for the other destinations. for separation of concerns each destination should only handle a single context path, you could do multiple but you would be able to use the dashboard a bit easier. make sure to filter the supported http methods as well in the source filter (either check this up front in the source filter, or at the destination filter since each context path/resource could support different methods). you mentioned the response map, that’s the right way to do it, resetting it in the active destinations (please add a default error and/or success cases in case you get a request that doesn’t match any of your filters/or destinations), and make sure you are looking out for that edge case as well in the destinations.
If you are offloading to other channels and still want a response, you can do the multi-threaded method jon mentioned, you do get a less visibility of what is going on but it would speed up your requests a lot if you have to do multiple things in parallel in a single request.
keep each request/destination as dumb as possible, the more complex the more and more those timeouts are going to be increasing.
be nice to the requester, where possible set the correct response content-type headers and any other relevant headers and use the correct http status codes. e.g. `200s, 400s, 500s`, etc (someone can correct me, but that is a string value for that field in the ui) and setting `application/xml, json, etc`. take advantage of the gzip options the engine provides (read the manual for further details)
for the filtering above, start with an object with all the supported paths, have each path have its corresponding, allowable http methods, and you can leverage that in any of the filtering stages. (if we can filter out, throw garbage/malformed requests as quick as possible, might as well short circuit the message process and free up a thread.)
since you’d be parsing the context path anyway, i’d make sure to map those and set them as metadata columns
re: filtering vs filtering destination sets
I forget what the meta is now but I recall people favoring one over the other (maybe for metrics reasons?). you won’t have a row for the destinations that get removed in the dashboard, but the biggest upside is less db writes/processing having to add more copies of a single message as needed. `(source(raw, processed, transformed, etc) + (n* destinations(raw, processed, transformed, etc)))` depending on the message storage level
i’d be willing to install mc locally for a week or two to write up a “here’s the expressjs equivalent (as much as possible) channel(s) in connect”

## Details on QUEUED and RECEIVED statuses

_agermano_
QUEUED is only used on destination connectors. Messages in the source queue have a RECEIVED status which basically means the raw message has been committed to the database, but the message has not yet been processed.

## Thread usage when not queuing

_agermano_
If you have one thread, aren't using destination queuing, and have a slow destination, that destination will slow everything down. The channel needs to wait for every destination to produce a result before calling the post-processor (if there is one,) sending the response upstream (if there is one configured on the source tab) and then starting to process the next message.

When you are not using 'wait for previous destination' and you are not using destination queuing, then each destination chain gets its own thread except for one (I think the last one) that runs on the same thread as the source connector.

## MC plugin ideas

### Channel dependency graph

_Richard_ developed a PowerShell script to export the channel dependencies to DOT language, then used graphviz to generate a SVG. This would be helpful directly in Mirth as a plugin.

### What is my IP

_jonb_
MC plugin idea - “What is my IP?”
Its trivial to do with a channel that calls ifconfig.me but a button would be handy.

_pacmano_
what is my local IP, what is my public IP, what is my container host IP.

_jonb_
How is the container host IP discoverable from software?
Local interfaces can be enumerated

_Jarrod_ with [SO question](https://stackoverflow.com/questions/9481865/getting-the-ip-address-of-the-current-machine-using-java)

## Mirth quirks that can bite you

### No-op transformers that are enabled

You'll see a recursive write error. Disable / delete the trans then redeploy. (TODO: VERIFY THIS ONE)

### ERROR status should be set but isn't

_joshm_
have you searched with just the “has errors” checkbox to see if you can find it there? I’ve seen a situation where you can get an error but the message status doesn’t get set to ERROR

### Moving a channel to a group fails when using a filter

See [issue](https://github.com/nextgenhealthcare/connect/issues/3898) opened in 2016. Still occurs in 4.0.1-4.2.

_jonb_
Funny story on [related ticket](https://github.com/nextgenhealthcare/connect/issues/4084). This got Zen in some hot water. As I recall Josh or Ron were hacking in $LARGE_CUSTOMER and loaded the channel view. This customer was so large it took a while (over a minute) for the channel list to load. So the dev just started working. They added a new channel + group, then POOF something like 200+ channels were suddenly un-grouped.
Under the covers the client sends the whole set of channels to MC and that set is saved somewhere in the config table. Its a list of groups with child channel IDs.
To support the filtered view either the client has to … do magic.. IDK… or the server has to support discrete operations on single channels AND the client has to be poking those updates to the server.

## Who is currently selling ANY Mirth extensions or paid extra software?

23 Jan 2023

* [Zen SSL](https://consultzen.com/zen-ssl-extension/)
* [NextGen](https://www.nextgen.com/)
* [InterfaceMonitor](https://www.interfacemonitor.com/) / [xc-monitor](https://mirth-support.com/xc-monitor)
* [MirthSync](https://saga-it.com/tech-talk/2019/03/15/mirthsync+installation+and+basic+usage) is [on GitHub](https://github.com/SagaHealthcareIT/mirthsync), is it a freemium model?

## Pruning logic clarification

_tarmor_: If message has one destination in ERROR status, the purge process will not remove the message. If I search for messages in ERROR status and do "Remove results", it will only remove the destination messages, not the whole message. Will the purge process remove then the source and other destinations, since there is no error anymore?

_jonb_'s [gist](https://github.com/nextgenhealthcare/connect/blob/b3bd6308b789d16e4b562bd5686cef883fa1faf1/server/dbconf/postgres/postgres-message.xml#L412). This is for postgres. You can find sibling files for other DB engines for `getMessagesToPrune`. MC does a SELECT to find message IDs to remove then it does a second operation to actually delete those messages. Version 3.12 of MC [introduced](https://github.com/nextgenhealthcare/connect/milestone/69?closed=1) “prune error”. I wrote a custom pruner for my employer a few months ago. (_ed note_: stated in March 2023.) I have forgotten a lot of the details but I can find them again if there is sufficient interest.

## Advanced Clustering discussion with important bits

_Ryan Howk_
Does anyone have strong opinions for or against using Mirth Adv Clustering for Active Dual-Node w/ load balancer VS dual node with 2nd node as a failover (backup) node?

_joshm_
I’ve not heard a lot of favorable anecdotes in favor of the Adv Clustering Plugin. Maybe they’ve made some improvements in recent years, but idk. As Jarrod noted, Innovar does have a template you can use for a “low price” in AWS that does load balancing. I don’t have a lot of detail on it but I can get you in touch with the right folks. You basically pay fee for usage, but you host it yourself in whatever AWS environment you want. You own the config, we just provide the template.

_Ryan Howk_
thanks for the details, will check that out and see which load balancer we're using now... might be something in Azure, not sure... we recently upgraded to MC 4.1.1 and Adv Clustering 4.1 and still seeing some wonkiness with various channel tasks/errors

_Anthony Leon_
are you using it with a Mirth appliance? It's been a couple of years but the Advanced plugin had some additional functionality when paired with the appliance that made it really strong. Without an appliance, it required a bit more manual work to get going but it may be different these days.

_Ryan Howk_
good to know, that sounds vaguely familiar, we aren't using the appliance, we're hosting with Azure

_Anthony Leon_
I'd check to see if any of the current Mirth folks could verify that for you while also checking out solutions like mentioned above. Azure is always a tricky situation on top of it all.

_tiskinty_
Having used mirth in both adv cluster and loadbalancer configurations I would definitely lean hard in the loadbalancer direction unless you need message order preserved. The clustering has come quite a long way, but it's still not quirk-free.

_Ryan Howk_
agreed, it's not quirk-free... we're trying to decide if we want to keep dual active node setup or switch to a dual node with one node as a backup we can failover to if one node fails... are you guys using dual nodes with both being active?  I might be mis-wording this somewhat

_Ryan Howk_
I think we need message order preservation

## Error strings and their solutions

### Error when deploying channel

Error text: `module java.base does not "opens java.util.concurrent.atomic" to unnamed module`

_jonb_
Add `--add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED` to the `.vmoptions` file
NG needs to update the vmopts file.
[Existing ticket?](https://github.com/nextgenhealthcare/connect-docker/issues/22)

### '500 Server Error' on Dashboard for mac

After a fresh install of Mirth on a mac, Dashboard page continously logs:

````
Method failed: HTTP/1.1 500 Server Error
com.mirth.connect.client.core.ClientException: Method failed: HTTP/1.1 500 Server Error
at com.mirth.connect.client.core.ServerConnection.handleResponse(ServerConnection.java:533)
at com.mirth.connect.client.core.ServerConnection.handleResponse(ServerConnection.java:457)
...
````

Add the vmoptions as described [here](https://github.com/nextgenhealthcare/connect#java9).

### Error: `Assignment to lists with more than one item is not supported`

See [forum](https://forums.mirthproject.io/forum/mirth-connect/support/16781-): you’re trying to set a repeating segment to a non repeating segment

### JS "Object.values()" throwing

_itsjohn_
I’m using Object.values() but it throws an error `cannot find function values in object function Object ()`.

_Daniel Ruppert_
The Rhino Engine [doesn't implement](https://forums.mirthproject.io/forum/mirth-connect/support/19120-using-javascript-object-values) that until [v1.7.14](https://github.com/mozilla/rhino/pull/902). A [feature request](https://github.com/nextgenhealthcare/connect/issues/5541) was opened.

### Accessing sourceMap

Encountered error text:
`The source map entry "VARNAME" was retrieved from the channel map. This method of retrieval has been deprecated and will soon be removed. Please use sourceMap.get('VARNAME') instead.`

Solution: Change all $('VARNAME') to sourceMap.get('VARNAME').

This was encountered in v3.12.0, and the error message was seen in the [latest v4.2.0 code](https://github.com/nextgenhealthcare/connect/blob/development/server/src/com/mirth/connect/server/userutil/ChannelMap.java#L74), so MC upgrades and channel fixes can be independent.

### Dealing with 'Early EOF' in HTTPReceiver

_RunnenLate_
anyone know how i can troubleshoot this error, i don't see a single message as error within the channel
`ERROR  (com.mirth.connect.connectors.http.HttpReceiver:522): Error receiving message (HTTP Listener "Source" on channel 12c72fc1-39f4-4e55-840d-4bdcdb9b328f).
org.eclipse.jetty.io.EofException: Early EOF`
the client is trying to send just tons of concurrent connections and it's limited to 10 threads.

_tiskinty_
based on experience, that's usually a network error. I would guess it's a firewall issue based on the EOF, but that's not a sure thing by any means
the thread/connection setup doesn't usually cause that from what I've seen before. 99% of the time when I've seen it, it was directly related to a firewall or VPN setup needing to be restarted. Otherwise, it might be enough (depending on the actual networking setup) to re-deploy the channel. I've seen that work occasionally in the past. I wouldn't bank on it, but it's typically low risk

_RunnenLate_
no firewall in front of the server, just an F5 which there is no way I would restart. I told the client to reduce their queue for 9000 to 100 and retry.

## Details on the Thread Assignment Variable

See [here](https://github.com/nextgenhealthcare/connect/discussions/5698).

## Message order issue when using GMO and Advanced Clustering plugin

_Zubcy_
Hi Guys, Mirth is getting responses earlier for the latter messages.. i.e its not waiting for current message response, before sending the next message.. How to fix this?
113124 is the first message, but it received response at 080 ms...113125 is the later message, but response is early at 017 ms.. I dont think its good, as Mirth must not send another message, before it receives the current response, right?

Setup

* PostGres
* Guaranteed Message Order (GMO) is on
* Using Advanced Cluster plugin
* When GMO is disabled, I get correct responses.

_jonb_
queues are on. Queues are designed to handle multiple messages at once in separate threads

_joshm_
it can absolutely send another message if the other is waiting on a response.
Is advanced clustering also enabled? That may also play into it
with queues enabled, won’t it get a message status of QUEUED immediately and move on?

_agermano_
Yes, but it should still maintain message order
I don't have the clustering plugin. With GMO, does the plugin force one node to process all messages or is it possible that those messages were processed by two different nodes with slightly off clocks?
The destination is also set to queue on failure, so most of the time the queue probably isn't doing anything

_Zubcy_
@agermano Yes, with GMO on, the plugin forces one node to process all messages.. Also, regarding time, I checked all nodes, the time is the same...

_jonb_
@joshm its queue on fail

_Zubcy_
@joshm Can I have a setting where Mirth doesn't send next message, until it gets its response..

_agermano_
What were the number of send attempts for the two messages you showed?

_Zubcy_
Zero, there were no retries

_agermano_
What does that "use single cluster node" setting do in the destination queue settings?
Is there a way in the message browser to verify both messages processed on the same node?
You have it set to no, which says message order is not guaranteed

_Zubcy_
Yes, I verified them in receiving application database, they were processed from same node

_agermano_
I think maybe you want "use source setting"

_Zubcy_
I have used all the 3 settings, but still the same issue

_agermano_
Maybe change it to queue always instead of on failure? To ensure the same destination thread is always processing messages?
It's probably worth opening a support ticket, as it seems to have something to do with the plugin and the GMO setting.

_chris_
There's only one thread. Doesn't that mean that message-order is always guaranteed? My experience is that queuing ends up queuing everything and pounding on a single message until it either is successful or goes into an ERROR state. If you have queue-on-error, then ERROR goes back into the queue and your message-delivery grinds to a halt.

## Diagram channel dependencies

_Richard_
is there a script lying around that helps map channel dependencies with info on queue settings and thread counts? a nice diagram showing where their pipes are fat or potentially too tiny would be useful.

_jonb_
NextGen, Zen, and I think maybe Diridium and Innovar all have some health-check type offerings. Obviously geared towards finding how their services can help you. The NG offering might have been free if you upload the server config but I don’t recall the details.
In the guts of the DB you’d be querying against the channel table then doing xml parsing of the connector settings.
Dependencies are in the config table and not persisted with the channel. Again an XML blob to pick apart.
Its ehhh probably a 3-4 out of 10 level of difficulty

Brainstormed options:

* refactor [this PHP project](https://github.com/TristanChaput/Mirth-Connect-Channel-Report) as a head start
* get the important XML _jonb_ listed via the existing PS_Mirth project
* plugin opportunity! If you write it as a client plugin, it would be using the same java objects that the client already has for showing the channel view instead of parsing xml.
* Doing this as XML -> XSLT -> SVG might be easier than writing it in Java.
* Not HTML5 directly, but you can do JSON+js in HTML and make graphs.
* Plotly js is a marvel.
* javafx can do charts and graphs

## HL7 Escaping rules

See [here](https://docs.intersystems.com/latest/csp/docbook/DocBook.UI.Page.cls?KEY=EHL72_ESCAPE_SEQUENCES) and [here](https://www.hl7plus.com/Help/Notepad/index.html?hl7_escape_rules.htm).

## Polling issue when using clustering plugin

_Zubcy_ 1 March 2023
Team, Is there anyway to automatically reprocess the last message, whenever the channel is deployed? Not involving any polling functionalities.

I have a polling channel where I have placed all my global Maps.. I have issues with Clustering plugin, for polling issues. Due to the issue, the channel is not polled after a server restart, hence the global maps are not withstanding a server restart.  I need something which can trigger that channel once it is deployed..

I need something which can automatically reprocess the last message, when the server goes down in non support times..

Its set to Poll on start, but as I said, we are using clustering plugin and can set only one node for polling in advanced clustering settings.. hence the nodes which have polling not enabled in advanced clustering settings, are not polling once they are started.

_joshm_
You could add code in your deploy script that calls the API(s) needed to do it. But there’s no GUI with a setting somewhere that would automatically do that.

_jonb_
For your original idea - I wouldn’t call the HTTP API. I would call the internal APIs. It could be as simple as doing router.routeMessage() to your channel or as complicated as calling ChannelController to pop a new message in.

## Sample message transformations

### HL7v2 to FHIR

13 Jan 2023
_jonb_ recommends [these](https://confluence.hl7.org/display/OO/v2+Sample+Messages).

## Can Mirth verify certificates of external parties?

(Feb 2023) Nothing directly in Mirth.

_chris_: It's very easy to pull a remote cert. Just connect to the service via HTTP and the server will provide it. Then you check it for upcoming expiration. Something like [certcheck](https://github.com/ChristopherSchultz/certcheck) or [check_ssl_cert](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_cert/details) or [check_ssl_certificate](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_certificate/details) or [check_http](https://nagios-plugins.org/doc/man/check_http.html).

## Mirth licensing Q&A

Q1. Is CURES available under existing licenses or separate from other plugins?
A1. Mirth Rep _Travis West_: "It is separate and requires Gold or Platinum bundles." (Essentially an upcharge in addition to platinum.)
Q2. Wasn't the Advanced Clustering plugin provided at Gold level?
A2. Users noticed it was bumped to Platinum in early 2023. _Richard_ was looking through notifications for any warnings / reasoning.

## I encounter odd String and XML errors intermittently when sending between channels

Ensure you do not have a [xalan](https://mvnrepository.com/artifact/xalan/xalan) jar in your custom library. (_rogin_ to fill in what problems were presenting)

## Performance (and pricing?) metrics

### AWS pricing for DB using RDS or EC2 cluster

_chris_
RDS and EC2 are roughly equivalent in terms of cost. We built most of our infrastructure before RDS was available and we are comfortable admin'ing it directly. We are looking at RDS as a way to reduce some of that admin burden but haven't moved, yet.

### PG info

_chris_ (March 2023)
We run our PostgreSQL dbs on Intel because the instances have better network performance and our dbs are EBS-backed. But we run our Mirth servers on AMD because they are cheaper. The Graviton instances are even cheaper than that.
(When I say "Mirth" I mean "Mirth Connect" and I only mean the Java process.)

### Improvements when pruning more often

_mklemens_ found that changing pruning from every 24 hours to every hour stopped his DB's autoscaling.

_jonb_
[mysql-message.xml](https://github.com/nextgenhealthcare/connect/blob/b3bd6308b789d16e4b562bd5686cef883fa1faf1/server/dbconf/mysql/mysql-message.xml#L371)
The block size matters for Postgres. Has to do with how PG handles an IN clause.

### AWS instance numbers

Seen in 2022
"Can anyone point me in the direction of documentation/tips around best practice data pruner configuration settings? We have a server with > 1000 channels and millions of messages processed each day. We only store 5 days worth of data on each channel and prune daily, but the data pruner is taking over 32 hours to run with some individual channels taking over 45 minutes to prune about 209k messages and 2million content rows.  Database is MySQL running on an AWS RDS instance.  Is that the best I can expect the pruner to perform?  Am I better off pruning less often even though it will need to churn through more messages per run? Should I be tweaking the block size (currently set at 1000)?  Thanks for any pointers!"

same person:
"this instance is running on an AWS c5.12xlarge EC2 instance running linux and pointing to an AWS RDS r5.4xlarge MySQL DB. 1174 deployed channels with varying degrees of volume on them.  The server is mainly receiving messages via TCP and then writing out to a MSSQL DB so not a ton of complicated processing happening within the channels themselves."

### Who's using Mirth at global scale?

_ThisIsTheWay_: What's the largest corporate customer using Mirth Connect? Our organization is evaluating Mirth Connect to see if we will keep it or go with something like Ensemble.

_joshm_
there is a healthcare enterprise that owns many hospitals and physician clinics that have a few hundred instances deployed across the country
Then there are Health Information Exchanges that run hundreds of channels on multiple instances and do hundreds of thousands of messages per day
as I understand it, Ensemble and Corepoint and similar products are very “Enterprise” style. But I can tell you that many large Health IT companies also use Mirth very successfully. A worked for a large health system in the US that deployed thousands of Mirth instances in Production

_Anthony Leon_
 I'm former Mirth, Lyniate (sold Corepoint, Rhapsody, and the managed service after Datica/Sansoro acquisition) and did a quick stint at Health Gorilla. I worked in med device prior to joining Mirth as well. Happy to chat about different things with you. I of course cannot disclose specific clients (that aren't public) for any of the orgs due to certain agreements and what not but can help shed light onto your situation.

## New functionality in Rhino v1.7.13

The [How Do I](HowDoI.md) also has a section to determine which JS functions are available with each version of Mirth.

(Rhino 1.7.12 is in Mirth 3.12.0, and Rhino 1.7.13 in Mirth 4.2, so it may have been included in the initial Mirth 4.x line)

_agermano_: like I said, the `map[foo]` should work in your current mirth version (I've tested it with rhino 1.7.13, but not actually in mirth)
when map is a `java.util.Map`
in prior rhino versions a js object is implemented with `NativeObject` and a java `Map` would have been represented by `NativeJavaObject` (basically a wrapper class.) rhino 1.7.13 introduced `NativeJavaMap` as a subclass of `NativeJavaObject` that adds this behavior.
Also `NativeJavaList`, which allows you to access a `java.util.List` by index like a js array instead of using the get method.

## Blank messages and mappings in dashboard

User: messages are sent to the Channel and the channel send the messages to the destination channel. But when i look at the dashboard the Messages and the mappings are blank.
Solution: Review your 'message storage' and 'message pruning' configuration - perhaps it is set to remove content on completion.

## Channel deployment tips

9 Dec 2022
Issue: channel changes were not being deployed.
Solution: Be sure to undeploy the channel first as it resolved his issue.

## Channel development tips

### "Include Filter/Transformer"

If you are queuing on a destination and it makes sense for your workflow, select "Include Filter/Transformer" in the queue settings. Then that script will execute in the queue thread(s) instead of the source's. (_narupley_)

### Destination Set Filtering

Given many destinations where most of them get filtered: to improve performance, you can instead use "Destination Set Filtering" in your source transformer. You can decide which destinations to exclude, and then those will not be committed to the database in the first place. That can greatly reduce the database load for a channel. This is described in the "Best Practices" section of the User Guide. (_narupley_)

Summary for using this is

1. create an additional channel at the end that is set to throw so admins review
1. Default your removeAllExcept to the above channel
1. Log a 'reason for filter' text
1. be sure to

### Set your response data type to RAW

That will force your response transformer code to always execute no matter what. (_joshm_ 7 Dec 2022)

This [resolved](https://github.com/nextgenhealthcare/connect/discussions/4795) a user's code problem: error after X send attempts.

### Prefer destination queueing

Prefer destination queueing over source queueing as source queueing will take a performance hit on deployment with its message recovery. See [here](https://gist.github.com/jonbartels/675b164000bfedd29a0a5f2d841d92fa). (forgot who provided this)

### Set the incoming data type to RAW for all http listeners

_agermano_: 'For all http listeners, since you can’t trust the sender to send the correct thing, set the incoming data type to RAW.' For example, given a HTTP Listener expecting HL7, Mirth attempts to serialize and pukes on invalid data. To allow a cleaner response message to be returned when various blank/invalid data is provided, set the incoming data type to RAW. Once validated, manually call the serializer for the desired data type. (User had an issue checking for blank HL7 data, so he needed this option.)

Another option to above by _jonb_ and _agermano_

1. Source raw inbound; source hl7 outbound.
1. In the source transformer - check message len, if its zero or not HL7 or whatever.
1. If its blank - then call destinationSet.removeAll(). this is superior to a filter; build a response message with the HTTP error you want; do some logging.
1. If its not blank call the HL7 serializer and parse the message. Send it out of the source transformer. wrap the serializer call in a try/catch to send back a meaningful error message when the message is not blank, but fails serialization
1. Destination takes hl7 as input so when the destination does actual work its got HL7.

For #2 and #3 above, whether you use the source filter or destinationSet.removeAll() in the source transformer depends on whether you want your message to show as filtered or sent.

* _agermano_: for RAW messages, msg will be a java string and connectorMessage.getRawData() will be a javascript string
* _jonb_: (Regarding file hashing) With HL7 you can have things where two messages are the same except for the MSH header information. So the hash should compute on segments other than MSH to really detect duplicates.

### Channel naming conventions

Initiator: _Rodger Glenn_, 2 Dec 2022

_jonb_:

 1. have a convention
 1. enforce it during code reviews
 I really like the naming conventions that designate from_X_to_Y_#### where #### is a port.

_Jarrod_:
I usually use the source name and the type
  ex. XYZ_BATCH
  ex. LLL_REALTIME FEED

_pacmano_:
SITECODE_function. If multitenant EHRBRAND_function. and USE TAGS FOR PORTS as channel names are max 40 chars or so.

_Michael Hobbs_:
I like to also start any channel that listens on a port with said port number. Then if I need I can click the channel view and sort by name.

## Message searching tips

* Set "page size" to 1 to greatly speed up queries you expect to contain only one result. (_pacmano_ 7 Dec 2022)
* Search with just the “has errors” checkbox for an error. I’ve seen a situation where you can get an error but the message status doesn’t get set to ERROR (_joshm_)

## What does Mirth encrypt?

Jan 2023 timeframe

_chris_: Does anyone know exactly what Mirth encrypts when you enable "Encryption" for a channel?

(nothing back yet that he wanted to preserve here)

## Why do I see 'dxx' set in responseMap within the Source mappings?

Initiated by _Richard_, brainstormed by others

Either a bug in the Mirth queries for map data, or perhaps it's the order of operations:

1. Message comes in
1. Source transformer runs
1. Source calls Destination Chain; Source waits till chain is done because no-queueing
1. Destination Chain executes Transformer for D20
1. D20 sends message
1. D20 response transformer runs <- responseMap is populated here
1. Destination Chain completes
1. Source looks at response map and sends responseMsg as a reply

## Questions you were too afraid to ask

### Multiple functions in a code template?

Can I write multiple functions in a code template? Yes, as it's all compiled into one script.
