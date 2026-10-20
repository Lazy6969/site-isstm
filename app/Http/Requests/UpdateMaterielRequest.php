<?php

namespace App\Http\Requests;

use App\MaterielEtat;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Every field is `sometimes`: the full edit dialog sends them all, while an
 * inline quick-edit in the list sends only the one field being changed.
 */
class UpdateMaterielRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'lieu' => ['sometimes', 'required', 'string', 'max:150'],
            'nom' => ['sometimes', 'required', 'string', 'max:255'],
            'quantite' => ['sometimes', 'required', 'integer', 'min:1'],
            'etat' => ['sometimes', 'required', Rule::enum(MaterielEtat::class)],
            'observation' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
