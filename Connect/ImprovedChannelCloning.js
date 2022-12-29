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