@php
    $appearancePalette = \App\AppearancePalette::tryFrom(\App\Models\Setting::get('appearance.palette', 'default')) ?? \App\AppearancePalette::Default;
    $appearanceChrome = \App\AppearanceChromeColor::tryFrom(\App\Models\Setting::get('appearance.chrome', 'default')) ?? \App\AppearanceChromeColor::Default;
    $appearanceFont = \App\AppearanceFont::tryFrom(\App\Models\Setting::get('appearance.font', 'instrument-sans')) ?? \App\AppearanceFont::InstrumentSans;
    $appearanceDensity = \App\Models\Setting::get('appearance.density', 'normal');
    [$accentLight, $accentForegroundLight, $accentDark, $accentForegroundDark] = $appearancePalette->colors();
    [$chromeLight, $chromeDark] = $appearanceChrome->colors();
    $googleFontsFamily = $appearanceFont->googleFontsFamily();
@endphp
<!DOCTYPE html>
<html lang="fr" data-density="{{ $appearanceDensity }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/png" href="/images/logo-isstm.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Lora:ital,wght@0,500;1,500&display=swap" rel="stylesheet">
    @if ($googleFontsFamily)
        <link href="https://fonts.googleapis.com/css2?family={{ $googleFontsFamily }}&display=swap" rel="stylesheet">
    @endif
    <title inertia>ISSTM</title>
    <script>
        (function () {
            var stored = localStorage.getItem('theme');
            var dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', dark);
        })();
    </script>
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    {{-- After @vite so these overrides win the cascade against app.css's :root/.dark declarations. --}}
    {{-- <style> is a raw-text element: {{ }}'s HTML-entity escaping (e.g. ' -> &#039;) would
         not be decoded by the CSS parser, so these closed-enum values (never free user input)
         are interpolated unescaped. --}}
    <style>
        :root {
            --color-admin-accent: {!! $accentLight !!};
            --color-admin-accent-foreground: {!! $accentForegroundLight !!};
            --color-admin-chrome: {!! $chromeLight !!};
            --font-admin-sans: {!! $appearanceFont->fontFamily() !!};
        }
        .dark {
            --color-admin-accent: {!! $accentDark !!};
            --color-admin-accent-foreground: {!! $accentForegroundDark !!};
            --color-admin-chrome: {!! $chromeDark !!};
        }
    </style>
    @inertiaHead
</head>
<body class="antialiased bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    @inertia
</body>
</html>
