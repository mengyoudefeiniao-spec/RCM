param([switch]$Remove)

$ErrorActionPreference = 'Stop'
$taskName = 'RCM-Auto-GitHub-Sync'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if ($Remove) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Output 'Automatic GitHub commit/push startup task removed.'
    exit 0
}

$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$watcherPath = Join-Path $PSScriptRoot 'auto-git-sync.mjs'
$userId = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$action = New-ScheduledTaskAction -Execute $nodePath -Argument "`"$watcherPath`"" -WorkingDirectory $repoRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $userId
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -Hidden -MultipleInstances IgnoreNew -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero)

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Debounced automatic commits and pushes for new RCM workspace changes.' -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Write-Output "Installed and started the hidden $taskName task for $repoRoot."
