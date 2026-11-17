$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Jeannys\Documents\azul\web'
$port = 8765
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Servidor en http://localhost:$port/"

$tipos = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.webp' = 'image/webp'
  '.ogg'  = 'audio/ogg'
  '.mp4'  = 'video/mp4'
  '.webm' = 'video/webm'
  '.woff2' = 'font/woff2'
  '.zip'  = 'application/zip'
  '.apk'  = 'application/vnd.android.package-archive'
  '.exe'  = 'application/octet-stream'
  '.ico'  = 'image/x-icon'
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch { break }

  $req = $ctx.Request
  $res = $ctx.Response
  $ruta = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
  if ($ruta -eq '/') { $ruta = '/index.html' }
  $archivo = Join-Path $root ($ruta.TrimStart('/') -replace '/', '\')

  try {
    if (Test-Path -LiteralPath $archivo -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($archivo).ToLower()
      $res.ContentType = if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { 'application/octet-stream' }
      $res.Headers.Add('Cache-Control', 'no-cache')
      $bytes = [System.IO.File]::ReadAllBytes($archivo)
      $res.ContentLength64 = $bytes.Length
      # En HEAD se envían solo las cabeceras: escribir el cuerpo provoca un error.
      if ($req.HttpMethod -ne 'HEAD') {
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("No encontrado: $ruta")
      $res.ContentType = 'text/plain; charset=utf-8'
      $res.ContentLength64 = $msg.Length
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {
    try { $res.StatusCode = 500 } catch {}
  } finally {
    try { $res.OutputStream.Close() } catch {}
  }
}
