<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTestimonialRequest extends FormRequest
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
            'author_name' => ['required', 'string', 'max:255'],
            'program' => ['nullable', 'string', 'max:255'],
            'quote_fr' => ['required', 'string'],
            'quote_en' => ['nullable', 'string'],
            'quote_mg' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
            'display_order' => ['nullable', 'integer'],
        ];
    }
}
