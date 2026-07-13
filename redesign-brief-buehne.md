# Redesign-Brief Bühne

## Design-Tokens

| Token | Wert |
| --- | --- |
| `--canvas` | `#FBFAF7` |
| `--ink` | `#111114` |
| `--accent` | `#FF4332` |
| `--accent-hover` | `#E03325` |
| `--accent-text` | `#C2270F` |
| `--stone` | `#6B645D` |
| `--stone-soft` | `#6C665F` |
| `--line` | `rgba(17, 17, 20, 0.10)` |
| `--line-soft` | `rgba(17, 17, 20, 0.07)` |
| `--card` | `#FFFFFF` |
| `--ease` | `cubic-bezier(.16, 1, .3, 1)` |
| `--stage-shadow` | `0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 2px 6px rgba(255, 67, 50, 0.05), 0 14px 30px rgba(255, 67, 50, 0.09), 0 40px 70px rgba(255, 67, 50, 0.10), 0 1px 0 rgba(17, 17, 20, 0.04)` |

## CSP-Diff

Vorher:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-eval' 'sha256-Qe5XWnhPLpmh0d4ZsNLi/q/sLp7Of5469hRlXoESQ2A='; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src https://mucwahl.goatcounter.com; base-uri 'self'; form-action 'none';">
```

Nachher:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-eval' 'sha256-Qe5XWnhPLpmh0d4ZsNLi/q/sLp7Of5469hRlXoESQ2A='; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; media-src 'self'; connect-src https://mucwahl.goatcounter.com; base-uri 'self'; form-action 'none';">
```

Der bestehende `script-src`-Hash bleibt unverändert.

## Markenregel

Direktes Nutzerfeedback vom 2026-07-13 ersetzt die frühere Nav-Regel: Die Hauptnavigation verwendet wieder das originale MUCwahl-Rasterlogo aus `assets/icon.png`. Die Kompass-Rosette bleibt ein grafisches Motiv im Orientierungsraum und in dynamischen Quiz-Oberflächen, ist aber nicht mehr das Nav-Logo:

```html
<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <circle cx="24" cy="24" r="18" stroke="#FF4332" stroke-width="3"/>
  <path d="M24 2v7M24 39v7M2 24h7M39 24h7" stroke="#FF4332" stroke-width="3" stroke-linecap="round"/>
  <circle cx="30" cy="18" r="5" fill="#FF4332"/>
</svg>
```

`assets/favicon.png` und `assets/icon.png` sind eigenständige Raster-Assets. Sie dürfen nicht neu gezeichnet oder überschrieben werden. Der verworfene handgezeichnete Zwillingsturm-SVG-Mark bleibt außer Betrieb; die abstrakte Frauenkirche ist ausschließlich eine mögliche Video-Hintergrundrichtung.

## Video-Feature

Das Start-Intro verwendet die ausgewählte München-Karte als randlosen Layer hinter Copy und These-1-Vorschau:

```html
<div class="hero-field" data-hero-stage>
  <div class="hero-video-frame" aria-hidden="true">
    <video
      class="hero-video"
      data-hero-video
      src="assets/video/hero-loop-map-wide.mp4"
      poster="assets/video/hero-loop-map-wide-poster.jpg"
      muted playsinline loop preload="none" tabindex="-1">
    </video>
    <canvas class="hero-pulse-canvas" data-hero-pulse-canvas aria-hidden="true"></canvas>
  </div>
  <div class="stage-layout">
    <div class="text-left"></div>
    <div class="hero-stage"><article class="stage-card"></article></div>
  </div>
</div>
```

`hero-motion.js` liest das Stage-Rechteck, Pointerposition, Scrollposition, Sichtbarkeit und die Systemeinstellung für reduzierte Bewegung. Die Datei schreibt denselben Transform auf Video und Civic-Pulse-Canvas sowie den Wiedergabestatus des Videos. Bei sichtbarer Stage startet sie `play()` mit abgefangenem Promise-Fehler und registriert Scroll- und Pointer-Listener. Bei unsichtbarer Stage pausiert sie das Video und entfernt diese Listener. Zielwerte sind auf 3 Pixel Pointer- und 6 Pixel Scrollbewegung geklemmt; die tatsächliche Transformation nähert sich ihnen mit einem Faktor von 0,08 pro `requestAnimationFrame`, bis weniger als 0,02 Pixel Differenz verbleiben.

Wenn reduzierte Bewegung beim Start aktiv ist, bleibt das Poster statisch und das Video startet nicht. Eine Live-Änderung der Systemeinstellung pausiert das Video, setzt den Transform auf den Identitätswert und trennt den Observer. Ohne `IntersectionObserver` endet die Initialisierung sofort. Poster und Karteninhalt dürfen nie durch CSS als unsichtbarer Default angelegt werden.

CSS-Scroll-Timelines mit `scroll()` oder `view()` sind verboten. Der verifizierte Zielbrowser hängt sie zwar technisch an, liefert in der Praxis aber keinen fortschreitenden Zeitwert.

