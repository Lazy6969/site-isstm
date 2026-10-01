<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreHeroSlideRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // 100MB (102400 KB): matches public/.user.ini's upload_max_filesize —
            // a ~60s smartphone video easily runs 40-90MB, well past the old 20MB cap.
            'media' => ['required', 'file', 'mimes:jpeg,jpg,png,webp,gif,mp4,mov,webm', 'max:102400'],
            'display_order' => ['nullable', 'integer'],
        ];
    }
}
