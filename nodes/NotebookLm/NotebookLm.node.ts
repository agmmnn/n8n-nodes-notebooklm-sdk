import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	NodeOperationError,
} from "n8n-workflow";

import { NotebookLMClient } from "notebooklm-sdk";

export class NotebookLm implements INodeType {
	description: INodeTypeDescription = {
		displayName: "NotebookLM",
		name: "notebookLm",
		icon: "file:notebooklm.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: "Interact with Google NotebookLM",
		defaults: { name: "NotebookLM" },
		inputs: ["main"],
		outputs: ["main"],
		credentials: [{ name: "notebookLmApi", required: true }],
		properties: [
			// ----------------------------------------------------------------
			// Resource
			// ----------------------------------------------------------------
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				noDataExpression: true,
				options: [
					{ name: "Notebook", value: "notebook" },
					{ name: "Source", value: "source" },
					{ name: "Artifact", value: "artifact" },
					{ name: "Chat", value: "chat" },
					{ name: "Note", value: "note" },
				],
				default: "notebook",
			},

			// ----------------------------------------------------------------
			// NOTEBOOK operations
			// ----------------------------------------------------------------
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				noDataExpression: true,
				displayOptions: { show: { resource: ["notebook"] } },
				options: [
					{
						name: "List",
						value: "list",
						description: "List all notebooks",
						action: "List notebooks",
					},
					{
						name: "Get",
						value: "get",
						description: "Get a notebook by ID",
						action: "Get a notebook",
					},
					{
						name: "Create",
						value: "create",
						description: "Create a new notebook",
						action: "Create a notebook",
					},
					{
						name: "Delete",
						value: "delete",
						description: "Delete a notebook",
						action: "Delete a notebook",
					},
				],
				default: "list",
			},

