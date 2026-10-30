# The Gospel of Mark

A teacher-first static Sunday school resource with approximately 10,000 words of expanded finished teaching material: **16 lessons, 102 verse-linked teaching insights and applications**, and locally bundled King James Version Scripture. Open `index.html` in a browser to use it immediately. There is no install, build, API key, or server requirement.

## Publish on GitHub Pages

1. Create a GitHub repository, for example `mark-study`.
2. Upload the **contents** of this folder to the repository's root. `index.html` should appear directly in the repository, alongside `styles.css`, `app.js`, `data.js`, `icon.svg`, and `.nojekyll`. Include the documentation too.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**. Select **main** and **/(root)**, then **Save**.
5. Once deployment finishes, use the site link displayed in Pages settings. A project site normally appears at `https://YOUR-USERNAME.github.io/mark-study/`.

All asset paths are relative, so a repository subpath works. If using an existing repository with a `docs` publishing folder, put these files directly inside `docs` and select `/docs` instead.

See [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Publishing settings can also depend on the repository's organization policies.

## Read and explore

- Choose a lesson in the library. Mobile readers open the library using the menu beside the title.
- Search titles, teaching, context, cross-reference names, verse references, and the lesson's Scripture text. Search filters the lesson library; it does not remove text from the currently open lesson. Press `/` to focus search.
- Filter by chapter. Cross-chapter lessons appear under either relevant chapter.
- Hover or keyboard-focus a teaching point to preview its verse highlights. Click it to keep the connection selected; click it again or use **Clear selection** to release it.
- Click a verse to show its related insights and applications. All matching notes are expanded, even if previously collapsed. A verse with no direct note says so. Hovering a verse previews associated notes without changing the selection.
- Switch between insights and applications, collapse individual explanations, or use **Scripture only** for uninterrupted reading.
- Expand **Background & context** and individual cross-references as needed.
- Use A−/A+ for Scripture size and the circle button for light/dark appearance. These two preferences are saved locally if browser storage is available.
- Each lesson has a shareable fragment link, e.g. `index.html#storm`. Browser Back/Forward restores lesson navigation.
- Use **Print lesson** on desktop or the browser's Print command. Printing includes the complete current lesson, all notes, expanded context, and cross-references regardless of filtering or collapsed sections.

No analytics, remote fonts, or network requests are used by the website. Downloaded files work offline. JavaScript is required for the lesson viewer.

## Content and editorial choices

The source is the user's **Book of Mark Series.pdf**, a 69-page Logos export dated October 30, 2026. Completed lesson sections take priority over preliminary notes. Duplicated export blocks are consolidated; personal anecdotes and most research notes are omitted. The original PDF is deliberately not included in the public website package.

The teacher's framing is retained: Jesus is God, the Messiah and Son of God; repentance, salvation by faith rather than human effort, the Gospel, discipleship, and the authority of Jesus remain central. The main teaching outline retains the finished lesson wording, explanations, discussion questions, applications, and conclusions, with export wrapping repaired. Concise verse connections remain below as a separate reference. It is an edited teaching resource rather than a facsimile of the PDF. Verse links are editorial mappings of the teacher's teaching points; an application is distinguished from the Scripture from which it draws a principle. Background claims and cross-references are separate from the primary passage.

`CONTENT.md` inventories every finished lesson and source page range. Pages refer to the PDF's printed page numbers. The storm lesson, placed last in the PDF, is organized in biblical passage order. The Mark 12 camp devotional remains a separate lesson. The Four Parables heading is extended from 4:1–33 to 4:1–34 to include the endpoint used in the source outline. The mission lesson includes 6:30 because the teaching uses the Twelve's return and report.

The overview uses selected Scriptures, including Acts and 2 Timothy, rather than assigning all historical insights to Mark 1:1. The source's reference to Mark leaving at “Acts 13:12” is represented by Acts 13:13, the verse containing that event. The final lesson title for Mark 2:1–12 is expanded from “The Authority of Jesus pt. 2” to the passage heading “The Authority of Jesus to Forgive Sins.” The author overview avoids the conflicting kinship descriptions in the preliminary and finished notes and retains Colossians 4:10 as a cross-reference.

## Editing or adding a lesson

- `index.html`: page structure, library controls, About dialog.
- `styles.css`: typography, colors, responsive layout, print styles.
- `app.js`: library search, navigation, selection, verse linking, theme, printing.
- `data.js`: all lesson content and Scripture text. It assigns a plain object to `window.STUDY` so local-file use works without fetching JSON.

Each lesson has explicit `teachingBlocks` with `type` (`heading`, `paragraph`, `bullet`, `question`, or `application`) and `text`. Subheadings also have `level: 4`; main teaching sections render at level 3. A parallel `manuscript` array provides plain text for search. Each lesson also has `id`, `title`, `passage`, `pages`, `summary`, `context`, `refs`, `scripture`, and `points`. Each point has `kind` (`insight` or `application`), `title`, `text`, and an explicit list of verse keys in `verses`. Verse keys use names such as `Mark 4:39`. Keep IDs stable so shared links continue to work. Add every referenced verse's exact KJV text to `STUDY.verses`; every point's verse keys must also appear in that lesson's `scripture` array. Cross-references support a single chapter and optional verse range, e.g. `Psalm 107:23-30`.

Lesson numbering and totals update automatically. Add chapter-filter options in `index.html` when extending the study into new chapters. Review the related Scripture before adding a teaching connection; do not infer new theology from the existing data.

## Scripture attribution

KJV text is bundled from [thiagobodruk/bible, `json/en_kjv.json`](https://github.com/thiagobodruk/bible/blob/master/json/en_kjv.json), retrieved October 30, 2026. Dataset brace-delimited explanatory notes are removed; the verse wording remains. The website contains only the verses used in this study and its cross-references, not the entire Bible. See `THIRD_PARTY_NOTICES.md` for attribution. The teaching material remains the property of its original author; no license for that teaching is implied.

## Verification

Checked in Chrome across all lessons at 320, 390, 768, and 1280 px widths, with additional 1440 px desktop review. All 16 lessons render without JavaScript errors; all 102 teaching points link to existing, displayed Scripture. Checks cover both directions of verse selection, chapter filtering, search, mobile menu navigation, theme, and horizontal overflow. Also reviewed light, dark, and mobile screenshots, checked collapse/reveal behavior, and verified that print styles include all filtered and collapsed notes. The site opens directly from the filesystem, demonstrating that there are no runtime network dependencies.

## Teacher edition layout

Expanded teaching notes are the primary column and the first content on mobile. Scripture is a narrower, independently scrollable reference column on larger screens. Section links jump to teaching notes, verse connections, or Scripture. Search includes the expanded teaching material. All 16 lessons have expanded outlines drawn from their completed sections.

## Editorial review

All 16 expanded lessons have received a complete editorial read-through. PDF sentence fragments were rejoined, wording and grammar were cleaned up, and section headings were explicitly assigned rather than inferred from sentence length. Supporting points use semantic bullet lists; teaching sections, background subheadings, discussion prompts, and applications have separate typography. Known reference errors and the overview’s incorrect kinship wording were corrected. Camp-specific time references in the Mark 12 application were adapted for classroom use. The KJV verse text is unchanged.

## Visual editing

Open `admin/index.html` for the visual editor. It supports editing every existing lesson, structured formatting, preview, draft backups, and exporting an updated `data.js` for manual upload. For password-protected online publishing directly to `celjericho-cloud/SS`, deploy the included backend using **[EDITOR-SETUP.md](EDITOR-SETUP.md)**. The backend has not yet been deployed and needs your Cloudflare account and private GitHub token; GitHub Pages alone cannot run it.
