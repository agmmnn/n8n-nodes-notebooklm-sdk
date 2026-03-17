<img src="nodes/NotebookLm/notebooklm.svg" width="90" height="90">

# n8n-nodes-notebooklm-sdk

An [n8n](https://n8n.io) community node for [Google NotebookLM](https://notebooklm.google.com). Manage notebooks, sources, artifacts, chat, and notes from your n8n workflows.

Built on top of [notebooklm-sdk](https://github.com/agmmnn/notebooklm-sdk).

---

## Installation

In your n8n instance, go to **Settings → Community Nodes → Install** and enter:

```
n8n-nodes-notebooklm-sdk
```

Or install manually:

```bash
npm install n8n-nodes-notebooklm-sdk
```

---

## Authentication

NotebookLM uses Google session cookies — there is no public API key. You need to provide your browser session cookies as a credential.

### Getting your session

1. Run the login helper:
   ```bash
   npx notebooklm-sdk login
   ```
2. A browser window will open. Sign in to your Google account.
3. The session is saved to `~/.notebooklm/session.json`.
4. Copy the entire file contents:
   ```bash
   cat ~/.notebooklm/session.json
   ```

### Adding the credential in n8n

1. Go to **Credentials → New Credential → NotebookLM API**
2. Paste the full `session.json` contents into the **Session JSON** field
3. Save

> Cookies expire periodically. Re-run `npx notebooklm-sdk login` and update the credential when you get authentication errors.

---

## Resources & Operations

### Notebook

| Operation | Description                        |
| --------- | ---------------------------------- |
| List      | List all notebooks in your account |
| Get       | Get a notebook by ID               |
| Create    | Create a new notebook              |
| Delete    | Delete a notebook                  |

### Source

| Operation        | Description                             | Parameters                           |
| ---------------- | --------------------------------------- | ------------------------------------ |
| List             | List all sources in a notebook          | Notebook ID                          |
| Add URL          | Add a web URL as a source               | Notebook ID, URL                     |
| Add Text         | Add plain text as a source              | Notebook ID, Title, Content          |
| Get Fulltext     | Get the full extracted text of a source | Notebook ID, Source ID               |
| Wait Until Ready | Poll until a source finishes processing | Notebook ID, Source ID, Timeout      |
| Delete           | Delete a source                         | Notebook ID, Source ID               |

### Artifact

| Operation             | Description                                        | Parameters                                  |
| --------------------- | -------------------------------------------------- | ------------------------------------------- |
| List                  | List all artifacts                                 | Notebook ID                                 |
| List Audio Overviews  | List audio overview artifacts                      | Notebook ID                                 |
| List Reports          | List report artifacts                              | Notebook ID                                 |
| Create Audio Overview | Generate an audio overview podcast                 | Notebook ID                                 |
| Create Report         | Generate a briefing doc, study guide, or blog post | Notebook ID, Format                         |
| Create Mind Map       | Generate a mind map note                           | Notebook ID                                 |
| Wait Until Ready      | Poll until an artifact finishes generating         | Notebook ID, Artifact ID, Timeout, Interval |
| Download Audio        | Download an audio overview as MP3                  | Notebook ID, Artifact ID                    |
| Download Video        | Download a video artifact as MP4                   | Notebook ID, Artifact ID                    |
| Download Slide Deck   | Download a slide deck as PDF or PPTX               | Notebook ID, Artifact ID, Format            |
| Download Infographic  | Download an infographic as PNG                     | Notebook ID, Artifact ID                    |
| Export Report         | Export a report artifact to Google Docs            | Notebook ID, Artifact ID, Title             |

**Report formats:** `Briefing Doc`, `Study Guide`, `Blog Post`

> Download operations output a **binary item** (field name: `data`). Connect them to nodes like **Write Binary File**, **Send Email**, or **HTTP Request** to use the file.

### Chat

| Operation | Description                                     | Parameters           |
| --------- | ----------------------------------------------- | -------------------- |
| Ask       | Send a question and receive a grounded response | Notebook ID, Message |

### Note

| Operation | Description                       | Parameters           |
| --------- | --------------------------------- | -------------------- |
| List      | List all text notes in a notebook | Notebook ID          |
| Create    | Create a new note                 | Notebook ID, Content |

---

## Example workflows

**Summarize a webpage into a NotebookLM notebook:**

1. **HTTP Request** — fetch a webpage URL
2. **NotebookLM: Source → Add URL** — add the URL to a notebook
3. **NotebookLM: Artifact → Create Report** — generate a briefing doc
4. **NotebookLM: Chat → Ask** — ask a follow-up question grounded in the source

**Generate and download an audio overview:**

1. **NotebookLM: Artifact → Create Audio Overview** — kick off generation (returns `artifactId`)
2. **NotebookLM: Artifact → Wait Until Ready** — poll until status is `completed`
3. **NotebookLM: Artifact → Download Audio** — download the MP3 as binary data
4. **Write Binary File** — save to disk, or pipe to any other binary-capable node

**Create and download an infographic from your latest notebook** ([example JSON](examples/list-create-download-infographic.json)):

1. **NotebookLM: Notebook → List** — list all notebooks (returned in most-recently-accessed order)
2. **Code** — `return [$input.first()]` to pick the latest one
3. **NotebookLM: Artifact → Create Infographic** — kick off generation
4. **NotebookLM: Artifact → Wait Until Ready** — poll every 5 s, up to 300 s
5. **NotebookLM: Artifact → Download Infographic** — download the PNG as binary data

---

## Finding your Notebook ID

The notebook ID is the long alphanumeric string in the NotebookLM URL:

```
https://notebooklm.google.com/notebook/abc123def456...
                                         ^^^^^^^^^^^^^^^^
```

You can also use **Notebook → List** as the first step in a workflow to retrieve notebook IDs dynamically.

---

## Local development

```bash
git clone https://github.com/agmmnn/n8n-nodes-notebooklm
cd n8n-nodes-notebooklm
npm install
npm run build
```

To test in a local n8n instance:

```bash
# In this repo
npm link

# In your n8n directory
npm link n8n-nodes-notebooklm
```

Then restart n8n — the node will appear in the node palette under **NotebookLM**.

---

## License

MIT