			// ----------------------------------------------------------------
			// SOURCE operations
			// ----------------------------------------------------------------
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				noDataExpression: true,
				displayOptions: { show: { resource: ["source"] } },
				options: [
					{
						name: "List",
						value: "list",
						description: "List sources in a notebook",
						action: "List sources",
					},
					{
						name: "Add URL",
						value: "addUrl",
						description: "Add a URL as a source",
						action: "Add URL source",
					},
					{
						name: "Add Text",
						value: "addText",
						description: "Add plain text as a source",
						action: "Add text source",
					},
					{
						name: "Get Fulltext",
						value: "getFulltext",
						description: "Get the full text of a source",
						action: "Get source fulltext",
					},
					{
						name: "Wait Until Ready",
						value: "waitUntilReady",
						description: "Poll until a source finishes processing",
						action: "Wait until source is ready",
					},
					{
						name: "Delete",
						value: "delete",
						description: "Delete a source",
						action: "Delete a source",
					},
				],
				default: "list",
			},

			// ----------------------------------------------------------------
			// ARTIFACT operations
			// ----------------------------------------------------------------
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				noDataExpression: true,
				displayOptions: { show: { resource: ["artifact"] } },
				options: [
					{
						name: "List",
						value: "list",
						description: "List all artifacts in a notebook",
						action: "List artifacts",
					},
					{
						name: "List Audio Overviews",
						value: "listAudio",
						description: "List audio overview artifacts",
						action: "List audio overviews",
					},
					{
						name: "List Reports",
						value: "listReports",
						description: "List report artifacts",
						action: "List reports",
					},
					{
						name: "Create Audio Overview",
						value: "createAudio",
						description: "Generate an audio overview podcast",
						action: "Create audio overview",
					},
					{
						name: "Create Report",
						value: "createReport",
						description: "Generate a briefing doc, study guide, or blog post",
						action: "Create report",
					},
					{
						name: "Create Mind Map",
						value: "createMindMap",
						description: "Generate a mind map note",
						action: "Create mind map",
					},
					{
						name: "Create Infographic",
						value: "createInfographic",
						description: "Generate an infographic image",
						action: "Create infographic",
					},
					{
						name: "Create Video",
						value: "createVideo",
						description: "Generate a video artifact",
						action: "Create video",
					},
					{
						name: "Create Quiz",
						value: "createQuiz",
						description: "Generate a quiz",
						action: "Create quiz",
					},
					{
						name: "Create Slide Deck",
						value: "createSlideDeck",
						description: "Generate a slide deck",
						action: "Create slide deck",
					},
					{
						name: "Wait Until Ready",
						value: "waitUntilReady",
						description: "Poll until an artifact finishes generating",
						action: "Wait until artifact is ready",
					},
					{
						name: "Download Audio",
						value: "downloadAudio",
						description: "Download an audio overview as a binary file",
						action: "Download audio",
					},
					{
						name: "Download Video",
						value: "downloadVideo",
						description: "Download a video artifact as a binary file",
						action: "Download video",
					},
					{
						name: "Download Slide Deck",
						value: "downloadSlideDeck",
						description: "Download a slide deck as PDF or PPTX",
						action: "Download slide deck",
					},
					{
						name: "Download Infographic",
						value: "downloadInfographic",
						description: "Download an infographic as a PNG file",
						action: "Download infographic",
					},
					{
						name: "Export Report",
						value: "exportReport",
						description: "Export a report to Google Docs",
						action: "Export report to Google Docs",
					},
				],
				default: "list",
			},

			// ----------------------------------------------------------------
			// CHAT operations
			// ----------------------------------------------------------------
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				noDataExpression: true,
				displayOptions: { show: { resource: ["chat"] } },
				options: [
					{
						name: "Ask",
						value: "ask",
						description: "Ask a question and get a response",
						action: "Ask a question",
					},
				],
				default: "ask",
			},

			// ----------------------------------------------------------------
			// NOTE operations
			// ----------------------------------------------------------------
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				noDataExpression: true,
				displayOptions: { show: { resource: ["note"] } },
				options: [
					{
						name: "List",
						value: "list",
						description: "List all notes in a notebook",
						action: "List notes",
					},
					{
						name: "Create",
						value: "create",
						description: "Create a new note",
						action: "Create a note",
					},
				],
				default: "list",
			},

			// ----------------------------------------------------------------
			// Shared: Notebook ID — for non-notebook resources
			// ----------------------------------------------------------------
			{
				displayName: "Notebook ID",
				name: "notebookId",
				type: "string",
				default: "",
				required: true,
				description: "The ID of the notebook",
				displayOptions: {
					hide: { resource: ["notebook"] },
				},
			},

			// Notebook ID — for notebook:get and notebook:delete
			{
				displayName: "Notebook ID",
				name: "notebookId",
				type: "string",
				default: "",
				required: true,
				description: "The ID of the notebook",
				displayOptions: {
					show: {
						resource: ["notebook"],
						operation: ["get", "delete"],
					},
				},
			},

			// ----------------------------------------------------------------
			// Notebook: create
			// ----------------------------------------------------------------
			{
				displayName: "Title",
				name: "title",
				type: "string",
				default: "",
				required: true,
				description: "The title of the new notebook",
				displayOptions: {
					show: { resource: ["notebook"], operation: ["create"] },
				},
			},

			// ----------------------------------------------------------------
			// Source: addUrl
			// ----------------------------------------------------------------
			{
				displayName: "URL",
				name: "url",
				type: "string",
				default: "",
				required: true,
				description: "The URL to add as a source",
				displayOptions: {
					show: { resource: ["source"], operation: ["addUrl"] },
				},
			},

			// ----------------------------------------------------------------
			// Source: addText
			// ----------------------------------------------------------------
			{
				displayName: "Title",
				name: "title",
				type: "string",
				default: "",
				required: true,
				description: "The title of the text source",
				displayOptions: {
					show: { resource: ["source"], operation: ["addText"] },
				},
			},
			{
				displayName: "Content",
				name: "content",
				type: "string",
				typeOptions: { rows: 5 },
				default: "",
				required: true,
				description: "The plain text content to add as a source",
				displayOptions: {
					show: { resource: ["source"], operation: ["addText"] },
				},
			},

			// ----------------------------------------------------------------
			// Source: delete / getFulltext / waitUntilReady
			// ----------------------------------------------------------------
			{
				displayName: "Source ID",
				name: "sourceId",
				type: "string",
				default: "",
				required: true,
				description: "The ID of the source",
				displayOptions: {
					show: {
						resource: ["source"],
						operation: ["delete", "getFulltext", "waitUntilReady"],
					},
				},
			},

			// ----------------------------------------------------------------
			// Source: waitUntilReady — options
			// ----------------------------------------------------------------
			{
				displayName: "Timeout (Seconds)",
				name: "timeout",
				type: "number",
				default: 60,
				description: "Maximum number of seconds to wait before timing out",
				displayOptions: {
					show: { resource: ["source"], operation: ["waitUntilReady"] },
				},
			},

			// ----------------------------------------------------------------
			// Artifact: Artifact ID — shared across several operations
			// ----------------------------------------------------------------
			{
				displayName: "Artifact ID",
				name: "artifactId",
				type: "string",
				default: "",
				required: true,
				description: "The ID of the artifact",
				displayOptions: {
					show: {
						resource: ["artifact"],
						operation: [
							"waitUntilReady",
							"downloadAudio",
							"downloadVideo",
							"downloadSlideDeck",
							"downloadInfographic",
							"exportReport",
						],
					},
				},
			},

			// ----------------------------------------------------------------
			// Artifact: waitUntilReady — options
			// ----------------------------------------------------------------
			{
				displayName: "Timeout (Seconds)",
				name: "timeout",
				type: "number",
				default: 120,
				description: "Maximum number of seconds to wait before timing out",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["waitUntilReady"] },
				},
			},
			{
				displayName: "Poll Interval (Seconds)",
				name: "pollInterval",
				type: "number",
				default: 3,
				description: "How often to check the artifact status",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["waitUntilReady"] },
				},
			},

			// ----------------------------------------------------------------
			// Artifact: downloadSlideDeck — format
			// ----------------------------------------------------------------
			{
				displayName: "Format",
				name: "slideDeckFormat",
				type: "options",
				options: [
					{ name: "PDF", value: "pdf" },
					{ name: "PPTX", value: "pptx" },
				],
				default: "pdf",
				description: "The file format to download the slide deck as",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["downloadSlideDeck"] },
				},
			},

			// ----------------------------------------------------------------
			// Artifact: createInfographic options
			// ----------------------------------------------------------------
			{
				displayName: "Orientation",
				name: "infographicOrientation",
				type: "options",
				options: [
					{ name: "Portrait", value: 2 },
					{ name: "Landscape", value: 1 },
					{ name: "Square", value: 3 },
				],
				default: 2,
				description: "The orientation of the infographic",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createInfographic"] },
				},
			},
			{
				displayName: "Detail Level",
				name: "infographicDetail",
				type: "options",
				options: [
					{ name: "Standard", value: 2 },
					{ name: "Concise", value: 1 },
					{ name: "Detailed", value: 3 },
				],
				default: 2,
				description: "The level of detail in the infographic",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createInfographic"] },
				},
			},
			{
				displayName: "Style",
				name: "infographicStyle",
				type: "options",
				options: [
					{ name: "Auto Select", value: 1 },
					{ name: "Sketch Note", value: 2 },
					{ name: "Professional", value: 3 },
					{ name: "Bento Grid", value: 4 },
					{ name: "Editorial", value: 5 },
					{ name: "Instructional", value: 6 },
					{ name: "Bricks", value: 7 },
					{ name: "Clay", value: 8 },
					{ name: "Anime", value: 9 },
					{ name: "Kawaii", value: 10 },
					{ name: "Scientific", value: 11 },
				],
				default: 1,
				description: "The visual style of the infographic",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createInfographic"] },
				},
			},
			{
				displayName: "Instructions",
				name: "infographicInstructions",
				type: "string",
				typeOptions: { rows: 3 },
				default: "",
				description: "Optional custom instructions for the infographic",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createInfographic"] },
				},
			},
			{
				displayName: "Language",
				name: "infographicLanguage",
				type: "string",
				default: "en",
				description: "Output language code (e.g. en, ja, fr)",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createInfographic"] },
				},
			},
			{
				displayName: "Source IDs",
				name: "infographicSourceIds",
				type: "string",
				default: "",
				description: "Comma-separated source IDs to use. Leave empty to use all sources in the notebook. Get IDs from Source → List.",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createInfographic"] },
				},
			},

			// ----------------------------------------------------------------
			// Artifact: createAudio options
			// ----------------------------------------------------------------
			{
				displayName: "Format",
				name: "audioFormat",
				type: "options",
				options: [
					{ name: "Deep Dive", value: 1 },
					{ name: "Brief", value: 2 },
					{ name: "Critique", value: 3 },
					{ name: "Debate", value: 4 },
				],
				default: 1,
				description: "The format of the audio overview",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createAudio"] },
				},
			},
			{
				displayName: "Length",
				name: "audioLength",
				type: "options",
				options: [
					{ name: "Default", value: 2 },
					{ name: "Short", value: 1 },
					{ name: "Long", value: 3 },
				],
				default: 2,
				description: "The length of the audio overview",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createAudio"] },
				},
			},
			{
				displayName: "Instructions",
				name: "audioInstructions",
				type: "string",
				typeOptions: { rows: 3 },
				default: "",
				description: "Optional custom instructions for the audio overview",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createAudio"] },
				},
			},
			{
				displayName: "Language",
				name: "audioLanguage",
				type: "string",
				default: "en",
				description: "Output language code (e.g. en, ja, fr)",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createAudio"] },
				},
			},
			{
				displayName: "Source IDs",
				name: "audioSourceIds",
				type: "string",
				default: "",
				description: "Comma-separated source IDs to use. Leave empty to use all sources in the notebook.",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createAudio"] },
				},
			},

			// ----------------------------------------------------------------
			// Artifact: createVideo options
			// ----------------------------------------------------------------
			{
				displayName: "Format",
				name: "videoFormat",
				type: "options",
				options: [
					{ name: "Explainer", value: 1 },
					{ name: "Brief", value: 2 },
					{ name: "Cinematic", value: 3 },
				],
				default: 1,
				description: "The format of the video",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createVideo"] },
				},
			},
			{
				displayName: "Style",
				name: "videoStyle",
				type: "options",
				options: [
					{ name: "Auto Select", value: 1 },
					{ name: "Classic", value: 3 },
					{ name: "Whiteboard", value: 4 },
					{ name: "Kawaii", value: 5 },
					{ name: "Anime", value: 6 },
					{ name: "Watercolor", value: 7 },
					{ name: "Retro Print", value: 8 },
					{ name: "Heritage", value: 9 },
					{ name: "Paper Craft", value: 10 },
				],
				default: 1,
				description: "The visual style of the video",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createVideo"] },
				},
			},
			{
				displayName: "Instructions",
				name: "videoInstructions",
				type: "string",
				typeOptions: { rows: 3 },
				default: "",
				description: "Optional custom instructions for the video",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createVideo"] },
				},
			},
			{
				displayName: "Language",
				name: "videoLanguage",
				type: "string",
				default: "en",
				description: "Output language code (e.g. en, ja, fr)",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createVideo"] },
				},
			},
			{
				displayName: "Source IDs",
				name: "videoSourceIds",
				type: "string",
				default: "",
				description: "Comma-separated source IDs to use. Leave empty to use all sources in the notebook.",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createVideo"] },
				},
			},

			// ----------------------------------------------------------------
			// Artifact: createQuiz options
			// ----------------------------------------------------------------
			{
				displayName: "Quantity",
				name: "quizQuantity",
				type: "options",
				options: [
					{ name: "Standard", value: 2 },
					{ name: "Fewer", value: 1 },
				],
				default: 2,
				description: "The number of quiz questions to generate",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createQuiz"] },
				},
			},
			{
				displayName: "Difficulty",
				name: "quizDifficulty",
				type: "options",
				options: [
					{ name: "Medium", value: 2 },
					{ name: "Easy", value: 1 },
					{ name: "Hard", value: 3 },
				],
				default: 2,
				description: "The difficulty level of the quiz",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createQuiz"] },
				},
			},
			{
				displayName: "Instructions",
				name: "quizInstructions",
				type: "string",
				typeOptions: { rows: 3 },
				default: "",
				description: "Optional custom instructions for the quiz",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createQuiz"] },
				},
			},
			{
				displayName: "Source IDs",
				name: "quizSourceIds",
				type: "string",
				default: "",
				description: "Comma-separated source IDs to use. Leave empty to use all sources in the notebook.",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createQuiz"] },
				},
			},

			// ----------------------------------------------------------------
			// Artifact: createSlideDeck options
			// ----------------------------------------------------------------
			{
				displayName: "Format",
				name: "slideDeckCreateFormat",
				type: "options",
				options: [
					{ name: "Detailed Deck", value: 1 },
					{ name: "Presenter Slides", value: 2 },
				],
				default: 1,
				description: "The format of the slide deck",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createSlideDeck"] },
				},
			},
			{
				displayName: "Length",
				name: "slideDeckLength",
				type: "options",
				options: [
					{ name: "Default", value: 1 },
					{ name: "Short", value: 2 },
				],
				default: 1,
				description: "The length of the slide deck",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createSlideDeck"] },
				},
			},
			{
				displayName: "Instructions",
				name: "slideDeckInstructions",
				type: "string",
				typeOptions: { rows: 3 },
				default: "",
				description: "Optional custom instructions for the slide deck",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createSlideDeck"] },
				},
			},
			{
				displayName: "Language",
				name: "slideDeckLanguage",
				type: "string",
				default: "en",
				description: "Output language code (e.g. en, ja, fr)",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createSlideDeck"] },
				},
			},
			{
				displayName: "Source IDs",
				name: "slideDeckSourceIds",
				type: "string",
				default: "",
				description: "Comma-separated source IDs to use. Leave empty to use all sources in the notebook.",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createSlideDeck"] },
				},
			},

			// ----------------------------------------------------------------
			// Artifact: createReport options
			// ----------------------------------------------------------------
			{
				displayName: "Report Format",
				name: "reportFormat",
				type: "options",
				options: [
					{ name: "Briefing Doc", value: "briefing_doc" },
					{ name: "Study Guide", value: "study_guide" },
					{ name: "Blog Post", value: "blog_post" },
				],
				default: "briefing_doc",
				description: "The format of the report to generate",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createReport"] },
				},
			},
			{
				displayName: "Instructions",
				name: "reportInstructions",
				type: "string",
				typeOptions: { rows: 3 },
				default: "",
				description: "Optional extra instructions appended to the report prompt",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createReport"] },
				},
			},
			{
				displayName: "Language",
				name: "reportLanguage",
				type: "string",
				default: "en",
				description: "Output language code (e.g. en, ja, fr)",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createReport"] },
				},
			},
			{
				displayName: "Source IDs",
				name: "reportSourceIds",
				type: "string",
				default: "",
				description: "Comma-separated source IDs to use. Leave empty to use all sources in the notebook.",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["createReport"] },
				},
			},

			// ----------------------------------------------------------------
			// Artifact: exportReport
			// ----------------------------------------------------------------
			{
				displayName: "Export Title",
				name: "exportTitle",
				type: "string",
				default: "",
				required: true,
				description: "The title for the exported Google Doc",
				displayOptions: {
					show: { resource: ["artifact"], operation: ["exportReport"] },
				},
			},

			// ----------------------------------------------------------------
			// Chat: ask
			// ----------------------------------------------------------------
			{
				displayName: "Message",
				name: "message",
				type: "string",
				typeOptions: { rows: 3 },
				default: "",
				required: true,
				description: "The question or message to send",
				displayOptions: { show: { resource: ["chat"], operation: ["ask"] } },
			},

			// ----------------------------------------------------------------
			// Note: create
			// ----------------------------------------------------------------
			{
				displayName: "Content",
				name: "content",
				type: "string",
				typeOptions: { rows: 5 },
				default: "",
				required: true,
				description: "The text content of the note",
				displayOptions: { show: { resource: ["note"], operation: ["create"] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials("notebookLmApi");

		let storageState: object;
		try {
			storageState = JSON.parse(credentials.sessionJson as string);
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				"Invalid Session JSON — paste the full contents of ~/.notebooklm/session.json",
			);
		}

		let client: NotebookLMClient;
		try {
			client = await NotebookLMClient.connect({
				cookiesObject: storageState,
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			throw new NodeOperationError(this.getNode(), `Auth failed: ${msg}`, {
				description:
					"Check your Cookie String credential. Re-run: npx notebooklm-sdk login",
			});
		}

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter("resource", i) as string;
			const operation = this.getNodeParameter("operation", i) as string;

			let result: unknown;
			let binaryData: { buffer: Buffer; fileName: string; mimeType: string } | undefined;

			try {
				if (resource === "notebook") {
					if (operation === "list") {
						result = await client.notebooks.list();
					} else if (operation === "get") {
						const notebookId = this.getNodeParameter("notebookId", i) as string;
						result = await client.notebooks.get(notebookId);
					} else if (operation === "create") {
						const title = this.getNodeParameter("title", i) as string;
						result = await client.notebooks.create(title);
					} else if (operation === "delete") {
						const notebookId = this.getNodeParameter("notebookId", i) as string;
						await client.notebooks.delete(notebookId);
						result = { success: true, notebookId };
					}
				} else if (resource === "source") {
					const notebookId = this.getNodeParameter("notebookId", i) as string;
					if (operation === "list") {
						result = await client.sources.list(notebookId);
					} else if (operation === "addUrl") {
						const url = this.getNodeParameter("url", i) as string;
						result = await client.sources.addUrl(notebookId, url);
					} else if (operation === "addText") {
						const title = this.getNodeParameter("title", i) as string;
						const content = this.getNodeParameter("content", i) as string;
						result = await client.sources.addText(notebookId, title, content);
					} else if (operation === "getFulltext") {
						const sourceId = this.getNodeParameter("sourceId", i) as string;
						result = await client.sources.getFulltext(notebookId, sourceId);
					} else if (operation === "waitUntilReady") {
						const sourceId = this.getNodeParameter("sourceId", i) as string;
						const timeout = this.getNodeParameter("timeout", i) as number;
						result = await client.sources.waitUntilReady(
							notebookId,
							sourceId,
							timeout,
						);
					} else if (operation === "delete") {
						const sourceId = this.getNodeParameter("sourceId", i) as string;
						await client.sources.delete(notebookId, sourceId);
						result = { success: true, sourceId };
					}
				} else if (resource === "artifact") {
					const notebookId = this.getNodeParameter("notebookId", i) as string;
					if (operation === "list") {
						result = await client.artifacts.list(notebookId);
					} else if (operation === "listAudio") {
						result = await client.artifacts.listAudio(notebookId);
					} else if (operation === "listReports") {
						result = await client.artifacts.listReports(notebookId);
					} else if (operation === "createAudio") {
						const audioFormat = this.getNodeParameter("audioFormat", i) as 1 | 2 | 3 | 4;
						const audioLength = this.getNodeParameter("audioLength", i) as 1 | 2 | 3;
						const audioInstructions = this.getNodeParameter("audioInstructions", i) as string;
						const audioLanguage = this.getNodeParameter("audioLanguage", i) as string;
						const audioSourceIdsRaw = this.getNodeParameter("audioSourceIds", i) as string;
						const audioSourceIds = audioSourceIdsRaw
							? audioSourceIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
							: undefined;
						result = await client.artifacts.createAudio(notebookId, {
							format: audioFormat,
							length: audioLength,
							...(audioInstructions && { instructions: audioInstructions }),
							...(audioLanguage && { language: audioLanguage }),
							...(audioSourceIds && { sourceIds: audioSourceIds }),
						});
					} else if (operation === "createReport") {
						const reportFormat = this.getNodeParameter("reportFormat", i) as
							| "briefing_doc"
							| "study_guide"
							| "blog_post";
						const reportInstructions = this.getNodeParameter("reportInstructions", i) as string;
						const reportLanguage = this.getNodeParameter("reportLanguage", i) as string;
						const reportSourceIdsRaw = this.getNodeParameter("reportSourceIds", i) as string;
						const reportSourceIds = reportSourceIdsRaw
							? reportSourceIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
							: undefined;
						result = await client.artifacts.createReport(notebookId, {
							format: reportFormat,
							...(reportInstructions && { extraInstructions: reportInstructions }),
							...(reportLanguage && { language: reportLanguage }),
							...(reportSourceIds && { sourceIds: reportSourceIds }),
						});
					} else if (operation === "createMindMap") {
						result = await client.artifacts.createMindMap(notebookId);
					} else if (operation === "createInfographic") {
						const orientation = this.getNodeParameter("infographicOrientation", i) as number;
						const detail = this.getNodeParameter("infographicDetail", i) as number;
						const style = this.getNodeParameter("infographicStyle", i) as number;
						const instructions = this.getNodeParameter("infographicInstructions", i) as string;
						const language = this.getNodeParameter("infographicLanguage", i) as string;
						const sourceIdsRaw = this.getNodeParameter("infographicSourceIds", i) as string;
						const sourceIds = sourceIdsRaw
							? sourceIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
							: undefined;
						result = await client.artifacts.createInfographic(notebookId, {
							orientation: orientation as 1 | 2 | 3,
							detail: detail as 1 | 2 | 3,
							style: style as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11,
							...(instructions && { instructions }),
							...(language && { language }),
							...(sourceIds && { sourceIds }),
						});
					} else if (operation === "createVideo") {
						const videoFormat = this.getNodeParameter("videoFormat", i) as 1 | 2 | 3;
						const videoStyle = this.getNodeParameter("videoStyle", i) as 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
						const videoInstructions = this.getNodeParameter("videoInstructions", i) as string;
						const videoLanguage = this.getNodeParameter("videoLanguage", i) as string;
						const videoSourceIdsRaw = this.getNodeParameter("videoSourceIds", i) as string;
						const videoSourceIds = videoSourceIdsRaw
							? videoSourceIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
							: undefined;
						result = await client.artifacts.createVideo(notebookId, {
							format: videoFormat,
							style: videoStyle,
							...(videoInstructions && { instructions: videoInstructions }),
							...(videoLanguage && { language: videoLanguage }),
							...(videoSourceIds && { sourceIds: videoSourceIds }),
						});
					} else if (operation === "createQuiz") {
						const quizQuantity = this.getNodeParameter("quizQuantity", i) as 1 | 2;
						const quizDifficulty = this.getNodeParameter("quizDifficulty", i) as 1 | 2 | 3;
						const quizInstructions = this.getNodeParameter("quizInstructions", i) as string;
						const quizSourceIdsRaw = this.getNodeParameter("quizSourceIds", i) as string;
						const quizSourceIds = quizSourceIdsRaw
							? quizSourceIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
							: undefined;
						result = await client.artifacts.createQuiz(notebookId, {
							quantity: quizQuantity,
							difficulty: quizDifficulty,
							...(quizInstructions && { instructions: quizInstructions }),
							...(quizSourceIds && { sourceIds: quizSourceIds }),
						});
					} else if (operation === "createSlideDeck") {
						const slideDeckCreateFormat = this.getNodeParameter("slideDeckCreateFormat", i) as 1 | 2;
						const slideDeckLength = this.getNodeParameter("slideDeckLength", i) as 1 | 2;
						const slideDeckInstructions = this.getNodeParameter("slideDeckInstructions", i) as string;
						const slideDeckLanguage = this.getNodeParameter("slideDeckLanguage", i) as string;
						const slideDeckSourceIdsRaw = this.getNodeParameter("slideDeckSourceIds", i) as string;
						const slideDeckSourceIds = slideDeckSourceIdsRaw
							? slideDeckSourceIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
							: undefined;
						result = await client.artifacts.createSlideDeck(notebookId, {
							format: slideDeckCreateFormat,
							length: slideDeckLength,
							...(slideDeckInstructions && { instructions: slideDeckInstructions }),
							...(slideDeckLanguage && { language: slideDeckLanguage }),
							...(slideDeckSourceIds && { sourceIds: slideDeckSourceIds }),
						});
					} else if (operation === "waitUntilReady") {
						const artifactId = this.getNodeParameter("artifactId", i) as string;
						const timeout = this.getNodeParameter("timeout", i) as number;
						const pollInterval = this.getNodeParameter("pollInterval", i) as number;
						result = await client.artifacts.waitUntilReady(
							notebookId,
							artifactId,
							timeout,
							pollInterval,
						);
					} else if (operation === "downloadAudio") {
						const artifactId = this.getNodeParameter("artifactId", i) as string;
						const buffer = await client.artifacts.downloadAudio(notebookId, artifactId);
						binaryData = { buffer, fileName: `audio-${artifactId}.mp3`, mimeType: "audio/mpeg" };
						result = { artifactId, fileName: binaryData.fileName };
					} else if (operation === "downloadVideo") {
						const artifactId = this.getNodeParameter("artifactId", i) as string;
						const buffer = await client.artifacts.downloadVideo(notebookId, artifactId);
						binaryData = { buffer, fileName: `video-${artifactId}.mp4`, mimeType: "video/mp4" };
						result = { artifactId, fileName: binaryData.fileName };
					} else if (operation === "downloadSlideDeck") {
						const artifactId = this.getNodeParameter("artifactId", i) as string;
						const format = this.getNodeParameter("slideDeckFormat", i) as "pdf" | "pptx";
						const buffer = await client.artifacts.downloadSlideDeck(notebookId, artifactId, format);
						const mimeType =
							format === "pdf"
								? "application/pdf"
								: "application/vnd.openxmlformats-officedocument.presentationml.presentation";
						binaryData = { buffer, fileName: `slides-${artifactId}.${format}`, mimeType };
						result = { artifactId, fileName: binaryData.fileName, format };
					} else if (operation === "downloadInfographic") {
						const artifactId = this.getNodeParameter("artifactId", i) as string;
						const buffer = await client.artifacts.downloadInfographic(notebookId, artifactId);
						binaryData = { buffer, fileName: `infographic-${artifactId}.png`, mimeType: "image/png" };
						result = { artifactId, fileName: binaryData.fileName };
					} else if (operation === "exportReport") {
						const artifactId = this.getNodeParameter("artifactId", i) as string;
						const exportTitle = this.getNodeParameter("exportTitle", i) as string;
						result = await client.artifacts.exportReport(
							notebookId,
							artifactId,
							exportTitle,
						);
					}
				} else if (resource === "chat") {
					const notebookId = this.getNodeParameter("notebookId", i) as string;
					if (operation === "ask") {
						const message = this.getNodeParameter("message", i) as string;
						result = await client.chat.ask(notebookId, message);
					}
				} else if (resource === "note") {
					const notebookId = this.getNodeParameter("notebookId", i) as string;
					if (operation === "list") {
						result = await client.notes.list(notebookId);
					} else if (operation === "create") {
						const content = this.getNodeParameter("content", i) as string;
						result = await client.notes.create(notebookId, content);
					}
				}
			} catch (err) {
				if (this.continueOnFail()) {
					const errorMessage = err instanceof Error ? err.message : String(err);
					returnData.push({
						json: { error: errorMessage } as IDataObject,
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), err as Error, {
					itemIndex: i,
				});
			}

			if (binaryData) {
				const prepared = await this.helpers.prepareBinaryData(
					binaryData.buffer,
					binaryData.fileName,
					binaryData.mimeType,
				);
				returnData.push({
					json: (result ?? {}) as IDataObject,
					binary: { data: prepared },
					pairedItem: { item: i },
				});
			} else {
				const normalized = Array.isArray(result) ? result : [result];
				returnData.push(
					...normalized.map((item) => ({
						json: (item ?? {}) as IDataObject,
						pairedItem: { item: i },
					})),
				);
			}
		}

		return [returnData];
	}
}
