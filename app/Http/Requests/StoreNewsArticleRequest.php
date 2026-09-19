<?php

namespace App\Http\Requests;

use App\NewsStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNewsArticleRequest extends FormRequest
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
            'news_category_id' => ['nullable', 'exists:news_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'author' => ['nullable', 'string', 'max:150'],
            'status' => ['required', Rule::enum(NewsStatus::class)],
            'is_featured' => ['boolean'],
            'image' => ['nullable', 'image', 'max:4096'],
        ];
    }
}
