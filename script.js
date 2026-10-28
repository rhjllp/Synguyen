(function(){
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var LAUNCH=new Date('2026-11-22T00:00:00+07:00').getTime();
var S=null;
try{S=JSON.parse(localStorage.getItem('clime_v1'))}catch(e){}
if(!S||!S.users){
  var bot=function(n,p,s){return {name:n,pw:null,role:'user',pts:p,streak:s,last:'',used:[]}};
  S={me:null,users:[{name:'admin',pw:'12345',role:'admin',pts:0,streak:0,last:'',used:[]},bot('BongDem',2450,12),bot('KiemThanh',1980,9),bot('RongLua',1520,7),bot('LangSoi',960,4),bot('TanBinh',300,1)],
     codes:[{code:'CLIME2026',reward:100,desc:'Quà chào mừng'},{code:'FARMKING',reward:200,desc:'Dành cho dân cày'},{code:'DAYONE',reward:50,desc:'Ngày đầu tiên'}]};
}
function save(){try{localStorage.setItem('clime_v1',JSON.stringify(S))}catch(e){}}
function me(){return S.users.filter(function(u){return u.name===S.me})[0]||null}
function isAdmin(){var m=me();return !!m&&m.role==='admin'}
function toast(t){var e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(function(){e.style.display='none'},2600)}
function ymd(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}

var page='home';
function go(p){page=p;document.body.classList.remove('open');render()}
function lockBox(t){return '<div class="card lock"><div class="big">🔒</div><h2>Cần đăng nhập</h2><p class="mut">'+t+'</p><button class="btn" data-act="login">Đăng nhập / Đăng ký</button></div>'}

var V={
home:function(){return '<section class="hero"><div class="sw">⚔️</div><h1>CLIME</h1><p class="tag">Chiến đấu không ngừng. Cày cuốc để hóa thành huyền thoại.</p><div class="row"><button class="btn" data-go="launch">⏳ Xem ngày ra mắt</button><button class="btn alt" data-go="code">🎁 Nhận code</button></div></section>'
+'<h2>Giới thiệu</h2><div class="card"><p style="color:var(--tx)">Bước vào <b>Clime</b> – thế giới nơi mỗi nhát chém đều có giá trị và mỗi giọt mồ hôi đều được đền đáp. Bạn sẽ lao vào những trận chiến dồn dập, tung chuỗi combo mãn nhãn, hạ gục quái vật và boss khổng lồ, rồi quay lại cày cuốc tài nguyên để rèn vũ khí, nâng cấp giáp và mạnh hơn sau từng trận. Mỗi vòng lặp “đánh – nhặt – nâng cấp – đánh tiếp” đều cuốn đến mức bạn chỉ muốn chơi thêm một ván nữa.</p></div>'
+'<h2>Điểm nổi bật</h2><div class="grid">'
+'<div class="card"><h3>⚔️ Chiến đấu mãn nhãn</h3><p>Combo liên hoàn, né tránh đúng lúc, kỹ năng bùng nổ – mỗi trận là một màn trình diễn.</p></div>'
+'<div class="card"><h3>⛏️ Cày cuốc đã tay</h3><p>Săn quái, thu thập vật phẩm, tích lũy tài nguyên. Càng cày càng mạnh, càng mạnh càng cày vui.</p></div>'
+'<div class="card"><h3>👹 Boss thử thách</h3><p>Những trùm cuối mạnh mẽ đòi hỏi kỹ năng, chiến thuật và trang bị xứng tầm.</p></div>'
+'<div class="card"><h3>🛡️ Nâng cấp không giới hạn</h3><p>Rèn vũ khí, cường hóa giáp, xây dựng lối chơi mang đậm dấu ấn riêng của bạn.</p></div>'
+'<div class="card"><h3>🏆 Xếp hạng &amp; sự kiện</h3><p>Điểm danh mỗi ngày, nhập code nhận quà và leo bảng xếp hạng cùng cộng đồng.</p></div>'
+'<div class="card"><h3>🚀 Sắp ra mắt</h3><p>Game đang ở giai đoạn hoàn thiện cuối cùng. Chuẩn bị vũ khí – cuộc chiến sắp bắt đầu!</p></div></div>'},
launch:function(){return '<h2 style="text-align:center">⏳ Clime chính thức ra mắt sau</h2><div class="cd" id="cd"><div><b id="d">--</b><span>Ngày</span></div><div><b id="h">--</b><span>Giờ</span></div><div><b id="m">--</b><span>Phút</span></div><div><b id="s">--</b><span>Giây</span></div></div><p class="mut" style="text-align:center">Mốc ra mắt: 22/11/2026 (đếm ngược 25 ngày, chạy liên tục)</p>'},
code:function(){
  if(!me())return lockBox('Hãy đăng nhập để nhập và lấy code.');
  var h='<h2>🎁 Nhập code</h2><div class="card"><div class="f"><input id="ci" placeholder="Nhập code của bạn" maxlength="30"><button class="btn" data-act="redeem">Đổi code</button></div><p id="cm" class="mut" style="margin-top:8px"></p></div><h2>📥 Lấy code</h2><div class="grid">';
  S.codes.forEach(function(c){var used=me().used.indexOf(c.code)>-1;h+='<div class="card"><h3>'+esc(c.code)+'</h3><p>'+esc(c.desc||'')+' · +'+c.reward+' điểm</p><div style="margin-top:10px">'+(used?'<span class="mut">Đã dùng</span>':'<button class="btn sm" data-act="fill" data-u="'+esc(c.code)+'">Điền vào ô nhập</button>')+'</div></div>'});
  return h+(S.codes.length?'':'<p class="mut">Chưa có code nào.</p>')+'</div>'},
daily:function(){
  var m=me();if(!m)return lockBox('Hãy đăng nhập để điểm danh nhận thưởng mỗi ngày.');
  var done=m.last===ymd(new Date()),n=done?((m.streak-1)%7)+1:m.streak%7,h='<h2>📅 Điểm danh</h2><div class="card"><p>Chuỗi hiện tại: <b style="color:var(--ac)">'+m.streak+' ngày</b> · Điểm: <b>'+m.pts+'</b></p><div class="days">';
  for(var i=1;i<=7;i++)h+='<div class="'+(i<=n?'ok':'')+'">Ngày '+i+'<br>'+(i===7?'🎁100':'+20')+'</div>';
  return h+'</div><button class="btn" data-act="checkin" '+(done?'disabled style="opacity:.5"':'')+'>'+(done?'✅ Hôm nay đã điểm danh':'Điểm danh ngay')+'</button><p class="mut">Điểm danh liên tiếp 7 ngày nhận thưởng lớn.</p></div>'},
rank:function(){
  var ad=isAdmin(),L=S.users.slice().sort(function(a,b){return b.pts-a.pts}),h='<h2>🏆 Bảng xếp hạng</h2><div class="card tbl"><table><tr><th>#</th><th>Người chơi</th><th>Điểm</th><th>Chuỗi</th>'+(ad?'<th>Chỉnh sửa</th>':'')+'</tr>';
  L.slice(0,50).forEach(function(u,i){h+='<tr><td>'+(['🥇','🥈','🥉'][i]||i+1)+'</td><td>'+esc(u.name)+(u.role==='admin'?' 🛠':'')+'</td><td>'+u.pts+'</td><td>'+u.streak+'</td>'+(ad?'<td><input class="n" type="number" value="'+u.pts+'" data-p="'+esc(u.name)+'"> <button class="btn sm" data-act="setpts" data-u="'+esc(u.name)+'">Lưu</button> '+(u.role==='admin'?'':'<button class="btn sm alt" data-act="deluser" data-u="'+esc(u.name)+'">Xóa</button>')+'</td>':'')+'</tr>'});
  return h+'</table></div>'+(me()?'':'<p class="mut">Đăng nhập để tham gia xếp hạng.</p>')},
admin:function(){
  if(!isAdmin())return lockBox('Chỉ admin mới truy cập được mục này.');
  var h='<h2>🛠 Quản trị</h2><div class="card"><h3>Thêm code</h3><div class="f"><input id="nc" placeholder="Mã code"><input id="nr" type="number" placeholder="Điểm thưởng"><input id="nd" placeholder="Mô tả"><button class="btn" data-act="addcode">Thêm</button></div></div><h2>Danh sách code</h2><div class="card tbl"><table><tr><th>Code</th><th>Thưởng</th><th>Mô tả</th><th></th></tr>';
  S.codes.forEach(function(c){h+='<tr><td>'+esc(c.code)+'</td><td>'+c.reward+'</td><td>'+esc(c.desc||'')+'</td><td><button class="btn sm alt" data-act="delcode" data-u="'+esc(c.code)+'">Xóa</button></td></tr>'});
  h+='</table></div><h2>Dữ liệu người chơi</h2><div class="card tbl"><table><tr><th>Tên</th><th>Quyền</th><th>Điểm</th><th>Chuỗi</th><th>Lần cuối</th><th>Code đã dùng</th></tr>';
  S.users.forEach(function(u){h+='<tr><td>'+esc(u.name)+'</td><td>'+u.role+'</td><td>'+u.pts+'</td><td>'+u.streak+'</td><td>'+(u.last||'-')+'</td><td>'+esc(u.used.join(', ')||'-')+'</td></tr>'});
  return h+'</table></div><p class="mut">Chỉnh điểm / xóa người chơi ở mục Xếp hạng.</p>'}
};

var timer=null;
function tick(){
  var t=LAUNCH-Date.now();if(!$('#d'))return;
  if(t<=0){$('#cd').innerHTML='<h2>🎉 Clime đã ra mắt!</h2>';return}
  var p=function(n){return String(n).padStart(2,'0')};
  $('#d').textContent=p(Math.floor(t/864e5));$('#h').textContent=p(Math.floor(t/36e5)%24);$('#m').textContent=p(Math.floor(t/6e4)%60);$('#s').textContent=p(Math.floor(t/1e3)%60);
}
function render(){
  $('#view').innerHTML=V[page]();
  document.querySelectorAll('#drawer a').forEach(function(a){a.classList.toggle('on',a.dataset.go===page)});
  $('#adm').style.display=isAdmin()?'block':'none';
  var m=me();
  $('#chip').innerHTML=m?'<span>👤 <b>'+esc(m.name)+'</b> · '+m.pts+'đ</span><button class="btn sm alt" data-act="logout">Thoát</button>':'<button class="btn sm" data-act="login">Đăng nhập</button>';
  clearInterval(timer);if(page==='launch'){tick();timer=setInterval(tick,1000)}
  window.scrollTo(0,0);
}

/* auth */
var mode='login';
function setMode(m){mode=m;$('#tl').classList.toggle('on',m==='login');$('#tr').classList.toggle('on',m==='reg');$('#ap2').style.display=m==='reg'?'block':'none';$('#go').textContent=m==='reg'?'Đăng ký':'Đăng nhập';$('#msg').textContent=''}
function showAuth(){setMode('login');$('#auth').classList.add('show');$('#au').focus()}
function submit(){
  var n=$('#au').value.trim(),p=$('#ap').value,msg=$('#msg');
  if(!n||!p){msg.textContent='Vui lòng nhập đầy đủ thông tin.';return}
  var found=S.users.filter(function(u){return u.name.toLowerCase()===n.toLowerCase()})[0];
  if(mode==='reg'){
    if(n.length<3||n.length>16){msg.textContent='Tên từ 3 đến 16 ký tự.';return}
    if(p.length<4){msg.textContent='Mật khẩu tối thiểu 4 ký tự.';return}
    if(p!==$('#ap2').value){msg.textContent='Mật khẩu nhập lại không khớp.';return}
    if(found){msg.textContent='Tên tài khoản đã tồn tại.';return}
    S.users.push({name:n,pw:p,role:'user',pts:0,streak:0,last:'',used:[]});S.me=n;
  }else{
    if(!found||found.pw!==p){msg.textContent='Sai tên tài khoản hoặc mật khẩu.';return}
    S.me=found.name;
  }
  save();$('#auth').classList.remove('show');$('#ap').value='';$('#ap2').value='';toast('Xin chào '+S.me+'!');render();
}
$('#tl').onclick=function(){setMode('login')};$('#tr').onclick=function(){setMode('reg')};
$('#go').onclick=submit;$('#skip').onclick=function(){$('#auth').classList.remove('show')};
$('#auth').addEventListener('keydown',function(e){if(e.key==='Enter')submit()});
$('#bg').onclick=function(){document.body.classList.toggle('open')};$('#ov').onclick=function(){document.body.classList.remove('open')};

/* actions */
document.addEventListener('click',function(e){
  var g=e.target.closest('[data-go]');if(g){go(g.dataset.go);return}
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act,u=a.dataset.u,m=me();
  if(act==='login')showAuth();
  else if(act==='logout'){S.me=null;save();page='home';render();toast('Đã đăng xuất')}
  else if(act==='fill'){$('#ci').value=u;$('#ci').focus()}
  else if(act==='redeem'&&m){
    var v=$('#ci').value.trim().toUpperCase(),c=S.codes.filter(function(x){return x.code.toUpperCase()===v})[0],cm=$('#cm');
    if(!v){cm.textContent='Hãy nhập code.';return}
    if(!c){cm.textContent='❌ Code không tồn tại.';return}
    if(m.used.indexOf(c.code)>-1){cm.textContent='⚠️ Bạn đã dùng code này rồi.';return}
    m.used.push(c.code);m.pts+=c.reward;save();render();toast('🎉 Nhận +'+c.reward+' điểm!');
  }
  else if(act==='checkin'&&m){
    var d=new Date(),t=ymd(d);if(m.last===t)return;d.setDate(d.getDate()-1);
    m.streak=m.last===ymd(d)?m.streak+1:1;m.last=t;
    var r=m.streak%7===0?100:20;m.pts+=r;save();render();toast('✅ Điểm danh thành công +'+r+' điểm');
  }
  else if(isAdmin()){
    if(act==='addcode'){
      var cd=$('#nc').value.trim().toUpperCase(),rw=parseInt($('#nr').value,10);
      if(!cd||isNaN(rw)){toast('Nhập mã và điểm thưởng hợp lệ');return}
      if(S.codes.some(function(x){return x.code.toUpperCase()===cd})){toast('Code đã tồn tại');return}
      S.codes.push({code:cd,reward:rw,desc:$('#nd').value.trim()});save();render();toast('Đã thêm code');
    }
    else if(act==='delcode'){S.codes=S.codes.filter(function(x){return x.code!==u});save();render();toast('Đã xóa code')}
    else if(act==='setpts'){
      var inp=[].filter.call(document.querySelectorAll('input[data-p]'),function(i){return i.dataset.p===u})[0],val=parseInt(inp.value,10);
      var us=S.users.filter(function(x){return x.name===u})[0];
      if(us&&!isNaN(val)){us.pts=val;save();render();toast('Đã cập nhật điểm')}
    }
    else if(act==='deluser'){S.users=S.users.filter(function(x){return x.name!==u||x.role==='admin'});save();render();toast('Đã xóa người chơi')}
  }
});

render();
if(!me())showAuth();
})();
