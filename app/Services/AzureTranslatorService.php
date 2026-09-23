<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AzureTranslatorService
{
    /**
     * Translates $text from French into each of $targetLocales via the Azure
     * Translator REST API (v3, "text translation"). Falls back to returning
     * the original French text for every locale — not a translation, just a
     * placeholder — when no API key is configured or the call fails, so a
     * quick-edit save is never blocked by a translation outage.
     *
     * @param  array<int, string>  $targetLocales
     * @return array<string, string> keyed by locale
     */
    public function translate(string $text, array $targetLocales): array
    {
        $fallback = array_fill_keys($targetLocales, $text);

        $key = config('services.azure_translator.key');

        if (blank($key) || trim($text) === '') {
            return $fallback;
        }

        try {
            $query = http_build_query(['api-version' => '3.0', 'from' => 'fr'])
                .'&'.implode('&', array_map(fn (string $locale) => 'to='.urlencode($locale), $targetLocales));

            $response = Http::withHeaders([
                'Ocp-Apim-Subscription-Key' => $key,
                'Ocp-Apim-Subscription-Region' => config('services.azure_translator.region'),
            ])
                ->timeout(10)
                ->post(rtrim(config('services.azure_translator.endpoint'), '/')."/translate?{$query}", [
                    ['Text' => $text],
                ]);

            if ($response->failed()) {
                Log::warning('Azure Translator request failed', ['status' => $response->status()]);

                return $fallback;
            }

            $translations = $response->json('0.translations', []);

            $results = $fallback;
            foreach ($translations as $translation) {
                if (isset($translation['to'], $translation['text']) && in_array($translation['to'], $targetLocales, true)) {
                    $results[$translation['to']] = $translation['text'];
                }
            }

            return $results;
        } catch (\Throwable $e) {
            Log::warning('Azure Translator request threw', ['message' => $e->getMessage()]);

            return $fallback;
        }
    }
}
