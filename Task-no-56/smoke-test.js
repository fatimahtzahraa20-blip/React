import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=await mkdtemp(path.join(tmpdir(),'droply-test-'));
const child=spawn(process.execPath,[path.resolve('server.js')],{cwd:dir,env:{...process.env,PORT:'3019'},stdio:['ignore','pipe','pipe']});
let cookie='';
async function call(route,options={}){return fetch('http://localhost:3019/api'+route,{...options,headers:{cookie,...options.headers}});}
try{
 await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(Error('Server exited: '+code)));setTimeout(()=>reject(Error('Server startup timeout')),10000).unref();});
 assert.equal((await call('/files')).status,401);
 let r=await call('/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Test User',email:'test@example.com',password:'test-password-123'})});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];
 const fd=new FormData();fd.append('files',new Blob(['Hello Droply!'],{type:'image/png'}),'hello.png');r=await call('/files',{method:'POST',body:fd});assert.equal(r.status,200);
 const invalid=new FormData();invalid.append('files',new Blob(['text'],{type:'text/plain'}),'invalid.txt');assert.equal((await call('/files',{method:'POST',body:invalid})).status,400);
 let files=await(await call('/files')).json();assert.equal(files.length,1);const id=files[0].id;
 assert.equal(await(await call(`/files/${id}/download`)).text(),'Hello Droply!');
 r=await call(`/files/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({starred:true,share:true})});const {shared}=await r.json();
 assert.equal(await(await fetch(`http://localhost:3019/api/share/${shared}`)).text(),'Hello Droply!');
 await call(`/files/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({share:false})});assert.equal((await fetch(`http://localhost:3019/api/share/${shared}`)).status,404);
 await call('/logout',{method:'POST'});assert.equal((await call('/files')).status,401);
 r=await call('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'test@example.com',password:'test-password-123'})});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];
 assert.equal((await(await call('/files')).json())[0].starred,true);
 await call(`/files/${id}`,{method:'DELETE'});assert.equal((await(await call('/files')).json()).length,0);
 console.log('PASS: account registration, auth protection, upload, listing, download, star, share, revoke, logout, login, delete.');
}finally{if(child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await exited;}await rm(dir,{recursive:true,force:true});}
