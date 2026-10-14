<?php

namespace App\Support\Search;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

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
     * Same list AssistantController's chatbot filters out before scoring —
     * kept here so both share one definition instead of two copies quietly
     * drifting apart.
     */
    public const STOPWORDS = [
        'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'a', 'au', 'aux', 'pour', 'dans', 'sur', 'ou', 'est',
        'avec', 'ce', 'ces', 'je', 'tu', 'il', 'elle', 'vous', 'comment', 'quel', 'quelle', 'quels', 'quelles', 'que',
        'qui', 'mon', 'ma', 'mes', 'y', 'en', 'notre', 'nos', 'votre', 'vos', 'se', 'sont', 'faut', 'peut', 'faire',
    ];

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

    /**
     * Same tokenizer AssistantController's chatbot uses to read a visitor's
     * question — accents/case folded away (Str::ascii + lower) and stopwords
     * dropped, rather than tokenize()'s plainer "lowercase and keep words of
     * 2+ letters" used by the SQL `LIKE` path above. Splitting on apostrophes
     * too (so "l'ISSTM"/"s'inscrire" release their article) leaves one-letter
     * elision remnants, which the length filter below also catches.
     *
     * @return array<int, string>
     */
    public static function fuzzyWords(string $text): array
    {
        $normalized = Str::lower(Str::ascii(trim($text)));
        $words = preg_split('/[\s,;?!\'"]+/', $normalized) ?: [];

        return array_values(array_filter(
            $words,
            fn (string $w) => mb_strlen($w) >= 2 && ! in_array($w, self::STOPWORDS, true)
        ));
    }

    /**
     * Two words "fuzzily" match when they're a one-edit typo apart
     * (Levenshtein distance 1 — what AssistantController's chatbot relies
     * on) OR when one, with its first or last letter dropped, turns up
     * inside the other. That second check is what the old matchFuzzy() above
     * did at the SQL level, kept here because Levenshtein alone is too
     * strict for French inflection: "biomédical" is distance 2 from
     * "biomédicale"/"biomédicales"/"biomédicaux" (a whole suffix added), but
     * "biomédica"/"iomédical" (itself dropped a letter) still turns up
     * inside each of them. Both words need 4+ letters, same as the
     * Levenshtein check, to avoid short words matching almost anything.
     */
    private static function isFuzzyMatch(string $a, string $b): bool
    {
        if (mb_strlen($a) < 4 || mb_strlen($b) < 4) {
            return false;
        }

        if (levenshtein($a, $b) <= 1) {
            return true;
        }

        foreach ([mb_substr($a, 1), mb_substr($a, 0, -1)] as $variant) {
            if ($variant !== '' && str_contains($b, $variant)) {
                return true;
            }
        }

        foreach ([mb_substr($b, 1), mb_substr($b, 0, -1)] as $variant) {
            if ($variant !== '' && str_contains($a, $variant)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Per-query-word best match against $targetWords: 2 for an exact match,
     * 1 for a fuzzy one (see isFuzzyMatch()), 0 for none. Checks every target
     * word before settling for a worse match, instead of stopping at the
     * first hit, so a target list ordered ['enseignant', 'enseignants']
     * can't let "enseignants" settle for a fuzzy +1 against position 0 and
     * never reach its own exact +2 right next to it.
     *
     * @param  array<int, string>  $queryWords
     * @param  array<int, string>  $targetWords
     * @return array<int, int>
     */
    public static function wordHits(array $queryWords, array $targetWords): array
    {
        return array_map(function (string $qw) use ($targetWords) {
            $best = 0;
            foreach ($targetWords as $tw) {
                if ($qw === $tw) {
                    return 2;
                }
                if ($best < 1 && static::isFuzzyMatch($qw, $tw)) {
                    $best = 1;
                }
            }

            return $best;
        }, $queryWords);
    }

    /**
     * The sum of wordHits() — how well $targetWords answers $queryWords
     * overall, used by AssistantController to rank its intents/FAQ against
     * each other (picking the single best one, no minimum coverage
     * required), and by rankByOverlap() below for ranking rows that have
     * already passed matchesEveryWord().
     *
     * @param  array<int, string>  $queryWords
     * @param  array<int, string>  $targetWords
     */
    public static function overlapScore(array $queryWords, array $targetWords): int
    {
        return array_sum(static::wordHits($queryWords, $targetWords));
    }

    /**
     * True only when every query word has at least a fuzzy match somewhere
     * in $targetWords — the AND-across-keywords requirement the SQL
     * `matchAll()` path above enforces structurally (one `WHERE` per token),
     * kept here as an explicit gate because overlapScore() alone is a
     * similarity score, not a coverage check: a long, otherwise-irrelevant
     * row could rack up a high score on word 1 alone and still show up for a
     * search that also typed word 2.
     *
     * @param  array<int, string>  $queryWords
     * @param  array<int, string>  $targetWords
     */
    public static function matchesEveryWord(array $queryWords, array $targetWords): bool
    {
        return ! in_array(0, static::wordHits($queryWords, $targetWords), true);
    }

    /**
     * Scores and ranks an already-fetched, already small collection (a
     * catalog page's worth of rows — filières, enseignants, campus blocs...;
     * unsuitable for a table that can grow unbounded, like community posts,
     * which stay on the SQL `LIKE` path above) with the same word-overlap
     * algorithm as the Assistant ISSTM chatbot, instead of SQL `LIKE`
     * patterns. A row is kept only if matchesEveryWord() passes against its
     * title+body combined (every query word found, title or body, exact or
     * fuzzy) — then ranked by overlapScore() against that same combined text
     * plus a second pass against the title alone, so a title hit still
     * outranks a body-only one exactly like orderByRelevance()'s "title hit
     * counts double" on the SQL path. Ties keep whatever order $rows was
     * already in, so sorting it by recency first reproduces
     * orderByRelevance()'s recency tie-break.
     *
     * @template TRow
     *
     * @param  Collection<int, TRow>  $rows
     * @param  array<int, string>  $queryWords
     * @param  Closure(TRow): string  $title
     * @param  Closure(TRow): string  $body
     * @return Collection<int, TRow>
     */
    public static function rankByOverlap(Collection $rows, array $queryWords, Closure $title, Closure $body, int $limit = 5): Collection
    {
        return $rows
            ->map(function ($row) use ($queryWords, $title, $body) {
                $titleWords = static::fuzzyWords($title($row));
                $allWords = [...$titleWords, ...static::fuzzyWords($body($row))];

                if (! static::matchesEveryWord($queryWords, $allWords)) {
                    return null;
                }

                return [
                    'row' => $row,
                    'score' => static::overlapScore($queryWords, $allWords) + static::overlapScore($queryWords, $titleWords),
                ];
            })
            ->filter()
            ->sortByDesc(fn (array $scored) => $scored['score'])
            ->take($limit)
            ->pluck('row')
            ->values();
    }
}
