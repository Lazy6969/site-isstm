<?php

namespace App;

use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Builds a simple tabular PDF report (a title plus a header row and data
 * rows, paginated automatically) from raw PDF syntax — same reasoning as
 * XlsxWriter: the app carries no PDF package, and a hand-written PDF using
 * only text and one of the 14 standard fonts (Helvetica needs no embedding)
 * is enough for an admin export. Columns are positioned by fixed x offsets,
 * not measured text width, so very long cell values are truncated with an
 * ellipsis rather than overlapping the next column.
 */
class PdfWriter
{
    private const PAGE_WIDTH = 595.28; // A4 portrait, in points

    private const PAGE_HEIGHT = 841.89;

    private const MARGIN = 40.0;

    private const ROW_HEIGHT = 16.0;

    private const FONT_SIZE = 9;

    private const TITLE_FONT_SIZE = 14;

    /**
     * @param  array<int, string>  $headers
     * @param  array<int, float>  $columnWeights  Relative widths (e.g. [3, 2, 1.5]), normalized to the page's usable width.
     * @param  iterable<array<int, scalar|null>>  $rows
     */
    public static function download(string $filename, string $title, array $headers, array $columnWeights, iterable $rows): BinaryFileResponse
    {
        $path = tempnam(sys_get_temp_dir(), 'pdf');

        if ($path === false) {
            throw new RuntimeException('Impossible de créer le fichier PDF temporaire.');
        }

        file_put_contents($path, self::build($title, $headers, $columnWeights, $rows));

        return response()
            ->download($path, $filename, ['Content-Type' => 'application/pdf'])
            ->deleteFileAfterSend(true);
    }

    /**
     * @param  array<int, string>  $headers
     * @param  array<int, float>  $columnWeights
     * @param  iterable<array<int, scalar|null>>  $rows
     */
    private static function build(string $title, array $headers, array $columnWeights, iterable $rows): string
    {
        $columnX = self::columnPositions($columnWeights);
        $maxChars = self::maxCharsPerColumn($columnX);

        $pages = [];
        $lines = [];
        $y = self::PAGE_HEIGHT - self::MARGIN;

        $lines[] = self::textOp(self::MARGIN, $y, self::TITLE_FONT_SIZE, $title);
        $y -= self::TITLE_FONT_SIZE + 12;

        $writeRow = function (array $cells) use (&$lines, &$y, $columnX, $maxChars) {
            foreach (array_values($cells) as $i => $cell) {
                $lines[] = self::textOp($columnX[$i] ?? self::MARGIN, $y, self::FONT_SIZE, self::truncate((string) ($cell ?? ''), $maxChars[$i] ?? 20));
            }
            $y -= self::ROW_HEIGHT;
        };

        $writeRow($headers);
        $y -= 4;

        foreach ($rows as $row) {
            if ($y < self::MARGIN) {
                $pages[] = $lines;
                $lines = [];
                $y = self::PAGE_HEIGHT - self::MARGIN;
            }
            $writeRow($row);
        }

        $pages[] = $lines;

        return self::assemble($pages);
    }

    /**
     * @param  array<int, float>  $weights
     * @return array<int, float>
     */
    private static function columnPositions(array $weights): array
    {
        $usableWidth = self::PAGE_WIDTH - 2 * self::MARGIN;
        $totalWeight = array_sum($weights) ?: 1;

        $positions = [];
        $x = self::MARGIN;
        foreach ($weights as $weight) {
            $positions[] = $x;
            $x += $usableWidth * ($weight / $totalWeight);
        }

        return $positions;
    }

    /**
     * @param  array<int, float>  $columnX
     * @return array<int, int>
     */
    private static function maxCharsPerColumn(array $columnX): array
    {
        $chars = [];
        $count = count($columnX);
        $avgCharWidth = self::FONT_SIZE * 0.55; // rough Helvetica average, generous enough to avoid overlap

        for ($i = 0; $i < $count; $i++) {
            $width = ($i + 1 < $count ? $columnX[$i + 1] : self::PAGE_WIDTH - self::MARGIN) - $columnX[$i] - 6;
            $chars[$i] = max(3, (int) floor($width / $avgCharWidth));
        }

        return $chars;
    }

    private static function truncate(string $text, int $maxChars): string
    {
        if (mb_strlen($text) <= $maxChars) {
            return $text;
        }

        return mb_substr($text, 0, max($maxChars - 1, 1)).'…';
    }

    private static function textOp(float $x, float $y, int $size, string $text): string
    {
        return sprintf('BT /F1 %d Tf %.2F %.2F Td (%s) Tj ET', $size, $x, $y, self::escape($text));
    }

    /** WinAnsiEncoding (declared on the font below) mirrors Windows-1252, so
     * converting to that single-byte encoding keeps French accents intact
     * without embedding a font. */
    private static function escape(string $text): string
    {
        $converted = @mb_convert_encoding($text, 'Windows-1252', 'UTF-8');
        $safe = is_string($converted) ? $converted : $text;

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $safe);
    }

    /** @param  array<int, array<int, string>>  $pages */
    private static function assemble(array $pages): string
    {
        $catalogId = 1;
        $pagesId = 2;
        $fontId = 3;
        $nextId = 4;

        $pageObjIds = [];
        $contentObjIds = [];
        foreach ($pages as $ignored) {
            $pageObjIds[] = $nextId++;
            $contentObjIds[] = $nextId++;
        }

        $objects = [];
        $objects[$catalogId] = "<< /Type /Catalog /Pages {$pagesId} 0 R >>";

        $kids = implode(' ', array_map(fn (int $id) => "{$id} 0 R", $pageObjIds));
        $objects[$pagesId] = sprintf('<< /Type /Pages /Kids [%s] /Count %d >>', $kids, count($pages));

        $objects[$fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';

        foreach ($pages as $index => $lines) {
            $pageId = $pageObjIds[$index];
            $contentId = $contentObjIds[$index];

            $objects[$pageId] = sprintf(
                '<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %.2F %.2F] /Resources << /Font << /F1 %d 0 R >> >> /Contents %d 0 R >>',
                $pagesId,
                self::PAGE_WIDTH,
                self::PAGE_HEIGHT,
                $fontId,
                $contentId,
            );

            $stream = implode("\n", $lines)."\n";
            $objects[$contentId] = '<< /Length '.strlen($stream)." >>\nstream\n{$stream}endstream";
        }

        ksort($objects);

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $id => $body) {
            $offsets[$id] = strlen($pdf);
            $pdf .= "{$id} 0 obj\n{$body}\nendobj\n";
        }

        $maxId = max(array_keys($objects));
        $xrefOffset = strlen($pdf);

        $pdf .= 'xref'."\n".'0 '.($maxId + 1)."\n";
        $pdf .= "0000000000 65535 f \n";
        for ($id = 1; $id <= $maxId; $id++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$id] ?? 0);
        }

        $pdf .= "trailer\n<< /Size ".($maxId + 1)." /Root {$catalogId} 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }
}
