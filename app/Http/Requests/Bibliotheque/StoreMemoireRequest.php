<?php

namespace App\Http\Requests\Bibliotheque;

use App\MemoireCategorie;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMemoireRequest extends FormRequest
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
            'titre' => ['required', 'string', 'max:200'],
            'auteur' => ['required', 'string', 'max:150'],
            'encadreur' => ['nullable', 'string', 'max:150'],
            'categorie' => ['required', Rule::enum(MemoireCategorie::class)],
            'filiere_id' => ['required', 'exists:bibliotheque.filieres,id'],
            'annee_id' => ['required', 'exists:bibliotheque.annees_universitaires,id'],
            'resume' => ['nullable', 'string', 'max:5000'],
            'fichier' => ['required', 'file', 'mimes:pdf', 'max:30720'],
        ];
    }
}
