<?php

namespace App\Http\Requests;

use App\Models\EcolagePayment;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEcolagePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->etudiant()->exists() ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['reference' => strtoupper(trim((string) $this->input('reference')))]);
    }

    /**
     * Both proofs are required every time: the receipt shows the money moved,
     * the student card lets the scolarité check it belongs to this student.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'annee_universitaire' => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'type' => ['required', Rule::in(array_keys(EcolagePayment::TYPES))],
            'mode' => ['required', Rule::in(array_keys(EcolagePayment::MODES))],
            'amount' => ['required', 'integer', 'min:1000', 'max:100000000'],
            'reference' => [
                'required', 'string', 'min:4', 'max:60',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (EcolagePayment::holdingReference((string) $value)->exists()) {
                        $fail('Cette référence de versement a déjà été déclarée.');
                    }
                },
            ],
            'paid_at' => ['required', 'date', 'before_or_equal:today', 'after_or_equal:'.now()->subYears(2)->toDateString()],
            'receipt' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'card' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'annee_universitaire' => 'année universitaire',
            'amount' => 'montant',
            'reference' => 'référence',
            'paid_at' => 'date du versement',
            'receipt' => 'reçu de versement',
            'card' => "carte d'étudiant",
        ];
    }
}
