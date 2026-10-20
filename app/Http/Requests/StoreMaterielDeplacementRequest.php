<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMaterielDeplacementRequest extends FormRequest
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
            'lieu_destination' => ['required', 'string', 'max:150'],
            'emprunteur' => ['required', 'string', 'max:150'],
            'quantite_emprunt' => ['required', 'integer', 'min:1'],
            'motif' => ['nullable', 'string', 'max:255'],
        ];
    }
}
