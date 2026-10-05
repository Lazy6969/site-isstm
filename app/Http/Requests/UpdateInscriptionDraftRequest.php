<?php

namespace App\Http\Requests;

use App\StatutInscription;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInscriptionDraftRequest extends FormRequest
{
    /**
     * Only the student who owns this still-editable dossier may save progress on it.
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
        return [
            'type' => ['nullable', Rule::in(['reinscription', 'redoublement'])],
            'filiere_id' => ['nullable', 'exists:filieres,id'],
            'niveau_souhaite' => ['nullable', 'string', 'max:10'],
            'releve_notes' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'piece_supplementaire' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ];
    }
}
