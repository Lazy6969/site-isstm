<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClassGroupMessageForwardRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $message = $this->route('message');
        $membership = $message->classGroup->memberFor($this->user());

        return $membership !== null && ! $membership->is_banned && $message->deleted_for_everyone_at === null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'conversation_id' => ['required_without:user_id', 'nullable', 'integer', 'exists:conversations,id'],
            'user_id' => ['required_without:conversation_id', 'nullable', 'integer', 'exists:users,id'],
        ];
    }
}
