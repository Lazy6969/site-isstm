@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ asset('images/logo-isstm.png') }}" class="logo" alt="ISSTM Mahajanga">
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
