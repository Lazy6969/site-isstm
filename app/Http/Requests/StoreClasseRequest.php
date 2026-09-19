<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClasseRequest extends FormRequest
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
            'nom' => ['required', 'string', 'max:100'],
            'filiere_id' => ['required', 'exists:filieres,id'],
            'niveau' => ['required', 'string', 'max:10'],
            'annee' => ['required', 'string', 'max:20'],
            'effectif_max' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
