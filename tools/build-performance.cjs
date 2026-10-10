/* Build delivery files from maintained component sources; no homepage regeneration. */
const fs=require('node:fs'),path=require('node:path');
const CleanCSS=require('./performance-runtime/node_modules/clean-css');
const terser=require('./performance-runtime/node_modules/terser');
const root=path.join(__dirname,'..'),out=path.join(root,'assets','dist');
fs.mkdirSync(out,{recursive:true});
const css=name=>fs.readFileSync(path.join(root,'assets/css',name+'.css'),'utf8');
const groups={critical:['fonts','base','hero','statistics','site'],home:['quiz','services','about','process','case-studies','testimonials','partners','tax-intro','calculator','contact','site-footer'],shell:['fonts','base','site','site-footer']};
for(const [name,files] of Object.entries(groups)){
 const result=new CleanCSS({level:1,rebase:false,roundingPrecision:-1}).minify(files.map(css).join('\n').replaceAll('../fonts/','../fonts/'));
 if(result.errors.length)throw Error(result.errors.join('\n'));
 fs.writeFileSync(path.join(out,name+'.min.css'),result.styles);
}
(async()=>{for(const name of ['site','tax','partners','services','quiz','accordion','testimonials','calculator']){
 const result=await terser.minify(fs.readFileSync(path.join(root,'assets/js',name+'.js'),'utf8'),{compress:true,mangle:true,format:{comments:false}});
 fs.writeFileSync(path.join(out,name+'.min.js'),result.code);
}console.log('Built critical/home/shell CSS and eight deferred JS modules.');})();
