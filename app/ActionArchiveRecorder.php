<?php

namespace App;

use App\Models\ActionArchive;
use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Event;

/**
 * Collects, for the duration of one console request, every Eloquent create /
 * update / delete together with the old → new raw values (exactly as stored,
 * so a change can later be restored). ArchiveAdminActions starts it before the
 * controller runs and stores what it gathered afterwards.
 */
class ActionArchiveRecorder
{
    private const IGNORED_MODELS = [ActionArchive::class, ActivityLog::class, DatabaseNotification::class];

    public const SENSITIVE_FIELDS = ['password', 'remember_token', 'token', 'two_factor_secret', 'two_factor_recovery_codes'];

    private const IGNORED_FIELDS = ['updated_at', 'created_at'];

    private const LABEL_FIELDS = ['title', 'titre', 'nom', 'name', 'author_name', 'content_key', 'bloc_key', 'code', 'key'];

    private bool $active = false;

    /** @var array<int, array<string, mixed>> */
    private array $changes = [];

    public function start(): void
    {
        $this->active = true;
        $this->changes = [];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function stop(): array
    {
        $this->active = false;

        return $this->changes;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    /**
     * Registers the Eloquent listeners once (called from a service provider).
     */
    public function listen(): void
    {
        foreach (['created', 'updated', 'deleted'] as $event) {
            Event::listen("eloquent.{$event}: *", function (string $name, array $payload) use ($event): void {
                $model = $payload[0] ?? null;

                if ($model instanceof Model) {
                    $this->capture($event, $model);
                }
            });
        }
    }

    public function capture(string $event, Model $model): void
    {
        if (! $this->active || in_array($model::class, self::IGNORED_MODELS, true)) {
            return;
        }

        $restorable = true;
        $attributes = null;

        if ($event === 'updated') {
            $fields = $this->diff($model);
            $restorable = ! $this->hasSensitive($fields);
        } elseif ($event === 'created') {
            $fields = $this->snapshot($model);
            $restorable = false;
        } else {
            $fields = [];
            [$attributes, $restorable] = $this->rawAttributes($model);
        }

        if ($event === 'updated' && $fields === []) {
            return;
        }

        $this->changes[] = array_filter([
            'event' => $event,
            'class' => $model::class,
            'model' => class_basename($model),
            'id' => $model->getKey(),
            'label' => $this->labelOf($model),
            'fields' => $fields,
            'attributes' => $attributes,
            'restorable' => $restorable,
        ], fn ($value) => $value !== null);
    }

    /**
     * Adds a change made outside Eloquent's events (e.g. a restoration done
     * with a direct query) to the current request's record.
     *
     * @param  array<string, array{0: mixed, 1: mixed}>  $fields
     */
    public function note(string $event, string $class, int|string $id, string $label, array $fields): void
    {
        if (! $this->active) {
            return;
        }

        $this->changes[] = [
            'event' => $event,
            'class' => $class,
            'model' => class_basename($class),
            'id' => $id,
            'label' => $label,
            'fields' => $fields,
            'restorable' => false,
        ];
    }

    public function labelOf(Model $model): string
    {
        foreach (self::LABEL_FIELDS as $field) {
            $value = $model->getAttribute($field);

            if (is_string($value) && trim($value) !== '') {
                return mb_strlen($value) > 150 ? mb_substr($value, 0, 150).'…' : $value;
            }
        }

        return class_basename($model).' #'.$model->getKey();
    }

    /**
     * @return array<string, array{0: mixed, 1: mixed}>
     */
    private function diff(Model $model): array
    {
        $fields = [];
        $attributes = $model->getAttributes();

        foreach (array_keys($model->getChanges()) as $key) {
            if (in_array($key, self::IGNORED_FIELDS, true)) {
                continue;
            }

            $fields[$key] = in_array($key, self::SENSITIVE_FIELDS, true)
                ? ['••••', '••••']
                : [$model->getRawOriginal($key), $attributes[$key] ?? null];
        }

        return $fields;
    }

    /**
     * @return array<string, array{0: mixed, 1: mixed}>
     */
    private function snapshot(Model $model): array
    {
        $fields = [];

        foreach ($model->getAttributes() as $key => $value) {
            if (in_array($key, self::IGNORED_FIELDS, true) || $value === null || $value === '') {
                continue;
            }

            $fields[$key] = [null, in_array($key, self::SENSITIVE_FIELDS, true) ? '••••' : $value];
        }

        return $fields;
    }

    /**
     * The row as stored, so a deleted record can be put back. A record with
     * secrets (a user) is not restorable: its secrets are never archived.
     *
     * @return array{0: array<string, mixed>, 1: bool}
     */
    private function rawAttributes(Model $model): array
    {
        $attributes = $model->getAttributes();
        $restorable = true;

        foreach (self::SENSITIVE_FIELDS as $field) {
            if (array_key_exists($field, $attributes)) {
                unset($attributes[$field]);
                $restorable = false;
            }
        }

        return [$attributes, $restorable];
    }

    /**
     * @param  array<string, array{0: mixed, 1: mixed}>  $fields
     */
    private function hasSensitive(array $fields): bool
    {
        foreach (array_keys($fields) as $key) {
            if (in_array($key, self::SENSITIVE_FIELDS, true)) {
                return true;
            }
        }

        return false;
    }
}
