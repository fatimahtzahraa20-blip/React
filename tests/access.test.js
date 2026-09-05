import test from 'node:test';
import assert from 'node:assert/strict';
import {canAccess,canAllocate,canApprove,canManageRecord,normalizeCourses,parseCSV,csvText} from '../src/lib/access.js';
test('faculty cannot open management pages or allocate/approve',()=>{for(const page of ['users','planning','remaining','conflicts','import','team','activity','history'])assert.equal(canAccess('faculty',page),false);assert.equal(canAllocate('faculty'),false);assert.equal(canApprove('faculty'),false);for(const page of ['dashboard','courses','workload','thesis','reports','settings'])assert.equal(canAccess('faculty',page),true);});
test('management roles have distinct capabilities and unknown roles fail closed',()=>{assert.equal(canAccess('admin','users'),true);assert.equal(canAccess('hod','users'),false);assert.equal(canApprove('hod'),true);assert.equal(canAllocate('coordinator'),true);assert.equal(canApprove('coordinator'),false);assert.equal(canAccess('coordinator','settings'),true);assert.equal(canAccess('owner','dashboard'),false);});
test('course normalization uses the nested allocation faculty relationship',()=>{const [c]=normalizeCourses([{id:'1',courses:{code:'CS1',title:'Course',credits:3},allocations:[{faculty_id:'f',status:'allocated',faculty:{full_name:'Ali'}}]}]);assert.equal(c.faculty,'Ali');assert.equal(c.faculty_id,'f');assert.equal(c.status,'allocated');assert.equal(normalizeCourses([{id:'2'}])[0].status,'unallocated');});
const offering='11111111-1111-4111-8111-111111111111',faculty='22222222-2222-4222-8222-222222222222';
test('CSV supports BOM, CRLF, quoted values and extra descriptive columns',()=>{assert.deepEqual(parseCSV(`\uFEFFoffering_id,faculty_id,note\r\n"${offering}","${faculty}","A, B"\r\n`),[{offering_id:offering,faculty_id:faculty}]);});
test('CSV rejects missing columns, invalid IDs, empty data and malformed rows',()=>{for(const text of ['a,b\n1,2','offering_id,faculty_id','offering_id,faculty_id\nx,y',`offering_id,faculty_id\n${offering},${faculty},extra`,'offering_id,faculty_id\n"oops'])assert.throws(()=>parseCSV(text));});
test('CSV export escapes quotes and neutralizes spreadsheet formulas',()=>{const result=csvText([{title:'=HYPERLINK("bad")',note:'line\nnext'}]);assert.ok(result.includes("'=HYPERLINK"));assert.ok(result.includes('""bad""'));assert.ok(result.includes('line\nnext'));});

test('CRUD management respects HOD, coordinator and lecturer responsibilities',()=>{
 for(const kind of ['faculty','programme','session','offering','student','thesis','conflict']){assert.equal(canManageRecord('hod',kind),true);assert.equal(canManageRecord('faculty',kind),kind==='thesis');assert.equal(canManageRecord('unknown',kind),false);}
 for(const kind of ['faculty','programme','session'])assert.equal(canManageRecord('coordinator',kind),false);
 for(const kind of ['offering','student','thesis','conflict'])assert.equal(canManageRecord('coordinator',kind),true);
 assert.equal(canManageRecord('admin','unknown'),false);
});
