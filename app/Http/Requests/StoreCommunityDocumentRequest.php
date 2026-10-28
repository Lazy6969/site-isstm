<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommunityDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * No `max` on `file` — this upload is deliberately unbounded besides the
     * server's own PHP ceiling (see public/.user.ini: upload_max_filesize).
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', Rule::in(['lecon', 'sujet'])],
            'filiere_ids' => ['nullable', 'array'],
            'filiere_ids.*' => ['integer', 'exists:filieres,id'],
            'niveaux' => ['nullable', 'array'],
            'niveaux.*' => [Rule::in(['L1', 'L2', 'L3', 'M1', 'M2'])],
            'annee' => ['nullable', 'digits:4'],
            'title' => ['required', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp,gif,bmp,svg,heic,heif,avif,tiff'],
        ];
    }
}
