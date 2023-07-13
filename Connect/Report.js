//Source transformer
//=======================

if (msg['row'][1]) {
	$c('HasMessage','yes');
var yesterday = msg['row'][0]['column1'].toString();
var yesteryear = yesterday.split("-")[0];
var yestermonth = yesterday.split("-")[1];
var yesterdayday = yesterday.split("-")[2].slice(0,2);
var today = msg['row'][1]['column1'].toString();
var todayyear = today.split("-")[0];
var todaymonth = today.split("-")[1];
var todayday = today.split("-")[2].slice(0,2);
var todayHeader = todaymonth + '-' + todayday + '-' + todayyear;
var yesterdayHeader = yestermonth + '-' + yesterdayday + '-' + yesteryear;
} else {
		$c('HasMessage','no');
var todayRaw = DateUtil.getCurrentDate("yyyy-MM-dd");
var todayHeader = DateUtil.getCurrentDate("MM-dd-yyyy");
var yesterdayRaw = org.joda.time.format.DateTimeFormat.forPattern('yyyy-MM-dd').print((new org.joda.time.DateTime()).minusDays(1));
var yesterdayHeader = org.joda.time.format.DateTimeFormat.forPattern('MM-dd-yyyy').print((new org.joda.time.DateTime()).minusDays(1));
var today = todayRaw.toString() + 'T09:00:00.000-0500';
// var yesterday = yesterdayRaw.toString() + 'T09:00:00.000-0400';
// var today = todayRaw.toString() + 'T23:55:00.000-0400';
var yesterday = yesterdayRaw.toString() + 'T09:00:00.000-0500';
}
$c("Today",today);
$c("Yesterday",yesterday);
$c("todayHeader",todayHeader);
$c("yesterdayHeader",yesterdayHeader);

//3rd Destination Transformer
//===============================

// 			=======================================
// 				GENERATE REPORTS AND EMAIL
// 			=======================================

// get server info
var server = java.net.InetAddress.getLocalHost().getHostName();
var configurationController = Packages.com.mirth.connect.server.controllers.ConfigurationController.getInstance();
var serverSettings = configurationController.getServerSettings();
var environmentName = serverSettings.getEnvironmentName();
var serverName = serverSettings.getServerName();
$c("Server", server);
$c("ServerName", serverName);
$c("ServerEnv", environmentName);

// turn the API responses into new XML
var users = new XML($('usersList'));
var msg = new XML($('responseList'));

// get the length of the lists for purposes of iteration
var userlistLength = users['user'].length();
var listLength = msg['event'].length();

// create the user array for getting user name from the login id
var userArray = [];
for (var d = 0; d < userlistLength; d++) {
    var userName = users['user'][d]['username'].toString();
    var userId = users['user'][d]['id'].toString();
    userArray[userId] = userName;
}

// format for date/time(s)
function epochToTZ(epochSeconds, tz, pattern) {
    const {Instant, ZoneId, format: {DateTimeFormatter}} = java.time;
    return Instant.ofEpochSecond(epochSeconds)
        .atZone(ZoneId.of(tz))
        .format(DateTimeFormatter.ofPattern(pattern));
}

const epochToEastern = epochSeconds => epochToTZ(epochSeconds, 'America/New_York', 'uuuu-MM-dd HH:mm');

// =======================================
// REPORT FOR USER WHO Created New User
// =======================================

// create report title and header row
var createReport = '<table align=center><tr><td colspan=4 align=center><b>CREATED USER:</b></td></tr>';
createReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Created User</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Create new user') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var eventCreatedUser = msg['event'][i]['attributes']['entry']['string'][1].toString();

        createReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td>' + eventCreatedUser + '</td></tr>';
    }
}
createReport += '</table>';

// =======================================
// REPORT FOR USER WHO Removed User
// =======================================

// create report title and header row
var removeReport = '<table align=center><tr><td colspan=4 align=center><b>REMOVED USER:</b></td></tr>';
removeReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Removed User</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Remove user') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var removedUserId = msg['event'][i]['attributes']['entry']['string'][1].toString();

        removeReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td>' + removedUserId + '</td></tr>';
    }
}
removeReport += '</table>';

// =======================================
// REPORT FOR USER WHO Updated User
// =======================================

