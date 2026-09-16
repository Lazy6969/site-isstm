import LegalPage from '../Components/Layout/LegalPage';

const sections = [
    {
        title: '1. Données collectées',
        text: "Dans le cadre de l'utilisation de ce site (inscription en ligne, création de compte, formulaire de contact, newsletter), nous pouvons collecter : votre nom, prénom, adresse email, numéro de téléphone, ainsi que les informations que vous saisissez volontairement dans nos formulaires.",
    },
    {
        title: '2. Utilisation des données',
        text: "Ces données sont utilisées exclusivement pour le traitement des inscriptions et candidatures, la gestion de votre compte, la réponse à vos demandes de contact, et l'envoi de la newsletter si vous y êtes abonné(e). Elles ne sont jamais vendues ni cédées à des tiers à des fins commerciales.",
    },
    {
        title: '3. Cookies et session',
        text: "Le site utilise des cookies de session strictement nécessaires à son fonctionnement (maintien de la connexion, préférence de langue, thème visuel, comptage d'une visite par session). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.",
    },
    {
        title: '4. Sécurité et conservation',
        text: "Les mots de passe sont stockés de façon chiffrée et l'accès aux données personnelles est restreint au personnel administratif habilité de l'ISSTM. Les données sont conservées le temps nécessaire à la finalité pour laquelle elles ont été collectées.",
    },
    {
        title: '5. Vos droits',
        text: 'Vous pouvez à tout moment demander l\'accès, la correction ou la suppression de vos données personnelles en nous contactant à isstm.univ.umg@gmail.com.',
    },
];

export default function Confidentialite() {
    const updated = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <LegalPage
            title="Politique de confidentialité"
            subtitle="Comment l'ISSTM Mahajanga collecte, utilise et protège vos données personnelles."
            updated={updated}
            sections={sections}
        />
    );
}
