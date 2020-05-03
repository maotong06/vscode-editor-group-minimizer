"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class EditorGroupTreeDataProvider {
    constructor(cont) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.group = 1;
        this.context = cont;
        const groups = this.context.workspaceState.get('minimizedGroups');
        this.group = (groups || []).length + 1;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            const root = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.path : '';
            const documents = (element.documents || []).map((document) => new EditorGroup(document.fileName.replace(`${root}/`, '')));
            return Promise.resolve(documents);
        }
        else {
            const groups = this.context.workspaceState.get('minimizedGroups');
            return Promise.resolve(groups);
        }
    }
    restore(group) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const document of group.documents || []) {
                yield vscode.window.showTextDocument(document, {
                    preserveFocus: true,
                    preview: false,
                    viewColumn: (vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || 1
                });
            }
        });
    }
    remove(group) {
        const minimizedGroups = this.context.workspaceState.get('minimizedGroups') || [];
        const remaining = minimizedGroups.filter((mGroup) => mGroup !== group);
        return this.context.workspaceState.update('minimizedGroups', remaining)
            .then(() => this.refresh());
    }
    minimize() {
        const documents = [...vscode.workspace.textDocuments];
        const minimizedGroups = this.context.workspaceState.get('minimizedGroups') || [];
        minimizedGroups.push(new EditorGroup(`Group ${this.group}`, vscode.TreeItemCollapsibleState.Collapsed, documents.filter((doc) => {
            return doc.uri.scheme === 'file' && !doc.fileName.endsWith('tsconfig.json');
        })));
        return this.context.workspaceState.update('minimizedGroups', minimizedGroups)
            .then(() => vscode.commands.executeCommand('workbench.action.closeAllEditors'))
            .then(() => {
            vscode.window.showInformationMessage(`Minimized as: Group ${this.group}`);
            this.group++;
            this.refresh();
        });
    }
    dispose() {
        this.clear();
    }
    clear() {
        return this.context.workspaceState.update('minimizedGroups', undefined);
    }
}
exports.EditorGroupTreeDataProvider = EditorGroupTreeDataProvider;
class EditorGroup extends vscode.TreeItem {
    constructor(label, collapsibleState, documents) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.documents = documents;
        this.contextValue = collapsibleState && documents ? 'editorGroup' : '';
    }
    get tooltip() {
        return `${this.label}`;
    }
    get description() {
        const des = (this.documents || []).map((document) => document.fileName);
        return des.length > 0 ? `${des.join(', ').substr(0, 30)}...` : '';
    }
}
//# sourceMappingURL=editorGroupView.js.map