# NextGen Connect FAQs

## Calculate average response time for messages for a channel
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

## Add fields out of order
https://github.com/nextgenhealthcare/connect/issues/633#issuecomment-626857519

````javascript
msg = fixHL7NodeOrder(msg);

function fixHL7NodeOrder(node) {
	// Create output node
	var newNode = new XML();
	// In case the node is an XMLList of multiple siblings, loop through each sibling
	for each (sibling in node) {
		// Create new sibling node
		var newSibling = new XML('<'+sibling.name().toString()+'/>');
		// Iterate through each child node
		for each (child in sibling.children()) {
			// If the child has its own children, then recursively fix the node order of the child
			if (child.hasComplexContent()) {
				newSibling.appendChild(fixHL7NodeOrder(child));
			}
			// If the child doesn't have its own children, then just add the child to the new sibling node
			else {
				newSibling.appendChild(child);
			}
		}
		// After recursively fixing all of the child nodes, now we'll fix the current node
		newNode += sortHL7Node(newSibling);
	}
	// Return the fixed node
	return newNode;
}

// Helper function for fixHL7NodeOrder
function sortHL7Node(node) {
	// If the node has no children, then there's nothing to sort
	if (node.hasSimpleContent()) {
		return node;
	}
	// Create new output node
	var newNode = new XML('<'+node.name().toString()+'/>');
	// Iterate through each child in the node
	for each (child in node.children()) {
		// If the child has a QName, then we can sort on it
		if (child.name()) {
			// Get the current "index" of the child. Id est, if the QName is PID.3.1, then the index is 1
			curChildIndex = parseInt(child.name().toString().substring(child.name().toString().lastIndexOf('.')+1),10);
			// Boolean placeholder
			var inserted = false;
			// Iterate through each child currently in the NEW node
			for (var i = 0; i <= newNode.children().length()-1; i++) {
				// Get the index of the child of the new node
				loopChildIndex = parseInt(newNode.child(i).name().toString().substring(newNode.child(i).name().toString().lastIndexOf('.')+1),10);
				// If the child we want to insert has a lower index then the current child of the new node, then we're going to insert the child
				// right before the current newNode child
				if (curChildIndex < loopChildIndex) {
					// Insert the child
					newNode.insertChildBefore(newNode.children()[i],child);
					// Set our flag, indicating that an insertion was made
					inserted = true;
					// No need to continue iteration
					break;
				}
			}
				// If no insertion was made, then the index of the child we want to insert is greater than or equal to all of the
				// indices of the children that have already been inserted in newNode. So, we'll just append the child to the end.
				if (!inserted) {
					newNode.appendChild(child);
				}
		}
	}
	// Return the sorted HL7 node
	return newNode;
}
````
Imported Comment. Original Details:
Author: narupley
Created: 2011-12-22T08:20:30.000-0800


## Channel stats missing after DB migration
Initiator: @U04ARV2RZHB "Bhushan U" 14 Nov 2022
Solution provider: agermano

Hello Team, I need some advice on migrating mirthconnect application with local postgresql database server from windows 2008 to windows 2012 server.
So far I did postgres database backup and restore plus mirthconnect configuration files backup and restore. But there is still some discrepancy between new server and old server.

Issue: channels stats not showing up after postgres database backup and restore then configuration files backup and restore
Reason: channels statistics are saved per server.id
Solution: Update the current server\'s ID to that of the original server, https://docs.nextgen.com/bundle/Mirth_User_Guide_41/page/connect/connect/topics/c_Application_Data_Directory_connect_ug.html

## case-insensitive JSON fields

Initiator:
@itsjohn: Hi All, Is there. a way to make JSON payload fields case insensitive when mapping in Mirth so I can write msg['foo'] and Mirth accepts {"foo":""}, {"FOO":""} and {"Foo":""}

Solution by: agermano
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

## Report on SSL Certificate Usage
Details: https://gist.github.com/jonbartels/f99d08208a0e880e2cee160262dda4c8
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

## Write file-backed config map into Mirth DB
From @jonb in mirth slack on 4 Oct 2022

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

# Read and map Mirth licensing data
@jonb on mirth slack on 6 Oct 2022, seems to be a repost of an archived message.

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
    if (chState != null)	{
    	chState = chState.toString();
    }
    channelStatus[chName] = chState;
    $c(chName,chState);
 }

var sourceTry = JSON.stringify(channelStatus);
$c("SourceTry",sourceTry);
````

## foo
User nafwa03 on Mirth Slack 17 Nov 2022

nafwa03's commentary:
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
refactor by agermano 17 Nov 2022
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
https://mirthconnect.slack.com/archives/C02SW0K4D/p1668089121891089
Chris: Before my upgrade from 3.8.0 -> 4.1.1, I had a channel which I used to create other channels from templates. It clones the channel and then makes sure that various Code Template Libraries are copied along with them, and tags, too, since "channel clone" is IMO incomplete because it skips those things.

````javascript
var createdChannels = [];
var createdChannelIds = [];
var serverEventContext = com.mirth.connect.model.ServerEventContext.SYSTEM_USER_EVENT_CONTEXT;
var result = cloneSingleChannel('My Outbound Channel Template', shortenedSystemId, ['Testing'], serverEventContext);

createdChannelIds.push(result.getId());
createdChannels.push(result.getName());

