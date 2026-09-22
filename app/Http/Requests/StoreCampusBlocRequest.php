<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCampusBlocRequest extends FormRequest
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
            'bloc_key' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:campus_blocs,bloc_key'],
            'nom' => ['required', 'string', 'max:255'],
            'signification' => ['nullable', 'string'],
            'fondation' => ['nullable', 'string', 'max:255'],
            'fondateurs' => ['nullable', 'string', 'max:255'],
            'slogan' => ['nullable', 'string', 'max:255'],
            'objectifs' => ['nullable', 'string'],
            'activites' => ['nullable', 'string'],
            'danse' => ['nullable', 'string', 'max:255'],
            'mampiavaka' => ['nullable', 'string', 'max:255'],
        ];
    }
}
