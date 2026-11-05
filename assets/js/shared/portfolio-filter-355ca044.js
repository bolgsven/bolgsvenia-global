(() => {
  'use strict';
  const buttons = Array.from(document.querySelectorAll('[data-work-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-work-status]'));
  const status = document.getElementById('work-filter-status');
  if (!buttons.length || !cards.length) return;
  const es = document.documentElement.lang.toLowerCase().startsWith('ca');
  function select(value) {
    let count = 0;
    cards.forEach(card => {
      const visible = value === 'all' || card.dataset.workStatus === value;
      card.hidden = !visible;
      if (visible) count++;
    });
    buttons.forEach(button => {
      const active = button.dataset.workFilter === value;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
    });
    if (status) status.textContent = es ? `${count} projectes visibles` : `${count} projects visible`;
  }
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.workFilter)));
  select('all');
})();
