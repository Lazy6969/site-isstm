@php
    // $sections: ['fr' => ['heading' => ..., 'lines' => [...], 'button' => ['text' => ..., 'url' => ...]], 'en' => [...], 'mg' => [...]]
    // fr rendered last on purpose: the `~` sibling rule below only reaches
    // .lang-default (fr) from an *earlier* sibling, so fr has to come after
    // en/mg in the DOM for clicking either of them to hide it.
    $order = ['en', 'mg', 'fr'];
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ISSTM Mahajanga</title>
<style>
    body, table, td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { margin: 0; padding: 0; background-color: #f1f5f9; color: #334155; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 24px 0; }
    .inner { max-width: 570px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border-top: 3px solid #d4a017; box-shadow: 0 4px 10px -2px rgba(0,51,102,0.12); overflow: hidden; }
    .header { background-color: #003366; padding: 28px 24px 20px; text-align: center; }
    .header img { height: 56px; width: auto; }
    .header-title { color: #e2e8f0; font-size: 13px; font-weight: 600; margin-top: 10px; padding: 0 20px; }
    .lang-row { margin-top: 16px; }
    .lang-row a { color: #d4a017; font-size: 12px; font-weight: 600; text-decoration: none; }
    .lang-row span { color: #64748b; font-size: 12px; padding: 0 6px; }
    .content { padding: 32px; }
    /* In-page language switch, pure CSS: each block is a target anchor, and
       clicking en/mg additionally hides the French block via the general
       sibling combinator — no JS, and crucially no navigation away from the
       e-mail. Degrades gracefully to "always French" on clients that don't
       support :target (e.g. Outlook desktop) since .lang-default stays
       display:block regardless. */
    .lang-section { display: none; }
    .lang-section:target { display: block; }
    .lang-default { display: block; }
    #lang-en:target ~ .lang-default,
    #lang-mg:target ~ .lang-default { display: none; }
    h1 { color: #003366; font-size: 19px; font-weight: bold; margin: 0 0 16px; }
    p { font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .action { text-align: center; margin: 28px 0; }
    .button { display: inline-block; background-color: #003366; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 999px; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
</style>
</head>
<body>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="wrapper">
<tr><td>
<table role="presentation" cellpadding="0" cellspacing="0" class="inner" align="center">
<tr><td class="header">
<a href="{{ config('app.url') }}" style="display:inline-block;">
<img src="{{ asset('images/logo-isstm.png') }}" alt="ISSTM Mahajanga">
</a>
<div class="header-title">Institut Supérieur des Sciences et Technologies de Mahajanga</div>
<div class="lang-row">
<a href="#lang-fr">🇫🇷 Français</a>
<span>&middot;</span>
<a href="#lang-en">🇬🇧 English</a>
<span>&middot;</span>
<a href="#lang-mg">🇲🇬 Malagasy</a>
</div>
</td></tr>
<tr><td class="content">
@foreach ($order as $locale)
<div id="lang-{{ $locale }}" class="lang-section @if ($locale === 'fr') lang-default @endif">
<h1>{{ $sections[$locale]['heading'] }}</h1>
@foreach ($sections[$locale]['lines'] as $line)
@continue(empty($line))
<p>{!! $line !!}</p>
@endforeach
@if (!empty($sections[$locale]['button']))
<div class="action">
<a href="{{ $sections[$locale]['button']['url'] }}" class="button">{{ $sections[$locale]['button']['text'] }}</a>
</div>
@endif
</div>
@endforeach
</td></tr>
<tr><td class="footer">
&copy; {{ date('Y') }} {{ config('app.name') }}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