// create report title and header row
var updateUserReport = '<table align=center><tr><td colspan=5 align=center><b>UPDATED USER:</b></td></tr>';
updateUserReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Updated User ID</b></i></td><td><i><b>Updated User</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Update user') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var updatedUserRaw = msg['event'][i]['attributes']['entry'][1]['string'][1].toString();
        var updatedUserId = updatedUserRaw.substring(updatedUserRaw.lastIndexOf('id=') + 3, updatedUserRaw.lastIndexOf(',username='));
        var updatedUserName = updatedUserRaw.substring(updatedUserRaw.lastIndexOf('username=') + 9).slice(0, -2);
        updateUserReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td align=center>' + updatedUserId + '</td><td>' + updatedUserName + '</td></tr>';
    }
}
updateUserReport += '</table>';

// =======================================
// REPORT FOR USER WHO Updated A User's Password
// =======================================

// create report title and header row
var updateUserPassReport = '<table align=center><tr><td colspan=5 align=center><b>UPDATED USER PASSWORD:</b></td></tr>';
updateUserPassReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Affected User ID</b></i></td><td><i><b>Affected User</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Update a user\'s password') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var updatedPassUserId = msg['event'][i]['attributes']['entry']['string'][1].toString().trim();
        var updatedPassUserName = userArray[updatedPassUserId];

        updateUserPassReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td align=center>' + updatedPassUserId + '</td><td>' + updatedPassUserName + '</td></tr>';
    }
}
updateUserPassReport += '</table>';

// =======================================
// REPORT FOR USER WHO Updated a User's Preferences
// =======================================

// create report title and header row
var updateUserPrefReport = '<table align=center><tr><td colspan=5 align=center><b>UPDATED USER PREFERENCES:</b></td></tr>';
updateUserPrefReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Affected User ID</b></i></td><td><i><b>Affected User</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Set user preferences') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var updatedUserId = msg['event'][i]['attributes']['entry'][0]['string'][1].toString().trim();
        var updatedUserName = userArray[updatedUserId];

        updateUserPrefReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td align=center>' + updatedUserId + '</td><td>' + updatedUserName + '</td></tr>';
    }
}
updateUserPrefReport += '</table>';

// =======================================
// REPORT FOR USER WHO DEPLOYED CHANNELS
// =======================================

// create report title and header row
var depReport = '<table align=center><tr><td colspan=4 align=center><b>DEPLOYED CHANNELS:</b></td></tr>';
depReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Channel Name</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Deploy') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var channelInfo = msg['event'][i]['attributes']['entry'][2]['string'][1].toString();
        var channelName = channelInfo.substring(channelInfo.lastIndexOf('e=') + 2);
        channelName = channelName.slice(0, -2);
        if (channelName != undefined) {

            depReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td>' + channelName + '</td></tr>';
        }
    }

}
depReport += '</table>';

// =======================================
// REPORT FOR USER WHO UNDEPLOYED CHANNELS
// =======================================

// create report title and header row
var undepReport = '<table align=center><tr><td colspan=4 align=center><b>UNDEPLOYED CHANNELS:</b></td></tr>';
undepReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Channel Name</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Undeploy') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var channelInfo = msg['event'][i]['attributes']['entry'][1]['string'][1].toString();
        var channelName = channelInfo.substring(channelInfo.lastIndexOf('e=') + 2);
        channelName = channelName.slice(0, -2);
        if (channelName != undefined) {

            undepReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td>' + channelName + '</td></tr>';
        }
    }

}
undepReport += '</table>';

// =======================================
// REPORT FOR USER WHO STARTED CHANNELS
// =======================================

// create report title and header row
var startReport = '<table align=center><tr><td colspan=4 align=center><b>STARTED CHANNELS:</b></td></tr>';
startReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Channel Name</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Start channels') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var channelInfo = msg['event'][i]['attributes']['entry'][1]['string'][1].toString();
        var channelName = channelInfo.substring(channelInfo.lastIndexOf('e=') + 2);
        channelName = channelName.slice(0, -2);
        if (channelName != undefined) {

            startReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td>' + channelName + '</td></tr>';
        }
    }
}
startReport += '</table>';

// =======================================
// REPORT FOR USER WHO STOPPED CHANNELS
// =======================================

// create report title and header row
var stopReport = '<table align=center><tr><td colspan=4 align=center><b>STOPPED CHANNELS:</b></td></tr>';
stopReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Channel Name</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Stop channels') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var channelInfo = msg['event'][i]['attributes']['entry'][1]['string'][1].toString();
        var channelName = channelInfo.substring(channelInfo.lastIndexOf('e=') + 2);
        channelName = channelName.slice(0, -2);
        if (channelName != undefined) {

            stopReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td>' + channelName + '</td></tr>';
        }
    }
}
stopReport += '</table>';

