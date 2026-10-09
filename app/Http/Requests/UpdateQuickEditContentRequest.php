<?php

namespace App\Http\Requests;

use App\Models\SiteContent;
use App\SiteContentType;
use App\SiteIcon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
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

        return $this->user()?->can($content->type->permission()) ?? false;
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
            'locale' => ['nullable', Rule::in(['fr', 'en', 'mg'])],
            ...match ($content?->type) {
                SiteContentType::Icon => ['value' => ['required', Rule::enum(SiteIcon::class)]],
                // A `..._coords` key carries a "latitude,longitude" pair (see
                // ContactMaps) rather than an arbitrary link — validated more
                // strictly so a typo can't silently break the embedded map.
                SiteContentType::Url => [
                    'value' => Str::endsWith($content?->content_key ?? '', '_coords')
                        ? ['nullable', 'string', 'max:64', 'regex:/^-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?$/']
                        : ['nullable', 'string', 'max:2048'],
                ],
                SiteContentType::Image => [
                    // Optional now: the dialog also submits style-only changes
                    // (opacity/filter/radius/position) without a new file.
                    'file' => ['nullable', 'image', 'max:4096'],
                    'style' => ['nullable', 'array'],
                    'style.opacity' => ['nullable', 'integer', 'min:10', 'max:100'],
                    'style.filter' => ['nullable', Rule::in(['none', 'grayscale', 'sepia', 'blur', 'contrast', 'vivid'])],
                    'style.border_radius' => ['nullable', 'integer', 'min:0', 'max:100'],
                    'style.object_position' => ['nullable', Rule::in(['center', 'top', 'bottom', 'left', 'right'])],
                ],
                SiteContentType::Video => [
                    'file' => ['nullable', 'file', 'mimes:mp4,webm,mov', 'max:51200'],
                ],
                default => [
                    'value' => ['required', 'string', 'max:10000'],
                    'style' => ['nullable', 'array'],
                    'style.bold' => ['nullable', 'boolean'],
                    'style.italic' => ['nullable', 'boolean'],
                    'style.underline' => ['nullable', 'boolean'],
                    'style.underline_style' => ['nullable', Rule::in(['solid', 'double', 'dotted', 'dashed', 'wavy'])],
                    'style.strikethrough' => ['nullable', 'boolean'],
                    'style.align' => ['nullable', Rule::in(['left', 'center', 'right', 'justify'])],
                    'style.font_size' => ['nullable', 'integer', 'min:10', 'max:96'],
                    'style.color' => ['nullable', 'regex:/^#[0-9a-f]{6}$/i'],
                    'style.font' => ['nullable', Rule::in([
                        'sans', 'script', 'lora', 'playfair', 'montserrat', 'poppins',
                        'oswald', 'caveat', 'bebas', 'roboto-mono', 'raleway', 'admin-accent',
                    ])],
                    'style.line_height' => ['nullable', 'numeric', 'min:1', 'max:3'],
                    'style.letter_spacing' => ['nullable', 'numeric', 'min:-0.05', 'max:0.5'],
                    'style.text_transform' => ['nullable', Rule::in(['none', 'uppercase', 'lowercase', 'capitalize'])],
                    // Container styling for content keys rendered as a button
                    // (EditableButton) — plain text content simply never sets these.
                    'style.bg_color' => ['nullable', 'regex:/^#[0-9a-f]{6}$/i'],
                    'style.bg_color_hover' => ['nullable', 'regex:/^#[0-9a-f]{6}$/i'],
                    'style.border_color' => ['nullable', 'regex:/^#[0-9a-f]{6}$/i'],
                    'style.border_width' => ['nullable', 'integer', 'min:0', 'max:6'],
                    'style.border_radius' => ['nullable', 'integer', 'min:0', 'max:50'],
                    'style.shadow' => ['nullable', Rule::in(['none', 'sm', 'md', 'lg'])],
                    'style.size' => ['nullable', Rule::in(['sm', 'md', 'lg'])],
                    // Frosted-glass card styling (see the "Rejoindre" hero's
                    // parcours cards) — a plain text content key simply never
                    // sets these otherwise. Position/size are fixed, not
                    // part of this style payload.
                    'style.icon' => ['nullable', Rule::enum(SiteIcon::class)],
                    'style.blur' => ['nullable', Rule::in(['none', 'sm', 'md', 'lg', 'xl'])],
                    // Which layout to render — reused by every content key
                    // offering a design picker (stat_design in
                    // Components/Home/Stats.jsx, up to 9 choices; mission_vision_design
                    // in Components/Home/MissionVision.jsx, 5 choices) — a plain
                    // text content key simply never sets this otherwise.
                    'style.design' => ['nullable', Rule::in(['1', '2', '3', '4', '5', '6', '7', '8', '9'])],
                ],
            },
        ];
    }
}
