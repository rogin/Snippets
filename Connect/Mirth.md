# NextGen Connect FAQs

## Others tracking FAQs

See [_jonb_'s useful gists](<https://gist.github.com/jonbartels>) which overlap here in some areas. His [SSL writeup](https://gist.github.com/jonbartels/8abd121901eb930f46245d9ef0f5710e) is excellent.

See [Michael Hobbs' gists](https://gist.github.com/MichaelLeeHobbs) which include an excellent [Mirth channel table resizer for PG](https://gist.github.com/MichaelLeeHobbs/67980d165fc68880eb2ab283c673244b).

NextGen manages a [repo](https://github.com/nextgenhealthcare/connect-examples) for various code templates.

## Where can I view Mirth milestones, including planned tasks?

Look [here](https://github.com/nextgenhealthcare/connect/milestones).

## Other projects on github using Mirth?

See [my list](https://github.com/stars/rogin/lists/mirth-related) that others in [Mirth Slack](https://mirthconnect.slack.com) found useful.

## How do I

See our [new section](HowDoI.md).

## Who is currently selling ANY Mirth extensions or paid extra software?

23 Jan 2023

* [Zen SSL](https://consultzen.com/zen-ssl-extension/)
* [NextGen](https://www.nextgen.com/)
* [InterfaceMonitor](https://www.interfacemonitor.com/) / [xc-monitor](https://mirth-support.com/xc-monitor)
* [MirthSync](https://saga-it.com/tech-talk/2019/03/15/mirthsync+installation+and+basic+usage) is [on GitHub](https://github.com/SagaHealthcareIT/mirthsync), is it a freemium model?

## Where to start learning

* Read through the [Mirth User Guide](https://docs.nextgen.com/bundle/Mirth_User_Guide_42). It has a Best Practices section which can help your message throughput and minimize DB space.

## Pruning question

_tarmor_: If message has one destination in ERROR status, the purge process will not remove the message. If I search for messages in ERROR status and do "Remove results", it will only remove the destination messages, not the whole message. Will the purge process remove then the source and other destinations, since there is no error anymore?

_jonb_
[His gist](https://github.com/nextgenhealthcare/connect/blob/b3bd6308b789d16e4b562bd5686cef883fa1faf1/server/dbconf/postgres/postgres-message.xml#L412)
This is for postgres. You can find sibling files for other DB engines for getMessagesToPrune . MC does a SELECT to find message IDs to remove then it does a second operation to actually delete those messages.
A [recent release](https://github.com/nextgenhealthcare/connect/milestone/69?closed=1) of MC introduced “prune error” in 3.12.
I wrote a custom pruner for my employer a few months ago. (_ed note_: stated in March 2023.) I have forgotten a lot of the details but I can find them again if there is sufficient interest.

## Dealing with 'Early EOF' in HTTPReceiver

_RunnenLate_
anyone know how i can troubleshoot this error, i don't see a single message as error within the channel
`ERROR  (com.mirth.connect.connectors.http.HttpReceiver:522): Error receiving message (HTTP Listener "Source" on channel 12c72fc1-39f4-4e55-840d-4bdcdb9b328f).
org.eclipse.jetty.io.EofException: Early EOF`
the client is trying to send just tons of concurrent connections and it's limited to 10 threads

_tiskinty_
based on experience, that's usually a network error
I would guess it's a firewall issue based on the EOF, but that's not a sure thing by any means
the thread/connection setup doesn't usually cause that from what I've seen before. 99% of the time when I've seen it, it was directly related to a firewall or VPN setup needing to be restarted
Otherwise, it might be enough (depending on the actual networking setup) to re-deploy the channel. I've seen that work occasionally in the past. I wouldn't bank on it, but it's typically low risk

_RunnenLate_
no firewall in front of the server, just an F5 which there is no way I would restart
I told the client to reduce their queue for 9000 to 100 and retry

## JS "Object.values()" throws an error in Mirth

_itsjohn_
I’m using Object.values() but it throws an error ‘cannot find function values in object function Object ()’.

_Daniel Ruppert_
The Rhino Engine [doesn't implement](https://forums.mirthproject.io/forum/mirth-connect/support/19120-using-javascript-object-values) that until [v1.7.14](https://github.com/mozilla/rhino/pull/902). A [feature request](https://github.com/nextgenhealthcare/connect/issues/5541) was opened.

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

## Error: “Assignment to lists with more than one item is not supported”

See [forum](https://forums.mirthproject.io/forum/mirth-connect/support/16781-): you’re trying to set a repeating segment to a non repeating segment

## What was included in the MCAL v1.3.1 release?

_narupley_: new code signing cert that is baked into the launcher, that's it

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

## Error message related to sourceMap

Encountered error text:
The source map entry "VARNAME" was retrieved from the channel map. This method of retrieval has been deprecated and will soon be removed. Please use sourceMap.get('VARNAME') instead.

Solution: Change all $('VARNAME') to sourceMap.get('VARNAME').

This was encountered in v3.12.0, and the error message was seen in the [latest v4.2.0 code](https://github.com/nextgenhealthcare/connect/blob/development/server/src/com/mirth/connect/server/userutil/ChannelMap.java#L74), so MC upgrades and channel fixes can be independent.

## My batch processing is slow

_Jon Christian_ has batch file of JSON records using a SFTP reader to channel writer, retaining message order was not required

_jonb_ and _agermano_ tag team

You really need destination queueing so you can multithread this.
It's waiting for the downstream channel to process before pulling the next message

TL;DR when you do a channel writer the SOURCE connector for the target channel runs in the DESTINATION thread of the caller. So if your target channel is slow, your destination is also slow.

you probably are not utilizing all 10 source threads if your upstream channel is the only thing sending to this one

YOLO. Set queue always and give it like 5-10 threads. Start there. Queue on failure wont queue UNTIL THERE IS A FAILURE.
You'll still see slowness because your first channel is waiting on your second channel. The second channel is taking ~2 seconds per message. The queue in the first one will clearly demonstrate that. The multithreading may make it "good enough".

if you want 10 threads in the downstream channel, you'll either need to enable the downstream source queue, or use 10 destination threads in the upstream channel

With the source queue on, it will accept messages as fast as it can and distribute them among the source threads you have defined. With the source queue off, the 10 threads will be a maximum, but if there are only 5 threads sending messages synchronously, then it will only be using 5/10 threads at a time.

Either option should allow the file reader to generate the messages much faster without waiting for the previous message to process

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
For your original idea - I wouldn’t call the HTTP API. I would call the internal APIs. It could be as simple as doing router.routeMessage() to your channel or as complicated as calling ChannelController to pop a new message in

## Sample message transformations from HL7v2 to FHIR

13 Jan 2023
_jonb_ recommends [these](https://confluence.hl7.org/display/OO/v2+Sample+Messages).

## Can Mirth verify certificates of external parties?

(Feb 2023) Nothing directly in Mirth.

_chris_: It's very easy to pull a remote cert. Just connect to the service via HTTP and the server will provide it. Then you check it for upcoming expiration. Something like [certcheck](https://github.com/ChristopherSchultz/certcheck) or [check_ssl_cert](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_cert/details) or [check_ssl_certificate](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_certificate/details) or [check_http](https://nagios-plugins.org/doc/man/check_http.html).

## Mirth licensing Q&A

Q1. Is CURES available under existing licenses or separate from other plugins?
A1. _Travis West_: "It is separate and requires Gold or Platinum bundles." (Essentially an upcharge in addition to platinum.)

## I encounter odd String and XML errors intermittently when sending between channels

Ensure you do not have a [xalan](https://mvnrepository.com/artifact/xalan/xalan) jar in your custom library. (_rogin_ to fill in what problems were presenting)

## Performance metrics

## Improvements when pruning more often

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

(Rhino 1.7.12 is in Mirth 3.12.0, and Rhino 1.7.13 in Mirth 4.2, so it may have been included in the initial Mirth 4.x line)

_agermano_: like I said, the `map[foo]` should work in your current mirth version (I've tested it with rhino 1.7.13, but not actually in mirth)
when map is a `java.util.Map`
in prior rhino versions a js object is implemented with `NativeObject` and a java Map would have been represented by `NativeJavaObject` (basically a wrapper class.) rhino 1.7.13 introduced `NativeJavaMap` as a subclass of `NativeJavaObject` that adds this behavior.
Also `NativeJavaList`, which allows you to access a `java.util.List` by index like a js array instead of using the get method.

## Channel deployment tips

9 Dec 2022
Issue: channel changes were not being deployed.
Solution: Be sure to undeploy the channel first as it resolved his issue.

## Blank messages and mappings in dashboard

User: messages are sent to the Channel and the channel send the messages to the destination channel. But when i look at the dashboard the Messages and the mappings are blank.
Solution: Review your 'message storage' and 'message pruning' configuration - perhaps it is set to remove content on completion.

## Channel development tips

* Set your response data type to RAW. That will force your response transformer code to always execute no matter what. (_joshm_ 7 Dec 2022)
** user's code to error after X send attempts was failing, needed the above [to resolve](https://github.com/nextgenhealthcare/connect/discussions/4795). (29 Dec 2022)
* Prefer destination queueing over source queueing as source queueing will take a performance hit on deployment with its message recovery. See [here](https://gist.github.com/jonbartels/675b164000bfedd29a0a5f2d841d92fa). (forgot who provided this)
* _agermano_: 'For all http listeners, since you can’t trust the sender to send the correct thing, set the incoming data type to RAW.' For example, given a HTTP Listener expecting HL7, Mirth attempts to serialize and pukes on invalid data. To allow a cleaner response message to be returned when various blank/invalid data is provided, set the incoming data type to RAW. Once validated, manually call the serializer for the desired data type. (User had an issue checking for blank HL7 data, so he needed this option.)
* another option to above by _jonb_ and _agermano_

1. Source raw inbound; source hl7 outbound.
2. In the source transformer - check message len, if its zero or not HL7 or whatever.
3. If its blank - then call destinationSet.removeAll(). this is superior to a filter; build a response messsage with the HTTP error you want; do some logging.
4. If its not blank call the HL7 serializer and parse the message. Send it out of the source transformer. wrap the serializer call in a try/catch to send back a meaningful error message when the message is not blank, but fails serialization
5. Destination takes hl7 as input so when the destination does actual work its got HL7.

For #2 and #3 above, whether you use the source filter or destinationSet.removeAll() in the source transformer depends on whether you want your message to show as filtered or sent.

* _agermano_: for RAW messages, msg will be a java string and connectorMessage.getRawData() will be a javascript string
* _jonb_: (Regarding file hashing) With HL7 you can have things where two messages are the same except for the MSH header information. So the hash should compute on segments other than MSH to really detect duplicates.

### Channel naming conventions

Initiator: Rodger Glenn, 2 Dec 2022

_jonb_:

 1. have a convention
 2. enforce it during code reviews
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

Initiated by _Richard_

Either a bug in the Mirth queries for map data, or perhaps it's the order of operations:

1. Message comes in
1. Source transformer runs
1. Source calls Destination Chain; Source waits till chain is done because no-queueing
1. Destination Chain executes Transformer for D20
1. D20 sends message
1. D20 response transformer runs <- responseMap is populated here
1. Destination Chain completes
1. Source looks at response map and sends responseMsg as a reply

## Channel stats missing after DB migration

Initiator: _Bhushan U_ on 14 Nov 2022
Solution provider: _agermano_

Hello Team, I need some advice on migrating mirthconnect application with local postgresql database server from windows 2008 to windows 2012 server.
So far I did postgres database backup and restore plus mirthconnect configuration files backup and restore. But there is still some discrepancy between new server and old server.

Issue: channels stats not showing up after postgres database backup and restore then configuration files backup and restore
Reason: channels statistics are saved per server ID
Solution: Update the current server\'s ID to that of the original server. See [user guide](https://docs.nextgen.com/bundle/Mirth_User_Guide_41/page/connect/connect/topics/c_Application_Data_Directory_connect_ug.html) for details.
