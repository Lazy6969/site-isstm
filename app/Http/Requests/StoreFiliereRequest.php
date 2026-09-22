<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreFiliereRequest extends FormRequest
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
            'code' => ['nullable', 'string', 'max:20'],
            'mention' => ['nullable', 'string', 'max:255'],
            'niveaux' => ['nullable', 'string', 'max:255'],
            'nom_fr' => ['required', 'string', 'max:255'],
            'nom_en' => ['nullable', 'string', 'max:255'],
            'nom_mg' => ['nullable', 'string', 'max:255'],
            'description_fr' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_mg' => ['nullable', 'string'],
            'debouches_fr' => ['nullable', 'string'],
            'debouches_en' => ['nullable', 'string'],
            'debouches_mg' => ['nullable', 'string'],
            'historique_fr' => ['nullable', 'string'],
            'historique_en' => ['nullable', 'string'],
            'historique_mg' => ['nullable', 'string'],
            'avantages_fr' => ['nullable', 'string'],
            'avantages_en' => ['nullable', 'string'],
            'avantages_mg' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
            'display_order' => ['nullable', 'integer'],
        ];
    }
}
