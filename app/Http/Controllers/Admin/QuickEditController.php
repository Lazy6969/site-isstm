<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateQuickEditContentRequest;
use App\Models\SiteContent;
use App\Models\SiteContentRevision;
use App\Services\AzureTranslatorService;
use App\SiteContentType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QuickEditController extends Controller
{
    /**
     * Uploaded quick-edit images live in storage/app/public/site-content, so a
     * stored value of "storage/site-content/x.jpg" resolves to a real URL under
     * the public disk's symlink — only these are safe to delete on replacement,
     * never the bundled seed assets under public/images.
     */
    private const UPLOAD_PREFIX = 'storage/site-content/';

    /**
     * The other editable locales a French text edit is auto-translated into.
     *
     * @var array<int, string>
     */
    private const AUTO_TRANSLATE_TARGETS = ['en', 'mg'];

    public function __construct(private readonly AzureTranslatorService $translator) {}

    /**
     * Update one content value: free text for the active locale, a whitelisted
     * SiteIcon name, or a replacement image — icon/image are shared across
     * locales (see SiteContent::updateForCurrentLocale()).
     * Text is plain only — no HTML is accepted, formatting is applied via the
     * whitelisted `style` JSON column instead (bold/italic/color/font/... for
     * text, opacity/filter/radius/position for images), rendered client-side
     * as inline CSS, never interpreted as markup.
     * Style, like icon/image, isn't locale-specific — it's set directly on the
     * model here so the single save() inside updateForCurrentLocale() below
     * persists both the value and the style together. An image edit may carry
     * a style change with no new file (replacing the file stays optional).
     */
    public function update(UpdateQuickEditContentRequest $request): RedirectResponse
    {
        $content = SiteContent::where('content_key', $request->validated('key'))->firstOrFail();

        SiteContentRevision::snapshot($content, $request->user());

        $value = match ($content->type) {
            SiteContentType::Image => $request->hasFile('file') ? $this->storeImage($request, $content) : $content->content_value_fr,
            SiteContentType::Text => strip_tags($request->validated('value')),
            SiteContentType::Icon => $request->validated('value'),
        };

        if (in_array($content->type, [SiteContentType::Text, SiteContentType::Image], true)) {
            $content->style = $request->validated('style');
        }

        $locale = $request->validated('locale');
        $content->updateForCurrentLocale($value, $locale);

        if ($content->type === SiteContentType::Text && ($locale ?? app()->getLocale()) === 'fr') {
            $this->translateIntoOtherLocales($content, $value);
        }

        return back()->with('status', 'Modification enregistrée.');
    }

    /**
     * Machine-translates the just-saved French value into every other quick-edit
     * locale and persists the result directly — this is a starting point (the
     * admin can still hand-correct EN/MG afterward via their own explicit edit),
     * not authoritative, so it never blocks the French save if translation fails.
     */
    private function translateIntoOtherLocales(SiteContent $content, string $frenchValue): void
    {
        $translations = $this->translator->translate($frenchValue, self::AUTO_TRANSLATE_TARGETS);

        foreach ($translations as $locale => $text) {
            $content->{'content_value_'.$locale} = $text;
        }

        $content->save();
    }

    private function storeImage(UpdateQuickEditContentRequest $request, SiteContent $content): string
    {
        $oldValue = $content->content_value_fr;
        if (Str::startsWith($oldValue, self::UPLOAD_PREFIX)) {
            Storage::disk('public')->delete(Str::after($oldValue, 'storage/'));
        }

        $path = $request->file('file')->store('site-content', 'public');

        return 'storage/'.$path;
    }
}
