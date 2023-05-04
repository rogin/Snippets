# MC Plugin Ideas

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#dump-scheduled-jobs">Dump scheduled jobs</a></li>
    <li><a href="#image-conversion">Image conversion</a></li>
    <li><a href="#mirth-uis-from-json-config">Mirth UIs from JSON config</a></li>
    <li><a href="#channel-dependency-graph">Channel dependency graph</a></li>
    <li><a href="#what-is-my-ip">What is my IP</a></li>
  </ol>
</details>

## Dump scheduled jobs

_jonb_
Plugin idea - A settings plugin that just dumps the current list of scheduled jobs from Quartz

_agermano_
I may run into that same issue from yesterday that a bunch of stuff you need is behind private fields/methods.

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
