/* Local, unmodified-page Lighthouse comparison. No request filtering or security changes. */
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const http = require('node:http');
const zlib = require('node:zlib');
const { pathToFileURL } = require('node:url');
const directory = path.join(__dirname, 'screenshots/lcp-investigation');
const runtime = path.join(__dirname, 'performance-runtime/node_modules');
const cli = path.join(runtime, 'lighthouse/cli/index.js');
const url = 'http://localhost:10016';
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
function run(args) {
  return new Promise((resolve, reject) => {
    const processHandle = spawn(process.execPath, [cli, ...args], { windowsHide: true });
    let output = '';
    processHandle.stdout.on('data', data => output += data);
    processHandle.stderr.on('data', data => output += data);
    processHandle.on('error', reject);
    processHandle.on('exit', code => code ? reject(new Error(output)) : resolve());
  });
}
(async () => {
  fs.mkdirSync(directory, { recursive: true });
  await new Promise((resolve, reject) => {
    http.get(url, { headers: { 'Accept-Encoding': 'gzip' } }, response => {
      const chunks = [];
      response.on('data', data => chunks.push(data));
      response.on('end', () => {
        const body = Buffer.concat(chunks);
        const decoded = response.headers['content-encoding'] === 'gzip' ? zlib.gunzipSync(body) : body;
        const html = decoded.toString();
        const origin = {
          status: response.statusCode, bytes: body.length, decodedBytes: decoded.length,
          encoding: response.headers['content-encoding'], kaspersky: html.includes('kaspersky'),
          wordpressBlockStyles: /id=["'][^"']*(?:wp-block-library|global-styles|classic-theme-styles)/.test(html),
        };
        fs.writeFileSync(path.join(directory, 'origin-after.json'), JSON.stringify(origin, null, 2));
        console.log('WordPress origin:', JSON.stringify(origin));
        resolve();
      });
    }).on('error', reject);
  });
  const launcher = await import(pathToFileURL(path.join(runtime, 'chrome-launcher/dist/chrome-launcher.js')).href);
  const results = [];
  for (const environment of ['normal-headed', 'isolated-headless']) {
    // Both profiles belong to this task. The user's daily profile stays untouched.
    // Normal Chrome uses only startup/debugging flags, with browser protections intact.
    const normal = environment === 'normal-headed';
      for (const mode of ['mobile', 'desktop']) {
        for (let number = 1; number <= 3; number++) {
          const file = path.join(directory, `${environment}-${mode}-${number}.lhr.json`);
          const reuse = process.argv.includes('--resume') && fs.existsSync(file);
          const args = [url, '--only-categories=performance', '--output=json', '--output-path=' + file, '--quiet'];
          if (mode === 'desktop') args.push('--preset=desktop');
          if (number === 1) args.push('--save-assets');
          if (!reuse) {
            const profile = path.join(directory, `normal-profile-${mode}-${number}`);
            if (normal) fs.mkdirSync(profile, { recursive: true });
            const browser = normal ? await launcher.launch({
              ignoreDefaultFlags: true,
              chromeFlags: ['--no-first-run', '--no-default-browser-check'],
              userDataDir: profile,
            }) : null;
            if (normal) args.push('--port=' + browser.port);
            else args.push('--chrome-flags=--headless');
            try { await run(args); } finally { await browser?.kill(); }
          }
          const report = JSON.parse(fs.readFileSync(file)), audits = report.audits;
          const requests = audits['network-requests'].details.items;
          const vendor = requests.filter(item => item.url.includes('kaspersky-labs.com'));
          const result = {
            environment, mode, number, score: Math.round(report.categories.performance.score * 100),
            lcp: audits['largest-contentful-paint'].numericValue,
            cls: audits['cumulative-layout-shift'].numericValue,
            tbt: audits['total-blocking-time'].numericValue,
            fcp: audits['first-contentful-paint'].numericValue,
            speedIndex: audits['speed-index'].numericValue,
            bytes: audits['total-byte-weight'].numericValue,
            vendorBytes: vendor.reduce((sum, item) => sum + item.transferSize, 0),
            vendorRequests: vendor.length,
            documentBytes: requests.find(item => item.resourceType === 'Document')?.transferSize,
            version: report.lighthouseVersion, browser: report.environment.hostUserAgent,
            settings: report.configSettings,
          };
          results.push(result);
          fs.writeFileSync(path.join(directory, 'results.json'), JSON.stringify(results, null, 2));
          console.log(`${environment} ${mode} ${number}: ${result.score}, LCP ${(result.lcp / 1000).toFixed(2)}s, CLS ${result.cls.toFixed(4)}, vendor ${result.vendorBytes} B`);
        }
      }
  }
  const summaries = [];
  for (const environment of ['normal-headed', 'isolated-headless']) {
    for (const mode of ['mobile', 'desktop']) {
      const group = results.filter(item => item.environment === environment && item.mode === mode);
      const summary = { environment, mode, scores: group.map(item => item.score) };
      for (const key of ['score', 'lcp', 'cls', 'tbt', 'fcp', 'bytes', 'vendorBytes']) summary[key] = median(group.map(item => item[key]));
      summaries.push(summary);
    }
  }
  fs.writeFileSync(path.join(directory, 'medians.json'), JSON.stringify(summaries, null, 2));
  console.log(JSON.stringify(summaries, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
