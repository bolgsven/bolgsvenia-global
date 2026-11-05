(() => {
const m=document.getElementById('mobile-menu'),panel=document.getElementById('mobile-panel');
if(!m||!panel)return;
const es=document.documentElement.lang.toLowerCase().startsWith('ca');
function setMenu(open){panel.classList.toggle('open',open);m.setAttribute('aria-expanded',String(open));m.textContent=open?(es?'CERRAR':'CLOSE'):'MENU'}
m.addEventListener('click',()=>setMenu(!panel.classList.contains('open')));
panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
})();
(function(){
'use strict';
const buttons=[...document.querySelectorAll('.lab-choice')];
const panel=document.getElementById('lab-panel');
if(!panel || !buttons.length) return;
let active='web';
let webLook='calm';
let transLang='en';
let spanishTopic='travel';
let reveal=false;
let itIssue='connection';
const en={
 translation:{tag:'LANGUAGE, WITH HUMAN NUANCE',title:'Meaning is more than words',desc:'Tap to explore how the same message can sound natural in both languages.',action:'Talk to us about translation',toggle:'See it in Spanish',toggleBack:'See it in English'},
 spanish:{tag:'SPANISH LEARNING / IN DEVELOPMENT',title:'Learn something right now',desc:'Choose a situation and reveal a useful everyday phrase. Lessons are a proposed service, not yet available to book.',action:'Register interest in lessons',travel:'Travel',daily:'Everyday',work:'Work',reveal:'Reveal meaning',hide:'Hide meaning'},
 web:{tag:'DESIGN, MADE TANGIBLE',title:'Try a different design direction',desc:'Choose a look and watch this tiny website change. Imagine what we could create for your own business.',action:'Talk to us about a website',bold:'Bold',calm:'Calm',playful:'Playful',headline:'MAKE AN<br>IMPACT',sub:'YOUR BRAND / YOUR WAY'},
 it:{tag:'PRACTICAL HELP, HUMAN ANSWERS',title:'What is getting in your way?',desc:'Select a typical issue to see a sensible first step. This is a preview, not a live diagnosis.',action:'Ask about remote IT support',connection:'Connection',device:'Slow device',accounts:'Accounts'}
};
const es={
 translation:{tag:'IDIOMES, AMB MATISOS HUMANS',title:'El sentit va més enllà de les paraules',desc:'Prem per explorar com una mateixa idea sona natural en diferents llengües.',action:'Consulta sobre traducció',toggle:'Veure-ho en castellà',toggleBack:'Veure-ho en anglès'},
 spanish:{tag:'CLASSES DE CASTELLÀ / EN DESENVOLUPAMENT',title:'Aprèn alguna cosa ara mateix',desc:'Tria una situació i descobreix una frase útil. Les classes són un servei previst i encara no es poden reservar.',action:'Mostra interès per les classes',travel:'Viajes',daily:'Dia a dia',work:'Trabajo',reveal:'Veure el significat',hide:'Amaga el significat'},
 web:{tag:'DISSENY QUE POTS PROVAR',title:'Prova una altra línia de disseny',desc:'Tria un estil i mira com canvia aquest petit web. Imagina què podríem crear per al teu negoci.',action:'Consulta sobre un web',bold:'Atrevit',calm:'Sereno',playful:'Creatiu',headline:'DEJA<br>HUELLA',sub:'LA TEVA MARCA / EL TEU ESTIL'},
 it:{tag:'AJUDA PRÀCTICA, RESPOSTES HUMANES',title:'Quin problema vols resoldre?',desc:'Tria una situació habitual per veure un primer pas orientatiu. No és un diagnòstic tècnic en directe.',action:'Consulta sobre assistència informàtica',connection:'Connexió',device:'Equip lent',accounts:'Cuentas'}
};
const phrase={
 travel:{es:'¿Dónde está la estación?',en:'Where is the station?'},
 daily:{es:'¿Me pones un café, por favor?',en:'Could I have a coffee, please?'},
 work:{es:'¿Podemos hablar mañana?',en:'Could we speak tomorrow?'}
};
const tips={
 connection:{en:'First, check whether another device can connect to the same Wi-Fi network. That helps narrow down whether the issue is with the device or the connection.',es:'Primer comprova si un altre dispositiu es pot connectar a la mateixa xarxa wifi. Així distingiràs si l’error és a l’equip o a la connexió.'},
 device:{en:'Restart the device and check whether storage is nearly full. Persistent slowness can have several causes, so a proper review may be needed.',es:'Reinicia l’equip i comprova si queda poc espai d’emmagatzematge. Si continua lent, pot ser necessari revisar altres causes.'},
 accounts:{en:'If you cannot access an account, use the provider’s official recovery page. Never share passwords or one-time security codes with anyone.',es:'Si no pots accedir a un compte, utilitza la recuperació oficial del proveïdor. No comparteixis mai contrasenyes ni codis de seguretat.'}
};
function locale(){return document.documentElement.lang.toLowerCase().startsWith('ca')?'es':'en'}
function subjectFor(name){return (locale()==='es'?'Consulta: ':'Enquiry: ')+({translation:locale()==='es'?'traducció':'translation',spanish:locale()==='es'?'classes de castellà (interès)':'Spanish lessons (interest)',web:locale()==='es'?'desenvolupament web':'web development',it:locale()==='es'?'assistència informàtica':'remote IT support'}[name])}
function enquiry(name){
 const subject=encodeURIComponent(subjectFor(name));
 const body=encodeURIComponent(locale()==='es'?'Hola, Bolgsvenia Global,\n\nM’agradaria consultar-vos sobre aquest servei.\n\nLa meva idea o necessitat és:\n\n':'Hello Bolgsvenia Global,\n\nI would like to enquire about this service.\n\nMy idea or requirement is:\n\n');
 return 'mailto:bolgsvenia.global@bolgsvenia.com?subject='+subject+'&body='+body;
}
function actionFor(name,txt){return '<a class="lab-action" href="'+enquiry(name)+'">'+txt+' <span aria-hidden="true">↗</span></a>'}
function selectOptHtml(opts,current){return '<div class="lab-options">'+opts.map(o=>'<button type="button" data-variant="'+o[0]+'" aria-pressed="'+(current===o[0])+'">'+o[1]+'</button>').join('')+'</div>'}
function wireVariants(fn){panel.querySelectorAll('[data-variant]').forEach(b=>b.addEventListener('click',()=>fn(b.dataset.variant)))}
function render(){
 const L=locale();const copy=(L==='es'?es:en)[active];
 const top='<span class="lab-subtitle">'+copy.tag+'</span><h3>'+copy.title+'</h3><p class="lab-description">'+copy.desc+'</p>';
 if(active==='translation'){
   const spanish=transLang==='es';
   const body='<div class="sample-translation"><small>'+(spanish?'ESPAÑOL / ES':'ENGLISH / EN')+'</small><strong>'+(spanish?'Las buenas ideas llegan lejos':'Good ideas travel far')+'</strong></div>';
   panel.innerHTML=top+body+'<div class="lab-options"><button type="button" id="switch-translation">'+(spanish?copy.toggleBack:copy.toggle)+' ↔</button></div>'+actionFor(active,copy.action);
   panel.querySelector('#switch-translation').addEventListener('click',()=>{transLang=transLang==='en'?'es':'en';render()});
 } else if(active==='spanish'){
   panel.innerHTML=top+selectOptHtml([['travel',copy.travel],['daily',copy.daily],['work',copy.work]],spanishTopic)+
     '<div class="sample-spanish"><strong>'+phrase[spanishTopic].es+'</strong><div class="answer">'+(reveal?phrase[spanishTopic].en:'&nbsp;')+'</div></div>'+
     '<div class="lab-options"><button id="reveal-meaning" type="button">'+(reveal?copy.hide:copy.reveal)+'</button></div>'+actionFor(active,copy.action);
   wireVariants(v=>{spanishTopic=v;reveal=false;render()});
   panel.querySelector('#reveal-meaning').addEventListener('click',()=>{reveal=!reveal;render()});
 } else if(active==='web'){
   panel.innerHTML=top+selectOptHtml([['bold',copy.bold],['calm',copy.calm],['playful',copy.playful]],webLook)+
     '<div class="sample-browser" data-look="'+webLook+'"><div class="browser-nav"><span></span><span></span><span></span><small>BOLGSVENIA / DESIGN LAB</small></div><div class="browser-view"><strong>'+copy.headline+'</strong><b>↗</b></div></div>'+actionFor(active,copy.action);
   wireVariants(v=>{webLook=v;render()});
 } else {
   panel.innerHTML=top+selectOptHtml([['connection',copy.connection],['device',copy.device],['accounts',copy.accounts]],itIssue)+
     '<div class="it-output">'+tips[itIssue][L]+'</div>'+'<a class="lab-action" href="'+itGameRoute+'">'+(L==='es'?'Juga al repte complet':'Play the full troubleshooting game')+' <span aria-hidden="true">↗</span></a>';
   wireVariants(v=>{itIssue=v;render()});
 }
 buttons.forEach(b=>{const v=b.dataset.service===active;b.classList.toggle('is-active',v);b.setAttribute('aria-pressed',String(v))});
}
buttons.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.service;render()}));
// Route the IT demonstration into the full interactive support simulation.
// This link stays on the same language version; it does not connect to the user's device.
const itGameRoute=locale()==='es'?'suport-informatic.html#fix-it':'it-support.html#fix-it';
const langBtn=document.getElementById('lang-switch');

