<?php

namespace App\Http\Requests\Bibliotheque;

use App\CanevasNiveau;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBibFiliereRequest extends FormRequest
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
            'nom' => ['required', 'string', 'max:150'],
            'abreviation' => ['required', 'string', 'max:20'],
            'niveau' => ['required', Rule::enum(CanevasNiveau::class)],
            'mention_id' => ['required', 'exists:bibliotheque.mentions,id'],
        ];
    }
}
