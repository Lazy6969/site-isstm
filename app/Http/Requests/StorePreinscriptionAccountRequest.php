<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePreinscriptionAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The very first step of the wizard: enough to create the candidate's
     * account and open a Brouillon dossier. No password here — the candidate
     * receives a link by e-mail to set their own (see
     * PreinscriptionController::storeAccount()). Only the five account fields
     * are required; the rest of the Identité step is accepted so it can be
     * stored straight away, and is re-validated for real on final submit.
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
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')],

            'date_naissance' => ['nullable', 'date', 'before:today'],
            'lieu_naissance' => ['nullable', 'string', 'max:150'],
            'nationalite' => ['nullable', 'string', 'max:100'],
            'pays' => ['nullable', 'string', 'max:100'],
            'cin' => ['nullable', 'string', 'max:30'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'adresse' => ['nullable', 'string', 'max:255'],
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
            'email' => 'adresse e-mail',
        ];
    }
}
