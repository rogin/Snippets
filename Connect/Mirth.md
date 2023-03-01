# NextGen Connect FAQs

## 1. <a name='OtherstrackingFAQs'></a>Others tracking FAQs

See [_jonb_'s useful gists](<https://gist.github.com/jonbartels>) which overlap here in some areas. His [SSL writeup](https://gist.github.com/jonbartels/8abd121901eb930f46245d9ef0f5710e) is excellent.

See [Michael Hobbs' gists](https://gist.github.com/MichaelLeeHobbs) which include an excellent [Mirth channel table resizer for PG](https://gist.github.com/MichaelLeeHobbs/67980d165fc68880eb2ab283c673244b).

NextGen manages a [repo](https://github.com/nextgenhealthcare/connect-examples) for various code templates.

## 2. <a name='OtherprojectsongithubusingMirth'></a>Other projects on github using Mirth?

See [my list](https://github.com/stars/rogin/lists/mirth-related) that others in Mirth Slack found useful.

## 3. <a name='WhoiscurrentlysellingANYMirthextensionsorpaidextrasoftware'></a>Who is currently selling ANY Mirth extensions or paid extra software?

23 Jan 2023

* Zen SSL
* NextGen
* InterfaceMonitor / xc-monitor
* MirthSync is on GitHub, is it a freemium model?

## 4. <a name='HL7tips'></a>HL7 tips

* For escaping rules, see [here](https://docs.intersystems.com/latest/csp/docbook/DocBook.UI.Page.cls?KEY=EHL72_ESCAPE_SEQUENCES) and [here](https://www.hl7plus.com/Help/Notepad/index.html?hl7_escape_rules.htm).

## 5. <a name='EmbedBase64imageintoPDF'></a>Embed Base64 image into PDF

Kicked off by _mkopinsky_ 16 Jan 2023

_agermano_ with all the important bits.

### 5.1. <a name='Option1'></a>Option 1

He recommends Document Writer as "the document writer actually gives you the option of writing to a mirth attachment, which makes it really easy to embed in a second destination".

### 5.2. <a name='Option2'></a>Option 2

"You can use the legacy Flying Saucer and iText libs which are [still included](https://github.com/nextgenhealthcare/connect/tree/4.2.0/server/lib/extensions/doc)". "Data urls work as long as you've registered a url protocol handler for 'data' types".

Echoing the [forum resolution](https://forums.mirthproject.io/forum/mirth-connect/support/16056-pdf-document-writer-and-base-64-encoded-images#post175260) below.

User can embed

````html
<img src="data:image/jpg;base64,YOURDATAHERE" style="height: 153px; width: 118px;"/>
````

Then set

````
-Djava.protocol.handler.pkgs=org.xhtmlrenderer.protocols
-classpath/a extensions/doc/lib/flying-saucer-core-9.0.1.jar
````

_The first line adds the "data" protocol handler to the search path used by the URL class.
The second line appends the jar to the end of the classpath at startup. This is an option used by the install4j launcher and not directly passed to the jvm_

### 5.3. <a name='Option3'></a>Option 3

Use the newer libraries
"The main libraries used now are openhtmltopdf running on top of PDFBox 2.x" and the "new lib also supports svg graphics".

## 6. <a name='AccessingHTTPListenerrequestheadersandmetadatasettingcustomresponsecodes'></a>Accessing HTTP Listener request headers and metadata, setting custom response codes

See [this response](https://forums.mirthproject.io/forum/mirth-connect/support/10305-access-request-headers-in-http-listener?p=69586#post69586).

## 7. <a name='HashingfilesMD5orother'></a>Hashing files (MD5 or other)

See [this response](https://forums.mirthproject.io/forum/mirth-connect/support/13366-md5-hashing?p=81191#post81191) on using Guava. _agermano_: Be sure your RAW content is Base64 decoded before hashing - use either _msg_ or _connectorMessage.getRawData()_.

_NickT_'s working sample

````javascript
var decodedData = FileUtil.decode(msg);
var hasher = Hashing.md5().newHasher();
var hash = hasher.putBytes(decodedData).hash().toString();

logger.info(hash);
````

## 8. <a name='SamplemessagetransformationsfromHL7v2toFHIR'></a>Sample message transformations from HL7v2 to FHIR

13 Jan 2023
_jonb_ recommends [these](https://confluence.hl7.org/display/OO/v2+Sample+Messages).

## 9. <a name='HaveaHTTPListenertorespondwithgzipdata'></a>Have a HTTP Listener to respond with gzip data

It's [automatic now](https://forums.mirthproject.io/forum/mirth-connect/support/13156-web-service-and-compress#post80922()) when given the proper request headers.

## 10. <a name='Optiontocheckforduplicatesingiventimeperiod'></a>Option to check for duplicates in given time period

User wants to check for duplicate messages in a given 12 hour period. (11 Jan 2023)

See [_agermano_](<https://forums.mirthproject.io/forum/mirth-connect/support/19116-filter-smtp-destination-unique-only?p=174475#post174475>)'s code snippet using guava which is included with Mirth. Guava allows expiring entries in multiple ways.

## 11. <a name='CanMirthverifycertificatesofexternalparties'></a>Can Mirth verify certificates of external parties?

(Feb 2023) Nothing directly in Mirth.

_chris_: It's very easy to pull a remote cert. Just connect to the service via HTTP and the server will provide it. Then you check it for upcoming expiration. Something like [certcheck](https://github.com/ChristopherSchultz/certcheck) or [check_ssl_cert](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_cert/details) or [check_ssl_certificate](https://exchange.nagios.org/directory/Plugins/Network-Protocols/HTTP/check_ssl_certificate/details) or [check_http](https://nagios-plugins.org/doc/man/check_http.html).

## 12. <a name='UsingCryptoJSjavascriptlibrary'></a>Using CryptoJS javascript library

See [here](https://forums.mirthproject.io/forum/mirth-connect/support/174848-use-require-from-node-js?p=174858#post174858).

## 13. <a name='UsingGPGwithMirth'></a>Using GPG with Mirth

12 Jan 2023

"Good Morning, are there any good sources for gpg encryption of a file within mirth? I see different posts that are from the old forums, but was looking for any examples of implementation."

For running GPG outside Mirth, use this [code template](https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Execute%20Runtime%20Command) to execute the GPG lib available on the system with the required parameters.

For running within Mirth, you need an additional GPG library, says [here](https://forums.mirthproject.io/forum/mirth-connect/support/13544-can-i-encrypt-a-file-in-gpg-using-mirth). This [wrapper](https://github.com/neuhalje/bouncy-gpg) may be useful, but no one vouched for it.

## 14. <a name='ExpandanattachmentIdreceivedfromanotherchannelsresponsetransformer'></a>Expand an attachmentId received from another channel's response transformer

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

## 15. <a name='Mirthlicensing'></a>Mirth licensing

Q1. Is CURES available under existing licenses or separate from other plugins?
A1. _Travis West_: "It is separate and requires Gold or Platinum bundles." (Essentially an upcharge in addition to platinum.)

## 16. <a name='minimalexampleusing_JSch_'></a>minimal example using_JSch_

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

## 17. <a name='Myintegrationof_lodash_isntfunctioningasexpected'></a>My integration of _lodash_ isn't functioning as expected

It matters which CDN you download its code from. [This one](https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js) was confirmed to work by _itsjohn_ on 10 Jan 2023.

## 18. <a name='IencounteroddStringandXMLerrorsintermittentlywhensendingbetweenchannels'></a>I encounter odd String and XML errors intermittently when sending between channels

Ensure you do not have a [xalan](https://mvnrepository.com/artifact/xalan/xalan) jar in your custom library. (_rogin_ to fill in what problems were presenting)

## 19. <a name='PerformancemetricsinAWS'></a>Performance metrics in AWS

Seen in 2022
"Can anyone point me in the direction of documentation/tips around best practice data pruner configuration settings? We have a server with > 1000 channels and millions of messages processed each day. We only store 5 days worth of data on each channel and prune daily, but the data pruner is taking over 32 hours to run with some individual channels taking over 45 minutes to prune about 209k messages and 2million content rows.  Database is MySQL running on an AWS RDS instance.  Is that the best I can expect the pruner to perform?  Am I better off pruning less often even though it will need to churn through more messages per run? Should I be tweaking the block size (currently set at 1000)?  Thanks for any pointers!"

same person:
"this instance is running on an AWS c5.12xlarge EC2 instance running linux and pointing to an AWS RDS r5.4xlarge MySQL DB. 1174 deployed channels with varying degrees of volume on them.  The server is mainly receiving messages via TCP and then writing out to a MSSQL DB so not a ton of complicated processing happening within the channels themselves."

## 20. <a name='IncludingsourceChannelIdswhenusingrouter.routeMessage'></a>Including sourceChannelId(s) when using router.routeMessage()

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

## 21. <a name='EnableJSmaplookupsbuthidethemappedvaluesfromthedashboardview'></a>Enable JS map lookups but hide the mapped values from the dashboard view

An interesting discussion 19 Dec 2022 to generate lookups but omit its confidential values from dashboard view.

_agermano_:

````javascript
var definitions = {a: 1, b: 2, c: 3, d: 1}
var hm = new java.util.HashMap(definitions)
var wrapper = Object.create(hm)
wrapper.toJSON = () => "No peeking!"
````

## 22. <a name='UnderstandXMLsnamevslocalName'></a>Understand XML's name() vs localName()

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

## 23. <a name='ReturnmultipleobjectsfromaJSreader'></a>Return multiple objects from a JS reader

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

## 24. <a name='ConvertTimestampESTtoPSTwithformatYYYYMMDDhhmmss'></a>Convert Timestamp EST to PST with format YYYYMMDDhhmmss

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

## 25. <a name='Auto-generatevalueforMSH.10'></a>Auto-generate value for MSH.10

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

_jonb_: other ideas

* Use the shell exec code template and ahh something something sed awk something the first 15 lines and dump those to a batch splitter
* I don’t think there is any way for the preprocessor to handle the CSV batch
* Use a RAW datatype instead of delimited first, grab the raw as an attachment. Don’t parse it as delimited until AFTER cutting the size down to 15 lines

## Info on Rhino (v1.7.13) in Mirth (vXXX)

_agermano_: like I said, the map[foo] should work in your current mirth version (I've tested it with rhino 1.7.13, but not actually in mirth)
when map is a java.util.Map
in prior rhino versions a js object is implemented with NativeObject and a java Map would have been represented by NativeJavaObject (basically a wrapper class.) rhino 1.7.13 introduced NativeJavaMap as a subclass of NativeJavaObject that adds this behavior.

agermano
  8 minutes ago
Also NativeJavaList, which allows you to access a java.util.List by index like a js array instead of using the get method.

## Thread-safety of global map

_chris_ was accessing the global map from channel deployments after noticing values not being in there when they should have been. Ultimately JS should NOT be considered thread-safe. Options listed were replacing the JS map with java.util.ConcurrentHashMap and ...
"When I create the map initially, I can attach a get method to it which just turns-around and fetches the thing via property-access.
That will allow me to go and hunt-down all the references in my js code and replace map[foo] with map.get(foo).
Then I can swap-out the object for the type I really want. In the meantime I still have all kinds of concurrency issues, but I don't have to stop-the-world to re-write all that code.
Yep, looks like object.get doesn't exist and defining it works as expected."

## 26. <a name='Channeldeploymenttips'></a>Channel deployment tips

9 Dec 2022
Issue: channel changes were not being deployed.
Solution: Be sure to undeploy the channel first as it resolved his issue.

## Blank messages and mappings in dashboard

User: messages are sent to the Channel and the channel send the messages to the destination channel. But when i look at the dashboard the Messages and the mappings are blank.
Solution: Review your 'message storage' and 'message pruning' configuration - perhaps it is set to remove content on completion.

## 27. <a name='Channeldevelopmenttips'></a>Channel development tips

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

### 27.1. <a name='Channelnamingconventions'></a>Channel naming conventions

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

## 28. <a name='Messagesearchingtips'></a>Message searching tips

* Set "page size" to 1 to greatly speed up queries you expect to contain only one result. (_pacmano_ 7 Dec 2022)

## 29. <a name='Createindexonmetadatacolumns'></a>Create index on metadata column(s)

By default, indices are not created for metadata columns.

### 29.1. <a name='Option1-1'></a>Option #1

_jonb_'s [gist](https://gist.github.com/jonbartels/38ffbb101ea32f981cc9950a21ec6809)

### 29.2. <a name='Option2-1'></a>Option #2

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

## 30. <a name='WhatdoesMirthencrypt'></a>What does Mirth encrypt?

_chris_: Does anyone know exactly what Mirth encrypts when you enable "Encryption" for a channel?
???

## 31. <a name='whydoIseedxxsetinresponseMapwithintheSourcemappings'></a>why do I see 'dxx' set in responseMap within the Source mappings?

Either a bug in the Mirth queries for map data, or perhaps it's the order of operations:

1. Message comes in
1. Source transformer runs
1. Source calls Destination Chain; Source waits till chain is done because no-queueing
1. Destination Chain executes Transformer for D20
1. D20 sends message
1. D20 response transformer runs <- responseMap is populated here
1. Destination Chain completes
1. Source looks at response map and sends responseMsg as a reply

## 32. <a name='RhinoshellforMirthConnect'></a>Rhino shell for Mirth Connect

Outlined by [_jonb_](https://gist.github.com/jonbartels/d8a1b789dd251e30c4a74baac3a3957a).

## 33. <a name='CanMirthprovideadailyvolumereport'></a>Can Mirth provide a daily volume report?

See _jonb_'s [SQL](https://gist.github.com/jonbartels/b961574b2043b628f1b0fd96f440179b).

## 34. <a name='CommonMirthneeds'></a>Common Mirth needs

### 34.1. <a name='Extractingazipfle'></a>Extracting a zip fle

See [forum](https://forums.mirthproject.io/forum/mirth-connect/support/15433-unzipping-files-in-mirth)

## 35. <a name='SimplifiedJavascript'></a>Simplified Javascript

### 35.1. <a name='FormatStringthatmaycontainadecimal'></a>Format String that may contain a decimal

_joshm_: take a string representation of a number that may or may not have decimals already and force it to be 2 decimal places (i.e 35 or 35.00 should both end up as 35.00)

Both _agermano_ and _Andy Murray_

````javascript
parseFloat(str).toFixed(2)
````

_joshm_ found fiddled a Java option

````javascript
var df = new java.text.DecimalFormat("0.00##");
return df.format(sumOfCharges);
````

## 36. <a name='AddHL7fieldsoutoforder'></a>Add HL7 fields out of order

[FixHL7NodeOrder.js](FixHL7NodeOrder.js) copied from [this comment](https://github.com/nextgenhealthcare/connect/issues/633#issuecomment-626857519)

Usage example

````javascript
msg = fixHL7NodeOrder(msg);
````

## 37. <a name='ChannelstatsmissingafterDBmigration'></a>Channel stats missing after DB migration

Initiator: _Bhushan U_ on 14 Nov 2022
Solution provider: _agermano_

Hello Team, I need some advice on migrating mirthconnect application with local postgresql database server from windows 2008 to windows 2012 server.
So far I did postgres database backup and restore plus mirthconnect configuration files backup and restore. But there is still some discrepancy between new server and old server.

Issue: channels stats not showing up after postgres database backup and restore then configuration files backup and restore
Reason: channels statistics are saved per server\.id
Solution: Update the current server\'s ID to that of the original server. See [user guide](https://docs.nextgen.com/bundle/Mirth_User_Guide_41/page/connect/connect/topics/c_Application_Data_Directory_connect_ug.html) for details.

## 38. <a name='Case-insensitiveJSONfields'></a>Case-insensitive JSON fields

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

## 39. <a name='Migratefile-backedconfigmapintoMirthDB'></a>Migrate file-backed config map into Mirth DB

See [_jonb_'s gist](<https://gist.github.com/jonbartels/4c4e0320f5596645b32bb1c38ac2d9c3>).

## 40. <a name='Comparerunningchannelsagainstamasterlist'></a>Compare running channels against a master list

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

## 41. <a name='GroupandSumusingJS'></a>Group and Sum using JS

_nafwa03_ on 17 Nov 2022

_nafwa03_'s commentary:
It\'s a super super useful code snippet. If you have to group and sum some json, you just use it like
var group = groupAndSum(formattedJSON, ['Office', 'Practitioner', 'PreviousBalance', 'PaymentsThisPeriod'],['Charges']);
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

## 42. <a name='Improvedchannelcloning'></a>Improved channel cloning

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

## 43. <a name='WhatisthelayoutofaMirthdatabase'></a>What is the layout of a Mirth database?

See [this ER diagram](https://github.com/kayyagari/connect/blob/je/mc-integ-tests/mc-db-tables.png).

## 44. <a name='Calculateaverageresponsetimeforagivenchannelsmessages'></a>Calculate average response time for a given channel's messages

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

## 45. <a name='ReportonSSLCertificateUsage'></a>Report on SSL certificate usage

_jonb_ rediscovering his own gist - "Is there a report for the NG SSL Manager that shows what channels are using a particular certificate?"

See [_jonb_'s gist](https://gist.github.com/jonbartels/f99d08208a0e880e2cee160262dda4c8).

## 46. <a name='ReadandmapMirthlicensingdata'></a>Read and map Mirth licensing data

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

## 47. <a name='Prunemessageswhileavoidingerroredmessages'></a>Prune messages while avoiding errored messages

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
