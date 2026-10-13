import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import EditTextDialog from './EditTextDialog';
import EditImageDialog from './EditImageDialog';

/**
 * Site-wide quick-edit layer, active only while quick edit mode is on:
 *
 * 1. A frame follows the mouse and outlines whatever editable thing it touches
 *    — a text, an image, an icon, a video or a whole section — with a small
 *    label saying which one it is.
 * 2. Everything that has no pencil of its own yet is still editable: a text
 *    shown on screen is matched back to the site content (or language-file
 *    string, stored as `ui.<key>`) it came from, and an <img> to the image
 *    content it displays. The frame then carries its own pencil.
 *
 * Nothing here is trusted: the server re-checks the permission and the key on
 * save, exactly as for the existing per-component pencils.
 */

const PENCIL = 'button.bg-amber-400:not([data-qe-skip])';
const EDITABLE_SELECTOR = `:has(> ${PENCIL} > svg.lucide-pencil)`;
const IGNORED_SELECTOR = '[data-qe-skip], [role="dialog"], input, textarea, select, [contenteditable="true"]';
const IMAGE_PATH = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const UI_PREFIX = 'ui.';

const KIND_STYLES = {
    text: { label: 'Texte', color: '#f59e0b' },
    image: { label: 'Image', color: '#10b981' },
    icon: { label: 'Icône', color: '#8b5cf6' },
    video: { label: 'Vidéo', color: '#f43f5e' },
    section: { label: 'Section', color: '#0ea5e9' },
};

const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

function kindOfPencil(element) {
    const label = (element.querySelector(`:scope > ${PENCIL}`)?.getAttribute('aria-label') ?? '').toLowerCase();

    if (label.includes('image')) return 'image';
    if (label.includes('icône') || label.includes('icone')) return 'icon';
    if (label.includes('vidéo') || label.includes('video')) return 'video';
    if (label.includes('contenu') || label.includes('texte')) return 'text';

    return 'section';
}

function safeClosest(element, selector) {
    try {
        return element.closest(selector);
    } catch {
        return null;
    }
}

/** Value → key lookups for the texts and images the page can show. */
function buildIndexes(content, translations) {
    const texts = new Map();
    const images = new Map();

    Object.entries(content ?? {}).forEach(([key, raw]) => {
        if (key.startsWith(UI_PREFIX) || typeof raw !== 'string') return;

        const value = normalize(raw);
        if (IMAGE_PATH.test(value)) {
            images.set(value.replace(/^\/+/, ''), { key, value: raw });
        } else if (value.length >= 3 && /[\p{L}]{2,}/u.test(value) && !texts.has(value)) {
            texts.set(value, { key, value: raw });
        }
    });

    Object.entries(translations ?? {}).forEach(([key, raw]) => {
        if (typeof raw !== 'string') return;

        const value = normalize(raw);
        if (value.length >= 3 && /[\p{L}]{2,}/u.test(value) && !texts.has(value)) {
            texts.set(value, { key: `${UI_PREFIX}${key}`, value: raw });
        }
    });

    return { texts, images };
}

function imagePathOf(image) {
    try {
        return decodeURIComponent(new URL(image.currentSrc || image.src, window.location.origin).pathname).replace(/^\/+/, '');
    } catch {
        return '';
    }
}