setChannelLibrariesByName(createdChannelIds, ['Shared Integration', 'EHR Stuff'], serverEventContext);
setChannelGroupByName(createdChannelIds, 'PCC Practices', serverEventContext);

//helper functions
function cloneSingleChannel(templateChannelName, targetChannelName, tagNames, serverEventContext) {
  if(targetChannelName.length > 40) {
    throw "Channel name is too long (40 characters max): " + targetChannelName;
  }

  var channelCtl = com.mirth.connect.server.controllers.ControllerFactory.getFactory().createChannelController();

  var existingChannel = channelCtl.getChannelByName(targetChannelName);
  if(existingChannel)
    throw "Channel '" + targetChannelName + "' already exists";

  var newChannel = channelCtl.getChannelByName(templateChannelName);
  if(!newChannel)
    throw "Template channel '" + templateChannelName + "' does not exist";
  
  newChannel.setId(UUIDGenerator.getUUID());
  newChannel.setName(targetChannelName);
  newChannel.setRevision(0);
  var script = newChannel.getDeployScript();
  script = script.replaceAll('CLIENT_SYSTEM_ID_SHORTENED', shortenedSystemId).replaceAll('CLIENT_SYSTEM_ID', siteId);
  newChannel.setDeployScript(script);

  // Generate the proper channel "export data", which includes tags and pruning settings
  var tags = new java.util.ArrayList(); // Use ArrayList instead of [] because it must be mutable
  for(i=0; i<tagNames.length; ++i) {
    tags.add(new com.mirth.connect.model.ChannelTag(tagNames[i]));
  }
  newChannel.getExportData().setChannelTags(tags);
  var pruningSettings = new com.mirth.connect.model.ChannelPruningSettings();
  pruningSettings.setPruneMetaDataDays(45);
  var metadata = new com.mirth.connect.model.ChannelMetadata();
  metadata.setEnabled(true);
  metadata.setPruningSettings(pruningSettings);

  newChannel.getExportData().setMetadata(metadata);

  channelCtl.updateChannel(newChannel, serverEventContext, false);

  return newChannel;
}

function setChannelLibrariesByName(channelIds, libraryNames, serverEventContext) {
  var codeLibraryCtl = com.mirth.connect.server.controllers.ControllerFactory.getFactory().createCodeTemplateController();
  var updateLibraries = false;
  var libraries = codeLibraryCtl.getLibraries(null, false);

  for(var library in Iterator(libraries)) {
    var channels = library.getEnabledChannelIds();

    for(j=0; j<channelIds.length; ++j) {
    	 var channelId = channelIds[j];
      // Add '' to libraryNames.getName to ensure we are searching for the right kind of object (string) in libraryNames
      if(libraryNames.includes(library.getName() + '')) { // Use [].includes for javascript arrays
        if(!channels.contains(channelId)) { // Use Collection.contains for Java collections
          channels.add(channelId);
          updateLibraries = true;
          logger.debug('Will add channel ' + channelId + ' to library ' + library.getName());
        }
      } else {
        if(channels.contains(channelId)) {
           logger.debug('Will remove channel ' + channelId + ' from library ' + library.getName());
           channels.remove(channelId);
           updateLibraries = true;
        }
      }
    }
  }

  if(updateLibraries) {
    var result = codeLibraryCtl.updateLibraries(libraries, serverEventContext, false);

    if(!result) {
      logger.error('Failed to update code libraries');
    }

    return result;
  } else {
    logger.debug('No code-library updates are necessary.');
    return true; // All is well
  }
}

function setChannelGroupByName(channelIds, groupName, serverEventContext) {
  var channelCtl = com.mirth.connect.server.controllers.ControllerFactory.getFactory().createChannelController();
  var updateGroups = false;
  var groups = channelCtl.getChannelGroups(null);

  for(var group in Iterator(groups)) {
    var channels = group.getChannels();

    for(j=0; j<channelIds.length; ++j) {
      var found = false;
    	 var channelId = channelIds[j];

      for(k = channels.iterator(); k.hasNext(); ) {
        var channel = k.next();

        if(channelId.equals(channel.getId())) {
          found = true;

          if((group.getName() + '') == groupName) {
            logger.debug('Channel ' + channelId + ' is already in group ' + group.getName());
            // Do nothing; already in the right place
          } else {
            logger.debug('Will remove channel ' + channelId + ' from group ' + group.getName());
            k.remove();
            updateGroups = true;
          }
        }
      }

      if(!found && (group.getName() + '') == groupName) {
        logger.debug('Will add channel ' + channelId + ' to group ' + group.getName());
        channels.add(new com.mirth.connect.model.Channel(channelId));
        updateGroups = true;
      }
    }
  }


  if(updateGroups) {
    // updateChannelGroups requires a Set<>, and the "removedChannelGroupIds" must not be null
    var result = channelCtl.updateChannelGroups(new java.util.HashSet(groups), new java.util.HashSet(), false);

    if(!result) {
      logger.error('Failed to update channel groups');
    }

    return result;
  } else {
    logger.debug('No channel group updates are necessary.');
    return true; // All is well
  }
}
````
## Prune while avoiding errored messages
2 Sept 2022
Commenter:
This is close but its still deleting too much content.
The goal is
- "do not delete anything for any connector on an errored message"
- "for any not errored message, delete everything except the raw source message and source map"

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