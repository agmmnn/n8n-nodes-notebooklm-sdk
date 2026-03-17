import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class NotebookLmApi implements ICredentialType {
	name = 'notebookLmApi';
	displayName = 'NotebookLM API';
	documentationUrl = 'https://github.com/agmmnn/notebooklm-sdk#readme';
	properties: INodeProperties[] = [
		{
			displayName: 'Cookie String',
			name: 'cookieString',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Google session cookies as a "; "-separated string (e.g. "SID=abc; HSID=xyz"). ' +
				'Run <code>npx notebooklm-sdk login</code>, then open ' +
				'<code>~/.notebooklm/session.json</code> or set the ' +
				'<code>NOTEBOOKLM_COOKIES</code> env var.',
		},
	];
}
