<?php

use App\SiteContentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Adds the recipient address for the Contact page's new quick-send form
     * (see QuickContactController) as its own SiteContent row — Url-typed
     * like the GPS coordinates seeded alongside it in HomeContentSeeder, so
     * it's shared across locales and never goes through the French-to-EN/MG
     * machine translation a Text edit triggers. Defaults to whatever
     * contact_email already holds right now, so a previously admin-edited
     * address carries over instead of resetting to the seeder's original
     * default.
     */
    public function up(): void
    {
        $default = DB::table('site_contents')->where('content_key', 'contact_email')->value('content_value_fr')
            ?? 'isstm.univ.umg@gmail.com';

        DB::table('site_contents')->updateOrInsert(
            ['content_key' => 'contact_formulaire_email'],
            [
                'type' => SiteContentType::Url->value,
                'content_value_fr' => $default,
                'content_value_en' => $default,
                'content_value_mg' => $default,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );
    }

    public function down(): void
    {
        DB::table('site_contents')->where('content_key', 'contact_formulaire_email')->delete();
    }
};
