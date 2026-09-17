<?php

namespace App\Http\Requests\Bibliotheque;

use App\CanevasNiveau;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCanevasRequest extends FormRequest
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
            'niveau' => ['required', Rule::enum(CanevasNiveau::class)],
            'annee_id' => ['required', 'exists:bibliotheque.annees_universitaires,id'],
            'fichier' => ['required', 'file', 'mimes:doc,docx,pdf,ppt,pptx', 'max:20480'],
        ];
    }
}
