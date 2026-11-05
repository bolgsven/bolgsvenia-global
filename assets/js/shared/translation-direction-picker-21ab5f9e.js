/* Bolgsvenia Global | Six direction language selector | 2026-10-23
 * No network requests, storage or automatic submissions.
 */
(() => {
  'use strict';
  const valid = ['English','Spanish','Catalan'];
  document.querySelectorAll('form[data-translation-quote]').forEach(form => {
    const source = form.querySelector('select[name="source_language"]');
    const target = form.querySelector('select[name="target_language"]');
    const direction = form.querySelector('input[name="language_direction"]');
    if (!source || !target || !direction) return;
    const isSpanish = document.documentElement.lang.toLowerCase().startsWith('es');
    const errorText = isSpanish
      ? 'Seleccione dos idiomas distintos: ingl\u00e9s, espa\u00f1ol o catal\u00e1n.'
      : 'Please select two different languages: English, Spanish or Catalan.';
    const update = () => {
      if (source.value && target.value === source.value) target.value = '';
      [...target.options].forEach(option => {
        option.disabled = Boolean(source.value && option.value === source.value);
      });
      const good = valid.includes(source.value) && valid.includes(target.value) && source.value !== target.value;
      direction.value = good ? `${source.value} to ${target.value}` : '';
      target.setCustomValidity(source.value && target.value && !good ? errorText : '');
      form.dataset.languagePair = good ? direction.value : '';
    };
    source.addEventListener('change', update);
    target.addEventListener('change', update);
    form.addEventListener('submit', event => {
      update();
      if (!direction.value) {
        event.preventDefault();
        if (!source.value) source.reportValidity();
        else if (!target.value) target.reportValidity();
        else {target.setCustomValidity(errorText);target.reportValidity();}
      }
    });
    update();
  });
})();