Das ausgewählte Asset ist eine textfreie Linienzeichnung aus echten Münchner Hauptstraßen und Wasserläufen auf Coral-Licht. Der dedizierte Vollbreiten-Master läuft 8 Sekunden bei konstanten 30 FPS, 1920 mal 960 Pixel, H.264/YUV420p, CRF 20, ohne Ton und mit Faststart. `_build/generate_hero_map_wide.py` erzeugt Video und Poster deterministisch aus dem lokalen Overpass-Cache neu. Die dominante Bewegung ist ein auf Marienplatz verankerter Kamera-Zoom von 100 auf 101,8 Prozent und zurück. Eine Cosinus-Kurve erzeugt an Start, Umkehrpunkt und Loop-Naht null Geschwindigkeit; bicubische Abtastung hält feine Straßenlinien stabil. Es gibt keine kodierte seitliche Drift. Die Videoebene besitzt innerhalb eines randlosen, Viewport-breiten Clipping-Frames 24 Pixel Overscan, damit die verbleibende Live-Translation nie eine leere Kante oder horizontalen Overflow erzeugt. Eine sichtbare OpenStreetMap-Attribution steht in der linken Intro-Copy.

Der ursprüngliche Orientierungsraum, die abstrakte Frauenkirche und die parallelen Entscheidungskonturen bleiben lokale Alternativen. `_internal/hero-video-variants/index.html` dokumentiert alle acht Kombinationen aus vier Motiven und zwei räumlichen Layouts. Direktes Nutzerfeedback vom 2026-07-13 wählt Variante 6, München-Karte in Vollbreite, als verbindlichen v5-Stand.

Der lokale Picker enthält drei interaktive Motion-Studien: Variante 9 verschiebt echte Hauptstraßen in drei pointer-gesteuerten Tiefenebenen; Variante 10, Civic Pulse, lässt einen ruhigen Orientierungsimpuls von Marienplatz durch nahe Straßen laufen; Variante 11 bewegt 32 Coral- und Weißlicht-Tracer entlang echter Hauptstraßen. Direktes Nutzerfeedback vom 2026-07-13 wählt Variante 10 als produktiven Effekt. Der Smooth-Zoom-Hero bleibt die visuelle Grundebene; `hero-pulse.js` zeichnet ausschließlich den transparenten Impuls darüber. Die 272 vereinfachten Straßen liegen self-hosted in `assets/map/munich-roads.js`. Der Impuls synchronisiert sich über `video.currentTime` mit dem 1,8-Prozent-Zoom, pausiert per IntersectionObserver außerhalb der Bühne und wird bei Reduced Motion vollständig entfernt.

## Scope je Screen

| Datei oder Step | Änderung |
| --- | --- |
| `_build/tailwind.config.js`, `_build/input.css` | Bühne-Tokens, Stage-Schatten, Coral-Wash, Komponenten und Motion-Fallbacks |
| `index.html`, Step 0 | Zweispaltiges Bühne-Intro, originale MUCwahl-Navmarke, echte These-1-Vorschau, Statistiken, Value-Props und Themenliste |
| `index.html`, Steps 1 bis 25 | Coral-Retint der dynamischen Thesenkarte; sechs eigenständige Prioritätsduelle nach den Thesen 4, 8, 12, 16, 20 und 24 |
| `index.html`, Step 97 | Ausschließlich Farb-Retint der Wahl-Info |
| `index.html`, Step 98 | Interner Zustand für die reine Wiederholung der sechs Prioritätsduelle aus dem Ergebnis-Menü; keine separate Gewichtungsseite im vollständigen Quiz |
| `index.html`, Step 99 | Ausschließlich Farb-Retint der Ergebnis-Tabs und Coral-DU-Punkt |
| `kommunalwahl.html` | Spiegel von `index.html`, abgesehen von `canonical` und `og:url` |
| `embed.html` | Originales MUCwahl-Logo und Coral-Retint, ohne Hero-Video; der kompakte Embed behält die bisherige Gewichtungsseite |
| `methodik.html`, `methodik-check.html`, `schnellcheck.html`, `datenschutz.html`, `impressum.html`, `404.html` | Mechanischer Coral-Retint ohne Strukturänderung |
| `app.js` | Canvas-Palette, Coral-DU-Punkt, Duell-basierte Themengewichtung, Reload-Fortsetzung und eigene Quiz-Verlassen-Box |
| `hero-motion.js` | Gemeinsame Video- und Canvas-Sichtbarkeits- und Bewegungssteuerung |
| `hero-pulse.js`, `assets/map/munich-roads.js` | Produktiver Civic Pulse mit vereinfachten, self-hosted Hauptstraßen |

Die vollständige Pixel-Referenz liegt lokal unter `_internal/style-explorer/round4-frontier/style4-buehne.html`. Sie ist gitignored und dient bei Detailfragen als Referenz. Dieses Briefing enthält die für einen Build erforderlichen Verträge eigenständig.

## Hausregeln

- Keine Em-Dashes, keine Emoji, kein Italic und keine Serifenschrift.
- WCAG AA ist verbindlich. Auf Coral wird Tinte verwendet, nicht Weiß.
- Fortress Zero bleibt erhalten: kein neues CDN, kein Backend, keine Cookies und keine zusätzlichen Tracking-Aufrufe.
- Fonts, Skripte, Bilder und Video bleiben self-hosted.
