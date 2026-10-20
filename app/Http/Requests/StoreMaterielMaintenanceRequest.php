<?php

namespace App\Http\Requests;

use App\MaterielEtat;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaterielMaintenanceRequest extends FormRequest
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
            'description' => ['required', 'string', 'max:500'],
            'etat_apres' => ['nullable', Rule::enum(MaterielEtat::class)],
        ];
    }
}
