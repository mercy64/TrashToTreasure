# PowerShell script to start React dev server
Set-Location "C:\Users\DARIUS\OneDrive\TrashToTreasure\frontend"
$env:PATH += ";C:\Program Files\nodejs"
$env:PORT = "3001"
$env:BROWSER = "none"
npm start