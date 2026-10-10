(function () {
  'use strict';
  const pixelsPerSecond = 24;
  document.querySelectorAll('[data-logo-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.partners__track');
    const group = track?.querySelector('.partners__group');
    if (!group) return;
    let cycleWidth = 0;
    function measureCycle(width) {
      if (!width || Math.abs(width - cycleWidth) < .01) return;
      const animation = track.getAnimations()[0];
      // Retain the pixel position when the measured cycle length changes;
      // changing animation duration alone would change its current phase.
      const offset = animation && cycleWidth ? (Number(animation.currentTime) * pixelsPerSecond / 1000) % cycleWidth : 0;
      cycleWidth = width;
      track.style.setProperty('--partners-duration', (width / pixelsPerSecond) + 's');
      // CSS duration changes retain the same CSSAnimation. Reusing it avoids
      // a second style/layout flush immediately after writing the duration.
      if (animation) animation.currentTime = (offset % width) / pixelsPerSecond * 1000;
    }
    if ('ResizeObserver' in window) {
      // Observer measurements arrive after layout, including the initial size.
      // Do not synchronously lay out the entire page while deferred scripts run.
      new ResizeObserver(entries => {
        const entry = entries[0];
        measureCycle(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
      }).observe(group);
    } else {
      let frame;
      const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => measureCycle(group.getBoundingClientRect().width));
      };
      schedule();
      window.addEventListener('resize', schedule);
    }
  });
})();
