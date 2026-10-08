import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import EditableText from '../QuickEdit/EditableText';

/**
 * One Q/A row — question + answer are both admin-editable (pencil), the
 * optional "go there" link underneath stays fixed (it's navigation, not
 * prose). Expand/collapse is pure CSS via the grid-template-rows 0fr/1fr
 * trick, so the answer always measures correctly without a JS height
 * calculation and respects prefers-reduced-motion through the same
 * transition utilities the rest of the site already uses.
 */
export default function FaqAccordionItem({ item, open, onToggle }) {
    const [hover, setHover] = useState(false);
    const questionKey = `faq_${item.key}_question`;
    const answerKey = `faq_${item.key}_reponse`;

    return (
        <div
            className={`overflow-hidden rounded-2xl border bg-white transition-colors dark:bg-slate-800 ${
                open ? 'border-isstm-gold/60' : 'border-slate-200 dark:border-slate-700'
            }`}
        >
            <button
                type="button"
                onClick={onToggle}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
                <span
                    className={`font-semibold transition-colors ${
                        open || hover ? 'text-isstm-navy dark:text-white' : 'text-slate-700 dark:text-slate-200'
                    }`}
                >
                    <EditableText as="span" contentKey={questionKey}>
                        {item.question}
                    </EditableText>
                </span>
                <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-isstm-gold transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        <EditableText as="p" contentKey={answerKey}>
                            {item.answer}
                        </EditableText>
                        {item.link && (
                            <Link
                                href={item.link.href}
                                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-isstm-navy hover:underline dark:text-isstm-gold"
                            >
                                {item.link.label}
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
