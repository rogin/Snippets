# PowerShell

## GitHub star list

See [here](https://github.com/stars/rogin/lists/powershell).

## Tracing commands

Use [_trace-command_](https://learn.microsoft.com/en-us/powershell/module/Microsoft.PowerShell.Utility/Trace-Command?view=powershell-7.3)

````powershell
Trace-Command -expression {"g*","s*" | Get-Alias } -name parameterbinding -pshost
#to see all options for -name above
Get-TraceSource
````

AND IF YOU FORGOT to run that before starting, use ([H/T redog](https://old.reddit.com/r/PowerShell/comments/13bv0be/how_to_get_a_starttranscript_like_file_output/jjcqe2n/))

````powershell
Get-Content (Get-PSReadLineOption | select -ExpandProperty HistorySavePath) | out-gridview
````

## Updating `Microsoft Store` apps

From [here](https://social.technet.microsoft.com/Forums/windows/en-US/5ac7daa9-54e6-43c0-9746-293dcb8ef2ec/how-to-force-update-of-windows-store-apps-without-launching-the-store-app):

````powershell
Get-CimInstance -Namespace "Root\cimv2\mdm\dmmap" -ClassName "MDM_EnterpriseModernAppManagement_AppManagement01" |
Invoke-CimMethod -MethodName UpdateScanMethod
````

## Simple things I forget

### Converting to int and string

Examples from [here](https://hostingultraso.com/help/windows/convert-numbers-between-bases-windows-powershell) making use of `Convert` class:

````powershell
# Convert accepts bases 2, 8, 10, and 16
PS >[Convert]::ToInt32("10011010010", 2)
1234
PS >[Convert]::ToString(1234, 16)
4d2
# or use the formatting operator
PS >"{0:X4}" -f 1234
04D2
````

### pre-sized arrays

from [here](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-arrays?view=powershell-7.2#initialize-with-0)

````powershell
PS> [int[]]::new(4)
0
0
0
0
#We can use the multiplying trick to do this too.
PS> $data = @(0) * 4
PS> $data
0
0
0
0
````

### Use Where() to split one collection into two

Where() accepts [multiple params](https://mcpmag.com/articles/2015/12/02/where-method-in-powershell.aspx).

````powershell
@(1,2,3).Where({$_ -gt 0}, 'first')
#1
@(1,2,3).Where({$_ -gt 0}, 'first', 2)
#1
#2
@(1,2,3).Where({$_ -gt 10}, 'first')
@(1,2,3).Where({$_ -gt 10}, 'first', 2)
$Running,$Stopped = (Get-Service).Where({$_.Status -eq 'Running'},'Split') 
#use $Running and $Stopped
````

### Here-strings

See [here](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.3#here-strings)

````powershell
@"
For help, type "get-help"
"@
````

### Prefer generic List over ArrayList

[Comment](https://old.reddit.com/r/PowerShell/comments/14yjs0u/total_powershell_noob_looking_for_some_quick/jrth4of/) to prefer `$NewList = [System.Collections.Generic.List[PSObject]]::new()` over `New-Object System.Collections.ArrayList` to avoid silencing `Add()` returning true/false.

### Regex

Always going back to [the docs](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_regular_expressions?view=powershell-7.4)

## Gotchas

Various items that have bitten me.

### Pipelined input to my advanced function isn't processing

Verify your code is in a process block. To [quote](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_advanced_methods?view=powershell-7.3#process):

_If a function parameter is set to accept pipeline input, and a process block isn't defined, record-by-record processing will fail. In this case, your function will only execute once, regardless of the input._

### Using -split with "|"

Be sure to escape the pipe as it's a special character, or substitute Split() instead.

````powershell
# does not match expectations
PS >"foo|bar" -split "|"

f
o
o
|
b
a
r

# escaping the pipe parses as expected
PS >"foo|bar" -split "\|"
foo
bar

# you can also opt for Split() to ignore special chars
PS >"foo|bar".Split("|")
foo
bar
````

## New in PS v7

### Ternary

````powershell
$IsWindows ? "ok" : "not ok"
````

### Chain operators

````powershell
1 && 2
1/0 || Write-Warning "What are you trying to do?"
````

### Null-Coalescing Assignment

````powershell
$foo = $null
$foo ?? "bar"
#Related to this is the Null-Coalescing assignment operator, ??=.
#<left-side> ??= <right-side>
$computername ??= ([system.environment]::MachineName)
````

### Null Conditional Operators

````powershell
$p = Get-Process -id $pid
${p}?.startTime
````

### ForEach-Object Parallel

````powershell
Measure-Command {1..1000 | ForEach-Object -parallel {$_*10}}
````

### SSH for remoting

### Clean block (v7.3+)

Acts like a **finally** block, see [here](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_advanced_methods?view=powershell-7.3#clean).

## Nuggets from "The PowerShell Scripting and Toolmaking Book"

### Transcripts

Use Start-Transcript and Stop-Transcript to write all actions taken (along with their output) to a file.

### Write-Information

From two sections in the book, use this to add tags to its output which can then be filtered.

````powershell
$r = "thinkp1","srv1","srv3","bovine320" |
Get-Bits -InformationVariable iv -Verbose
#All of the information records generated by Write-Information are stored in $iv.
#These are objects with their own set of properties.
````

### Make Powershell ISE 'aware' of v7

````powershell
Enter-PSSession -computername $env:COMPUTERNAME -Configuration PowerShell.7
#This hack will open a remoting session to yourself using the PowerShell 7
#endpoint. Now, the scripting panel will be PowerShell 7 “aware”.
````

## Solutions I've needed but came up empty

- Can I select XML's #text() in a SelectNode()?
- Can I create a cycled iterator that repeats a list? there's no 'yield' equivalent. I want `('red','green','blue')` to cycle forever.
- Can I iterate with an index like other languages -- `for (index, value) in list.something()`. There's a [language request ticket](https://github.com/PowerShell/PowerShell/issues/13772) for \$PSIndex that was closed.
- I need a PS script to run as admin on a fresh Win10 box to keep the system updated. How to configure the script to allow user to click .ps1 file to run, and have it prompt for creds? Adding `#Requires -RunAsAdministrator` did not work, plus the default PS v5.1 running it failed to parse simple lines correctly, e.g. "& control update" to open the Windows update panel.
- Running a scheduled PS script without a popup. There are [ways](https://superuser.com/questions/62525/run-a-batch-file-in-a-completely-hidden-way) to wrap with VBS.

## Range operator

See [here](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_Operators?view=powershell-7.3#range-operator-).

## Predictive IntelliSense

Install PSReadLine and you can get a list view of selections based on your history by pressing F2 - [details](https://learn.microsoft.com/en-us/powershell/scripting/learn/shell/using-predictors?view=powershell-7.3).

## Helpful links

[Practice and Style Guide](https://poshcode.gitbook.io/powershell-practice-and-style/introduction/readme)

Local book [PowerShell Notes for Professionals](PowerShellNotesForProfessionals.pdf) from [here](https://goalkicker.com/PowerShellBook/)

[Powershell cheat sheet](https://devblogs.microsoft.com/powershell-community/cheat-sheet-console-experience/)

[Big Book of Powershell Gotchas](https://github.com/devops-collective-inc/big-book-of-powershell-gotchas/blob/master/SUMMARY.md)

[Unit testing vs integration testing](https://www.guru99.com/unit-test-vs-integration-test.html)

[Info on system testing](https://testsigma.com/blog/system-testing-vs-integration-testing/) and [another](https://u-tor.com/topic/system-vs-integration)

[Local cheatsheat](powershell-cheat-sheet-ramblingcookiemonster.pdf) from [here](https://ramblingcookiemonster.github.io/images/Cheat-Sheets/powershell-cheat-sheet.pdf)

[Gist cheatsheet](https://gist.github.com/pcgeek86/336e08d1a09e3dd1a8f0a30a9fe61c8a)

[Common Cmdlets with examples](https://www.pdq.com/powershell/)

## Best Practies

Azure has a [module best practices](https://github.com/Azure/azure-powershell/blob/main/documentation/development-docs/design-guidelines/module-best-practices.md) as other bests.

PoshCode has a [best practices](https://github.com/PoshCode/PowerShellPracticeAndStyle)

MS [strongly encouraged development guidelines](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/strongly-encouraged-development-guidelines). [Using WriteObject](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/strongly-encouraged-development-guidelines?view=powershell-7.3#support-the-passthru-parameter) for `-PassThru` caught my eye.

MS [Standard Cmdlet Parameter Names and Types](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/standard-cmdlet-parameter-names-and-types?view=powershell-7.3)

## Unsorted

<https://learn-powershell.net/2012/11/09/powershell-and-wpf-textbox/>

<https://old.reddit.com/r/PowerShell/comments/17lah5l/what_have_you_done_with_powershell_this_month/k7cxp54/>

## Review one liners

Pull anything of value from [here](https://www.red-gate.com/simple-talk/sysadmin/powershell/powershell-one-liners--collections,-hashtables,-arrays-and-strings/).

## Review operators

Read over the full [page](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_Operators?view=powershell-7.3). The subexpressions were interesting.
