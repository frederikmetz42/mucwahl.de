(function () {
    'use strict';

    const stage = document.querySelector('[data-hero-stage]');
    const video = document.querySelector('[data-hero-video]');
    const canvas = document.querySelector('[data-hero-pulse-canvas]');
    const map = window.MUCWAHL_HERO_ROADS;
    if (!stage || !video || !canvas || !map || !('IntersectionObserver' in window)) return;

    const context = canvas.getContext('2d');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = 0;
    let visible = false;
    let startedAt = 0;
    let accentRgb = '255,67,50';

    function readAccent() {
        const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
        accentRgb = raw ? raw.replace(/\s+/g, ',') : '255,67,50';
    }

    readAccent();

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.round(rect.width * ratio));
        const height = Math.max(1, Math.round(rect.height * ratio));
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        return rect;
    }

    function camera(rect) {
        const scale = Math.max(rect.width / map.width, rect.height / map.height);
        return {
            scale: scale,
            x: (rect.width - map.width * scale) / 2,
            y: (rect.height - map.height * scale) / 2,
        };
    }

    function zoomAtVideoTime() {
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 8;
        const phase = ((video.currentTime % duration) / duration) * Math.PI * 2;
        return 1 + 0.018 * (0.5 - 0.5 * Math.cos(phase));
    }

    function toScreen(point, cameraState, zoom) {
        return [
            cameraState.x + (map.anchor[0] + (point[0] - map.anchor[0]) * zoom) * cameraState.scale,
            cameraState.y + (map.anchor[1] + (point[1] - map.anchor[1]) * zoom) * cameraState.scale,
        ];
    }

    function roadMidpoint(road) {
        return road.points[Math.floor(road.points.length / 2)];
    }

    function drawRoad(road, cameraState, zoom, intensity) {
        context.beginPath();
        road.points.forEach(function (point, index) {
            const screen = toScreen(point, cameraState, zoom);
            if (index === 0) context.moveTo(screen[0], screen[1]);
            else context.lineTo(screen[0], screen[1]);
        });
        context.strokeStyle = `rgba(${accentRgb},${0.05 + intensity * 0.36})`;
        context.lineWidth = 0.8 + intensity * 1.5;
        context.shadowColor = `rgba(${accentRgb},${intensity * 0.42})`;
        context.shadowBlur = 3 + intensity * 7;
        context.stroke();
    }

    function render(time) {
        frameId = 0;
        const rect = resize();
        context.clearRect(0, 0, rect.width, rect.height);
        if (!visible || motionQuery.matches) return;

        if (!startedAt) startedAt = time;
        const cameraState = camera(rect);
        const zoom = zoomAtVideoTime();
        const cycle = ((time - startedAt) % 5600) / 5600;
        const radius = 40 + cycle * 870;
        const band = 105;

        context.save();
        for (const road of map.roads) {
            const midpoint = roadMidpoint(road);
            const distance = Math.hypot(midpoint[0] - map.anchor[0], midpoint[1] - map.anchor[1]);
            const intensity = Math.max(0, 1 - Math.abs(distance - radius) / band);
            if (intensity > 0.02) drawRoad(road, cameraState, zoom, intensity);
        }

        const center = toScreen(map.anchor, cameraState, zoom);
        context.beginPath();
        context.arc(center[0], center[1], radius * cameraState.scale, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${accentRgb},${Math.sin(Math.PI * cycle) * 0.13})`;
        context.lineWidth = 1.2;
        context.shadowColor = `rgba(${accentRgb},.24)`;
        context.shadowBlur = 10;
        context.stroke();
        context.restore();

        schedule();
    }

    function schedule() {
        if (!frameId && visible && !motionQuery.matches) {
            frameId = window.requestAnimationFrame(render);
        }
    }

    function stop() {
        if (frameId) {
            window.cancelAnimationFrame(frameId);
            frameId = 0;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) schedule();
        else stop();
    }, { threshold: 0.08 }).observe(stage);

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('mucwahl:palette-change', function () {
        readAccent();
        schedule();
    });
    motionQuery.addEventListener('change', function () {
        if (motionQuery.matches) stop();
        else schedule();
    });
}());
