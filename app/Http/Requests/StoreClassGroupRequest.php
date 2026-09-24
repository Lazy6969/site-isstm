<?php

namespace App\Http\Requests;

use App\ClassGroupType;
use App\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassGroupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasLegacyRole(Role::Etudiant, Role::Enseignant, Role::Admin);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::enum(ClassGroupType::class)],
            'annee' => ['nullable', 'string', 'max:20'],
            'filiere_id' => ['nullable', 'exists:filieres,id'],
            'niveau' => ['nullable', 'string', 'max:10'],
        ];
    }
}
