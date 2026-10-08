<?php

namespace App;

use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

/**
 * Builds a one-sheet Excel workbook (.xlsx) from a header row and data rows,
 * using only PHP's own zip support — the app has no spreadsheet package, and a
 * real .xlsx opens cleanly in Excel, LibreOffice and Google Sheets where a CSV
 * needs the right separator and encoding to survive accents.
 *
 * Every value is written as text, so a phone number keeps its leading zero and
 * a matricule is never turned into a number or a date. The header row is bold on
 * a dark band, frozen while scrolling, and carries a filter on every column.
 */
class XlsxWriter
{
    private const MAX_COLUMN_WIDTH = 48;

    private const MIN_COLUMN_WIDTH = 10;

    /**
     * @param  array<int, string>  $headers
     * @param  iterable<array<int, scalar|null>>  $rows
     */
    public static function download(string $filename, string $sheetTitle, array $headers, iterable $rows): BinaryFileResponse
    {
        $path = tempnam(sys_get_temp_dir(), 'xlsx');

        if ($path === false) {
            throw new RuntimeException('Impossible de créer le fichier Excel temporaire.');
        }

        $zip = new ZipArchive;

        if ($zip->open($path, ZipArchive::OVERWRITE | ZipArchive::CREATE) !== true) {
            throw new RuntimeException('Impossible de créer le fichier Excel.');
        }

        $zip->addFromString('[Content_Types].xml', self::contentTypes());
        $zip->addFromString('_rels/.rels', self::rootRelationships());
        $zip->addFromString('xl/workbook.xml', self::workbook($sheetTitle));
        $zip->addFromString('xl/_rels/workbook.xml.rels', self::workbookRelationships());
        $zip->addFromString('xl/styles.xml', self::styles());
        $zip->addFromString('xl/worksheets/sheet1.xml', self::sheet($headers, $rows));
        $zip->close();

        return response()
            ->download($path, $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
            ->deleteFileAfterSend(true);
    }

    /**
     * @param  array<int, string>  $headers
     * @param  iterable<array<int, scalar|null>>  $rows
     */
    private static function sheet(array $headers, iterable $rows): string
    {
        $widths = array_map(fn (string $header) => mb_strlen($header) + 4, $headers);
        $body = '';
        $count = 1;

        $header = '<row r="1" ht="22" customHeight="1">';
        foreach ($headers as $index => $title) {
            $header .= self::cell($index, 1, $title, 1);
        }
        $header .= '</row>';

        foreach ($rows as $row) {
            $count++;
            $body .= "<row r=\"{$count}\">";

            foreach (array_values($row) as $index => $value) {
                $text = self::text($value);
                $widths[$index] = max($widths[$index] ?? 0, mb_strlen($text) + 2);
                $body .= self::cell($index, $count, $text, 0);
            }

            $body .= '</row>';
        }

        $lastColumn = self::columnName(max(count($headers) - 1, 0));
        $cols = '';
        foreach ($headers as $index => $_) {
            $width = min(self::MAX_COLUMN_WIDTH, max(self::MIN_COLUMN_WIDTH, $widths[$index] ?? self::MIN_COLUMN_WIDTH));
            $position = $index + 1;
            $cols .= "<col min=\"{$position}\" max=\"{$position}\" width=\"{$width}\" customWidth=\"1\"/>";
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            ."<dimension ref=\"A1:{$lastColumn}{$count}\"/>"
            .'<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
            .'<sheetFormatPr defaultRowHeight="15"/>'
            ."<cols>{$cols}</cols>"
            ."<sheetData>{$header}{$body}</sheetData>"
            ."<autoFilter ref=\"A1:{$lastColumn}{$count}\"/>"
            .'</worksheet>';
    }

    private static function cell(int $column, int $row, string $text, int $style): string
    {
        $reference = self::columnName($column).$row;
        $value = self::escape($text);
        $styleAttribute = $style > 0 ? " s=\"{$style}\"" : '';

        return "<c r=\"{$reference}\" t=\"inlineStr\"{$styleAttribute}><is><t xml:space=\"preserve\">{$value}</t></is></c>";
    }

    private static function text(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        return is_bool($value) ? ($value ? 'Oui' : 'Non') : (string) $value;
    }

    /** A, B … Z, AA, AB … for a zero-based column index. */
    private static function columnName(int $index): string
    {
        $name = '';

        for ($number = $index + 1; $number > 0; $number = intdiv($number - 1, 26)) {
            $name = chr(65 + (($number - 1) % 26)).$name;
        }

        return $name;
    }

    /** XML-escapes a value and drops the control characters XML 1.0 forbids. */
    private static function escape(string $text): string
    {
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $text) ?? '';

        return htmlspecialchars($clean, ENT_XML1 | ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /** Excel sheet names: at most 31 characters, none of  [ ] : * ? / \ . */
    private static function sheetName(string $title): string
    {
        $name = trim(preg_replace('/[\[\]:*?\/\\\\]/', ' ', $title) ?? '');

        return mb_substr($name !== '' ? $name : 'Feuille 1', 0, 31);
    }

    private static function contentTypes(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            .'</Types>';
    }

    private static function rootRelationships(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>';
    }

    private static function workbook(string $sheetTitle): string
    {
        $name = self::escape(self::sheetName($sheetTitle));

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            ."<sheets><sheet name=\"{$name}\" sheetId=\"1\" r:id=\"rId1\"/></sheets>"
            .'</workbook>';
    }

    private static function workbookRelationships(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            .'</Relationships>';
    }

    /** Style 0 is plain; style 1 is the header: bold white text on a dark band. */
    private static function styles(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<fonts count="2">'
            .'<font><sz val="11"/><name val="Calibri"/></font>'
            .'<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'
            .'</fonts>'
            .'<fills count="3">'
            .'<fill><patternFill patternType="none"/></fill>'
            .'<fill><patternFill patternType="gray125"/></fill>'
            .'<fill><patternFill patternType="solid"><fgColor rgb="FF1E293B"/><bgColor indexed="64"/></patternFill></fill>'
            .'</fills>'
            .'<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            .'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            .'<cellXfs count="2">'
            .'<xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
            .'<xf numFmtId="49" fontId="1" fillId="2" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>'
            .'</cellXfs>'
            .'<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            .'</styleSheet>';
    }
}