export default function QuickEditOverlay() {
    const { active } = useQuickEdit();
    const { url, props } = usePage();
    const { content, translations, contentStyles, auth } = props;
    const permissions = auth?.permissions ?? [];
    const enabled = active && !url.startsWith('/console');

    const indexes = useMemo(() => (enabled ? buildIndexes(content, translations) : null), [enabled, content, translations]);
    const [hover, setHover] = useState(null);
    const [rect, setRect] = useState(null);
    const [editing, setEditing] = useState(null);
    const rootRef = useRef(null);

    const canText = permissions.includes('quick-edit.text');
    const canImage = permissions.includes('quick-edit.image');

    const locate = useCallback(
        (target) => {
            const editable = safeClosest(target, EDITABLE_SELECTOR);

            if (target.tagName !== 'IMG' || !editable) {
                let element = target;
                for (let depth = 0; element && element !== document.body && element !== editable && depth < 5; depth += 1) {
                    if (element.querySelector(`:scope > ${PENCIL}`)) break;

                    if (canText && element.childElementCount <= 40) {
                        const text = normalize(element.textContent);
                        const match = text.length <= 800 ? indexes.texts.get(text) : null;
                        if (match) return { element, kind: 'text', own: false, edit: { kind: 'text', ...match } };
                    }
                    element = element.parentElement;
                }
            }

            if (editable) return { element: editable, kind: kindOfPencil(editable), own: true };

            if (canImage && target.tagName === 'IMG') {
                const match = indexes.images.get(imagePathOf(target));
                if (match) return { element: target, kind: 'image', own: false, edit: { kind: 'image', ...match } };
            }

            return null;
        },
        [indexes, canText, canImage],
    );

    useEffect(() => {
        if (!enabled) {
            setHover(null);
            return undefined;
        }

        function onOver(event) {
            const target = event.target;
            if (!(target instanceof Element) || rootRef.current?.contains(target)) return;

            if (safeClosest(target, IGNORED_SELECTOR)) {
                setHover(null);
                return;
            }

            const found = locate(target);
            setHover((current) => (current?.element === found?.element ? current : found));
        }

        function onLeaveWindow(event) {
            if (!event.relatedTarget) setHover(null);
        }

        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseout', onLeaveWindow);

        return () => {
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onLeaveWindow);
        };
    }, [enabled, locate]);

    useEffect(() => setHover(null), [url]);

    useEffect(() => {
        if (!hover) {
            setRect(null);
            return undefined;
        }

        let frame = 0;
        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                if (!hover.element.isConnected) {
                    setHover(null);
                    return;
                }
                const box = hover.element.getBoundingClientRect();
                setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
            });
        };

        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [hover]);

    if (!enabled) return null;

    const style = hover ? KIND_STYLES[hover.kind] : null;
    const labelAbove = rect && rect.top > 26;

    return (
        <div ref={rootRef} data-qe-skip>
            {hover && rect && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed z-[9990] rounded-md"
                    style={{
                        top: rect.top - 3,
                        left: rect.left - 3,
                        width: rect.width + 6,
                        height: rect.height + 6,
                        border: `2px dashed ${style.color}`,
                        backgroundColor: `${style.color}14`,
                        transition: 'top 120ms ease, left 120ms ease, width 120ms ease, height 120ms ease',
                    }}
                >
                    <span
                        className="absolute left-0 rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white shadow"
                        style={{ backgroundColor: style.color, [labelAbove ? 'bottom' : 'top']: labelAbove ? '100%' : 0 }}
                    >
                        {style.label}
                    </span>
                </div>
            )}

            {hover && rect && !hover.own && (
                <button
                    type="button"
                    data-qe-skip
                    onClick={() => setEditing(hover.edit)}
                    aria-label={`Modifier ${style.label.toLowerCase()}`}
                    className="fixed z-[9991] flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                    style={{
                        top: Math.min(Math.max(rect.top + 3, 4), window.innerHeight - 36),
                        left: Math.max(Math.min(rect.left + rect.width - 30, window.innerWidth - 36), 4),
                    }}
                >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            )}

            {editing?.kind === 'text' && (
                <EditTextDialog
                    key={editing.key}
                    open
                    onClose={() => setEditing(null)}
                    contentKey={editing.key}
                    initialValue={editing.value}
                    initialStyle={contentStyles?.[editing.key]}
                />
            )}
            {editing?.kind === 'image' && (
                <EditImageDialog
                    key={editing.key}
                    open
                    onClose={() => setEditing(null)}
                    contentKey={editing.key}
                    currentValue={editing.value}
                    initialStyle={contentStyles?.[editing.key]}
                />
            )}
        </div>
    );
}
