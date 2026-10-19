<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\SiteContent;
use App\Support\Search\TokenSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * "Assistant ISSTM" — a dependency-free FAQ chatbot (no paid AI key), ported
 * from the ai_help.php assistant on github.com/Lazy6969/ISSTM: it matches the
 * visitor's question against a set of intents covering every public section
 * of the site (inscription, filières, campus, bibliothèque, associations...)
 * and an expanded FAQ, via TokenSearch::overlapScore() — a common-words
 * overlap score tolerant to accents/case and small typos (short Levenshtein
 * distance) shared with the site's own search bar (SearchController), so
 * both read a question the same way.
 *
 * The inscription and contact intents pull their facts live from Setting /
 * SiteContent (the same source the admin's quick-edit and maintenance
 * screens write to) instead of a hardcoded snapshot, so the assistant never
 * drifts from what the site itself currently says.
 */
class AssistantController extends Controller
{
    /**
     * @var array<int, array{question: string, reponse: string, lien?: string, lien_label?: string}>
     */
    private const FAQ = [
        [
            'question' => "Comment faire ma préinscription à l'ISSTM ?",
            'reponse' => 'Remplissez le formulaire de préinscription en ligne avec vos informations et vos documents (photo, CIN, diplôme, relevé de notes).',
            'lien' => 'aide.inscription',
            'lien_label' => 'assistant.lien_tutoriel',
        ],
        [
            'question' => 'Quels documents dois-je fournir pour ma préinscription ?',
            'reponse' => "Une photo d'identité, votre CIN recto et verso, votre diplôme ou attestation du baccalauréat, et votre relevé de notes du bac.",
            'lien' => 'preinscription.create',
            'lien_label' => 'assistant.lien_inscription',
        ],
        [
            'question' => 'Quelles sont les mentions (départements) de l\'ISSTM ?',
            'reponse' => "L'ISSTM est organisé en 3 mentions : Sciences et Techniques Industrielles (STI), Sciences et Techniques du Génie Civil (STGC), et Sciences Techniques Numériques et Physiques Appliquées (STNPA).",
            'lien' => 'historique',
            'lien_label' => 'assistant.lien_historique',
        ],
        [
            'question' => 'Quelles filières sont proposées en Licence Professionnelle ?',
            'reponse' => "9 filières en 3 ans : Génie Informatique, Génie Électronique Informatique, Génie Biomédical, Génie Industriel, Génie Électrique, Froid et Énergie, Génie Civil, Génie Hydraulique et Génie de l'Architecture.",
            'lien' => 'formations',
            'lien_label' => 'assistant.lien_formations',
        ],
        [
            'question' => 'Quelles filières sont proposées en Master ?',
            'reponse' => 'Master en 2 ans : Génie Logiciel, Électronique Informatique Industrielle, Télécommunications et Réseaux, Génie Biomédical, Génie Industriel, Ingénierie des Systèmes Électriques Automatisés, Thermique-Énergétique, Bâtiments, Aménagement et Travaux Publics, et Hydraulique et Ouvrages.',
            'lien' => 'formations',
            'lien_label' => 'assistant.lien_formations',
        ],
        [
            'question' => 'Quel bac faut-il pour intégrer la Licence à l\'ISSTM ?',
            'reponse' => 'Un Bac série C, D, S, A2, L, Technique Industrielle, Électrotechnique ou Génie Civil ; la filière Génie Biomédical se fait en L2 après une PACES.',
            'lien' => 'formations',
            'lien_label' => 'assistant.lien_formations',
        ],
        [
            'question' => "Quels sont les frais d'inscription ?",
            'reponse' => 'Les frais varient selon la filière et le statut (national ou étranger). Le détail complet est disponible sur la page Inscription.',
            'lien' => 'inscription',
            'lien_label' => 'assistant.lien_frais',
        ],
        [
            'question' => "Comment payer les frais d'inscription ?",
            'reponse' => "Par virement sur le compte bancaire de l'ISSTM (00650 05004012981-07) ; le détail complet est disponible sur la page Inscription.",
            'lien' => 'inscription',
            'lien_label' => 'assistant.lien_frais',
        ],
        [
            'question' => "Quelles sont les étapes pour s'inscrire à l'ISSTM ?",
            'reponse' => '4 étapes : préinscription (dossier envoyé ou déposé à la Scolarité Centrale), fiche du candidat en ligne, inscription et validation après acceptation, puis activation du compte par e-mail.',
            'lien' => 'aide.inscription',
            'lien_label' => 'assistant.lien_tutoriel',
        ],
        [
            'question' => 'Comment suivre mon dossier de préinscription ?',
            'reponse' => 'Avec le numéro de dossier reçu par e-mail à la soumission, consultable sans connexion sur la page de suivi de dossier.',
            'lien' => 'dossier.suivi',
            'lien_label' => 'assistant.lien_suivi',
        ],
        [
            'question' => 'Comment faire une demande de bourse ?',
            'reponse' => "L'ISSTM vous oriente vers les plateformes officielles de bourse d'État et de gestion du portefeuille Trésor Public.",
            'lien' => 'bourse',
            'lien_label' => 'assistant.lien_bourse',
        ],
        [
            'question' => 'Je suis un ancien étudiant, comment réactiver mon compte ?',
            'reponse' => "Indiquez l'adresse e-mail et le mot de passe de votre ancien compte sur la page de réactivation ; votre demande sera transmise à la scolarité.",
            'lien' => 'reactivation.create',
            'lien_label' => 'assistant.lien_reactivation',
        ],
        [
            'question' => 'Je suis déjà étudiant, comment me réinscrire ou redoubler ?',
            'reponse' => "Depuis votre espace étudiant connecté, soumettez en ligne votre dossier de réinscription ou de redoublement pour l'année suivante.",
            'lien' => 'inscription-dossier.create',
            'lien_label' => 'assistant.lien_reinscription',
        ],
        [
            'question' => "J'ai oublié mon mot de passe, que faire ?",
            'reponse' => 'Cliquez sur « Mot de passe oublié » sur la page de connexion pour recevoir un lien de réinitialisation par e-mail.',
            'lien' => 'password.request',
            'lien_label' => 'assistant.lien_mot_de_passe',
        ],
        [
            'question' => "Comment contacter la scolarité ou l'administration ?",
            'reponse' => 'Retrouvez nos coordonnées (e-mail, téléphone, adresse) sur la page Contact, ou en bas de chaque page du site.',
            'lien' => 'contact',
            'lien_label' => 'assistant.lien_contact',
        ],
        [
            'question' => "Combien d'étudiants et d'enseignants compte l'ISSTM ?",
            'reponse' => 'Environ 2500 étudiants et 73 enseignants, permanents et vacataires, répartis dans 18 filières.',
        ],
        [
            'question' => "Qu'est-ce qu'un bloc régional à l'ISSTM ?",
            'reponse' => 'Chaque région de Madagascar dispose de son propre bloc étudiant (MAFAMI, SEMAVI, SET, SENUM...), avec ses traditions, ses activités et sa spécialité régionale.',
            'lien' => 'campus.index',
            'lien_label' => 'assistant.lien_campus',
        ],
        [
            'question' => "Qu'est-ce que l'A.E.I, l'association des étudiants ?",
            'reponse' => "L'Association des Étudiants de l'ISSTM (A.E.I) réunit tous les étudiants de l'institut, avec un bureau exécutif élu (Président, Vice-Président, Secrétaire général, Trésorier, Commissaires aux comptes).",
            'lien' => 'associations',
            'lien_label' => 'assistant.lien_associations',
        ],
        [
            'question' => "Qu'est-ce que la bibliothèque numérique de l'ISSTM ?",
            'reponse' => "Ouverte en partenariat avec le Peace Corps Madagascar et inaugurée le 10 avril 2024, elle donne accès aux canevas de mémoire, aux mémoires des anciens étudiants et dispose d'une salle informatique dédiée.",
            'lien' => 'bibliotheque',
            'lien_label' => 'assistant.lien_bibliotheque',
        ],
        [
            'question' => "Où trouver l'organigramme ou la grille de cursus ?",
            'reponse' => 'En PDF, Word ou image sur la page Documents (certains fichiers sont réservés aux comptes étudiants actifs).',
            'lien' => 'documents.index',
            'lien_label' => 'assistant.lien_documents',
        ],
    ];

    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $question = trim($validated['message'] ?? '');

