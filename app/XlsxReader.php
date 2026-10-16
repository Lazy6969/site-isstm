<?php

namespace App;

use DOMDocument;
use DOMElement;
use RuntimeException;
use ZipArchive;

/**
 * Reads the first worksheet of a .xlsx workbook into an array of rows (each a
 * plain list of cell text values) using only PHP's own zip/DOM support — same
 * reasoning as XlsxWriter: this app carries no spreadsheet package, and a
 * hand-rolled reader is enough for a simple header+data admin import.
 *
 * Supports both the sharedStrings table real Excel/LibreOffice/Google Sheets
 * write, and the inlineStr cells XlsxWriter itself produces (in case an
 * export from this app is re-imported). Every cell comes back as a trimmed
 * string — callers that need a number or date parse it themselves.
 */
class XlsxReader
{
    /**
     * @return array<int, array<int, string>>
     */
    public static function read(string $path): array
    {
        $zip = new ZipArchive;

        if ($zip->open($path) !== true) {
            throw new RuntimeException("Impossible d'ouvrir le fichier Excel.");
        }

        $sheetXml = self::firstSheetXml($zip);

        if ($sheetXml === null) {
            $zip->close();
            throw new RuntimeException('Le fichier Excel ne contient aucune feuille lisible.');
        }

        $sharedStrings = self::sharedStrings($zip);
        $zip->close();

        return self::parseSheet($sheetXml, $sharedStrings);
    }

    /** sheet1.xml covers every workbook with a single, never-reordered sheet
     * (what a fresh "liste des résultats" export looks like) — anything else
     * falls back to the lowest-numbered worksheet part found in the archive. */
    private static function firstSheetXml(ZipArchive $zip): ?string
    {
        $direct = $zip->getFromName('xl/worksheets/sheet1.xml');
        if ($direct !== false) {
            return $direct;
        }

        $candidates = [];
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if ($name !== false && preg_match('#^xl/worksheets/sheet(\d+)\.xml$#', $name, $m)) {
                $candidates[(int) $m[1]] = $name;
            }
        }

        if ($candidates === []) {
            return null;
        }

        ksort($candidates);
        $xml = $zip->getFromName(reset($candidates));

        return $xml !== false ? $xml : null;
    }

    /** @return array<int, string> */
    private static function sharedStrings(ZipArchive $zip): array
    {
        $xml = $zip->getFromName('xl/sharedStrings.xml');
        if ($xml === false) {
            return [];
        }

        $dom = new DOMDocument;
        $dom->loadXML($xml, LIBXML_NOENT | LIBXML_NONET);
        $strings = [];

        // A rich-text entry spreads its text across several <r><t> runs; a
        // plain one has a single top-level <t>. Concatenating every <t>
        // under each <si> covers both without distinguishing them.
        foreach ($dom->getElementsByTagName('si') as $si) {
            $text = '';
            foreach ($si->getElementsByTagName('t') as $t) {
                $text .= $t->textContent;
            }
            $strings[] = $text;
        }

        return $strings;
    }

    /**
     * @param  array<int, string>  $sharedStrings
     * @return array<int, array<int, string>>
     */
    private static function parseSheet(string $xml, array $sharedStrings): array
    {
        $dom = new DOMDocument;
        $dom->loadXML($xml, LIBXML_NOENT | LIBXML_NONET);

        $rows = [];
        foreach ($dom->getElementsByTagName('row') as $rowNode) {
            $cells = [];
            foreach ($rowNode->getElementsByTagName('c') as $cellNode) {
                $column = self::columnIndex($cellNode->getAttribute('r'));
                $cells[$column] = self::cellValue($cellNode, $cellNode->getAttribute('t'), $sharedStrings);
            }

            if ($cells === []) {
                continue;
            }

            $max = max(array_keys($cells));
            $rows[] = array_map(fn (int $i) => $cells[$i] ?? '', range(0, $max));
        }

        return $rows;
    }

    /**
     * @param  array<int, string>  $sharedStrings
     */
    private static function cellValue(DOMElement $cell, string $type, array $sharedStrings): string
    {
        if ($type === 'inlineStr') {
            $text = '';
            foreach ($cell->getElementsByTagName('t') as $t) {
                $text .= $t->textContent;
            }

            return trim($text);
        }

        $raw = $cell->getElementsByTagName('v')->item(0)?->textContent ?? '';

        if ($type === 's') {
            return trim($sharedStrings[(int) $raw] ?? '');
        }

        return trim($raw);
    }

    /** "C7" → 2 (zero-based column index), the inverse of XlsxWriter::columnName(). */
    private static function columnIndex(string $reference): int
    {
        preg_match('/^([A-Z]+)/', $reference, $m);
        $index = 0;

        foreach (str_split($m[1] ?? 'A') as $char) {
            $index = $index * 26 + (ord($char) - 64);
        }

        return max($index - 1, 0);
    }
}
