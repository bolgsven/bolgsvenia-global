(() => {
'use strict';
const host=document.getElementById('fix-it-game');
if(!host) return;
const es=document.documentElement.lang.toLowerCase().startsWith('ca');
const words=es?{
 choose:'Tria una incidència', intro:'Tria una situació i decideix què comprovaries primer.',
 wifi:'El wifi no funciona',slow:'Ordinador lent',printer:'La impressora no imprimeix',
 chooseStep:'Què faries ara?',tryAnother:'Prova una altra opció',good:'Bona comprovació',
 next:'Continua',finish:'Veure el resultat',replay:'Torna a jugar',other:'Tria un altre problema',
 done:'Bon diagnòstic!',doneDesc:'Has seguit un procés de comprovació prudent. En una incidència real, el resultat dependria del que es trobés a cada pas.',
 cleared:'Comprovacions encertades',attempts:'Opcions provades',step:'Comprovació',of:'de',practice:'Situació fictícia',
 hint:'Pista',correct:'Correcte',no:'Ara mateix no és la millor opció',
 reset:'Canvia d’incidència',tip:'No es fa cap acció al teu equip',
 }: {
 choose:'Choose an issue',intro:'Pick a situation and decide what you would check first.',
 wifi:'Wi-Fi won’t connect',slow:'Slow computer',printer:'Printer not printing',
 chooseStep:'What would you do next?',tryAnother:'Try another option',good:'Good check',
 next:'Continue',finish:'See result',replay:'Play again',other:'Choose another issue',
 done:'Nice diagnostic thinking!',doneDesc:'You followed a careful troubleshooting path. In real support, the outcome depends on what each check reveals.',
 cleared:'Useful checks',attempts:'Options explored',step:'Check',of:'of',practice:'Fictional scenario',
 hint:'Hint',correct:'Good choice',no:'Not the best next step',
 reset:'Change issue',tip:'No actions are performed on your device',
};
const scenarioNames={wifi:words.wifi,slow:words.slow,printer:words.printer};
const icons={wifi:'⌁',slow:'◷',printer:'▤'};
const scenarios=es?{
 wifi:[
  {q:'El portàtil indica que no té internet. Què comprovaries primer?',a:['Comprovar si un altre dispositiu es connecta a la mateixa xarxa','Restablir el router als valors de fàbrica','Desinstal·lar tots els controladors de xarxa'],right:0,ok:'Comparar-ho amb un altre dispositiu ajuda a distingir un problema del portàtil d’un que afecta tota la xarxa.',wrong:'És un canvi massa dràstic abans de saber quants dispositius estan afectats.',hint:'Primer esbrina si el problema afecta un equip o tots.'},
  {q:'Tampoc hi ha internet al mòbil. Quina comprovació té més sentit?',a:['Reinstal·lar Windows al portàtil','Comprovar els indicadors del router i si el proveïdor informa d’una avaria','Canviar les contrasenyes de tots els comptes'],right:1,ok:'Si fallen diversos dispositius, comprovar el router i l’estat del proveïdor pot ajudar a identificar un problema compartit.',wrong:'Aquesta mesura no aclareix la causa d’una fallada que afecta diversos dispositius.',hint:'Tots dos equips estan afectats. Busca una causa comuna.'},
  {q:'El proveïdor confirma una incidència a la zona. Què faries ara?',a:['Reiniciar el router repetidament fins que funcioni','Esperar que es restableixi el servei i consultar les actualitzacions del proveïdor','Donar accés remot a una persona desconeguda'],right:1,ok:'Si l’avaria està confirmada, no convé fer canvis innecessaris a la configuració. Consulta l’estat del servei.',wrong:'Una incidència externa confirmada no es resol canviant la configuració local ni compartint l’accés.',hint:'L’avaria és fora de la xarxa domèstica.'}
 ],
 slow:[
  {q:'L’ordinador fa dies que va molt lent. Per on comences?',a:['Desactivar permanentment l’antivirus','Reiniciar i comprovar quines aplicacions consumeixen recursos','Comprar memòria RAM sense comprovar res'],right:1,ok:'Reiniciar i revisar l’ús de recursos dona pistes útils sense canviar res important.',wrong:'Abans de comprar components o reduir la seguretat, cal investigar els símptomes.',hint:'Una primera comprovació hauria de ser senzilla i reversible.'},
  {q:'Veus que una aplicació consumeix gairebé tota la CPU. Què fas?',a:['Desar la feina i tancar o actualitzar aquesta aplicació','Eliminar carpetes del sistema a l’atzar','Compartir la contrasenya de l’equip amb un desconegut'],right:0,ok:'Aïllar una aplicació amb un consum anormal permet comprovar si contribueix al problema.',wrong:'Aquesta opció podria provocar pèrdua de dades o comprometre la seguretat.',hint:'Has trobat una aplicació que podria ser-ne responsable.'},
  {q:'Continua lent i queda molt poc espai d’emmagatzematge. Què és prudent?',a:['Desactivar les actualitzacions de seguretat','Esborrar fitxers del sistema sense revisar-los','Fer una còpia de seguretat i alliberar espai de manera controlada'],right:2,ok:'Una còpia de seguretat i una neteja selectiva són més segures que esborrar fitxers a cegues.',wrong:'Evita desactivar mesures de seguretat o eliminar fitxers essencials sense saber què són.',hint:'Protegeix els fitxers importants abans de fer neteja.'}
 ],
 printer:[
  {q:'Envíes un document i la impressora no respon. Què comprovaries?',a:['Reiniciar innecessàriament tots els dispositius de la xarxa','Verificar l’alimentació, la connexió i l’estat de la impressora','Desactivar el tallafoc de l’ordinador'],right:1,ok:'Comprovar que està encesa, connectada i sense avisos d’error és un primer pas segur.',wrong:'És millor començar per les comprovacions més senzilles abans de modificar la xarxa o la seguretat.',hint:'Comença per allò que pots verificar sense canviar la configuració.'},
  {q:'La impressora apareix connectada, però el document està encallat a la cua. Què fas?',a:['Continua enviant el mateix document moltes vegades','Reinstal·lar tot el sistema operatiu','Revisar la cua, cancel·lar la tasca encallada i tornar-ho a provar'],right:2,ok:'Una cua bloquejada pot impedir les impressions següents. Comprova-la abans de fer canvis importants.',wrong:'Això pot allargar la cua o crear problemes innecessaris.',hint:'La pista és a la cua d’impressió.'},
  {q:'Ara veus que hi havia una altra impressora seleccionada. Què faries?',a:['Seleccionar la impressora correcta i imprimir una pàgina de prova','Donar accés remot a una persona desconeguda','Eliminar totes les impressores de l’ordinador'],right:0,ok:'Seleccionar el dispositiu correcte i fer una prova ajuda a confirmar la causa.',wrong:'No cal comprometre la seguretat ni esborrar tota la configuració.',hint:'La tasca s’enviava al dispositiu equivocat.'}
 ]
}:{
 wifi:[
  {q:'Your laptop says there is no internet. What should you check first?',a:['Check whether another device can connect to the same network','Factory-reset the router immediately','Uninstall all network drivers'],right:0,ok:'Testing another device helps separate a laptop-specific problem from a wider connection issue.',wrong:'That is a drastic change before you know whether the issue affects one device or the whole network.',hint:'First find out whether the problem affects one device or several.'},
  {q:'Your phone cannot connect either. What is the most useful next check?',a:['Reinstall Windows on the laptop','Check router status lights and whether the provider reports an outage','Change all of your account passwords'],right:1,ok:'When several devices fail, the router and provider status are sensible places to check for a shared cause.',wrong:'That does not identify why multiple devices lost connectivity.',hint:'Both devices are affected. Look for a common cause.'},
  {q:'Your provider confirms an outage in the area. What next?',a:['Keep repeatedly rebooting the router','Wait for service restoration and check provider updates','Give a stranger remote access to your laptop'],right:1,ok:'Once an external outage is confirmed, avoid needless configuration changes. Follow the provider’s status updates.',wrong:'A confirmed external outage is not fixed by changing local settings or sharing access.',hint:'The fault is outside your home network.'}
 ],
 slow:[
  {q:'Your computer has been unusually slow for several days. Where do you start?',a:['Permanently disable antivirus protection','Restart it and check which apps are using resources','Buy RAM without investigating'],right:1,ok:'A restart and resource check can provide clues without making risky configuration changes.',wrong:'Investigate the symptoms before buying hardware or reducing security.',hint:'Prefer a simple, reversible first check.'},
  {q:'One app is using almost all available CPU. What should you do?',a:['Save your work, then close or update the app','Delete random system folders','Share your device password with an unknown person'],right:0,ok:'Isolating the high-usage application helps test whether it is contributing to the slowdown.',wrong:'That risks losing files or compromising the device.',hint:'You have identified a likely contributor.'},
  {q:'It is still slow and storage is nearly full. What is sensible?',a:['Turn off security updates','Delete system files without checking what they do','Back up important files, then free space carefully'],right:2,ok:'Backing up first and reviewing what can be removed is safer than indiscriminate deletion.',wrong:'Avoid disabling safeguards or deleting important files blindly.',hint:'Protect your data before cleaning up.'}
 ],
 printer:[
  {q:'You send a document but the printer does nothing. What first?',a:['Restart every device on the network without checking','Check the printer is on, connected and has no error message','Disable the computer’s firewall'],right:1,ok:'Power, connection and printer status are safe, useful starting points.',wrong:'Start with simple checks before altering networking or security.',hint:'What can you verify without changing settings?'},
  {q:'The printer is online but the document is stuck in the print queue. What now?',a:['Keep sending the document repeatedly','Reinstall the entire operating system','Check the queue, clear the stuck job and test again'],right:2,ok:'A blocked queue may prevent further printing. Check it before attempting major fixes.',wrong:'This can create more queued work or needless disruption.',hint:'The print queue is the clue.'},
  {q:'You notice the wrong printer was selected. What next?',a:['Choose the correct printer and print a test page','Give an unknown person remote access','Remove every printer from your computer'],right:0,ok:'Selecting the intended printer and testing confirms whether that was the cause.',wrong:'There is no reason to risk security or delete the whole printer configuration.',hint:'The job was going to a different printer.'}
 ]
};
let active='wifi',index=0,tries=0,correct=0,complete=false,locked=false;
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function btn(label,cls,cb){const b=el('button',cls,label);b.type='button';b.addEventListener('click',cb);return b;}
function switchScenario(key){active=key;index=0;tries=0;correct=0;complete=false;locked=false;render();}
function render(){
 host.replaceChildren();
 const top=el('div','fix-casebar');top.append(el('span','fix-case-prompt',words.choose));
 const selection=el('div','fix-cases');
 Object.keys(scenarioNames).forEach(key=>{const b=btn(icons[key]+'  '+scenarioNames[key], 'fix-case'+(active===key?' is-active':''),()=>switchScenario(key));b.setAttribute('aria-pressed',String(active===key));selection.append(b)});
 host.append(top,selection);
 if(!active){host.append(el('p','fix-intro',words.intro));return;}
 const steps=scenarios[active];
 const bar=el('div','fix-progress-head');bar.append(el('span','',`${words.practice} / ${scenarioNames[active]}`));bar.append(el('span','',`${words.cleared}: ${correct}/${steps.length}`));
 host.append(bar);
 const track=el('div','fix-progress-track');const fill=el('div','fix-progress-fill');fill.style.width=(correct/steps.length*100)+'%';track.append(fill);host.append(track);
 if(complete){const done=el('div','fix-done');done.append(el('span','fix-done-icon','✳'));done.append(el('h3','',words.done));done.append(el('p','',words.doneDesc));
 const result=el('p','fix-score',`${words.cleared}: ${correct} · ${words.attempts}: ${tries}`);done.append(result);
 const actions=el('div','fix-footer-actions');actions.append(btn(words.replay,'fix-next',()=>switchScenario(active)));actions.append(btn(words.other,'fix-reset',()=>{active=null;render()}));done.append(actions);host.append(done);return;}
 const step=steps[index];
 const stage=el('div','fix-stage');stage.append(el('span','fix-stage-meta',`${words.step} ${index+1} ${words.of} ${steps.length}`));
 const q=el('h3','fix-question',step.q);q.id='fix-question-current';stage.append(q);
 const options=el('div','fix-choices');const feedback=el('div','fix-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
 step.a.forEach((text,i)=>{
  const b=btn(text,'fix-option',()=>{
    if(locked)return;
    tries++;
    if(i===step.right){locked=true;correct++;b.classList.add('is-correct');Array.from(options.querySelectorAll('button')).forEach(o=>{o.disabled=true});
      feedback.replaceChildren(el('strong','',words.correct),el('p','',step.ok));
      const n=btn(index===steps.length-1?words.finish:words.next,'fix-next',()=>{index++;if(index===steps.length)complete=true;locked=false;render();const heading=host.querySelector('.fix-question, .fix-done h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}});
      feedback.append(n);
      // Make the feedback accessible without obscuring the next step.
    }else {b.classList.add('is-wrong');feedback.replaceChildren(el('strong','',words.no),el('p','',step.wrong));feedback.append(el('p','fix-hint',`${words.hint}: ${step.hint}`));}
  });
  options.append(b);
 });
 stage.append(options,feedback);
 const under=el('div','fix-under');under.append(el('small','',words.tip));under.append(btn(words.reset,'fix-reset',()=>{active=null;render()}));stage.append(under);
 host.append(stage);
}
render();
})();
