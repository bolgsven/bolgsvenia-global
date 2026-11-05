(() => {
const m=document.getElementById('mobile-menu'),panel=document.getElementById('mobile-panel');
if(!m||!panel)return;
const es=document.documentElement.lang.toLowerCase().startsWith('es');
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
 translation:{tag:'IDIOMAS, CON MATICES HUMANOS',title:'El sentido va más allá de las palabras',desc:'Pulsa para explorar cómo una misma idea suena natural en ambos idiomas.',action:'Consultar sobre traducción',toggle:'Verlo en español',toggleBack:'Verlo en inglés'},
 spanish:{tag:'CLASES DE ESPAÑOL / EN DESARROLLO',title:'Aprende algo ahora mismo',desc:'Elige una situación y descubre una frase útil. Las clases son un servicio propuesto y aún no se pueden reservar.',action:'Mostrar interés en las clases',travel:'Viajes',daily:'Día a día',work:'Trabajo',reveal:'Ver significado',hide:'Ocultar significado'},
 web:{tag:'DISEÑO QUE PUEDES PROBAR',title:'Prueba otra dirección de diseño',desc:'Selecciona un estilo y mira cómo cambia esta pequeña web. Imagina lo que podríamos crear para tu negocio.',action:'Consultar sobre una web',bold:'Atrevido',calm:'Sereno',playful:'Creativo',headline:'DEJA<br>HUELLA',sub:'TU MARCA / TU ESTILO'},
 it:{tag:'AYUDA PRÁCTICA, RESPUESTAS HUMANAS',title:'¿Qué problema quieres resolver?',desc:'Elige una situación habitual para ver un primer paso orientativo. No es un diagnóstico técnico en directo.',action:'Consultar sobre soporte IT',connection:'Conexión',device:'Equipo lento',accounts:'Cuentas'}
};
const phrase={
 travel:{es:'¿Dónde está la estación?',en:'Where is the station?'},
 daily:{es:'¿Me pones un café, por favor?',en:'Could I have a coffee, please?'},
 work:{es:'¿Podemos hablar mañana?',en:'Could we speak tomorrow?'}
};
const tips={
 connection:{en:'First, check whether another device can connect to the same Wi-Fi network. That helps narrow down whether the issue is with the device or the connection.',es:'Primero, comprueba si otro dispositivo puede conectarse a la misma red wifi. Así podrás distinguir si el fallo está en el equipo o en la conexión.'},
 device:{en:'Restart the device and check whether storage is nearly full. Persistent slowness can have several causes, so a proper review may be needed.',es:'Reinicia el equipo y comprueba si queda poco espacio de almacenamiento. Si sigue lento, puede ser necesario revisar otras causas.'},
 accounts:{en:'If you cannot access an account, use the provider’s official recovery page. Never share passwords or one-time security codes with anyone.',es:'Si no puedes entrar en una cuenta, usa la recuperación oficial del proveedor. Nunca compartas contraseñas ni códigos de seguridad.'}
};
function locale(){return document.documentElement.lang.toLowerCase().startsWith('es')?'es':'en'}
function subjectFor(name){return (locale()==='es'?'Consulta: ':'Enquiry: ')+({translation:locale()==='es'?'traducción':'translation',spanish:locale()==='es'?'clases de español (interés)':'Spanish lessons (interest)',web:locale()==='es'?'desarrollo web':'web development',it:locale()==='es'?'soporte IT':'remote IT support'}[name])}
function enquiry(name){
 const subject=encodeURIComponent(subjectFor(name));
 const body=encodeURIComponent(locale()==='es'?'Hola Bolgsvenia Global,\n\nMe gustaría consultar sobre este servicio.\n\nMi idea o necesidad es:\n\n':'Hello Bolgsvenia Global,\n\nI would like to enquire about this service.\n\nMy idea or requirement is:\n\n');
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
     '<div class="it-output">'+tips[itIssue][L]+'</div>'+'<a class="lab-action" href="'+itGameRoute+'">'+(L==='es'?'Jugar al reto completo':'Play the full troubleshooting game')+' <span aria-hidden="true">↗</span></a>';
   wireVariants(v=>{itIssue=v;render()});
 }
 buttons.forEach(b=>{const v=b.dataset.service===active;b.classList.toggle('is-active',v);b.setAttribute('aria-pressed',String(v))});
}
buttons.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.service;render()}));
// Route the IT demonstration into the full interactive support simulation.
// This link stays on the same language version; it does not connect to the user's device.
const itGameRoute=locale()==='es'?'soporte-informatico.html#fix-it':'it-support.html#fix-it';
const langBtn=document.getElementById('lang-switch');

render();
})();


/* Form constraints mirror the existing site's one-file, five-megabyte limit. */
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('form[data-lead-form]').forEach(form=>{
  const status=form.querySelector('.quote-status');
  const es=document.documentElement.lang.toLowerCase().startsWith('es');
  form.addEventListener('submit',ev=>{
   const file=form.querySelector('input[type="file"]')?.files?.[0];
   if(file&&file.size>5*1024*1024){ev.preventDefault();status.textContent=es?'El archivo supera los 5 MB':'The file is larger than 5 MB';status.hidden=false;status.focus();}
  });
 });
});
