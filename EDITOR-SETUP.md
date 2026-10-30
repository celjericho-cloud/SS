# Visual editor: start here

The visual editor is ready for **celjericho-cloud/SS**. Its private publishing backend still needs a Cloudflare account and GitHub credentials. Nothing has been deployed or written to the repository by this setup.

## Use it immediately, before setting up a backend

1. Open `admin/index.html` in your browser.
2. Choose any of the 16 lessons.
3. Click directly in the teaching notes to edit. Use the section dropdown for paragraph, heading, subheading, bullet, discussion prompt, or application. Use the arrows to reorder and **+ Below** to insert.
4. Use **Preview** to review the result.
5. Click **Download website update** to get a new `data.js` file.
6. In your GitHub repository, replace the site's existing `data.js` with that downloaded file and commit the change. GitHub Pages will deploy it if Pages is configured on that branch.

**Download draft** saves an editable JSON backup of all lessons. Use **Open draft** to continue later or transfer it to another device. Drafts are also saved in this browser when storage is available. Download a backup before clearing browser data, switching devices, or moving from the local editor to the hosted one.

The local editor contains a snapshot of the lessons included in this package. The hosted editor loads the latest lessons from GitHub after sign-in. It is the GitHub `data.js` file that controls the public site; `admin/sample-data.js` is only the editor's initial preview data.

## Set up private online publishing

This is a one-time setup. Afterward, editing is entirely visual in your browser.

### 1. Create the hosting account

Create an account at [Cloudflare](https://dash.cloudflare.com/sign-up). The editor runs as a small Cloudflare Worker, separate from your public GitHub Pages site. You do not need to move your domain or public site.

### 2. Check the GitHub site files

Open [celjericho-cloud/SS](https://github.com/celjericho-cloud/SS).

- The site should have `data.js`, `index.html`, `app.js`, and `styles.css` together.
- The configuration supplied here assumes the publishing branch is **main** and `data.js` is in the repository root.
- If the site lives in `docs`, change `DATA_PATH` to `docs/data.js` in `editor-backend/wrangler.toml`.
- If your branch is named differently, change `GITHUB_BRANCH` in that same file.
- If you have not uploaded this website yet, follow the main README first. The backend edits an existing lesson file; it does not create or configure a GitHub Pages site.

### 3. Create a narrowly scoped GitHub token

In GitHub, open **Settings → Developer settings → Personal access tokens → Fine-grained tokens** and create a token:

- Resource owner: `celjericho-cloud`.
- Repository access: select only **SS**.
- Repository permission **Contents: Read and write**. Metadata read access is included automatically.
- Choose an expiration date and retain the token securely. Organization policies may require approval.

This token authorizes the backend to update the lesson file. Do not paste it into chat, the browser editor, a source file, or your GitHub repository. Enter it only at the secret prompt in the next step.

If the branch has protection rules that prevent direct commits, publishing will return an error rather than bypass those rules. This implementation saves directly to the configured branch; it does not open pull requests.

### 4. Install the deployment tool and sign in

Install a current Node.js LTS release if Node is not already installed. Open a terminal in the extracted `mark-study/editor-backend` folder. Run:

```sh
npx wrangler login
```

A browser opens to sign in to your Cloudflare account. Review `wrangler.toml`; the owner and repository are already filled in. Wrangler 4.36.0 or later is required for the login rate limiter.

### 5. Enter three private secrets

Run these commands individually. Each prompts for its value without adding it to a source file:

```sh
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```

- `GITHUB_TOKEN`: the fine-grained token you created above.
- `ADMIN_PASSWORD`: a unique, randomly generated password of at least 16 characters. Save it in your password manager; this is the password you will use to sign in to the editor.
- `SESSION_SECRET`: a separate random secret of at least 32 characters. Generate it in a password manager. You will not need to type this when editing.

If prompted to create the `mark-lesson-editor` Worker while adding the first secret, allow it. If your Wrangler version requires a Worker to exist first, run `npx wrangler deploy`, then enter the secrets. The API refuses to sign in or publish until all secrets are configured. No default password is provided.

### 6. Deploy

In the same folder, run:

```sh
npx wrangler deploy
```

The deployment uploads `worker.mjs` and the visual editor in the sibling `admin` folder. It displays an HTTPS address such as `https://mark-lesson-editor.YOUR-ACCOUNT.workers.dev`. Open your actual address and bookmark it.

Select **Sign in to backend**, leave the editor address set to its current address, and enter your **ADMIN_PASSWORD**. The editor reads the current lessons from GitHub. If you brought a downloaded draft, use **Open draft** after signing in, then review it against the current lessons.

### 7. Edit, review, publish

Choose a lesson, make changes, and use **Preview**. Click **Publish changes** and review the confirmation. Publishing saves all current lesson data in a GitHub commit; the public site updates when its Pages deployment completes. The message includes the commit address. Check the repository's Actions / Pages status if the public site has not updated yet.

The backend checks the GitHub file revision before saving. If another editor or a manual commit changed the file, it stops with a conflict message. Download your draft before reloading GitHub, then reconcile the changes rather than overwriting someone else's work.

## What is editable?

- Titles, passage labels, opening summaries, source page labels, and background.
- Every section of the expanded teaching notes, including its visual style and order.
- Concise verse connections: their titles, explanations, type, and linked verses.
- The list of verses displayed in a lesson and its cross-references, using Scripture already bundled in this study.

The editor does not modify the KJV wording, introduce arbitrary Bible text, create new user accounts, or add new lessons. Teaching uses plain text with structured formatting, keeping the public site's typography consistent. It is a single-owner editor with one shared administrator password.

## Protection and maintenance

GitHub credentials stay on the backend. Authentication uses signed, eight-hour, HttpOnly / Secure / SameSite cookies. Writes require the editor's own origin; password attempts are rate-limited through Cloudflare. The API validates lesson structures and verse connections, fixes the plain-text search copy, and checks the GitHub revision before writing. Cloudflare rate limits are approximate and local to each Cloudflare location, rather than a global lockout.

Rotate the GitHub token before it expires. Change `ADMIN_PASSWORD` and `SESSION_SECRET` together to invalidate existing sessions when rotating access. Never commit `.dev.vars` or `.env`; both are excluded by the included ignore file. The supplied repository configuration contains no credentials.

For a deployment or API failure, the editor preserves the draft and displays the error. Download your draft before troubleshooting. A successful GitHub save is distinct from a successful GitHub Pages deployment.

## Verification performed

The visual editor was checked in Chrome with all 16 lessons, text editing, style changes, section insertion and reordering, preview, website-file download, local draft recovery, and mobile layout. Backend tests cover validation, unauthorized access, same-origin enforcement, login rate limiting, session cookies, stale revisions, invalid verse links, Unicode serialization, and the GitHub save response. GitHub requests were mocked: deployment and live credential testing remain to be done in your account.

## References

- [Cloudflare Workers with static assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare assets configuration](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Cloudflare login rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [GitHub repository contents API](https://docs.github.com/en/rest/repos/contents)
