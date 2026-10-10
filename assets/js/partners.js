(function () {
  'use strict';
  const pixelsPerSecond = 24;
  document.querySelectorAll('[data-logo-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.partners__track');
    const group = track?.querySelector('.partners__group');
    if (!group) return;
    let cycleWidth = 0;
    function measureCycle() {
      const width = group.getBoundingClientRect().width;
      if (!width || Math.abs(width - cycleWidth) < .01) return;
      const animation = track.getAnimations()[0];
      // Retain the pixel position when the measured cycle length changes;
      // changing animation duration alone would change its current phase.
      const offset = animation && cycleWidth ? (Number(animation.currentTime) * pixelsPerSecond / 1000) % cycleWidth : 0;
      cycleWidth = width;
      track.style.setProperty('--partners-duration', (width / pixelsPerSecond) + 's');
      const updatedAnimation = track.getAnimations()[0];
      if (updatedAnimation) updatedAnimation.currentTime = (offset % width) / pixelsPerSecond * 1000;
    }
    measureCycle();
    if ('ResizeObserver' in window) new ResizeObserver(measureCycle).observe(group);
    else window.addEventListener('resize', measureCycle);
  });
})();
