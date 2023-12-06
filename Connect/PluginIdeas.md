# MC Plugin Ideas

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#export-and-import-from-clipboard">Export and import from clipboard</a></li>
    <li><a href="#view-messages-in-thread-queues">View messages in thread queues</a></li>
    <li><a href="#dump-scheduled-jobs">Dump scheduled jobs</a></li>
    <li><a href="#image-conversion">Image conversion</a></li>
    <li><a href="#mirth-uis-from-json-config">Mirth UIs from JSON config</a></li>
    <li><a href="#channel-dependency-graph">Channel dependency graph</a></li>
    <li><a href="#what-is-my-ip">What is my IP</a></li>
  </ol>
</details>

## Export and import from clipboard

_jonb_
ya know what plugin I want? Export and import from clipboard. I’m poking at an MCVE and being albe to just copy-paste the channel code would be faster than moving files.

## View messages in thread queues

_Kirby Knight_
I wish there was a way to see what messages are queued on each thread. Is there a way to configure a channel to log or display this information?

(back and forth on how to get the expected data)

_jonb_
See [#3669](https://github.com/nextgenhealthcare/connect/issues/3669#issuecomment-626961190) if you’re interested in the details of how all this works. OH - `connectorMessage.getQueueBucket()` at `com/mirth/connect/donkey/server/queue/DestinationQueue.java:274`. I wonder if you can just log that out from MC

_agermano_
That's not the same connectorMessage that is available in JavaScript. Different types.

_jonb_
`com.mirth.connect.userutil.ImmutableConnectorMessage` would have to be updated with a getter to expose the queue bucket. Or mess with reflection. I almost have this working. I am running into a lot of Java module errors because I’m running Java 17. @Kirby Knight ON A TEST INSTANCE try this

````javascript
return org.apache.commons.lang3.builder.ReflectionToStringBuilder(connectorMessage,
new org.apache.commons.lang3.builder.RecursiveToStringStyle());
````

It will return a string with the immutable connector message and the private connector message. The private connector message then has your queue thread ID as an int. There is probably a cleaner way to do this by reflecting into the specific fields needed.

It's possible to see what thread a message was assigned to.

````javascript
var internalConnectorMessage = org.apache.commons.lang3.reflect.
FieldUtils.readField(connectorMessage, "connectorMessage", true);
return internalConnectorMessage.getQueueBucket();
````

_agermano_
That will just tell you which bucket the current message belongs to. I think you'd need to read the current buffer, and then count how many messages are assigned to each thread... but the buffer is constantly changing and not thread-safe unless you access it through the synchronized methods.

_jonb_
I’m running this code in a JS Writer destination so the queue bucket would definitely be assigned because to get to the destination it would have to have come out of the DB and into the queue buffer. I wonder if the value is null in the destination transformer before it goes into the queue. Yes it is null. __So Tony is right, you cannot see the queue bucket until after the message is out of the queue. I think in practical terms that means that only a JS Writer would be able to capture this information.__

## Dump scheduled jobs

_jonb_
Plugin idea - A settings plugin that just dumps the current list of scheduled jobs from Quartz

_agermano_
I may run into that same issue from yesterday that a bunch of stuff you need is behind private fields/methods.

_jonb_'s prototype [here](https://gist.github.com/jonbartels/27b09865b2b48051920564af83fca09e), its output:

````javascript

{
  "schedulerCount" : 9,
  "schedulers" : [
    {
      "summary" : "Quartz Scheduler (v2.1.7) '538c6291-7dfc-4835-9f35-a3cf93a23615' with instanceId 'NON_CLUSTERED'\n  Scheduler class: 'org.quartz.impl.StdScheduler' - running locally.\n  Running since: Sat May 06 14:08:16 UTC 2023\n  Not currently in standby mode.\n  Number of jobs executed: 1\n  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 1 threads.\n  Using job-store 'org.quartz.simpl.RAMJobStore' - which does not support persistence. and is not clustered.\n",
      "groups" : [
        {
          "groupName" : "538c6291-7dfc-4835-9f35-a3cf93a23615",
          "jobs" : [
            {
              "jobName" : "PollConnector538c6291-7dfc-4835-9f35-a3cf93a23615",
              "jobGroup" : "538c6291-7dfc-4835-9f35-a3cf93a23615",
              "triggerCount" : 1,
              "nextTriggerDate" : "2023-05-06T15:41Z"
            }
          ]
        }
      ]
    },
    {
      "summary" : "Quartz Scheduler (v2.1.7) 'b626b2d9-8c3c-400f-848c-7213e0350e1e' with instanceId 'NON_CLUSTERED'\n  Scheduler class: 'org.quartz.impl.StdScheduler' - running locally.\n  Running since: Sat May 06 14:08:16 UTC 2023\n  Not currently in standby mode.\n  Number of jobs executed: 1\n  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 1 threads.\n  Using job-store 'org.quartz.simpl.RAMJobStore' - which does not support persistence. and is not clustered.\n",
      "groups" : [
        {
          "groupName" : "b626b2d9-8c3c-400f-848c-7213e0350e1e",
          "jobs" : [
            {
              "jobName" : "PollConnectorb626b2d9-8c3c-400f-848c-7213e0350e1e",
              "jobGroup" : "b626b2d9-8c3c-400f-848c-7213e0350e1e",
              "triggerCount" : 1,
              "nextTriggerDate" : "2023-05-08T04:00Z"
            }
          ]
        }
      ]
    },
    {
      "summary" : "Quartz Scheduler (v2.1.7) 'e1e9a603-f009-4222-8cf7-09690adad6b1' with instanceId 'NON_CLUSTERED'\n  Scheduler class: 'org.quartz.impl.StdScheduler' - running locally.\n  Running since: Sat May 06 14:32:21 UTC 2023\n  Not currently in standby mode.\n  Number of jobs executed: 1\n  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 1 threads.\n  Using job-store 'org.quartz.simpl.RAMJobStore' - which does not support persistence. and is not clustered.\n",
      "groups" : [
        {
          "groupName" : "e1e9a603-f009-4222-8cf7-09690adad6b1",
          "jobs" : [
            {
              "jobName" : "PollConnectore1e9a603-f009-4222-8cf7-09690adad6b1",
              "jobGroup" : "e1e9a603-f009-4222-8cf7-09690adad6b1",
              "triggerCount" : 2,
              "nextTriggerDate" : "2023-05-06T14:35Z"
            }
          ]
        }
      ]
    },
    {
      "summary" : "Quartz Scheduler (v2.1.7) 'DataPruner' with instanceId 'NON_CLUSTERED'\n  Scheduler class: 'org.quartz.impl.StdScheduler' - running locally.\n  Running since: Sat May 06 14:08:10 UTC 2023\n  Not currently in standby mode.\n  Number of jobs executed: 0\n  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 1 threads.\n  Using job-store 'org.quartz.simpl.RAMJobStore' - which does not support persistence. and is not clustered.\n",
      "groups" : [
        {
          "groupName" : "DataPruner",
          "jobs" : [
            {
              "jobName" : "DataPrunerDataPruner",
              "jobGroup" : "DataPruner",
              "triggerCount" : 1,
              "nextTriggerDate" : "2023-05-06T15:00Z"
            }
          ]
        }
      ]
    },
    {
      "summary" : "Quartz Scheduler (v2.1.7) '74e44712-f77a-488e-933c-423eab6b30d1' with instanceId 'NON_CLUSTERED'\n  Scheduler class: 'org.quartz.impl.StdScheduler' - running locally.\n  Running since: Sat May 06 14:08:16 UTC 2023\n  Not currently in standby mode.\n  Number of jobs executed: 1\n  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 1 threads.\n  Using job-store 'org.quartz.simpl.RAMJobStore' - which does not support persistence. and is not clustered.\n",
      "groups" : [
        {
          "groupName" : "74e44712-f77a-488e-933c-423eab6b30d1",
          "jobs" : [
            {
              "jobName" : "PollConnector74e44712-f77a-488e-933c-423eab6b30d1",
              "jobGroup" : "74e44712-f77a-488e-933c-423eab6b30d1",
              "triggerCount" : 1,
              "nextTriggerDate" : "2023-05-06T15:00Z"
            }
          ]
        }
      ]
    },
    {
      "summary" : "Quartz Scheduler (v2.1.7) '616ca323-6ae0-4eaa-a7a1-7f7595db3967' with instanceId 'NON_CLUSTERED'\n  Scheduler class: 'org.quartz.impl.StdScheduler' - running locally.\n  Running since: Sat May 06 14:08:16 UTC 2023\n  Not currently in standby mode.\n  Number of jobs executed: 290\n  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 1 threads.\n  Using job-store 'org.quartz.simpl.RAMJobStore' - which does not support persistence. and is not clustered.\n",
      "groups" : [
        {
          "groupName" : "616ca323-6ae0-4eaa-a7a1-7f7595db3967",
          "jobs" : [
            {
              "jobName" : "PollConnector616ca323-6ae0-4eaa-a7a1-7f7595db3967",
              "jobGroup" : "616ca323-6ae0-4eaa-a7a1-7f7595db3967",
              "triggerCount" : 1,
              "nextTriggerDate" : "2023-05-06T14:32Z"
            }
          ]
        }
      ]
    },
    {
      "summary" : "Quartz Scheduler (v2.1.7) 'a89533ac-4cd9-46a0-b8a7-393c528252ce' with instanceId 'NON_CLUSTERED'\n  Scheduler class: 'org.quartz.impl.StdScheduler' - running locally.\n  Running since: Sat May 06 14:08:16 UTC 2023\n  Not currently in standby mode.\n  Number of jobs executed: 1\n  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 1 threads.\n  Using job-store 'org.quartz.simpl.RAMJobStore' - which does not support persistence. and is not clustered.\n",
      "groups" : [
        {
          "groupName" : "a89533ac-4cd9-46a0-b8a7-393c528252ce",
          "jobs" : [
            {
              "jobName" : "PollConnectora89533ac-4cd9-46a0-b8a7-393c528252ce",
              "jobGroup" : "a89533ac-4cd9-46a0-b8a7-393c528252ce",
              "triggerCount" : 1,
              "nextTriggerDate" : "2023-05-07T00:00Z"
            }
          ]
        }
      ]
    },
    {
      "summary" : "Quartz Scheduler (v2.1.7) '695c0176-fc79-4dcb-a92a-1240ceaca007' with instanceId 'NON_CLUSTERED'\n  Scheduler class: 'org.quartz.impl.StdScheduler' - running locally.\n  Running since: Sat May 06 14:08:16 UTC 2023\n  Not currently in standby mode.\n  Number of jobs executed: 290\n  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 1 threads.\n  Using job-store 'org.quartz.simpl.RAMJobStore' - which does not support persistence. and is not clustered.\n",
      "groups" : [
        {
          "groupName" : "695c0176-fc79-4dcb-a92a-1240ceaca007",
          "jobs" : [
            {
              "jobName" : "PollConnector695c0176-fc79-4dcb-a92a-1240ceaca007",
              "jobGroup" : "695c0176-fc79-4dcb-a92a-1240ceaca007",
              "triggerCount" : 1,
              "nextTriggerDate" : "2023-05-06T14:32Z"
            }
          ]
        }
      ]
    },
    {
      "summary" : "Quartz Scheduler (v2.1.7) '76ef38af-1226-43a7-b909-92105b0063a5' with instanceId 'NON_CLUSTERED'\n  Scheduler class: 'org.quartz.impl.StdScheduler' - running locally.\n  Running since: Sat May 06 14:08:16 UTC 2023\n  Not currently in standby mode.\n  Number of jobs executed: 289\n  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 1 threads.\n  Using job-store 'org.quartz.simpl.RAMJobStore' - which does not support persistence. and is not clustered.\n",
      "groups" : [
        {
          "groupName" : "76ef38af-1226-43a7-b909-92105b0063a5",
          "jobs" : [
            {
              "jobName" : "PollConnector76ef38af-1226-43a7-b909-92105b0063a5",
              "jobGroup" : "76ef38af-1226-43a7-b909-92105b0063a5",
              "triggerCount" : 1,
              "nextTriggerDate" : "2023-05-06T14:32Z"
            }
          ]
        }
      ]
    }
  ]
}
````

## Image conversion

_RunnenLate_
Does anyone use mirth for image conversion?

_tiskinty_
I've used it for image compression before.

_dforesman_
I have used it to call imagemagick to convert to PDF

_RunnenLate_
I'm using the imageio library to convert PDF to TIF and visa versa. I'm just wondering if it's something that should be integrated into Mirth... thinking about making a plugin maybe.

## Mirth UIs from JSON config

_jonb_
I have another good idea that I’m probably never going to implement.
Inspired by [Josh's idea](https://github.com/nextgenhealthcare/connect/issues/5749).
I think the hard part of writing plugins is the UI. IIRC the current standard is still “use Netbeans for Swing”. What if there was a sample plugin where the UI was just “heres a big text area, enter a JSON blob in that for your config object” then the plugin is responsible for parsing the JSON and applying its properties. This would let the developer focus on making the libraries and connector operation work well separately from the quirky bits of the Swing UI.

## Channel dependency graph

_Richard_ developed a PowerShell script to export the channel dependencies to DOT language, then used graphviz to generate a SVG. This would be helpful directly in Mirth as a plugin.

## What is my IP

_jonb_
MC plugin idea - “What is my IP?”
Its trivial to do with a channel that calls ifconfig.me but a button would be handy.

_pacmano_
what is my local IP, what is my public IP, what is my container host IP.

_jonb_
How is the container host IP discoverable from software?
Local interfaces can be enumerated

_Jarrod_ with [SO question](https://stackoverflow.com/questions/9481865/getting-the-ip-address-of-the-current-machine-using-java)
