<?php

namespace App\Http\Requests;

use App\PreinscriptionStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class SubmitPreinscriptionRequest extends FormRequest
{
    /**
     * Only the candidate who owns this still-editable dossier may finalize it.
     */
    public function authorize(): bool
    {
        $preinscription = $this->route('preinscription');

        return $preinscription !== null
            && $preinscription->user_id === $this->user()?->id
            && in_array($preinscription->status, [PreinscriptionStatus::Brouillon, PreinscriptionStatus::ACompleter], true);
    }

    /**
     * The full, strict rule set the old single-shot `store()` used, minus the
     * account fields (email/password), which are fixed at account-creation
     * time. A file already saved by an earlier draft satisfies its own
     * requirement — a candidate resuming on a new session can't repopulate a
     * native file input, so re-uploading everything every time would be a trap.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $preinscription = $this->route('preinscription');

        $fileRule = fn (string $column) => $preinscription?->{$column} ? 'nullable' : 'required';

        return [
            // nom/prenoms/civilite/sexe are fixed at account creation
            // (StorePreinscriptionAccountRequest) and not re-validated here.
            'date_naissance' => ['required', 'date', 'before:today'],
            'lieu_naissance' => ['required', 'string', 'max:150'],
            'cin' => ['nullable', 'string', 'max:30'],
            'nationalite' => ['required', 'string', 'max:100'],
            'annee_bacc' => ['required', 'string', 'max:10'],
            'serie_bacc' => ['required', 'string', 'max:50'],
            'serie_bacc_autre' => ['required_if:serie_bacc,AUTRE', 'nullable', 'string', 'max:150'],
            'mention_bacc' => ['required', Rule::in(['Passable', 'Assez Bien', 'Bien', 'Très Bien'])],
            'code_redoublement' => ['required', Rule::in(['N', 'R'])],
            'adresse' => ['required', 'string', 'max:255'],
            'telephone' => ['required', 'string', 'max:30'],
            'nom_pere' => ['nullable', 'string', 'max:150'],
            'nom_mere' => ['nullable', 'string', 'max:150'],
            'contact_parents' => ['required_without:repondant_telephone', 'nullable', 'string', 'max:50'],
            'repondant_nom' => ['nullable', 'string', 'max:150'],
            'repondant_lien' => ['nullable', 'string', 'max:100'],
            'repondant_telephone' => ['required_without:contact_parents', 'nullable', 'string', 'max:50'],
            'pays' => ['required', 'string', 'max:100'],
            'filiere_id' => ['required', 'exists:filieres,id'],
            'niveau' => ['required', 'string', 'max:10'],
            'photo' => [$fileRule('photo_path'), 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'releve_bacc' => [$fileRule('releve_bacc_path'), 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'cin_recto' => [$fileRule('cin_recto_path'), 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'cin_verso' => [$fileRule('cin_verso_path'), 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'diplome_attestation' => [$fileRule('diplome_attestation_path'), 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'civilite' => 'civilité',
            'sexe' => 'genre',
            'prenoms' => 'prénom(s)',
            'date_naissance' => 'date de naissance',
            'lieu_naissance' => 'lieu de naissance',
            'nationalite' => 'nationalité',
            'pays' => 'pays de résidence',
            'telephone' => 'téléphone du candidat',
            'adresse' => 'adresse complète',
            'contact_parents' => 'téléphone des parents',
            'repondant_telephone' => 'téléphone du répondant',
            'annee_bacc' => 'année du bac',
            'serie_bacc' => 'série du bac',
            'serie_bacc_autre' => 'précision de la série',
            'mention_bacc' => 'mention',
            'code_redoublement' => 'situation',
            'filiere_id' => 'filière souhaitée',
            'photo' => "photo d'identité",
            'cin_recto' => 'CIN recto',
            'cin_verso' => 'CIN verso',
            'diplome_attestation' => 'diplôme ou attestation',
            'releve_bacc' => 'relevé de notes',
        ];
    }

    /**
     * Validation runs before the controller, so a rejected dossier never reaches
     * the controller's own logging — log it here or a failed submission leaves no
     * trace at all.
     */
    protected function failedValidation(Validator $validator): void
    {
        Log::warning('preinscription.submit: validation refused the dossier', [
            'preinscription_id' => $this->route('preinscription')?->id,
            'errors' => $validator->errors()->toArray(),
        ]);

        parent::failedValidation($validator);
    }
}
