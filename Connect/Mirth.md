# NextGen Connect FAQs

## Others tracking FAQs

See [_jonb_'s useful gists](<https://gist.github.com/jonbartels>) which overlap here in some areas. His SSL writeup is excellent.

## Other projects on github using Mirth?

See [my list](https://github.com/stars/rogin/lists/mirth-related) that others in Mirth Slack found useful.

## minimal example using _JSch_

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

Seen in 2022
"Can anyone point me in the direction of documentation/tips around best practice data pruner configuration settings? We have a server with > 1000 channels and millions of messages processed each day. We only store 5 days worth of data on each channel and prune daily, but the data pruner is taking over 32 hours to run with some individual channels taking over 45 minutes to prune about 209k messages and 2million content rows.  Database is MySQL running on an AWS RDS instance.  Is that the best I can expect the pruner to perform?  Am I better off pruning less often even though it will need to churn through more messages per run? Should I be tweaking the block size (currently set at 1000)?  Thanks for any pointers!"

same person:
"this instance is running on an AWS c5.12xlarge EC2 instance running linux and pointing to an AWS RDS r5.4xlarge MySQL DB. 1174 deployed channels with varying degrees of volume on them.  The server is mainly receiving messages via TCP and then writing out to a MSSQL DB so not a ton of complicated processing happening within the channels themselves."

## Send additional data with router.routeMessage

2 Jan 2023

Issue: user expressed using routeMessage() didn't send 'sourceChannelId(s)' and 'sourceMessageId(s)' like direct channel-to-channel does.

Solution #1: It's a [requested feature](https://github.com/nextgenhealthcare/connect/issues/5293)
Solution #2: create a new destination that filters on the existing logic you're using for routeMessage()
Solution #3: Link in Situation #1 also has a code solution, but it's a manual addition.
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

## Channel naming conventions

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

## Channel deployment tips

9 Dec 2022
A user noticed that his channel changes were not being deployed. Be sure to undeploy the channel first as it resolved his issue.

## Channel development tips

* Set your response data type to RAW. That will force your response transformer code to always execute no matter what. (_joshm_ 7 Dec 2022)
** user's code to error after X send attempts was failing, needed this [to resolve](https://github.com/nextgenhealthcare/connect/discussions/4795). (29 Dec 2022)

## Message searching tips

* Set "page size" to 1 to greatly speed up queries you expect to contain only one result. (_pacmano_ 7 Dec 2022)

## Create index on metadata column(s)

By default, indices are not created for metadata columns.

### Option #1

_jonbartels_' [gist](https://gist.github.com/jonbartels/38ffbb101ea32f981cc9950a21ec6809)

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

## Add HL7 fields out of order

[FixHL7NodeOrder.js](FixHL7NodeOrder.js) copied from [this comment](https://github.com/nextgenhealthcare/connect/issues/633#issuecomment-626857519)

Usage example

````javascript
msg = fixHL7NodeOrder(msg);
````

## Channel stats missing after DB migration

Initiator: _Bhushan U_ on 14 Nov 2022
Solution provider: agermano

Hello Team, I need some advice on migrating mirthconnect application with local postgresql database server from windows 2008 to windows 2012 server.
So far I did postgres database backup and restore plus mirthconnect configuration files backup and restore. But there is still some discrepancy between new server and old server.

Issue: channels stats not showing up after postgres database backup and restore then configuration files backup and restore
Reason: channels statistics are saved per server\.id
Solution: Update the current server\'s ID to that of the original server, see [user guide](https://docs.nextgen.com/bundle/Mirth_User_Guide_41/page/connect/connect/topics/c_Application_Data_Directory_connect_ug.html).

## Case-insensitive JSON fields

Initiator:
@itsjohn: Hi All, Is there. a way to make JSON payload fields case insensitive when mapping in Mirth so I can write msg['foo'] and Mirth accepts {"foo":""}, {"FOO":""} and {"Foo":""}

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

_jonb_ on 4 Oct 2022

I wrote a channel that reads the current config map and then writes it to the Mirth DB so that you can switch from file backed config maps to DB backed config maps.
Just let the code run in a JS Reader and then flip the mirth.properties entry whenever you are ready to change over.

````javascript
// read mirth.properties and check the configurationmap.location property
var classpathResource = com.mirth.connect.server.tools.ClassPathResource.getResourceURI('mirth.properties');
var propsInputStream;
var configmapLocation = 'Could not read!';
try {
    propsInputStream = new java.io.FileInputStream(classpathResource.getPath());
    var serverProps = new java.util.Properties();
    serverProps.load(propsInputStream);
    configmapLocation = serverProps.getProperty('configurationmap.location');
} finally {
    if(propsInputStream) {
        Packages.org.apache.commons.io.IOUtils.closeQuietly(propsInputStream);  
    };
}
logger.error(channelName + " read config location as: " + configmapLocation);
globalChannelMap.put('configmapLocation', configmapLocation);
//if its DB undeploy ourselves
if(configmapLocation == 'database'){
    logger.info(channelName + " Detected 'database' configmap location. Channel is undeploying itself");
    ChannelUtil.undeployChannel(channelName);
}
//if its file then dump our own serialized config
if(configmapLocation == 'file'){
    var configController = com.mirth.connect.server.controllers.ControllerFactory.getFactory().createConfigurationController();
    var configMap = configController.getConfigurationProperties();
    //persist to DB
    //this is the same call that MC makes internally when saving to the DB
    configController.saveProperty(
        com.mirth.connect.server.controllers.DefaultConfigurationController.PROPERTIES_CORE, 
        "configuration.properties", 
        com.mirth.connect.model.converters.ObjectXMLSerializer.getInstance().serialize(configMap)
    );
}
return "Saved configmap. Detected configmap location as: " + configmapLocation;
````

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

## Improved channel cloning

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

## Report on SSL Certificate Usage

Details: <https://gist.github.com/jonbartels/f99d08208a0e880e2cee160262dda4c8>
Solution:

```sql
with channel_xml as (
  select 
  name, 
  xmlparse(document channel) as channel_xml
  from channel c )
select
  unnest(xpath('//trustedCertificates/trustCACerts/text()', channel_xml))::TEXT as trust_ca_certs,
  unnest(xpath('//trustedCertificates/trustedCertificateAliases/string/text()', channel_xml))::TEXT as trusted_cert_alias,
  unnest(xpath('//localCertificateAlias/text()', channel_xml))::TEXT as private_alias,
  unnest(xpath('//keyAlias/text()', channel_xml))::TEXT as interop_alias --update from rbiderman in Slack. Thanks dude!
  array_agg(name) as channel_names
from channel_xml
group by 1,2,3,4;
```

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
