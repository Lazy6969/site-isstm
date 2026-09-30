<?php

namespace App\Http\Requests;

use App\PreinscriptionStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePreinscriptionDraftRequest extends FormRequest
{
    /**
     * Only the candidate who owns this still-editable dossier may save progress on it.
     */
    public function authorize(): bool
    {
        $preinscription = $this->route('preinscription');

        return $preinscription !== null
            && $preinscription->user_id === $this->user()?->id
            && in_array($preinscription->status, [PreinscriptionStatus::Brouillon, PreinscriptionStatus::ACompleter], true);
    }

    /**
     * Everything here is optional: a draft can be saved with whatever the
     * candidate has filled in so far, one wizard step at a time.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date_naissance' => ['nullable', 'date', 'before:today'],
            'lieu_naissance' => ['nullable', 'string', 'max:150'],
            'cin' => ['nullable', 'string', 'max:30'],
            'nationalite' => ['nullable', 'string', 'max:100'],
            'annee_bacc' => ['nullable', 'string', 'max:10'],
            'serie_bacc' => ['nullable', 'string', 'max:50'],
            'serie_bacc_autre' => ['nullable', 'string', 'max:150'],
            'mention_bacc' => ['nullable', Rule::in(['Passable', 'Assez Bien', 'Bien', 'Très Bien'])],
            'code_redoublement' => ['nullable', Rule::in(['N', 'R'])],
            'adresse' => ['nullable', 'string', 'max:255'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'nom_pere' => ['nullable', 'string', 'max:150'],
            'nom_mere' => ['nullable', 'string', 'max:150'],
            'contact_parents' => ['nullable', 'string', 'max:50'],
            'repondant_nom' => ['nullable', 'string', 'max:150'],
            'repondant_lien' => ['nullable', 'string', 'max:100'],
            'repondant_telephone' => ['nullable', 'string', 'max:50'],
            'pays' => ['nullable', 'string', 'max:100'],
            'filiere_id' => ['nullable', 'exists:filieres,id'],
            'niveau' => ['nullable', 'string', 'max:10'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'releve_bacc' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'cin_recto' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'cin_verso' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'diplome_attestation' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ];
    }
}
