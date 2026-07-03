git add .

$changes = git status --porcelain

if ($changes) {
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto Deploy $date"
    git push
    Write-Host ""
    Write-Host "=============================="
    Write-Host "GitHub 업로드 완료!"
    Write-Host "Vercel이 자동으로 배포합니다."
    Write-Host "=============================="
} else {
    Write-Host "변경된 파일이 없습니다."
}