# current-form

Put a form made in **Current** on an Astro site.

```astro
---
import CurrentForm from 'current-form/CurrentForm.astro';
---
<CurrentForm key="hig_enquiry_AbCd12" />
```

The key is on the form's page in Current.

## Install

```bash
npm i github:edwardpgray/current-form#v1.0.0
```

## How it works

- **The form is fetched when the site is built.** The component asks Current for the form's live HTML and puts it on the page as it is. Current makes the HTML; the site never changes it.
- **A change in Current needs a rebuild to show.** If the practice's Netlify build hook is set in Current (Connections → Netlify), Current starts the rebuild itself whenever a form goes live with a new version.
- **If Current can't be reached, the build fails.** The deploy stops with a clear message and the live site keeps its last good version. The same happens for a wrong key, or for anything that isn't this form's HTML.
- **Enquiries go to Current.** The form posts to `forms.surfpacific.com`, so the site's origin must be on the form's allowed list in Current.

## Styling

`current-form.css` gives a plain layout: fields full width, two-column rows that stack on phones, and a hidden spam trap. Set these on the site to match its look:

| Variable | Default |
|---|---|
| `--cf-gap` | `1rem` |
| `--cf-font` | `inherit` |
| `--cf-text` | `inherit` |
| `--cf-muted` | faded `currentColor` |
| `--cf-border` | faded `currentColor` |
| `--cf-field-bg` | `transparent` |
| `--cf-radius` | `6px` |
| `--cf-accent` | `currentColor` |
| `--cf-button-bg` | `var(--cf-accent)` |
| `--cf-button-text` | `#fff` |

```css
.current-form { --cf-accent: #0f6b70; --cf-radius: 4px; }
```

Or turn it off and style everything yourself:

```astro
<CurrentForm key="…" unstyled />
```

### Class names

| Class | What |
|---|---|
| `.cf-form` | the `<form>` |
| `.cf-row` | two fields side by side |
| `.cf-field`, `.cf-field--<type>` | one question |
| `.cf-label`, `.cf-req` | its label and required mark |
| `.cf-choices`, `.cf-choice` | radio buttons and tick boxes |
| `.cf-consent` | the marketing box |
| `.cf-hp` | the spam trap — keep it hidden |
| `.cf-submit` | the button |

## Props

| Prop | |
|---|---|
| `key` | the form's key (required; `formKey` also works) |
| `class` | extra classes on the wrapper |
| `unstyled` | leave out the default layout |
| `base` | Current's address — only for testing |

## Test

```bash
npm test
```
