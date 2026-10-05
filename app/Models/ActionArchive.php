<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use LogicException;

/**
 * One locked entry of the console action archive. Rows are append-only: any
 * attempt to update or delete one through Eloquent throws, and each row is
 * chained to the previous one by SHA-256 so tampering at the database level
 * is detectable (see verifyChain()).
 */
class ActionArchive extends Model
{
    public const UPDATED_AT = null;

    public const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::updating(function (): void {
            throw new LogicException('Les archives des actions sont verrouillées : modification impossible.');
        });

        static::deleting(function (): void {
            throw new LogicException('Les archives des actions sont verrouillées : suppression impossible.');
        });
    }

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function changesList(): array
    {
        return json_decode($this->getRawOriginal('changes') ?? '[]', true) ?: [];
    }

    /**
     * @return array<string, mixed>
     */
    public function inputData(): array
    {
        return json_decode($this->getRawOriginal('input') ?? '[]', true) ?: [];
    }

    /**
     * The hash of this entry, computed from its own content and the previous hash.
     */
    public static function computeHash(string $previousHash, array $fields): string
    {
        return hash('sha256', $previousHash.'|'.json_encode($fields, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    /**
     * The fields covered by the hash, read from a stored row.
     *
     * @return array<string, mixed>
     */
    public function hashedFields(): array
    {
        return [
            'user_name' => $this->user_name,
            'user_role' => $this->user_role,
            'method' => $this->method,
            'route_name' => $this->route_name,
            'path' => $this->path,
            'module' => $this->module,
            'action' => $this->action,
            'subject_label' => $this->subject_label,
            'target_id' => $this->target_id,
            'outcome' => $this->outcome,
            'status_code' => $this->status_code,
            'changes' => $this->getRawOriginal('changes'),
            'input' => $this->getRawOriginal('input'),
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Records an entry at the end of the chain. The latest hash is read inside a
     * transaction so two simultaneous requests cannot fork the chain.
     *
     * @param  array<string, mixed>  $fields
     */
    public static function record(array $fields): self
    {
        return DB::transaction(function () use ($fields) {
            $previous = static::query()->latest('id')->lockForUpdate()->value('hash') ?? self::GENESIS_HASH;
            $createdAt = now()->startOfSecond();

            $hashed = $fields + ['created_at' => $createdAt->format('Y-m-d H:i:s')];
            ksort($hashed);

            return static::create($fields + [
                'previous_hash' => $previous,
                'hash' => self::computeHash($previous, self::normalize($hashed)),
                'created_at' => $createdAt,
            ]);
        });
    }

    /**
     * Same key order and shape as hashedFields(), so hashes match on re-read.
     *
     * @param  array<string, mixed>  $fields
     * @return array<string, mixed>
     */
    private static function normalize(array $fields): array
    {
        $order = ['user_name', 'user_role', 'method', 'route_name', 'path', 'module', 'action', 'subject_label', 'target_id', 'outcome', 'status_code', 'changes', 'input', 'ip_address', 'created_at'];

        return collect($order)->mapWithKeys(fn (string $key) => [$key => $fields[$key] ?? null])->all();
    }

    /**
     * Re-computes the whole chain.
     *
     * @return array{ok: bool, checked: int, broken_id: int|null}
     */
    public static function verifyChain(): array
    {
        $previous = self::GENESIS_HASH;
        $checked = 0;

        foreach (static::query()->orderBy('id')->lazyById(500) as $entry) {
            $expected = self::computeHash($previous, self::normalize($entry->hashedFields()));

            if ($entry->previous_hash !== $previous || $entry->hash !== $expected) {
                return ['ok' => false, 'checked' => $checked, 'broken_id' => $entry->id];
            }

            $previous = $entry->hash;
            $checked++;
        }

        return ['ok' => true, 'checked' => $checked, 'broken_id' => null];
    }
}
