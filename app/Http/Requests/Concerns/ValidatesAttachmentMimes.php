<?php

namespace App\Http\Requests\Concerns;

trait ValidatesAttachmentMimes
{
    /**
     * Shared by every FormRequest that accepts message/attachment uploads
     * (1-to-1 messages, class group messages, staff messages). Deliberately
     * excludes web-executable formats (html, svg, js, php…): uploads are
     * served back from this app's own storage/ origin, where those would run
     * as active content in the viewer's browser instead of just downloading.
     */
    protected function attachmentMimes(): string
    {
        // heic/heif: the default photo format on iPhone since iOS 11 — must
        // stay in sync with resources/js/lib/attachments.js's image group.
        return 'jpg,jpeg,png,webp,gif,heic,heif,mp4,webm,mov,pdf,ogg,mp3,wav,m4a,weba,'.
            'doc,docx,xls,xlsx,ppt,pptx,txt,csv,xml,json,'.
            'zip,rar,7z,apk,exe,msi,dmg,iso,deb,dll,bin';
    }
}
