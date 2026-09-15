/**
 * Renders a PDF page-by-page onto stacked <canvas> elements inside a WebView,
 * using Mozilla's pdf.js loaded from a CDN at runtime. This works identically
 * on Android, iOS and web — unlike a bare <embed>/native PDF viewer, which
 * Android's WebView can't render inline without a publicly-reachable URL.
 *
 * Pages are canvas pixels only (no text layer), so there's no native
 * share/print/download affordance and no easy text copy — deliberate, since
 * this is used for exam question papers, answer keys and notes.
 *
 * Requires internet access once per load (to fetch pdf.js itself from the
 * CDN) — the PDF file itself is always fetched from our own backend.
 *
 * The page starts filling from y=0 with no reserved header band — callers
 * overlay their own back button / title as a floating element on top of
 * this WebView (position: absolute in RN) rather than a solid header bar,
 * so the PDF gets the full screen. The "current / total" page badge here is
 * a small floating pill at the bottom, out of the way of that RN overlay.
 */
export const buildPdfViewerHtml = (pdfUrl: string): string => `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
<style>
  * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #EBF0F5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  #pages { padding: 12px 0 40px; display: flex; flex-direction: column; align-items: center; }
  canvas {
    width: calc(100% - 24px);
    max-width: 800px;
    height: auto;
    margin: 10px auto;
    display: block;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08);
  }
  #status {
    color: #5B6577; font-family: sans-serif; text-align: center; padding: 90px 24px 24px; font-size: 15px; font-weight: 500;
  }
  #counter {
    position: fixed; top: 12px; right: 14px;
    background: rgba(22, 49, 92, 0.88); color: #FFFFFF; font-family: sans-serif; font-weight: 700;
    font-size: 12px; padding: 6px 14px; border-radius: 20px; z-index: 99; letter-spacing: 0.3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  }
</style>
</head>
<body oncontextmenu="return false">
<div id="status">Loading PDF…</div>
<div id="counter" style="display:none"></div>
<div id="pages"></div>
<script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
<script>
(function () {
  var status = document.getElementById('status');
  if (typeof pdfjsLib === 'undefined') {
    status.textContent = 'Internet connection is needed once to load the PDF viewer. Please check your connection and reopen.';
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  pdfjsLib.getDocument({ url: ${JSON.stringify(pdfUrl)} }).promise.then(async function (pdf) {
    status.style.display = 'none';
    var counter = document.getElementById('counter');
    counter.style.display = 'block';
    counter.textContent = 'Page 1 of ' + pdf.numPages;

    var container = document.getElementById('pages');
    var canvases = [];
    for (var i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      var baseViewport = page.getViewport({ scale: 1 });
      var scale = (document.body.clientWidth * 2) / baseViewport.width;
      var viewport = page.getViewport({ scale: scale });
      var canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.dataset.page = i;
      container.appendChild(canvas);
      canvases.push(canvas);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
    }

    if (pdf.numPages > 1 && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              counter.textContent = 'Page ' + entry.target.dataset.page + ' of ' + pdf.numPages;
            }
          });
        },
        { threshold: 0.5 }
      );
      canvases.forEach(function (c) { observer.observe(c); });
    }
  }).catch(function (e) {
    status.style.display = 'block';
    status.textContent = 'Could not load the PDF. Make sure the backend server is running. (' + e.message + ')';
  });
})();
</script>
</body>
</html>`;
