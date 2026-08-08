$ErrorActionPreference = 'Stop'

$ApiBase = 'https://api.mnetplus.world/media/v1/public'
$SessionId = [guid]::NewGuid().ToString()

$Headers = @{
    'Accept' = '*/*'
    'Accept-Language' = 'zh-CN,zh;q=0.9,en;q=0.8,ko;q=0.7'
    'Cache-Control' = 'no-cache'
    'Pragma' = 'no-cache'
    'Origin' = 'https://mnetplus.world'
    'Referer' = 'https://mnetplus.world/'
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
    'X-Lang-Country' = 'zh:CN'
    'X-User-Agent' = "zh:CN::WEB:Chrome:::$SessionId"
}

function Get-VideoId([string]$Value) {
    $Value = $Value.Trim()
    if ($Value -match '^[0-9a-fA-F]{24}$') { return $Value.ToLower() }
    if ($Value -match '/videos/([0-9a-fA-F]{24})(?:[/?#]|$)') { return $Matches[1].ToLower() }
    throw 'Could not find a valid 24-character Mnet Plus video ID in the URL.'
}

function Invoke-MnetJson([string]$Url) {
    $lastError = $null
    for ($i = 1; $i -le 3; $i++) {
        try {
            return Invoke-RestMethod -Uri $Url -Method Get -Headers $Headers -TimeoutSec 25
        }
        catch {
            $lastError = $_
            if ($i -lt 3) { Start-Sleep -Milliseconds (700 * $i) }
        }
    }
    throw "Request failed after 3 attempts.`nURL: $Url`n$($lastError.Exception.Message)"
}

function Convert-ToSrtTime([double]$Seconds) {
    if ($Seconds -lt 0) { $Seconds = 0 }
    $ts = [TimeSpan]::FromMilliseconds([Math]::Round($Seconds * 1000))
    $hours = [Math]::Floor($ts.TotalHours)
    return ('{0:00}:{1:00}:{2:00},{3:000}' -f $hours, $ts.Minutes, $ts.Seconds, $ts.Milliseconds)
}

function Get-SafeFileName([string]$Name) {
    foreach ($c in [IO.Path]::GetInvalidFileNameChars()) { $Name = $Name.Replace([string]$c, '_') }
    $Name = $Name.Trim().TrimEnd('.')
    if ($Name.Length -gt 120) { $Name = $Name.Substring(0, 120) }
    if ([string]::IsNullOrWhiteSpace($Name)) { return 'mnetplus-video' }
    return $Name
}

function Get-LanguageCues([string]$VideoId, [string]$CaptionId, [string]$Language, [int]$DurationSeconds) {
    $seen = @{}
    $cues = New-Object System.Collections.Generic.List[object]
    $interval = 15

    for ($second = 0; $second -le ($DurationSeconds + $interval); $second += $interval) {
        Write-Progress -Activity "Downloading $Language subtitles" -Status "$second / $DurationSeconds sec" -PercentComplete ([Math]::Min(100, [int](100 * $second / [Math]::Max(1, $DurationSeconds))))
        $url = "$ApiBase/videos/$VideoId/captions/$CaptionId/cues?language=$([uri]::EscapeDataString($Language))&displaySecond=$second"
        $payload = Invoke-MnetJson $url

        if ($payload.captionIntervalSecond) {
            try { $interval = [int]$payload.captionIntervalSecond } catch { $interval = 15 }
            if ($interval -le 0) { $interval = 15 }
        }

        if ($null -eq $payload.contentMap) { continue }
        foreach ($prop in $payload.contentMap.PSObject.Properties) {
            $item = $prop.Value
            if ($null -eq $item -or $null -eq $item.content) { continue }
            $start = [double]$item.displaySecond
            $duration = [double]$item.displayDurationSecond
            $text = [string]$item.content
            $text = $text.Trim()
            if ([string]::IsNullOrWhiteSpace($text)) { continue }
            $key = ('{0:R}|{1}' -f $start, $text)
            if (-not $seen.ContainsKey($key)) {
                $seen[$key] = $true
                $cues.Add([pscustomobject]@{ Start=$start; Duration=$duration; Text=$text })
            }
        }
    }
    Write-Progress -Activity "Downloading $Language subtitles" -Completed
    return @($cues | Sort-Object Start, Text)
}

