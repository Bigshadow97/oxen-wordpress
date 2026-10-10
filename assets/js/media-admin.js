/* Native WordPress media picker; loaded only in the Oxen Home editor. */
document.addEventListener('click', event => {
  const choose = event.target.closest('.oxen-media-choose');
  const reset = event.target.closest('.oxen-media-reset');
  const field = (choose || reset)?.closest('.oxen-media-field');
  if (!field) return;
  const input = field.querySelector('input'), preview = field.querySelector('img');
  if (reset) { input.value = ''; preview.src = reset.dataset.default; return; }
  const picker = wp.media({title: field.querySelector('strong').textContent, library: {type: 'image'}, button: {text: 'Use image'}, multiple: false});
  picker.on('select', () => { const image = picker.state().get('selection').first().toJSON(); input.value = image.id; preview.src = image.url; });
  picker.open();
});
