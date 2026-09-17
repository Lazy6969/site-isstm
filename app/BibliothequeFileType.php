<?php

namespace App;

enum BibliothequeFileType: string
{
    case Word = 'word';
    case Pdf = 'pdf';
    case Pptx = 'pptx';

    public static function fromExtension(string $extension): ?self
    {
        return match (strtolower($extension)) {
            'doc', 'docx' => self::Word,
            'pdf' => self::Pdf,
            'ppt', 'pptx' => self::Pptx,
            default => null,
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Word => 'fa-file-word',
            self::Pdf => 'fa-file-pdf',
            self::Pptx => 'fa-file-powerpoint',
        };
    }
}
