<?php

namespace App;

/**
 * Individually maskable pieces of the public Contact section (ContactCards.jsx
 * / ContactMaps.jsx, shown both on the homepage and on /contact) — a super
 * admin can hide any of these without deleting its underlying site_contents
 * value. See ContactFieldVisibilityController.
 */
enum ContactField: string
{
    case Email = 'email';
    case Telephone = 'telephone';
    case Facebook = 'facebook';
    case Adresse = 'adresse';
    case CartePrincipale = 'carte_principale';
    case CarteAnnexe = 'carte_annexe';
}
