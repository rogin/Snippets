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

There's also an ['awesome' list](https://github.com/mga-mirth/awesome-mirth) for Mirth linking to various prior projects.

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
* _pacmano_ mentioned [Shasta Networks](https://shastanetworks.com/ascent-platform/base-camp/) having a cool documentation tool
* _Kaur Palang_'s [Git Integration plugin](https://brightcodecompany.com/gitintegration)

## MC plugin ideas

See [here](PluginIdeas.md).

## Service ideas

[Various ideas](ServiceIdeas.md) as folks integrate using MC.

## FHIR info and certification

TODO: clean this up - Richard went looking for FHIR certification

<https://www.hl7.org/fhir/overview.html>
<https://en.wikipedia.org/wiki/Fast_Healthcare_Interoperability_Resources>
<https://duckduckgo.com/?q=fhir+training&ia=web>
<https://www.hl7.org/certification/fhir.cfm?ref=nav>
<https://www.hl7.org/implement/courseList.cfm?ref=nav>

## Rename a JSON field

_Ryan Howk_
Does anyone know a straightforward way to rename a JSON field with javascript going from msg to tmp, or similar?

_jonb_:
Test it. I’m 57.6% sure thats right

````javascript
msg['newfield'] = msg['oldfield'].copy()
delete msg['newfield']
````

TODO: get the rest of _pacmano_'s code when the slack '90+ days' event occurs.

_pacmano_
chatGPT say:

````javascript
function renameKey(obj, oldKey, newKey) {
    if (obj[oldKey] !== undefined) {
        obj[newKey] = obj[oldKey];
        delete obj[oldKey];
    }
Click to expand inline (13 lines)
````

copy() is an e4x thing that doesn't work on javascript objects
plus assignment of one e4x object as a child to another e4x object does a deep copy anyway, so it's rarely necessary to call copy()
AND... e4x allows you to rename elements using setName()
which has the additional benefit of keeping the element in the same place in the child list. If you created a new xml element and deleted the old one it would get moved to the end.

## Mirth paid plugin creating synthetic data

_Richard_
I remember folks complaining about the state of synthetic patient data for testing. I'm in the same boat for two of the contracts I've been on. Any of you here have a wishlist for it? File type selection (HL7, FHIR, etc.), patient count, others...

_agermano_
I think one of the nextgen paid plugins can do some of that

## Getting file extension

_Qwelm_
I learned a handy trick for getting that extension when working on something else last week.
`filename.split('.').pop()`
That's proven much easier for me to read than doing a bunch of `filename.substring(0,filename.length - filename.lastIndexOf('.'))` type stuff. I like it because then I can handle extensions with lengths other than 3.

_agermano_
I almost always use `slice` instead of `substring`, but `split+pop` is a nice way to get the last item for a short string. No matter which method you use, you'll need special handling if there is the possibility of encountering files without an extension.

## Searching for help

_agermano_
FYI, I've found that adding `site:forums.mirthproject.io` to my Google search gives better results than searching on the forums themselves.

## Upgrading Mirth from 3.10 to 4.4

_RunnenLate_: If I'm upgrading from 3.10 to 4.4 do i need to install all version between them to ensure the database is fine or can i just make the jump? I'm also going from Java 8 to OpenJDK 17.

_Michael Hobbs_:
_I'm cloning the database and and going to attempt the upgrade from 3.10 to 4.4 on new servers there. I'll try it next week_
This is what I have done before. If it works which it always has for me. then make a backup of prod and do the upgrade. As we are container based it's just a matter of updating your compose file or what ever you use to deploy it and the run what ever the update command is for your container system. BTW, any channel you don't need the messages in do a remove all and give the db an hour or so to handle log transactions. This will save tons of time on db backups.

## foo

_Jack w/ Healthcare Integrations, LLC_
has anyone here run into a situation, with default HL7 MLLP channels where 2 diff Mirth servers... one channel doesn't get a response from the channel??
I see the connection established as it should be, but Mirth can't seem to send data over it... To make it MORE weird... when I do the same setup, but with HTTP Receiver/HTTP Sender, it works...

_A_
To me, it sounds like there's a network device like an IPS somewhere between the two doing "stuff". However, I have never known an IPS to allow a connection to complete TCP handshake and then just stall out the responses to the originator because something triggered a rule. If anything I figure an IPS would reset the connection which should be a different error.

_Michael Hobbs_
I'm with @A on this one. FW/IPS/IDS or some sort of proxy. HTTP/S works, Small HL7 message works. Larger HL7 message fails. I bet the larger message is bigger than a single packet can hold. I've seen IPS that will nearly always let the first packet through but based on that first packet, it kills the connection. However, since you are getting a timeout assuming that Mirth is giving you the correct error message then I'd be less liking to suspect an IPS as they generally send an RST but they could just drop the connection.

I know ps360 has this weird issue where a listener has multiple connections that stay connected

1. A connects it can send and receive messages
1. When B connects it can send and receive messages but now if A sends then B will receive the reply

I've never heard of this issue outside of ps360 though

_Jack w/ Healthcare Integrations, LLC_
So... small update here.  Definitely found the issue... Some type of MTU/MSS IPSEC compatibility issue between AWS PfSense and Cisco Firepower.  Any message less than 1339 bytes works... anything over, no response (fragmentation?)

_Michael Hobbs_:

* use ping to test, set the packet size
* run ping test with packet size of 1400
* run ping test with packet size of 1400 and the DF flag

if test one passed and test two fails that would be the expected result.
if test one fails then somewhere the DF flag is getting set or something is wacked with the device handling the vpn connection.
if you have the expected results ie one pass two fails then that would suggest the DF flag is somehow being added to the mirth traffic packets.

## Azure DB driver

_stewart anderson_
It seems Azure doesn't like the jtds driver, so you have to put in the microsoft sql driver as the database driver.

## foo

_Mitch Trachtenberg_

````shell
js> x.containsValue("2")
true
js> x.values()
[2, b]
js> x.keySet()
[1, a]
js> x.keySet().contains("1")
false
js> x.keySet().contains(1)
false
js>

js> var x = new java.util.HashMap({"1":"2"})
js> x
{1=2}
js> x.get("1")
null
js> x["1"]
2
js> x.put("a","b")
null
js> x
{1=2, a=b}
js> x.get("a")

js> x.putIfAbsent("3","2");
null
js> x
{1=2, a=b, 3=2}
js> x["3"]
js: Java class "java.util.HashMap" has no public instance field or method named "3".
js> x.get("3")
2
js> x.get("1")
null
js>
````

_agermano_
so, `{"1":"2"}` Rhino is converting that to an instance of `org.mozilla.javascript.NativeObject`. Mirth sees it as a regular javascript object, but that's what it really is once it's passed to Java. By specification, all javascript object properties must be a string or Symbol, but there are a lot of optimizations going on, and there is special handling for integer properties (sometimes). internally, rhino is storing that property name as a `java.lang.Integer` instead of a `java.lang.String`. when the `org.mozilla.javascript.NativeObject` is accessed by java through the `java.util.Map` interface, it must just be passing the key however it is stored internally. `x.get(new java.lang.Integer(1)` works.

_Mitch Trachtenberg_
Thank you!  Wow:

````shell
js> var y = java.util.HashMap({"1":"2"});
js> y.put("1","3")
null
js> y
{1=2, 1=3}
js> y.get("1")
3
js> y.get(new java.lang.Integer(1));
2
(adding for future reference)
js> y.get(1)
null
js> typeof 1
number
````

_agermano_
when you call `x[1]` it's actually using an experimental feature that is only on by default in rhino 1.7.13. It didn't exist prior to that, and it's off by default in later versions. After the HashMap has been created, in older rhino versions, it would have been wrapped in an `org.mozilla.javascript.NativeJavaObject` before passing it to the Rhino javascript context (this is what makes java objects behave like javascript objects in rhino.) In rhino 1.7.13, it's instead wrapped with an `org.mozilla.javascript.NativeJavaMap`, which allows property-like access to java Maps in a javascript style without needing to call the get method (and apparently does some type conversions in the process.) `x[1]` only works in a few of the most recent mirth versions, and it's kind of flaky, which is why it was turned back off in 1.7.14. Someone was trying to replicate Nashorn behavior but it was kind of flaky, too. It would actually be better nowadays to make a java Map emulate a javascript Map instead of a javascript object, then there's no restrictions on the key types or the risk of key/method name collisions. The same thing was added for java Lists. You can access them by index like a javascript array instead of needing to call `.get()`. That works better than the Maps, and I think that was left enabled by default. only in mirth 4.0+, that's when they started using rhino 1.7.13.

## Create documentation from Mirth channels

_Marco Papini_ (and others prior) asked: I was looking for a third party channel/snipets/library/software, that analyzes a mirth channel and creates a HTML documentation, with all the information.
Do you know if such a solution exists?

_pacmano_
If you license Mirth, this is available on the support portal.   Also Shasta Networks has a cool tool.

_Richard_: From the [main page](https://www.community.nextgen.com/), on the left is a _LINKS_ section. Selecting the _Channel Report Tool_ lands you [here](https://channelreport.nextgen.com/).

## What does it look like when a channel table becomes too big

See [sample 1](too-big-sample-1.txt), [sample 2](too-big-sample-2.txt), and [sample 3](too-big-sample-3.txt). Messages stop processing, with the latest destination being set to RECEIVED. Does not change, even when no other messages in queue.

## Advanced Clustering issues

### Sept 2023

_RunnenLate_:

````text
com.mirth.connect.donkey.server.StartException: Failed to start channel  (c6265282-bdc1-4534-aaa9-c91ceabd3547).
Caused by: com.mirth.connect.donkey.server.ConnectorTaskException: org.quartz.ObjectAlreadyExistsException: Unable to store Job : 'c6265282-bdc1-4534-aaa9-c91ceabd3547.PollConnectorc6265282-bdc1-4534-aaa9-c91ceabd3547', because one already exists with this identification.
 at com.mirth.connect.donkey.server.channel.PollConnector.start(PollConnector.java:45)
 at com.mirth.connect.donkey.server.channel.Channel.start(Channel.java:754)
 ````

_jonb_
That means that you have a poller channel that is either in a stuck state or you have the channel starting while you’re trying to deploy it again
Options:

1. Make sure the channel is halted and undeployed
1. Run [this](https://gist.github.com/jonbartels/27b09865b2b48051920564af83fca09e) in a channel - it’ll dump your quartz jobs and help determine if you have a stuck job
1. Restart MC

### Aug 2023

_RunnenLate_
So i got a big problem and mirth is dying on me. Anyone know what i can do regarding this

````text
[2023-08-10 02:38:45,687]  ERROR  (com.mirth.connect.plugins.clusteringadvanced.server.AdvancedClusterEngineController:298): Failed to retrieve channel statuses.
java.lang.NullPointerException
````

* I can't get any channel to load
* two servers in the cluster
* if i drop one out to reboot the server it starts on the other
* running v3.10.1
* the dashboard won't load
* channels aren't deploying

His solution:
so i guess we were forced to just power them both off and back on. and the channels came back. some of the setting aren't working but i just don't care right now

Interesting comment by _Roger Schaefer_:
One thing you might check is confirming `/opt/mirth-connect/appdata/server.id` is different between the nodes. If you try to start 2 instances with the same `server.id`, it will cause "unexpected behavior". We experienced this issue when restoring a copy of the first node to the second node for example. As I understand it, mirth creates that file and gens and ID on first load, but if it is already there, it does not update with a unique one, so if you clone or use an AMI backup or whatever it will confict.

## foo

agermano
the readme for the docker image [recommends](https://hub.docker.com/r/nextgenhealthcare/connect#the-appdata-folder) putting the appdata directory in a persistent volume. The dashboard statistics are kept per server id, and if you did not give the new server the same id as the old one, then it will look like all of your statistics disappeared. the `server.id` file is also located in the `appdata` folder. `keystore.jks` is another file in `appdata` that you probably want to retain during an upgrade

pacmano
  11 hours ago
<https://hub.docker.com/r/nextgenhealthcare/connect#using-volumes> In the OPs defense, that language should be stronger.

agermano
There should probably be a wiki page or something spelling out all of these things that you need to consider when upgrading to a new server and why each piece is necessary. with special consideration for container-based installs. like recommended mirth.properties settings, and things

## foo

tarmor
  3 hours ago
Half a day banging my head to desk, wall, keyboard and google, to finally figure out, that for some reason I need to add the [0]  to make this work  delete nextSegment[0];  where nextSegment was previously acquired like this msg.child(index); . It just doesn't make sense to me.
1 reply

agermano
  3 hours ago
delete nextSegment deletes the variable to which the segment (actually an XMLList containing the segment) is assigned. delete nextSegment[0] tells the object assigned to nextSegment (an XMLList in this case) to delete the item associated with index 0, and e4x does some magic when it deletes the xml element from the list that also removes the element from its parent document.

## foo

Richard
  1 hour ago
Which third party vendors can give me insight into my slow channel processing, as well as options to resolve? my employer is looking for products and/or consultants.

2 replies

pacmano
  1 hour ago
My company (<https://diridium.com/>),
@joshm’s (<https://www.innovarhealthcare.com/>),  
@Jack w/ [Healthcare Integrations, LLC](https://www.healthcareintegrations.com) even if he can’t sort out IPSec :stuck_out_tongue_winking_eye:),
@the_Ron’s (<https://consultzen.com/>, but not sure they do troubleshooting engagement anymore, maybe DM @briank). But I might share your platform details to narrow that down.

## foo

_Zubcy_
Hi Team, any thoughts on how to reprocess messages but just the last one for each account?
Suppose, there are 10 events (ADT-A04, ADT-A06, ADT-A08....) of an account number and ADT-A03 is the latest message received...
So, how can we reprocess the latest msg (ADT-A03) of that account? and also how can we do this for all accounts processed till now? Can we do this through Mirth database?

_joshm_ with the [gist solution](https://github.com/tiskinty/Mirth-Connect-Resources/blob/9793c7371d36db7a644ed2eff477ade0c461822e/ReprocessMessages.js)

## Clean way to reject messages based on the HTTP event type/verb

_joshm_
I’m looking for a clean way to reject messages based on the HTTP event type/verb. I only want to accept POST transactions on my channel and I don’t have control over the infrastructure of this specific engine. Which step would something like that live in? Seems like we tried a filter, but that didn’t work because we had a source transformer script already. I made it work in my auth script and just returned auth fail but was thinking there may be a better way. I’ll test with modifying the existing source transformer to only execute for a POST. The GET traffic I’m getting is of unknown origin, so IDGAF what the response to that system is.

I really want $(vendor) to allow me to use mutual TLS on that endpoint and that would fix itself.

so the filter is not working because I’m getting an error for “Empty JSON String”. It appears to throw an error before my filter script ever runs. No pre-processor script here.

so I figured it out. I have to set my input data type to RAW. If it’s set to JSON, it will blow up no matter what. that’s stupid and I’ll have to re-write a lot of channels I inherited.

_pacmano_
I think that was mentioned some time ago related to other questions and sending meaningful error responses back to the caller. e.g. always accept RAW and try catch parse it and reply with a friendly error message if not expected format. really goes for everything, context path, params, headers, methods, IMHO

_joshm_
Figured out a workaround without having to change the whole channel code. I just added a preprocessor script to return "{}" when message is null/empty. is it the best way, no - probably not. does it work as a temporary solution to stop the errors until we can re-write the source transformer, yes. oddly, this channel doesn’t even return a response payload, just auto-responds before processing.

_chris_
If you have respond-before-processing, then your fileter will do nothing. You need to "respond after source filter/transformer" and I think you will have to do less work. You should not have to set type=RAW.

_pacmano_
if you want friendly error messages you need to do RAW. i.e. return a JSON response with what is actually wrong.

_joshm_
if I don’t fix it in pre-processing, then I have to set it to RAW or I get channel errors for blank JSON string.

## foo

_Sean Phelan_
Anyone know if you can get the current contents of a channel's `globalChannelMap` via the API? We store configuration that only gets loaded on deployment.

_jonb_
`/extensions/globalmapviewer/maps/{channelId}` is the API path
`/extensions/globalmapviewer/maps/all`

Quoting _agermano_'s [link](https://forums.mirthproject.io/forum/mirth-connect/support/7041-mirth-tools-user-defined-functions?p=95534#post95534):

Access `globalChannelMap` of any channel

Sometimes you need to alter the `globalChannelMap` of a running channel but do not want to stop it.

````javascript
function $gcById(id, key, value) {
 var maps = com.mirth.connect.server.util.GlobalChannelVariableStoreFactory.getInstance();
 var map;
 if (maps.globalChannelVariableMap.containsKey(id)) {
  map = maps.get(id);
 }
 else {
  throw "globalChannelMap not found for channel: " + id;
 }

 if (arguments.length == 2) {
  return map.get(key);
 }
 else {
  return map.put(key, value);
 }
}
````

Usage is similar to `$gc`, except also pass the `channelId` of the channel for which you want to access or update the `globalChannelMap`.

````javascript
$gcById('388f7dfc-4a1a-45a6-b89b-91faacd67044', 'test', 'added from another channel');
logger.info($gcById('febe3d1e-97d6-47eb-bfe0-ca6bf895c967', 'importantMap').toString());
````

## CDATA tags for SQL queries

_Kirby Knight_
Anyone using CDATA tags for querying SQL from Mirth Connect?  What's the advantages/disadvnatages of doing it this way? Example:

````javascript
//encounters
 var encountersQuery = (<r><![CDATA[
  
  SELECT v.PatientDurableKey AS patientDurableKey, ddStartDate.dateValue AS startDate, v.visitKey,v.appointmentStatus, v.visitType, v.portalReasonForVisit, pd.NPI, pd.durableKey AS providerDurableKey, pd.name AS encounterProviderName, pd.type AS physicianType, pd.primaryDepartmentEpicId, pd.primaryDepartment
  FROM VisitFact v
    JOIN DateDim ddStartDate ON v.EncounterDateKey=ddStartDate.DateKey AND ddStartDate.dateValue IS NOT NULL
    JOIN ProviderDim pd ON v.PrimaryVisitProviderDurableKey = pd.DurableKey AND pd.isCurrent=1
    JOIN #patientScope ps ON v.patientDurableKey = ps.patientDurableKey
  WHERE 1 = 1
  AND v.AppointmentStatus NOT IN ('Canceled','Left without seen','No Show')
  AND v.Status_LastUpdatedDate >= 'getPatientsChangedSinceDateTimePlaceholder'
  
 
  ]]></r>).toString();
````

_agermano_
Oh, that's a good idea. The advantage is that you don't need to escape `&` or `<` in your SQL. The disadvantage is that it's ugly when you don't need it lol. Whenever mirth gets around to upgrading to rhino 1.7.14, it has JavaScript string template literal support, and we won't need to use e4x for this anymore.

_pacmano_
What is the syntax? `v.AppointmentStatus = {$c('thever')}`  ?

_Kirby Knight_:

````javascript
 //encounters
 var encountersQuery = (<r><![CDATA[
  
  SELECT v.PatientDurableKey AS patientDurableKey, ddStartDate.dateValue AS startDate, v.visitKey,v.appointmentStatus, v.visitType, v.portalReasonForVisit, pd.NPI, pd.durableKey AS providerDurableKey, pd.name AS encounterProviderName, pd.type AS physicianType, pd.primaryDepartmentEpicId, pd.primaryDepartment
  FROM VisitFact v 
    JOIN DateDim ddStartDate ON v.EncounterDateKey=ddStartDate.DateKey AND ddStartDate.dateValue IS NOT NULL 
    JOIN ProviderDim pd ON v.PrimaryVisitProviderDurableKey = pd.DurableKey AND pd.isCurrent=1
    JOIN #patientScope ps ON v.patientDurableKey = ps.patientDurableKey 
  WHERE 1 = 1
  AND v.AppointmentStatus NOT IN ('Canceled','Left without seen','No Show')
  AND v.Status_LastUpdatedDate >= 'getPatientsChangedSinceDateTimePlaceholder'
  
 
  ]]></r>).toString();

 encountersQuery = encountersQuery.replace(new RegExp('getPatientsChangedSinceDateTimePlaceholder','g'),channelMap.get('getPatientsChangedSinceDateTime'));
 queriesJson.encounters = encountersQuery;
````

_agermano_
This only works for static SQL. Which is a disadvantage if you aren't using or can't use prepared statements with `?` as placeholders. There are certain things, like table name, that you can't parameterize.

_Kirby Knight_
Any concerns with performance, doing it this way?

_agermano_
I wouldn't expect a noticeable difference in performance. I wouldn't use CDATA if you're planning on doing the regexp replace afterwards as java already supports parameterized queries
`AND v.Status_LastUpdatedDate >= ?`
but if you want to inline the value, this works if you aren't using CDATA
`AND v.Status_LastUpdatedDate >= {$c('getPatientsChangedSinceDateTime')}`

_Anthony Master_
I use a mixture of CDATA and concatenated strings. For the most part, just use concatenated string. Just remember when you use variabes inline to never trust inputs, which for most of us here should be a given.

_agermano_
that's why parameterized queries should be the first choice here. it automatically sanitizes the input

_Anthony Master_
agreed. When I say concatenated strings, I meant more of this:

````javascript
var query = ''
+'SELECT'
+'  id,'
+'  name'
+'FROM'
+'  myTable'
+'WHERE'
+'  id=?'
````

This is a poor example because it is a short query, but for longer queries I prefer CDATA.

_pacmano_
I just escape the XML in the rare cases there is a conflict. I follow this pattern for the most part (no escaped xml needed in this one), that query in well fell swoop in a response transformer inserts an array of object to rows in postgres.

````javascript

var sql = <>
INSERT INTO integration.allscripts_touchworks_document_backfill_logs (client_code, practice, document_id, patient_id, status, documentsource, document_json)
SELECT
    '{$c('clientcode')}',
    '{$c('practice')}',
    (obj->>'DocumentID')::bigint,
    (obj->>'patientid')::bigint,
    obj->>'Status',
    'INTEGRATION',
    obj
FROM jsonb_array_elements(?::jsonb) AS obj
WHERE NOT EXISTS (
    SELECT 1
    FROM integration.allscripts_touchworks_document_backfill_logs
    WHERE client_code = '{$c('clientcode')}'
        AND practice = '{$c('practice')}'
        AND document_id = (obj->>'DocumentID')::bigint
        AND patient_id = (obj->>'patientid')::integer
)
</>.toString();

var params = new java.util.ArrayList();
params.add(JSON.stringify(list_of_documents))
````

not all parameterized though. just the json blob which is all I care about from a data cleanliness perspective.

## Info on FHIR connectors

_Arun Kumar P_
What would be the cost for purchasing FHIR connector? I believe earlier it used to be open source and now it is paid

_pacmano_
Call sales. And I don’t think there is a standalone option, you require minimum the Gold license pack. FHIR is just calling APIs after all, and <https://hapi.fhir.org/> sorta tells you everything you need to do. Standing up inbound FHIR services is a very different topic of course.

_joshm_
you can use a simple http connector and build the JSON required. You can also use HAPI FHIR java library which is what the plugin uses under the covers. Regarding inbound FHIR services, depending on what you need to do with them, yea. If you just need to parse whatever you get, it’s not too bad. If you need to proxy that to a FHIR repo somewhere, that can get a bit more complicated. there have been a lot of improvements over the old free version.

_Kirby Knight_
If you are querying existing FHIR servers for data, does it make the most since to just do FHIR API calls from Mirth or is there an advantage to learning and using the HAPI FHIR Java library?

_joshm_
if you need to parse it, there is an advantage (POJOs w/javadocs instead of JSON) but if you’re passing through, no

_jonb_
HAPI FHIR as a project is also far more expansive than just the library. their HAPI FHIR server is a pretty quick way to get a FHIR data store up and running.

_joshm_
I haven’t used it in a long time, but they used to have a quick start project where you could literally just run a build and upload your war to Tomcat or other engine of choice and have a nice UI and DB for your repo.

## Create one OBX segment from multiple OBX segments

_Rodger Glenn_
hello all i am needing to create one OBX segment from multiple OBX segments. If any one knows of a good link. I keep searching but i keep finding the one to make multiples from One OBX.

_Anthony Master_
is it coded data or string data?

_Rodger Glenn_
String data

_Anthony Master_
So I have done something similar. Loop over all segments (in case multiple OBX groups) and for each group, create a new string, and then delete each OBX and insert a new OBX after completing the OBX group.

_tiskinty_
are you combining all of the OBXs in the message or a specific group?

_Rodger Glenn_
all of `OBX.5` into one

_agermano_
How do you need to combine them?

_pacmano_
example would be helpful. screenshot before and after. Seems it is a simple iteration, appending to OBX 1 and deleting the others as you append. unless you have groups of OBXs.

_agermano_
Is this a report? Does each OBX represent a line? How will the line breaks be represented after there is a single segment?

_Rodger Glenn_
the system i am working with only wants one OBX segment will of the OBX.5 in the one OBX line.

_agermano_
so you need to convert repeating OBX segments to repeating OBX-5 fields

_Rodger Glenn_
Yes. I tried this but but it doesn't look like is it making the correct breaks.

````javascript
var len=msg['OBX'].length();
for(i=0;i<len;i++) {
  for(j=i+1;j<len;j++) {
    if(msg['OBX'][i]['OBX.3']['OBX.3.1'].toString()==msg['OBX'][j]['OBX.3']['OBX.3.1'].toString()) {
      msg['OBX'][i]['OBX.5']['OBX.5.1']+=msg['OBX'][j]['OBX.5']['OBX.5.1'].toString();
      delete msg['OBX'][j];
      j=j-1;
    }
    len=msg['OBX'].length();
  }
}
````

_agermano_
I haven't tested, but try this

````javascript
msg.OBX[0]['OBX.5'] = msg.OBX['OBX.5']
msg.OBX = msg.OBX[0]
````

The first line should assign all of the OBX-5 values as a repeating list on the first OBX segment, and the second line should remove all OBX segments except for the first one.

_Rodger Glenn_
Okay that looks right.

_pacmano_
I would think you would want line feeds

_agermano_
I've seen systems use repeating fields to represent line breaks in OBX segments. It's not that uncommon.
Just wanted to point out that the solution is not as easy as the one I posted if you need to deal with multiple OBX groups as _@Anthony Master_ mentioned above.

## foo

Karel
  11 days ago
Hi, How do I deploy a File Reader channel that only runs when triggered from another channel? I have Interval / Time / Cron as an option. I tried a Cron job with a specific year in the past but this refuses to start the channel :slightly_smiling_face: (edited)

18 replies

jonb
  11 days ago
What is the use case?
Channel A triggers the file reader and causes the files to be read?
OR
Channel A sends a message to the file reader and the file reader processes that message but does not really read any files?

Karel
  11 days ago
first use case

Karel
  11 days ago
second channel processes a bunch of pdf/xml files (edited)

Karel
  11 days ago
first channel processes a trigger file which can be modified by another department

Karel
  11 days ago
@jonb

jonb
  11 days ago
OK. I know I have seen that use case on Github or the forums before but I do not remember the solution.

jonb
  11 days ago
Having Channel A  start/stop the file reader might work

Karel
  11 days ago
I asked this question before here in Slack. But I just now started implementing the solution :slightly_smiling_face:

Karel
  11 days ago
@jonb
 how would I know when to stop the second channel? It needs to stop when all files are processed (not just one message/file)?

jonb
  11 days ago
Thinking…
I found <https://github.com/nextgenhealthcare/connect/issues/4810> which describes the feature you want, but this feature does not exist yet

jonb
  11 days ago
As for the batch complete feature - that exists now <https://github.com/nextgenhealthcare/connect/issues/2085>
Look in your mapping tabl for batchComplete
:heart:
1

Karel
  11 days ago
Allright I figured it out. trigger channel does conditional check and triggers second channel through ChannelUtil.startChannel. Second channel with initalial State "Stopped" and Poll on start "Yes". In the post processor script I've put
if($('pollComplete')) {
 ChannelUtil.stopChannel('d03a6c59-669a-49aa-b361-5fa7939cabc2');
}
:+1::skin-tone-4:
1

Karel
  11 days ago
Which stops the channel once all files are processed. Waiting for the next run. Only problem I see is another Mirth admin manually running the transfer channel

## foo

_ThisIsTheWay_
Hello everyone! I need to get a total count of interface messages received and sent for all channels in our production instance per month. The client API has a call for this, but it's only one channel at a time. Any advice on running this for all channels?

_jonb_
[This daily volume report](https://gist.github.com/jonbartels/b961574b2043b628f1b0fd96f440179b) should be a starting point in Postgres.

_joshm_
Stats are calculated by individual channel. You’d have to build something to get it for all channels. Kinda like what
@jonb posted or you can use Mirth to build a channel to query its own API for each channel. Just make a call to get the list of channels, then iterate that list to call the stats API for each entry.
If you are interested in a solution that does this all out of the box for you and provides dashboards, visuals, etc. [my company](https://www.innovarhealthcare.com) does have a service offering for that already built. We have a set of channels that can grab that and more. We can even dig into the Mirth paid SSL Manager extension to get expiration dates on your certificates and such.

## foo

_Sean Phelan_
Anyone experience issues with SFTP reader throwing an error when a filename contains a unicode character? The following message just repeats in our logs. I can  rename the filename but hoping for a solution that does not require manual work.

````plaintext
ERROR  (com.mirth.connect.connectors.file.FileReceiver:27): Unable to dispatch message to channel 16133e05-80ac-4227-8d58-4075544bf4b4. File: bad_filename_with_unicode_character.xml
2: File not found: /sftp/bad_filename_with_unicode_character.xml`
````

Filenames use the patients name. The file that is causing issues appears to have ñ in the last name.
Tried using cyberduck and had a similar problem. It errored. ... but changed the encoding to windows 1258 and everything worked correctly.

_jonb_
Does changing the encoding in Mirth work?

_Sean Phelan_
I was hoping that would fix it as well.. but no luck. I vaguely remember being able to set jsch settings as configuration settings in the reader. wondering if there is any setting I can use  to change the encoding ... just cant find a list of possible settings

## foo

_stewart anderson_
hi guys. I will be deploying Mirth into a new green field site and wondered what best pradtices you like to follwo for deploying mirth - mostly in prod, I will be using the zip version, creating the services, RAM I can work out, but do you do anything specific like split the logs to different disk, etc?

_jonb_:

1. PRUNING
1. Give it a good server name and set the environment
1. monitoring
3.1. JVM
3.2. basic OS stats
3.3. MC itself
1. Some sort of deployment plan so you’re cloning changes into PROD and not touching PROD manually
1. Don't use Derby :smile:. PSQL is best but SQL Server is nice too

Sending logs to a logging services is best but remember logs can have PHI

_Kirby Knight_
Infrastructure as code, however you plan on doing it. In Azure I used ACS to deploy Mirth in containers.

_stewart anderson_
it will be in azure so I think  they will use SQLServer. I tried PSQL and was not confident I knew what I was doing WRT cleanup, in that whatever I tried to do to get rid of old tuples, the DB size didn't seem to reduce! just kept growing. for deployment I have written some stuff around mirthsync and for config wil be doing some work to edit json config files for global map etc. (both in powershell)

## foo

_pacmano_
Has anyone seen an S3 Writer slow down after a few thousand messages? after a channel restart it seems to process normally.  I have used attachments, not used attachments, used s3fs, not used s3fs. A command line s3 speed test is very fast, mirth not so much.

[days later]

after all that…. it was a missing index on a table (apparently a bigserial column though) on the post S3 write to db recording the fact the file was written.

## foo keystore

_evan_
Does mirth ever update the keystore settings in mirth.properties on its own?  I’m testing the update from 3.11 to 4.3 and keep ending up with a broken jks keystore.  The only way I’ve found of fixing it is to nuke the keystore completely so it gets regenerated.  I didn’t run into anything like this the last time we updated from 3.4 to 3.11

_jonb_
What settings are you using that are not defaulted? What changes, if any, do you have to your keystore? In what way is the keystore broken?
Note that MC ALWAYS reads+writes the keystore on startup even if it didn’t have to change anything - <https://github.com/nextgenhealthcare/connect/issues/5467>

_evan_
The keystore settings in mirth.properties on this particular instance seem to get changed from the default values. I know this because our saved configuration that is used in our instances uses the default values for keystore.storepass and keystore.keypass present on a fresh install, so I’d expect to see those values when I look at this particular instance (after running our normal install script to load 3.11 and drop in the appropriate config files). That is what I’m confused about. The keystore itself being modified makes perfect sense.

_jonb_
OH <https://github.com/nextgenhealthcare/connect/commit/66f1518dd585dbe5a515411ad069214961ac3dfd>
You have `81uWxplDtB` and its being changed to something else right?

_evan_
Yes, not using a container. actually, the servers are likely VMs

jonb
<https://github.com/nextgenhealthcare/connect/wiki/3.7.0---Upgrade-Guide#keystore-passwords>
I can’t explain why you’re running into it now and not previously but that exactly matches what you are seeing.

_evan_
Yes that seems to be it. If I’m reading it correctly:

* Updating from 3.4 to 3.11 -> keystore passwords left unchanged even if they’re set to the default
* Fresh install of 3.7 onwards -> passwords changed/randomized if the keystore is being created for the first time and the passwords are set to the defaults
* Updating 3.7 onwards and the password is not the default -> I need to manually update mirth.properties or it will break

_jonb_
[DefaultConfigurationController](https://github.com/nextgenhealthcare/connect/blob/e0db5497aabb94c41071e4a098580e660a1d5d8e/server/src/com/mirth/connect/server/controllers/DefaultConfigurationController.java#L1178-L1186)
Does your keystore exist when Mirth launches for the first time?

_jonb_
It only generates new passwords IF the keystore DOES NOT exist already

_evan_
Right, that’s what I said. The keystore already exists when I update from 3.11 to 4.3, but it’s secured with a non-default password per the behavior outlined in the links you’ve shared. In this case, it seems I need to manually migrate those values from the old config to the new, because when mirth is first installed/updated, mirth.properties is reverted back to a default state. Since making my original post, I verified I was able to access the instance by manually migrating those properties so it could access the existing keystore. just wanted to understand what was going on as I didn’t run into this before.

_jonb_
hmm… is [this](https://github.com/nextgenhealthcare/connect/blob/e0db5497aabb94c41071e4a098580e660a1d5d8e/server/src/com/mirth/connect/server/Mirth.java#L224) relevant?
I’m going to actually tag @narupley here. his fingerprints are on this code and he is good at explaining things if he’s around

_evan_
Thanks for taking a look. What I’m seeing makes a lot more sense now.  The main thing I need to figure out is whether I need to migrate those keystore properties on a per-instance basis when we update, right now it’s looking like I will.  Not ideal but it also sounds like I could do one-time migration of all instances to a non-default storepass/keypass combo and not need to worry about it again in the future

## Node.js CDA Parser

_pacmano_: For community use if needed, Amida Tech’s [BlueButton](https://github.com/amida-tech/blue-button) CDA parser, via a simple node.js app API listener. Dockerfile included. Thanks to _Michael Hobbs_, _agermano_, and _jonb_ for some QA: <https://github.com/pacmano1/bluebutton>. Not a fork, just uses Amida’s library.

## FHIR client using JS

[This](https://medium.com/@fhirBender/creating-a-patient-resource-with-fhir-js-a-guide-for-the-rebellious-javascript-lover-8d7247ffb50a) was mentioned which links to the [offical FHIR Patient docs](http://hl7.org/fhir/patient.html).

## Get a JSON property regardless its name

_itsjohn_
I have a json `{ “m1” : “one”, “m2” : { “m3” : [ “two”, “three”] } }`. I want to access `m3` but in my scenario the field `m3` can be named anything. Is there a way to access that field and the array events without referencing the field names? I used `msg.m2.*` but that gave me `undefined`.

_agermano_
  17 hours ago
If `msg.m2` is always an object with a single property, and you want to get the value of that property regardless of its name, you can do something like:

````javascript
var prop = Object.getOwnPropertyNames[msg.m2](0)
var value = msg.m2[prop]
````

## Parameter `reprocessMetaDataIds` quirk(?)

_joshm_
On the [messageController.reprocessMessages()](https://github.com/nextgenhealthcare/connect/blob/4.3.0/server/src/com/mirth/connect/server/controllers/MessageController.java), the `reprocessMetaDataIds` parameter is optional. If not specified, it will reprocess ALL connector messages.

## Backporting `foreach` in Mirth v3.6.0

If you backport a `foreach` to this Rhino version,  change the arrow function to a regular function. Or if you're using it to copy from map to map, use `putAll()`.

````javascript
//split_json is a JS object (map),
//Rhino can translate that to a Java Map,
//then putAll does the work
channelMap.putAll(split_json);
`````

## Mirth's various meanings for _metadata_

_agermano_:

* At the channel level, metadata can mean custom database fields.
* At the connector level, metadata identifies the source or a specific destination.
* In a Channel Writer, metadata populates the downstream channel's `sourceMap`.

## Use immutable dates to avoid bugs

_mkopinsky_
so we had a production incident where we were sending out some wrong data because of a minor bug in a Mirth channel:

````javascript
var prepTime = arrivalTime;
prepTime.setHours(arrivalTime.getHours() - 6);
should instead have been
var prepTime = new Date(arrivalTime);
prepTime.setHours(prepTime.getHours() - 6);
````

The old version of the code meant that `arrivalTime` also got modified in that second line, when the intent was only to modify `prepTime`.
Other than "now we know to do `var foo = new Date(bar)` instead of `var foo = bar`", is there a better way to prevent this kind of bug?

_agermano_
Use [java.time](https://docs.oracle.com/javase/8/docs/api/java/time/LocalDateTime.html). Then you just need to do `var prepTime = arrivalTime.minusHours(6)`, and it will return a new `LocalDateTime`, because they are immutable.

## MCAL needs Java 8 for FHIR plugin

_James Oakes_
Hi All, I'm currently experiencing a weird issue with the FHIR Plugin.
When I go to code templates and look at a 'FHIR Resource Builder' template, there is an error in the drop down box saying `<no models found>`.
I have tried creating new templates and this happens for all fhir versions.
The other weird thing is that my existing code templates that are in use are still functioning fine.
So i'm guessing the issue lies with the UI builder...
When checking the extensions section, I can still see that the FHIR plugin is installed (Version 4.2.0 b1791)
The only change I have made is updating the admin client launcher to version 1.4.
There is also no errors in the launcher.log to indicate any issues

_joshm_
I’ve heard there is a known issue with certain versions of Java and the FHIR plugin. Tell the launcher to use Java 8 with that instance and see if your issue resolves.

_James Oakes_
That worked!

## FHIR server to test against

_Kirby Knight_
Can anyone recommend a FHIR server to test against? I am looking for something we good test patient data(demographics, insurance, diagnosis, procedures, and medications) to work with.

_joshm_
<https://hapi.fhir.org/>

_agermano_
_@kayyagari_'s got it in his slack profile <https://fhir.sereen.io>

## Generating HL7 and FHIR messages

_Anderson Araujo_
Is there a public server to generate HL7 and FHIR messages for development testing?

_jonb_
<https://hapi.fhir.org/> for FHIR

_Qwelm_
I've always had to create my own HL7v2 messages for testing. [FHIR-Converter](https://github.com/microsoft/FHIR-Converter) showed up in the #random channel for making it a FHIR message.

## Running Mirth on AWS EC2 instances

_Amy Workman_
Looking for someone in the community that is running Mirth on AWS EC2 instances that is willing to speak about how they have architected the server/network/VPN architecture. Anyone willing to share?

_pacmano_
in general, use the AWS reference architecture for HIPAA workloads, e.g. public/private subnets in VPC(s). Mirth backend is RDS multiAZ Aurora Postgres or RDS Postgres. IPSec tunnels using third party firewall (not using AWS IPSec for few reasons). MFA VPN for remote access to VPC provisioned that way also. Any https or tcps inbound service to Mirth is via a proxy and that proxy choice varies by a few factors. Anything deeper than that, you need to pay me.
All kidding aside, it is a complex topic and you should engage an expert if architecting healthcare workloads on AWS is new to your team.

## _kpalang_'s repository jars for a given Mirth version

_Mitch Trachtenberg_
What jar files does kpalang's repository contain for a given Mirth version?

_agermano_
[artifactIndex.json](https://github.com/kpalang/mirth-releases-api/blob/master/util/artifactIndex.json)
It's basically all of the libraries generated by the source code, plus everything included with the open source extensions. I'm assuming he did that because it was easier to point to the extensions folder than to list multiple libraries per extension. I would only use the mirth libraries from this repo, because the 3rd-party libraries probably won't have all of the dependencies defined in Kaur's repo.

## Filtering various extensions

_Qwelm_
Does a file reader set to read delimited data also have access to the binary (I'm trying to write filtered messages to a separate folder in an existing channel doing delimited reads)?

I got it working in a single channel by doing the following:

* Changing the Source File Reader to 'Binary'
* Converting the file to a string if it passes the flat-file check (determined from file extension)
* Send the files that don't pass the check to a Destination File Writer that writes files to a holding directory and sends an SMTP alert

I leave all the existing Destination stuff as-is (I'm getting this set up as a feature-add for existing channels) and use the following Source Filter:

````javascript
// Variables for determining filtering
var validExtensions = ['dat','txt']
var filename = sourceMap.get('originalFilename')
var fileExtension = filename.substr(filename.lastIndexOf('.') + 1)

if(validExtensions.includes(fileExtension)){
 destinationSet.remove(["Invalid File Extension Destination"]);

 // Convert the b64 file to a byte array
 var byteArray = FileUtil.decode(msg);

 // Convert the byte array to a string and make that msg
 msg = new java.lang.String(byteArray)
} else {
 destinationSet.removeAllExcept(["Invalid File Extension Destination"]);
 
 // Log values for use in notification body
 channelMap.put('validExtensions',validExtensions)
 channelMap.put('filename',filename)
 channelMap.put('fileExtension',fileExtension)
}

return true
````

## Interesting services provided by NextGen

_pacmano_: If you have a support account, you can post your channel and it prints out a not bad PDF. (_ed_: link to service was pending)

## Issue with SumoLogic's URL parameter in log4j2.properties

_Emily G_ In a twist no one saw coming, just using the `log4j2.properties` file would not work because my sumo url had an `=` sign it in. But I was able to get it to send logs with the `log4j2.xml` file essentially straight from the documentation.

## Utilization Report: Code Template Library Functions to Channels

_jonb_ recommended [this](https://mirthutils.outcomehealthcare.com) from [Outcome Healthcare](https://outcomehealthcare.com/).

## So you want to send a fax

_Stephen Lynch_
We have a client who wants to use Fax to distribute documents. We're looking at one Fax vendor in particular who provide HTTPS APIs for sending faxes, which sounds like it will work. But in a wider sense, are there any 'gotchas' when dealing with Faxes from Mirth? I'm hoping it's as simple as it sounds, but just wondering if there are any pitfalls I should avoid? we're looking at [SRFAX](https://www.srfax.com/developers/internet-fax-api/)

_jonb_
__@CreepySheep__ is available for contract.
You have to treat their delivery as asynchronous, and “trust but verify” that the fax was sent. My general workflow from Mirth is:

1. Monitor Mirth, you want to know about errors fairly quickly
1. Send your faxes to the API
1. You want to track the faxes you send (MC metadata, separate DB, something)
1. For any fax that the API says was “sent”, query back to the fax vendor's “Status” API and see if it was really sent
1. Take action on things like “no answer”, “dead number”, “busy”, etc.
1. Report back to support or clerical staff or something to deal with any undeliverable faxes

Oh and to the best of your ability, try to decouple Mirth from a vendor. So like your central channel might push a generic message to an “interfax” sender or something. So you can change from __Interfax__ to __Ringcentral__ to whoever

_Stephen Lynch_
Your 5-step plan is pretty much something we have in place for a client in another country (not fax based - but the limitations are the similar - so we've implemented the auditing/alerting almost exactly as you described) Do you have a "least painful" fax vendor that you worked with?

_CreepySheep_
Every single one of them. Oh wait. None of them? I mean they're all bad and fax is bad

_jonb_
I have no strong preferences.

* __Faxage__ let us down badly late 2022.
* __Interfax__ is another one my current employer uses. No strong opinion from me.
* __RingCentral__ had decent APIs. Used them because my employer at the time had other services from the same vendor.
* __eFax__ used to be good, havent touched them in a loooong time though

_Qwelm_
We use a self-hosted Biscom Faxcom server. If you're planning on checking the status of the fax job I'd not recommend them. We tell staff that any automated faxing is "best effort" and not guaranteed to be received.
DETAILS:
The easiest 'API' they could offer us was to write a flat file to one folder and link it to an attachment by file name in another folder. The software just picks it up from there and attempts to send the attachments when a line frees up.
The fax status is logged to a txt file that rotates throughout the day (catch your record before it clears!) and doesn't link back to the attachments.

_chris_
My problem with fax was always preparing the document to send, not in the actual connect, etc. Most services want PDF or some other "big fat document" that takes up a lot of memory. I think the one we use now accepts HTML and a decent subset of CSS which was great for us.

## Regex to treat message as one long string when using PG

_agermano_
Finally... I've always had issues writing a regex search in the message browser against postgres when I needed to treat the message as one long string. `.*` doesn't match newlines, and usually I would use `[\s\S]*` as an alternative, but that throws an error for some reason. `[.\r\n]*` seems to work, and I was able to do `^[.\r\n]*(?!\rORC\|)$` to find messages that were missing an ORC segment.

_siddharth_
Impressive. This means we can toggle the ORC with any segment name?

_agermano_
sure... `(?!)` is negative lookahead, so it checks every character in the message from beginning to end and makes sure that none of them are followed by `\rORC|` in this case. you'll have to be careful if your messages don't use the proper segment delimiter to check for `(?:\r\n|\r|\n)` instead of just `\r` before the ORC. or leave that part off, but it could then match any field that ends in ORC

## Parsing EDI X12 834/835 messages

_akhsdev_
I am looking for parser and viewer to handle EDI X12 835 transaction messages. Any help is appreciated.

_kayyagari_
<https://github.com/imsweb/x12-parser>

_Sam Adarsh_
I recently worked on parsing 834 files and extracting the data and convert the values to JSON objects. But this was based on the 834 files we are receiving, so you might have to make some code changes to meet your requirement. [x12_edi_834_reader.js](x12_edi_834_reader.js).

## Stopping a queuing destination still allows queueing

_Richard_
sanity check please. given a channel with multiple destinations which are each set to queue, if i right-clicked and stopped a specific destination, will the stopped destination continue to queue, or will the dest be skipped over and/or error when a new message comes in? my understanding is the new message will queue in the stopped destination, just not get processed.

_jonb_
Just a moment I have a test channel I can verify the behavior with.
IIRC the stopped destination will queue, others will run. confirmed.

## Access tokens come in various forms

* Where only one is valid at a time
* Where you use one then the second is also valid during a shared timeframe

_agermano_ If the token replacements are atomic, then you only run into an issue where renewing a token automatically expires the previous token at the same time. And then you only have a problem if Channel A gets the old token, then the token refreshes, and then Channel A tries to use the token it previously retrieved. You can't guarantee everyone has the newest token without locking the token from being updated between fetching and using it. But you might not need to if the API will accept the previous token as valid as long as it hasn't expired.

Mostly agreed upon views

* Avoid `$g` and `$gc`'s `lock/getSync/putSync` as they're deprecated and undocumented
* _pacmano_ just a timed refresh. every x minutes. BUT, that same channels make a dummy call every y minutes and if that call fails it gets a fresh token.
* _joshm_ I also usually just have a dummy channel that maintains the current $g value. like a watchdog that refreshes the token and actual API calls are expect to always have a good token. I call it my “Keep Alive” channel. _pacmano_ the keep alive and token getter are the same channel in my case
* _RunnenLate_ I've run into issues setting a `globalMap` value from a polling server, which only sets it on that server, but it was needed on both servers. I had to route the call through an http channel and set it on both servers to ensure it existed on both.
* Using guava with a time-based cache?

## Threads and buffer conversation

_Kirby Knight_
gm, I have a channel where I am using multi-threading. On the source I am setting this variable 'tenantExtPatId' and the Max Processing Threads is set to 5. The destination is an HTTP Sender, with the queue threads set to 5 and the thread assignment variable configured to 'tenantExtPatId'.  When I came in this morning, a single message was blocking processing on the channel. With multi-threading enabled, my expectation is that only processing on that thread would be blocked.  Either my understanding is incorrect, or I have something misconfigured. the queue depth was 125,000+ and its normally 0 - 50. When I stopped and started the channel, a few messages would process, then it would stop

(A single bad message hindered all his messages being processed. Screenshots showed 10 Queue Threads, a TAV set, and 1k Queue Buffer Size.)

Average processing time (response date minus send date) for messages is about 1.5 seconds. 125K in the destination queue. the buffer size is set to 1000, but I had 125k in the queue. The buffer must be different from the queue.

_agermano_
So, when you stop and start the channel, I think it will fill up to that Queue Buffer Size of 1000 that you have set, which would get distributed across your 5 threads, hopefully fairly evenly. 1 thread would get stuck on your bad message. The other 4 would process everything assigned to them in that buffer of 1000 messages, and then the queue would get stuck on that one thread.

_Kirby Knight_
Why does it get stuck on the one thread?

_agermano_
Because the buffer doesn't refill until it's empty. And with a stuck thread, it won't empty. I didn't realize that was how it worked until I just dug into [the code](https://github.com/nextgenhealthcare/connect/blob/f1b87edb00a389453a833f0080fb60451b3bd7cb/donkey/src/main/java/com/mirth/connect/donkey/server/queue/DestinationQueue.java#L184-L188) - see its comment. I think the problem is that it can't assign a message to a thread bucket until after it has pulled it from the database. But it can only pull up to the number that you have defined into the buffer. So, even if it could detect that there was a stuck thread, it would only be able to pull a smaller number than the max buffer size the next time and some of those would get assigned to the stuck thread. eventually your entire buffer would be full of messages for the stuck thread and you'd be in the same boat. but it would be beating on the db harder as time went on as it was pulling fewer and fewer messages at a time. The TAV features does increase throughput by allowing for concurrency while maintaining message order, but apparently you're still limited by having all of your messages pass through a single destination queue when an issue arises. It's still better than using a single threaded destination. It's better than a single destination with a single thread. It's not as good as a separate channel when you want things completely separated. Or even one channel with multiple destinations. I think that's what happened when he bounced the channel because the bad message still caused one of the threads to get stuck, which eventually prevented the fetching of any more messages from the db (until another channel bounce when new threads would be created.) the queue is in the database and endless. The buffer is how many messages from the queue are currently being held in memory. when the buffer is drained, then it fetches more queued messages from the database. the worker threads can only work from the buffer. messages don't get assigned to a thread until they are in the buffer (because that code requires the messages to be in memory.) The database does not know to which thread a message will be assigned.

_Kirby Knight_
So what would the impact be if I changed the buffer to say '1'

_agermano_
it would serialize your channel again. well, maybe not quite. but mirth would only pull a single message from the database at a time. It would have to wait for its assigned thread to grab the message from the buffer, and then it could pull the next message from the database. 1 thread processing a bad message would still cause everything to get stuck. Usually it's only recommended to reduce the buffer size for very large messages due to memory consumption. A large buffer takes more mirth server memory, but fewer round trips to the DB. roughly how many tenants do you have? Would it be feasible to clone the destination for each tenant?

_Kirby Knight_
I don't really want to have multiple destinations

_agermano_
Understandable, but that would give each tenant a dedicated queue, so a bad message from one wouldn't stop traffic to others. I can't even think of how I would suggest a fix for this issue

_jonb_
The root cause is what is making the message hang in the first place

_agermano_
Absolutely, but you can't always predict when a bad message may hang a thread

_Kirby Knight_
error conditions will happen. Prior to this conversation, my understanding of the TAV feature was incorrect. Especially as it relates to error handling and TAV. Ideally, if there is a blocking error, it would be great if MC was able to process on the other threads and only assign messages with the same TAV as the one that error'd to the stuck thread.

_agermano_
yeah, it just can't without ignoring your max buffer size. Memory usage would balloon out of control. You couldn't really even replace the hung thread in the queue with a different one and skip the current message when you have your settings indicating that message order is important.

_Kirby Knight_
Thats why I'm saying put the messages with the same TAV as the error'd stuck message, in the stuck thread.

_agermano_
And if you did that too many time, then you'd have tons of hung threads hanging around in the system taking up resources. if you remove the stuck thread from the queue, then a new thread would take over the bucket that message was previously assigned to. you couldn't continue assigning messages to the thread that had been unassigned from the queue. Messages don't get directly assigned to threads. They get assigned to a bucket and the bucket maps to a thread. then the thread searches the buffer for messages that have been assigned to it, and when it finds one, then it removes that message from the buffer

_Kirby Knight_
What if I change my queue setting from queue messages 'Always' to 'On Failure'?

_agermano_
"on failure" wouldn't work either. When there are messages already in the queue, it needs to stick new messages in the back of the line to maintain order. what you described is when you turn the queue off completely. that would also break message order when the endpoint was down.

## Query response message from specific channel

_joshm_
How would you go about querying the response message from a specific channel in the Mirth DB? I have narrowed down the channel internal ID to 103 and I know d_mm103 is my connector message table and I’m using the connector name of the destination. I specifically need the response connector message. I just need the response string so I can parse it and do something with it. Something like this is what I have now:

````sql
select mc.message_id, mc.content
from  d_mm103 mm
join d_mc103 mc on mm.message_id = mc.message_id
WHERE mm.CONNECTOR_NAME = 'Destination 1'
````

but I need to figure out where to get the response message not the message going to the connector.

_tiskinty_'s SQL

````sql
SELECT *
from D_MC103
where MESSAGE_ID = {message_id}
and CONTENT_TYPE = 6
and DATA_TYPE is not null
````

_pacmano_
_@Michael Hobbs_ has some cool code to just go get it from the other channel (but not sure on your use case).

_agermano_
`content_type (int)` relates to the content type radio buttons in the message browser

_jonb_'s Java

````java
public enum ContentType {
  RAW(1), PROCESSED_RAW(2), TRANSFORMED(3), ENCODED(4),
  SENT(5), RESPONSE(6), RESPONSE_TRANSFORMED(7),
  PROCESSED_RESPONSE(8), CONNECTOR_MAP(9), CHANNEL_MAP(10),
  RESPONSE_MAP(11), PROCESSING_ERROR(12), POSTPROCESSOR_ERROR(13),
  RESPONSE_ERROR(14), SOURCE_MAP(15);
````

JOIN to `d_mc` and filter on message type. you need the join if you want to constrain by date or other info on the `mm` table. also remember indexes are limited on these tables, so watch your explain plans.

_joshm_
I need to constrain it to a specific connector.

_agermano_
that's what the `metadata_id` is for, the destination id. source is 0. your first destination might not necessarily be 1 if you've reordered or deleted destinations

## File Reader not moving to ERROR folder on DB error

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
Mirth doesn't let you set the connector's charset for inbound.
So it will follow HTTP spec which is that the default charset for `text/*` without a charset parameter is `ISO-8859-1`.
Try setting "binary mime types" to "anything".
Then you'll just get bytes, and you can convert to string yourself and force UTF-8 encoding.
But I think your config may be the problem, here.
You could ask the sender to use `text/plain; charset-UTF-8` and see if that improves things.

_pacmano_
That fixed it. No code changes on my side needed.

## Sending Mirth alerts to various apps

_Mirth Dev_
Hi All, just wanted to check did anyone try to integrate Mirth with MS team and send Mirth alerts to teams channel? Any reference link would be really useful.

_joshm_
Official [MS link](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=dotnet) is probably a good place to start. just set your alerts to route to a channel instead of email. Then from your channel, do whatever you want. I have integration with slack today. you create an “app” in your slack web portal, then you can get webook URLs

_pacmano_
it’s a basic https post w/JSON after you create the endpoint. its a couple of minutes of work to do that post and create the endpoint. as for handling a reply, that’s different.

_Mirth Dev_
I found that MS Teams groups(channel) also provide email address. We can directly configure the Mirth alerts on this email, and it will be send out to that Channel.

## What is the indication when red numbers display in the Dashboard's Connection column?

That you're using all of the Max Connections defined in your TCP Listener.

## Properly use destinationSet filtering

This design can handle being fed a junk input message so that the junk message isn't sent to all destinations. It also ERRORs properly so investigations can occur.

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
All the destinations are separate and there is no daisy chaining, but some endpoints call other endpoints via Javascript using `router.routeMessage()`
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

_jonb_ referenced the [above advice](#mirth-appliance-upgrade-advice)

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

### Message Builder steps not wrapped in try/catch

_agermano_
interesting... mapper steps wrap in try/catch, but message builder steps don't. the current issue with the validate function is that the value is evaluated and throws the exception before being passed to the function. it just needs to be wrapped in a try/catch, so that if you are trying to access something at a long path that doesn't exist you can set a default value rather than throwing an exception. This is built in to mapper steps, but not message builder steps for some reason.

You can create a simple function to do the try for you:

````javascript
function $try(f) {
 try {
  return f()
 }
 catch(e) {}
}
````

Then in the message builder step, change the mapping to `$try(() => $['PractitionerObject']('name')[0]['suffix'][0])`. That will delay evaluation, and if the arrow function throws an exception, the `$try` function will return `undefined`, which will then let the mirth `validate` function use the default value specified in the message builder step.

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

You'll see a recursive write error. Disable / delete the transformer then redeploy. (TODO: VERIFY THIS ONE)

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

### Module used for TIFF does not export

_RunnenLate_
upgraded mirth and my tiff stuff is all broken. java 1.8 to openJDK 17, version 3.10.1 to 4.4. This is related to moving from java 8 to java 17 I'm sure.

````text
DETAILS: Wrapped java.lang.IllegalAccessException: class org.mozilla.javascript.MemberBox cannot access class com.sun.imageio.plugins.tiff.TIFFImageReader (in module java.desktop) because module java.desktop does not export com.sun.imageio.plugins.tiff to unnamed module @68826d2d
 at 6ffa9550-bc0a-4552-b948-2d293c6ef348_JavaScript_Writer_1:1916 (convertPDFtoTIFFFromHex)
````

_pacmano_
chatGPT say `--illegal-access=permit --add-exports java.desktop/com.sun.imageio.plugins.tiff=ALL-UNNAMED`

_RunnenLate_
In case anyone searches this again, looks like java 17 doesn't support `--illegal-access=permit` and you need to use
`--add-opens=java.desktop/com.sun.imageio.plugins.tiff=ALL-UNNAMED` instead of `--add-exports`. Found [this](https://github.com/nextgenhealthcare/connect/issues/4602) which was helpful.

### MCAL cert error after adding new cert from RapidSSL

Error text: `javax.net.ssl.SSLHandshakeException: sun.security.validator.ValidatorException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target`

You may have several JREs installed on the MCAL machine. Ensure the keystore (named `cacerts`) you updated to contain the new cert is for the JRE used to run MCAL. For pre-v1.4.0, the JRE path is set in `launch.vmoptions`.

### MCAL cannot connect

Error text: `Caused by: java.net.SocketException: Invalid argument: create`

_Richard_
You may encounter this error in a DOD environment within a VDI. Your MCAL is on a share and it lacks certain permission(s) -- see [details](https://bugs.openjdk.org/browse/JDK-8068568). One solution is to move the MCAL folder off the share -- try copy/pasting its folder directly onto the VDI's `C:`. The folder will be wiped when the VDI session ends, but the permission issue may be resolved in the next VDI session, or you can easily perform the same 'fix' again.

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

In 2023, _Richard_ wrote a PowerShell script to query Mirth and output a `.dot` graph file that's processed with GraphViz.

## HL7 Escaping rules

First list via [InterSystems](https://docs.intersystems.com/latest/csp/docbook/DocBook.UI.Page.cls?KEY=EHL72_ESCAPE_SEQUENCES).
Second list via [HL7+ Notepad](https://www.hermetechnz.com/Documentation/HL7Plus/Notepad/index.html?hl7_escape_rules.htm) (formerly [here](https://www.hl7plus.com/Help/Notepad/index.html?hl7_escape_rules.htm) which hung on its tool site).

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

Ensure you do not have a [xalan](https://mvnrepository.com/artifact/xalan/xalan) jar in your custom library. [Here](https://github.com/nextgenhealthcare/connect/issues/4947#issuecomment-1120048480) is how _rogin_ replicated.

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

_rbeckman-nextgen_ [said](https://github.com/nextgenhealthcare/connect/issues/3669#issuecomment-626961210) "a typical server can handle thousands of threads without issue."

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

Given many destinations where most of them get filtered: to improve performance, you can instead use "Destination Set Filtering" in your source transformer. You can decide which destinations to exclude, and then those will not be committed to the database in the first place. That can greatly reduce the database load for a channel. This is [described](https://docs.nextgen.com/bundle/Mirth_User_Guide_42/page/connect/connect/topics/c_Use_Destination_Set_Filter_faq_mcug.html) in the [Best Practices](https://docs.nextgen.com/bundle/Mirth_User_Guide_42/page/connect/connect/topics/c_Channel_Development_Best_Practices_and_Tips_connect_ug.html) section of the User Guide. (_narupley_)

See related [details and code sample](#properly-use-destinationset-filtering).

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
1. If it's blank - then call `destinationSet.removeAll()`. this is superior to a filter; build a response message with the HTTP error you want; do some logging.
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

## Tool to monitor cpu/memory usage on a per channel basis

_stormcel_
do you guys know if there is a tool that can monitor cpu/memory usage on a per channel basis?
As of 3.0 Mirth Connect no longer uses JMX bindings. In the past it was only done because Mule (the messaging engine we were using at the time) required it. However since we rewrote our own messaging engine from scratch, we no longer needed any RMI/JMX stuff.
I did find [this](https://backstage.forgerock.com/knowledge/kb/article/a39551500)... imma gonna play.... they recommended jprofiler... which is expensive.
I've been writing scripts that can analyze java threads. I was able to identify the exact channels causing problems in the cluster. The above article set me up for success.

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
