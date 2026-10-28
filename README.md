# FoodLens

**Point. Scan. Cook.**

FoodLens turns a photo of your fridge into recipes you can make tonight. Snap your fridge, freezer or pantry, and the app recognizes the food, keeps your kitchen inventory up to date, and serves a swipeable feed of recipes built around what you already have. Then it walks you through cooking, step by step.

**Live demo:** [tinyfr0gs-organization-foodlens.expo.app](https://tinyfr0gs-organization-foodlens.expo.app) (opens in your phone's browser, nothing to install)

---

## Why FoodLens

Most people don't lack food. They lack a quick way to turn what's already there into a meal. In our survey, 54.6% of respondents took more than five minutes just to decide what to eat, and wasted food costs the average Canadian household about $1,300 a year.

FoodLens flips the usual approach: **instead of starting from a recipe, it starts from what you already have.**

## How it works

1. **Point.** Take a photo of your fridge, freezer or pantry.
2. **Scan.** FoodLens recognizes the food and adds it to your inventory, sorted by where it's stored.
3. **Cook.** Swipe through recipes you can make tonight, then follow one step by step.

Our benchmark: **under 5 minutes** from opening the fridge to knowing what you're cooking. Otherwise, we haven't done our job.

## Features

### Scan your kitchen
- The camera is the big button in the middle of the tab bar, right under your thumb.
- Take a photo with the camera or pick one from your gallery.
- Recognized food goes straight into your inventory, organized by location.
- When the AI isn't sure about an item, it flags it as **Needs review** instead of guessing for you.
- Your scan history keeps every photo, grouped by location, with how many items were identified and how many still need a check.

### Inventory
- Everything in your kitchen in one alphabetical list, with quantities and where each item lives.
- Search, plus an A–Z index you can slide your finger along to jump through the list.
- Totals at a glance: items, total units, and what's running low.
- **Always on hand:** staples like salt, oil, butter and flour are never counted as missing. Switch off the ones you sometimes run out of, and recipes take it into account.

### Tonight: gold, silver, bronze
- The first thing you see is the dinner that best fits what you have: a full-screen **gold** pick, revealed after a short "looking in your fridge" moment.
- One swipe down shows the **silver** and **bronze** picks together; keep scrolling for the full TikTok-style feed.
- Picks are main dishes, ranked by what you already have: one-hour weeknight recipes first, then the fewest missing ingredients, then the family's tastes.
- Every feed card shows the cooking time and color-coded ingredients:
  - 🟩 **Green:** you have it
  - 🟥 **Red:** you don't
- A badge tells you at a glance whether the recipe is realistic tonight, and a leaf marks vegan dishes.

### Your dinner plan
- Two questions: *which evenings do you want to cook?* and *what time do you want your suggestion: 4:30, 5 or 6 pm?*
- FoodLens then states the plan in one sentence you confirm yourself: « Le mardi et le jeudi à 17 h, FoodLens me propose un souper avec ce que j'ai. »
- On a planned evening, the gold pick reminds you of it.

### Recipe page
- Servings are set for you on main dishes: 2 for a student or couple, 4 for a family (one per person beyond that), and you can always adjust.
- See how many ingredients you have on hand (e.g. *4 of 8*), with a check next to each one you've got.
- Make **your version**: swap or remove ingredients and keep your notes.
- Save the recipes you love to your favorites.
- Tap **Start cooking** when you're ready.

### Guided cooking
- One step per screen, with a progress bar along the top and a big **Next step** button under your thumb.
- **The color tells you what the step asks:** blue while something boils, warm while it bakes or fries, slate while you wait, with a label repeating it.
- **Automatic timers:** FoodLens reads the cooking time in each step and sets the timer for you. "Bake for 15 to 20 minutes" becomes a 20:00 timer. Tap to start.
- **Check off ingredients as you go:** ingredients mentioned in a step appear in bold, and a tap crosses them off.

### Your kitchen
Set your cooking level and the appliances you own, so suggestions match what you can actually make.

### Chatbot
- Ask for recipes that fit your constraints, like a diet or an allergy.
- Send it a photo and it identifies the food.

## Designed from UX research

The interface follows a set of research-backed rules:

| Rule | Why |
|---|---|
| Few options per screen, one main action | Decision time grows with the number of choices (Hick-Hyman), most of all for tired people at 5 pm |
| Main actions under the thumb, big and close | About half of people hold their phone with one hand (Hoober); big, close targets are faster (Fitts) |
| Sober palette, color only for information | Dishes stay the most colorful thing on screen; color means *have / missing* or *what this step asks* |
| Possessive wording: « ton frigo », « tes recettes », « ta version » | We value what we own more (endowment effect), which is the anti-waste lever |
| One consistent, minimal style | Clear, familiar interfaces feel more pleasant and credible (Reber et al.; Zajonc) |
| A first recipe on the very first screen, never a form | First impressions form in 50 ms (Lindgaard) and the first session is the real trial |
| One main recipe, two alternatives, then the feed | Choice overload hits tired people with no clear preference (Iyengar & Lepper; Scheibehenne) |
| The reveal is a moment | Anticipation of a reward drives dopamine (Schultz et al.); the peak is what we remember (Kahneman) |
| A dinner plan in one sentence | Implementation intentions help people reach their goals (Gollwitzer & Sheeran, d = 0.65) |
| Servings set by profile | Most people keep the default (Johnson & Goldstein) |

## What makes it different

| What people do today | The catch |
|---|---|
| Search Google | Takes longer |
| Scroll TikTok | Takes longer |
| Delivery & meal kits | Requires new habits |
| Fridge photo + a general AI | Forgets your tastes, allergies and diet every time |
| **FoodLens** | **Under 5 minutes, without changing how you shop** |

- **It starts from your kitchen,** not from a recipe or a shopping list.
- **It remembers you.** Your tastes, allergies, diet and kitchen setup carry over, so you never have to re-explain them.
- **AI where it genuinely helps, never blindly trusted.** Uncertain detections are flagged, not guessed.

## Who it's for

Shaped by 12 interviews and a survey, FoodLens is built first for:

- **Students:** the fastest to adopt. They already find recipes on TikTok, and snapping the fridge feels natural.
- **Families:** where the hardest part is choosing something everyone will eat.
- **People living alone and new cooks:** they need recipes that fit their diet, allergies and skill level, without endless scrolling.

## Tech stack

- [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/), in TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) for tab and stack navigation
- AsyncStorage for data saved on the device
- AI image recognition for scanning and the chatbot
- Runs on iOS, Android and the web; the live demo is hosted with EAS Hosting

## Run it locally

You'll need [Node.js](https://nodejs.org/) (LTS). From the project folder:

```bash
npm install
npx expo start
```

Press `w` to open the app in your browser, or scan the QR code in the terminal with the **Expo Go** app on your phone.

### Deploy the web version

```bash
npx expo export --platform web
eas deploy --prod
```

This needs the EAS CLI (`npm install -g eas-cli`) and access to the project's Expo account.
