<?php

namespace App\Http\Requests;

use App\Models\SiteContent;
use App\SiteContentType;
use App\SiteIcon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuickEditContentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Text/icon/image are gated by separate permissions — checked here (against
     * the actual content being edited) rather than on the route, so a role with
     * only some of the three still gets a correct 403 on the others.
     */
    public function authorize(): bool
    {
        $content = SiteContent::where('content_key', $this->input('key'))->first();

        if ($content === null) {
            return true;
        }

        $permission = match ($content->type) {
            SiteContentType::Icon => 'quick-edit.icon',
            SiteContentType::Image => 'quick-edit.image',
            SiteContentType::Text => 'quick-edit.text',
        };

        return $this->user()?->can($permission) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Only an already-registered content_key may be edited this way — quick edit
     * updates existing content, it never creates a new one under an arbitrary key.
     * An icon value must come from the fixed SiteIcon whitelist — never free text.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $content = SiteContent::where('content_key', $this->input('key'))->first();

        return [
            'key' => ['required', 'string', Rule::exists('site_contents', 'content_key')],
            ...match ($content?->type) {
                SiteContentType::Icon => ['value' => ['required', Rule::enum(SiteIcon::class)]],
                SiteContentType::Image => ['file' => ['required', 'image', 'max:4096']],
                default => ['value' => ['required', 'string', 'max:10000']],
            },
        ];
    }
}
