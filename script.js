import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,updateDoc,deleteDoc,collection,onSnapshot,query,orderBy,limit,writeBatch} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";

const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LAUNCH=new Date('2026-11-22T00:00:00+07:00').getTime();
const configured=!String(firebaseConfig.apiKey).startsWith('DAN_');
let auth,db;
if(configured){const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app)}

let U=[],C=[],ME=null,usersLoaded=false,unsubMe=null,unsubCodes=null,page='home',firstAuth=true;
const isAdmin=()=>!!ME&&ME.role==='admin';
const toEmail=n=>n.toLowerCase()+'@clime-game.app';
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>{e.style.display='none'},2800)}
const ymd=d=>d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
const errMsg=e=>({'auth/invalid-credential':'Sai tên tài khoản hoặc mật khẩu.','auth/user-not-found':'Sai tên tài khoản hoặc mật khẩu.','auth/wrong-password':'Sai tên tài khoản hoặc mật khẩu.','auth/email-already-in-use':'Tên tài khoản đã tồn tại.','auth/weak-password':'Mật khẩu tối thiểu 6 ký tự.','auth/too-many-requests':'Thử quá nhiều lần, hãy đợi một lúc.','auth/network-request-failed':'Lỗi mạng, hãy thử lại.','permission-denied':'Bạn không có quyền thực hiện thao tác này.'}[e.code]||('Lỗi: '+(e.code||e.message)));

const lockBox=t=>'<div class="card lock"><div class="big">🔒</div><h2>Cần đăng nhập</h2><p class="mut">'+t+'</p><button class="btn" data-act="login">Đăng nhập / Đăng ký</button></div>';

