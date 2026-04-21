# DinoFocus — Design Spec
**Date:** 2026-04-21  
**Platform:** Mobile iOS + Android (React Native + Expo)  
**Audience:** Enfants 6–12 ans avec TDAH, usage à la maison  

---

## Vue d'ensemble

DinoFocus est une application mobile gamifiée pour enfants TDAH. L'enfant adopte un dinosaure compagnon qu'il élève en complétant des missions quotidiennes (réelles + in-game) et des mini-jeux. Le système de progression par XP, la collection Dino-Dex, et les mécaniques anti-hyperfocus sont conçus spécifiquement pour les cerveaux TDAH.

---

## Structure — 4 écrans (navigation par onglets)

### 1. Accueil
- Affiche le dino compagnon actif avec ses états (heureux, fatigué, triste)
- Barre XP animée + niveau actuel
- Aperçu de la mission en cours (carte cliquable)
- Accès mode parent : 5 taps sur le logo → saisie PIN

### 2. Mission
- **Une seule mission affichée à la fois** — jamais de liste
- Grande carte visuelle avec icône, titre, description courte
- Progression dans la journée : "2/5 missions complétées" (discret, en bas)
- Bouton "Mission terminée !" → animation de célébration → affiche la suivante
- Types de missions :
  - **Réelles** (traduites en langage dino) : "Nourris ton dino" = se brosser les dents, "Prépare le repaire" = ranger sa chambre
  - **In-game** : "Entraîne Rex 3 fois", "Gagne 1 partie de mémoire"

### 3. Mini-Jeux
- 3 jeux accessibles depuis des cartes visuelles
- **Mémoire Dino** : retrouver des paires de dinos (concentration)
- **Chasse aux Œufs** : taper sur les œufs qui apparaissent (réflexes)
- **Puzzle Fossile** : assembler un squelette de dino (logique)
- Chaque partie dure 2–5 minutes max
- Récompense : XP + animation du dino à la fin
- Timer de session global : après 10 min, le dino "se repose" (écran de pause douce)

### 4. Dino-Dex
- Grille de tous les dinos (20+ espèces)
- Dinos non débloqués : silhouette mystère
- Rarités : Commun (gris), Rare (bleu), Légendaire (or)
- Fiche de chaque dino débloqué : nom, anecdote amusante, date d'obtention
- Badges de progression (1ère mission, 7 jours de suite, etc.)

---

## Mécaniques clés TDAH

### Dino compagnon vivant
- États émotionnels basés sur l'activité : heureux (mission complétée), énergique (mini-jeu gagné), triste (absent 24h+)
- Micro-animations sur chaque interaction (tap, swipe, validation)
- Notification push après 24h sans ouverture : "Rex est triste sans toi… 🦖"

### Micro-récompenses instantanées
- Chaque tap déclenche : vibration (Expo Haptics) + son court (Expo AV)
- Mission complétée : confettis + cri du dino + flash XP animé
- Level up : séquence d'animation spéciale + nouveau dino débloqué possible

### Sessions courtes (anti-hyperfocus)
- Timer global de session : 10 minutes de jeu continu
- À 10 min : animation douce "Rex est fatigué, il a besoin de se reposer"
- Cooldown de 2h avant de rejouer (configurable par les parents)
- Les missions restent accessibles même pendant le cooldown

### Mode Parent (PIN caché)
- Accès : 5 taps rapides sur le logo de l'écran Accueil
- Saisie d'un PIN à 4 chiffres (configuré au premier lancement)
- Fonctionnalités parent :
  - Voir les statistiques (missions complétées, XP gagné, temps de jeu)
  - Ajouter des missions réelles personnalisées
  - Ajuster la durée de session (5/10/15 min)
  - Activer/désactiver les notifications

---

## Système de progression

| Niveau | XP requis | Récompense |
|--------|-----------|------------|
| 1 → 2  | 100 XP    | Dino commun débloqué |
| 2 → 3  | 200 XP    | Accessoire dino |
| 3 → 4  | 350 XP    | Dino rare débloqué |
| ...    | ...       | ... |

- Missions réelles : 30–50 XP
- Missions in-game : 20–30 XP
- Mini-jeux (victoire) : 25–40 XP selon difficulté

---

## Stack technique

| Outil | Usage |
|-------|-------|
| React Native + Expo | Framework principal |
| Expo Router | Navigation par onglets |
| Reanimated 3 | Animations fluides (dino, XP bar, confettis) |
| AsyncStorage | Persistance locale (progression, dinos, missions) |
| Expo Notifications | Rappels push (dino triste) |
| Expo AV | Sons et effets audio |
| Expo Haptics | Vibrations tactiles |

Pas de backend — tout est stocké localement. Pas de compte utilisateur requis.

---

## Hors scope (v1)

- Multijoueur ou comparaison entre amis
- Synchronisation cloud / sauvegarde en ligne
- Contenu éducatif structuré (leçons, quiz scolaires)
- Personnalisation avancée du dino (couleurs, tenues)
