<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;

class StorePreinscriptionRequest extends FormRequest
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
            'nom' => ['required', 'string', 'max:100'],
            'prenoms' => ['required', 'string', 'max:150'],
            'civilite' => ['required', Rule::in(['M', 'Mme', 'Mlle'])],
            'sexe' => ['required', Rule::in(['M', 'F'])],
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
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')],
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()],
            'nom_pere' => ['nullable', 'string', 'max:150'],
            'nom_mere' => ['nullable', 'string', 'max:150'],
            'contact_parents' => ['required_without:repondant_telephone', 'nullable', 'string', 'max:50'],
            'repondant_nom' => ['nullable', 'string', 'max:150'],
            'repondant_lien' => ['nullable', 'string', 'max:100'],
            'repondant_telephone' => ['required_without:contact_parents', 'nullable', 'string', 'max:50'],
            'pays' => ['required', 'string', 'max:100'],
            'filiere_id' => ['required', 'exists:filieres,id'],
            'niveau' => ['required', 'string', 'max:10'],
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'releve_bacc' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'cin_recto' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'cin_verso' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'diplome_attestation' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
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
            'email' => 'adresse e-mail',
            'password' => 'mot de passe',
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
     * trace at all, which is exactly how this went undiagnosed.
     */
    protected function failedValidation(Validator $validator): void
    {
        Log::warning('preinscription.store: validation refused the dossier', [
            'email' => $this->input('email'),
            'errors' => $validator->errors()->toArray(),
        ]);

        parent::failedValidation($validator);
    }
}