const V={
home:()=>(configured?'':'<div class="card" style="border-color:var(--ac2);margin-bottom:12px">⚠️ Chưa cấu hình Firebase. Hãy dán cấu hình vào file <b>firebase-config.js</b>.</div>')
+'<section class="hero"><div class="sw">⚔️</div><h1>CLIME</h1><p class="tag">Chiến đấu không ngừng. Cày cuốc để hóa thành huyền thoại.</p><div class="row"><button class="btn" data-go="launch">⏳ Xem ngày ra mắt</button><button class="btn alt" data-go="code">🎁 Nhận code</button></div></section>'
+'<h2>Giới thiệu</h2><div class="card"><p style="color:var(--tx)">Bước vào <b>Clime</b> – thế giới nơi mỗi nhát chém đều có giá trị và mỗi giọt mồ hôi đều được đền đáp. Bạn sẽ lao vào những trận chiến dồn dập, tung chuỗi combo mãn nhãn, hạ gục quái vật và boss khổng lồ, rồi quay lại cày cuốc tài nguyên để rèn vũ khí, nâng cấp giáp và mạnh hơn sau từng trận. Mỗi vòng lặp “đánh – nhặt – nâng cấp – đánh tiếp” đều cuốn đến mức bạn chỉ muốn chơi thêm một ván nữa.</p></div>'
+'<h2>Điểm nổi bật</h2><div class="grid">'
+'<div class="card"><h3>⚔️ Chiến đấu mãn nhãn</h3><p>Combo liên hoàn, né tránh đúng lúc, kỹ năng bùng nổ – mỗi trận là một màn trình diễn.</p></div>'
+'<div class="card"><h3>⛏️ Cày cuốc đã tay</h3><p>Săn quái, thu thập vật phẩm, tích lũy tài nguyên. Càng cày càng mạnh, càng mạnh càng cày vui.</p></div>'
+'<div class="card"><h3>👹 Boss thử thách</h3><p>Những trùm cuối mạnh mẽ đòi hỏi kỹ năng, chiến thuật và trang bị xứng tầm.</p></div>'
+'<div class="card"><h3>🛡️ Nâng cấp không giới hạn</h3><p>Rèn vũ khí, cường hóa giáp, xây dựng lối chơi mang đậm dấu ấn riêng của bạn.</p></div>'
+'<div class="card"><h3>🏆 Xếp hạng &amp; sự kiện</h3><p>Điểm danh mỗi ngày, nhập code nhận quà và leo bảng xếp hạng cùng cộng đồng.</p></div>'
+'<div class="card"><h3>🚀 Sắp ra mắt</h3><p>Game đang ở giai đoạn hoàn thiện cuối cùng. Chuẩn bị vũ khí – cuộc chiến sắp bắt đầu!</p></div></div>',
launch:()=>'<h2 style="text-align:center">⏳ Clime chính thức ra mắt sau</h2><div class="cd" id="cd"><div><b id="d">--</b><span>Ngày</span></div><div><b id="h">--</b><span>Giờ</span></div><div><b id="m">--</b><span>Phút</span></div><div><b id="s">--</b><span>Giây</span></div></div><p class="mut" style="text-align:center">Mốc ra mắt: 22/11/2026 (đếm ngược liên tục)</p>',
code(){
  if(!ME)return lockBox('Hãy đăng nhập để nhập và lấy code.');
  let h='<h2>🎁 Nhập code</h2><div class="card"><div class="f"><input id="ci" placeholder="Nhập code của bạn" maxlength="30"><button class="btn" data-act="redeem">Đổi code</button></div><p id="cm" class="mut" style="margin-top:8px"></p></div><h2>📥 Lấy code</h2><div class="grid">';
  C.forEach(c=>{const used=ME.used.includes(c.code);h+='<div class="card"><h3>'+esc(c.code)+'</h3><p>'+esc(c.desc||'')+' · +'+c.reward+' điểm</p><div style="margin-top:10px">'+(used?'<span class="mut">Đã dùng</span>':'<button class="btn sm" data-act="fill" data-u="'+esc(c.code)+'">Điền vào ô nhập</button>')+'</div></div>'});
  return h+'</div>'+(C.length?'':'<p class="mut">Chưa có code nào.</p>')},
daily(){
  if(!ME)return lockBox('Hãy đăng nhập để điểm danh nhận thưởng mỗi ngày.');
  const done=ME.last===ymd(new Date()),n=done?((ME.streak-1)%7)+1:ME.streak%7;
  let h='<h2>📅 Điểm danh</h2><div class="card"><p>Chuỗi hiện tại: <b style="color:var(--ac)">'+ME.streak+' ngày</b> · Điểm: <b>'+ME.pts+'</b></p><div class="days">';
  for(let i=1;i<=7;i++)h+='<div class="'+(i<=n?'ok':'')+'">Ngày '+i+'<br>'+(i===7?'🎁100':'+20')+'</div>';
  return h+'</div><button class="btn" data-act="checkin" '+(done?'disabled style="opacity:.5"':'')+'>'+(done?'✅ Hôm nay đã điểm danh':'Điểm danh ngay')+'</button><p class="mut">Điểm danh liên tiếp 7 ngày nhận thưởng lớn.</p></div>'},
rank(){
  const ad=isAdmin();
  let h='<h2>🏆 Bảng xếp hạng</h2><div class="card tbl"><table><tr><th>#</th><th>Người chơi</th><th>Điểm</th><th>Chuỗi</th>'+(ad?'<th>Chỉnh sửa</th>':'')+'</tr>';
  U.slice(0,50).forEach((u,i)=>{h+='<tr><td>'+(['🥇','🥈','🥉'][i]||i+1)+'</td><td>'+esc(u.name)+(u.role==='admin'?' 🛠':'')+'</td><td>'+u.pts+'</td><td>'+u.streak+'</td>'+(ad?'<td><input class="n" type="number" value="'+u.pts+'" data-p="'+u.id+'"> <button class="btn sm" data-act="setpts" data-u="'+u.id+'">Lưu</button> '+(u.role==='admin'?'':'<button class="btn sm alt" data-act="deluser" data-u="'+u.id+'">Xóa</button>')+'</td>':'')+'</tr>'});
  h+='</table></div>';
  if(!usersLoaded)h+='<p class="mut">Đang tải...</p>';
  return h+(ME?'':'<p class="mut">Đăng nhập để tham gia xếp hạng.</p>')},
admin(){
  if(!isAdmin())return lockBox('Chỉ admin mới truy cập được mục này.');
  let h='<h2>🛠 Quản trị</h2><div class="card"><h3>Thêm code</h3><div class="f"><input id="nc" placeholder="Mã code"><input id="nr" type="number" placeholder="Điểm thưởng"><input id="nd" placeholder="Mô tả"><button class="btn" data-act="addcode">Thêm</button></div></div><h2>Danh sách code</h2><div class="card tbl"><table><tr><th>Code</th><th>Thưởng</th><th>Mô tả</th><th></th></tr>';
  C.forEach(c=>{h+='<tr><td>'+esc(c.code)+'</td><td>'+c.reward+'</td><td>'+esc(c.desc||'')+'</td><td><button class="btn sm alt" data-act="delcode" data-u="'+esc(c.code)+'">Xóa</button></td></tr>'});
  h+='</table></div><h2>Dữ liệu người chơi</h2><div class="card tbl"><table><tr><th>Tên</th><th>Quyền</th><th>Điểm</th><th>Chuỗi</th><th>Lần cuối</th><th>Code đã dùng</th></tr>';
  U.forEach(u=>{h+='<tr><td>'+esc(u.name)+'</td><td>'+esc(u.role)+'</td><td>'+u.pts+'</td><td>'+u.streak+'</td><td>'+(u.last||'-')+'</td><td>'+esc((u.used||[]).join(', ')||'-')+'</td></tr>'});
  return h+'</table></div><p class="mut">Chỉnh điểm / xóa người chơi ở mục Xếp hạng.</p>'}
};

