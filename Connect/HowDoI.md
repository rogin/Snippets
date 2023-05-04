# How Do I

As the main page was getting too large, this will house the samples and links to other solutions.

## Update a legacy Mirth forum link

_jonb_: Given __<https://www.mirthcorp.com/community/forums>__/showthread.php?t=8783, replace with __<https://forums.mirthproject.io>__/showthread.php?t=8783

## Use Derby DB in production environment

Don't, not even for development.

_jonb_: Postgres is what NextGen uses internally in their paid appliance offerings

## Determine the Message Pruning setting of each channel

See [here](https://github.com/nextgenhealthcare/connect/discussions/5389#discussioncomment-3497635).

## Generate a Mirth-compatible cron expression

Create a Quartz expression [here](https://www.freeformatter.com/cron-expression-generator-quartz.html).

## Trigger channel alert that does NOT match a regex (using negative lookahead)

_Shane Dewitt_
I have a channel alert that triggers off a regex. I want to create a second alert to trigger off any error that does not contain the regex string from the previous alert.

_agermano_
you could probably use negative lookahead
Try this `(?s)\A(?:(?!Failed to Save Report because Error Object was not available\.).)*\Z`
[Sample regex](https://regex101.com/r/BUE9s7/1)
[SO link](https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word)
you can use `^` and `$` instead of `\A` and `\Z` when the `m` flag is not set, but I don't know what flags mirth uses by default.

## Grab channels stats using API via JS

_stormcel_
I usually hit the Mirth API from a HTTPS destination and process the results in a further destination, but for this project I need a javascript solution to grab the stats from the Mirth API.

* grab channel stats from an external mirth server
* initially used JS reader to make the channel less 'chatty'. it's supposed to collect stats every 2 hours, but only email twice a day. I was hoping that I could use `destinationSet` logic to control the overhead.

_pacmano_
[SO link](https://stackoverflow.com/questions/61649942/mirth-http-post-request-with-parameters-using-javascript)
That should help - but it’s truly easier just to call it in a destination.

_joshm_
this should get you logged in, then you can use the jsession cookie to make subsequent requests.

````javascript
function loginMirth(url, body){
 var provider = new Packages.org.apache.http.impl.client.BasicCredentialsProvider();
 var credentials = new Packages.org.apache.http.auth.UsernamePasswordCredentials(configurationMap.get("mirthAPIUsername"), configurationMap.get("mirthAPIPassword"));
 provider.setCredentials(Packages.org.apache.http.auth.AuthScope.ANY, credentials);

 var sslContext = Packages.org.apache.http.conn.ssl.SSLContexts.custom()
        // .loadKeyMaterial(keyStore, keyPassphrase.toCharArray())
         .loadTrustMaterial(null, new Packages.org.apache.http.conn.ssl.TrustSelfSignedStrategy())
         .build();

 var sslsf = new Packages.org.apache.http.conn.ssl.SSLConnectionSocketFactory(sslContext, null, null, new Packages.org.apache.http.conn.ssl.NoopHostnameVerifier());

 // create Http Client
 var httpClient = Packages.org.apache.http.impl.client.HttpClients.custom()
  .setSSLSocketFactory(sslsf)
  .setDefaultCredentialsProvider(provider)
  .build();

 // create http get request using url
 var request = new Packages.org.apache.http.client.methods.HttpPost(url);
 request.setConfig(getRequestConfig());
 // set auth header with bearer token
 request.addHeader('Content-type', 'application/x-www-form-urlencoded');
 request.addHeader('X-Requested-With', 'OpenAPI');
 request.addHeader('accept', 'application/xml');

 if(body != null){
  var entity = new Packages.org.apache.http.entity.StringEntity(body); 
  request.setEntity(entity);
 }
 // execute http get
 var resp = httpClient.execute(request);

 // check response
 var statusLine = resp.getStatusLine();
 var statusCode = statusLine.getStatusCode();
 var statusReason = statusLine.getReasonPhrase();
 if(statusCode >= 300){
  logger.error('failed to call loginMirth, status = ' + statusReason + ', code = ' + statusCode);
  throw "Failed to execute HTTP Post. Status Code: " + statusCode + ". Reason: " + statusReason + ". Response: " + Packages.org.apache.commons.io.IOUtils.toString(resp.getEntity().getContent(), "UTF-8");
 }
 var header = resp.getFirstHeader("Set-Cookie").getValue()+"";
 var jsession = header.split("=")[1].split(";")[0];
 //TODO: accept a parameter for the `$g` var name to put
 globalMap.put("jsession", jsession);
 return jsession;
}
````

_agermano_
You could probably do this with two destinations. have the SMTP destination depend on the stats collection destination, but remove the SMTP destination from the destinationSet on the runs where you don't want it to fire off an email.

_pacmano_
I run a channel every minute that populates a `$g` var with stats, joining the channel ID to its name. Then a channel the checks errors counts and emails on some threshold and sends a stat email based on a configurable threshold. Other channels may be interested in that `$g` var also. if an error alert has been sent once, it will not send again (escalation is handled in another system). I don’t call the API via JS, instead use two destinations (one to get stats, one to get list of channels to map UID to name). I hit channels to get all channels then:

````javascript
$c('array_of_stats',
JSON.parse(responseMap.get('api/channels/statistics').getMessage()).list.channelStatistics.map(function (stat) {
  return {
    // channelId: stat.channelId,
    name: msg.map.entry.find(ele => ele.string[0] === stat.channelId).string[1],
    received: stat.received,
    sent: stat.sent,
    error: String(stat.error), // I don’t remember why String() was necessary
    filtered: stat.filtered,
    queued: stat.queued
  }
})
)
````

i.e. get the response from the stats call and fix it up with the actual channel name. The above code is in the second destination's response transformer. In my prod code, I also sort that array by number of errors, build an html email, and send it with only the channels that meet the error threshold.

## Convert PDF to TIF

_pacmano_
no extra libraries needed, mirth 4.0.1

````javascript
var PDFRenderer = Packages.org.apache.pdfbox.rendering.PDFRenderer;
var PDDocument = Packages.org.apache.pdfbox.pdmodel.PDDocument;
var BufferedImage = Packages.java.awt.image.BufferedImage;
var ImageIO = Packages.javax.imageio.ImageIO;
var File = Packages.java.io.File;

// Function to convert PDF to TIF
function convertPdfToTif(pdfPath, outputDir) {
    var document = PDDocument.load(new File(pdfPath));
    var renderer = new PDFRenderer(document);
    var pageCount = document.getNumberOfPages();

    for (var i = 0; i < pageCount; i++) {
        var image = renderer.renderImageWithDPI(i, 150); // Render the PDF page at 150 DPI
        var outputFile = new File(outputDir + '/page-' + (i + 1) + '.tif');
        ImageIO.write(image, 'TIFF', outputFile);
    }
    document.close();
}

// Call the function with appropriate file paths
var pdfPath = '/tmp/mac.pdf';
var outputDir = '/tmp';
convertPdfToTif(pdfPath, outputDir);
````

## Connect to S3

Initiated by _Gio_ using v1 of the AWS Java SDK

````javascript
var awsProfile = new Packages.com.amazonaws.auth.InstanceProfileCredentialsProvider();
var s3client = new Packages.com.amazonaws.services.s3.AmazonS3Client(awsProfile);
````

He didn't need accesskey nor secretkey as he's using ec2Role.

_joshm_
use the built-in S3 packages (v2.x) which changed the full package names (from v1). you don’t need external jars. You would just want to replace your credentials provider class

````javascript
function getS3Client2() {
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

## Retrieve a file from S3 bucket

_Felipe Nazal_: Has anyone used Mirth to retrieve a file from S3 bucket without passing secret and access key, because ec2 instance role has already access to S3. I need to do it inside of the transformer, thanks!

_narupley_: The File Reader/Writer supports all of that out of the box, see here for everything we do: [S3Connection.java](https://github.com/nextgenhealthcare/connect/blob/development/server/src/com/mirth/connect/connectors/file/filesystems/S3Connection.java)
But honestly we're not doing much special, just following the AWS SDK docs
If you use DefaultCredentialsProvider then that gets you what you want, it'll automatically search for credentials in the standard places like env vars or an ec2 instance role
Everything you need for connecting to S3 should already be included
[Developer Guide](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/home.html)
[S3 package](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/package-summary.html)
You could also just use the internal Mirth Connect classes directly like `var s3Connection = new com.mirth.connect.connectors.file.filesystems.S3Connection(...)`

Though doing that could break your script in the future if we ever change stuff in that class

## Backup my Mirth channels

See [here](https://github.com/nextgenhealthcare/connect/discussions/5374#discussioncomment-3531926) for a list of options used by experienced users.

## Fix a channel's "Last Modified" changing every minute

_Matt Weig_
Looking at the channels view, I have a couple channels where the "Last Modified" date/time changes every minute. However nothing is actually changing on the channel itself.
Happens on 3.6.1 and 4.2

_Richard_
The channel export was missing the "lastModified" element. Adding it and re-importing resolved. No one dug into how Mirth created an export with that field missing.

## Secure a FHIR API using Keycloak

_Genarro_
To secure a FHIR API in Mirth via OAuth, has anyone used a combination of Keycloak and a Mirth HTTP listener channel with Authentication being set to OAuth 2.0 Token Verification?

_joshm_
I’ve not used the OAuth 2.0 Token Verification but I have used a custom JS script for Keycloak with an http listener

_Genarro_
Did you import the Keycloak JS library into a code template?

_joshm_
No I used a custom code template and a specific jar file.
Here’s the function I ended up using. My `keycloakVerifyUrl` ends in `/protocol/openid-connect/userinfo`. For this part, I didn’t need any external libraries. In my source connector, I added a custom script that calls this function and returns either `AuthenticationResult.Success()` or `AuthenticationResult.Failure()` based on the return value of my validate function.

````javascript
function validateKeyCloakToken(token) {
 var client = null;
 var resp = null;
 try {
  var url = configurationMap.get("keycloakVerifyUrl");
  
  var sslContext = Packages.org.apache.http.conn.ssl.SSLContexts.custom()
          .loadTrustMaterial(null, new Packages.org.apache.http.conn.ssl.TrustSelfSignedStrategy())
          .build();
  var supportedProtocalArray = ["TLSv1.3","TLSv1.2"]; 
  var sslsf = new Packages.org.apache.http.conn.ssl.SSLConnectionSocketFactory(sslContext, supportedProtocalArray, null, new Packages.org.apache.http.conn.ssl.NoopHostnameVerifier());
 
  //build client
  var httpClient = Packages.org.apache.http.impl.client.HttpClients.custom()
    .setSSLSocketFactory(sslsf)
    .build();
  
  //create a request for of POST for the submission
  var httpPost = new Packages.org.apache.http.client.methods.HttpPost(url);
 
  httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");
  httpPost.addHeader("Authorization", "Bearer " + token);

  //execute post and get response   
  var resp = httpClient.execute(httpPost);
 
  var respString = Packages.org.apache.commons.io.IOUtils.toString(resp.getEntity().getContent(), "UTF-8");
  //logger.info("token userinfo:  " + respString);
  // check response
  var statusLine = resp.getStatusLine();
  var statusCode = statusLine.getStatusCode();
  var statusReason = statusLine.getReasonPhrase();
  if(statusCode >= 300){
   return false;
  }
 
  return true;
 }
 catch(exp){
  logger.error(channelName + " - Failed keycloak token verification. Exception - " + exp);
 }
 finally{
  if(resp != null){
   resp.close();
  }
  if(client != null){
   client.close();
  }
 }
 return false;
}
````

## Resolve phantom channel dependencies

A JIRA ticket was created by _Judith Epstein_ 12 April 2023.

_Richard_
Using Mirth v3.12, is there a UI hack to remove phantom channel dependencies? When I export certain channels, they have an extra ID listed under `<dependencyIds>` which don't show in the "Set Dependencies" UI list. I can remove all the dependency channels in the UI, save the channel, re-add the deps, export the channel, and the phantom remains.

_jonb_
Probably yes - The channel deps are stored in an XML blob in the config table and not with the channel itself. Nuke that row from the XML blob, save the blob back, and it’ll probably be sorted.

## Convert HL7 v2 messages to FHIR Resources

_Arun Kumar P_ on 11 April 2023
We are looking at converting HL7 v2 messages to FHIR Resources. We do not have the budget to buy the commercial add-on.
Can you please guide me on

* High level design
* Sample Programs
* Do’s and Dont’s

_Richard_
here's [a link](Mirth.md#sample-message-transformations) to sample message conversions that was recommended recently.

_joshm_
there’s no easy button either way. Commercial add-on or not. The simplest way is to break down what resources you need and look at example FHIR resources and manually build your JSON based on those examples
I can tell you from first-hand experience, I spent a few hundred hours mapping a single transaction type into all of the appropriate FHIR Resources. Once you get some of the basics though, you do get some reuse if you build code templates and functions correctly. Build yourself some commonly reused functions to map common data types. Then go up from there to common segments like “PID”, “GT1", “PV1”, etc that you know you are likely to see in multiple message types.

_Kirby Knight_
Azure has a [conversion tool](https://learn.microsoft.com/en-us/azure/healthcare-apis/fhir/convert-data).  I have just done minimal testing with it and have not used it in production.

_Mitch Trachtenberg_
Although I haven't investigated [this](https://github.com/LinuxForHealth/hl7v2-fhir-converter), you might want to.

## Know which JS functions are available with my version of Mirth

For example, I want to use `array.includes()`.

See [here](https://mozilla.github.io/rhino/compat/engines.html) for Rhino version implementations. To continue our example, `array.includes()` started in Rhino v1.7.12. From here you can either match your Rhino's versioned jar under `mirth_home/server-lib/`, e.g. `rhino-1.7.13.jar`, or click [here](https://github.com/nextgenhealthcare/connect/blob/development/client/.classpath), then select the drop down for the version you want to investigate. We can see that the [3.10.x](https://github.com/nextgenhealthcare/connect/blob/3.10.x/client/.classpath) line first began using Rhino v1.7.12.

MC v3.12 uses Rhino v1.7.12.
MC v4.2 uses Rhino v1.7.13.

## Include a polyfill for `array.includes()`

_chris_:

````javascript
// Mirth 3.6.0 and earlier do not support Array.includes, so we add it ourselves.
if(!Array.prototype.includes) {
  logger.info('Installing Array.prototype.includes');
  Array.prototype.includes = function(el) {
    for(var i=0; i<this.length; ++i) {
      if(this[i] == el) {
        return true;
      }
    }
    return false;
  }
}
````

## Handle a custom SOAP message

You can use a Web Server Listener for the custom SOAP message, but it will need it's own Java class. But you can emulate that functionality in a regular HTTP Listener.

## Send fileset daily via Mirth

_Kit_ on 7 March 2023
is it possible to get Mirth to send the same set of messages every day without using another tool like windows scheduler to do the scheduling?
So we have a few servers that gets redeployed every day with their sample data getting reset each time.
I want to be able to send a set of HL7 to some of these servers that will create a bunch of ie. clinic appointments over the next month or so
so I think ideally I would have a bunch of text files with the messages in them, then each day Mirth would pick them up, go through some transforms etc. to ensure the dates are correct, and then send them onwards

_pacmano_
All source connectors that end in “reader” can be scheduled.

_Kit_
ah ok, so if I set up a file reader to poll once a day, and do not get it to move the files when processing, then it will re-process the same messages every day?

_pacmano_
yup

## Export DICOM images

_Gio_
Do we know why this happens? "`Error: Cannot export DICOM attachments.`"
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

## Ensure a HTTP sender destination hits the http server in order of the queue

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

## See the full runtime JS code

See _odoodo_'s [code comment](https://github.com/nextgenhealthcare/connect/discussions/4847#discussioncomment-2251713).

## Return an HTTP response from a source filter

_chris_
I have an HTTP listener and I'm adding a source Filter. Can I return an HTTP response from the filter itself?

The current response is coming from the one-and-only-one Destination.

[Forum link](https://forums.mirthproject.io/forum/mirth-connect/support/18611-custom-response-message-creation-after-source-filter-step-itself) looks promising.

It looks like I can use the post-processor to select between two different responses: either one triggered by the source-filter (stuff something into the channelMap?) or by returning the destination's usual response. How do I say "give me the destination's response" in the post-processor??

_pacmano_
Building `$r` as the message traverses the channel and responding with that (via respond from drop down) seems the most intuitive to me.    Alternatively building a `$c` var and returning that in the postprocessor is another option (picking post processor in drop down).

_chris_
So, tell the channel I want to use `$foo` as my response and just set `$foo` in either the source filter OR the destination? Which map do I want to use for that purpose?

_pacmano_
`$c` works. `$r` is intended for that purpose of course and is visible on the respond from drop down.  

_chris_
Is the responseMap visible from the source transformer? Looks like the answer is "yes".

## Add HL7 fields out of order

[FixHL7NodeOrder.js](FixHL7NodeOrder.js) copied from [this comment](https://github.com/nextgenhealthcare/connect/issues/633#issuecomment-626857519). [This code template](https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Fix%20HL7%20Node%20Order) may be more up-to-date and complete.

Usage example

````javascript
msg = fixHL7NodeOrder(msg);
````

## Merge HL7 subcomponent text

Originator: _Anibal Jodorcovsky_, March 2023

His client is sending this faulty data, and while they're tasked with fixing, he is providing an interim solution.

I have somebody sending me "invalid" HL7 with "&" in one of the segments. `ORC-8.1` is `Printset: CTA HEAD & NECK W/CONTRAST`. So, when I extract `msg['ORC']['ORC.8']['ORC.8.1']`, I get `<ORC.8><ORC.8.1><ORC.8.1.1>Printset: CTA HEAD </ORC.8.1.1><ORC.8.1.2> NECK W/CONTRAST</ORC.8.1.2></ORC.8.1></ORC.8>`.  I want to be able to obtain the string `Printset: CTA HEAD & NECK W/CONTRAST`.

_chris_ IMO best place to do this is in the preprocessor. Just look for that exact string and replace it.

_MikeH_ with [this gist](https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Join%20HL7%20Subcomponents) and the following:

````javascript
//example usage
msg['OBR']['OBR.4']['OBR.4.2'] = joinSubcomponents(msg['OBR']['OBR.4']['OBR.4.2'],'&').replace("&","\\t\\")
````

Essentially:

* Get the contents of your field into a string
* Replace the ampersand with the appropriate HL7 substitution
* Save the updated string back to the msg

## Delete from XMLLists

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
If xml/hl7, I delete via for loop in reverse order. deleting a segment messes up the array offset which does not happen if you do it in reverse order,

_agermano_:

````javascript
for each (var obx in msg.OBX) {
  if (condition) {
    delete obx[0]
  }
}
````

Without the index you are deleting the reference to the xml object. With the index tells it to delete from the object to which obx refers. you don't need a counter, just always use index 0 in the for each loop, and it will delete the current object, because e4x is weird. e4x intentionally blurs the line between a single object, and a list with a single element. it also does a lot of magic so when you delete an element from a document, it automatically reindexes all of the other children so as to not leave any gaps.

if you have a javascript `array [1,2,3,4,5]`, and you `delete array[1]`, you'll end up with `[1,undefined,3,4,5]`. e4x will shift everything following the deleted element to the left, though and in e4x, each element is aware of its position in the parent node which can be used via xmlNode.childIndex().

those child indexes all get updated after a delete (which is part of the reason e4x is slow with large documents). if you're deleting in an indexed for loop, it's definitely better to start from the back and work forward, otherwise you need to decrement your index after you delete so that when it increments at the end of the loop it reads the same element (due to the left shift thing that happens).

in a normal javascript array it's better to just use a filter rather than delete in a for loop. I made an xml filter function that could work here, too. I always try to avoid deletes.

[Connect Example - Filter XMLLists](https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Filter%20XMLLists)

If all of your OBX segments are contiguous, you can use this: `msg.OBX = xFilter(msg.OBX, obx => condition)`. it's one of the few functions I have in my global code template library

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
The second line appends the jar to the end of the classpath at startup. This is an option used by the install4j launcher and not directly passed to the jvm._

### Option 3

Use the newer libraries
"The main libraries used now are openhtmltopdf running on top of PDFBox 2.x" and the "new lib also supports svg graphics".

## Access HTTP Listener request headers and metadata, setting custom response codes

See [this response](https://forums.mirthproject.io/forum/mirth-connect/support/10305-access-request-headers-in-http-listener?p=69586#post69586).

## Hash files (MD5 or other)

### Option 1 -- v4.2+

(VERIFY) As of v4.2, Mirth will auto-generate a message hash value (which can be pulled from the right-side of the the UI as `Hash`), and users can access the Mirth hashing util class to perform on desired message segments.

### Option 2 -- pre-v4.2

See [this response](https://forums.mirthproject.io/forum/mirth-connect/support/13366-md5-hashing?p=81191#post81191) on using Guava.

_agermano_: Be sure your RAW content is Base64 decoded before hashing - use either _msg_ or _connectorMessage.getRawData()_.

_NickT_'s working sample

````javascript
var decodedData = FileUtil.decode(msg);
var hasher = Hashing.md5().newHasher();
var hash = hasher.putBytes(decodedData).hash().toString();

logger.info(hash);
````

## Have a HTTP Listener to respond with gzip data

It's [automatic now](https://forums.mirthproject.io/forum/mirth-connect/support/13156-web-service-and-compress#post80922()) when given the proper request headers.

## Check for duplicates in given time period

User wants to check for duplicate messages in a given 12 hour period. (11 Jan 2023)

See [_agermano_](<https://forums.mirthproject.io/forum/mirth-connect/support/19116-filter-smtp-destination-unique-only?p=174475#post174475>)'s code snippet using guava which is included with Mirth. Guava allows expiring entries in multiple ways.

## Implement JWT in Mirth

See [this solution](https://github.com/nextgenhealthcare/connect/discussions/5503#discussioncomment-4031411).

## Use CryptoJS library

See [here](https://forums.mirthproject.io/forum/mirth-connect/support/174848-use-require-from-node-js?p=174858#post174858) and [sample calling code](https://github.com/nextgenhealthcare/connect/discussions/5503).

## Use JSch library

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

## Use GPG

12 Jan 2023

"Good Morning, are there any good sources for gpg encryption of a file within mirth? I see different posts that are from the old forums, but was looking for any examples of implementation."

For running GPG outside Mirth, use this [code template](https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Execute%20Runtime%20Command) to execute the GPG lib available on the system with the required parameters.

For running within Mirth, you need an additional GPG library, says [here](https://forums.mirthproject.io/forum/mirth-connect/support/13544-can-i-encrypt-a-file-in-gpg-using-mirth). This [wrapper](https://github.com/neuhalje/bouncy-gpg) may be useful, but no one vouched for it.

## Use lodash

Some folks' _lodash_ integration wasn't functioning as expected.

It matters which CDN you download its code from. [This one](https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js) was confirmed to work by _itsjohn_ on 10 Jan 2023.

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

## Include sourceChannelId(s) when using router.routeMessage()

2 Jan 2023

Issue: user expressed using routeMessage() didn't send 'sourceChannelId(s)' and 'sourceMessageId(s)' like direct channel-to-channel does.

* Solution #1: It's a [requested feature](https://github.com/nextgenhealthcare/connect/issues/5293)
* Solution #2: create a new destination that filters on the existing logic you're using for routeMessage()
* Solution #3: Link in Solution #1 also has a code solution, but it's a manual addition.
* Solution #4: manual additions

By _Andy Murray_:

````javascript
//jonb - Hot pro tip - use the channel name AND the originating message ID.
//Soooo nice when you gotta track things across a few channels.
router.routeMessageByChannelId(<sendToChannelId>,
  new RawMessage(
    SerializerFactory.getSerializer('HL7V2').fromXML(msg),
    null,
    {
      "sendingChannelId":channelId,
      "sendingMessageId":connectorMessage.getMessageId()}
    )
);
````

By others:

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
  attributes.put(mapItem.getKey(), mapItem.getValue());
}

attributes.put("channelId", channelId);
attributes.put("messageId", connectorMessage.getMessageId()); //TODO pass as Java Long to avoid floating point conversion
var message = new RawMessage(msg); //removed Packages.com.mirth.connect.server.userutil.
message.setSourceMap(attributes);
router.routeMessage('Test1', message);
````

Code template by _agermano_
I had some code templates I was working on for this. Here's the [initial version](https://github.com/tonygermano/connect-examples/blob/router/Code%20Templates/Route%20with%20Sources/route.js). I still need to document it.

## Enable JS map lookups but hide the mapped values from the dashboard view

An interesting discussion 19 Dec 2022 to generate lookups but omit its confidential values from dashboard view.

_agermano_:

````javascript
var definitions = {a: 1, b: 2, c: 3, d: 1}
var hm = new java.util.HashMap(definitions)
var wrapper = Object.create(hm)
wrapper.toJSON = () => "No peeking!"
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

Initiator: _Nathan Corron_
anyone know if there is a function in mirth to get an incrementing unique number that could be used for say MSH-10?  Needs to be numeric

````javascript
Date.now()
````

See [JS example](https://jsfiddle.net/pvj79z8s/) and [docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now).

## Limit number of messages processed

User's client wants to run the first X (of Y total) messages in a file during functional testing.

* process as batch. check if var 'batchSequenceId' >= X, then do destinationSet.removeAll(). (_jonb_ and _pacmano_)
* you can also manually split in a pre-processor for X loops, forward to a processing channel and then ditch the rest (_Jarrod_)

_jonb_'s other ideas

* Use the shell exec code template and ahh something something sed awk something the first 15 lines and dump those to a batch splitter
* I don’t think there is any way for the preprocessor to handle the CSV batch
* Use a RAW datatype instead of delimited first, grab the raw as an attachment. Don’t parse it as delimited until AFTER cutting the size down to 15 lines

## Access global map concurrently

(_ed note_: may be worthwhile to review [this code template](https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Thread-safe%20get%20or%20create%20from%20globalMap) against the response below.)

Summary: don't do it, ultimately JS should NOT be considered thread-safe

_chris_ was accessing the global map from channel deployments after noticing values not being in there when they should have been.

Options listed

* replacing the JS map with `java.util.ConcurrentHashMap`
* _chris_: When I create the map initially, I can attach a `get` method to it which just turns-around and fetches the thing via property-access. That will allow me to go and hunt-down all the references in my js code and replace `map[foo]` with `map.get(foo)`. Then I can swap-out the object for the type I really want. In the meantime I still have all kinds of concurrency issues, but I don't have to stop-the-world to re-write all that code. Yep, looks like `object.get` doesn't exist and defining it works as expected.

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

## Access Rhino shell used by Mirth Connect

Outlined by [_jonb_](https://gist.github.com/jonbartels/d8a1b789dd251e30c4a74baac3a3957a). See [here](https://forums.mirthproject.io/forum/mirth-connect/support/18382-run-javascript-in-channel-context-outside-of-mirth#post101735) (and/or [here](https://github.com/tonygermano/connect-vscode)?) to integrate into VS Code.

## Create a daily volume report

See _jonb_'s [SQL](https://gist.github.com/jonbartels/b961574b2043b628f1b0fd96f440179b).

## Extract a zip fle

See [forum post](https://forums.mirthproject.io/forum/mirth-connect/support/15433-unzipping-files-in-mirth).

## Check if a segment exists

_jonb_
Also how do I quickly check if a segment exists in MC? if(msg['PV1']) ???

_dforesman_
`if (msg.elements(‘AIP’).length() > 0)`
I found that on the forums once and saved it

_tiskinty_
personally I like the `msg..PV1.length` approach, but I think it's just semantics

_agermano_
I'd avoid the double dots
`msg.PV1` is the same as `msg['PV1']`. `msg..PV1` is the same as `msg.descendants('PV1')`

_jonb_
So it has to be a length check and not truthy/falsy

_agermano_
but yeah, no matter which one you use, they all return an `XMLList` which might be empty. Since it's a non-null object it's always truthy. the length is how you tell if it's empty or not. `msg.PV1` is also the same as `msg.child('PV1')`. `msg.elements('PV1')` only gives you the children that are element types, so it would exclude `text` node children.
but in mirth hl7, a node will never have mixed children types, they are either `elements` or `text`, not both.

## Format a String that may contain a decimal

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

## Create case-insensitive JSON fields

_itsjohn_: Is there a way to make JSON payload fields case insensitive when mapping in Mirth so I can write `msg['foo']` and Mirth accepts `{"foo":""}`, `{"FOO":""}` and `{"Foo":""}`.

 _agermano_ 22 Nov 2022

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

## Improve channel cloning

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

## View the layout of a Mirth database

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

NextGen has been good about sending licensing data to me. Heres a really crude query that reads that data and maps it into postgres. From there it becomes reportable by date, hostname etc.

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

## Understand the difference between XML's name() vs localName()

Summary: you'll likely need `localName()`

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
//introduce a namespace
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

## Reattach a message when it's reprocessed

_Zivan_ 1 March 2023: I ran into a strange issue while trying to reprocess a message with an attachment using the Interoperability Connector.

_jonb_ [User Guide link](https://docs.nextgen.com/bundle/Connect_Interoperability_Connector_Suite_User_Guide/page/connect/connect/topics/c_handling_multipart_payloads_attachments_Interop.html)

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

## Restore missing channel stats after DB migration

Initiator: _Bhushan U_ on 14 Nov 2022
Solution provider: _agermano_

Hello Team, I need some advice on migrating mirthconnect application with local postgresql database server from windows 2008 to windows 2012 server.
So far I did postgres database backup and restore plus mirthconnect configuration files backup and restore. But there is still some discrepancy between new server and old server.

Issue: channels stats not showing up after postgres database backup and restore then configuration files backup and restore
Reason: channels statistics are saved per server ID
Solution: Update the current server\'s ID to that of the original server. See [user guide](https://docs.nextgen.com/bundle/Mirth_User_Guide_41/page/connect/connect/topics/c_Application_Data_Directory_connect_ug.html) for details.

## Speed up my slow batch processing

_Jon Christian_ has batch file of JSON records using a SFTP reader to channel writer, retaining message order was not required

_jonb_ and _agermano_ tag team

You really need destination queueing so you can multithread this. It's waiting for the downstream channel to process before pulling the next message. TL;DR when you do a channel writer the SOURCE connector for the target channel runs in the DESTINATION thread of the caller. So if your target channel is slow, your destination is also slow. you probably are not utilizing all 10 source threads if your upstream channel is the only thing sending to this one.

YOLO. Set queue always and give it like 5-10 threads. Start there. Queue on failure wont queue UNTIL THERE IS A FAILURE. You'll still see slowness because your first channel is waiting on your second channel. The second channel is taking ~2 seconds per message. The queue in the first one will clearly demonstrate that. The multithreading may make it "good enough".

if you want 10 threads in the downstream channel, you'll either need to enable the downstream source queue, or use 10 destination threads in the upstream channel.

With the source queue on, it will accept messages as fast as it can and distribute them among the source threads you have defined. With the source queue off, the 10 threads will be a maximum, but if there are only 5 threads sending messages synchronously, then it will only be using 5/10 threads at a time.

Either option should allow the file reader to generate the messages much faster without waiting for the previous message to process.

## Pass environment vars from AWS or Docker

_Brandon C_
Anyone recommend a way to pass in environmental values from like aws or docker etc that can insert values in the config map?

_jonb_:

* Write out `configuration.properties` with what you want
* Change to storing the configmap in the DB and INSERT what you want to the DB by flipping __configurationmap.location__ in `mirth.properties` to __database__
* Alter the [entrypoint.sh script](https://github.com/nextgenhealthcare/connect-docker) to take your env vars and poke the file or DB
* [Docker Secrets](https://github.com/nextgenhealthcare/connect-docker#using-docker-secrets-) is new to me and interesting, but it only supports `mirth.properties` and not `configuration.properties`

Brandon C
what if i add more enviroment vars to the docker compose. could i pull those into the config map file some how
oh ok so ill do a __EXTRA-VAR and say it has "stuff" . I then have to add code in that build file script

jonb
da
I might suggest `MIRTH_CONFIGMAP_VARNAME`
An example to build from is [here](https://github.com/nextgenhealthcare/connect-docker#other-mirthproperties-options-) that defines `_MP_some_thing` and will read that prefix and parse the value and write it to `mirth.properties`, you want the same thing but for `like_CP_some_var_maybe_dont_call_it_CP`.
Generalize [lines 92-135](https://github.com/nextgenhealthcare/connect-docker/blob/0138af47317220b685be3771d938bf9403fd33c9/entrypoint.sh#L92) into a function that takes a prefix and file as an argument, then call it for `_MP` for `mirth.propertis` and `_CP` for `config.props`

## Choose custom logic per deployment environment

_itsjohn_
Our channels have custom logic for choosing an API based on a field value in prod which is not in stage. In an effort to standardize our mirth channel, we were planning to use a global map environment variable to run the custom code only in prod. But I wanted to check if there is a better way of if we can avoid having to write an if condition for the environment check for any environment specific custom code
Credentials
But that api key in prod changes depending on field values…currently there are 6 categories of field values that can have a unique api key
The end goal is to make both environment channels identical to promote a CI/CD pipeline
So in test and uat, we just have 1 api key
In prod, we have a switch case that has a field value mapped to each unique api key that it belongs to

_jonb_
Oh yea use the config map

_RunnenLate_
We are using a global configure that specifies the environment like you are trying to do.
We did have configurations like that where we specified different functions or object lists but in our company if we have to touch code in any way we have to go through a whole review processes and it takes weeks.  since the configuration map is considered a "configurations change" and not a "code change" it's much easier and quicker to get approval for updating that. This is what influenced us to go that route. You might want to take that into consideration when picking which way you want to go.

_pacmano_
We do what @RunnenLate does. and all other items are sourced from a db not stored in `$cfg` for the most part. On engine (or channel) deploy, multi tenant / config stuff gets put in `$g`. That includes endpoints, etc.

## Fix a double-processed attachment

_jonb_
A coworker copy-pasted a message with an attachment ID token in it instead of reprocessing. This led to the new message attachment content being literally `${ATTACH:sdfdasfdsfd}` - e.g. `OBX|1|2|3|4|^application/pdf^${ATTACHMENT:adsfasdfds}||||`
Obviously “reprocess instead of copy-paste” is the right solution.
Is there some way to like double decode attachment tokens? Would using the long-form attachment token prevent this?

_RunnenLate_
you can specify the channel and message ID in that
`getAttachment(channelId, messageId, attachmentId, base64Decode)`
you can use `getAttachmentIds(channelId, messageId)` to get the attachmentId
so it would be something like `getAttachment(channelId, messageId, getAttachmentIds(channelId, messageId), false)`

## Add footer to the PDFs generated by Mirth

_mkopinsky_
Is there a way to add a footer to the PDFs generated by Mirth? since there's no way in HTML I assume there's no way in the outputted PDF as well.
(the alternative is to just put the MRN on each page, but since the document is wrapping into 3 pages, that's a bit annoying)

_jonb_
See [here](https://forums.mirthproject.io/forum/mirth-connect/support/8370-pdf-header-footer-success) via [here](https://forums.mirthproject.io/forum/mirth-connect/support/178127-footer-on-bottom-from-page-in-document-writer-pdf-creator?p=178128#post178128)

Looks like HTML and CSS then you can test it using the “print” type. I think thats possible in most browsers’ dev tools.
So the direct answer to your question is give your PM a login to Mirth and an HTML editor and tell them to SHOW you what they want.

_mkopinsky_
there is a way in dev tools to get print layout by [using a hidden button](https://stackoverflow.com/questions/9540990/using-chromes-element-inspector-in-print-preview-mode/).

## Get channel name by channel ID

_Anibal Jodorcovsky_
Hi all - I need to be able to extract the source channel name on a message that has been received after a few hops. This is the message, and what I’m looking for (in code) is the channel name of the channel ID highlighted:

_jonb_
So you want a method like `getChannelNameFromId`?

_Anibal Jodorcovsky_
yes, and I assume the id in this case would be: `sourceMap.get[‘sourceChannelIds’](0)` ?
Just to note that if the message comes directly from one source, the sourceChannelIds is actually null… and I just need to get the id from the sourceChannelId

_tiskinty_
`ChannelUtil.getChannelName(mychannelId);`