        if ($question === '') {
            return response()->json([
                'reply' => __('assistant.message_vide'),
                'link' => null,
                'link_label' => null,
            ]);
        }

        $questionWords = TokenSearch::fuzzyWords($question);

        $bestScore = 0;
        $bestReply = null;
        $bestLink = null;
        $bestLinkLabel = null;

        foreach ($this->intents() as $intent) {
            $score = TokenSearch::overlapScore($questionWords, $intent['mots']);
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestReply = $intent['reponse'];
                $bestLink = $intent['lien'];
                $bestLinkLabel = $intent['lien_label'];
            }
        }

        foreach (self::FAQ as $faq) {
            $score = TokenSearch::overlapScore($questionWords, TokenSearch::fuzzyWords($faq['question']));
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestReply = $faq['reponse'];
                $bestLink = isset($faq['lien']) ? route($faq['lien']) : null;
                $bestLinkLabel = isset($faq['lien_label']) ? __($faq['lien_label']) : null;
            }
        }

        if ($bestScore >= 2 && $bestReply) {
            return response()->json([
                'reply' => $bestReply,
                'link' => $bestLink,
                'link_label' => $bestLinkLabel,
            ]);
        }

        return response()->json([
            'reply' => __('assistant.reponse_inconnue'),
            'link' => route('recherche', ['q' => $question]),
            'link_label' => __('assistant.lien_recherche'),
        ]);
    }

    /**
     * @return array<string, array{mots: array<int, string>, reponse: string, lien: ?string, lien_label: ?string}>
     */
    private function intents(): array
    {
        return [
            'inscription' => [
                'mots' => ['inscription', 'inscrire', 'admission', 'candidature', 'immatriculation', 'preinscription'],
                'reponse' => $this->inscriptionReply(),
                'lien' => route('preinscription.create'),
                'lien_label' => __('assistant.lien_inscription'),
            ],
            'formations' => [
                'mots' => ['formation', 'formations', 'licence', 'master', 'lmd', 'bac', 'diplome'],
                'reponse' => __('assistant.reponse_formations'),
                'lien' => route('formations'),
                'lien_label' => __('assistant.lien_formations'),
            ],
            'filiere' => [
                'mots' => ['filiere', 'filieres', 'specialite', 'mention', 'departement'],
                'reponse' => __('assistant.reponse_filiere'),
                'lien' => route('filieres.index'),
                'lien_label' => __('assistant.lien_filieres'),
            ],
            'bourse' => [
                'mots' => ['bourse', 'financement', 'aide', 'financiere', 'subvention'],
                'reponse' => __('assistant.reponse_bourse'),
                'lien' => route('bourse'),
                'lien_label' => __('assistant.lien_bourse'),
            ],
            'contact' => [
                'mots' => ['contact', 'telephone', 'email', 'mail', 'joindre', 'adresse'],
                'reponse' => $this->contactReply(),
                'lien' => route('contact'),
                'lien_label' => __('assistant.lien_contact'),
            ],
            'horaire' => [
                'mots' => ['horaire', 'heure', 'ouverture', 'ferme', 'ouvert'],
                'reponse' => __('assistant.reponse_horaire'),
                'lien' => null,
                'lien_label' => null,
            ],
            'galerie' => [
                'mots' => ['galerie', 'photo', 'photos', 'image', 'video', 'album'],
                'reponse' => __('assistant.reponse_galerie'),
                'lien' => route('galerie.index'),
                'lien_label' => __('assistant.lien_galerie'),
            ],
            'actualite' => [
                'mots' => ['actualite', 'actualites', 'news', 'nouvelle', 'presse'],
                'reponse' => __('assistant.reponse_actualite'),
                'lien' => route('actualites.index'),
                'lien_label' => __('assistant.lien_actualites'),
            ],
            'evenements' => [
                'mots' => ['evenement', 'evenements', 'calendrier', 'agenda'],
                'reponse' => __('assistant.reponse_evenements'),
                'lien' => route('evenements.index'),
                'lien_label' => __('assistant.lien_evenements'),
            ],
            'historique' => [
                'mots' => ['histoire', 'historique', 'creation', 'fondation', 'origine'],
                'reponse' => __('assistant.reponse_historique'),
                'lien' => route('historique'),
                'lien_label' => __('assistant.lien_historique'),
            ],
            'directeur' => [
                'mots' => ['directeur', 'direction', 'discours'],
                'reponse' => __('assistant.reponse_directeur'),
                'lien' => route('directeur'),
                'lien_label' => __('assistant.lien_directeur'),
            ],
            'enseignants' => [
                'mots' => ['enseignant', 'enseignants', 'professeur', 'professeurs'],
                'reponse' => __('assistant.reponse_enseignants'),
                'lien' => route('enseignants.index'),
                'lien_label' => __('assistant.lien_enseignants'),
            ],
            'vie_etudiante' => [
                'mots' => ['etudiante', 'campus', 'bloc', 'blocs', 'regional', 'activites'],
                'reponse' => __('assistant.reponse_vie_etudiante'),
                'lien' => route('vie-etudiante'),
                'lien_label' => __('assistant.lien_vie_etudiante'),
            ],
            'associations' => [
                'mots' => ['association', 'associations', 'aei', 'bureau'],
                'reponse' => __('assistant.reponse_associations'),
                'lien' => route('associations'),
                'lien_label' => __('assistant.lien_associations'),
            ],
            'bibliotheque' => [
                'mots' => ['bibliotheque', 'memoire', 'memoires', 'canevas'],
                'reponse' => __('assistant.reponse_bibliotheque'),
                'lien' => route('bibliotheque'),
                'lien_label' => __('assistant.lien_bibliotheque'),
            ],
            'documents' => [
                'mots' => ['document', 'documents', 'telecharger', 'organigramme', 'cursus'],
                'reponse' => __('assistant.reponse_documents'),
                'lien' => route('documents.index'),
                'lien_label' => __('assistant.lien_documents'),
            ],
            'ancien_etudiant' => [
                'mots' => ['ancien', 'reactiver', 'reactivation', 'desactive'],
                'reponse' => __('assistant.reponse_ancien_etudiant'),
                'lien' => route('reactivation.create'),
                'lien_label' => __('assistant.lien_reactivation'),
            ],
            'suivi_dossier' => [
                'mots' => ['suivi', 'numero', 'dossier', 'statut'],
                'reponse' => __('assistant.reponse_suivi'),
                'lien' => route('dossier.suivi'),
                'lien_label' => __('assistant.lien_suivi'),
            ],
            'reinscription' => [
                'mots' => ['reinscription', 'redoublement', 'redoubler', 'renouveler'],
                'reponse' => __('assistant.reponse_reinscription'),
                'lien' => route('inscription-dossier.create'),
                'lien_label' => __('assistant.lien_reinscription'),
            ],
            'mot_de_passe' => [
                'mots' => ['mot', 'passe', 'oublie', 'reinitialiser'],
                'reponse' => __('assistant.reponse_mot_de_passe'),
                'lien' => route('password.request'),
                'lien_label' => __('assistant.lien_mot_de_passe'),
            ],
            'confidentialite' => [
                'mots' => ['confidentialite', 'donnees', 'personnelles', 'cookies', 'rgpd'],
                'reponse' => __('assistant.reponse_confidentialite'),
                'lien' => route('confidentialite'),
                'lien_label' => __('assistant.lien_confidentialite'),
            ],
            'salutation' => [
                'mots' => ['bonjour', 'salut', 'coucou', 'bonsoir', 'hello'],
                'reponse' => __('assistant.reponse_salutation'),
                'lien' => null,
                'lien_label' => null,
            ],
            'remerciement' => [
                'mots' => ['merci', 'remerciements'],
                'reponse' => __('assistant.reponse_remerciement'),
                'lien' => null,
                'lien_label' => null,
            ],
        ];
    }

    /**
     * Mentions whether admissions are currently open and, if so, the real
     * deadline — both read live from the same Setting/SiteContent keys the
     * admin's maintenance screen and the /rejoindre page use, instead of a
     * date baked into this controller that would silently go stale.
     */
    private function inscriptionReply(): string
    {
        $closed = Setting::get('inscriptions.closed', 'false') === 'true'
            || Setting::get('admissions.open', 'true') === 'false';

        if ($closed) {
            return Setting::get('inscriptions.closed_message') ?: __('assistant.reponse_inscription_fermee');
        }

        $deadline = SiteContent::where('content_key', 'inscription_date_limite')->value('content_value_fr');

        if ($deadline) {
            return __('assistant.reponse_inscription_ouverte', [
                'date' => Carbon::parse($deadline)->locale('fr')->isoFormat('D MMMM YYYY'),
            ]);
        }

        return __('assistant.reponse_inscription');
    }

    /**
     * Current e-mail/phone/address straight from SiteContent — the same
     * values shown on the Contact page and editable there via quick-edit.
     */
    private function contactReply(): string
    {
        $values = SiteContent::whereIn('content_key', ['contact_email', 'contact_telephone', 'contact_adresse'])
            ->get()
            ->keyBy('content_key')
            ->map(fn (SiteContent $item) => $item->localizedValue());

        if ($values->isEmpty()) {
            return __('assistant.reponse_contact');
        }

        return __('assistant.reponse_contact_dynamique', [
            'email' => $values->get('contact_email', ''),
            'telephone' => $values->get('contact_telephone', ''),
            'adresse' => $values->get('contact_adresse', ''),
        ]);
    }
}
