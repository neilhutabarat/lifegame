import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $=id=>document.getElementById(id);
const msg=t=>{$('authmsg').textContent=t};

let cfg=null;
try{cfg=(await import('./firebase-config.js')).firebaseConfig}catch(e){}
if(!cfg||String(cfg.apiKey).startsWith('ISI_')){
  msg('Simpanan: lokal (browser)');
}else{
  const app=initializeApp(cfg),auth=getAuth(app),db=getFirestore(app);
  let user=null,timer=0;
  const push=()=>{
    if(!user)return;
    clearTimeout(timer);
    timer=setTimeout(async()=>{
      try{
        await setDoc(doc(db,'saves',user.uid),{state:JSON.stringify(window.getState()),savedAt:Date.now()});
        msg('Tersimpan di cloud '+new Date().toLocaleTimeString('id-ID'));
      }catch(e){msg('Gagal simpan ke cloud: '+(e.code||e.message))}
    },1500);
  };
  window.cloudSave=push;
  $('login').hidden=false;
  $('login').onclick=()=>signInWithPopup(auth,new GoogleAuthProvider()).catch(e=>msg('Gagal masuk: '+(e.code||e.message)));
  $('logout').onclick=()=>signOut(auth);
  $('cloudsave').onclick=push;
  onAuthStateChanged(auth,async u=>{
    user=u;
    $('login').hidden=!!u;$('logout').hidden=!u;$('cloudsave').hidden=!u;
    if(!u){msg('Simpanan: lokal (browser)');return}
    try{
      const snap=await getDoc(doc(db,'saves',u.uid));
      const local=window.getState();
      if(snap.exists()&&snap.data().savedAt>(local.sv||0)){
        window.applyCloud(JSON.parse(snap.data().state));
        msg('Masuk sebagai '+(u.displayName||u.email)+'. Simpanan cloud dimuat.');
      }else{
        msg('Masuk sebagai '+(u.displayName||u.email)+'.');
        push();
      }
    }catch(e){msg('Gagal membaca cloud: '+(e.code||e.message))}
  });
}
