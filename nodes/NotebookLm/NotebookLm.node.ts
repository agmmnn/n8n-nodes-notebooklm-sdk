import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { NotebookLMClient } from 'notebooklm-sdk';

export class NotebookLm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NotebookLM',
		name: 'notebookLm',
		icon: 'file:notebooklm.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Google NotebookLM',
		defaults: { name: 'NotebookLM' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'notebookLmApi', required: true }],
		properties: [
			// ----------------------------------------------------------------
			// Resource
			// ----------------------------------------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Notebook', value: 'notebook' },
					{ name: 'Source', value: 'source' },
					{ name: 'Artifact', value: 'artifact' },
					{ name: 'Chat', value: 'chat' },
					{ name: 'Note', value: 'note' },
				],
				default: 'notebook',
			},

			// ----------------------------------------------------------------
			// NOTEBOOK operations
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['notebook'] } },
				options: [
					{ name: 'List', value: 'list', description: 'List all notebooks', action: 'List notebooks' },
					{ name: 'Get', value: 'get', description: 'Get a notebook by ID', action: 'Get a notebook' },
					{ name: 'Create', value: 'create', description: 'Create a new notebook', action: 'Create a notebook' },
					{ name: 'Delete', value: 'delete', description: 'Delete a notebook', action: 'Delete a notebook' },
				],
				default: 'list',
			},

			// ----------------------------------------------------------------
			// SOURCE operations
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['source'] } },
				options: [
					{ name: 'List', value: 'list', description: 'List sources in a notebook', action: 'List sources' },
					{ name: 'Add URL', value: 'addUrl', description: 'Add a URL as a source', action: 'Add URL source' },
					{ name: 'Add Text', value: 'addText', description: 'Add plain text as a source', action: 'Add text source' },
					{ name: 'Get Fulltext', value: 'getFulltext', description: 'Get the full text of a source', action: 'Get source fulltext' },
					{ name: 'Delete', value: 'delete', description: 'Delete a source', action: 'Delete a source' },
				],
				default: 'list',
			},

			// ----------------------------------------------------------------
			// ARTIFACT operations
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['artifact'] } },
				options: [
					{ name: 'List', value: 'list', description: 'List all artifacts in a notebook', action: 'List artifacts' },
					{ name: 'List Audio Overviews', value: 'listAudio', description: 'List audio overview artifacts', action: 'List audio overviews' },
					{ name: 'List Reports', value: 'listReports', description: 'List report artifacts', action: 'List reports' },
					{ name: 'Create Audio Overview', value: 'createAudio', description: 'Generate an audio overview podcast', action: 'Create audio overview' },
					{ name: 'Create Report', value: 'createReport', description: 'Generate a briefing doc, study guide, or blog post', action: 'Create report' },
					{ name: 'Create Mind Map', value: 'createMindMap', description: 'Generate a mind map note', action: 'Create mind map' },
					{ name: 'Export Report', value: 'exportReport', description: 'Export a report to Google Docs', action: 'Export report to Google Docs' },
				],
				default: 'list',
			},

			// ----------------------------------------------------------------
			// CHAT operations
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['chat'] } },
				options: [
					{ name: 'Ask', value: 'ask', description: 'Ask a question and get a response', action: 'Ask a question' },
				],
				default: 'ask',
			},

			// ----------------------------------------------------------------
			// NOTE operations
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['note'] } },
				options: [
					{ name: 'List', value: 'list', description: 'List all notes in a notebook', action: 'List notes' },
					{ name: 'Create', value: 'create', description: 'Create a new note', action: 'Create a note' },
				],
				default: 'list',
			},

			// ----------------------------------------------------------------
			// Shared: Notebook ID — for non-notebook resources
			// ----------------------------------------------------------------
			{
				displayName: 'Notebook ID',
				name: 'notebookId',
				type: 'string',
				default: '',
				required: true,
				description: 'The ID of the notebook',
				displayOptions: {
					hide: { resource: ['notebook'] },
				},
			},

			// Notebook ID — for notebook:get and notebook:delete
			{
				displayName: 'Notebook ID',
				name: 'notebookId',
				type: 'string',
				default: '',
				required: true,
				description: 'The ID of the notebook',
				displayOptions: {
					show: {
						resource: ['notebook'],
						operation: ['get', 'delete'],
					},
				},
			},

			// ----------------------------------------------------------------
			// Notebook: create
			// ----------------------------------------------------------------
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				description: 'The title of the new notebook',
				displayOptions: { show: { resource: ['notebook'], operation: ['create'] } },
			},

			// ----------------------------------------------------------------
			// Source: addUrl
			// ----------------------------------------------------------------
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				description: 'The URL to add as a source',
				displayOptions: { show: { resource: ['source'], operation: ['addUrl'] } },
			},

			// ----------------------------------------------------------------
			// Source: addText
			// ----------------------------------------------------------------
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				description: 'The title of the text source',
				displayOptions: { show: { resource: ['source'], operation: ['addText'] } },
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				required: true,
				description: 'The plain text content to add as a source',
				displayOptions: { show: { resource: ['source'], operation: ['addText'] } },
			},

			// ----------------------------------------------------------------
			// Source: delete / getFulltext
			// ----------------------------------------------------------------
			{
				displayName: 'Source ID',
				name: 'sourceId',
				type: 'string',
				default: '',
				required: true,
				description: 'The ID of the source',
				displayOptions: {
					show: {
						resource: ['source'],
						operation: ['delete', 'getFulltext'],
					},
				},
			},

			// ----------------------------------------------------------------
			// Artifact: createReport format
			// ----------------------------------------------------------------
			{
				displayName: 'Report Format',
				name: 'reportFormat',
				type: 'options',
				options: [
					{ name: 'Briefing Doc', value: 'briefing_doc' },
					{ name: 'Study Guide', value: 'study_guide' },
					{ name: 'Blog Post', value: 'blog_post' },
				],
				default: 'briefing_doc',
				description: 'The format of the report to generate',
				displayOptions: { show: { resource: ['artifact'], operation: ['createReport'] } },
			},

			// ----------------------------------------------------------------
			// Artifact: exportReport
			// ----------------------------------------------------------------
			{
				displayName: 'Artifact ID',
				name: 'artifactId',
				type: 'string',
				default: '',
				required: true,
				description: 'The ID of the artifact to export',
				displayOptions: { show: { resource: ['artifact'], operation: ['exportReport'] } },
			},
			{
				displayName: 'Export Title',
				name: 'exportTitle',
				type: 'string',
				default: '',
				required: true,
				description: 'The title for the exported Google Doc',
				displayOptions: { show: { resource: ['artifact'], operation: ['exportReport'] } },
			},

			// ----------------------------------------------------------------
			// Chat: ask
			// ----------------------------------------------------------------
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				required: true,
				description: 'The question or message to send',
				displayOptions: { show: { resource: ['chat'], operation: ['ask'] } },
			},

			// ----------------------------------------------------------------
			// Note: create
			// ----------------------------------------------------------------
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				required: true,
				description: 'The text content of the note',
				displayOptions: { show: { resource: ['note'], operation: ['create'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('notebookLmApi');

		let client: NotebookLMClient;
		try {
			client = await NotebookLMClient.connect({
				cookies: credentials.cookieString as string,
			});
		} catch (err) {
			throw new NodeOperationError(this.getNode(), err as Error, {
				message: 'Failed to authenticate with NotebookLM. Check your cookie string credential.',
			});
		}

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			let result: unknown;

			try {
				if (resource === 'notebook') {
					if (operation === 'list') {
						result = await client.notebooks.list();
					} else if (operation === 'get') {
						const notebookId = this.getNodeParameter('notebookId', i) as string;
						result = await client.notebooks.get(notebookId);
					} else if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						result = await client.notebooks.create(title);
					} else if (operation === 'delete') {
						const notebookId = this.getNodeParameter('notebookId', i) as string;
						await client.notebooks.delete(notebookId);
						result = { success: true, notebookId };
					}
				} else if (resource === 'source') {
					const notebookId = this.getNodeParameter('notebookId', i) as string;
					if (operation === 'list') {
						result = await client.sources.list(notebookId);
					} else if (operation === 'addUrl') {
						const url = this.getNodeParameter('url', i) as string;
						result = await client.sources.addUrl(notebookId, url);
					} else if (operation === 'addText') {
						const title = this.getNodeParameter('title', i) as string;
						const content = this.getNodeParameter('content', i) as string;
						result = await client.sources.addText(notebookId, title, content);
					} else if (operation === 'getFulltext') {
						const sourceId = this.getNodeParameter('sourceId', i) as string;
						result = await client.sources.getFulltext(notebookId, sourceId);
					} else if (operation === 'delete') {
						const sourceId = this.getNodeParameter('sourceId', i) as string;
						await client.sources.delete(notebookId, sourceId);
						result = { success: true, sourceId };
					}
				} else if (resource === 'artifact') {
					const notebookId = this.getNodeParameter('notebookId', i) as string;
					if (operation === 'list') {
						result = await client.artifacts.list(notebookId);
					} else if (operation === 'listAudio') {
						result = await client.artifacts.listAudio(notebookId);
					} else if (operation === 'listReports') {
						result = await client.artifacts.listReports(notebookId);
					} else if (operation === 'createAudio') {
						result = await client.artifacts.createAudio(notebookId);
					} else if (operation === 'createReport') {
						const reportFormat = this.getNodeParameter('reportFormat', i) as 'briefing_doc' | 'study_guide' | 'blog_post';
						result = await client.artifacts.createReport(notebookId, { format: reportFormat });
					} else if (operation === 'createMindMap') {
						result = await client.artifacts.createMindMap(notebookId);
					} else if (operation === 'exportReport') {
						const artifactId = this.getNodeParameter('artifactId', i) as string;
						const exportTitle = this.getNodeParameter('exportTitle', i) as string;
						result = await client.artifacts.exportReport(notebookId, artifactId, exportTitle);
					}
				} else if (resource === 'chat') {
					const notebookId = this.getNodeParameter('notebookId', i) as string;
					if (operation === 'ask') {
						const message = this.getNodeParameter('message', i) as string;
						result = await client.chat.ask(notebookId, message);
					}
				} else if (resource === 'note') {
					const notebookId = this.getNodeParameter('notebookId', i) as string;
					if (operation === 'list') {
						result = await client.notes.list(notebookId);
					} else if (operation === 'create') {
						const content = this.getNodeParameter('content', i) as string;
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
				throw new NodeOperationError(this.getNode(), err as Error, { itemIndex: i });
			}

			const normalized = Array.isArray(result) ? result : [result];
			returnData.push(
				...normalized.map((item) => ({
					json: (item ?? {}) as IDataObject,
					pairedItem: { item: i },
				})),
			);
		}

		return [returnData];
	}
}
