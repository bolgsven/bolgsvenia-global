/* Bolgsvenia Global: Web3Forms form validation only; no tracking or cookies. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-lead-form]').forEach((form) => {
    const keyInput = form.querySelector('input[name="access_key"]');
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-form-status]');
    const fileInput = form.querySelector('input[type="file"][name="attachment"]');
    const email = 'bolgsvenia.global@bolgsvenia.com';
    const spanish = document.documentElement.lang.toLowerCase().startsWith('es');
    const key = keyInput?.value.trim() || '';
    const keyMissing = !key || key === 'YOUR_WEB3FORMS_ACCESS_KEY' || key.startsWith('PASTE_') || key.startsWith('YOUR_');

    const showStatus = (message, link = false) => {
      if (!status) return;
      status.replaceChildren(document.createTextNode(message));
      if (link) {
        const a = document.createElement('a');
        a.href = 'mailto:' + email;
        a.textContent = email;
        status.append(document.createTextNode(' '), a);
      }
      status.hidden = false;
    };

    if (keyMissing) {
      button.disabled = true;
      showStatus(spanish
        ? 'El formulario est\u00e1 pendiente de configuraci\u00f3n. Solicite su presupuesto por correo electr\u00f3nico:'
        : 'The online form is awaiting configuration. Please request a quote by email:', true);
    }

    form.addEventListener('submit', (event) => {
      if (keyMissing) {
        event.preventDefault();
        return;
      }
      const selected = fileInput?.files;
      const file = selected?.[0];
      const limit = 5 * 1024 * 1024;
      if (file && file.size > limit) {
        event.preventDefault();
        showStatus(spanish
          ? 'El archivo supera los 5 MB. Seleccione un archivo m\u00e1s peque\u00f1o o env\u00ede primero la consulta sin adjuntos.'
          : 'The file is larger than 5 MB. Choose a smaller file or send the enquiry without an attachment.');
        status?.focus();
        return;
      }
      if (selected && selected.length > 1) {
        event.preventDefault();
        showStatus(spanish ? 'Adjunte solo un archivo.' : 'Please attach only one file.');
        status?.focus();
        return;
      }
      // Let the browser perform the native multipart POST. The Web3Forms server
      // verifies the access key, subscription and attachment; only its success
      // redirect should show the thank-you page.
    });
    fileInput?.addEventListener('change', () => {
      if (status && !keyMissing) status.hidden = true;
    });
  });
});
