<?php

namespace App;

enum MediaType: string
{
    case Image = 'image';
    case Video = 'video';
    case Pdf = 'pdf';

    public static function fromMimeType(string $mimeType): ?self
    {
        return match (true) {
            str_starts_with($mimeType, 'image/') => self::Image,
            str_starts_with($mimeType, 'video/') => self::Video,
            $mimeType === 'application/pdf' => self::Pdf,
            default => null,
        };
    }
}