// =======================================
// REPORT FOR USER WHO UPDATED CHANNELS
// =======================================

// create report title and header row
var updateChanReport = '<table align=center><tr><td colspan=4 align=center><b>UPDATED CHANNELS:</b></td></tr>';
updateChanReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td><td><i><b>Channel Name</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Update channel') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();
        var channelInfo = msg['event'][i]['attributes']['entry'][0]['string'][1].toString();
        var channelName = channelInfo.substring(channelInfo.lastIndexOf('name=') + 5).slice(0, 60);
        channelName = channelName.slice(0, -2);
        if (channelName != undefined) {

            updateChanReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td><td>' + channelName + '</td></tr>';
        }
    }
}
updateChanReport += '</table>';

// =======================================
// REPORT FOR USER WHO UPDATED CODE TEMPLATES
// =======================================

// create report title and header row
var updateCodeReport = '<table align=center><tr><td colspan=3 align=center><b>UPDATED CODE TEMPLATES:</b></td></tr>';
updateCodeReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Update code templates and libraries') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();

        updateCodeReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td></tr>';
    }
}
updateCodeReport += '</table>';

// =======================================
// REPORT FOR USER WHO PROCESSED MESSAGES
// =======================================

// create report title and header row
var processMessageReport = '<table align=center><tr><td colspan=3 align=center><b>PROCESSED MESSAGES:</b></td></tr>';
processMessageReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Process messages') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();

        processMessageReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td></tr>';
    }
}
processMessageReport += '</table>';

// =======================================
// REPORT FOR USER WHO REPROCESSED MESSAGES
// =======================================

// create report title and header row
var reprocessMessageReport = '<table align=center><tr><td colspan=3 align=center><b>REPROCESSED MESSAGES:</b></td></tr>';
reprocessMessageReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Reprocess messages') > -1) {
        var eventUserId = msg['event'][i]['userId'].toString();
        var eventUserName = userArray[eventUserId];
        //var eventTime = msg['event'][i]['dateTime'].toString();
        var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
        eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
        eventTimeStamp = eventTimeStamp.replace("Z", " ");
        var eventUserIp = msg['event'][i]['ipAddress'].toString();

        reprocessMessageReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td></tr>';
    }
}
reprocessMessageReport += '</table>';

// =======================================
// REPORT FOR UNSUCCESSFUL LOGIN ATTEMPTS
// =======================================

// create report title and header row
var unsuccessfulLoginReport = '<table align=center><tr><td colspan=3 align=center><b>FAILED LOGIN ATTEMPTS:</b></td></tr>';
unsuccessfulLoginReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Login') > -1) {
        if (msg['event'][i]['outcome'].indexOf('FAILURE') > -1) {
            //var eventUserId = msg['event'][i]['userId'].toString();
            //var eventUserName = userArray[eventUserId];
            //var eventTime = msg['event'][i]['dateTime'].toString();
            var eventUserName = msg['event'][i]['attributes']['entry']['string'][1].toString();
            var eventUserId = userArray.indexOf(eventUserName);
            var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
            eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
            eventTimeStamp = eventTimeStamp.replace("Z", " ");
            var eventUserIp = msg['event'][i]['ipAddress'].toString();

            unsuccessfulLoginReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td></tr>';
        }
    }
}
unsuccessfulLoginReport += '</table>';


// =======================================
// REPORT FOR SUCCESSFUL LOGIN
// =======================================

// create report title and header row
var successfulLoginReport = '<table align=center><tr><td colspan=3 align=center><b>SUCCESSFUL LOGINS:</b></td></tr>';
successfulLoginReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Login') > -1) {
        if (msg['event'][i]['outcome'].indexOf('SUCCESS') > -1) {
            //var eventUserId = msg['event'][i]['userId'].toString();
            //var eventUserName = userArray[eventUserId];
            //var eventTime = msg['event'][i]['dateTime'].toString();
            var eventUserName = msg['event'][i]['attributes']['entry']['string'][1].toString();
            var eventUserId = userArray.indexOf(eventUserName);
            var eventTime = msg['event'][i]['eventTime']['time'].toString();
     	   eventTime = eventTime - (7 * 60 * 60 * 1000);
	        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
            eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
            eventTimeStamp = eventTimeStamp.replace("Z", " ");
            var eventUserIp = msg['event'][i]['ipAddress'].toString();

            successfulLoginReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td></tr>';
        }
    }
}
successfulLoginReport += '</table>';



