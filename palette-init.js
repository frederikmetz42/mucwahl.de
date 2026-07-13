(function () {
    'use strict';

    const palettes = [
        { id: 'coral', name: 'Coral', color: '#FF4332' },
        { id: 'mineral', name: 'Mineralblau', color: '#78A7B8' },
        { id: 'graphite', name: 'Graphit + Eis', color: '#27313A' },
        { id: 'iris', name: 'Iris', color: '#A99BDD' },
        { id: 'oxide', name: 'Oxid', color: '#D98268' }
    ];
    const fallback = 'mineral';
    let saved = fallback;

    try {
        const candidate = localStorage.getItem('mucwahl_palette');
        if (palettes.some(palette => palette.id === candidate)) saved = candidate;
    } catch (error) {
        // Storage can be unavailable in privacy-restricted embeds. Mineralblau remains the fallback.
    }

    window.MUCWAHL_PALETTES = palettes;
    document.documentElement.dataset.palette = saved;
}());
