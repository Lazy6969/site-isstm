@props(['url', 'message' => null])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
{{-- Embedded as a cid: attachment, not asset()'s absolute URL: a mail client
     fetches a remote <img> from the public internet, so a local .test APP_URL
     renders as a broken image in any real inbox. $message is forwarded here
     from resources/views/vendor/notifications/email.blade.php — see its
     comment. Falls back to asset() only if this component is ever rendered
     outside that chain (no $message to embed with). --}}
<img src="{{ $message ? $message->embed(public_path('images/logo-isstm.png')) : asset('images/logo-isstm.png') }}" class="logo" alt="ISSTM Mahajanga">
</a>
<div class="header-title">Institut Supérieur des Sciences et Technologies de Mahajanga</div>
{{-- No functional switch is possible from inside a static e-mail (the
     site's own language switcher needs a session, not just a link) — these
     simply take the reader to the site, where the real switcher lives. --}}
<div class="lang-row">
<a href="{{ $url }}">🇫🇷 Français</a>
<span>&middot;</span>
<a href="{{ $url }}">🇬🇧 English</a>
<span>&middot;</span>
<a href="{{ $url }}">🇲🇬 Malagasy</a>
</div>
</td>
</tr>
