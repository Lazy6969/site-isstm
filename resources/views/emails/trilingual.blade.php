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
    .content { padding: 32px; }
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
{{-- Embedded as a cid: attachment, not asset()'s absolute URL: a mail client
     fetches a remote <img> from the public internet, so a local .test APP_URL
     renders as a broken image in any real inbox. $message is injected
     automatically by Mailer::send() for every notification view. --}}
<img src="{{ $message->embed(public_path('images/logo-isstm.png')) }}" alt="ISSTM Mahajanga">
</a>
<div class="header-title">Institut Supérieur des Sciences et Technologies de Mahajanga</div>
</td></tr>
<tr><td class="content">
<h1>{{ $sections['fr']['heading'] }}</h1>
@foreach ($sections['fr']['lines'] as $line)
@continue(empty($line))
<p>{!! $line !!}</p>
@endforeach
@if (!empty($sections['fr']['button']))
<div class="action">
<a href="{{ $sections['fr']['button']['url'] }}" class="button">{{ $sections['fr']['button']['text'] }}</a>
</div>
@endif
</td></tr>
<tr><td class="footer">
&copy; {{ date('Y') }} {{ config('app.name') }}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
