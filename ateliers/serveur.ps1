# ============================================================
#  MINI-SERVEUR de l'atelier (Windows) — rien à installer : PowerShell est fourni avec Windows.
#  Sert les fichiers de SON dossier sur http://localhost:<port>/ (pour les ouvrir dans le navigateur d'Antigravity,
#  qui n'ouvre pas les adresses file://). Seulement pour cet ordinateur, jamais pour le réseau.
#  Lancement : powershell -NoProfile -ExecutionPolicy Bypass -File serveur.ps1
#  (port 5500, ou le suivant libre) — affiche « URL=http://localhost:PORT/progression.html ». Ne pas modifier.
# ============================================================
param([int]$Port = 5500)
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$ecoute = $null
for ($essai = 0; $essai -lt 50; $essai++) {
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add("http://localhost:$($Port + $essai)/")
  try { $l.Start(); $ecoute = $l; $Port = $Port + $essai; break } catch { $l.Close() }
}
if (-not $ecoute) { Write-Output "Aucun port libre"; exit 1 }
Write-Output "URL=http://localhost:$Port/progression.html"

$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8';
  '.json' = 'application/json; charset=utf-8'; '.csv' = 'text/csv; charset=utf-8'; '.txt' = 'text/plain; charset=utf-8';
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.gif' = 'image/gif'; '.ico' = 'image/x-icon' }

while ($ecoute.IsListening) {
  $ctx = $ecoute.GetContext()
  $rep = $ctx.Response
  try {
    $chemin = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($chemin -eq '/') { $chemin = '/progression.html' }
    $fichier = Join-Path $dossier ($chemin.TrimStart('/').Replace('/', '\'))
    $plein = [System.IO.Path]::GetFullPath($fichier)
    if ($chemin -notmatch '\.\.' -and $plein.StartsWith($dossier) -and (Test-Path -LiteralPath $plein -PathType Leaf)) {
      $octets = [System.IO.File]::ReadAllBytes($plein)
      $ext = [System.IO.Path]::GetExtension($plein).ToLower()
      $rep.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
      $rep.StatusCode = 200
    } else {
      $octets = [System.Text.Encoding]::UTF8.GetBytes("Introuvable`n")
      $rep.ContentType = 'text/plain; charset=utf-8'
      $rep.StatusCode = 404
    }
    $rep.Headers.Add('Cache-Control', 'no-store')
    $rep.ContentLength64 = $octets.Length
    if ($ctx.Request.HttpMethod -ne 'HEAD') { $rep.OutputStream.Write($octets, 0, $octets.Length) }
  } catch { } finally { $rep.Close() }
}
