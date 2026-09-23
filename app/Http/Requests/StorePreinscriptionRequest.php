<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
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
}
