<?php

namespace App\Http\Requests;

use App\GalleryStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGalleryAlbumRequest extends FormRequest
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
            'gallery_category_id' => ['nullable', 'exists:gallery_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event_date' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:150'],
            'status' => ['required', Rule::enum(GalleryStatus::class)],
            'cover_image' => ['nullable', 'image', 'max:4096'],
        ];
    }
}
