import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    
    // 1. Create the Tree Data Provider
    const snippetProvider = new SnippetProvider();

    // 2. Register the Tree View
    vscode.window.registerTreeDataProvider('snippet-list', snippetProvider);

    // 3. Register the Command (This runs when you click an item)
    vscode.commands.registerCommand('mySnippetCopier.copy', (item: SnippetItem) => {
        // Copy to clipboard
        vscode.env.clipboard.writeText(item.label as string);
        vscode.window.showInformationMessage(`Copied: ${item.label}`);
    });

    // 4. Refresh the list when settings change
    vscode.workspace.onDidChangeConfiguration(() => {
        snippetProvider.refresh();
    });
}

// This class provides the data to the sidebar
class SnippetProvider implements vscode.TreeDataProvider<SnippetItem> {
    
    private _onDidChangeTreeData: vscode.EventEmitter<SnippetItem | undefined | null | void> = new vscode.EventEmitter<SnippetItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SnippetItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SnippetItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SnippetItem): Thenable<SnippetItem[]> {
        // Get the snippets from VS Code Settings (File > Preferences > Settings)
        const config = vscode.workspace.getConfiguration('mySnippetCopier');
        const snippets = config.get<string[]>('snippets') || [];

        // Convert strings into Tree Items
        const items = snippets.map(text => new SnippetItem(text));
        return Promise.resolve(items);
    }
}

// This class represents a single row in your list
class SnippetItem extends vscode.TreeItem {
    constructor(public readonly label: string) {
        super(label);
        this.tooltip = `Click to copy: ${this.label}`;
        
        // This makes the item clickable. It triggers the command we defined above.
        this.command = {
            command: 'mySnippetCopier.copy',
            title: 'Copy Snippet',
            arguments: [this]
        };
    }
}

export function deactivate() {}