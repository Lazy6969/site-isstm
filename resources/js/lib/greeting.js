/**
 * Time-of-day greeting for the community feed header — swaps "Fil
 * communautaire" for a personal "Bonjour/Bonne après-midi/Bonsoir {name}".
 */
export function greetingPeriod(hour = new Date().getHours()) {
    if (hour >= 5 && hour < 12) return 'matin';
    if (hour >= 12 && hour < 18) return 'apresmidi';

    return 'soir';
}
