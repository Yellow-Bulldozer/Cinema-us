Param(
    [string]$RemoteUrl
)

if (-not (Test-Path -Path .git -PathType Container)) {
    Write-Host "Initializing git repository..."
    git init
}

Write-Host "Staging files..."
git add .

$hasHead = $false
try {
    git rev-parse --verify HEAD | Out-Null
    $hasHead = $true
} catch {
    $hasHead = $false
}

if ($hasHead) {
    Write-Host "Repository already has commits. Creating a new commit with staged changes."
    git commit -m "Update project" -q -ErrorAction SilentlyContinue
} else {
    Write-Host "Creating initial commit..."
    git commit -m "Initial commit" -q -ErrorAction SilentlyContinue
}

git branch -M main 2>$null

if (-not $RemoteUrl) {
    $RemoteUrl = Read-Host "Remote repository URL (HTTPS or SSH)"
}

$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Updating remote 'origin' to $RemoteUrl"
    git remote set-url origin $RemoteUrl
} else {
    Write-Host "Adding remote 'origin' -> $RemoteUrl"
    git remote add origin $RemoteUrl
}

Write-Host "Pushing to origin main (you may be prompted for credentials)..."
git push -u origin main

Write-Host "Push complete."
