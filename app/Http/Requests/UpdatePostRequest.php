<?php

namespace App\Http\Requests;

use App\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $post = $this->route('post');

        return $this->user()->hasLegacyRole(Role::Admin) || $post->user_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $post = $this->route('post');
        $bodyOptional = $post->media()->exists() || $post->shared_post_id !== null;

        return [
            'body' => [$bodyOptional ? 'nullable' : 'required', 'nullable', 'string', 'max:5000'],
        ];
    }
}
