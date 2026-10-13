<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The homepage hero's quote ("L'excellence technique / au service de
     * votre avenir") had its English/Malagasy columns holding a verbatim
     * copy of the French text instead of a translation — likely a past
     * quick-edit save where the machine-translation call silently failed
     * (see QuickEditController::translateIntoOtherLocales(), which never
     * blocks the French save on failure, so the stale value was left in
     * place). Restores the translations the seeder already defines for
     * these two keys — only touches rows still carrying the exact
     * French-duplicated value, so an admin's own since-corrected text isn't
     * overwritten.
     */
    public function up(): void
    {
        DB::table('site_contents')
            ->where('content_key', 'accueil_hero_titre_ligne1')
            ->where('content_value_en', "L'excellence technique")
            ->update([
                'content_value_en' => 'Technical excellence',
                'content_value_mg' => 'Fahaizana ara-teknika avo lenta',
            ]);

        DB::table('site_contents')
            ->where('content_key', 'accueil_hero_titre_ligne2')
            ->where('content_value_en', 'au service de votre avenir')
            ->update([
                'content_value_en' => 'for your future',
                'content_value_mg' => "ho an'ny hoavinao",
            ]);
    }

    public function down(): void
    {
        // Not reversible — the previous state was a data bug, not a
        // deliberate value worth restoring.
    }
};
