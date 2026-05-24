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
      height: 100%;
      background: ${backgroundColor};
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    body {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      min-height: 100%;
      padding: 12px;
    }
    img {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
      touch-action: pan-x pan-y pinch-zoom;
    }
  </style>
</head>
<body>
  <img src="${safeUrl}" alt="צורת הדף" />
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
      height: 100%;
      background: ${backgroundColor};
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    body {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      min-height: 100%;
      padding: 12px;
    }
    #status {
      display: none;
    }
    canvas {
      display: none;
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
          return page.render({ canvasContext: context, viewport: viewport }).promise;
        })
        .then(function () {
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
