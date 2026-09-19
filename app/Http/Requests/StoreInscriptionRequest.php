<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInscriptionRequest extends FormRequest
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
            'etudiant_id' => ['required', 'exists:etudiants,id'],
            'classe_id' => ['required', 'exists:classes,id'],
            'annee' => [
                'required',
                'string',
                'max:20',
                Rule::unique('inscriptions', 'annee')->where('etudiant_id', $this->input('etudiant_id')),
            ],
            'numero' => ['nullable', 'string', 'max:50'],
            'date_inscription' => ['nullable', 'date'],
        ];
    }
}