// =======================================
// REPORT FOR LOGOUT
// =======================================

// create report title and header row
var logoutReport = '<table align=center><tr><td colspan=3 align=center><b>LOGOUTS:</b></td></tr>';
logoutReport += '<tr><td><i><b>User Name</b></i></td><td><i><b>User ID</b></i></td><td><i><b>Timestamp</b></i></td></tr>';

// iterate through events and add to report
for (var i = 0; i < listLength; i++) {
    if (msg['event'][i]['name'].indexOf('Logout') > -1) {
        if (msg['event'][i]['outcome'].indexOf('SUCCESS') > -1) {
            var eventUserId = msg['event'][i]['userId'].toString();
            var eventUserName = userArray[eventUserId];
            //var eventTime = msg['event'][i]['dateTime'].toString();
            //var eventUserName = msg['event'][i]['attributes']['entry']['string'][1].toString();
            //var eventUserId = userArray.indexOf(eventUserName);
            var eventTime = msg['event'][i]['eventTime']['time'].toString();
        eventTime = eventTime - (7 * 60 * 60 * 1000);
        eventTime = eventTime.toString().slice(0, -3);
//        var eventTimeStamp = epochToEastern(eventTime);
          var eventTimeStamp = java.time.Instant.ofEpochSecond(eventTime);
            eventTimeStamp = eventTimeStamp.toString().replace("T", " ");
            eventTimeStamp = eventTimeStamp.replace("Z", " ");
            var eventUserIp = msg['event'][i]['ipAddress'].toString();

            logoutReport += '<tr><td>' + eventUserName + '</td><td align=center>' + eventUserId + '</td><td>' + eventTimeStamp + '</td></tr>';
        }
    }
}
logoutReport += '</table>';


// =======================================
// CREATE OUTBOUND REPORT AND SEND EMAIL
// =======================================

// add variables to the channel map
// $c("userList", JSON.stringify(userArray));
// $c("createReport", createReport);
// $c("removeReport", removeReport);
// $c("updateUserReport", updateUserReport);
// $c("updateUserPassReport", updateUserPassReport);
// $c("updateUserPrefReport", updateUserPrefReport);
// $c("depReport", depReport);
// $c("undepReport", undepReport);
// $c("startReport", startReport);
// $c("stopReport", stopReport);
// $c("updateChanReport", updateChanReport);
// $c("updateCodeReport", updateCodeReport);
// $c("processMessageReport", processMessageReport);
// $c("reprocessMessageReport", reprocessMessageReport);
// $c("unsuccessfulLoginReport", unsuccessfulLoginReport);
// $c("successfulLoginReport", successfulLoginReport);
// $c("logoutReport", logoutReport);

// create outbound report
var outReport = '<style> table, tr, td, th { border: 1px solid black; border-collapse: collapse; }</style>';
outReport += '<table align=center><tr><td align=center><h2><b>Mirth Administrative Events</b></h2></td></tr>';
outReport += '<tr><td align=center><b>' + environmentName + '&nbsp;&nbsp;&nbsp;&nbsp;' + serverName + '&nbsp;&nbsp;&nbsp;&nbsp;' + server + '</b><br><font size=-1><b>From: ' + $('yesterdayHeader') + ' 9am EST &nbsp;&nbsp;&nbsp; To: ' + $('todayHeader') + ' 9am EST</b></font></td></tr><tr><td><br>';
//outReport += '<tr><td align=center><b>' + environmentName + '&nbsp;&nbsp;&nbsp;&nbsp;' + serverName + '&nbsp;&nbsp;&nbsp;&nbsp;' + server + '</b><br><font size=-1><b>From: 03-01-2022 9am EST &nbsp;&nbsp;&nbsp; To: 03-10-2022 9am EST</b></font></td></tr><tr><td><br>';
outReport += createReport + '<br>' + removeReport + '<br>' + updateUserReport + '<br>' + updateUserPassReport + '<br>' + updateUserPrefReport + '<br>' + depReport  + '<br>' + undepReport + '<br>' + startReport + '<br>' + stopReport + '<br>' + updateChanReport + '<br>' + updateCodeReport + '<br>' + processMessageReport + '<br>' + reprocessMessageReport + '<br>' + unsuccessfulLoginReport + '<br>' + successfulLoginReport + '<br>' + logoutReport;
outReport += '</td></tr></table>';
$c("outReport", outReport);
