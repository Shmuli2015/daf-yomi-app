export function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('/');
}

export function buildZoomableHtml(imageUrl: string, backgroundColor: string): string {
  const safeUrl = imageUrl.replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=6, user-scalable=yes" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      background: ${backgroundColor};
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    body {
      display: block;
      padding: 12px;
      text-align: center;
    }
    img {
      display: block;
      margin: 0 auto;
      width: 100%;
      max-width: 100%;
      height: auto;
      touch-action: pan-x pan-y pinch-zoom;
    }
  </style>
</head>
<body>
  <img id="page-img" src="${safeUrl}" alt="צורת הדף" onload="adjustVerticalPosition()" />
  <script>
    function adjustVerticalPosition() {
      var img = document.getElementById('page-img');
      if (!img) return;
      var h = img.offsetHeight || img.getBoundingClientRect().height;
      var vh = window.innerHeight;
      if (h > 0 && h < vh - 24) {
        var topMargin = Math.floor((vh - h) / 2);
        document.body.style.paddingTop = topMargin + 'px';
      } else {
        document.body.style.paddingTop = '12px';
      }
    }
    window.addEventListener('resize', adjustVerticalPosition);
    window.addEventListener('load', adjustVerticalPosition);
  </script>
</body>
</html>`;
}

export function buildPdfJsHtml(pdfSource: string, backgroundColor: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=6, user-scalable=yes" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      background: ${backgroundColor};
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    body {
      display: block;
      padding: 12px;
      text-align: center;
    }
    #status {
      display: none;
    }
    canvas {
      display: none;
      margin: 0 auto;
      width: 100%;
      max-width: 100%;
      height: auto;
      touch-action: pan-x pan-y pinch-zoom;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <div id="status"></div>
  <canvas id="pdf-canvas"></canvas>
  <script>
    function adjustVerticalPosition() {
      var canvas = document.getElementById('pdf-canvas');
      if (!canvas) return;
      var h = canvas.offsetHeight || canvas.getBoundingClientRect().height;
      var vh = window.innerHeight;
      if (h > 0 && h < vh - 24) {
        var topMargin = Math.floor((vh - h) / 2);
        document.body.style.paddingTop = topMargin + 'px';
      } else {
        document.body.style.paddingTop = '12px';
      }
    }
    window.addEventListener('resize', adjustVerticalPosition);

    (function () {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const pdfSource = ${JSON.stringify(pdfSource)};

      pdfjsLib.getDocument(pdfSource).promise
        .then(function (pdf) { return pdf.getPage(1); })
        .then(function (page) {
          const canvas = document.getElementById('pdf-canvas');
          canvas.style.display = 'block';
          const context = canvas.getContext('2d');
          const baseViewport = page.getViewport({ scale: 1 });
          const cssWidth = Math.max(window.innerWidth - 24, 1);
          const scale = cssWidth / baseViewport.width;
          const pixelRatio = window.devicePixelRatio || 1;
          const viewport = page.getViewport({ scale: scale * pixelRatio });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = cssWidth + 'px';
          canvas.style.height = (viewport.height / pixelRatio) + 'px';
          adjustVerticalPosition();
          return page.render({ canvasContext: context, viewport: viewport }).promise;
        })
        .then(function () {
          adjustVerticalPosition();
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage('pdf-rendered');
        })
        .catch(function (err) {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'pdfError', message: String(err && err.message ? err.message : err) })
          );
        });
    })();
  </script>
</body>
</html>`;
}

export function buildGooglePdfHtml(remoteUrl: string, backgroundColor: string): string {
  const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(remoteUrl)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=6, user-scalable=yes" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: ${backgroundColor}; }
    iframe { width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe id="pdf-frame" src="${viewerUrl.replace(/"/g, '&quot;')}" title="צורת הדף"></iframe>
  <script>
    (function () {
      var frame = document.getElementById('pdf-frame');
      if (!frame) return;
      frame.addEventListener('load', function () {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage('pdf-rendered');
      });
    })();
  </script>
</body>
</html>`;
}
