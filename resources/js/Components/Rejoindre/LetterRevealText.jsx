import { Fragment } from 'react';

const STEP_MS = 40;

/**
 * Reveals `text` one letter at a time (CSS-only stagger, no timers). Each
 * character needs its own span to get its own animation-delay, but making
 * every single one an independent inline-block (as a naive version of this
 * does) hands the browser a break opportunity between every two letters —
 * including mid-word. Grouping each word's letters into one
 * `inline-block whitespace-nowrap` wrapper keeps that word atomic; only the
 * plain space *between* word-wrappers (a real text node, not a span) is an
 * actual line-break opportunity, exactly like normal text wrapping.
 * `key={text}` from the caller restarts the animation whenever the admin
 * edits it. Screen readers get the whole phrase via aria-label; the
 * per-letter/per-word spans are aria-hidden so nothing garbled is announced.
 */
export default function LetterRevealText({ text }) {
    const words = text.split(' ');
    let globalIndex = 0;

    return (
        <span aria-label={text}>
            {words.map((word, wordIndex) => {
                const startIndex = globalIndex;
                globalIndex += word.length + 1;

                return (
                    <Fragment key={wordIndex}>
                        <span className="inline-block whitespace-nowrap" aria-hidden="true">
                            {[...word].map((char, charIndex) => (
                                <span
                                    key={charIndex}
                                    className="letter-reveal inline-block"
                                    style={{ animationDelay: `${(startIndex + charIndex) * STEP_MS}ms` }}
                                >
                                    {char}
                                </span>
                            ))}
                        </span>
                        {wordIndex < words.length - 1 ? ' ' : ''}
                    </Fragment>
                );
            })}
        </span>
    );
}
