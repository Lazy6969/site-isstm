<?php

namespace App\Http\Requests;

use App\EvenementStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEvenementRequest extends FormRequest
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
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'lieu' => ['nullable', 'string', 'max:255'],
            'categorie' => ['required', Rule::in(['general', 'examen', 'ceremonie', 'atelier', 'vacances', 'inscription'])],
            'status' => ['nullable', Rule::enum(EvenementStatus::class)],
            'image' => ['nullable', 'image', 'max:4096'],
        ];
    }
}