let timer=null;
function tick(){
  const t=LAUNCH-Date.now();if(!$('#d'))return;
  if(t<=0){$('#cd').innerHTML='<h2>🎉 Clime đã ra mắt!</h2>';return}
  const p=n=>String(n).padStart(2,'0');
  $('#d').textContent=p(Math.floor(t/864e5));$('#h').textContent=p(Math.floor(t/36e5)%24);$('#m').textContent=p(Math.floor(t/6e4)%60);$('#s').textContent=p(Math.floor(t/1e3)%60);
}
function renderChip(){
  document.querySelectorAll('#drawer a').forEach(a=>a.classList.toggle('on',a.dataset.go===page));
  $('#adm').style.display=isAdmin()?'block':'none';
  $('#chip').innerHTML=ME?'<span>👤 <b>'+esc(ME.name)+'</b> · '+ME.pts+'đ</span><button class="btn sm alt" data-act="logout">Thoát</button>':'<button class="btn sm" data-act="login">Đăng nhập</button>';
}
function render(keep){
  $('#view').innerHTML=V[page]();renderChip();
  clearInterval(timer);if(page==='launch'){tick();timer=setInterval(tick,1000)}
  if(!keep)window.scrollTo(0,0);
}
function refresh(){ // dữ liệu đổi từ máy chủ: vẽ lại nhưng không làm mất ô đang gõ
  renderChip();
  const a=document.activeElement;
  if(a&&a.tagName==='INPUT'&&a.closest('#view'))return;
  if(page!=='launch'||!$('#d'))render(true);
}
function go(p){page=p;document.body.classList.remove('open');render()}

/* dữ liệu thời gian thực */
if(configured){
  onSnapshot(query(collection(db,'users'),orderBy('pts','desc'),limit(200)),s=>{U=s.docs.map(d=>({id:d.id,...d.data()}));usersLoaded=true;refresh()},e=>toast(errMsg(e)));
  onAuthStateChanged(auth,u=>{
    if(unsubMe)unsubMe();if(unsubCodes)unsubCodes();unsubMe=unsubCodes=null;
    if(u){
      unsubMe=onSnapshot(doc(db,'users',u.uid),s=>{ME=s.exists()?{id:s.id,...s.data()}:null;refresh()},()=>{});
      unsubCodes=onSnapshot(collection(db,'codes'),s=>{C=s.docs.map(d=>d.data()).sort((a,b)=>a.code.localeCompare(b.code));refresh()},()=>{});
    }else{ME=null;C=[];refresh();if(firstAuth)showAuth()}
    firstAuth=false;
  });
}