function Save-Srt($Cues, [string]$Path) {
    $sb = New-Object System.Text.StringBuilder
    $index = 1
    foreach ($cue in $Cues) {
        $start = Convert-ToSrtTime ([double]$cue.Start)
        $end = Convert-ToSrtTime ([double]$cue.Start + [Math]::Max([double]$cue.Duration, 0.001))
        [void]$sb.AppendLine($index)
        [void]$sb.AppendLine("$start --> $end")
        [void]$sb.AppendLine([string]$cue.Text)
        [void]$sb.AppendLine()
        $index++
    }
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [IO.File]::WriteAllText($Path, $sb.ToString(), $utf8)
}

try {
    Write-Host ''
    Write-Host '=========================================='
    Write-Host '     Mnet Plus Subtitle Downloader'
    Write-Host '=========================================='
    Write-Host ''
    Write-Host 'Downloads: Korean (ko), English (en), Simplified Chinese (zh_CN)'
    Write-Host ''

    $VideoUrl = Read-Host 'Paste Mnet Plus video URL here'
    if ([string]::IsNullOrWhiteSpace($VideoUrl)) { throw 'No URL entered.' }

    $VideoId = Get-VideoId $VideoUrl
    Write-Host ''
    Write-Host 'Connecting to Mnet Plus...'

    $Info = Invoke-MnetJson "$ApiBase/guests/videos/$VideoId"
    if ($null -eq $Info.videoCaption -or [string]::IsNullOrWhiteSpace([string]$Info.videoCaption.videoCaptionId)) {
        throw 'This video does not expose a caption ID.'
    }

    $CaptionId = [string]$Info.videoCaption.videoCaptionId
    $DurationSeconds = [Math]::Max(1, [Math]::Ceiling(([double]$Info.videoLength) / 1000))
    $Title = [string]$Info.name
    $BaseName = Get-SafeFileName $Title

    Write-Host "Title: $Title"
    Write-Host "Video ID: $VideoId"
    Write-Host "Caption ID: $CaptionId"
    Write-Host ''
    Write-Host 'Available subtitle tracks:'
    foreach ($config in $Info.videoCaption.languageConfigs) {
        $ai = if ($config.aiGeneratedLabel) { " $($config.aiGeneratedLabel)" } else { '' }
        Write-Host "  $($config.language): $($config.languageLabel)$ai"
    }

    $Available = @($Info.videoCaption.languageConfigs | ForEach-Object { [string]$_.language })
    $Wanted = @('ko', 'en', 'zh_CN')
    $Missing = @($Wanted | Where-Object { $_ -notin $Available })
    if ($Missing.Count -gt 0) {
        throw "Requested subtitle track(s) unavailable: $($Missing -join ', ')"
    }

    $OutputDir = Join-Path $PSScriptRoot 'subtitles'
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

    foreach ($lang in $Wanted) {
        Write-Host ''
        Write-Host "Downloading $lang..."
        $Cues = Get-LanguageCues $VideoId $CaptionId $lang $DurationSeconds
        $SrtPath = Join-Path $OutputDir "$BaseName.$lang.srt"
        Save-Srt $Cues $SrtPath
        Write-Host "Saved $($Cues.Count) cues -> $SrtPath"
    }

    Write-Host ''
    Write-Host '=========================================='
    Write-Host 'Done! All three subtitle files are ready.'
    Write-Host "Folder: $OutputDir"
    Write-Host '=========================================='
    Start-Process explorer.exe $OutputDir
    exit 0
}
catch {
    Write-Host ''
    Write-Host '========== ERROR DETAILS ==========' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host '===================================' -ForegroundColor Red
    Write-Host ''
    Read-Host 'Press Enter to close'
    exit 1
}
