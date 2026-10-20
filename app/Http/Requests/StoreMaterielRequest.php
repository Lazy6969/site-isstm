<?php

namespace App\Http\Requests;

use App\MaterielEtat;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaterielRequest extends FormRequest
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
            'lieu' => ['required', 'string', 'max:150'],
            'nom' => ['required', 'string', 'max:255'],
            'quantite' => ['required', 'integer', 'min:1'],
            'etat' => ['required', Rule::enum(MaterielEtat::class)],
            'observation' => ['nullable', 'string', 'max:255'],
        ];
    }
}
