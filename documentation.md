# CargoLoad2 - Projektdokumentation

## Projektübersicht
CargoLoad2 ist eine interaktive Web-Anwendung zur optimalen Platzierung von Rechtecken in einem vordefinierten 2D-Raum (z.B. Ladefläche, Lagerplatz). Die Anwendung nutzt moderne Web-Technologien für eine performante Visualisierung und einen bewährten Pack-Algorithmus.

## Hauptfunktionen
- **Optimale Verteilung**: Automatische Berechnung der effizientesten Anordnung.
- **Echtzeit-Visualisierung**: Hochauflösender Canvas mit Zoom- und Resize-Unterstützung.
- **Bemaßung & Lineale**: Integrierte Koordinatensysteme (cm) für präzise Orientierung.
- **Flexibles Label-System**: Individuelle Bezeichnungen für jedes Rechteck mit automatischer Farbgruppierung.
- **Seitenverhältissperre**: Proportionale Anpassung der Raummaße.
- **Modernes UI**: Premium Glassmorphic Design mit intuitiver Bedienung.

---

## Technischer Algorithmus: MaxRects
Die Anwendung implementiert den **MaxRects-Pack-Algorithmus** mit der **Best-Short-Side-Fit (BSSF)** Heuristik. 

### Funktionsweise:
1. **Sortierung**: Eingaberechtecke werden nach Fläche sortiert (größte zuerst), um Lücken zu minimieren.
2. **Raumverwaltung**: Der verfügbare Raum wird in "maximale freie Rechtecke" unterteilt.
3. **Platzierung**: Jedes neue Rechteck wird in das freie Feld eingefügt, das nach dem Einfügen das kleinste "kurze Seitenteil" übrig lässt.
4. **Split-Logik**: Wenn ein Rechteck platziert wird, werden alle überlappenden freien Rechtecke gesplittet und redundante Flächen entfernt.
5. **Rotation**: Der Algorithmus prüft automatisch, ob eine Rotation um 90° eine bessere Ausnutzung ermöglicht.

---

## Bedienungsanleitung

### 1. Raum festlegen
Geben Sie die **Länge** und **Breite** des Raumes in Zentimetern ein. 
> [!TIP]
> Aktivieren Sie "Aspect Ratio sperren", wenn Sie die Proportionen beim Skalieren beibehalten möchten.

### 2. Rechtecke hinzufügen
- Geben Sie **Länge** und **Breite** des zu ladenden Objekts ein.
- Vergeben Sie optional eine **Bezeichnung** (z.B. "Palette A"). Objekte mit demselben Label erhalten automatisch dieselbe Farbe.
- Wählen Sie die **Anzahl** und klicken Sie auf **Hinzufügen**.

### 3. Verteilung starten
Klicken Sie auf **Optimal verteilen**. Der Algorithmus berechnet die Positionen und zeigt das Ergebnis auf dem Canvas an.
- Die **Verschwendung (%)** sowie die Anzahl der **platzierten Objekte** werden unter dem Canvas angezeigt.

---

## Technische Architektur
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism), JavaScript (ES6+).
- **Grafik**: HTML5 Canvas API mit High-DPI (Retina) Unterstützung.
- **Staging**: Responsive Design, das sich an verschiedene Bildschirmgrößen anpasst, ohne die Datenintegrität zu verlieren.

## Installation & Ausführung
Es ist keine Installation notwendig. Öffnen Sie einfach die [index.html](file:///i:/AntigravitySource/Cargoload2/index.html) in einem modernen Webbrowser (Chrome, Firefox, Edge, Safari).
