/* Bolgsvenia Global | Harbour conversational assistant | v1.7.5
 * AI enquiries use a same-origin Netlify Function with no browser API key.
 * Guided quotations remain local and require explicit form submission.
 * No persistent conversation storage, cookies, telemetry or chat uploads.
 */
(() => {
  'use strict';
  const root = document.querySelector('[data-bg-assistant]');
  if (!root) return;

  const pageLang = document.documentElement.lang.toLowerCase();
  const lang = pageLang.startsWith('ca') ? 'ca' : pageLang.startsWith('es') ? 'es' : 'en';
  const el = (selector) => root.querySelector(selector);
  const panel = el('[data-bg-panel]');
  const launcher = el('[data-bg-launcher]');
  const close = el('[data-bg-close]');
  const transcript = el('[data-bg-transcript]');
  const quick = el('[data-bg-quick]');
  const input = el('[data-bg-input]');
  const inputForm = el('[data-bg-input-form]');
  const status = el('[data-bg-status]');
  const restart = el('[data-bg-restart]');
  const sendButton = inputForm.querySelector('button[type="submit"]');
  // On iOS, automatically focusing a small-font input opens the keyboard and
  // can zoom/pan the entire fixed chat widget. Focus only on wider screens.
  const focusComposerIfDesktop = () => {
    if (!window.matchMedia('(max-width: 580px)').matches) {
      input.focus({preventScroll: true});
    }
  };
  const chatSubtitle = panel.querySelector('.bg-chat-head small');
  if (lang === 'en' && chatSubtitle) {
    chatSubtitle.textContent = 'English, Spanish & Catalan · General enquiries · Personal quotations';
  }
  let aiBusy = false;
  let pendingAIController = null;
  let aiRequestId = 0;
  let aiHistory = []; // Memory lives in this tab only; never localStorage or cookies.
  let aiConversationStarted = false;
  let suggestionsOpen = true;
  let privacyExpanded = false;
  // GitHub Pages hosts the static site; Netlify securely hosts the paid AI backend.
  // The OpenAI key is never included in this public JavaScript file.
  const aiEndpoint = 'https://darling-travesseiro-9313cc.netlify.app/api/harbour-assistant';

  // A single scroll region owns both replies and guided choices. The composer stays visible.
  // Moving nodes (rather than duplicating them) preserves the current quotation wizard.
  const chatViewport = document.createElement('div');
  chatViewport.className = 'bg-chat-viewport';
  chatViewport.setAttribute('role', 'region');
  chatViewport.tabIndex = 0; // Keyboard users can scroll long conversations.
  chatViewport.setAttribute('aria-label', lang === 'ca' ? 'Conversa i opcions' : lang === 'es' ? 'Conversación y opciones' : 'Conversation and choices');
  transcript.before(chatViewport);
  chatViewport.append(transcript, quick);

  // Optional shortcuts move behind a small, labelled header control after free-text chat begins.
  const suggestionsButton = document.createElement('button');
  suggestionsButton.type = 'button';
  suggestionsButton.className = 'bg-chat-icon bg-chat-suggestions-button';
  suggestionsButton.textContent = '⋯';
  suggestionsButton.hidden = true;
  suggestionsButton.setAttribute('aria-label', lang === 'ca' ? 'Mostra suggeriments' : lang === 'es' ? 'Mostrar sugerencias' : 'Show suggested topics');
  suggestionsButton.title = lang === 'ca' ? 'Suggeriments' : lang === 'es' ? 'Sugerencias' : 'Suggestions';
  quick.id ||= 'bg-chat-suggestions';
  suggestionsButton.setAttribute('aria-controls', quick.id);
  suggestionsButton.setAttribute('aria-expanded', 'false');
  restart.before(suggestionsButton);

  // AI-only consent. The guided quotation can be used without this opt-in.
  const aiNotice = document.createElement('label');
  aiNotice.className = 'bg-ai-privacy-choice';
  const aiConsent = document.createElement('input');
  aiConsent.type = 'checkbox';
  aiConsent.setAttribute('aria-label', lang === 'ca' ? 'Accepto enviar els meus missatges al proveïdor d’IA' : lang === 'es' ? 'Acepto enviar mis mensajes al proveedor de IA' : 'I agree to send chat messages to the AI provider');
  const aiConsentText = document.createElement('span');
  aiConsentText.textContent = lang === 'ca' ? 'IA opcional: els missatges i l’historial recent s’enviaran a OpenAI per generar una resposta. No escrigui dades personals ni documents confidencials. ' : lang === 'es'
    ? 'IA opcional: los mensajes y el historial reciente se enviarán a OpenAI para generar la respuesta. No escriba datos personales ni documentos confidenciales. '
    : 'Optional AI: your messages and recent chat history will be sent to OpenAI to generate a reply. Do not enter personal details or confidential documents. ';
  const aiNoticeLink = document.createElement('a');
  aiNoticeLink.href = lang === 'ca' ? 'avis-ia.html' : lang === 'es' ? 'aviso-ia.html' : 'ai-privacy.html';
  aiNoticeLink.target = '_blank';
  aiNoticeLink.rel = 'noopener noreferrer';
  aiNoticeLink.textContent = lang === 'ca' ? 'Avís de privadesa de la IA' : lang === 'es' ? 'Aviso de privacidad de IA' : 'AI privacy information';
  aiNotice.append(aiConsent, aiConsentText, aiNoticeLink);

  // Keep a compact, always-available privacy control after informed consent.
  // Clicking Privacy settings expands the original disclosure and its checked opt-out control.
  const aiCompact = document.createElement('div');
  aiCompact.className = 'bg-ai-privacy-compact';
  aiCompact.hidden = true;
  const aiEnabledLabel = document.createElement('span');
  aiEnabledLabel.className = 'bg-ai-enabled-label';
  aiEnabledLabel.textContent = lang === 'ca' ? '✓ Consentiment actiu' : lang === 'es' ? '✓ Consentimiento activo' : '✓ AI consent on';
  const privacySettingsButton = document.createElement('button');
  privacySettingsButton.type = 'button';
  privacySettingsButton.textContent = lang === 'ca' ? 'Privadesa' : lang === 'es' ? 'Privacidad' : 'Privacy settings';
  privacySettingsButton.setAttribute('aria-expanded', 'false');
  aiNotice.id = 'bg-ai-consent-details';
  privacySettingsButton.setAttribute('aria-controls', aiNotice.id);
  aiCompact.append(aiEnabledLabel, privacySettingsButton);
  inputForm.before(aiNotice, aiCompact);

  const aiChoiceCSS = document.createElement('style');
  aiChoiceCSS.textContent = `
    /* Harbour 1.7.2: the transcript and suggestions now share ONE scrollable region. */
    .bg-chat-viewport{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;background:var(--bg-paper);scrollbar-width:thin;scrollbar-color:#b7c8c2 transparent}
    .bg-chat-viewport>.bg-chat-transcript{flex:none;min-height:0;overflow:visible;padding-bottom:8px}
    .bg-chat-viewport>.bg-chat-quick{flex:none;max-height:none;overflow:visible;border-top:0;background:var(--bg-paper);padding:0 14px 15px}
    .bg-ai-privacy-choice{display:flex;flex-wrap:wrap;align-items:flex-start;gap:.35rem;margin:0;padding:.6rem .7rem;border-top:1px solid #cadbd6;background:#f0f6f3;color:#233e48;font-size:.72rem;line-height:1.4}
    .bg-ai-privacy-choice input{width:16px;height:16px;flex:none;margin:.1rem .2rem 0 0;accent-color:#376d6c}
    .bg-ai-privacy-choice span{flex:1 1 75%}
    .bg-ai-privacy-choice a{color:#175755;text-decoration:underline;overflow-wrap:anywhere}
    .bg-ai-privacy-choice:focus-within{outline:2px solid #376d6c;outline-offset:-2px}
    .bg-ai-privacy-compact{min-height:37px;padding:6px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid #cadbd6;background:#f0f6f3;font-size:12px;color:#23444a;line-height:1.35}
    .bg-ai-enabled-label{font-weight:750;color:#285f54}
    .bg-ai-privacy-compact button{padding:4px 5px;border:0;border-radius:4px;background:transparent;color:#165853;text-decoration:underline;text-underline-offset:2px;font-size:12px;font-weight:650}
    .bg-ai-privacy-compact button:hover{background:#dcebe4}
    .bg-chat-suggestions-button{font-size:22px;font-weight:bold;line-height:1}
    .bg-chat-form-link{align-self:flex-start;margin:8px 0 0;background:#e4f0ea;color:#204c49;border:1px solid #9abbb0;border-radius:9px;padding:9px 13px;font-size:12px;font-weight:700;line-height:1.25;cursor:pointer}
    .bg-chat-form-link:hover{background:#d0e6dc;border-color:#548b7e}
    [data-bg-assistant] .bg-chat-quick[hidden],
    [data-bg-assistant] .bg-ai-privacy-choice[hidden],
    [data-bg-assistant] .bg-ai-privacy-compact[hidden],
    [data-bg-assistant] .bg-chat-suggestions-button[hidden]{display:none!important}
    @media(max-width:580px){.bg-chat-viewport>.bg-chat-quick{padding:0 12px 13px}.bg-ai-privacy-compact{padding:5px 10px}}
    /* 2026-10-27 iPhone stability: prevent Safari 13px-input zoom and panel overflow. */
    @media (max-width:580px) {
      [data-bg-assistant] {
        left: 10px;
        right: 10px;
        max-width: none;
        min-width: 0;
      }
      [data-bg-assistant] .bg-chat-panel {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        min-height: 0;
        height: min(74dvh, 660px);
        max-height: calc(100dvh - 80px);
        overflow: hidden;
      }
      [data-bg-assistant] .bg-chat-head,
      [data-bg-assistant] .bg-chat-viewport,
      [data-bg-assistant] .bg-chat-input-form {
        width: 100%;
        min-width: 0;
      }
      [data-bg-assistant] .bg-chat-head > div:first-child {flex:1 1 auto;min-width:0}
      [data-bg-assistant] .bg-chat-head-actions {flex:0 0 auto}
      [data-bg-assistant] .bg-chat-head strong,
      [data-bg-assistant] .bg-chat-head small {overflow-wrap:anywhere}
      [data-bg-assistant] .bg-chat-viewport {overflow-x:hidden}
      [data-bg-assistant] .bg-chat-row {min-width:0}
      [data-bg-assistant] .bg-chat-bubble {max-width:100%;overflow-wrap:anywhere}
      [data-bg-assistant] .bg-chat-input-form input {
        min-width:0;
        font-size:16px;
        line-height:1.3;
      }
      [data-bg-assistant] .bg-chat-send {flex:0 0 43px}
    }
  `;
  document.head.append(aiChoiceCSS);

  function scrollChatDown() {
    chatViewport.scrollTop = chatViewport.scrollHeight;
  }
  function updatePrivacyUI() {
    aiNotice.hidden = aiConsent.checked && !privacyExpanded;
    aiCompact.hidden = !aiConsent.checked;
    privacySettingsButton.setAttribute('aria-expanded', String(aiConsent.checked && privacyExpanded));
    privacySettingsButton.textContent = privacyExpanded
      ? (lang === 'ca' ? 'Amaga els ajustos' : lang === 'es' ? 'Ocultar ajustes' : 'Hide settings')
      : (lang === 'ca' ? 'Privadesa' : lang === 'es' ? 'Privacidad' : 'Privacy settings');
  }
  function updateSuggestionsUI() {
    const canToggle = aiConversationStarted && stage === 'idle';
    suggestionsButton.hidden = !canToggle;
    quick.hidden = canToggle && !suggestionsOpen;
    suggestionsButton.setAttribute('aria-expanded', String(canToggle && suggestionsOpen));
    suggestionsButton.setAttribute('aria-label', (canToggle && suggestionsOpen)
      ? (lang === 'ca' ? 'Amaga els suggeriments' : lang === 'es' ? 'Ocultar sugerencias' : 'Hide suggested topics')
      : (lang === 'ca' ? 'Mostra suggeriments' : lang === 'es' ? 'Mostrar sugerencias' : 'Show suggested topics'));
    suggestionsButton.title = lang === 'ca' ? 'Suggeriments' : lang === 'es' ? 'Sugerencias' : 'Suggestions';
    scrollChatDown();
  }
  function cancelPendingAI() {
    aiRequestId += 1;
    if (pendingAIController) pendingAIController.abort();
    pendingAIController = null;
    aiBusy = false;
    input.disabled = false;
    sendButton.disabled = false;
  }
  aiConsent.addEventListener('change', () => {
    privacyExpanded = false;
    if (!aiConsent.checked) {
      // Revoke consent for future requests; clear in-memory model history and cancel pending replies.
      cancelPendingAI();
      aiHistory = [];
      status.textContent = lang === 'ca' ? 'Ha desactivat la IA. No s’enviaran més missatges sense el seu consentiment.' : lang === 'es'
        ? 'Ha desactivado la IA. No se enviarán más mensajes sin su consentimiento.'
        : 'AI consent withdrawn. No further messages will be sent without consent.';
    }
    updatePrivacyUI();
    if (aiConsent.checked) privacySettingsButton.focus();
  });
  privacySettingsButton.addEventListener('click', () => {
    privacyExpanded = !privacyExpanded;
    updatePrivacyUI();
    if (privacyExpanded) aiConsent.focus();
  });
  suggestionsButton.addEventListener('click', () => {
    suggestionsOpen = !suggestionsOpen;
    updateSuggestionsUI();
    if (suggestionsOpen) {
      const first = quick.querySelector('button');
      if (first) first.focus({preventScroll:true});
    }
  });
  updatePrivacyUI();

  const documents = [
    ['Birth certificate', 'Birth certificate', 'Certificado de nacimiento', 'Certificat de naixement'],
    ['Marriage certificate', 'Marriage certificate', 'Certificado de matrimonio', 'Certificat de matrimoni'],
    ['Academic document', 'Academic document', 'Documento académico', 'Document acadèmic'],
    ['CV', 'CV / résumé', 'Currículum / CV', 'Currículum / CV'],
    ['Legal or administrative document', 'Legal / administrative', 'Documento jurídico / administrativo', 'Document jurídic o administratiu'],
    ['Business document', 'Business document', 'Documento empresarial', 'Document empresarial'],
    ['Other', 'Other', 'Otro', 'Altres']
  ];
  const certOptions = [
    ['Not sure', 'Not sure', 'No lo sé', 'No ho sé'],
    ['Standard translation', 'Standard translation', 'Traducción sin certificación', 'Traducció sense certificació'],
    ['UK certified statement', 'UK certification statement', 'Declaración de certificación (Reino Unido)', 'Declaració de certificació (Regne Unit)'],
    ['Spanish sworn translation', 'Sworn translation for Spain', 'Traducción jurada para España', 'Traducció jurada per a Espanya']
  ];
  const translations = {

    ca: {
      intro: 'Hola. Soc l’assistent d’IA de Bolgsvenia Global. Pot fer consultes sobre traduccions, desenvolupament web o assistència informàtica, o preparar una sol·licitud de pressupost guiat. No comparteixi dades personals ni el contingut de documents.',
      ask: 'En què el puc ajudar?',
      quote: 'Demanar un pressupost personalitzat', pricing: 'Com es preparen els pressupostos', documents: 'Documents', certification: 'Certificació', times: 'Terminis', human: 'Contactar amb una persona',
      priceA: 'Preparem pressupostos personalitzats segons les llengües, l’extensió, el format, el termini i la finalitat. Aquest assistent no calcula preus. Triï la sol·licitud de pressupost, prepari les dades i enviï el formulari. Pot demanar una resposta per correu electrònic, trucada o SMS.',
      documentsA: 'Oferim traduccions en totes dues direccions entre anglès i castellà, anglès i català, i castellà i català. Podem valorar certificats i documents acadèmics, jurídics, administratius i empresarials. No oferim traduccions a l’urdú ni al xinès.',
      certA: 'Per a determinats tràmits al Regne Unit pot ser adequada una declaració de certificació signada. Per a documents destinats a Espanya pot ser necessària una traducció jurada feta per un professional habilitat. Els requisits depenen de l’entitat destinatària; indiqui’ns on es presentarà el document.',
      timesA: 'El termini depèn de l’extensió, el format, la combinació lingüística i els requisits. Confirmarem la disponibilitat i la data de lliurament abans d’acceptar l’encàrrec. Si és urgent, indiqui la data límit al formulari.',
      humanA: 'Una persona revisarà la seva sol·licitud. Al formulari pot triar correu electrònic, trucada o SMS i indicar les dades de contacte, o bé escriure a bolgsvenia.global@bolgsvenia.com. Aquest xat no envia consultes.',
      fallback: 'Puc explicar-li com preparem els pressupostos, quins documents valorem, les certificacions i els terminis, o indicar-li on és el formulari de consulta. Rebrà una resposta personal.',
      sourceQ: 'En quina llengua està escrit el document?', targetQ: 'A quina llengua vol traduir-lo?',
      documentQ: 'Quin tipus de document té? Triï una categoria i no en copiï el contingut aquí.',
      pagesQ: 'Quantes pàgines té aproximadament? Escrigui un nombre de l’1 al 999 o triï «No ho sé».',
      countryQ: 'A quin país s’utilitzarà la traducció?', certificationQ: 'Quina certificació necessita, si escau?',
      deadlineQ: 'En quin termini preferiria rebre-la? Pot indicar una data exacta al formulari.', contactQ: 'Com prefereix rebre la nostra resposta? Les dades de contacte s’introdueixen al formulari, no aquí.',
      contactEmail: 'Correu electrònic', contactCall: 'Trucada telefònica', contactSms: 'Missatge de text (SMS)',
      enName: 'Anglès', esName: 'Castellà', caName: 'Català', unsure: 'No ho sé', skip: 'No ho sé / omet', otherForm: 'Altres / ho indicaré al formulari', uk: 'Regne Unit', spain: 'Espanya',
      flexible: 'Sense data fixa', oneWeek: 'En una setmana', twoWeeks: 'En dues setmanes', dateForm: 'Indicaré la data al formulari',
      invalidPages: 'Introdueixi un nombre enter entre 1 i 999 o triï «No ho sé».',
      invalidInput: 'Faci servir una de les opcions anteriors. També pot reiniciar la conversa per fer una consulta general.',
      summary: 'Aquestes són les dades recollides. No s’ha calculat cap pressupost ni s’ha enviat cap consulta.',
      prepare: 'Emplenar el formulari', again: 'Tornar a començar',
      formReady: 'He traslladat les dades al formulari. Revisi-les i indiqui el nom i el correu electrònic; si prefereix una trucada o un SMS, afegeixi el telèfon. Llegeixi l’avís de privadesa i enviï personalment el formulari. Aquest xat no ha enviat res.',
      formReadyLimited: 'He traslladat les opcions al formulari, però no he modificat el seu missatge perquè no hi cabia el resum. Revisi’l i afegeixi la informació que falti. No s’ha enviat res.',
      missingForm: 'No he trobat el formulari en aquesta pàgina. Accedeixi a la pàgina de consultes de traducció i inclogui-hi el resum.',
      sourceL: 'Traduir de', targetL: 'Traduir a', documentL: 'Document', pagesL: 'Pàgines', countryL: 'País d’ús', certL: 'Certificació', deadlineL: 'Termini', contactL: 'Resposta preferida',
      none: 'Sense especificar', copied: 'Dades traslladades al formulari', introStatus: 'Assistent automàtic disponible', resetStatus: 'Conversa reiniciada',
      privacyReminder: 'L’assistent d’IA és opcional. No comparteixi documents personals ni dades confidencials. Les respostes del pressupost guiat romanen en aquesta pestanya i no s’envien mitjançant el xat.',
      open: 'Obre l’assistent de traducció', close: 'Tanca l’assistent de traducció', send: 'Envia el missatge', inputPlaceholder: 'Pregunti per traduccions, webs o assistència informàtica…',
      assistantName: 'Assistent d’IA de Bolgsvenia', you: 'Vostè', bot: 'Assistent',
      personalWarn: 'No comparteixi noms, adreces, textos de documents, números d’identitat ni informació sensible. Utilitzi el formulari per a les dades de contacte. No s’ha enviat cap missatge.'
    },
    en: {
      intro: 'Hello. I am the Bolgsvenia Global AI assistant. Ask about translations, website development or IT support, or choose a guided quotation. Please do not share personal details or document contents here.',
      ask: 'What would you like help with?',
      quote: 'Request a personal quote', pricing: 'How pricing works', documents: 'Documents', certification: 'Certification', times: 'Turnaround', human: 'Contact a person',
      priceA: 'We prepare quotations personally, based on the languages, length, format, deadline and intended use. This assistant cannot calculate prices. Choose the personal quote option to gather the details, then submit the enquiry form. We can reply by email, phone or SMS according to your preference.',
      documentsA: 'We offer translation in both directions between English and Spanish, English and Catalan, and Spanish and Catalan. We can discuss certificates, academic records, legal or administrative documents and business materials, subject to review. We do not offer Urdu or Chinese translation services.',
      certA: 'For some UK uses, a signed certification statement may be appropriate. Documents for use in Spain may instead require a sworn translator authorised for that purpose. Requirements depend on the receiving organisation, so please tell us where the translation will be submitted.',
      timesA: 'Timescales depend on the word count, document format, language direction and requirements. We will confirm availability and timing before accepting a job. For urgent work, please include your deadline in the enquiry form.',
      humanA: 'Your request is reviewed by a person. Use the enquiry form to choose email, phone or SMS and leave the appropriate contact details, or email bolgsvenia.global@bolgsvenia.com directly. No information is sent from this chat.',
      fallback: 'I can explain our personal quotation process, document types, certification and timing, or guide you to the enquiry form. You will receive a reply from a person.',
      sourceQ: 'Which language is the original document in?', targetQ: 'Which language should we translate it into?',
      documentQ: 'What kind of document do you have? Please choose a category; do not paste its contents.',
      pagesQ: 'Approximately how many pages? Type a number from 1 to 999, or select “Not sure”.',
      countryQ: 'Where will the translation be used?',
      certificationQ: 'What certification is required, if any?',
      deadlineQ: 'What timeframe would you prefer? You can enter an exact date in the enquiry form.', contactQ: 'How would you like us to reply? You will enter contact details securely in the enquiry form, not here.', contactEmail: 'Email', contactCall: 'Phone call', contactSms: 'Text message (SMS)',
      enName: 'English', esName: 'Spanish', caName: 'Catalan',
      unsure: 'Not sure', skip: 'Not sure / skip', otherForm: 'Other / tell us in the form', uk: 'United Kingdom', spain: 'Spain',
      flexible: 'Flexible', oneWeek: 'Within 1 week', twoWeeks: 'Within 2 weeks', dateForm: 'I will enter a date in the form',
      invalidPages: 'Please enter a whole number between 1 and 999, or choose “Not sure”.',
      invalidInput: 'Please use one of the choices above. You can also ask a general question by restarting the conversation.',
      summary: 'Here is the information gathered so far. No quotation has been calculated and nothing has been sent.',
      prepare: 'Fill enquiry form', again: 'Start over',
      formReady: 'Your answers have been added to the enquiry form. Please check them, enter your name and email and (if requesting a call or SMS) your phone number. Then review the privacy notice and submit the form yourself. No message has been sent by chat.',
      formReadyLimited: 'Your selections were transferred, but your existing message was kept unchanged because there was not enough space for the assistant summary. Please review the form and add any missing details yourself. Nothing was sent.',
      missingForm: 'I could not find the form on this page. Please use the translation enquiry page and provide the summary yourself.',
      sourceL: 'Translate from', targetL: 'Translate into', documentL: 'Document', pagesL: 'Pages', countryL: 'Country of use', certL: 'Certification', deadlineL: 'Timeframe', contactL: 'Preferred reply',
      none: 'Not specified', copied: 'Details transferred to form', introStatus: 'Automated assistant ready', resetStatus: 'Conversation restarted',
      privacyReminder: 'The AI assistant is optional. Do not share personal documents or confidential data. Guided quotation answers stay in this browser and are not submitted by chat.',
      open: 'Open translation assistant', close: 'Close translation assistant', send: 'Send message', inputPlaceholder: 'Ask about translation, websites or IT support…',
      assistantName: 'Bolgsvenia AI assistant', you: 'You', bot: 'Assistant',
      personalWarn: 'Please do not share names, addresses, document text, passport details or other sensitive information. Use the enquiry form for contact details. No chat message has been sent.'
    },
    es: {
      intro: 'Hola. Soy el asistente de IA de Bolgsvenia Global. Puede consultar sobre traducciones, desarrollo web o soporte informático, o preparar un presupuesto guiado. No comparta datos personales ni el contenido de documentos.',
      ask: '¿En qué puedo ayudarle?',
      quote: 'Solicitar presupuesto personal', pricing: 'Cómo se presupuestan', documents: 'Documentos', certification: 'Certificación', times: 'Plazos', human: 'Contactar con una persona',
      priceA: 'Preparamos los presupuestos personalmente según los idiomas, la extensión, el formato, el plazo y la finalidad. Este asistente no calcula precios. Elija «Solicitar presupuesto personal» para preparar los datos y después envíe el formulario. Puede solicitar respuesta por correo, llamada o SMS.',
      documentsA: 'Ofrecemos traducciones en ambos sentidos entre inglés y español, inglés y catalán, y español y catalán. Podemos valorar certificados y documentos académicos, jurídicos, administrativos y empresariales. No ofrecemos servicios de traducción al urdu ni al chino.',
      certA: 'Para determinados trámites en el Reino Unido puede resultar adecuada una declaración de certificación firmada. Para documentos que deban surtir efectos en España puede exigirse una traducción jurada realizada por un traductor habilitado. Los requisitos dependen de la entidad destinataria; indíquenos dónde se presentará.',
      timesA: 'El plazo depende de la extensión, el formato, la combinación lingüística y los requisitos. Confirmaremos nuestra disponibilidad y la fecha de entrega antes de aceptar el encargo. Si es urgente, indique su fecha límite en el formulario.',
      humanA: 'Una persona revisará su solicitud. Puede elegir correo electrónico, llamada o SMS en el formulario e introducir allí sus datos de contacto, o escribir a bolgsvenia.global@bolgsvenia.com. Este chat no envía información.',
      fallback: 'Puedo explicarle cómo preparamos los presupuestos, los tipos de documentos, las certificaciones y los plazos, o guiarle hasta el formulario de consulta. La respuesta será personal.',
      sourceQ: '¿En qué idioma está redactado el documento?', targetQ: '¿A qué idioma desea traducirlo?',
      documentQ: '¿Qué tipo de documento tiene? Seleccione una categoría sin copiar aquí su contenido.',
      pagesQ: '¿Cuántas páginas tiene aproximadamente? Escriba un número del 1 al 999 o elija «No lo sé».',
      countryQ: '¿En qué país se utilizará la traducción?',
      certificationQ: '¿Qué tipo de certificación necesita?',
      deadlineQ: '¿En qué plazo preferiría recibirla? Puede indicar una fecha exacta en el formulario.', contactQ: '¿Cómo prefiere recibir nuestra respuesta? Los datos de contacto se introducen en el formulario, no aquí.', contactEmail: 'Correo electrónico', contactCall: 'Llamada telefónica', contactSms: 'Mensaje de texto (SMS)',
      enName: 'Inglés', esName: 'Español', caName: 'Catalán',
      unsure: 'No lo sé', skip: 'No lo sé / omitir', otherForm: 'Otro / lo indicaré en el formulario', uk: 'Reino Unido', spain: 'España',
      flexible: 'Sin fecha fija', oneWeek: 'En una semana', twoWeeks: 'En dos semanas', dateForm: 'Indicaré la fecha en el formulario',
      invalidPages: 'Introduzca un número entero entre 1 y 999, o seleccione «No lo sé».',
      invalidInput: 'Utilice una de las opciones anteriores. También puede reiniciar la conversación para hacer una consulta general.',
      summary: 'Estos son los datos recopilados. No se ha calculado un presupuesto ni se ha enviado ninguna información.',
      prepare: 'Rellenar el formulario', again: 'Empezar de nuevo',
      formReady: 'He trasladado los datos al formulario. Revíselo, escriba su nombre y correo electrónico y, si desea una llamada o SMS, añada su teléfono. Lea el aviso de privacidad y envíe el formulario. Este chat no ha enviado nada.',
      formReadyLimited: 'He trasladado las opciones al formulario, pero no he modificado su mensaje porque no había espacio para el resumen. Revise el formulario y añada los detalles que falten. No se ha enviado nada.',
      missingForm: 'No he encontrado el formulario en esta página. Acceda a la página de consultas de traducción e incluya allí el resumen.',
      sourceL: 'Traducir desde', targetL: 'Traducir a', documentL: 'Documento', pagesL: 'Páginas', countryL: 'País de uso', certL: 'Certificación', deadlineL: 'Plazo', contactL: 'Respuesta preferida',
      none: 'Sin especificar', copied: 'Datos trasladados al formulario', introStatus: 'Asistente automático disponible', resetStatus: 'Conversación reiniciada',
      privacyReminder: 'El asistente de IA es opcional. No comparta documentos personales ni datos confidenciales. Las respuestas del presupuesto guiado permanecen en esta pestaña y no se envían por el chat.',
      open: 'Abrir asistente de traducción', close: 'Cerrar asistente de traducción', send: 'Enviar mensaje', inputPlaceholder: 'Pregunte por traducción, páginas web o soporte…',
      assistantName: 'Asistente de IA de Bolgsvenia', you: 'Usted', bot: 'Asistente',
      personalWarn: 'No comparta nombres, direcciones, textos de documentos, números de identidad ni información sensible. Utilice el formulario para los datos de contacto. No se ha enviado el mensaje.'
    }
  };
  const t = translations[lang];
  const aiCopy = {

    ca: {
      thinking: 'Preparant la resposta…',
      unavailable: 'L’assistent d’IA no està disponible ara mateix. Pot utilitzar el pressupost guiat o escriure a bolgsvenia.global@bolgsvenia.com. No s’ha enviat cap missatge al proveïdor d’IA.',
      connection: 'L’assistent d’IA no està disponible temporalment. Torni-ho a provar més tard o utilitzi el pressupost guiat. També pot escriure a bolgsvenia.global@bolgsvenia.com.',
      restricted: 'No introdueixi dades personals, confidencials ni identificatives. Utilitzi el formulari per indicar les dades de contacte.'
    },
    en: {
      thinking: 'Preparing a reply…',
      unavailable: 'The AI assistant is currently unavailable. You can use the guided quotation or email bolgsvenia.global@bolgsvenia.com. No message was sent to the AI provider.',
      connection: 'The AI assistant is temporarily unavailable. Please try again later or use the guided quotation. You can also email bolgsvenia.global@bolgsvenia.com.',
      restricted: 'Please do not enter personal, confidential or identity information here. Our enquiry form is the appropriate place for contact details.',
    },
    es: {
      thinking: 'Preparando respuesta…',
      unavailable: 'El asistente de IA no está disponible en este momento. Puede utilizar el formulario de presupuesto o escribir a bolgsvenia.global@bolgsvenia.com. No se ha enviado ningún mensaje al proveedor de IA.',
      connection: 'El asistente de IA no está disponible temporalmente. Pruebe más tarde o utilice el presupuesto guiado. También puede escribir a bolgsvenia.global@bolgsvenia.com.',
      restricted: 'No escriba información personal, confidencial ni de identidad. Utilice el formulario de consulta para indicar sus datos de contacto.',
    }
  }[lang];
  const quote = {};
  let stage = 'idle';
  let openedOnce = false;
  let count = 0;

  launcher.setAttribute('aria-label', t.open);
  close.setAttribute('aria-label', t.close);
  input.placeholder = t.inputPlaceholder;
  input.setAttribute('aria-label', t.inputPlaceholder);
  sendButton.setAttribute('aria-label', t.send);
  panel.setAttribute('aria-label', t.assistantName);

  function say(message, by = 'bot') {
    const row = document.createElement('div');
    row.className = `bg-chat-row bg-chat-row--${by}`;
    const name = document.createElement('span');
    name.className = 'bg-chat-speaker';
    name.textContent = by === 'bot' ? t.bot : t.you;
    const bubble = document.createElement('p');
    bubble.className = 'bg-chat-bubble';
    bubble.textContent = message;
    row.append(name, bubble);
    transcript.append(row);
    scrollChatDown();
    count += 1;
    status.textContent = by === 'bot' ? message : '';
    return row;
  }
  // The AI response is plain text. Only the site itself may create navigation actions.
  // A form shortcut is useful when the visitor asks where to give contact details.
  function wantsEnquiryForm(message) {
    const words = clean(message);
    const intent = /\b(donde|como|where|how|open|find|solicitar|request|rellenar|introducir|poner|dejar|facilitar|enviar|submit|fill|enter|provide|give|send|on|com|demanar|sollicitar|emplenar|introduir|facilitar|enviar|trametre|posar)\b/.test(words);
    const subject = /\b(formulario|presupuesto|consulta|datos|contacto|form|quote|quotation|enquiry|inquiry|details|contact|email|formulari|pressupost|dades|contacte|correu)\b/.test(words);
    return intent && subject;
  }
  function addEnquiryFormLink(row) {
    const form = document.querySelector(root.getAttribute('data-bg-form-target') || '#quote-form');
    if (!(form instanceof HTMLFormElement)) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bg-chat-form-link';
    button.textContent = lang === 'ca' ? 'Ves al formulari de pressupost' : lang === 'es' ? 'Ir al formulario de presupuesto' : 'Go to enquiry form';
    button.addEventListener('click', () => {
      // Navigation only. Never send a message or transfer chat history into the form.
      setOpen(false);
      form.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
      const name = form.elements.namedItem('name');
      if (name instanceof HTMLElement) window.setTimeout(() => name.focus({preventScroll:true}), 250);
    });
    row.append(button);
    scrollChatDown();
  }
  function options(items) {
    quick.replaceChildren();
    for (const item of items) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bg-chat-option';
      button.textContent = item.label;
      button.addEventListener('click', () => item.onClick());
      quick.append(button);
    }
    updateSuggestionsUI();
  }
  function choice(value, label) {
    say(label, 'user');
    advance(value);
  }
  function welcome() {
    cancelPendingAI();
    stage = 'idle';
    aiConversationStarted = false;
    suggestionsOpen = true;
    aiHistory = [];
    for (const key of Object.keys(quote)) delete quote[key];
    transcript.replaceChildren();
    say(t.intro);
    say(t.ask);
    options([
      {label:t.quote,onClick:startQuote},
      {label:t.pricing,onClick:()=>faq('pricing')},
      {label:t.documents,onClick:()=>faq('documents')},
      {label:t.certification,onClick:()=>faq('certification')},
      {label:t.times,onClick:()=>faq('times')},
      {label:t.human,onClick:()=>faq('human')}
    ]);
    // The welcome message, not the last choice button, is the starting point on small screens.
    chatViewport.scrollTop = 0;
  }
  function faq(topic, echo = true) {
    const names = {pricing:t.pricing,documents:t.documents,certification:t.certification,times:t.times,human:t.human};
    if (echo) say(names[topic], 'user');
    say(t[topic === 'pricing' ? 'priceA' : `${topic === 'documents' ? 'documents' : topic === 'certification' ? 'cert' : topic === 'times' ? 'times' : 'human'}A`]);
    stage = 'idle';
    options([
      {label:t.quote,onClick:startQuote},
      {label:t.ask,onClick:()=>{say(t.ask);showMainChoices();}}
    ]);
  }
  function showMainChoices() {
    options([
      {label:t.quote,onClick:startQuote},
      {label:t.pricing,onClick:()=>faq('pricing')},
      {label:t.documents,onClick:()=>faq('documents')},
      {label:t.certification,onClick:()=>faq('certification')},
      {label:t.times,onClick:()=>faq('times')},
      {label:t.human,onClick:()=>faq('human')}
    ]);
  }
  function startQuote() {
    say(t.quote, 'user');
    stage = 'source';
    suggestionsOpen = true; // Guided steps always display their required choices.
    askStep();
  }
  function askStep() {
    const prompts = {source:t.sourceQ,target:t.targetQ,document:t.documentQ,pages:t.pagesQ,country:t.countryQ,certification:t.certificationQ,deadline:t.deadlineQ,contact:t.contactQ};
    say(prompts[stage]);
    if (stage === 'source' || stage === 'target') {
      const labels = {English:t.enName, Spanish:t.esName, Catalan:t.caName};
      options(['English','Spanish','Catalan']
        .filter(value=>stage==='source' || value!==quote.source)
        .map(value=>({label:labels[value],onClick:()=>choice(value,labels[value])})));
    } else if (stage === 'document') {
      options(documents.map(([value,en,es,ca])=>({label:lang==='ca'?ca:lang==='es'?es:en,onClick:()=>choice(value,lang==='ca'?ca:lang==='es'?es:en)})));
    } else if (stage === 'pages') {
      options([{label:t.unsure,onClick:()=>choice('',t.unsure)}]);
    } else if (stage === 'country') {
      options([
        {label:t.uk,onClick:()=>choice('United Kingdom',t.uk)},
        {label:t.spain,onClick:()=>choice('Spain',t.spain)},
        {label:t.otherForm,onClick:()=>choice('',t.otherForm)}
      ]);
    } else if (stage === 'certification') {
      options(certOptions.map(([value,en,es,ca])=>({label:lang==='ca'?ca:lang==='es'?es:en,onClick:()=>choice(value,lang==='ca'?ca:lang==='es'?es:en)})));
    } else if (stage === 'deadline') {
      options([
        {label:t.flexible,onClick:()=>choice('Flexible',t.flexible)},
        {label:t.oneWeek,onClick:()=>choice('Within 1 week',t.oneWeek)},
        {label:t.twoWeeks,onClick:()=>choice('Within 2 weeks',t.twoWeeks)},
        {label:t.dateForm,onClick:()=>choice('Exact date to be supplied in form',t.dateForm)}
      ]);
    } else if (stage === 'contact') {
      options([
        {label:t.contactEmail,onClick:()=>choice('Email',t.contactEmail)},
        {label:t.contactCall,onClick:()=>choice('Phone call',t.contactCall)},
        {label:t.contactSms,onClick:()=>choice('Text message',t.contactSms)}
      ]);
    }
  }
  const flow = ['source','target','document','pages','country','certification','deadline','contact'];
  function advance(value) {
    const index = flow.indexOf(stage);
    if (index < 0) return;
    quote[stage] = value;
    if (index === flow.length - 1) {
      stage = 'summary';
      renderSummary();
      return;
    }
    stage = flow[index + 1];
    askStep();
  }
  function summaryText(form = null) {
    const labels = {source:t.sourceL,target:t.targetL,document:t.documentL,pages:t.pagesL,country:t.countryL,certification:t.certL,deadline:t.deadlineL,contact:t.contactL};
    const current = {...quote};
    if (form instanceof HTMLFormElement) {
      const names = {source:'source_language',target:'target_language',document:'document_type',pages:'number_of_pages',country:'country_of_use',certification:'certification_requirements',contact:'contact_preference'};
      for (const [key, name] of Object.entries(names)) {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) current[key] = field.value;
      }
    }
    return flow.map(k=>`${labels[k]}: ${displayValue(k, current[k])}`).join('\n');
  }
  function displayValue(k, value) {
    if (!value) return t.none;
    if (k === 'source' || k === 'target') return ({English:t.enName,Spanish:t.esName,Catalan:t.caName})[value] || value;
    if (k === 'document') {
      const d=documents.find(d=>d[0]===value); return d?d[lang==='ca'?3:lang==='es'?2:1]:value;
    }
    if (k === 'certification') {
      const d=certOptions.find(d=>d[0]===value); return d?d[lang==='ca'?3:lang==='es'?2:1]:value;
    }
    if (k === 'country') return value==='Spain'?t.spain:t.uk;
    if (k === 'contact') return value==='Phone call'?t.contactCall:value==='Text message'?t.contactSms:t.contactEmail;
    if (k === 'deadline') {
      if(value==='Flexible')return t.flexible;
      if(value==='Within 1 week')return t.oneWeek;
      if(value==='Within 2 weeks')return t.twoWeeks;
      return t.dateForm;
    }
    return value;
  }
  function renderSummary() {
    say(`${t.summary}\n\n${summaryText()}`);
    options([
      {label:t.prepare,onClick:fillQuoteForm},
      {label:t.again,onClick:welcome}
    ]);
  }
  function formValue(form, name, value) {
    const field = form.elements.namedItem(name);
    if (!field || value === undefined || value === null) return;
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      if(field instanceof HTMLSelectElement && !Array.from(field.options).some(x=>x.value===value)) return;
      field.value = String(value);
      field.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }
  function fillQuoteForm() {
    const target = root.getAttribute('data-bg-form-target') || '#quote-form';
    const form = document.querySelector(target);
    if (!(form instanceof HTMLFormElement)) {
      say(t.missingForm);
      options([{label:t.again,onClick:welcome}]);
      return;
    }
    const details = form.querySelector('details.lead-optional,details.quote-optional,details[data-quote-optional]');
    if (details) details.open = true;
    // Two independent selectors; the legacy direction is populated for Web3Forms compatibility.
    formValue(form, 'source_language', quote.source);
    formValue(form, 'target_language', quote.target);
    if (quote.source && quote.target && quote.source !== quote.target) {
      formValue(form, 'language_direction', `${quote.source} to ${quote.target}`);
    }
    formValue(form, 'document_type', quote.document);
    formValue(form, 'number_of_pages', quote.pages || '');
    formValue(form, 'country_of_use', quote.country || '');
    formValue(form, 'certification_requirements', quote.certification || 'Not sure');
    formValue(form, 'contact_preference', quote.contact || 'Email');
    // Do not overwrite an explicit calendar date the visitor has already entered.
    const existing = form.elements.namedItem('message');
    let noteOmitted = false;
    if (existing instanceof HTMLTextAreaElement) {
      const startMarker = lang === 'ca' ? '--- Resum de l’assistent de traducció (revisi aquestes dades) ---' : lang === 'es' ? '--- Resumen del asistente de traducción (revise estos datos) ---' : '--- Translation assistant summary (please review) ---';
      const endMarker = lang === 'ca' ? '--- Final del resum de l’assistent ---' : lang === 'es' ? '--- Fin del resumen del asistente ---' : '--- End assistant summary ---';
      // Replace only the previous assistant block, preserving anything written in the form.
      const start = existing.value.indexOf(startMarker);
      const end = start < 0 ? -1 : existing.value.indexOf(endMarker, start);
      const original = start >= 0 && end > start
        ? `${existing.value.slice(0, start)}${existing.value.slice(end + endMarker.length)}`.trim()
        : existing.value.trim();
      const note = `${startMarker}\n${summaryText()}\n${endMarker}`;
      const limit = existing.maxLength > 0 ? existing.maxLength : 1500;
      const combined = `${original ? original+'\n\n' : ''}${note}`;
      if (combined.length <= limit) {
        existing.value = combined;
        existing.dispatchEvent(new Event('change',{bubbles:true}));
      } else {
        // Never discard or truncate a visitor's own message to fit an automated summary.
        existing.value = original;
        noteOmitted = true;
      }
    }
    say(noteOmitted ? t.formReadyLimited : t.formReady);
    options([{label:t.again,onClick:welcome}]);
    const formNotice=form.querySelector('.quote-status');
    if(formNotice){formNotice.textContent=noteOmitted?t.formReadyLimited:(lang==='ca'?'L’assistent ha preparat aquestes dades. Revisi el formulari; no s’ha enviat res.':lang==='es'?'El asistente ha preparado estos datos. Revise el formulario; no se ha enviado nada.':'The assistant prepared these details. Review the form; nothing has been submitted.');formNotice.hidden=false;formNotice.setAttribute('role','status');}
    setOpen(false);
    const section = form.closest('section') || form;
    section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    const person = form.elements.namedItem('name');
    if(person instanceof HTMLElement) {window.setTimeout(()=>person.focus({preventScroll:true}), 250);}
  }
  // If a visitor edits the populated fields, keep the optional assistant summary accurate.
  // Never silently overwrite their own words; omit the generated block if it would exceed the limit.
  const quoteFormForSync = document.querySelector(root.getAttribute('data-bg-form-target') || '#quote-form');
  if (quoteFormForSync instanceof HTMLFormElement) {
    const fieldsToSync = 'select[name="source_language"],select[name="target_language"],select[name="document_type"],input[name="number_of_pages"],textarea[name="country_of_use"],input[name="country_of_use"],select[name="certification_requirements"],select[name="contact_preference"]';
    const syncAssistantNote = event => {
      if (!(event.target instanceof Element) || !event.target.matches(fieldsToSync)) return;
      const message = quoteFormForSync.elements.namedItem('message');
      if (!(message instanceof HTMLTextAreaElement)) return;
      const startMarker = lang === 'ca' ? '--- Resum de l’assistent de traducció (revisi aquestes dades) ---' : lang === 'es' ? '--- Resumen del asistente de traducción (revise estos datos) ---' : '--- Translation assistant summary (please review) ---';
      const endMarker = lang === 'ca' ? '--- Final del resum de l’assistent ---' : lang === 'es' ? '--- Fin del resumen del asistente ---' : '--- End assistant summary ---';
      const start = message.value.indexOf(startMarker);
      if (start < 0) return;
      const end = message.value.indexOf(endMarker,start+startMarker.length);
      if (end < 0) return;
      const next = `${message.value.slice(0,start)}${startMarker}\n${summaryText(quoteFormForSync)}\n${endMarker}${message.value.slice(end+endMarker.length)}`;
      const limit = message.maxLength>0 ? message.maxLength : 1500;
      if (next.length <= limit) {
        message.value = next;
      } else {
        // Generated summary is optional. Keep only user-written content when space runs out.
        message.value = `${message.value.slice(0,start)}${message.value.slice(end+endMarker.length)}`.trim();
        const notice=quoteFormForSync.querySelector('.quote-status');
        if(notice){notice.textContent=t.formReadyLimited;notice.hidden=false;notice.setAttribute('role','status');}
      }
    };
    quoteFormForSync.addEventListener('change',syncAssistantNote);
    quoteFormForSync.addEventListener('input',syncAssistantNote);
  }
  function clean(s) {return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function handleInput(text) {
    const value=text.trim().slice(0,400);
    if (!value) return;
    // Do not send typed chat to an external provider without explicit informed opt-in.
    // Local quotation-wizard answers do not require consent because they never use the API.
    if (stage === 'idle' && !aiConsent.checked) {
      status.textContent = lang === 'ca' ? 'Per fer preguntes lliures, llegeixi i accepti primer l’avís d’IA. També pot utilitzar el pressupost guiat sense IA.' : lang === 'es'
        ? 'Para preguntas libres, lea y acepte primero el aviso de IA. También puede utilizar el presupuesto guiado sin IA.'
        : 'For free-text AI questions, please read and accept the AI notice first. The guided quotation works without AI.';
      aiConsent.focus();
      return;
    }
    input.value='';
    say(value,'user');
    if (stage === 'pages') {
      if (/^(\d{1,3})$/.test(value) && Number(value)>0 && Number(value)<=999) {advance(String(Number(value)));return;}
      if (/^(unsure|not sure|skip|no lo se|no se|omitir|no ho se|ometre)$/i.test(clean(value))) {advance('');return;}
      say(t.invalidPages);return;
    }
    if (stage !== 'idle') {say(t.invalidInput);return;}
    const v=clean(value);
    // Refuse free-text personal data: the widget doesn't transmit/store it, and prompts a safer route.
    if (/\b(passport|identity number|numero de pasaporte|dni|nhs|medical record|historial medico|document text|bank account|cuenta bancaria|contrase[nñ]a|contrasenya|password)\b/i.test(v) || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) {say(t.personalWarn);return;}
    // Route open-ended questions to the real AI backend, not keyword/FAQ fallbacks.
    // Only the guided quote buttons use the deterministic local flow above.
    aiConversationStarted = true;
    suggestionsOpen = false;
    showMainChoices(); // Hidden during conversation; available from the ⋯ suggestions control.
    void sendAI(value);
  }
  async function sendAI(message) {
    if (aiBusy || !aiConsent.checked) return;
    aiBusy = true;
    input.disabled = true;
    sendButton.disabled = true;
    status.textContent = aiCopy.thinking;
    const requestId = ++aiRequestId;
    const controller = new AbortController();
    pendingAIController = controller;
    const isCurrent = () => requestId === aiRequestId && aiConsent.checked;
    try {
      const recent = aiHistory.slice(-10);
      const timeout = setTimeout(() => controller.abort(), 18000);
      let response;
      try {
        response = await fetch(aiEndpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({message, lang, history: recent, consent: true}),
          credentials: 'omit',
          cache: 'no-store',
          signal: controller.signal
        });
      } finally {clearTimeout(timeout);}
      if (!isCurrent()) return; // A restart or consent withdrawal invalidates this reply.
      if (response.status === 503 || response.status === 404) {
        say(aiCopy.unavailable); return;
      }
      if (!response.ok) {
        say(response.status === 400 ? aiCopy.restricted : aiCopy.connection); return;
      }
      const payload = await response.json();
      if (!isCurrent()) return;
      if (!payload || typeof payload.reply !== 'string' || !payload.reply.trim()) {
        say(aiCopy.connection); return;
      }
      // Remove simple bold delimiters if a provider breaks the plain-text rule.
      // All output still goes through textContent, never unsafe HTML injection.
      const reply = payload.reply.trim().slice(0, 1400)
        .replace(/\*\*([^*\n]{1,140})\*\*/g, '$1')
        .replace(/__([^_\n]{1,140})__/g, '$1');
      const row = say(reply);
      if (wantsEnquiryForm(message)) addEnquiryFormLink(row);
      aiHistory.push({role: 'user', content: message}, {role: 'assistant', content: reply});
      aiHistory = aiHistory.slice(-10);
    } catch (_) {
      if (isCurrent()) say(aiCopy.connection);
    } finally {
      if (requestId === aiRequestId) {
        pendingAIController = null;
        input.disabled = false;
        sendButton.disabled = false;
        aiBusy = false;
        if (!panel.hidden) focusComposerIfDesktop();
      }
    }
  }
  function setOpen(open) {
    panel.hidden=!open;
    launcher.setAttribute('aria-expanded',String(open));
    if (open) {
      if(!openedOnce){welcome();openedOnce=true;}
      focusComposerIfDesktop();
    } else launcher.focus();
  }
  launcher.addEventListener('click',()=>setOpen(panel.hidden));
  close.addEventListener('click',()=>setOpen(false));
  restart.addEventListener('click',()=>{welcome();status.textContent=t.resetStatus;focusComposerIfDesktop();});
  inputForm.addEventListener('submit',(e)=>{e.preventDefault();handleInput(input.value);});
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();setOpen(false);}});
  document.querySelectorAll('[data-open-translation-assistant]').forEach(button=>button.addEventListener('click',()=>setOpen(true)));
})();
