# NextGen Connect FAQs

## Others tracking FAQs

See [_jonb_'s useful gists](<https://gist.github.com/jonbartels>) which overlap here in some areas. His [SSL writeup](https://gist.github.com/jonbartels/8abd121901eb930f46245d9ef0f5710e) is excellent.

See [Michael Hobbs' gists](https://gist.github.com/MichaelLeeHobbs) which include an excellent [Mirth channel table resizer for PG](https://gist.github.com/MichaelLeeHobbs/67980d165fc68880eb2ab283c673244b).

NextGen manages a [repo](https://github.com/nextgenhealthcare/connect-examples) for various code templates.

## Other projects on github using Mirth?

See [my list](https://github.com/stars/rogin/lists/mirth-related) that others in [Mirth Slack](https://mirthconnect.slack.com) found useful.

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

## Improvements when pruning more often

_mklemens_ found that changing pruning from every 24 hours to every hour stopped his DB's autoscaling.

_jonb_
[mysql-message.xml](https://github.com/nextgenhealthcare/connect/blob/b3bd6308b789d16e4b562bd5686cef883fa1faf1/server/dbconf/mysql/mysql-message.xml#L371)
The block size matters for Postgres. Has to do with how PG handles an IN clause.

## Error: “Assignment to lists with more than one item is not supported”

See [forum](https://forums.mirthproject.io/forum/mirth-connect/support/16781-): you’re trying to set a repeating segment to a non repeating segment

## What was included in the MCAL v1.3.1 release?

_narupley_: new code signing cert that is baked into the launcher, that's it

## Where can I view Mirth milestones, including planned tasks?

Look [here](https://github.com/nextgenhealthcare/connect/milestones).

## Details on the Thread Assignment Variable

See [here](https://github.com/nextgenhealthcare/connect/discussions/5698).

## Updating legacy Mirth forum links

_jonb_: Given __<https://www.mirthcorp.com/community/forums>__/showthread.php?t=8783, replace with __<https://forums.mirthproject.io>__/showthread.php?t=8783

## S3 connectivity example

Initiated by _Gio_ using v1 of the AWS Java SDK

````javascript
var awsProfile = new Packages.com.amazonaws.auth.InstanceProfileCredentialsProvider();
var s3client = new Packages.com.amazonaws.services.s3.AmazonS3Client(awsProfile);
````

He didn't need accesskey nor secretkey as he's using ec2Role.

_joshm_
use the built-in S3 packages (v2.x) which changed the full package names. you don’t need external jars. You would just want to replace your credentials provider class

````javascript
function getS3Client2(){

 var software = Packages.software;
 var region = software.amazon.awssdk.regions.Region.US_EAST_2;
 var awsCreds = software.amazon.awssdk.auth.credentials.AwsBasicCredentials.create($cfg("AwsAccessKeyId"),$cfg("AwsSecretAccessKey"));

 var s3 = software.amazon.awssdk.services.s3.S3Client.builder()
  .region(region)
  .credentialsProvider(software.amazon.awssdk.auth.credentials.StaticCredentialsProvider.create(awsCreds))
  .build();

 return s3;
}
````

When using ec2Role:

````javascript
//set region where AWS bucket lives
region = Packages.software.amazon.awssdk.regions.Region.US_EAST_2;
//configure s3Client
var s3Client = Packages.software.amazon.awssdk.services.s3.S3Client.builder().region(region).build();

getObjectRequest = Packages.software.amazon.awssdk.services.s3.model.GetObjectRequest.builder().bucket(bucketName).key(objectKey).build();
//you may want to omit asUtf8String() to access the bytes directly
messageContent = s3Client.getObjectAsBytes(getObjectRequest).asUtf8String();
````

## Exporting DICOM images

_Gio_
Do we know why this happens? "Error: Cannot export DICOM attachments."
when I try to open the attachment it works

_pacmano_
from source code, exporting appears to be unsupported.
I think it's because the dicom attachment is not the full dicom message, but only the extracted pixel data

_jonb_
The [export](https://github.com/nextgenhealthcare/connect/blob/b3bd6308b789d16e4b562bd5686cef883fa1faf1/client/src/com/mirth/connect/client/ui/AttachmentExportDialog.java#L171) method

````java
if (StringUtils.isBlank(fileField.getText())) {
    PlatformUI.MIRTH_FRAME.alertError(this, "Please fill in required fields.");
    fileField.setBackground(UIConstants.INVALID_COLOR);
    return;
}
````

If you lie to MC about the attachment MIME type it will export
ahh worst case use JS and copy the attachment and change the mime type on the copy.
`SELECT * FROM d_maXX where id = YYY` would do too.

## Ensuring a HTTP sender destination hits the http server in order of the queue

_Craig A_
How can i ensure that my HTTP sender destination hits the http server in order of the queue
in my screenshot, actionkey is in numeric order. but when I look on my http server logs. messages are processing out of order (because a message might take longer than others, and mirth has already done the next call before the previous one has finished)

_jonb_
[Conversation](https://mirthconnect.slack.com/archives/C02SW0K4D/p1678282342826799) from earlier this morning. I think it is a different problem but read that thread first. It’s a fresh question and might be related.
Enabling queueing will make message ordering LESS likely to work.

_narupley_
As long as your Queue Threads are set to 1 (and you don't have Rotate turned on), then the queue is always guaranteed to process in order.
From the perspective of Mirth Connect, everything is sending in order, it's sending the HTTP request and getting the successful (200 or whatever) response and moving on
If the remote server is processing out of order still, then that means the issue lies with that remote server, not with Mirth Connect. That server might be set up with its own parallelization such that a 200 response might be sent back immediately and then processing happens asynchronously, similar to how the Source Queue works in MC
Ah okay, so you don't have the queue enabled, however you do have your Max Processing Threads set to 6
That is why.
Your channel is processing received messages in parallel
By default that is set to 1, meaning that only 1 message can process through a channel at any time
However, note that if you set that back to 1, then that will push the elapsed time up a level, to the upstream channel that is sending to that Channel Reader
Since you're not sending back a response in the source settings anyway,
You could just enable queuing on your HTTP Sender destination there

_Jarrod_
Would it make sense to set respond before processing

_narupley_
Not for his use-case, because he has the Max Processing Threads set to 6 (presumably so that multiple upstream channels/threads can send messages to that channel at the same time).
If you enable the Source Queue, then it's going to use 6 queue threads, whatever Max Processing Threads is set to.
He could enable the Source Queue and turn the Max Processing Threads down to 1 though, and that would be functionally similar, but only if that channel doesn't have any preprocessor/filter/transformer/postprocessor scripts that he wants to have parallelized too.

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

## Send fileset daily via Mirth

_Kit_ on 7 March 2023
is it possible to get Mirth to send the same set of messages every day without using another tool like windows scehuler to do the scheduling?
So we have a few servers that gets redeployed every day with their sample data getting reset each time.
I want to be able to send a set of HL7 to some of these servers that will create a bunch of ie. clinic appointments over the next month or so
so I think ideally I would have a bunch of text files with the messages in them, then each day Mirth would pick them up, go through some transforms etc. to ensure the dates are correct, and then send them onwards

_pacmano_
All source connectors that end in “reader” can be scheduled.

_Kit_
ah ok, so if I set up a file reader to poll once a day, and do not get it to move the files when processing, then it will re-process the same messages every day?

_pacmano_
yup

## Use Mirth to retrieve a file from S3 bucket

_Felipe Nazal_: Has anyone used Mirth to retrieve a file from S3 bucket without passing secret and access key, because ec2 instance role has already access to S3. I need to do it inside of the transformer, thanks!

_narupley_: The File Reader/Writer supports all of that out of the box, see here for everything we do: [S3Connection.java](https://github.com/nextgenhealthcare/connect/blob/development/server/src/com/mirth/connect/connectors/file/filesystems/S3Connection.java)
But honestly we're not doing much special, just following the AWS SDK docs
If you use DefaultCredentialsProvider then that gets you what you want, it'll automatically search for credentials in the standard places like env vars or an ec2 instance role
Everything you need for connecting to S3 should already be included
[Developer Guide](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/home.html)
[S3 package](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/package-summary.html)
You could also just use the internal Mirth Connect classes directly like `var s3Connection = new com.mirth.connect.connectors.file.filesystems.S3Connection(...)`

Though doing that could break your script in the future if we ever change stuff in that class

## Error message related to sourceMap

Encountered error text:
The source map entry "VARNAME" was retrieved from the channel map. This method of retrieval has been deprecated and will soon be removed. Please use sourceMap.get('VARNAME') instead.

Solution: Change all $('VARNAME') to sourceMap.get('VARNAME').

This was encountered in v3.12.0, and the error message was seen in the [latest v4.2.0 code](https://github.com/nextgenhealthcare/connect/blob/development/server/src/com/mirth/connect/server/userutil/ChannelMap.java#L74), so MC upgrades and channel fixes can be independent.

## How do I see the full runtime JS code?

See _odoodo_'s [code comment](https://github.com/nextgenhealthcare/connect/discussions/4847#discussioncomment-2251713).

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

## Return an HTTP response from a source filter

_chris_
I have an HTTP listener and I'm adding a source Filter. Can I return an HTTP response from the filter itself?

The current response is coming from the one-and-only-one Destination.

<https://forums.mirthproject.io/forum/mirth-connect/support/18611-custom-response-message-creation-after-source-filter-step-itself>
Looks promising.

It looks like I can use the post-processor to select between two different responses: either one triggered by the source-filter (stuff something into the channelMap?) or by returning the destination's usual response. How do I say "give me the destination's response" in the post-processor??

_pacmano_
Building \$r as the message traverses the channel and responding with that (via respond from drop down) seems the most intuitive to me.    Alternatively building a \$c var and returning that in the postprocessor is another option (picking post processor in drop down).

_chris_
So, tell the channel I want to use $foo as my response and just set \$foo in either the source filter OR the destination?
That's cool and easy.
Which map do I want to use for that purpose?
channelMap?

_pacmano_
\$c works.   \$r is intended for that purpose of course and is visible on the respond from drop down.  

_chris_
Is the responseMap visible from the source transformer?
Looks like the answer is "yes".

## HL7 tips

### Escaping rules

See [here](https://docs.intersystems.com/latest/csp/docbook/DocBook.UI.Page.cls?KEY=EHL72_ESCAPE_SEQUENCES) and [here](https://www.hl7plus.com/Help/Notepad/index.html?hl7_escape_rules.htm).

### Add HL7 fields out of order

[FixHL7NodeOrder.js](FixHL7NodeOrder.js) copied from [this comment](https://github.com/nextgenhealthcare/connect/issues/633#issuecomment-626857519)

Usage example

````javascript
msg = fixHL7NodeOrder(msg);
````

### Merging HL7 subcomponent text

Originator: _Anibal Jodorcovsky_, March 2023

His client is sending this faulty data, and while they're tasked with fixing, he is providing an interim solution.

I have somebody sending me "invalid" HL7 with & in one of the segments. ORC-8.1 is this "Printset: CTA HEAD & NECK W/CONTRAST". So, when I extract `msg['ORC']['ORC.8']['ORC.8.1']` I get this `<ORC.8><ORC.8.1><ORC.8.1.1>Printset: CTA HEAD </ORC.8.1.1><ORC.8.1.2> NECK W/CONTRAST</ORC.8.1.2></ORC.8.1></ORC.8>`.  I want to be able to obtain the string `Printset: CTA HEAD & NECK W/CONTRAST`.

_chris_ IMO best place to do this is in the preprocessor. Just look for that exact string and replace it.

_MikeH_ with the link to [this gist](https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Join%20HL7%20Subcomponents) and the following:

````javascript
//example usage
msg['OBR']['OBR.4']['OBR.4.2'] = joinSubcomponents(msg['OBR']['OBR.4']['OBR.4.2'],'&').replace("&","\\t\\")
````

Essentially:

* Get the contents of your field into a string
* Replace the ampersand with the appropriate HL7 substitution
* Save the updated string back to the msg

### Deleting from XMLLists

_Jarrod_: anyone delete from a 'for each'?
I normally have to have a counter to do it and I want to know if there is another way.
works: `delete ['OBX'][3]`
does not work:

````javascript
for each(obx in msg..OBX)
{
   delete obx;
}
````

_pacmano_
If xml/hl7 I delete via for loop in reverse order.
deleting a segment messes up the array offset which does not happen if you do it in reverse order

_agermano_:

````javascript
for each (var obx in msg.OBX) {
  if (condition) {
    delete obx[0]
  }
}
````

Without the index you are deleting the reference to the xml object. With the index tells it to delete from the object to which obx refers.
you don't need a counter, just always use index 0 in the for each loop, and it will delete the current object
because e4x is weird
e4x intentionally blurs the line between a single object, and a list with a single element
it also does a lot of magic so when you delete an element from a document, it automatically reindexes all of the other children so as to not leave any gaps
if you have a javascript `array [1,2,3,4,5]`, and you `delete array[1]`, you'll end up with `[1,undefined,3,4,5]`
e4x will shift everything following the deleted element to the left, though
and in e4x, each element is aware of its position in the parent node
which can be used via xmlNode.childIndex()
those child indexes all get updated after a delete (which is part of the reason e4x is slow with large documents)
if you're deleting in an indexed for loop, it's definitely better to start from the back and work forward
otherwise you need to decrement your index after you delete so that when it increments at the end of the loop it reads the same element (due to the left shift thing that happens)
in a normal javascript array it's better to just use a filter rather than delete in a for loop
I did make an xml filter function that could work here, too. I always try to avoid deletes.
[Connect Example - Filter XMLLists](https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Filter%20XMLLists)
If all of your OBX segments are contiguous, you can use this
`msg.OBX = xFilter(msg.OBX, obx => condition)`
it's one of the few functions I have in my global code template library

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

## Reattach a message when it's reprocessed

_Zivan_ 1 March 2023: I ran into a strange issue while trying to reprocess a message with an attachment using the Interoperability Connector.

_jonb_ [Doco](https://docs.nextgen.com/bundle/Connect_Interoperability_Connector_Suite_User_Guide/page/connect/connect/topics/c_handling_multipart_payloads_attachments_Interop.html)

_agermano_ and _narupley_ In the case of this connector, it's probably not reconstructing the original multipart message so that it can be torn apart again by the connector since the needed information isn't in the source raw data.
When reprocessing it should "reattach" any attachments
So the message goes into the channel as it was originally received
But that's only if those attachment tokens are in the message
This is an improvement that can/should be made
The internal controller should not only do that, but possibly also just send any lingering attachments as straight attachments along with the incoming RawMessage object
The core "issue" is really just a feature enhancement: There is not currently an option to also store original attachments along with a new message when you're reprocessing.
Reprocessing will "reattach" any attachment content into the raw input though, but only if you have those attachment tokens in the input, like `${ATTACH:4651f9e5-802b-40bf-9c93-b5b20aae975d}`
I suppose in this case, Jon is right that it's specific to the Interop connectors, because it's a case where the attachments are not extracted from the inbound message. Rather they come externally via the MTOM payload -- the SOAP part is used for the inbound message and then any other parts are stored separately as attachments
Technically you could do the same if you are manually routing messages via JavaScript, because you can include attachments in the RawMessage object
In most cases you have an inbound message, and your channel's attachment handler will extract whatever attachments it needs to, replacing them with those special `${ATTACH}` tokens. Then if you reprocess, it reconstructs the original inbound message first by replacing the `${ATTACH}` tokens with the actual content. Then it gets sent to the channel (and probably gets extracted again, as a new attachment for that new message).
In the case of the interop connectors there's no way to reconstruct the original MTOM payload though, nor would that even make sense, because when you reprocess a message in the UI, it's not flowing through the source connector's receiver endpoint, like you're not sending data through the listening HTTP or TCP port or whatever, you're just sending a message directly to the channel.
I suppose maybe what reprocess should do is detect which attachments were actually reattached into the inbound data, and any attachments that were not reattached should just be sent along with the RawMessage object as Attachments to store along with the new message.
If you consider the goal of reprocessing to "send the same message with the same original state/data, as much as possible", then it's currently not meeting that goal when it comes to Interop Connector messages that have MTOM attachments, so in that sense yeah maybe it's a defect
It would also be true for any attachment handlers that remove content from the message and don't replace that content with a token referencing the exact content that was removed.

_narupley_ continues
There's not really any good way to do it right now, only kind of hacky ways. But if you reprocess a message (actually reprocess, not double-click and send as a new message), the original ID is sent along with the message. So you can use that to get original attachments if you need them

````javascript
// Workaround until this is done better in Mirth Connect
function getOriginalAttachments(base64Decode) {
 if ($('reprocessed') == true) {
  var filter = com.mirth.connect.model.filters.MessageFilter();
  filter.setMinMessageId(connectorMessage.getMessageId());
  filter.setMaxMessageId(connectorMessage.getMessageId());
  var messages = com.mirth.connect.server.controllers.ControllerFactory.getFactory().createMessageController().getMessages(filter, channelId, false, 0, 1);
  if (messages.size() > 0) {
   var originalId = messages.get(0).getOriginalId();
   if (originalId) {
    return AttachmentUtil.getMessageAttachments(channelId, originalId, base64Decode || false);
   }
  }
 }

 // Empty list
 return Lists.list();
}
````

## Skip X rows in a transformer

_daniella_ 1 March 2023
Issue setting up the transformer steps when processing XML

_agermano_ You can run in batch mode as there is a "number of header records" property so that it doesn't create messages container the column names.
In this case I'd probably put a javascript step before your iterator with delete msg.row[0]. That should remove the first row from msg, and since you are dealing with xml, it will shift the remaining rows and reindex them. A regular javascript array doesn't do that.

## Embed Base64 image into PDF

Kicked off by _mkopinsky_ 16 Jan 2023

_agermano_ with all the important bits.

### Option 1

He recommends Document Writer as "the document writer actually gives you the option of writing to a mirth attachment, which makes it really easy to embed in a second destination".

### Option 2

"You can use the legacy Flying Saucer and iText libs which are [still included](https://github.com/nextgenhealthcare/connect/tree/4.2.0/server/lib/extensions/doc)". "Data urls work as long as you've registered a url protocol handler for 'data' types".

Echoing the [forum resolution](https://forums.mirthproject.io/forum/mirth-connect/support/16056-pdf-document-writer-and-base-64-encoded-images#post175260) below.

User can embed

````html
<img src="data:image/jpg;base64,YOURDATAHERE" style="height: 153px; width: 118px;"/>
````

Then set

````text
-Djava.protocol.handler.pkgs=org.xhtmlrenderer.protocols
-classpath/a extensions/doc/lib/flying-saucer-core-9.0.1.jar
````

_The first line adds the "data" protocol handler to the search path used by the URL class.
The second line appends the jar to the end of the classpath at startup. This is an option used by the install4j launcher and not directly passed to the jvm_

### Option 3

Use the newer libraries
"The main libraries used now are openhtmltopdf running on top of PDFBox 2.x" and the "new lib also supports svg graphics".

## Accessing HTTP Listener request headers and metadata, setting custom response codes

See [this response](https://forums.mirthproject.io/forum/mirth-connect/support/10305-access-request-headers-in-http-listener?p=69586#post69586).

## Hashing files (MD5 or other)

See [this response](https://forums.mirthproject.io/forum/mirth-connect/support/13366-md5-hashing?p=81191#post81191) on using Guava.

_agermano_: Be sure your RAW content is Base64 decoded before hashing - use either _msg_ or _connectorMessage.getRawData()_.

_NickT_'s working sample

````javascript
var decodedData = FileUtil.decode(msg);
var hasher = Hashing.md5().newHasher();
var hash = hasher.putBytes(decodedData).hash().toString();

logger.info(hash);
````

## Sample message transformations from HL7v2 to FHIR

13 Jan 2023
_jonb_ recommends [these](https://confluence.hl7.org/display/OO/v2+Sample+Messages).

## Have a HTTP Listener to respond with gzip data

It's [automatic now](https://forums.mirthproject.io/forum/mirth-connect/support/13156-web-service-and-compress#post80922()) when given the proper request headers.

## Option to check for duplicates in given time period

User wants to check for duplicate messages in a given 12 hour period. (11 Jan 2023)

See [_agermano_](<https://forums.mirthproject.io/forum/mirth-connect/support/19116-filter-smtp-destination-unique-only?p=174475#post174475>)'s code snippet using guava which is included with Mirth. Guava allows expiring entries in multiple ways.

## Can Mirth verify certificates of external parties?

(Feb 2023) Nothing directly in Mirth.

_chris_: It's very easy to pull a remote cert. Just connect to the service via HTTP and the server will provide it. Then you check it for upcoming expiration. Something like [certcheck](https://github.com/ChristopherSchultz/certcheck) or [check_ssl_cert](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_cert/details) or [check_ssl_certificate](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_certificate/details) or [check_http](https://nagios-plugins.org/doc/man/check_http.html).

## Using CryptoJS javascript library

See [here](https://forums.mirthproject.io/forum/mirth-connect/support/174848-use-require-from-node-js?p=174858#post174858).

## Using GPG with Mirth

12 Jan 2023

"Good Morning, are there any good sources for gpg encryption of a file within mirth? I see different posts that are from the old forums, but was looking for any examples of implementation."

For running GPG outside Mirth, use this [code template](https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Execute%20Runtime%20Command) to execute the GPG lib available on the system with the required parameters.

For running within Mirth, you need an additional GPG library, says [here](https://forums.mirthproject.io/forum/mirth-connect/support/13544-can-i-encrypt-a-file-in-gpg-using-mirth). This [wrapper](https://github.com/neuhalje/bouncy-gpg) may be useful, but no one vouched for it.

## Expand an attachmentId received from another channel's response transformer

_pacmano_'s question and solution 10 Jan 2023

"If I am adding an attachment in a response transformer, grabbing the attachment id and assigning to a JSON field, sending the JSON to another channel, how do I expand that attachment on the destination channel when finally ready to post/write it somewhere?"

````javascript
//It gets the attachment from the other channel by manually building the long attachment string.
//When sent to the destination channel and written to disk it, expands as expected.

// sample input:
//“base64image” : “${ATTACH:d0921ccb-4e9a-48fc-9a9c-a584c74bdd66:347:efc7ecc4-cf91-493b-8fe1-bbdac0e3a9b4}“,

var imageInfoArray = msg['document']['data']['base64image'].split(':');
var chanId = imageInfoArray[1];
var messageId = parseInt(imageInfoArray[2]);
var attachmentId = imageInfoArray[3].replace('}','');
var base64Decode = false;
var attachmentContent = getAttachment(chanId, messageId,attachmentId,base64Decode).getContentString();
````

## Mirth licensing

Q1. Is CURES available under existing licenses or separate from other plugins?
A1. _Travis West_: "It is separate and requires Gold or Platinum bundles." (Essentially an upcharge in addition to platinum.)

## Minimal example using JSch

5 Jan 2023 by _joshm_

Related [javadoc](https://javadoc.io/doc/com.jcraft/jsch/latest/index.html)

````javascript
importPackage(com.jcraft.jsch);
importPackage(java.io);
importPackage(java.lang);
importPackage(java.nio.charset);

const user = 'someUser';
const password = 'this1Su1t@S3<ur3';
const hostname = 'mysftp.hostname.com';
const port = '22';
const directory = '/In';


var jsch = new JSch();
jsch.setConfig('StrictHostKeyChecking','no');
var session = jsch.getSession(user, hostname, port);
session.setPassword(password);
session.setTimeout(2000);
session.connect();
var channel = session.openChannel('sftp');
var ioexception = new Packages.java.io.IOException;
channel.connect();
channel.cd(directory); //Folder on the SFTP server where file will be found


var msgBias = new Packages.java.io.ByteArrayInputStream(connectorMessage.getRawData().getBytes());
channel.put(msgBias, UUIDGenerator.getUUID() + '.hl7'); 
channel.exit();
````

## My integration of _lodash_ isn't functioning as expected

It matters which CDN you download its code from. [This one](https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js) was confirmed to work by _itsjohn_ on 10 Jan 2023.

## I encounter odd String and XML errors intermittently when sending between channels

Ensure you do not have a [xalan](https://mvnrepository.com/artifact/xalan/xalan) jar in your custom library. (_rogin_ to fill in what problems were presenting)

## Performance metrics in AWS

### AWS example

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

## Including sourceChannelId(s) when using router.routeMessage()

2 Jan 2023

Issue: user expressed using routeMessage() didn't send 'sourceChannelId(s)' and 'sourceMessageId(s)' like direct channel-to-channel does.

Solution #1: It's a [requested feature](https://github.com/nextgenhealthcare/connect/issues/5293)
Solution #2: create a new destination that filters on the existing logic you're using for routeMessage()
Solution #3: Link in Solution #1 also has a code solution, but it's a manual addition.
Solution #4: another manual addition

````javascript
var attributes = new Packages.java.util.HashMap();
var newSourceMap = connectorMap.entrySet().iterator();

logger.info(newSourceMap + " :: has items :: " + newSourceMap.hasNext());
        // Start the iteration and copy the Key and Value
        // for each Map to the other Map.
        while (newSourceMap.hasNext())
        {
     var mapItem = newSourceMap.next();
            // using put method to copy one Map to Other
            attributes.put(mapItem.getKey(),
                           mapItem.getValue());
        }

attributes.put("channelId", channelId);
attributes.put("messageId", connectorMessage.getMessageId()); //TODO pass as Java Long to avoid floating point conversion
var message = new RawMessage(msg); //removed Packages.com.mirth.connect.server.userutil.
message.setSourceMap(attributes);
router.routeMessage('Test1', message);
````

## Enable JS map lookups but hide the mapped values from the dashboard view

An interesting discussion 19 Dec 2022 to generate lookups but omit its confidential values from dashboard view.

_agermano_:

````javascript
var definitions = {a: 1, b: 2, c: 3, d: 1}
var hm = new java.util.HashMap(definitions)
var wrapper = Object.create(hm)
wrapper.toJSON = () => "No peeking!"
````

## Understand XML's name() vs localName()

20 Dec 2022 by _agermano_

````javascript
js> msg = <xml><a/></xml>
<xml>
  <a/>
</xml>
js> msg.name() instanceof QName
true
js> JSON.stringify(msg.name())
{"uri":"","localName":"xml"}
js> msg.name().toString()
xml
js> typeof msg.localName()
string
js> msg.localName()
xml
````

````javascript
js> default xml namespace = "uri:test"
js> msg = <xml><a/></xml>
<xml xmlns="uri:test">
  <a/>
</xml>
js> JSON.stringify(msg.name())
{"uri":"uri:test","localName":"xml"}
js> msg.name().toString()
uri:test::xml
js> msg.localName()
xml
````

## Return multiple objects from a JS reader

_agermano_ 14 Dec 2022

stringify each object, then pass the returned array to the ArrayList constructor

````javascript
var json = '[{"id":1},{"id":2}]'
var arrayOfObjects = JSON.parse(json)
return new java.util.ArrayList(arrayOfObjects.map(o => JSON.stringify(o)))
````

_jonb_'s input needing the above inclusion

````javascript
try{
    dbConn = commonDBconnection();
    //the XML trick lets us read queries in MC
    //the array to json stuff returns a JSON array we can just parse in MC as a single row
    //the pendcount returns no rows if we dont have capacity
    //the limit handles our batch size
    var sqlText = <SQLText>
        array_to_json(array_agg(row_to_json(faxage_status))) FROM reports.faxage_status
        WHERE
        {pendcount} = 0
        AND shortstatus = 'failure'
        AND longstatus IN ('Job aborted by request', 'Job cannot be stopped - unknown error' )
        LIMIT {$('faxage_reprocess_batch_size')}
    </SQLText>;
    var result = dbConn.executeCachedQuery(sqlText.toString());
    if(result.next()){
        resultArray = JSON.parse(result.getString(1));
    }
    if(result.next()){
        throw "Expected only one result row, got more than one";
    }
} finally {
    if(dbConn) {dbConn.close()};
}
return resultArray;
````

## Convert Timestamp EST to PST with format YYYYMMDDhhmmss

Conversation on 5 Dec 2022 by _Anibal Jodorcovsky_

_joshm_ solution:

````javascript
function addHL7Timezone(hl7DateStr) {
  var formatter_hl7 = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
  formatter_hl7.setTimeZone(java.util.TimeZone.getTimeZone("US/Mountain"));
  var formatter_tz = new java.text.SimpleDateFormat("yyyyMMddHHmmssZ");
  formatter_tz.setTimeZone(java.util.TimeZone.getTimeZone("US/Mountain"));
  var newDate = formatter_tz.format(formatter_hl7.parse(hl7DateStr));
  
  return newDate
}
````

_Michael Hobbs_ solution:

````javascript
const {LocalDateTime, ZoneId, ZoneOffset, format: {DateTimeFormatter}, ZonedDateTime} = java.time
const parseFmt = DateTimeFormatter.ofPattern('yyyyMMddHHmmssZ')
const writeFmt = DateTimeFormatter.ofPattern('MM/dd/yyyy HH:mm:ss z')
const zonedDateTime = ZonedDateTime.parse(msg.approvedDT, parseFmt).withZoneSameInstant(ZoneId.of('America/New_York'))
const appDtStr = String(zonedDateTime.format(writeFmt))
````

## Auto-generate value for MSH.10

Initiator: Nathan Corron
anyone know if there is a function in mirth to get an incrementing unique number that could be used for say MSH-10?  Needs to be numeric

````javascript
Date.now()
````

See [JS example](https://jsfiddle.net/pvj79z8s/) and [docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)

## Limit number of messages processed

User's client wants to run the first X (of Y total) messages in a file during functional testing.

_jonb_ and _pacmano_: process as batch. check if var 'batchSequenceId' >= X, then do destinationSet.removeAll().

_Jarrod_: you can also manually split in a pre-processor for X loops, forward to a processing channel and then ditch the rest

_jonb_'s other ideas

* Use the shell exec code template and ahh something something sed awk something the first 15 lines and dump those to a batch splitter
* I don’t think there is any way for the preprocessor to handle the CSV batch
* Use a RAW datatype instead of delimited first, grab the raw as an attachment. Don’t parse it as delimited until AFTER cutting the size down to 15 lines

## Info on new functionality in Rhino v1.7.13

(Rhino 1.7.12 is in Mirth 3.12.0, and Rhino 1.7.13 in Mirth 4.2, so it may have been included in the initial Mirth 4.x line)

_agermano_: like I said, the map[foo] should work in your current mirth version (I've tested it with rhino 1.7.13, but not actually in mirth)
when map is a java.util.Map
in prior rhino versions a js object is implemented with NativeObject and a java Map would have been represented by NativeJavaObject (basically a wrapper class.) rhino 1.7.13 introduced NativeJavaMap as a subclass of NativeJavaObject that adds this behavior.
Also NativeJavaList, which allows you to access a java.util.List by index like a js array instead of using the get method.

## Thread-safety of global map

_chris_ was accessing the global map from channel deployments after noticing values not being in there when they should have been.

Ultimately JS should NOT be considered thread-safe.

Options listed were replacing the JS map with java.util.ConcurrentHashMap and ...
"When I create the map initially, I can attach a get method to it which just turns-around and fetches the thing via property-access.
That will allow me to go and hunt-down all the references in my js code and replace map[foo] with map.get(foo).
Then I can swap-out the object for the type I really want. In the meantime I still have all kinds of concurrency issues, but I don't have to stop-the-world to re-write all that code.
Yep, looks like object.get doesn't exist and defining it works as expected."

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

## Create index on metadata column(s)

By default, indices are not created for metadata columns.

### Option #1

_jonb_'s [gist](https://gist.github.com/jonbartels/38ffbb101ea32f981cc9950a21ec6809)

### Option #2

_Michael Hobbs_' solution
[DBConnection.js](DBConnection.js) needed for ChannelUtils
With [ChannelUtils.js](ChannelUtils.js) you can set metadata index and then get the message by metadata index in another channel

Example to set the index

````javascript
ChannelUtils.setMessageIndex('ACCESSION', accession, siteName, 'mirthdbV3')
````

Example to get an index

````javascript
const messages = ChannelUtils.getMessageByIndexV2({
      key: 'ACCESSION', value: accession,
      channelID: channelID, dbConfig: this._dbConfig,
      parseXml: true, sort: true, filter: ['XO', 'NW', 'SC'],
      debug: false
    })
````

## What does Mirth encrypt?

Jan 2023 timeframe

_chris_: Does anyone know exactly what Mirth encrypts when you enable "Encryption" for a channel?

(nothing back yet that he wanted to preserve here)

## Why do I see 'dxx' set in responseMap within the Source mappings?

Either a bug in the Mirth queries for map data, or perhaps it's the order of operations:

1. Message comes in
1. Source transformer runs
1. Source calls Destination Chain; Source waits till chain is done because no-queueing
1. Destination Chain executes Transformer for D20
1. D20 sends message
1. D20 response transformer runs <- responseMap is populated here
1. Destination Chain completes
1. Source looks at response map and sends responseMsg as a reply

## Access Rhino shell used by Mirth Connect

Outlined by [_jonb_](https://gist.github.com/jonbartels/d8a1b789dd251e30c4a74baac3a3957a).

## Can Mirth provide a daily volume report?

See _jonb_'s [SQL](https://gist.github.com/jonbartels/b961574b2043b628f1b0fd96f440179b).

## Common Mirth needs

### Extracting a zip fle

See [forum](https://forums.mirthproject.io/forum/mirth-connect/support/15433-unzipping-files-in-mirth)

## Simplified Javascript

### Format String that may contain a decimal

_joshm_: take a string representation of a number that may or may not have decimals already and force it to be 2 decimal places (i.e 35 or 35.00 should both end up as 35.00)

Both _agermano_ and _Andy Murray_

````javascript
parseFloat(str).toFixed(2)
````

_joshm_ fiddled a Java alternative

````javascript
var df = new java.text.DecimalFormat("0.00##");
return df.format(sumOfCharges);
````

## Channel stats missing after DB migration

Initiator: _Bhushan U_ on 14 Nov 2022
Solution provider: _agermano_

Hello Team, I need some advice on migrating mirthconnect application with local postgresql database server from windows 2008 to windows 2012 server.
So far I did postgres database backup and restore plus mirthconnect configuration files backup and restore. But there is still some discrepancy between new server and old server.

Issue: channels stats not showing up after postgres database backup and restore then configuration files backup and restore
Reason: channels statistics are saved per server ID
Solution: Update the current server\'s ID to that of the original server. See [user guide](https://docs.nextgen.com/bundle/Mirth_User_Guide_41/page/connect/connect/topics/c_Application_Data_Directory_connect_ug.html) for details.

## Case-insensitive JSON fields

Initiator:
_itsjohn_: Hi All, Is there. a way to make JSON payload fields case insensitive when mapping in Mirth so I can write msg['foo'] and Mirth accepts {"foo":""}, {"FOO":""} and {"Foo":""}

Solution by: _agermano_
Solution date: 22 Nov 2022
Solution:

```javascript
function reviver(k,v) {
  var lower = k.toLowerCase();
  if (k === "" || k === lower) {
    return v;
  }
  this[lower] = v;
}
var raw = JSON.stringify({FOO: 1, bar: 2, BaZ: {sAnDwIcH: 3}});
msg = JSON.parse(raw, reviver);
msg.baz.sandwich = 4;
JSON.stringify(msg);
```

## Migrate file-backed config map into Mirth DB

See [_jonb_'s gist](<https://gist.github.com/jonbartels/4c4e0320f5596645b32bb1c38ac2d9c3>).

## Compare running channels against a master list

This produces a list of key, pairs for channels and state. Run it on a polling channel to see what's running and compare it to a master list of what should be running. If the lists don't match, fire an alert of your choosing.

````javascript
var channelStatus = {};
var it = ChannelUtil.getChannelIds().toArray();
var chanListLength = it.length;
$c("chanListLength",chanListLength);
for (var i = 0; i < chanListLength; i++) {
    var thisChanId = it[i];
    var chName = ChannelUtil.getChannelName(thisChanId);
    var chState = ChannelUtil.getConnectorState(chName,0);
    if (chState != null) {
      chState = chState.toString();
    }
    channelStatus[chName] = chState;
    $c(chName,chState);
 }

var sourceTry = JSON.stringify(channelStatus);
$c("SourceTry",sourceTry);
````

## Group and Sum using JS

_nafwa03_ on 17 Nov 2022

_nafwa03_'s commentary:
It's a super super useful code snippet. If you have to group and sum some json, you just use it like

````javascript
var group = groupAndSum(formattedJSON, ['Office', 'Practitioner', 'PreviousBalance', 'PaymentsThisPeriod'],['Charges']);
````

I recently had some json to aggregate and by passing in the keys this handles it really well

````javascript
//snippet made with the help of https://stackoverflow.com/a/66782165
function groupAndSum(arr, groupKeys, sumKeys) {
  var hash = Object.create(null),
      grouped = [];
  arr.forEach(function (o) {
    var key = groupKeys.map(function (k) {
      return o[k];
    }).join('|');
    if (!hash[key]) {
      hash[key] = Object.keys(o).reduce(function (result, key) {
        result[key] = o[key];
        if (sumKeys.includes(key)) result[key] = 0;
        return result;
      }, {}); //map_(o) //{ shape: o.shape, color: o.color, used: 0, instances: 0 };
      grouped.push(hash[key]);
    }
    sumKeys.forEach(function (k) {
      hash[key][k] += o[k];
    });
  });
  return grouped;
}
````

_agermano_'s refactor 17 Nov 2022

````javascript
function groupAndSum(arr, groupByKeys, sumKeys) {
    var hash = Object.create(null),
        grouped = [];
    arr.forEach(function (o) {
        var hashKey = groupByKeys.map(function (k) {
            return o[k];
        }).join('|');
        if (!hash[hashKey]) {
            hash[hashKey] = Object.keys(o).reduce(function (result, objectKey) {
                result[objectKey] = o[objectKey];
                if (sumKeys.includes(objectKey)) result[objectKey] = 0;
                return result;
            }, {}); //map_(o) //{ shape: o.shape, color: o.color, used: 0, instances: 0 };
            grouped.push(hash[hashKey]);
        }
        sumKeys.forEach(function (k) {
            hash[hashKey][k] += o[k];
        });
    });
    return grouped;
}
````

## Improved channel cloning

It's a repeatedly [requested feature](https://github.com/nextgenhealthcare/connect/issues/4206).

[Archived link](https://mirthconnect.slack.com/archives/C02SW0K4D/p1668089121891089)
_Chris_: Before my upgrade from 3.8.0 -> 4.1.1, I had a channel which I used to create other channels from templates. It clones the channel and then makes sure that various Code Template Libraries are copied along with them, and tags, too, since "channel clone" is IMO incomplete because it skips those things.

See [ImprovedChannelCloning.js](ImprovedChannelCloning.js)

Usage example

````javascript
var createdChannels = [];
var createdChannelIds = [];
var serverEventContext = com.mirth.connect.model.ServerEventContext.SYSTEM_USER_EVENT_CONTEXT;
var result = cloneSingleChannel('My Outbound Channel Template', shortenedSystemId, ['Testing'], serverEventContext);

createdChannelIds.push(result.getId());
createdChannels.push(result.getName());

setChannelLibrariesByName(createdChannelIds, ['Shared Integration', 'EHR Stuff'], serverEventContext);
setChannelGroupByName(createdChannelIds, 'PCC Practices', serverEventContext);
````

## What is the layout of a Mirth database?

See [this ER diagram](https://github.com/kayyagari/connect/blob/je/mc-integ-tests/mc-db-tables.png).

## Calculate average response time for a given channel's messages

````sql
with started as (select message_id, received_date from d_mm388 where connector_name = 'Source'),
     max_send_date as (select message_id, max(send_date) as final_send_date from d_mm388 group by message_id),
     per_message_start_end as (select s.message_id,
                                      s.received_date,
                                      msd.final_send_date,
                                      date_part('milliseconds', msd.final_send_date - s.received_date) as ms
                               from started s
                                        join max_send_date msd on msd.message_id = s.message_id)
select avg(ms)
from per_message_start_end as average_ms
````

## Return aggregate results from a JS reader

Given a JS reader, I want to return one message for many rows using a JS DB query.

_narupley_: The Database Reader will do that automatically for you if you have the Aggregate Results option enabled. If you're in JavaScript mode, then you can return either a ResultSet or a List of Maps.

## Report on SSL certificate usage

_jonb_ rediscovering his own gist - "Is there a report for the NG SSL Manager that shows what channels are using a particular certificate?"

See [_jonb_'s gist](https://gist.github.com/jonbartels/f99d08208a0e880e2cee160262dda4c8).

## Read and map Mirth licensing data

_jonb_ on 6 Oct 2022, seems to be a repost of an archived message.

NextGen has been good about sending licensing data to me.
Heres a really crude query that reads that data and maps it into postgres. From there it becomes reportable by date, hostname etc.

````sql
with license_data as (
  SELECT pg_read_file('/Users/jonathan.bartels/Downloads/teladoc_2022-10-06.json')::JSONB -> 'data' as licenses
),
attribute_data as (
  select *
  from license_data
  join jsonb_path_query(licenses, '$.attributes') on true
)
select jsonb_path_query 
into license_attributes
from attribute_data;
````

a bit improved:

````sql
with almost_there as (
select details.*    
from license_attributes   
join jsonb_to_record (jsonb_path_query) as details(fingerprint text, ip text, hostname text, created timestamp, updated timestamp, metadata jsonb) on true
)
select *, metadata -> 'serverId' as serverId, to_timestamp((metadata -> 'lastValidation')::BIGINT / 1000) as lastValidation
from almost_there
order by lastValidation ASC;
````

## Prune messages while avoiding errored messages

2 Sept 2022
Commenter:
This is close but its still deleting too much content.
The goal is

* "do not delete anything for any connector on an errored message"
* "for any not errored message, delete everything except the raw source message and source map"

````sql
WITH 
--this is a potentially infinite dataset, errors are rarely reprocessed and rarely pruned
--we have to date constrain it
--sniff check the EXPLAIN plan in PROD
--status is indexed with message_id this should be fast
errors as (
  select distinct message_id from d_mm11 mm
  where mm.status = 'E'
  AND mm.received_date <= now() - INTERVAL '1 minutes'
  AND mm.received_date >= now() - INTERVAL '365 Days'
  order by message_id DESC
)
,candidates AS (
  SELECT metadata_id, mc.message_id, content_type, errors.message_id as err_msg_id
  --, data_type, status, error_code
  FROM d_mc11 mc
  INNER JOIN d_mm11 mm ON mm.id = mc.metadata_id AND mm.message_id = mc.message_id
  left outer join errors on errors.message_id = mc.message_id 
  WHERE 
    (
      (metadata_id = 0 AND content_type NOT IN (1,15))
      OR (metadata_id <> 0)
    )
    AND errors.message_id is null
    AND mm.received_date <= now() - INTERVAL '1 minutes'
    -- dont need a floor date since the raw pruner will run and take care of those
)
--select target.* FROM d_mc11 mc, candidates target
DELETE FROM d_mc11 mc USING candidates target
WHERE
mc.message_id = target.message_id and mc.metadata_id=target.metadata_id and mc.content_type = target.content_type
````
