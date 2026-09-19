<?php

namespace App\Http\Requests;

use App\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEtudiantRequest extends FormRequest
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
            'user_id' => [
                'required',
                Rule::exists('users', 'id')->where('role', Role::Etudiant->value),
                Rule::unique('etudiants', 'user_id'),
            ],
            'classe_id' => ['nullable', 'exists:classes,id'],
            'matricule' => ['required', 'string', 'max:50', Rule::unique('etudiants', 'matricule')],
        ];
    }
}
