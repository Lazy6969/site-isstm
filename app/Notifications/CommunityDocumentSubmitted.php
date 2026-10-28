<?php

namespace App\Notifications;

use App\Models\CommunityDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Sent to every moderator (see PermissionCatalog::COMMUNITY_DOCUMENTS) the
 * moment a non-moderator uploads a Leçon/Sujet — see
 * CommunityDocumentController::store().
 */
class CommunityDocumentSubmitted extends Notification
{
    use Queueable;

    public function __construct(public CommunityDocument $document) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'fichier_a_valider',
            'actor_id' => $this->document->user_id,
            'document_id' => $this->document->id,
            'document_category' => $this->document->category,
            'document_title' => $this->document->title,
        ];
    }
}
