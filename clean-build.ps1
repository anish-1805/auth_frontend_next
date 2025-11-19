# Clean build script for Next.js
Write-Host "Cleaning Next.js build artifacts..." -ForegroundColor Cyan

# Remove .next directory
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Removed .next directory" -ForegroundColor Green
}

# Remove out directory
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
    Write-Host "✓ Removed out directory" -ForegroundColor Green
}

# Remove node_modules (optional)
if ($args -contains "--deep") {
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
        Write-Host "✓ Removed node_modules directory" -ForegroundColor Green
    }
}

Write-Host "Clean complete!" -ForegroundColor Green
