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

See [my github star list](https://github.com/stars/rogin/lists/mirth-related) that others in [Mirth Slack](https://mirthconnect.slack.com) found useful.

## Where to start learning

* Read through the [Mirth User Guide](https://docs.nextgen.com/bundle/Mirth_User_Guide_42). It has a Best Practices section which can help your message throughput and minimize DB space.

## How do I

See our [new section](HowDoI.md).

## Who is currently selling ANY Mirth extensions or paid extra software?

23 Jan 2023

* [Zen SSL](https://consultzen.com/zen-ssl-extension/)
* [NextGen](https://www.nextgen.com/)
* [InterfaceMonitor](https://www.interfacemonitor.com/) / [xc-monitor](https://mirth-support.com/xc-monitor)
* [MirthSync](https://saga-it.com/tech-talk/2019/03/15/mirthsync+installation+and+basic+usage) is [on GitHub](https://github.com/SagaHealthcareIT/mirthsync), is it a freemium model?
* Mirth Connect User Group maintains a [list](https://www.mcug.org/mirthvendors)

## MC plugin ideas

See [here](PluginIdeas.md).

## Filer Reader not moving to ERROR folder on DB error

If your file reader doesn't move to ERROR folder when a DB error occurs, try changing the `response` drop-down from none to the destination.

## Issue with SFTP channel using a UNC path

_AzDave_
I have a super basic SFTP channel that picks up files from a source, then moves them to a destination. I had set it up, under the Sources tab, to move a copy of the original to a save directory so we could have an original copy. For some reason that move after processing action is not working. No errors, it just seems to not Move after Processing. I have done it on other channels successfully. Manual test worked with WinSCP.

_pacmano_
This is usually the “relative to” directory problem. your move to directory appears to be a UNC path. does the process running mirth have access to that network file share? you can however delete from SFTP and write the file locally, just not from that `after processing` spot in the interface

_agermano_
The source and destination dirs need to be on the same file system. you can't move from sftp to a UNC path. you can only move to another dir on the same sftp server. if it needs to go to a UNC path, then set up another file writer destination

_Kirby Knight_
When testing with a SFTP server, I use filezilla to test the flow manually.

## CI/CD pipeline

_itsjohn_
Hello all, has anyone implemented a CI/CD pipeline with mirth connect?

_pacmano_
[Link to GH discussion](https://github.com/nextgenhealthcare/connect/discussions/4689)

_RunnenLate_
Within Azure we have repos for every channel and a pipeline that links for every repos, when we push to the repo it creates a new release and auto deploys to the next environments based on scripts I've hooked into the API. `dev--> test--> external test--> prod`. That's the best setup I've found with the tools and procedures we have

_itsjohn_
When you deploy changes, I’m assuming you’re undeploying existing and deploying a new version of the channel…are the message history preserved?

_RunnenLate_
messages are stored in the database based on an ID that gets created when you create a new channel, it also assigned a channelID  so if it's your first channel the you get a random string for channelID `234234ded-234sdas-4343354-dsdd34` something like that and the tables for the messages would be `MM_1`. if you upload new XML, it will look at that channelID and use that to overwrite the existing channel and preserve the messages. if it's a different channelID, then it will create a new channel and create `MM_2` in the database

_itsjohn_
But if I push changes for a channel on test to stage server, the channel IDs won’t be same. Even the first time, it’ll create a new ID, no?

_RunnenLate_
so that API uses the channelID to put the new XML so you need to know the channelID you are pushing to

_itsjohn_
Oh you’re using the mirth api. I was assuming that you’re using Mirth cli

_RunnenLate_
we use the cli in dev, export using the cli into a local repo then push from the local repo to an Azure repo, once a push occurs it triggers a new release for that pipeline and will push it to the testing enviornmnets via a python script I wrote that used the api to put the new xml for the channel. the channelIDs don't have to be the same between environments but it makes it much easier. if they are different, you have to store all that within azure for each environment and replace them each time.

## Batch file size considerations

_Kirby Knight_
Has anyone run into a file size limit when using Mirth's batch processing for CSV files?

_joshm_
not specifically a CSV file, but have for sure run into file size limitations when trying to use batch processing on large files. I’ve had to write custom javascript batch scripts before to deal with huge EDI files. Maybe a couple dozen MB? Nick wrote [this](https://github.com/nextgenhealthcare/connect-examples/blob/master/Scripts/EDI%20X12%20Batch%20Script/EDI%20X12%20Batch%20Script.js) for me years ago to deal with that. maybe there’s something in there you can leverage for your CSV data. Probably that `consumeNewLine` function.

_Kirby Knight_
I'm actually looking at putting the limit on the CSV files that are created. Just wondering what that limit should be. Seems like south of a couple dozen MBs will be a good starting point.

_joshm_
10 is a nice round number. I say that because a number of the AWS services we work with have a 10 MB limit on message size.

## Where are those scripts by Alex Aitougan?

[_jonb_](https://github.com/nextgenhealthcare/connect/discussions/4918#discussioncomment-1823705): Alex Aitougan shared some snippets at [#3819](https://github.com/nextgenhealthcare/connect/issues/3819#issuecomment-692894231) that may help you. My team and I have used these in a limited capacity for lower-volume workloads. We did have to modify them, but I don't recall exactly how. These are a good baseline.

## What does the 'pause' button actually do?

If I have a large queue and I pause the channel, does the queue continue to process?

“pause” just stops your source connector. the destinations continue to execute.

## Latin-ish char showing up in my received messages

_pacmano_ seeing a "Ã" being received in a raw HL7 coming into a HTTP Listener.

_chris_
Mirth doesn't let you sent the connector's charset for inbound.
So it will follow HTTP spec which is that the default charset for text/* without a charset parameter is `ISO-8859-1`.
Try setting "binary mime types" to "anything".
Then you'll just get bytes, and you can convert to string yourself and force UTF-8 encoding.
But I think your config may be the problem, here.
You could ask the sender to use `text/plain; charset-UTF-8` and see if that improves things.

_pacmano_
That fixed it. No code changes on my side needed.

## What is the indication when red numbers display in the Dashboard's Connection column?

That you're using all of the Max Connections defined in your TCP Listener.

## Properly use destinationSet filtering

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

You could also filter based on a contextPath as _agermano_ wanted when using a HTTP Listener:
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

## Good practice for configuring the '`Max Processing Threads`'

_Kirby Knight_
If you have a channel where message order doesn't matter, what is a good practice for configuring the '`Max Processing Threads`'?

_tiskinty_
I typically try to keep max threads to the lowest value possible while being able to keep up during the majority of the time. One thing to note about threads though is that it appears that the channel will keep that max number of threads constantly "active" regardless of if they are being used currently, so you can potentially overwhelm your system if you go too high

_agermano_
if you have 5 single threaded channels calling this one (channel), setting your threads higher than 5 won't do anything beneficial. setting it to 2 would just mean that only 2 channels at a time could have an active request. The other channels would patiently wait for them to finish.

_chris_
The default value for `kernel.threads-max` depends upon the system memory size. My EC2 instances with 7.5 GiB of RAM tells me I have 7615 max-threads. Then you have several threads per-channel even if "`Max Processing Threads`" is set to 1 because there's at least one for the Source (depending on the source; I think ChannelReaders don't actually allocate a thread, and the sending channel lends the thread to the target-channel as the source-thread), and I think one per destination or maybe one for all destinations -- I'm not entirely sure. So if you take 10 channels and change "`Max Processing Threads`" from 1 to 10 you may take a server which is using 20 threads and bump that up to over 100.

_agermano_
I'd have to do some digging on this. I think the calling channel directly dispatches the message, where as other connectors spin up additional threads to do the actual work of acquiring the message prior to dispatch, but I think concurrent message processing is still limited by the number of source threads. Obviously if the source queue were turned on, it would require source threads to process anything. It's important to understand where your bottlenecks are, because there will be a point where additional threads reduce rather than improve performance, and that's probably way before you'd come close to hitting any limit.

## TODO: truthy-ness with JS primitives and Java objects

[Long-ass thread](https://mirthconnect.slack.com/archives/C02SW0K4D/p1681915318018659) on truthy-ness with JS primitives and Java objects.

## Mark an ORU^R01 as entered in error

_jonb_
What message type or status would I send to mark an ORU^R01 as entered in error? [status W](https://hl7-definition.caristix.com/v2/HL7v2.5/Tables/0085) on each OBX seems appropriate

_joshm_
Could also use [ORC.1](https://hl7-definition.caristix.com/v2/HL7v2.5/Segments/ORC) = XX or DE

## Differences between Mirth, Rhapsody & redox

_UKMirth_
Any striking difference between Mirth, Rhapsody & redox ? apart from being open source & paid tools ?

_jonb_
I can’t comment in detail on Rhapsody. I have not used it. (@joshm you had some experience, can you help the new person?) Both Mirth and Rhapsody are integration engines.
My current employer uses both Mirth and Redox. My last employer, Zen, competed with Redox and did it better. Redox is a service. It has some functionality similar to an integration engine but it is different. The main advantage of Redox is that once any given hospital or company is connected to Redox, then connecting to other Redox customers is easy. Redox handles a lot of common message types automatically.  Connectivity is easy but the customization and adding logic to Redox is not as easy as doing it in Mirth or Rhapsody. Redox and Zen both offer services, if your primary business is not writing interfaces and interop those services might be more cost effective so you can focus on your core work.
Mirth is VERY flexible. It handles the basics well but you can go really wild with customizations that you might need for specific use cases. Mirth is also fairly accessible, a lot of my non-engineering staff have access to Mirth to look at dashboard and see message counts and errors. It empowers them to fix problems or come to my engineers with more detailed issue reports so we can fix them faster.
Mirth is free open-source software but NextGen also offers some paid extensions that are generally worth the price. There are also training sessions that can help get more out of the free tool (tagging @Mitch Trachtenberg, since he runs those trainings)
It is hard to go wrong starting with Mirth. The tool started because Gary Teichrow and some of the other founders needed an integration engine and couldn’t get even a preview of Iguana. So they got irritated and wrote their own. That low-barrier to get started has stuck with Mirth.
Hope that helps. What is your general use case or need?

_joshm_
I’ve got experience with both Mirth and Rhapsody. Rhapsody is an interesting tool and is very powerful, allowing you to do a lot of things without having to write any actual code. Mirth tends to be more flexible. Both run in java and are cross platform. I like that Mirth has a plug-in architecture where you can create your own extension to do whatever you need that it doesn’t already do for you. You can also add 3rd party jar files if you need to use some specific java package to accomplish something that isn’t available out of the box.

_pacmano_
Redox total cost as installations grow is a trade off. As is the fact aggregators like Zen and Redox don’t often handle specialized workflow without traditional costs for that custom dev work. I’d note that they have no “special” access to EHRs, they use the same integration capabilities that you can use. It’s perhaps a complexity and cost question as much as anything else when choosing to write your own integrations or use an aggregator. I sorta made the term “aggregator” up,  I am not sure if there is another term. None of what I said is meant as a criticism.

_the_Ron_
Zen is not an aggregator, we do not make common connections for our clients other than National Networks like eHEX and CQ and even those are distinct connections and instances of our product Stargate.
Zen offers a managed Integration as a Service solution that empowers entities to either be hands on or hands off.  But integrations are specific that client. We do offer solutions like SAML Utils, SSL Extension, FHIR Libraries, and some internal libraries to simplify and support the industry needs.

_pacmano_
I was referring to your Ehex stuff but your company and your call how it is phrased.

_the_Ron_
It is all good, just wanted to set expectations,  There are a lot of “Magic Sauce” things bantered about in the marketplace and we have found most of those fall short when the rubber meets the road. I truly wished there was some magic sauce stuff to simplify things but even XCA and XDS have quirks that must be managed.

_Mitch Trachtenberg_
Thanks, Jonb. For the record, the manager in charge of NextGen's Mirth Connect Training is Eric Butterfield; I am one of two current instructors. I'm happy, of course, to answer basic Mirth questions here when I'm able. For information about the trainings: [link](https://www.nextgen.com/services/mirth-connect-training)

_Anthony Master_
We (at our hospital) use Mirth and I have seen Rhapsody in use and have researched it a little bit. Before me our hospital used to have Cloverleaf and before that Siemens (don't know the product's name)
IMO, Rhapsody from what I have seen is more non-coder friendly with a better GUI. The other analyst here at the hospital (non coders) liked Cloverleaf and Siemens because based on their experience they were more GUI based as well.
But Mirth is open source and you can use it without any licensing costs or paid support if you choose to do so as long as you don't need some of the paid plugin features (SSL, Channel History, and FHIR to name a few). Mirth has a fairly simple GUI and it can be picked up fairly easy for your other non-coders staff to be able to see stats and start and stop channels without having any interface or coding experience.
While we are at it, and comparing different interface engines and services, let me throw in my :tophat: and recommend if you are looking at something less GUI based and more coder based, have a look at gofer engine which is Nodes.JS/Typescript based and not Java like most of these interface engines seem to be. There is no GUI yet, so the entry curve is steep if you are not already familiar with developing Node.JS applications.
I have built [this interface engine](https://www.npmjs.com/package/gofer-engine) for a custom EHR downtime solution we are developing in house and needed a fast and light running interface engine I can run in docker.
It comes down to what features you want, if you want lower coding level or higher GUI level, and how comfortable you are with the different tech stacks used with each if you deploy them on-premise. There are some great IaaS solutions that may fit your need if you have the :moneybag: and not the :clock1:

## Mac-specific issues

### Can't run MCAL on mac

_mklemens_
for those with a mac:
`open -a Mirth\ Connect\ Administrator\ Launcher.app --args -k`
but I do also believe that me not having `javafx` installed is the reason why I cant run the jar, but doing it with this other command I believe uses the built in runtime.

### Running NG Dockerfile on MacOS with M1 hardware

_joshm_
anyone have any experience running the official NG Dockerfile on MacOS with M1 hardware? I noticed that if I try to build theirs directly, it creates an AMD64 version, but if I explicitly use an additional layer like `FROM eclipse-temurin:17-jre`, it will build a native ARM version. Is there some way I can just use their native Dockerfile and make it compile to ARM?

_jonb_
I use layers too. [This](https://github.com/nextgenhealthcare/connect-docker/issues/15) seems related and links to some multi-platform build doco. Not my area of expertise either.

_joshm_
it runs fine as long as the underlying image is ARM-compatible. something docker uses qemu under the covers to emulate x86/AMD64

_Matt L._
isn’t that the base image they are already using in their [Dockerfile](https://github.com/nextgenhealthcare/connect-docker/blob/master/Dockerfile)?

_joshm_
yep, it absolutely is. something about the layering though tricks it into building the native variant. I tried to build it from a Dockerfile locally. it runs fine when I can get it to build the arm variant and other arm images run equally well

_agermano_
I think it's more than qemu is emulating the CPU. Docker needs to run on a linux kernel. Except for the windows variant. But that linux kernel is going to need to be built for arm or x86. so, it's probably running arm linux in the VM

## Mirth appliance upgrade advice

_Walther_
Could i ask someone about upgrading the mirth vm appliance (V1000). Currently running 3.8 but I'm not sure about upgrading mirth version or postgres. Are these dummy proof to upgrade? Are there any existing items that i need to be aware of to update all of the pieces of the mirth appliance? Any help or guidance is extremely appreciated! I've been holding off upgrading just for fear of the unknown so let me know what you all think.
Thanks!

_jonb_ (and some _joshm_)
Former NG employee, former consultant who supported appliances here:

1. Take a snapshot before you start anything to practice on if possible.
1. You pay for the appliance and for support. Get access to the NG “Success Community” and engage the paid support team
1. Generally, the appliance upgrades are smooth. Under the covers it just installs RPM packages.
1. The main upgrade risks for MC are channel support, so read the [release notes](https://github.com/nextgenhealthcare/connect/release) on Github for each MC release you are updating. Have a test plan.
1. The last time I touched appliances (about 8 months ago) they were running what are in my opinion dangerously old versions of Postgres. Particularly the PG 9.6 series.
1. DB upgrades are generally as long as the DB is large. Consider backups, pruning, etc. then do your upgrade

_Walther_
Would some of the coding that exists today not work with an upgrade?

_joshm_
very unlikely to have any issues unless you’re relying on some specific versions of included jar files to do some custom scripting. but that’s where reading the release notes comes in

_Jarrod_
Also if you use the plugins all of those need to get updated for the appliance mirth connect. And 'mirth results' on the appliance was sunset as well as of December 2022. (Last date I heard from NexGen)

_jonb_
lots of changes since [3.8](https://github.com/nextgenhealthcare/connect/releases). One example is that release (3.10?) that changed how DB case was handled. Then 3.? updated Java libraries. If you’re not using those features, no worries. If you were, test your code.

## Mirth upgrade advice

_mklemens_
I wonder if anyone can give me advice on upgrading mirth... is there a general rule of thumb about upgrades? In the past, I have upgraded mirth (in a linux environment) by NOT using the installer and downloading the tar, extracting it to a new folder, copying over config files and then starting the service - and that's it.  Is this BAD to do or is this totally acceptable?

_jonb_
tarball is better, installer does weird stuff like running as root

_pacmano_
I manually download any extra extensions. I do use the installer now. Caveats are

1. don’t install the service
1. fix the dir permissions after install suitable for the non-root user that should run mirth.

_mklemens_
I always worried that there were certain behind the scenes scripts and other hidden stuff that maybe I was missing out on by not running the installer

_jonb_
TL;DR read the release notes and understand what you might be exposed to

_pacmano_
and create your own systemd startup scripts.

_jonb_
_TODO: link to section above "Mirth appliance upgrade advice"_

_mklemens_
and if an upgrade goes bad - is there any way to downgrade (besides just taking a database backup and restoring that backup)?

_pacmano_
I don’t think so. but never had to do that since someone should be thoroughly testing that way before a production upgrade.

_mklemens_
so for those of you that go the tar route... just extracting the tar into a new folder and copying config over is all that you ever do? no other special "upgrade scripts" or anything extra like that?

_pacmano_
when I did the tar route I extracted to a new dir and migrated what was needed over. Then symlinked to keep outside scripts from referring to the wrong dir. obviously lots of ways to do that.

_agermano_
@pacmano what do you gain by using the installer that way over unpacking the tarball? does it update in place?

_pacmano_
it auto detects the last install. seems to remove parts and install.

## Replicate Cloverleaf resending "outbound post tps"

_Jeff Jensenius_
Hello -- I have some RAW Javascript code on a filter of a TCP sender. I would like to take an encoded message (tweak it myself) and run it into this connection WITHOUT hitting the code on the filter.  Our old engine (cloverleaf) this would be called resending "outbound post tps". Does mirth have the ability to do this?

_pacmano_
You mean bypass the source entirely?  Or send a message to mirth and skip a destination filter when it hits that destination? the latter is just a matter of modifying your filter to check for some value that would never occur in real life but does occur in the test message you are sending. i.e. check for it and just “return true” rather than do the rest of the filter code.

_Jeff Jensenius_
Thanks --  I would be sending to mirth and skipping the filter. I'll add the value and return true in the code.

## How threads work with the channel writer/vmrouter calls

_jonb_
Is there a good writeup of how threads work with the channel writer/vmrouter calls? The gist I remember is that the destination writer runs the source connector in the destination thread. I need to explain this to a teammate and it is something I “just know” and I cannot word good to articulate it to my peer. this guy [says](https://github.com/nextgenhealthcare/connect/discussions/5346#discussioncomment-3374538) the same thing but didn’t cite sources. [still](https://github.com/nextgenhealthcare/connect/discussions/5296#discussioncomment-3223103) no citations. It should be demonstratable with a destination channel writer then the source connector of the target channel just has a sleep. I had to chase this down at Zen or prove a friend wrong for the lulz

_agermano_
both a channel writer and vmrouter end up calling `EngineController.dispatchRawMessage`. it gets interesting. Everything converges [here](https://github.com/nextgenhealthcare/connect/blob/development/donkey/src/main/java/com/mirth/connect/donkey/server/channel/Channel.java#L1249) whether you call `routeMessage` to dispatch or the http listener's handler tries to dispatch a message. there is a Set of dispatchThreads, but it adds the current thread to the Set.

## Mirth quirks that can bite you

### Channel changes won't deploy

9 Dec 2022
Issue: channel changes were not being deployed.
Solution: Be sure to undeploy the channel first as it resolved his issue. Multiple users vouch for this as they've all seen it occur.

### MCAL lock-up

Ensure you click the checkbox for 'close MCAL after launch' or else the UI may freeze while performing common tasks. [Existing ticket](https://github.com/nextgenhealthcare/connect/issues/5765). _jonb__ observed it more on Windows in AWS Workspaces but have seen it on MacOS too.

_dforesman_ IIRC with this bug, if the one locks up, it'll "lock" up the other instances as well.

### `channelName` not populated in the global PostProcessor

_joshm_
is `channelName` not populated in the global PostProcessor script? I worked around this with `ChannelUtil.getChannelName(channelId);` but odd that it didn’t work in the postprocessor but did in preprocessor script. it is a valid variable in context, but it returns `null` on the postprocessor.

_pacmano_
I know I had to use ChannelUtil like you did for an undeploy script.

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

### '500 Server Error' on Dashboard

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

### JS `Object.values()` throwing

_itsjohn_
I’m using `Object.values()` but it throws an error `cannot find function values in object function Object ()`.

_Daniel Ruppert_
The Rhino Engine [doesn't implement](https://forums.mirthproject.io/forum/mirth-connect/support/19120-using-javascript-object-values) that until [v1.7.14](https://github.com/mozilla/rhino/pull/902). A [feature request](https://github.com/nextgenhealthcare/connect/issues/5541) was opened.

### Accessing sourceMap

Encountered error text:
`The source map entry "VARNAME" was retrieved from the channel map. This method of retrieval has been deprecated and will soon be removed. Please use sourceMap.get('VARNAME') instead.`

Solution: Change all `$('VARNAME')` to `sourceMap.get('VARNAME')`.

This was encountered in v3.12.0, and the error message was seen in the [latest v4.2.0 code](https://github.com/nextgenhealthcare/connect/blob/development/server/src/com/mirth/connect/server/userutil/ChannelMap.java#L74), so MC upgrades and channel fixes can be independent.

### Dealing with 'Early EOF' in HTTPReceiver

_RunnenLate_
anyone know how i can troubleshoot this error, i don't see a single message as error within the channel
`ERROR  (com.mirth.connect.connectors.http.HttpReceiver:522): Error receiving message (HTTP Listener "Source" on channel 12c72fc1-39f4-4e55-840d-4bdcdb9b328f).
org.eclipse.jetty.io.EofException: Early EOF`
the client is trying to send just tons of concurrent connections and it's limited to 10 threads.

_tiskinty_
based on experience, that's usually a network error. I would guess it's a firewall issue based on the EOF, but that's not a sure thing by any means. the thread/connection setup doesn't usually cause that from what I've seen before. 99% of the time when I've seen it, it was directly related to a firewall or VPN setup needing to be restarted. Otherwise, it might be enough (depending on the actual networking setup) to re-deploy the channel. I've seen that work occasionally in the past. I wouldn't bank on it, but it's typically low risk

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

Nothing directly in Mirth (as of Feb 2023).

_chris_: It's very easy to pull a remote cert. Just connect to the service via HTTP and the server will provide it. Then you check it for upcoming expiration. Something like [certcheck](https://github.com/ChristopherSchultz/certcheck) or [check_ssl_cert](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_cert/details) or [check_ssl_certificate](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_certificate/details) or [check_http](https://nagios-plugins.org/doc/man/check_http.html).

## Mirth licensing Q&A

Q1. Is CURES available under existing licenses or separate from other plugins?
A1. Mirth Rep _Travis West_: "It is separate and requires Gold or Platinum bundles." (Essentially an upcharge in addition to Platinum.)
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
_SteveX_
"Can anyone point me in the direction of documentation/tips around best practice data pruner configuration settings? We have a server with > 1000 channels and millions of messages processed each day. We only store 5 days worth of data on each channel and prune daily, but the data pruner is taking over 32 hours to run with some individual channels taking over 45 minutes to prune about 209k messages and 2million content rows.  Database is MySQL running on an AWS RDS instance.  Is that the best I can expect the pruner to perform?  Am I better off pruning less often even though it will need to churn through more messages per run? Should I be tweaking the block size (currently set at 1000)?  Thanks for any pointers!"

_SteveX_
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

## Channel development tips

### "Include Filter/Transformer"

If you are queuing on a destination and it makes sense for your workflow, select "Include Filter/Transformer" in the queue settings. Then that script will execute in the queue thread(s) instead of the source's. (_narupley_)

### Destination Set Filtering

_TODO: link to above where we have sample code_

Given many destinations where most of them get filtered: to improve performance, you can instead use "Destination Set Filtering" in your source transformer. You can decide which destinations to exclude, and then those will not be committed to the database in the first place. That can greatly reduce the database load for a channel. This is [described](https://docs.nextgen.com/bundle/Mirth_User_Guide_42/page/connect/connect/topics/c_Use_Destination_Set_Filter_faq_mcug.html) in the [Best Practices](https://docs.nextgen.com/bundle/Mirth_User_Guide_42/page/connect/connect/topics/c_Channel_Development_Best_Practices_and_Tips_connect_ug.html) section of the User Guide. (_narupley_)

Summary for using this is

1. create an additional channel at the end that is set to throw so admins review
1. Default your `removeAllExcept` to the above channel
1. Log a 'reason for filter' text
1. be sure to check the boolean return value to the `remove*` functions

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

## Response transformer fires for an http sender for a 500

_pacmano_
Why would a response transformer fire for an http sender for a 500? The response transformer is not set to raw.

_jonb_
Did the server return a 500 and content whose content type matched the expected response type?

_pacmano_
ah… `application/problem+json`;

_agermano_
Content type shouldn't matter. Any content sent at all should trigger it. The wrong type would throw a parse error at the start of the transformer.

## What does Mirth encrypt?

Jan 2023 timeframe

_chris_: Does anyone know exactly what Mirth encrypts when you enable "Encryption" for a channel?

(nothing back yet that he wanted to preserve here)

April 2023 timeframe

_tiskinty_
I've used it, though I was not looking for database level so much as limiting the info available via the mirth api

_chris_
I never bothered to check: Mirth's API won't return a decrypted message to a client?

_tiskinty_
if includeContent is true, the API will return an encrypted string in the message's place. I can't speak to the security aspect of it, but it's plenty to prevent the average customer service rep from getting too much info.

_chris_
I would imagine that most environments won't give access to the database to anyone who isn't authorized to view that patient data. So basically the DBAs are okay to see that data, even if theoretically they should not have access to it. (Same with API access.)

_agermano_
I didn't realize the API returned the message encrypted. So it ends up getting decrypted on the client side? that seems less secure lol.

_chris_
I suspect it would only be decryptable if the client also had the key. If the API is coughing-up security keys that would be a huge problem IMO.

_agermano_
  13 hours ago
It looks like [it does decrypt data](https://github.com/nextgenhealthcare/connect/blob/development/donkey/src/main/java/com/mirth/connect/donkey/server/data/jdbc/JdbcDaoFactory.java#L59) when reading message content from the database by default. However, the controller that handles the API call to get multiple messages [intentionally tells it not to decrypt when includeContent is selected](https://github.com/nextgenhealthcare/connect/blob/development/server/src/com/mirth/connect/server/controllers/DonkeyMessageController.java#L202-L207). I confirmed GET `/channels​/{channelId}​/messages` with `includeContent=true` returns encrypted content, but GET `/channels​/{channelId}​/messages​/{messageId}` returns decrypted content. I have the feeling the former is used when exporting messages, and you would likely decrypt on import. I don't think the message browser includes the content when making the first call, so it would decrypt on demand when you clicked on a message to view the content.

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