render();
})();
(function(){
'use strict';
const video=document.getElementById('brand-motion');
const btn=document.getElementById('motion-toggle');
const frame=document.querySelector('.reel-frame');
if(!video||!btn||!frame)return;
function sync(){
 const es=document.documentElement.lang.toLowerCase().startsWith('ca');
 const playing=!video.paused;
 frame.classList.toggle('is-playing',playing);
 btn.setAttribute('aria-pressed',String(playing));
 btn.setAttribute('aria-label',es?(playing?'Pausar vídeo de marca':'Reproducir vídeo de marca'):(playing?'Pause brand film':'Play brand film'));
 btn.querySelector('.control-symbol').textContent=playing?'Ⅱ':'▶';
 btn.querySelector('.control-label').textContent=es?(playing?'PAUSAR':'REPRODUCIR'):(playing?'PAUSE':'PLAY FILM');
}
function toggle(){if(video.paused){const attempt=video.play();if(attempt&&attempt.catch)attempt.catch(()=>{btn.querySelector('.control-label').textContent=document.documentElement.lang.toLowerCase().startsWith('ca')?'VÍDEO NO DISPONIBLE':'VIDEO UNAVAILABLE'})}else{video.pause();sync()} }
btn.addEventListener('click',toggle);
video.addEventListener('click',toggle);
video.addEventListener('play',sync);video.addEventListener('pause',sync);

sync();
})();

/* Form constraints mirror the existing site's one-file, five-megabyte limit. */
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('form[data-lead-form]').forEach(form=>{
  const status=form.querySelector('.quote-status');
  const es=document.documentElement.lang.toLowerCase().startsWith('ca');
  form.addEventListener('submit',ev=>{
   const file=form.querySelector('input[type="file"]')?.files?.[0];
   if(file&&file.size>5*1024*1024){ev.preventDefault();status.textContent=es?'El fitxer supera els 5 MB':'The file is larger than 5 MB';status.hidden=false;status.focus();}
  });
 });
});
