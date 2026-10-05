<?php

namespace App\Http\Requests;

use App\StatutInscription;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class SubmitInscriptionDossierRequest extends FormRequest
{
    /**
     * Only the student who owns this still-editable dossier may finalize it.
     */
    public function authorize(): bool
    {
        $inscription = $this->route('inscription');

        return $inscription !== null
            && $inscription->etudiant?->user_id === $this->user()?->id
            && in_array($inscription->statut, [StatutInscription::Brouillon, StatutInscription::ACompleter], true);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $inscription = $this->route('inscription');

        return [
            'type' => ['required', Rule::in(['reinscription', 'redoublement'])],
            'filiere_id' => ['required', 'exists:filieres,id'],
            'niveau_souhaite' => ['required', 'string', 'max:10'],
            'releve_notes' => [$inscription?->releve_notes_path ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'piece_supplementaire' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'filiere_id' => 'filière',
            'niveau_souhaite' => 'niveau souhaité',
            'releve_notes' => "relevé de notes de l'année précédente",
            'piece_supplementaire' => 'pièce complémentaire',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        Log::warning('inscription-dossier.submit: validation refused the dossier', [
            'inscription_id' => $this->route('inscription')?->id,
            'errors' => $validator->errors()->toArray(),
        ]);

        parent::failedValidation($validator);
    }
}
