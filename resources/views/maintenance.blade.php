@php
    // Deliberately plain Blade, not Inertia/React: if the site is down because
    // something in the build broke, this page still has to render on its own.
    [$primaryColor, $primaryColorDark] = \App\SitePrimaryColor::resolve(\App\Models\Setting::get('appearance.site_primary', 'navy'));
    $icon = match ($template) {
        \App\MaintenanceTemplate::Maintenance => '🛠️',
        \App\MaintenanceTemplate::Indisponible => '🚧',
        \App\MaintenanceTemplate::Personnalise => '✦',
    };
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <link rel="icon" type="image/png" href="/images/logo-isstm.png">
    <title>{{ $title }} — ISSTM Mahajanga</title>
    <style>
        :root {
            --primary: {{ $primaryColor }};
            --primary-dark: {{ $primaryColorDark }};
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(160deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: #ffffff;
        }
        .card {
            max-width: 520px;
            width: 100%;
            text-align: center;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 24px;
            padding: 48px 36px;
            backdrop-filter: blur(6px);
        }
        .icon {
            font-size: 56px;
            line-height: 1;
            margin-bottom: 20px;
        }
        img.logo {
            height: 56px;
            margin-bottom: 24px;
        }
        h1 {
            margin: 0 0 12px;
            font-size: 1.5rem;
            font-weight: 700;
        }
        p {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.85);
            white-space: pre-line;
        }
        .footer {
            margin-top: 28px;
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.5);
        }
    </style>
</head>
<body>
    <div class="card">
        <img class="logo" src="/images/logo-isstm.png" alt="ISSTM Mahajanga">
        <div class="icon" aria-hidden="true">{{ $icon }}</div>
        <h1>{{ $title }}</h1>
        <p>{{ $message }}</p>
        <div class="footer">Institut Supérieur des Sciences et Technologies de Mahajanga</div>
    </div>
</body>
</html>
