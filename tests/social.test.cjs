const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
for(const [file,url] of [['index.html','https://soexcitedapp.com/'],['app/index.html','https://soexcitedapp.com/app']]){
 test(`${file}: raw HTML exposes complete social card without executing JavaScript`,()=>{
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const head=html.split('</head>')[0];
  const tags=[...head.matchAll(/<meta\s+([^>]+)>/g)].map(m=>Object.fromEntries([...m[1].matchAll(/([\w:]+)="([^"]*)"/g)].map(a=>[a[1],a[2]])));
  function meta(key){const matches=tags.filter(t=>t.property===key||t.name===key);assert.equal(matches.length,1,key);return matches[0].content;}
  assert.equal(meta('og:url'),url);
  assert.equal(meta('og:type'),'website');
  assert.equal(meta('twitter:card'),'summary_large_image');
  for(const field of ['title','description','image','image:alt']){
   assert.ok(meta(`og:${field}`).length);
   assert.equal(meta(`og:${field}`),meta(`twitter:${field}`));
  }
  const image=meta('og:image');assert.ok(image.startsWith('https://soexcitedapp.com/'));
  const bytes=fs.readFileSync(path.join(root,new URL(image).pathname));
  assert.equal(bytes.subarray(1,4).toString(),'PNG');
  assert.equal(bytes.readUInt32BE(16),Number(meta('og:image:width')));
  assert.equal(bytes.readUInt32BE(20),Number(meta('og:image:height')));
  assert.ok(bytes.length<1000000);
  assert.doesNotMatch(head,/http-equiv="refresh"/);
 });
}
