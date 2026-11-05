(() => {
'use strict';
const host=document.getElementById('fix-it-game');
if(!host) return;
const es=document.documentElement.lang.toLowerCase().startsWith('es');
const words=es?{
 choose:'Elige una incidencia', intro:'Selecciona una situación y decide qué comprobarías primero.',
 wifi:'El wifi no funciona',slow:'Ordenador lento',printer:'La impresora no imprime',
 chooseStep:'¿Qué harías ahora?',tryAnother:'Prueba otra opción',good:'Buena comprobación',
 next:'Continuar',finish:'Ver resultado',replay:'Volver a jugar',other:'Elegir otro problema',
 done:'¡Buen diagnóstico!',doneDesc:'Has seguido un proceso de comprobación prudente. En una incidencia real, el resultado dependería de lo que se encuentre en cada paso.',
 cleared:'Comprobaciones acertadas',attempts:'Opciones probadas',step:'Comprobación',of:'de',practice:'Situación ficticia',
 hint:'Pista',correct:'Correcto',no:'No es la mejor opción de momento',
 reset:'Cambiar incidencia',tip:'Ninguna acción se realiza sobre tu equipo',
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
  {q:'Tu portátil indica que no tiene internet. ¿Qué comprobarías primero?',a:['Probar si otro dispositivo se conecta a la misma red','Restablecer el router a los ajustes de fábrica','Desinstalar todos los controladores de red'],right:0,ok:'Comparar con otro dispositivo ayuda a distinguir un problema del portátil de otro que afecta a toda la red.',wrong:'Es un cambio demasiado drástico antes de saber a cuántos dispositivos afecta la incidencia.',hint:'Primero intenta averiguar si el problema afecta a uno o a todos los equipos.'},
  {q:'Tampoco hay internet en el móvil. ¿Qué comprobación tiene más sentido?',a:['Reinstalar Windows en el portátil','Revisar los indicadores del router y si el proveedor informa de una avería','Cambiar las contraseñas de todas las cuentas'],right:1,ok:'Si fallan varios dispositivos, revisar el router y el estado del proveedor puede ayudar a identificar un problema compartido.',wrong:'Esa medida no aclara la causa de un fallo que afecta a varios dispositivos.',hint:'Ambos equipos están afectados. Busca una causa compartida.'},
  {q:'El proveedor confirma una incidencia en la zona. ¿Qué harías ahora?',a:['Reiniciar el router repetidamente hasta que funcione','Esperar la restauración del servicio y consultar las actualizaciones del proveedor','Conceder acceso remoto a una persona desconocida'],right:1,ok:'Si la avería está confirmada, no conviene realizar cambios innecesarios en la configuración. Consulta el estado del servicio.',wrong:'Una incidencia externa confirmada no se resuelve cambiando la configuración local ni compartiendo el acceso.',hint:'La avería está fuera de tu red doméstica.'}
 ],
 slow:[
  {q:'El ordenador lleva días funcionando muy lento. ¿Por dónde empiezas?',a:['Desactivar permanentemente el antivirus','Reiniciar y comprobar qué aplicaciones consumen recursos','Comprar memoria RAM sin comprobar nada'],right:1,ok:'El reinicio y la revisión del uso de recursos ofrecen pistas útiles sin cambiar nada importante.',wrong:'Antes de comprar componentes o reducir la seguridad, hay que investigar los síntomas.',hint:'Una primera comprobación debería ser sencilla y reversible.'},
  {q:'Ves que una aplicación consume casi toda la CPU. ¿Qué haces?',a:['Guardar el trabajo y cerrar o actualizar esa aplicación','Eliminar carpetas del sistema al azar','Compartir la contraseña del equipo con un desconocido'],right:0,ok:'Aislar una aplicación con consumo anormal permite comprobar si es parte del problema.',wrong:'Esa opción podría provocar pérdida de datos o comprometer la seguridad.',hint:'Has encontrado una aplicación posiblemente responsable.'},
  {q:'Sigue lento y queda muy poco espacio de almacenamiento. ¿Qué es prudente?',a:['Desactivar las actualizaciones de seguridad','Borrar archivos del sistema sin revisarlos','Hacer copia de seguridad y liberar espacio de forma controlada'],right:2,ok:'Una copia de seguridad y una limpieza selectiva son más seguras que borrar archivos a ciegas.',wrong:'Evita desactivar medidas de seguridad o eliminar archivos esenciales sin saber qué son.',hint:'Protege los archivos importantes antes de hacer una limpieza.'}
 ],
 printer:[
  {q:'Envías un documento y la impresora no responde. ¿Qué comprobarías?',a:['Reiniciar todos los dispositivos de la red sin necesidad','Verificar alimentación, conexión y estado de la impresora','Desactivar el cortafuegos del ordenador'],right:1,ok:'Comprobar que está encendida, conectada y sin avisos de error es un primer paso seguro.',wrong:'Es mejor empezar por las comprobaciones más simples antes de modificar la red o la seguridad.',hint:'Empieza por lo que puedes verificar sin cambiar la configuración.'},
  {q:'La impresora aparece conectada, pero el documento está atascado en la cola. ¿Qué haces?',a:['Seguir enviando el mismo documento muchas veces','Reinstalar todo el sistema operativo','Revisar la cola, cancelar el trabajo atascado y probar otra vez'],right:2,ok:'Una cola bloqueada puede impedir las siguientes impresiones. Compruébala antes de cambios mayores.',wrong:'Esto puede aumentar la cola o crear problemas innecesarios.',hint:'La pista está en la cola de impresión.'},
  {q:'Ahora ves que estaba seleccionada otra impresora. ¿Qué harías?',a:['Seleccionar la impresora correcta e imprimir una página de prueba','Dar acceso remoto a una persona desconocida','Eliminar todas las impresoras del ordenador'],right:0,ok:'Seleccionar el dispositivo correcto y hacer una prueba ayuda a confirmar la causa.',wrong:'No es necesario comprometer la seguridad ni borrar toda la configuración.',hint:'El trabajo estaba dirigido al dispositivo equivocado.'}
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
