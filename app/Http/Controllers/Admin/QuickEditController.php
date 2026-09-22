<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateQuickEditContentRequest;
use App\Models\SiteContent;
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
     * Update one content value: free text for the active locale, a whitelisted
     * SiteIcon name, or a replacement image — icon/image are shared across
     * locales (see SiteContent::updateForCurrentLocale()).
     * Text is plain only — no HTML is accepted — the rich-text editor and its
     * sanitization are a later phase.
     */
    public function update(UpdateQuickEditContentRequest $request): RedirectResponse
    {
        $content = SiteContent::where('content_key', $request->validated('key'))->firstOrFail();

        $value = match ($content->type) {
            SiteContentType::Image => $this->storeImage($request, $content),
            SiteContentType::Text => strip_tags($request->validated('value')),
            SiteContentType::Icon => $request->validated('value'),
        };

        $content->updateForCurrentLocale($value, $request->validated('locale'));

        return back()->with('status', 'Modification enregistrée.');
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
