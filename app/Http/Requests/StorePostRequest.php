<?php

namespace App\Http\Requests;

use App\PostType;
use App\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasLegacyRole(Role::Etudiant, Role::Admin, Role::Enseignant);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(PostType::class)],
            'body' => ['required_without_all:media,shared_post_id', 'nullable', 'string', 'max:5000'],
            'media' => ['nullable', 'array', 'max:10'],
            'media.*' => ['file', 'max:20480', 'mimes:jpg,jpeg,png,webp,gif,mp4,webm,mov,pdf'],
            'shared_post_id' => ['nullable', 'integer', Rule::exists('posts', 'id')],
        ];
    }
}