/* đăng nhập / đăng ký */
let mode='login';
function setMode(m){mode=m;$('#tl').classList.toggle('on',m==='login');$('#tr').classList.toggle('on',m==='reg');$('#ap2').style.display=m==='reg'?'block':'none';$('#go').textContent=m==='reg'?'Đăng ký':'Đăng nhập';$('#msg').textContent=''}
function showAuth(){setMode('login');$('#auth').classList.add('show');$('#au').focus()}
async function submit(){
  if(!configured){$('#msg').textContent='Chưa cấu hình Firebase (xem firebase-config.js).';return}
  const n=$('#au').value.trim(),p=$('#ap').value,msg=$('#msg');
  if(!n||!p){msg.textContent='Vui lòng nhập đầy đủ thông tin.';return}
  if(!/^[A-Za-z0-9_]{3,16}$/.test(n)){msg.textContent='Tên 3–16 ký tự: chữ, số hoặc dấu gạch dưới.';return}
  $('#go').disabled=true;
  try{
    if(mode==='reg'){
      if(p.length<6){msg.textContent='Mật khẩu tối thiểu 6 ký tự.';return}
      if(p!==$('#ap2').value){msg.textContent='Mật khẩu nhập lại không khớp.';return}
      const key=n.toLowerCase();
      if((await getDoc(doc(db,'names',key))).exists()){msg.textContent='Tên tài khoản đã tồn tại.';return}
      const cred=await createUserWithEmailAndPassword(auth,toEmail(n),p);
      const b=writeBatch(db);
      b.set(doc(db,'names',key),{uid:cred.user.uid});
      b.set(doc(db,'users',cred.user.uid),{name:n,role:'user',pts:0,streak:0,last:'',used:[]});
      await b.commit();
    }else{
      const cred=await signInWithEmailAndPassword(auth,toEmail(n),p);
      if(!(await getDoc(doc(db,'users',cred.user.uid))).exists()){await signOut(auth);msg.textContent='Tài khoản không còn tồn tại.';return}
    }
    $('#auth').classList.remove('show');$('#ap').value='';$('#ap2').value='';toast('Xin chào '+n+'!');
  }catch(e){msg.textContent=errMsg(e)}
  finally{$('#go').disabled=false}
}
$('#tl').onclick=()=>setMode('login');$('#tr').onclick=()=>setMode('reg');
$('#go').onclick=submit;$('#skip').onclick=()=>$('#auth').classList.remove('show');
$('#auth').addEventListener('keydown',e=>{if(e.key==='Enter')submit()});
$('#bg').onclick=()=>document.body.classList.toggle('open');$('#ov').onclick=()=>document.body.classList.remove('open');

/* thao tác */
document.addEventListener('click',async e=>{
  const g=e.target.closest('[data-go]');if(g){go(g.dataset.go);return}
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act,u=a.dataset.u;
  try{
    if(act==='login')showAuth();
    else if(act==='logout'){await signOut(auth);page='home';render();toast('Đã đăng xuất')}
    else if(act==='fill'){$('#ci').value=u;$('#ci').focus()}
    else if(act==='redeem'&&ME){
      const v=$('#ci').value.trim().toUpperCase(),c=C.find(x=>x.code===v),cm=$('#cm');
      if(!v){cm.textContent='Hãy nhập code.';return}
      if(!c){cm.textContent='❌ Code không tồn tại.';return}
      if(ME.used.includes(c.code)){cm.textContent='⚠️ Bạn đã dùng code này rồi.';return}
      await updateDoc(doc(db,'users',ME.id),{pts:ME.pts+c.reward,used:[...ME.used,c.code]});
      toast('🎉 Nhận +'+c.reward+' điểm!');
    }
    else if(act==='checkin'&&ME){
      const d=new Date(),t=ymd(d);if(ME.last===t)return;d.setDate(d.getDate()-1);
      const streak=ME.last===ymd(d)?ME.streak+1:1,r=streak%7===0?100:20;
      await updateDoc(doc(db,'users',ME.id),{streak,last:t,pts:ME.pts+r});
      toast('✅ Điểm danh thành công +'+r+' điểm');
    }
    else if(isAdmin()){
      if(act==='addcode'){
        const cd=$('#nc').value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g,''),rw=parseInt($('#nr').value,10);
        if(!cd||isNaN(rw)||rw<0){toast('Nhập mã (chữ/số) và điểm thưởng hợp lệ');return}
        if(C.some(x=>x.code===cd)){toast('Code đã tồn tại');return}
        await setDoc(doc(db,'codes',cd),{code:cd,reward:rw,desc:$('#nd').value.trim()});toast('Đã thêm code');
      }
      else if(act==='delcode'){await deleteDoc(doc(db,'codes',u));toast('Đã xóa code')}
      else if(act==='setpts'){
        const inp=document.querySelector('input[data-p="'+u+'"]'),val=parseInt(inp.value,10);
        if(!isNaN(val)){await updateDoc(doc(db,'users',u),{pts:val});toast('Đã cập nhật điểm')}
      }
      else if(act==='deluser'){
        const t=U.find(x=>x.id===u);if(!t||t.role==='admin')return;
        const b=writeBatch(db);b.delete(doc(db,'users',u));b.delete(doc(db,'names',t.name.toLowerCase()));await b.commit();toast('Đã xóa người chơi');
      }
    }
  }catch(err){toast(errMsg(err))}
});

render();
