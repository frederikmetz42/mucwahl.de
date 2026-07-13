(function () {
    'use strict';

    if (!('IntersectionObserver' in window)) return;

    const stage = document.querySelector('[data-hero-stage]');
    const video = document.querySelector('[data-hero-video]');
    const pulseCanvas = document.querySelector('[data-hero-pulse-canvas]');
    if (!stage || !video) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    let active = false;
    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function render() {
        frameId = 0;
        if (!active) return;

        const rect = stage.getBoundingClientRect();
        const stageCenter = rect.top + (rect.height / 2);
        const viewportCenter = window.innerHeight / 2;
        const scrollOffset = clamp((viewportCenter - stageCenter) / window.innerHeight * 12, -6, 6);
        const targetY = scrollOffset + pointerY;
        currentX += (pointerX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        const transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        video.style.transform = transform;
        if (pulseCanvas) pulseCanvas.style.transform = transform;

        if (Math.abs(pointerX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
            scheduleRender();
        }
    }

    function scheduleRender() {
        if (!frameId) frameId = window.requestAnimationFrame(render);
    }

    function handleScroll() {
        scheduleRender();
    }

    function handlePointerMove(event) {
        const rect = stage.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        pointerX = clamp(x * 3, -3, 3);
        pointerY = clamp(y * 2, -2, 2);
        scheduleRender();
    }

    function activate() {
        if (active || motionQuery.matches) return;
        active = true;
        window.addEventListener('scroll', handleScroll, { passive: true });
        stage.addEventListener('pointermove', handlePointerMove, { passive: true });
        video.play().catch(function () {});
        scheduleRender();
    }

    function deactivate() {
        if (active) {
            active = false;
            window.removeEventListener('scroll', handleScroll);
            stage.removeEventListener('pointermove', handlePointerMove);
        }
        if (frameId) {
            window.cancelAnimationFrame(frameId);
            frameId = 0;
        }
        pointerX = 0;
        pointerY = 0;
        currentX = 0;
        currentY = 0;
        video.pause();
        video.style.transform = 'translate3d(0, 0, 0)';
        if (pulseCanvas) pulseCanvas.style.transform = 'translate3d(0, 0, 0)';
    }

    function observeStage() {
        if (motionQuery.matches) return;
        if (!observer) {
            observer = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) activate();
                else deactivate();
            }, { threshold: 0.08 });
        }
        observer.observe(stage);
    }

    function handleMotionPreference(event) {
        if (event.matches) {
            deactivate();
            if (observer) observer.disconnect();
            return;
        }
        observeStage();
    }

    motionQuery.addEventListener('change', handleMotionPreference);
    if (motionQuery.matches) return;
    observeStage();
}());
