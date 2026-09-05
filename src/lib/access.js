export const roles = {admin:'Administrator',hod:'Head of Department',coordinator:'Coordinator',faculty:'Faculty'};
export const navigation = [['dashboard','Overview','01'],['planning','Semester planning','02'],['courses','Course allocation','03'],['workload','Faculty workload','04'],['remaining','Remaining courses','05'],['conflicts','Conflict centre','06'],['thesis','Thesis supervision','07'],['team','Lecturer directory','08'],['students','Students','15'],['users','Team management','09'],['history','Allocation history','10'],['activity','Activity log','11'],['reports','Reports','12'],['import','Import / export','13'],['settings','Settings','14']];
const pages = {admin:navigation.map(x=>x[0]),hod:navigation.map(x=>x[0]).filter(x=>x!=='users'),coordinator:['dashboard','courses','workload','remaining','conflicts','thesis','team','students','history','activity','reports','import','settings'],faculty:['dashboard','courses','workload','thesis','reports','settings']};
export const canAccess = (role,page) => Boolean(pages[role]?.includes(page));
export const canAllocate = role => ['admin','hod','coordinator'].includes(role);
export const canApprove = role => ['admin','hod'].includes(role);
export function normalizeCourses(rows) {return rows.map(o=>({...o,code:o.courses?.code||'Unknown',title:o.courses?.title||'Untitled',credits:o.courses?.credits||0,programme:o.programmes?.code||'Unspecified',faculty:o.allocations?.[0]?.faculty?.full_name,faculty_id:o.allocations?.[0]?.faculty_id,status:o.allocations?.[0]?.status||'unallocated'}));}
export function csvText(rows) { if(!rows.length) return ''; const keys=Object.keys(rows[0]); const cell=value=>'"'+String(value??'').replace(/^[\s]*[=+@-]/,"'$&").replaceAll('"','""')+'"'; return [keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(cell).join(',')).join('\r\n'); }
export function parseCSV(text) {
 const rows=[]; let row=[],value='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){row.push(value);value='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(v=>v.trim()))rows.push(row);row=[];value='';}else value+=ch;}
 if(quoted)throw new Error('Unclosed CSV quote.');row.push(value);if(row.some(v=>v.trim()))rows.push(row);
 const headers=rows.shift()?.map(x=>x.trim());if(!headers?.includes('offering_id')||!headers.includes('faculty_id'))throw new Error('CSV requires offering_id and faculty_id columns.');
 if(!rows.length)throw new Error('The CSV has no allocation rows.');if(rows.length>500)throw new Error('Import up to 500 rows at a time.');
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 return rows.map((r,i)=>{if(r.length!==headers.length)throw new Error(`Row ${i+2}: incorrect column count.`);const record=Object.fromEntries(headers.map((h,j)=>[h,r[j].trim()]));if(!uuid.test(record.offering_id)||!uuid.test(record.faculty_id))throw new Error(`Row ${i+2}: use valid offering and faculty UUIDs.`);return {offering_id:record.offering_id,faculty_id:record.faculty_id};});
}
export function canManageRecord(role,kind){return ['faculty','student','offering','thesis','conflict','programme','session'].includes(kind)&&(['admin','hod'].includes(role)||role==='faculty'&&kind==='thesis'||role==='coordinator'&&['offering','student','thesis','conflict'].includes(kind));}
