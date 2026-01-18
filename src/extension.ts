import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const provider = new SnippetViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('snippet-list', provider)
    );
}

class SnippetViewProvider implements vscode.WebviewViewProvider {

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        this._updateHtml();

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'addSnippet':
                    this._addSnippet(data.value);
                    break;
                case 'copySnippet':
                    this._copySnippet(data.index);
                    break;
                case 'deleteSnippet':
                    this._deleteSnippet(data.index);
                    break;
                case 'editSnippet':
                    this._updateSnippet(data.index, data.value);
                    break;
                case 'loadSnippet':
                    this._loadSnippetForEdit(data.index);
                    break;
            }
        });

        vscode.workspace.onDidChangeConfiguration(() => {
            this._updateHtml();
        });
    }

    private _updateHtml() {
        if (!this._view) { return; }
        
        const config = vscode.workspace.getConfiguration('mySnippetCopier');
        const snippets = config.get<string[]>('snippets') || [];

        // SVG Icons for native VS Code look
        const editIcon = `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z"/></svg>`;
        const trashIcon = `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M11 2H9c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1H5c-.55 0-1 .45-1 1v2h10V3c0-.55-.45-1-1-1zM8 2h1v2H8V2zm5 5V5H3v2h1v6c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V7h1zM5 13V7h6v6H5z"/></svg>`;

        const snippetsHtml = snippets.map((snippet, index) => {
            const safeSnippet = snippet
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, '&quot;');

            return `
                <div class="snippet-item">
                    <div class="snippet-text" onclick="copyText(${index})">${safeSnippet}</div>
                    <div class="actions">
                        <button class="icon-btn" onclick="editText(${index})" title="Edit">${editIcon}</button>
                        <button class="icon-btn" onclick="deleteText(${index})" title="Delete">${trashIcon}</button>
                    </div>
                </div>
            `;
        }).join('');

        this._view.webview.html = this._getHtmlContent(snippetsHtml);
    }

    private _addSnippet(text: string) {
        const config = vscode.workspace.getConfiguration('mySnippetCopier');
        const snippets = config.get<string[]>('snippets') || [];
        snippets.push(text);
        config.update('snippets', snippets, vscode.ConfigurationTarget.Global).then(() => this._updateHtml());
    }

    private _copySnippet(index: number) {
        const config = vscode.workspace.getConfiguration('mySnippetCopier');
        const snippets = config.get<string[]>('snippets') || [];
        if (snippets[index]) {
            vscode.env.clipboard.writeText(snippets[index]);
            vscode.window.showInformationMessage('Copied to clipboard!');
        }
    }

    private _loadSnippetForEdit(index: number) {
        const config = vscode.workspace.getConfiguration('mySnippetCopier');
        const snippets = config.get<string[]>('snippets') || [];
        if (snippets[index] && this._view) {
            this._view.webview.postMessage({ type: 'loadSnippet', text: snippets[index], index: index });
        }
    }

    private _deleteSnippet(index: number) {
        const config = vscode.workspace.getConfiguration('mySnippetCopier');
        const snippets = config.get<string[]>('snippets') || [];
        snippets.splice(index, 1);
        config.update('snippets', snippets, vscode.ConfigurationTarget.Global).then(() => this._updateHtml());
    }

    private _updateSnippet(index: number, newText: string) {
        const config = vscode.workspace.getConfiguration('mySnippetCopier');
        const snippets = config.get<string[]>('snippets') || [];
        if (snippets[index]) {
            snippets[index] = newText;
            config.update('snippets', snippets, vscode.ConfigurationTarget.Global).then(() => this._updateHtml());
        }
    }

    private _getHtmlContent(snippetsList: string): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* General Reset */
                body {
                    padding: 10px;
                    color: var(--vscode-foreground);
                    font-family: var(--vscode-font-family); /* This ensures it matches the UI font, not code font */
                    font-size: var(--vscode-font-size);
                }

                h3 {
                    font-size: 0.8em;
                    text-transform: uppercase;
                    margin: 0 0 8px 0;
                    opacity: 0.8;
                }
                
                /* Text Area - VS Code Natural Style */
                textarea {
                    width: 100%;
                    height: 80px;
                    box-sizing: border-box; /* Fixes padding issues */
                    background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    font-family: var(--vscode-font-family); /* Forces UI font inside the box */
                    padding: 6px;
                    margin-bottom: 8px;
                    resize: vertical;
                    outline: none;
                }
                textarea:focus {
                    border: 1px solid var(--vscode-focusBorder);
                }

                /* Primary Button */
                button.main-btn {
                    width: 100%;
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px;
                    cursor: pointer;
                    margin-bottom: 20px;
                    font-family: var(--vscode-font-family);
                }
                button.main-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }

                /* List Item Styling */
                .snippet-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 4px 0;
                    border-bottom: 1px solid var(--vscode-tree-tableOddRowsBackground); 
                }
                .snippet-item:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }

                /* The Text itself */
                .snippet-text {
                    cursor: pointer;
                    flex-grow: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-right: 8px;
                    padding-left: 4px;
                    font-size: 13px;
                }

                /* Actions (Icons) */
                .actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0; /* Hidden by default */
                }
                .snippet-item:hover .actions {
                    opacity: 1; /* Show on hover */
                }

                .icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 2px;
                    color: var(--vscode-icon-foreground);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .icon-btn:hover {
                    color: var(--vscode-list-highlightForeground);
                }
            </style>
        </head>
        <body>
            <h3>New Snippet</h3>
            <textarea id="snippetInput" placeholder="Type here..."></textarea>
            <button id="addBtn" class="main-btn" onclick="addOrUpdate()">Add Snippet</button>

            <h3>Saved</h3>
            <div id="list">${snippetsList}</div>

            <script>
                const vscode = acquireVsCodeApi();
                const input = document.getElementById('snippetInput');
                const btn = document.getElementById('addBtn');
                let editingIndex = null;

                function addOrUpdate() {
                    const text = input.value;
                    if(!text) return;

                    if (editingIndex !== null) {
                        vscode.postMessage({ type: 'editSnippet', index: editingIndex, value: text });
                        editingIndex = null;
                        btn.innerText = "Add Snippet";
                    } else {
                        vscode.postMessage({ type: 'addSnippet', value: text });
                    }
                    input.value = '';
                }

                function copyText(index) {
                    vscode.postMessage({ type: 'copySnippet', index: index });
                }

                function deleteText(index) {
                    vscode.postMessage({ type: 'deleteSnippet', index: index });
                }

                function editText(index) {
                    vscode.postMessage({ type: 'loadSnippet', index: index });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'loadSnippet') {
                        input.value = message.text;
                        editingIndex = message.index;
                        btn.innerText = "Update Snippet";
                        input.focus();
                    }
                });
            </script>
        </body>
        </html>`;
    }
}

export function deactivate() {}