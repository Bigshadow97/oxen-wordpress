/* Three sequential representative audits per mode. No audit-only page alterations. */
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const directory=path.join(__dirname,'screenshots','media-performance'),cli=path.join(__dirname,'performance-runtime/node_modules/lighthouse/cli/index.js');
const run=args=>new Promise((resolve,reject)=>{const p=spawn(process.execPath,[cli,...args],{stdio:['ignore','pipe','pipe']});let output='';p.stdout.on('data',d=>output+=d);p.stderr.on('data',d=>output+=d);p.on('exit',code=>code?reject(Error(output)):resolve());});
(async()=>{
 const results=[];
 for(const mode of ['mobile','desktop'])for(let number=1;number<=3;number++){
  const file=path.join(directory,`${mode}-${number}.lhr.json`);
  const args=['http://localhost:10016','--only-categories=performance','--chrome-flags=--headless --no-sandbox','--output=json','--output-path='+file,'--quiet'];
  if(mode==='desktop')args.push('--preset=desktop');
  await run(args);const report=JSON.parse(fs.readFileSync(file)),a=report.audits;
  const result={mode,number,score:Math.round(report.categories.performance.score*100),lcp:a['largest-contentful-paint'].numericValue,cls:a['cumulative-layout-shift'].numericValue,tbt:a['total-blocking-time'].numericValue,fcp:a['first-contentful-paint'].numericValue,speedIndex:a['speed-index'].numericValue,bytes:a['total-byte-weight'].numericValue,jsExecution:a['bootup-time'].numericValue,version:report.lighthouseVersion,settings:report.configSettings};
  results.push(result);fs.writeFileSync(path.join(directory,'lighthouse-results.json'),JSON.stringify(results,null,2));
  console.log(`${mode} ${number}: ${result.score}, LCP ${(result.lcp/1000).toFixed(2)}s, CLS ${result.cls}, TBT ${result.tbt}ms`);
 }
})();
