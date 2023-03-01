# PowerShell

## Converting to int and string

Examples from [here](https://hostingultraso.com/help/windows/convert-numbers-between-bases-windows-powershell)

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

## Using -split with "|"

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

## pre-sized arrays

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

## Tracing commands

Use [_trace-command_](https://learn.microsoft.com/en-us/powershell/module/Microsoft.PowerShell.Utility/Trace-Command?view=powershell-7.3)

````powershell
trace-command -expression {"g*","s*" | Get-Alias } -name parameterbinding -pshost
#to see all options for -name above
Get-TraceSource
````

## misc

<https://devblogs.microsoft.com/powershell-community/cheat-sheet-console-experience/>

<https://github.com/devops-collective-inc/big-book-of-powershell-gotchas/blob/master/SUMMARY.md>
