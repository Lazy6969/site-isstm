import { usePage } from '@inertiajs/react';
import LegalPage from '../Components/Layout/LegalPage';
import EditableText from '../Components/QuickEdit/EditableText';

const sections = [
    {
        key: 'mentions_legales_s1',
        title: '1. Éditeur du site',
        text: "Ce site est édité par l'Institut Supérieur des Sciences et Technologies de Mahajanga (ISSTM), établissement d'enseignement supérieur basé à Mahajanga, Madagascar.",
    },
    {
        key: 'mentions_legales_s2',
        title: '2. Contact',
        text: 'Email : isstm.univ.umg@gmail.com — Téléphone : +261 38 15 439 77 — Adresse : Mahajanga, Madagascar.',
    },
    {
        key: 'mentions_legales_s3',
        title: '3. Hébergement',
        text: "Le site est hébergé sur l'infrastructure technique mise à disposition par l'ISSTM.",
    },
    {
        key: 'mentions_legales_s4',
        title: '4. Propriété intellectuelle',
        text: "L'ensemble des contenus présents sur ce site (textes, images, logos, mise en page) est la propriété de l'ISSTM, sauf mention contraire, et ne peut être reproduit sans autorisation préalable.",
    },
    {
        key: 'mentions_legales_s5',
        title: '5. Responsabilité',
        text: "L'ISSTM s'efforce d'assurer l'exactitude des informations diffusées sur ce site, mais ne saurait être tenu responsable des erreurs, omissions ou de l'indisponibilité temporaire du service.",
    },
];

export default function MentionsLegales() {
    const { content } = usePage().props;

    return (
        <LegalPage
            title="Mentions légales"
            subtitle="Informations légales relatives à l'éditeur et à l'hébergement de ce site."
            sections={sections.map((section) => ({
                title: section.title,
                text: (
                    <EditableText as="span" contentKey={`${section.key}_texte`}>
                        {content[`${section.key}_texte`] ?? section.text}
                    </EditableText>
                ),
            }))}
        />
    );
}
