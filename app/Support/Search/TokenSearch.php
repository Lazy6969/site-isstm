<?php

namespace App\Support\Search;

use Illuminate\Database\Eloquent\Builder;

/**
 * Multi-keyword, any-column matching shared by every search endpoint (site
 * content via SearchController, community posts/accounts via
 * CommunitySearchController) — static query helpers rather than a trait, so
 * two unrelated controllers can both reach for them without inheriting from
 * one another.
 */
class TokenSearch
{
    /**
     * Splits the search phrase into individual keywords — "génie informatique
     * mahajanga" becomes three separate clues instead of one literal phrase
     * that has to appear verbatim, letting matchAll() find rows where the
     * clues are scattered across different fields or in any order. One-letter
     * words are dropped as noise (articles, typos) unless that's all there is.
     *
     * @return array<int, string>
     */
    public static function tokenize(string $term): array
    {
        $words = collect(preg_split('/\s+/u', mb_strtolower($term), -1, PREG_SPLIT_NO_EMPTY))
            ->unique()
            ->values();

        $meaningful = $words->filter(fn (string $word) => mb_strlen($word) >= 2);

        return ($meaningful->isEmpty() ? $words : $meaningful)->all();
    }

    /**
     * Every keyword must be found (AND across tokens) — each one wherever it
     * turns up, in any of the given columns (OR across columns). This is what
     * lets "génie informatique" match a filière whose name only contains
     * "Informatique" while "Génie" only appears in its description.
     *
     * $fuzzyColumn (typically the title/name column) also tolerates a close
     * misspelling of a token: dropping its first or last character and
     * matching what's left as a substring still catches a wrong leading or
     * trailing letter ("enformatique" minus its first letter, "nformatique",
     * is still a substring of "informatique"). Deliberately simple and
     * portable (plain LIKE, no SOUNDEX or similar — unavailable on SQLite,
     * which the test suite runs on) rather than full edit-distance matching.
     * Only makes sense against a short, single-concept value — applying it
     * to a free-text paragraph column would raise false positives, so every
     * other column keeps exact-substring matching only.
     *
     * @param  array<int, string>  $tokens
     * @param  array<int, string>  $columns
     */
    public static function matchAll(Builder $query, array $tokens, array $columns, ?string $fuzzyColumn = null): Builder
    {
        foreach ($tokens as $token) {
            $query->where(function (Builder $tokenQuery) use ($columns, $token, $fuzzyColumn) {
                foreach ($columns as $column) {
                    $tokenQuery->orWhere($column, 'like', '%'.$token.'%');
                }

                if ($fuzzyColumn !== null) {
                    static::matchFuzzy($tokenQuery, $fuzzyColumn, $token);
                }
            });
        }

        return $query;
    }

    private static function matchFuzzy(Builder $query, string $column, string $token): void
    {
        if (mb_strlen($token) < 4) {
            return;
        }

        $query->orWhere($column, 'like', '%'.mb_substr($token, 1).'%');
        $query->orWhere($column, 'like', '%'.mb_substr($token, 0, -1).'%');
    }

    /**
     * Ranks rows by how many keywords land in the title versus the
     * supporting columns — a title hit counts double, so a filière named
     * after the search term outranks one that merely mentions it in its
     * description. Ties fall back to the most recently created row. Bindings
     * travel alongside the raw SQL (never interpolated), keeping this
     * injection-safe despite being built from user input. Appends to
     * whatever `select()` already chose — the caller must select its columns
     * before tapping this in, since a raw `*` here would clobber them.
     *
     * @param  array<int, string>  $tokens
     * @param  array<int, string>  $otherColumns
     */
    public static function orderByRelevance(Builder $query, array $tokens, string $titleColumn, array $otherColumns = []): Builder
    {
        $parts = [];
        $bindings = [];

        foreach ($tokens as $token) {
            $like = '%'.$token.'%';
            $parts[] = "(CASE WHEN {$titleColumn} LIKE ? THEN 2 ELSE 0 END)";
            $bindings[] = $like;

            foreach ($otherColumns as $column) {
                $parts[] = "(CASE WHEN {$column} LIKE ? THEN 1 ELSE 0 END)";
                $bindings[] = $like;
            }
        }

        return $query
            ->selectRaw('('.implode(' + ', $parts).') as search_relevance', $bindings)
            ->orderByDesc('search_relevance')
            ->orderByDesc($query->getModel()->getCreatedAtColumn());
    }
}
